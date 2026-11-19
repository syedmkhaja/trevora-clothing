"use client";

import { useMemo, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { products } from "@/lib/products";
import ProductCard from "@/components/product-card";
import ShopifyBuyButton from "@/components/shopify-buy-button";
const categories = ["All pieces", "Outerwear", "Tops", "Bottoms", "Accessories"];
export default function ShopClient() {
  const [category, setCategory] = useState("All pieces");
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => products.filter(product => (category === "All pieces" || product.category === category) && `${product.name} ${product.category}`.toLowerCase().includes(query.toLowerCase())), [category, query]);
  return <div className="container-wide pb-20 pt-12 md:pt-20"><p className="eyebrow text-olive">The collection</p><div className="mt-3 flex flex-col justify-between gap-6 sm:flex-row sm:items-end"><div><h1 className="font-display text-5xl md:text-6xl">Shop all</h1><p className="mt-3 text-sm text-black/55">Pieces to make your own, every day.</p></div><div className="flex items-center border-b border-black/35 pb-2 sm:w-64"><Search size={16} className="mr-2 text-black/50"/><label htmlFor="product-search" className="sr-only">Search products</label><input id="product-search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search the collection" className="w-full bg-transparent text-sm outline-none placeholder:text-black/45"/></div></div><div className="mt-10 flex items-center gap-2 overflow-x-auto border-y border-black/10 py-4"><SlidersHorizontal size={15} className="mr-2 shrink-0 text-black/55"/>{categories.map(item => <button key={item} onClick={() => setCategory(item)} className={`shrink-0 px-3 py-2 text-[10px] uppercase tracking-widest transition ${category === item ? "bg-ink text-paper" : "hover:bg-black/5"}`}>{item}</button>)}<span className="ml-auto hidden shrink-0 text-xs text-black/45 sm:block">{filtered.length} pieces</span></div>{filtered.length ? <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-9 md:grid-cols-3 md:gap-x-6 lg:grid-cols-4">{filtered.map(product => <ProductCard key={product.id} product={product}/>)}</div> : <div className="py-24 text-center"><p className="font-display text-3xl">Nothing found.</p><p className="mt-3 text-sm text-black/55">Try another search or category.</p></div>}</div>;
}
