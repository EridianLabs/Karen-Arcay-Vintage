"use client";

import { useCart } from "@/context/CartContext";
import { useState } from "react";

export function AddToCartButton({
  productId,
  title,
  price,
  salePrice,
  image,
}: {
  productId: string;
  title: string;
  price: number;
  salePrice?: number | null;
  image?: string;
}) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    addItem({ productId, title, price, salePrice, image }, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <button
      type="button"
      onClick={handleAdd}
      className="w-full rounded bg-black px-6 py-3 text-lg font-medium text-white hover:bg-zinc-800 disabled:opacity-70 sm:w-auto"
    >
      {added ? "Added to cart ✓" : "Add to cart"}
    </button>
  );
}
