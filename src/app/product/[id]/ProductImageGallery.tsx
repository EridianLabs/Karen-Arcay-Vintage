"use client";

import Image from "next/image";
import { useState } from "react";

export function ProductImageGallery({
  images,
  alt,
}: {
  images: string[];
  alt: string;
}) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const mainSrc = images[selectedIndex] ?? images[0];

  if (!images.length) {
    return (
      <div className="flex aspect-square w-full max-w-lg items-center justify-center rounded-lg bg-zinc-100 text-zinc-400">
        No image
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="aspect-square max-w-lg overflow-hidden rounded-lg bg-zinc-100">
        <Image
          src={mainSrc.startsWith("http") ? mainSrc : mainSrc}
          alt={alt}
          width={600}
          height={600}
          className="h-full w-full object-cover"
          priority={selectedIndex === 0}
          unoptimized={mainSrc.startsWith("http")}
        />
      </div>
      {images.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {images.map((src, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setSelectedIndex(i)}
              className={`relative h-16 w-16 shrink-0 overflow-hidden rounded border-2 transition ${
                selectedIndex === i
                  ? "border-black ring-1 ring-black"
                  : "border-zinc-200 hover:border-zinc-400"
              }`}
              aria-label={`View image ${i + 1} of ${images.length}`}
            >
              <Image
                src={src.startsWith("http") ? src : src}
                alt={`${alt} ${i + 1}`}
                fill
                className="object-cover"
                sizes="64px"
                unoptimized={src.startsWith("http")}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
