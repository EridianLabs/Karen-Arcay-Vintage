import { ProductCard } from "@/components/ProductCard";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";

type SearchParams = { category?: string; sale?: string; page?: string };

async function getProducts(searchParams: SearchParams) {
  const page = Number(searchParams.page) || 1;
  const skip = (page - 1) * 48;
  const where: { published: boolean; category?: { slug: string }; salePrice?: { not: null } } = {
    published: true,
  };
  if (searchParams.category) {
    where.category = { slug: searchParams.category };
  }
  if (searchParams.sale === "true") {
    where.salePrice = { not: null };
  }
  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 48,
      skip,
      include: { category: true },
    }),
    prisma.product.count({ where }),
  ]);
  const withImages = products.map((p) => ({
    ...p,
    images: JSON.parse(p.images || "[]") as string[],
  }));
  return { products: withImages, total };
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}): Promise<Metadata> {
  const { category, sale } = await searchParams;
  const title = sale === "true" ? "Sale" : category ? `${category}` : "Shop All";
  return { title: `${title} – Karen Arcay Vintage` };
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const { products, total } = await getProducts(params);
  const page = Number(params.page) || 1;
  const totalPages = Math.ceil(total / 48) || 1;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <h1 className="mb-6 text-2xl font-bold">
        {params.sale === "true" ? "Sale" : params.category ? `Category: ${params.category}` : "All products"}
      </h1>
      {products.length === 0 ? (
        <p className="py-12 text-center text-zinc-600">
          No products yet. Check back soon!
        </p>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
          {totalPages > 1 && (
            <div className="mt-8 flex justify-center gap-2">
              {page > 1 && (
                <a
                  href={`/shop?${new URLSearchParams({ ...params, page: String(page - 1) })}`}
                  className="rounded border border-zinc-300 px-4 py-2 text-sm hover:bg-zinc-100"
                >
                  Previous
                </a>
              )}
              <span className="flex items-center px-4 text-sm text-zinc-600">
                Page {page} of {totalPages}
              </span>
              {page < totalPages && (
                <a
                  href={`/shop?${new URLSearchParams({ ...params, page: String(page + 1) })}`}
                  className="rounded border border-zinc-300 px-4 py-2 text-sm hover:bg-zinc-100"
                >
                  Next
                </a>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
