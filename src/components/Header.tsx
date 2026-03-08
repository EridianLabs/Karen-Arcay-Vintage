"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";

type CategoryItem = { id: string; name: string; slug: string; productCount: number };

/** Order for nav: All categories first, then Film/Music, Furniture, Women's, Men's, then rest alphabetically. */
function orderCategoriesForNav(categories: CategoryItem[]): (CategoryItem & { isAll?: boolean })[] {
  const topSlugs = ["film-music", "vintage-furniture", "womens", "mens"];
  const bySlug = new Map(categories.map((c) => [c.slug, c]));
  const top: (CategoryItem & { isAll?: boolean })[] = [
    { id: "__all__", name: "All categories", slug: "", productCount: 0, isAll: true },
    ...topSlugs.map((slug) => bySlug.get(slug)).filter(Boolean) as CategoryItem[],
  ];
  const rest = categories.filter((c) => !topSlugs.includes(c.slug)).sort((a, b) => a.name.localeCompare(b.name));
  return [...top, ...rest];
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

export function Header() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus();
  }, [searchOpen]);

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
    <header className="sticky top-0 z-50 border-b border-black/10 bg-white py-[10px]">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
        <button
          type="button"
          className="lg:hidden p-2"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label="Menu"
        >
          <span className="text-lg">{menuOpen ? "✕" : "☰"}</span>
        </button>
        <Link href="/" className="flex items-center shrink-0" aria-label="Karen Arcay Vintage – Home">
          <Image
            src="/logo.svg"
            alt="Karen Arcay Vintage"
            width={288}
            height={90}
            className="h-[58px] w-auto object-contain"
            priority
          />
        </Link>
        <nav className="hidden lg:flex items-center gap-6">
          <span className="shop-all-glint">
            <Link href="/shop" className="shop-all-glint-inner">
              Shop All
            </Link>
          </span>
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
                  orderCategoriesForNav(categories).map((c) => (
                    <Link
                      key={c.id}
                      href={c.slug === "" ? "/shop" : `/shop?category=${encodeURIComponent(c.slug)}`}
                      className="block px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-100"
                      onClick={() => setCategoriesOpen(false)}
                    >
                      {c.name}
                      {c.productCount > 0 && c.slug !== "" && (
                        <span className="ml-1 text-zinc-400">({c.productCount})</span>
                      )}
                    </Link>
                  ))
                )}
              </div>
            )}
          </div>
        </nav>
        <div className="flex items-center gap-1 sm:gap-2">
          {searchOpen ? (
            <form
              className="flex items-center gap-1"
              onSubmit={(e) => {
                e.preventDefault();
                const q = searchQuery.trim();
                setSearchOpen(false);
                setSearchQuery("");
                if (q) router.push(`/shop?q=${encodeURIComponent(q)}`);
              }}
            >
              <input
                ref={searchInputRef}
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onBlur={() => {
                  if (!searchQuery.trim()) setSearchOpen(false);
                }}
                placeholder="Search products…"
                className="w-36 rounded border border-zinc-300 bg-white px-2 py-1.5 text-sm outline-none focus:border-zinc-500 sm:w-48"
                aria-label="Search products"
              />
              <button
                type="submit"
                className="rounded p-1.5 text-zinc-600 hover:bg-zinc-100 hover:text-black"
                aria-label="Search"
              >
                <SearchIcon className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => { setSearchOpen(false); setSearchQuery(""); }}
                className="rounded p-1 text-zinc-400 hover:text-zinc-600"
                aria-label="Close search"
              >
                ✕
              </button>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="rounded p-2 text-zinc-600 hover:bg-zinc-100 hover:text-black"
              aria-label="Search"
            >
              <SearchIcon className="h-5 w-5" />
            </button>
          )}
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
            <span className="shop-all-glint w-fit mt-1">
              <Link href="/shop" className="shop-all-glint-inner" onClick={() => setMenuOpen(false)}>
                Shop All
              </Link>
            </span>
            <div className="pt-1">
              <span className="block py-1 text-xs font-semibold uppercase text-zinc-500">Categories</span>
              {orderCategoriesForNav(categories).map((c) => (
                <Link
                  key={c.id}
                  href={c.slug === "" ? "/shop" : `/shop?category=${encodeURIComponent(c.slug)}`}
                  className="block py-2 pl-2 text-sm"
                  onClick={() => setMenuOpen(false)}
                >
                  {c.name} {c.productCount > 0 && c.slug !== "" && `(${c.productCount})`}
                </Link>
              ))}
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}
