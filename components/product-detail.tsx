"use client";

import { useState } from "react";
import { ShoppingBag } from "lucide-react";
import type { Product } from "@/lib/products";
import { formatPrice } from "@/lib/products";
import { useCart } from "@/components/cart-context";

const sizes = ["XS", "S", "M", "L", "XL"];
export default function ProductDetail({ product }: { product: Product }) {
  const [size, setSize] = useState("M");
  const [added, setAdded] = useState(false);
  const { addItem, openCart } = useCart();
  function addToBag() { addItem(product, size); setAdded(true); openCart(); window.setTimeout(() => setAdded(false), 1800); }
  return <div className="container-wide grid gap-10 py-10 md:grid-cols-2 md:gap-16 md:py-16"><div className="bg-[#e8e4dc]"><img src={product.image} alt={product.name} className="aspect-[4/5] w-full object-cover"/></div><div className="flex flex-col justify-center md:py-10"><p className="eyebrow text-olive">{product.category} · TREVORA essentials</p><h1 className="mt-4 font-display text-4xl md:text-5xl">{product.name}</h1><p className="mt-4 text-base">{formatPrice(product.price)}</p><p className="mt-8 max-w-lg text-sm leading-7 text-black/60">{product.description}</p><div className="mt-8"><div className="mb-3 flex justify-between text-[10px] uppercase tracking-widest"><span>Select size</span><button className="text-black/50 underline">Size guide</button></div><div className="flex gap-2">{sizes.map(item => <button key={item} onClick={() => setSize(item)} className={`h-11 w-12 border text-xs transition ${size === item ? "border-ink bg-ink text-paper" : "border-black/20 hover:border-black"}`}>{item}</button>)}</div></div><button onClick={addToBag} className="mt-8 flex items-center justify-center gap-3 bg-ink py-4 text-[10px] uppercase tracking-[.18em] text-paper transition hover:bg-olive"><ShoppingBag size={16}/>{added ? "Added to your bag" : "Add to bag"}</button><div className="mt-8 border-t border-black/10 pt-5 text-xs leading-6 text-black/55"><p>Thoughtful design, made to be worn on repeat.</p><p>Complimentary shipping on orders over $150.</p></div></div></div>;
}
