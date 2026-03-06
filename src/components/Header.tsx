"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useState } from "react";

const NAV = [
  { label: "Shop Sale", href: "/shop?sale=true" },
  { label: "Women's", href: "/shop?category=womens" },
  { label: "Men's", href: "/shop?category=mens" },
  { label: "Accessories", href: "/shop?category=accessories" },
  { label: "Dresses", href: "/shop?category=dresses" },
  { label: "Jackets & Coats", href: "/shop?category=jackets-coats" },
];

export function Header() {
  const { totalItems } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-black/10 bg-white">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
        <button
          type="button"
          className="lg:hidden p-2"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label="Menu"
        >
          <span className="text-lg">{menuOpen ? "✕" : "☰"}</span>
        </button>
        <Link href="/" className="text-xl font-bold tracking-tight">
          Karen Arcay Vintage
        </Link>
        <nav className="hidden lg:flex items-center gap-6">
          {NAV.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              className="text-sm font-medium text-zinc-700 hover:text-black"
            >
              {label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link
            href="/cart"
            className="relative p-2 text-zinc-700 hover:text-black"
            aria-label={`Cart, ${totalItems} items`}
          >
            <span className="text-lg">🛒</span>
            {totalItems > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-black text-[10px] font-medium text-white">
                {totalItems > 99 ? "99+" : totalItems}
              </span>
            )}
          </Link>
          <Link
            href="/admin"
            className="hidden sm:block text-sm text-zinc-500 hover:text-zinc-700"
          >
            Admin
          </Link>
        </div>
      </div>
      {menuOpen && (
        <nav className="border-t border-black/10 bg-white lg:hidden">
          <div className="flex flex-col gap-1 px-4 py-3">
            {NAV.map(({ label, href }) => (
              <Link
                key={href}
                href={href}
                className="py-2 text-sm font-medium"
                onClick={() => setMenuOpen(false)}
              >
                {label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
