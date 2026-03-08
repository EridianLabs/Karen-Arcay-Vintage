import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { classifyProductCategory } from "@/lib/ai-categories";

export const maxDuration = 300;

/** Assign categories using OpenAI from title + description. Requires OPENAI_API_KEY. */
export async function POST(req: Request) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "OPENAI_API_KEY is not set. In Vercel: Project → Settings → Environment Variables → add OPENAI_API_KEY, then redeploy (Deployments → … → Redeploy). New env vars only apply after a redeploy.",
      },
      { status: 400 }
    );
  }

  const body = await req.json().catch(() => ({}));
  const stream = body.stream === true;
  const onlyMissing = body.onlyMissing !== false; // default: only products with no category
  const limit = typeof body.limit === "number" && body.limit > 0 ? Math.min(body.limit, 500) : undefined;

  if (stream) {
    return streamResponse(apiKey, onlyMissing, limit);
  }

  const products = await getProducts(onlyMissing, limit);
  const categories = await prisma.category.findMany();
  const slugToId = new Map(categories.map((c) => [c.slug, c.id]));

  let updated = 0;
  const errors: string[] = [];
  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    const slug = await classifyProductCategory({
      title: p.title,
      description: p.description,
      apiKey,
    });
    if (slug) {
      const categoryId = slugToId.get(slug) ?? null;
      if (categoryId) {
        await prisma.product.update({
          where: { id: p.id },
          data: { categoryId },
        });
        updated++;
      }
    }
    if (i < products.length - 1) {
      await new Promise((r) => setTimeout(r, 200));
    }
  }

  return NextResponse.json({
    updated,
    total: products.length,
    errors,
    message: `Assigned category to ${updated} of ${products.length} products using AI.`,
  });
}

async function getProducts(
  onlyMissing: boolean,
  limit?: number
): Promise<{ id: string; title: string; description: string | null }[]> {
  const products = await prisma.product.findMany({
    where: onlyMissing ? { categoryId: null } : undefined,
    select: { id: true, title: true, description: true },
    take: limit,
    orderBy: { createdAt: "desc" },
  });
  return products;
}

function streamResponse(
  apiKey: string,
  onlyMissing: boolean,
  limit: number | undefined
): Response {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const emit = (obj: object) => {
        controller.enqueue(encoder.encode(JSON.stringify(obj) + "\n"));
      };
      try {
        const { prisma } = await import("@/lib/db");
        const products = await prisma.product.findMany({
          where: onlyMissing ? { categoryId: null } : undefined,
          select: { id: true, title: true, description: true },
          take: limit,
          orderBy: { createdAt: "desc" },
        });
        const categories = await prisma.category.findMany();
        const slugToId = new Map(categories.map((c) => [c.slug, c.id]));

        emit({
          type: "log",
          ts: Date.now(),
          message: `Using AI to assign categories (${onlyMissing ? "products with no category" : "all products"}${limit ? `, max ${limit}` : ""}). ${products.length} products…`,
        });
        let updated = 0;
        for (let i = 0; i < products.length; i++) {
          const p = products[i];
          const slug = await classifyProductCategory({
            title: p.title,
            description: p.description,
            apiKey,
          });
          if (slug) {
            const categoryId = slugToId.get(slug) ?? null;
            if (categoryId) {
              await prisma.product.update({
                where: { id: p.id },
                data: { categoryId },
              });
              updated++;
              const name = categories.find((c) => c.id === categoryId)?.name ?? slug;
              emit({
                type: "log",
                ts: Date.now(),
                message: `[${i + 1}/${products.length}] → ${name}: ${p.title.slice(0, 50)}${p.title.length > 50 ? "…" : ""}`,
              });
            }
          }
          if (i < products.length - 1) {
            await new Promise((r) => setTimeout(r, 200));
          }
        }
        emit({
          type: "log",
          ts: Date.now(),
          message: `Done. Assigned category to ${updated} of ${products.length} products using AI.`,
        });
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
