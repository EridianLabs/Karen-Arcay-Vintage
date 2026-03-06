import Image from "next/image";
import Link from "next/link";

/** Hero image: hands browsing vintage clothing rail (public/hero.png) */
const HERO_IMAGE = "/hero.png";

export function HeroSection() {
  return (
    <section className="relative h-[min(70vh,520px)] w-full overflow-hidden bg-zinc-900">
      <Image
        src={HERO_IMAGE}
        alt="Browsing vintage clothing on the rail"
        fill
        className="object-cover opacity-85"
        priority
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-black/40" />
      <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center text-white">
        <h1 className="text-3xl font-bold tracking-tight drop-shadow sm:text-4xl md:text-5xl">
          Karen Arcay Vintage
        </h1>
        <p className="mt-2 max-w-md text-lg text-white/95 drop-shadow">
          Curated vintage clothing & accessories, value-priced in the UK
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/shop?sale=true"
            className="rounded bg-white px-6 py-3 text-sm font-semibold text-zinc-900 hover:bg-zinc-100"
          >
            SHOP SALE
          </Link>
          <Link
            href="/shop"
            className="rounded border-2 border-white px-6 py-3 text-sm font-semibold text-white hover:bg-white/10"
          >
            SHOP ALL
          </Link>
        </div>
      </div>
    </section>
  );
}
