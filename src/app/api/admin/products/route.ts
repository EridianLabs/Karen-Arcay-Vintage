import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const createSchema = z.object({
  title: z.string().min(1),
  description: z.string(),
  price: z.number().positive(),
  salePrice: z.number().positive().optional(),
  categoryId: z.string().optional(),
  images: z.array(z.string()).default([]),
  condition: z.string().optional(),
  size: z.string().optional(),
  published: z.boolean().default(true),
});

export async function GET() {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    include: { category: true },
  });
  return NextResponse.json(products);
}

export async function POST(req: Request) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await req.json();
    const data = createSchema.parse({
      ...body,
      price: Number(body.price),
      salePrice: body.salePrice != null ? Number(body.salePrice) : undefined,
    });
    const product = await prisma.product.create({
      data: {
        ...data,
        images: JSON.stringify(data.images),
      },
      include: { category: true },
    });
    return NextResponse.json(product);
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: e.flatten() }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}
