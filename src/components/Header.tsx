"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useState, useEffect, useRef } from "react";

type CategoryItem = { id: string; name: string; slug: string; productCount: number };

export function Header() {
  const { totalItems } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then(setCategories)
      .catch(() => {});
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setCategoriesOpen(false);
      }
    }
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

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
          <Link
            href="/shop"
            className="text-sm font-medium text-zinc-700 hover:text-black"
          >
            Shop All
          </Link>
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setCategoriesOpen((o) => !o)}
              className="text-sm font-medium text-zinc-700 hover:text-black flex items-center gap-0.5"
              aria-expanded={categoriesOpen}
              aria-haspopup="true"
            >
              Categories <span className="text-zinc-400">{categoriesOpen ? "▴" : "▾"}</span>
            </button>
            {categoriesOpen && (
              <div className="absolute left-0 top-full mt-1 w-56 rounded border border-zinc-200 bg-white py-1 shadow-lg">
                {categories.length === 0 ? (
                  <div className="px-3 py-2 text-sm text-zinc-500">Loading…</div>
                ) : (
                  categories.map((c) => (
                    <Link
                      key={c.id}
                      href={`/shop?category=${encodeURIComponent(c.slug)}`}
                      className="block px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-100"
                      onClick={() => setCategoriesOpen(false)}
                    >
                      {c.name}
                      {c.productCount > 0 && (
                        <span className="ml-1 text-zinc-400">({c.productCount})</span>
                      )}
                    </Link>
                  ))
                )}
              </div>
            )}
          </div>
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
            <Link href="/shop" className="py-2 text-sm font-medium" onClick={() => setMenuOpen(false)}>
              Shop All
            </Link>
            <div className="pt-1">
              <span className="block py-1 text-xs font-semibold uppercase text-zinc-500">Categories</span>
              {categories.map((c) => (
                <Link
                  key={c.id}
                  href={`/shop?category=${encodeURIComponent(c.slug)}`}
                  className="block py-2 pl-2 text-sm"
                  onClick={() => setMenuOpen(false)}
                >
                  {c.name} {c.productCount > 0 && `(${c.productCount})`}
                </Link>
              ))}
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}
