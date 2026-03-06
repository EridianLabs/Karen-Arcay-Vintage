import Image from "next/image";
import Link from "next/link";

/** Category slug → homepage image (in public/categories). */
const CATEGORY_IMAGES: Record<string, string> = {
  "cosmetics-perfume": "/categories/cosmetics-perfume.png",
  "vintage-furniture": "/categories/vintage-furniture.png",
  "shoes-boots": "/categories/shoes-boots.png",
  "sewing-crafts": "/categories/sewing-crafts.png",
};

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&q=80";

/** Category blocks with imagery – custom images for Cosmetics, Furniture, Shoes, Sewing; placeholder for others. Populated from props (most popular from DB). */
const FALLBACK_CATEGORIES = [
  {
    label: "WOMEN'S",
    href: "/shop?category=womens",
    image:
      "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&q=80",
  },
  {
    label: "MEN'S",
    href: "/shop?category=mens",
    image:
      "https://images.unsplash.com/photo-1617137968427-85924c800a22?w=600&q=80",
  },
  {
    label: "DRESSES",
    href: "/shop?category=dresses",
    image:
      "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&q=80",
  },
  {
    label: "JACKETS & COATS",
    href: "/shop?category=jackets-coats",
    image:
      "https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=600&q=80",
  },
  {
    label: "ACCESSORIES",
    href: "/shop?category=accessories",
    image:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80",
  },
];

type CategoryWithCount = { name: string; slug: string; productCount: number };

export function CategoryHeroGrid({
  categories = [],
}: {
  categories?: CategoryWithCount[];
}) {
  const list =
    categories.length > 0
      ? categories.slice(0, 8).map((c) => ({
          label: c.name.toUpperCase(),
          href: `/shop?category=${encodeURIComponent(c.slug)}`,
          image: CATEGORY_IMAGES[c.slug] ?? FALLBACK_IMAGE,
        }))
      : FALLBACK_CATEGORIES.map((c) => ({
          ...c,
          image: c.image || FALLBACK_IMAGE,
        }));
  return (
    <section className="bg-white py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <h2 className="mb-6 text-center text-xl font-bold tracking-wide text-zinc-900">
          SHOP BY CATEGORY
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:gap-4">
          {list.map((cat) => (
            <Link
              key={cat.href}
              href={cat.href}
              className="group relative aspect-[4/3] overflow-hidden rounded-lg bg-zinc-200"
            >
              <Image
                src={cat.image}
                alt={cat.label}
                fill
                className="object-cover transition duration-300 group-hover:scale-105"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
              />
              <div className="absolute inset-0 bg-black/35 transition group-hover:bg-black/45" />
              <span className="absolute inset-0 flex items-center justify-center text-center text-sm font-bold uppercase tracking-wider text-white drop-shadow sm:text-base">
                {cat.label}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
