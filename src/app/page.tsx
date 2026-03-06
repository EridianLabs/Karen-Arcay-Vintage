import Link from "next/link";
import { ProductCard } from "@/components/ProductCard";
import { TrustBadges } from "@/components/TrustBadges";
import { HeroSection } from "@/components/HeroSection";
import { CategoryHeroGrid } from "@/components/CategoryHeroGrid";
import { FAQSection } from "@/components/FAQSection";
import { ReviewsCarousel } from "@/components/ReviewsCarousel";
import { prisma } from "@/lib/db";

async function getSaleProducts() {
  const products = await prisma.product.findMany({
    where: { published: true, salePrice: { not: null } },
    orderBy: { createdAt: "desc" },
    take: 20,
    include: { category: true },
  });
  return products.map((p) => ({
    ...p,
    images: JSON.parse(p.images || "[]") as string[],
  }));
}

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

export default async function HomePage() {
  const [saleProducts, latestProducts] = await Promise.all([
    getSaleProducts(),
    getLatestProducts(),
  ]);

  return (
    <div>
      <HeroSection />
      <TrustBadges />
      <CategoryHeroGrid />

      {/* Shop under £30 / Sale highlights */}
      {saleProducts.length > 0 && (
        <section className="bg-white py-10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <h2 className="mb-6 text-2xl font-bold">SHOP SALE</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {saleProducts.slice(0, 20).map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
            <div className="mt-6 text-center">
              <Link
                href="/shop?sale=true"
                className="inline-block rounded bg-black px-6 py-2 text-sm font-medium text-white hover:bg-zinc-800"
              >
                View all sale items
              </Link>
            </div>
          </div>
        </section>
      )}

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
