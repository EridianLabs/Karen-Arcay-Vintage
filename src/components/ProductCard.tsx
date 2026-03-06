import Link from "next/link";
import Image from "next/image";

type Product = {
  id: string;
  title: string;
  description: string;
  price: number;
  salePrice?: number | null;
  images: string[];
  category?: { name: string } | null;
};

export function ProductCard({ product }: { product: Product }) {
  const displayPrice = product.salePrice ?? product.price;
  const onSale = product.salePrice != null;

  return (
    <Link
      href={`/product/${product.id}`}
      className="group block rounded-lg border border-zinc-200 bg-white overflow-hidden transition hover:shadow-md"
    >
      <div className="relative aspect-[3/4] bg-zinc-100">
        {product.images?.[0] ? (
          <Image
            src={product.images[0].startsWith("http") ? product.images[0] : product.images[0]}
            alt={product.title}
            fill
            className="object-cover group-hover:scale-105 transition"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-zinc-400 text-sm">
            No image
          </div>
        )}
        {onSale && (
          <span className="absolute top-2 left-2 rounded bg-red-600 px-2 py-0.5 text-xs font-medium text-white">
            SALE
          </span>
        )}
      </div>
      <div className="p-3">
        <h3 className="font-medium text-zinc-900 line-clamp-2 text-sm">
          {product.title}
        </h3>
        <div className="mt-1 flex items-center gap-2">
          <span className="font-semibold text-black">
            £{displayPrice.toFixed(2)}
          </span>
          {onSale && (
            <span className="text-xs text-zinc-500 line-through">
              £{product.price.toFixed(2)}
            </span>
          )}
        </div>
        <span className="mt-2 inline-block text-xs font-medium text-zinc-600 border border-zinc-300 rounded px-2 py-0.5">
          BUY NOW
        </span>
      </div>
    </Link>
  );
}
