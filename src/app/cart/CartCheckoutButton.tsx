"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";

export function CartCheckoutButton() {
  const { items, totalCents, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const handleCheckout = async () => {
    if (!email.trim()) {
      setError("Please enter your email");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          items: items.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Checkout failed");
        return;
      }
      if (data.url) {
        clearCart();
        window.location.href = data.url;
      }
    } catch {
      setError("Checkout failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm space-y-3">
      <input
        type="email"
        placeholder="Your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full rounded border border-zinc-300 px-3 py-2 text-sm"
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="button"
        onClick={handleCheckout}
        disabled={loading}
        className="w-full rounded bg-black px-6 py-3 font-medium text-white hover:bg-zinc-800 disabled:opacity-70"
      >
        {loading ? "Redirecting to checkout…" : "Check out"}
      </button>
    </div>
  );
}
