"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { CartCheckoutButton } from "./CartCheckoutButton";

export default function CartPage() {
  const { items, removeItem, updateQuantity, totalItems, totalCents } = useCart();

  if (totalItems === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">Your cart is empty</h1>
        <p className="mt-2 text-zinc-600">
          Add some vintage finds from the shop!
        </p>
        <Link
          href="/shop"
          className="mt-6 inline-block rounded bg-black px-6 py-2 text-white hover:bg-zinc-800"
        >
          Continue shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-bold">Cart</h1>
      <div className="mt-6 space-y-4">
        {items.map((item) => (
          <div
            key={item.productId}
            className="flex gap-4 rounded-lg border border-zinc-200 bg-white p-4"
          >
            <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded bg-zinc-100">
              {item.image ? (
                <Image
                  src={item.image.startsWith("http") ? item.image : item.image}
                  alt={item.title}
                  fill
                  className="object-cover"
                  sizes="96px"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-zinc-400 text-xs">
                  No img
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <Link
                href={`/product/${item.productId}`}
                className="font-medium hover:underline line-clamp-2"
              >
                {item.title}
              </Link>
              <p className="text-sm text-zinc-600">
                £{(item.salePrice ?? item.price).toFixed(2)} each
              </p>
              <div className="mt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                  className="h-8 w-8 rounded border border-zinc-300 text-sm hover:bg-zinc-100"
                >
                  −
                </button>
                <span className="w-8 text-center text-sm">{item.quantity}</span>
                <button
                  type="button"
                  onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                  className="h-8 w-8 rounded border border-zinc-300 text-sm hover:bg-zinc-100"
                >
                  +
                </button>
                <button
                  type="button"
                  onClick={() => removeItem(item.productId)}
                  className="ml-2 text-sm text-red-600 hover:underline"
                >
                  Remove
                </button>
              </div>
            </div>
            <div className="text-right font-medium">
              £{((item.salePrice ?? item.price) * item.quantity).toFixed(2)}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-8 flex flex-col items-end gap-4 border-t border-zinc-200 pt-6">
        <p className="text-lg font-semibold">
          Subtotal: £{(totalCents / 100).toFixed(2)}
        </p>
        <p className="text-sm text-zinc-600">
          Shipping and taxes calculated at checkout.
        </p>
        <CartCheckoutButton />
        <Link href="/shop" className="text-sm text-zinc-600 hover:underline">
          Continue shopping
        </Link>
      </div>
    </div>
  );
}
