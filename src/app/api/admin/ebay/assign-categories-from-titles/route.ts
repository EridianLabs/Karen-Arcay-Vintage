import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { mapTitleToCategorySlug } from "@/lib/ebay-categories";

export const maxDuration = 60;

/** Assign categories to products that have none, using title + description keywords. */
export async function POST(req: Request) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const stream = (await req.json().catch(() => ({})))?.stream === true;

  if (stream) {
    return streamResponse();
  }

  const products = await prisma.product.findMany({
    where: { categoryId: null },
    select: { id: true, title: true, description: true },
  });
  const categories = await prisma.category.findMany();
  const slugToId = new Map(categories.map((c) => [c.slug, c.id]));

  let updated = 0;
  for (const p of products) {
    const slug = mapTitleToCategorySlug(p.title, p.description);
    const categoryId = slug ? slugToId.get(slug) ?? null : null;
    if (categoryId) {
      await prisma.product.update({
        where: { id: p.id },
        data: { categoryId },
      });
      updated++;
    }
  }

  return NextResponse.json({
    updated,
    total: products.length,
    message: `Assigned category to ${updated} of ${products.length} products that had no category.`,
  });
}

function streamResponse(): Response {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const emit = (obj: object) => {
        controller.enqueue(encoder.encode(JSON.stringify(obj) + "\n"));
      };
      try {
        const { prisma } = await import("@/lib/db");
        const products = await prisma.product.findMany({
          where: { categoryId: null },
          select: { id: true, title: true, description: true },
        });
        const categories = await prisma.category.findMany();
        const slugToId = new Map(categories.map((c) => [c.slug, c.id]));

        emit({ type: "log", ts: Date.now(), message: `Found ${products.length} products with no category. Assigning from titles…` });
        let updated = 0;
        for (let i = 0; i < products.length; i++) {
          const p = products[i];
          const slug = mapTitleToCategorySlug(p.title, p.description);
          const categoryId = slug ? slugToId.get(slug) ?? null : null;
          if (categoryId) {
            await prisma.product.update({
              where: { id: p.id },
              data: { categoryId },
            });
            updated++;
            const name = categories.find((c) => c.id === categoryId)?.name ?? slug;
            emit({ type: "log", ts: Date.now(), message: `[${i + 1}/${products.length}] → ${name}: ${p.title.slice(0, 50)}…` });
          }
        }
        emit({ type: "log", ts: Date.now(), message: `Done. Assigned category to ${updated} of ${products.length} products.` });
        emit({ type: "result", updated, total: products.length, errors: [] });
      } catch (err) {
        emit({
          type: "result",
          updated: 0,
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
