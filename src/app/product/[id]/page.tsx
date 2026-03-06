import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { AddToCartButton } from "./AddToCartButton";
import { RelatedProducts } from "./RelatedProducts";

async function getProduct(id: string) {
  const product = await prisma.product.findFirst({
    where: { id, published: true },
    include: { category: true },
  });
  if (!product) return null;
  return {
    ...product,
    images: JSON.parse(product.images || "[]") as string[],
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) notFound();

  const displayPrice = product.salePrice ?? product.price;
  const onSale = product.salePrice != null;
  const images = product.images || [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="aspect-square max-w-lg overflow-hidden rounded-lg bg-zinc-100">
          {images[0] ? (
            <Image
              src={images[0].startsWith("http") ? images[0] : images[0]}
              alt={product.title}
              width={600}
              height={600}
              className="h-full w-full object-cover"
              priority
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-zinc-400">
              No image
            </div>
          )}
        </div>
        <div>
          {product.category && (
            <Link
              href={`/shop?category=${product.category.slug}`}
              className="text-sm font-medium text-zinc-600 hover:underline"
            >
              {product.category.name}
            </Link>
          )}
          <h1 className="mt-2 text-2xl font-bold md:text-3xl">{product.title}</h1>
          <div className="mt-4 flex items-center gap-3">
            <span className="text-2xl font-semibold">£{displayPrice.toFixed(2)}</span>
            {onSale && (
              <span className="text-lg text-zinc-500 line-through">
                £{product.price.toFixed(2)}
              </span>
            )}
            {onSale && (
              <span className="rounded bg-red-600 px-2 py-0.5 text-sm font-medium text-white">
                SALE
              </span>
            )}
          </div>
          {product.condition && (
            <p className="mt-2 text-sm text-zinc-600">Condition: {product.condition}</p>
          )}
          {product.size && (
            <p className="text-sm text-zinc-600">Size: {product.size}</p>
          )}
          <div className="mt-6 prose prose-zinc max-w-none text-sm">
            {product.description}
          </div>
          <div className="mt-8">
            {product.ebayUrl ? (
              <a
                href={product.ebayUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded bg-[#0064d2] px-6 py-3 text-lg font-medium text-white hover:bg-[#0054b2]"
              >
                Buy on eBay
              </a>
            ) : (
              <AddToCartButton
                productId={product.id}
                title={product.title}
                price={product.price}
                salePrice={product.salePrice}
                image={images[0]}
              />
            )}
          </div>
        </div>
      </div>

      {/* Upsell: You May Also Like */}
      <RelatedProducts categoryId={product.categoryId} currentProductId={product.id} />
    </div>
  );
}
