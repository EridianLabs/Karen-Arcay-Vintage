import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/db";

export async function RelatedProducts({
  categoryId,
  currentProductId,
}: {
  categoryId: string | null;
  currentProductId: string;
}) {
  const related = await prisma.product.findMany({
    where: {
      published: true,
      id: { not: currentProductId },
      ...(categoryId ? { categoryId } : {}),
    },
    take: 8,
    orderBy: { createdAt: "desc" },
    include: { category: true },
  });

  if (related.length === 0) return null;

  const withImages = related.map((p) => ({
    ...p,
    images: JSON.parse(p.images || "[]") as string[],
  }));

  return (
    <section className="mt-16 border-t border-zinc-200 pt-12">
      <h2 className="mb-6 text-xl font-bold">You may also like</h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {withImages.map((p) => (
          <Link
            key={p.id}
            href={`/product/${p.id}`}
            className="group block rounded-lg border border-zinc-200 overflow-hidden hover:shadow-md"
          >
            <div className="relative aspect-[3/4] bg-zinc-100">
              {p.images[0] ? (
                <Image
                  src={p.images[0].startsWith("http") ? p.images[0] : p.images[0]}
                  alt={p.title}
                  fill
                  className="object-cover group-hover:scale-105 transition"
                  sizes="200px"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-zinc-400 text-sm">
                  No image
                </div>
              )}
              {p.salePrice != null && (
                <span className="absolute top-2 left-2 rounded bg-red-600 px-2 py-0.5 text-xs text-white">
                  SALE
                </span>
              )}
            </div>
            <div className="p-2">
              <p className="line-clamp-2 text-sm font-medium">{p.title}</p>
              <p className="text-sm font-semibold">
                £{(p.salePrice ?? p.price).toFixed(2)}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
