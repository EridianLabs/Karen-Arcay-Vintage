"use client";

import React, { createContext, useContext, useCallback, useMemo, useState } from "react";

export type CartItem = {
  productId: string;
  title: string;
  price: number;
  salePrice?: number | null;
  image?: string;
  quantity: number;
};

type CartContextType = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalCents: number;
};

const CartContext = createContext<CartContextType | null>(null);

const CART_KEY = "karen_arcay_vintage_cart";

function loadCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const s = localStorage.getItem(CART_KEY);
    return s ? JSON.parse(s) : [];
  } catch {
    return [];
  }
}

function saveCart(items: CartItem[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(CART_KEY, JSON.stringify(items));
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(loadCart);

  const persist = useCallback((next: CartItem[]) => {
    setItems(next);
    saveCart(next);
  }, []);

  const addItem = useCallback(
    (item: Omit<CartItem, "quantity">, quantity = 1) => {
      setItems((prev) => {
        const i = prev.findIndex((x) => x.productId === item.productId);
        let next: CartItem[];
        if (i >= 0) {
          next = [...prev];
          next[i] = { ...next[i], quantity: next[i].quantity + quantity };
        } else {
          next = [...prev, { ...item, quantity }];
        }
        saveCart(next);
        return next;
      });
    },
    []
  );

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => {
      const next = prev.filter((p) => p.productId !== productId);
      saveCart(next);
      return next;
    });
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity < 1) {
      removeItem(productId);
      return;
    }
    setItems((prev) => {
      const next = prev.map((p) =>
        p.productId === productId ? { ...p, quantity } : p
      );
      saveCart(next);
      return next;
    });
  }, [removeItem]);

  const clearCart = useCallback(() => {
    setItems([]);
    saveCart([]);
  }, []);

  const totalItems = useMemo(
    () => items.reduce((s, i) => s + i.quantity, 0),
    [items]
  );
  const totalCents = useMemo(
    () =>
      items.reduce(
        (s, i) => s + (i.salePrice ?? i.price) * 100 * i.quantity,
        0
      ),
    [items]
  );

  const value = useMemo(
    () => ({
      items,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      totalItems,
      totalCents,
    }),
    [items, addItem, removeItem, updateQuantity, clearCart, totalItems, totalCents]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
