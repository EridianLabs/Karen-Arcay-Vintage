import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { fetchItemDetails } from "@/lib/ebay";
import { mapEbayCategoryToOurs } from "@/lib/ebay-categories";

export const maxDuration = 300;

const DELAY_MS = 200;
const MAX_PER_RUN = 80;

export async function POST(req: Request) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const appId = process.env.EBAY_APP_ID;
  const clientSecret = process.env.EBAY_CLIENT_SECRET;
  if (!appId || !clientSecret) {
    return NextResponse.json(
      { error: "EBAY_APP_ID and EBAY_CLIENT_SECRET required" },
      { status: 400 }
    );
  }

  let missingOnly = true;
  let stream = false;
  try {
    const body = await req.json().catch(() => ({}));
    if (typeof body?.missingOnly === "boolean") missingOnly = body.missingOnly;
    if (body?.stream === true) stream = true;
  } catch {
    // use defaults
  }

  if (stream) {
    return streamRefreshResponse(appId, clientSecret, missingOnly);
  }

  const products = await getProductsToRefresh(missingOnly, MAX_PER_RUN);
  const categories = await prisma.category.findMany();
  const slugToCategoryId = new Map(categories.map((c) => [c.slug, c.id]));

  let updated = 0;
  let failed = 0;
  const errors: string[] = [];

  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    if (!p.ebayItemId) continue;
    try {
      const details = await fetchItemDetails(appId, clientSecret, p.ebayItemId);
      if (details.errors.length) errors.push(...details.errors);
      const slug = mapEbayCategoryToOurs(details.primaryCategoryName);
      const categoryId = slug ? slugToCategoryId.get(slug) ?? null : null;
      if (p.categoryId !== categoryId) {
        await prisma.product.update({
          where: { id: p.id },
          data: { categoryId },
        });
        updated++;
      }
    } catch (e) {
      failed++;
      errors.push(e instanceof Error ? e.message : String(e));
    }
    if (i < products.length - 1) {
      await new Promise((r) => setTimeout(r, DELAY_MS));
    }
  }

  return NextResponse.json({
    updated,
    failed,
    total: products.length,
    errors,
  });
}

async function getProductsToRefresh(missingOnly: boolean, limit: number) {
  const where = { ebayItemId: { not: null } } as { ebayItemId: { not: null }; categoryId?: null };
  if (missingOnly) {
    where.categoryId = null;
  }
  return prisma.product.findMany({
    where,
    select: { id: true, ebayItemId: true, categoryId: true },
    take: limit,
  });
}

function streamRefreshResponse(
  appId: string,
  clientSecret: string,
  missingOnly: boolean
): Response {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const emit = (obj: object) => {
        controller.enqueue(encoder.encode(JSON.stringify(obj) + "\n"));
      };
      let updated = 0;
      let failed = 0;
      const errors: string[] = [];

      try {
        const products = await getProductsToRefresh(missingOnly, MAX_PER_RUN);
        emit({
          type: "log",
          ts: Date.now(),
          message: `Found ${products.length} products to refresh (${missingOnly ? "missing category only" : "all with eBay ID"}). Limit ${MAX_PER_RUN} per run.`,
        });
        if (products.length === 0) {
          emit({ type: "result", updated: 0, failed: 0, total: 0, errors: [] });
          controller.close();
          return;
        }

        const { prisma } = await import("@/lib/db");
        const categories = await prisma.category.findMany();
        const slugToCategoryId = new Map(categories.map((c) => [c.slug, c.id]));

        for (let i = 0; i < products.length; i++) {
          const p = products[i];
          if (!p.ebayItemId) continue;
          emit({
            type: "log",
            ts: Date.now(),
            message: `[${i + 1}/${products.length}] Fetching category for ${p.ebayItemId}…`,
          });
          try {
            const details = await fetchItemDetails(appId, clientSecret, p.ebayItemId);
            if (details.errors.length) errors.push(...details.errors);
            const slug = mapEbayCategoryToOurs(details.primaryCategoryName);
            const categoryId = slug ? slugToCategoryId.get(slug) ?? null : null;
            if (p.categoryId !== categoryId) {
              await prisma.product.update({
                where: { id: p.id },
                data: { categoryId },
              });
              updated++;
              emit({
                type: "log",
                ts: Date.now(),
                message: `  → ${slug ?? "no match"} (${categoryId ? "updated" : "cleared"})`,
              });
            }
          } catch (e) {
            failed++;
            const msg = e instanceof Error ? e.message : String(e);
            errors.push(msg);
            emit({ type: "log", ts: Date.now(), message: `  → Error: ${msg}` });
          }
          if (i < products.length - 1) {
            await new Promise((r) => setTimeout(r, DELAY_MS));
          }
        }

        emit({ type: "log", ts: Date.now(), message: "Refresh complete." });
        emit({ type: "result", updated, failed, total: products.length, errors });
      } catch (err) {
        emit({
          type: "result",
          updated: 0,
          failed: 0,
          total: 0,
          errors: [err instanceof Error ? err.message : String(err)],
        });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson",
      "Cache-Control": "no-store",
      "X-Accel-Buffering": "no",
    },
  });
}
