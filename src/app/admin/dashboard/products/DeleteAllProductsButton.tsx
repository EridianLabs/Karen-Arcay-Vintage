"use client";

import { useRouter } from "next/navigation";

type Props = { count: number };

export function DeleteAllProductsButton({ count }: Props) {
  const router = useRouter();

  async function handleClick() {
    if (count === 0) return;
    const ok = window.confirm(
      `Delete all ${count} products? This cannot be undone.`
    );
    if (!ok) return;
    const res = await fetch("/api/admin/products/delete-all", {
      method: "POST",
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert(data?.error ?? "Failed to delete products");
      return;
    }
    router.refresh();
  }

  if (count === 0) return null;

  return (
    <button
      type="button"
      onClick={handleClick}
      className="rounded border border-red-600 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
    >
      Delete all products
    </button>
  );
}
