import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { fetchItemDetails } from "@/lib/ebay";

export const maxDuration = 300;

const DELAY_MS = 2500;
const MAX_PER_RUN = 40;

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

  let stream = false;
  let limit = MAX_PER_RUN;
  try {
    const body = await req.json().catch(() => ({}));
    if (body?.stream === true) stream = true;
    if (typeof body?.limit === "number" && body.limit > 0) limit = Math.min(100, body.limit);
  } catch {
    // use defaults
  }

  if (stream) {
    return streamFetchImagesResponse(appId, clientSecret, limit);
  }

  const products = await prisma.product.findMany({
    where: { ebayItemId: { not: null } },
    select: { id: true, title: true, ebayItemId: true },
    take: limit,
  });

  let updated = 0;
  let failed = 0;
  const errors: string[] = [];

  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    if (!p.ebayItemId) continue;
    try {
      const details = await fetchItemDetails(appId, clientSecret, p.ebayItemId);
      if (details.errors.length) errors.push(...details.errors);
      const imageUrls = details.imageUrls?.length ? details.imageUrls : [];
      await prisma.product.update({
        where: { id: p.id },
        data: { images: JSON.stringify(imageUrls) },
      });
      updated++;
    } catch (e) {
      failed++;
      errors.push(e instanceof Error ? e.message : String(e));
    }
    if (i < products.length - 1) {
      await new Promise((r) => setTimeout(r, DELAY_MS));
    }
  }

  return NextResponse.json({ updated, failed, total: products.length, errors });
}

function streamFetchImagesResponse(
  appId: string,
  clientSecret: string,
  limit: number
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
        emit({ type: "log", ts: Date.now(), message: "Starting image fetch (slow mode to avoid rate limits)…" });
        const products = await prisma.product.findMany({
          where: { ebayItemId: { not: null } },
          select: { id: true, title: true, ebayItemId: true },
          take: limit,
        });
        emit({
          type: "log",
          ts: Date.now(),
          message: `Found ${products.length} products with eBay ID. Fetching images one-by-one (${DELAY_MS / 1000}s delay between each).`,
        });
        if (products.length === 0) {
          emit({ type: "result", updated: 0, failed: 0, total: 0, errors: [] });
          controller.close();
          return;
        }

        for (let i = 0; i < products.length; i++) {
          const p = products[i];
          if (!p.ebayItemId) continue;
          const num = i + 1;
          emit({
            type: "log",
            ts: Date.now(),
            message: `[${num}/${products.length}] Fetching images for: ${p.title?.slice(0, 50)}…`,
          });
          try {
            const details = await fetchItemDetails(appId, clientSecret, p.ebayItemId);
            if (details.errors.length) errors.push(...details.errors);
            const imageUrls = details.imageUrls?.length ? details.imageUrls : [];
            await prisma.product.update({
              where: { id: p.id },
              data: { images: JSON.stringify(imageUrls) },
            });
            updated++;
            emit({
              type: "log",
              ts: Date.now(),
              message: `  → Updated with ${imageUrls.length} image(s)`,
            });
          } catch (e) {
            failed++;
            const msg = e instanceof Error ? e.message : String(e);
            errors.push(msg);
            emit({ type: "log", ts: Date.now(), message: `  → Error: ${msg}` });
          }
          if (i < products.length - 1) {
            emit({
              type: "log",
              ts: Date.now(),
              message: `  Waiting ${DELAY_MS / 1000}s before next…`,
            });
            await new Promise((r) => setTimeout(r, DELAY_MS));
          }
        }

        emit({ type: "log", ts: Date.now(), message: "Image fetch run complete." });
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
