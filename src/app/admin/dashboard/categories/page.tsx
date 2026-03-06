"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type Category = {
  id: string;
  name: string;
  slug: string;
  _count?: { products: number };
};

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    const res = await fetch("/api/admin/categories");
    if (res.ok) {
      const data = await res.json();
      setCategories(data);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleSlugFromName = (n: string) => {
    setName(n);
    setSlug(n.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, slug }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error?.message || JSON.stringify(data.error) || "Failed");
        return;
      }
      setName("");
      setSlug("");
      load();
    } catch {
      setError("Failed to create category");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold">Categories</h1>
      <p className="mt-2 text-zinc-600">
        Manage categories for your products (e.g. Women&apos;s, Men&apos;s, Sale).
      </p>

      <form onSubmit={handleSubmit} className="mt-8 max-w-md space-y-4">
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div>
          <label className="block text-sm font-medium">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => handleSlugFromName(e.target.value)}
            required
            className="mt-1 w-full rounded border border-zinc-300 px-3 py-2"
            placeholder="e.g. Women's"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Slug (URL)</label>
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            required
            className="mt-1 w-full rounded border border-zinc-300 px-3 py-2"
            placeholder="e.g. womens"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="rounded bg-black px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-70"
        >
          Add category
        </button>
      </form>

      <div className="mt-10">
        <h2 className="text-lg font-semibold">Existing categories</h2>
        {categories.length === 0 ? (
          <p className="mt-4 text-zinc-600">No categories yet.</p>
        ) : (
          <ul className="mt-4 space-y-2">
            {categories.map((c) => (
              <li key={c.id} className="flex items-center gap-4 rounded border border-zinc-200 bg-white px-4 py-2">
                <span className="font-medium">{c.name}</span>
                <span className="text-sm text-zinc-500">{c.slug}</span>
                {c._count != null && (
                  <span className="text-sm text-zinc-500">{c._count.products} products</span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
