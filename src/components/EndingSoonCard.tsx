"use client";

import { useState, useEffect } from "react";
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
  ebayUrl?: string | null;
};

function formatCountdown(ms: number): string {
  if (ms <= 0) return "Ended";
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const mins = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  const secs = Math.floor((ms % (1000 * 60)) / 1000);
  if (hours > 0) {
    return `${hours}h ${mins}m ${secs}s`;
  }
  return `${mins}m ${secs}s`;
}

export function EndingSoonCard({
  product,
  endDateIso,
}: {
  product: Product;
  endDateIso: string;
}) {
  const [countdown, setCountdown] = useState<string>("");
  const [isUrgent, setIsUrgent] = useState(false);
  const endMs = new Date(endDateIso).getTime();

  useEffect(() => {
    const tick = () => {
      const now = Date.now();
      const remaining = endMs - now;
      setCountdown(formatCountdown(remaining));
      setIsUrgent(remaining > 0 && remaining < 2 * 60 * 60 * 1000);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [endMs]);

  const displayPrice = product.salePrice ?? product.price;
  const href = product.ebayUrl || `/product/${product.id}`;
  const isExternal = !!product.ebayUrl;

  return (
    <Link
      href={href}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noopener noreferrer" : undefined}
      className="group block rounded-lg border border-zinc-200 bg-white overflow-hidden transition hover:shadow-md"
    >
      <div className="relative aspect-[3/4] bg-zinc-100">
        {product.images?.[0] ? (
          <Image
            src={
              product.images[0].startsWith("http")
                ? product.images[0]
                : product.images[0]
            }
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
        <span
          className={`absolute top-2 left-2 rounded px-2 py-1 text-xs font-mono font-semibold ${
            isUrgent
              ? "bg-red-600 text-white"
              : "bg-black/80 text-white"
          }`}
          aria-live="polite"
        >
          {countdown}
        </span>
      </div>
      <div className="p-3">
        <h3 className="font-medium text-zinc-900 line-clamp-2 text-sm">
          {product.title}
        </h3>
        <div className="mt-1 flex items-center gap-2">
          <span className="font-semibold text-black">
            £{displayPrice.toFixed(2)}
          </span>
        </div>
        <span className="mt-2 inline-block text-xs font-medium text-zinc-600 border border-zinc-300 rounded px-2 py-0.5">
          {isExternal ? "BID / BUY ON EBAY" : "VIEW"}
        </span>
      </div>
    </Link>
  );
}
