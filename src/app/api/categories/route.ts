import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/** GET /api/categories – list categories with product count (for nav and homepage). */
export async function GET() {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: { select: { products: true } },
    },
  });
  const list = categories.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    productCount: c._count.products,
  }));
  return NextResponse.json(list);
}
