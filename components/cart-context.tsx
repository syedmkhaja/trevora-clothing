"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Product } from "@/lib/products";
import type { CheckoutOrder } from "@/lib/checkout";

type CartItem = { product: Product; quantity: number; size: string };
type CartContextValue = {
  items: CartItem[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (product: Product, size: string) => void;
  removeItem: (id: string, size: string) => void;
  setQuantity: (id: string, size: string, quantity: number) => void;
  count: number;
  total: number;
  checkoutOrder: CheckoutOrder | null;
  setCheckoutOrder: (order: CheckoutOrder | null) => void;
};
const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const [checkoutOrder, setCheckoutOrder] = useState<CheckoutOrder | null>(null);
  useEffect(() => {
    try {
      const stored = localStorage.getItem("trevora-cart");
      if (stored) setItems(JSON.parse(stored) as CartItem[]);
    } catch { localStorage.removeItem("trevora-cart"); }
    setReady(true);
  }, []);
  useEffect(() => { if (ready) localStorage.setItem("trevora-cart", JSON.stringify(items)); }, [items, ready]);

  const value = useMemo<CartContextValue>(() => {
    const count = items.reduce((sum, item) => sum + item.quantity, 0);
    const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    return {
      items, isOpen, openCart: () => setIsOpen(true), closeCart: () => setIsOpen(false),
      addItem: (product, size) => setItems(current => {
        const existing = current.find(item => item.product.id === product.id && item.size === size);
        return existing ? current.map(item => item === existing ? { ...item, quantity: item.quantity + 1 } : item) : [...current, { product, size, quantity: 1 }];
      }),
      removeItem: (id, size) => setItems(current => current.filter(item => !(item.product.id === id && item.size === size))),
      setQuantity: (id, size, quantity) => setItems(current => quantity < 1 ? current.filter(item => !(item.product.id === id && item.size === size)) : current.map(item => item.product.id === id && item.size === size ? { ...item, quantity } : item)),
      count, total, checkoutOrder, setCheckoutOrder
    };
  }, [items, isOpen, checkoutOrder]);
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
}
