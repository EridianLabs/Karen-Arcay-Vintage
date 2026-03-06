import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const categorySlug = searchParams.get("category");
  const limit = Math.min(Number(searchParams.get("limit")) || 48, 100);
  const offset = Number(searchParams.get("offset")) || 0;

  const where: { published: boolean; category?: { slug: string } } = {
    published: true,
  };
  if (categorySlug) {
    where.category = { slug: categorySlug };
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
      include: { category: true },
    }),
    prisma.product.count({ where }),
  ]);

  const withParsedImages = products.map((p) => ({
    ...p,
    images: JSON.parse(p.images || "[]") as string[],
  }));

  return NextResponse.json({ products: withParsedImages, total });
}
