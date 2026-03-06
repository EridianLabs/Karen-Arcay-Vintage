import Link from "next/link";
import { ProductCard } from "@/components/ProductCard";
import { TrustBadges } from "@/components/TrustBadges";
import { HeroSection } from "@/components/HeroSection";
import { CategoryHeroGrid } from "@/components/CategoryHeroGrid";
import { FAQSection } from "@/components/FAQSection";
import { ReviewsCarousel } from "@/components/ReviewsCarousel";
import { prisma } from "@/lib/db";

// Avoid prerender at build time so Prisma runs only at request time (Vercel serverless)
export const dynamic = "force-dynamic";

async function getLatestProducts() {
  const products = await prisma.product.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
    take: 24,
    include: { category: true },
  });
  return products.map((p) => ({
    ...p,
    images: JSON.parse(p.images || "[]") as string[],
  }));
}

async function getCategoriesWithCount() {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { products: true } } },
  });
  return categories
    .filter((c) => c._count.products > 0)
    .sort((a, b) => b._count.products - a._count.products)
    .map((c) => ({ name: c.name, slug: c.slug, productCount: c._count.products }));
}

export default async function HomePage() {
  const [latestProducts, categoriesWithCount] = await Promise.all([
    getLatestProducts(),
    getCategoriesWithCount(),
  ]);

  return (
    <div>
      <HeroSection />
      <TrustBadges />
      <CategoryHeroGrid categories={categoriesWithCount} />

      {/* Latest products */}
      <section className="bg-zinc-50 py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h2 className="mb-6 text-2xl font-bold">Latest arrivals</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {latestProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
          <div className="mt-6 text-center">
            <Link
              href="/shop"
              className="inline-block rounded border border-zinc-400 px-6 py-2 text-sm font-medium hover:bg-white"
            >
              View all products
            </Link>
          </div>
        </div>
      </section>

      <ReviewsCarousel />
      <FAQSection />
    </div>
  );
}
