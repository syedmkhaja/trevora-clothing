"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { CheckoutOrder } from "@/lib/checkout";
import type { Product } from "@/lib/products";

export type CartItem = {
  product: Product;
  quantity: number;
  size: string;
};

type CartContextValue = {
  items: CartItem[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (product: Product, size: string) => void;
  removeItem: (productId: string, size: string) => void;
  setQuantity: (productId: string, size: string, quantity: number) => void;
  count: number;
  total: number;
  checkoutOrder: CheckoutOrder | null;
  setCheckoutOrder: (order: CheckoutOrder | null) => void;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [checkoutOrder, setCheckoutOrder] = useState<CheckoutOrder | null>(null);
  const [storageReady, setStorageReady] = useState(false);

  useEffect(() => {
    try {
      const storedCart = window.localStorage.getItem("trevora-cart");
      if (storedCart) {
        const parsed: unknown = JSON.parse(storedCart);
        if (Array.isArray(parsed)) setItems(parsed as CartItem[]);
      }
    } catch {
      // Ignore unavailable or malformed browser storage and start with an empty cart.
    } finally {
      setStorageReady(true);
    }
  }, []);

  useEffect(() => {
    if (!storageReady) return;
    try {
      window.localStorage.setItem("trevora-cart", JSON.stringify(items));
    } catch {
      // Cart interactions remain available for the current page if storage is unavailable.
    }
  }, [items, storageReady]);

  const value = useMemo<CartContextValue>(() => {
    const count = items.reduce((sum, item) => sum + item.quantity, 0);
    const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

    return {
      items,
      isOpen,
      openCart: () => setIsOpen(true),
      closeCart: () => setIsOpen(false),
      addItem: (product, size) => setItems(current => {
        const existing = current.find(item => item.product.id === product.id && item.size === size);
        if (existing) {
          return current.map(item => item === existing ? { ...item, quantity: item.quantity + 1 } : item);
        }
        return [...current, { product, size, quantity: 1 }];
      }),
      removeItem: (productId, size) => setItems(current =>
        current.filter(item => !(item.product.id === productId && item.size === size))
      ),
      setQuantity: (productId, size, quantity) => setItems(current => {
        if (quantity < 1) {
          return current.filter(item => !(item.product.id === productId && item.size === size));
        }
        return current.map(item => item.product.id === productId && item.size === size
          ? { ...item, quantity }
          : item
        );
      }),
      count,
      total,
      checkoutOrder,
      setCheckoutOrder
    };
  }, [items, isOpen, checkoutOrder]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
}
