import { notFound } from "next/navigation";
import { ProductForm } from "@/app/admin/ProductForm";
import { prisma } from "@/lib/db";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id },
    include: { category: true },
  });
  if (!product) notFound();

  const images = JSON.parse(product.images || "[]") as string[];

  return (
    <div>
      <h1 className="text-2xl font-bold">Edit product</h1>
      <p className="mt-2 text-zinc-600">
        Update title, description, images and category.
      </p>
      <ProductForm
        product={{
          id: product.id,
          title: product.title,
          description: product.description,
          price: product.price,
          salePrice: product.salePrice,
          categoryId: product.categoryId,
          images,
          condition: product.condition,
          size: product.size,
          published: product.published,
        }}
      />
    </div>
  );
}
