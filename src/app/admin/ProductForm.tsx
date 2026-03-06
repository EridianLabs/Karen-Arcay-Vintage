"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

type Category = { id: string; name: string; slug: string };
type ProductFormProps = {
  product?: {
    id: string;
    title: string;
    description: string;
    price: number;
    salePrice?: number | null;
    categoryId?: string | null;
    images: string[];
    condition?: string | null;
    size?: string | null;
    published: boolean;
  };
};

export function ProductForm({ product }: ProductFormProps) {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [title, setTitle] = useState(product?.title ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [price, setPrice] = useState(product?.price?.toString() ?? "");
  const [salePrice, setSalePrice] = useState(product?.salePrice?.toString() ?? "");
  const [categoryId, setCategoryId] = useState(product?.categoryId ?? "");
  const [condition, setCondition] = useState(product?.condition ?? "");
  const [size, setSize] = useState(product?.size ?? "");
  const [published, setPublished] = useState(product?.published ?? true);
  const [images, setImages] = useState<string[]>(product?.images ?? []);

  const loadCategories = useCallback(async () => {
    const res = await fetch("/api/admin/categories");
    if (res.ok) {
      const data = await res.json();
      setCategories(data);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/admin/upload", {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Upload failed");
      return;
    }
    setImages((prev) => [...prev, data.url]);
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const payload = {
      title,
      description,
      price: parseFloat(price) || 0,
      salePrice: salePrice ? parseFloat(salePrice) : undefined,
      categoryId: categoryId || undefined,
      images,
      condition: condition || undefined,
      size: size || undefined,
      published,
    };
    try {
      const url = product
        ? `/api/admin/products/${product.id}`
        : "/api/admin/products";
      const method = product ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error?.message || JSON.stringify(data.error) || "Failed");
        return;
      }
      router.push("/admin/dashboard/products");
      router.refresh();
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-8 max-w-2xl space-y-6">
      {error && <p className="rounded bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      <div>
        <label className="block text-sm font-medium">Title *</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="mt-1 w-full rounded border border-zinc-300 px-3 py-2"
          placeholder="e.g. Vintage Chanel Blazer - Size M"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Description *</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          rows={6}
          className="mt-1 w-full rounded border border-zinc-300 px-3 py-2"
          placeholder="Full listing description, condition notes, measurements..."
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium">Price (£) *</label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
            className="mt-1 w-full rounded border border-zinc-300 px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Sale price (£)</label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={salePrice}
            onChange={(e) => setSalePrice(e.target.value)}
            className="mt-1 w-full rounded border border-zinc-300 px-3 py-2"
            placeholder="Leave empty if not on sale"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium">Category</label>
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          onFocus={loadCategories}
          className="mt-1 w-full rounded border border-zinc-300 px-3 py-2"
        >
          <option value="">— Select —</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium">Condition</label>
          <input
            type="text"
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
            className="mt-1 w-full rounded border border-zinc-300 px-3 py-2"
            placeholder="e.g. Excellent, Good"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Size</label>
          <input
            type="text"
            value={size}
            onChange={(e) => setSize(e.target.value)}
            className="mt-1 w-full rounded border border-zinc-300 px-3 py-2"
            placeholder="e.g. M, 32, 10"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium">Images</label>
        <div className="mt-2 flex flex-wrap gap-4">
          {images.map((url, i) => (
            <div key={url} className="relative">
              <div className="relative h-24 w-24 overflow-hidden rounded border bg-zinc-100">
                <Image
                  src={url.startsWith("http") ? url : url}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="96px"
                />
              </div>
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute -right-2 -top-2 rounded-full bg-red-600 px-1.5 py-0.5 text-xs text-white hover:bg-red-700"
              >
                ×
              </button>
            </div>
          ))}
          <label className="flex h-24 w-24 cursor-pointer flex-col items-center justify-center rounded border-2 border-dashed border-zinc-300 text-sm text-zinc-500 hover:border-zinc-400">
            <span>+ Add</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
          </label>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="published"
          checked={published}
          onChange={(e) => setPublished(e.target.checked)}
          className="rounded border-zinc-300"
        />
        <label htmlFor="published" className="text-sm">
          Publish (show on shop)
        </label>
      </div>

      <div className="flex gap-4">
        <button
          type="submit"
          disabled={loading}
          className="rounded bg-black px-6 py-2 font-medium text-white hover:bg-zinc-800 disabled:opacity-70"
        >
          {loading ? "Saving…" : product ? "Update product" : "Add product"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded border border-zinc-300 px-6 py-2 font-medium hover:bg-zinc-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
