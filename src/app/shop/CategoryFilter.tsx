"use client";

import { useRouter, useSearchParams } from "next/navigation";

type Category = { id: string; name: string; slug: string };

export function CategoryFilter({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const current = searchParams.get("category") ?? "";

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const slug = e.target.value;
    const next = new URLSearchParams(searchParams.toString());
    next.delete("page");
    if (slug) next.set("category", slug);
    else next.delete("category");
    router.push(`/shop?${next.toString()}`);
  }

  return (
    <div className="mb-6 flex flex-wrap items-center gap-2">
      <label htmlFor="category-filter" className="text-sm font-medium text-zinc-600">
        Filter by category
      </label>
      <select
        id="category-filter"
        value={current}
        onChange={handleChange}
        className="rounded border border-zinc-300 bg-white px-3 py-2 text-sm"
      >
        <option value="">All categories</option>
        {categories.map((c) => (
          <option key={c.id} value={c.slug}>
            {c.name}
          </option>
        ))}
      </select>
    </div>
  );
}
