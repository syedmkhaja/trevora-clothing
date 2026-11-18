"use client";

import Link from "next/link";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useCart } from "@/components/cart-context";
import { formatPrice } from "@/lib/products";
export default function CartPage() {
  const { items, removeItem, setQuantity, total } = useCart();
  return <div className="container-wide min-h-[55vh] py-12 md:py-20">
    <p className="eyebrow text-olive">Your selection</p><h1 className="mt-3 font-display text-5xl">Shopping bag</h1>
    {items.length ? <div className="mt-10 grid gap-12 lg:grid-cols-[1fr_340px]">
      <div>{items.map(item => <div key={`${item.product.id}-${item.size}`} className="flex gap-5 border-b border-black/10 py-5"><Link href={`/products/${item.product.slug}`}><img src={item.product.image} alt={item.product.name} className="h-36 w-28 object-cover"/></Link><div className="flex flex-1 flex-col sm:flex-row sm:justify-between"><div><Link href={`/products/${item.product.slug}`} className="text-sm hover:text-olive">{item.product.name}</Link><p className="mt-2 text-xs text-black/50">Size: {item.size}</p><p className="mt-2 text-sm">{formatPrice(item.product.price)}</p></div><div className="mt-4 flex items-center justify-between gap-5 sm:mt-0 sm:flex-col sm:items-end sm:justify-between"><div className="flex items-center border border-black/15"><button className="p-2" aria-label="Decrease quantity" onClick={() => setQuantity(item.product.id, item.size, item.quantity - 1)}><Minus size={13}/></button><span className="min-w-7 text-center text-xs">{item.quantity}</span><button className="p-2" aria-label="Increase quantity" onClick={() => setQuantity(item.product.id, item.size, item.quantity + 1)}><Plus size={13}/></button></div><button onClick={() => removeItem(item.product.id, item.size)} className="flex items-center gap-2 text-xs text-black/50 hover:text-black"><Trash2 size={14}/> Remove</button></div></div></div>)}</div>
      <aside className="h-fit bg-[#e9e5dd] p-6"><h2 className="eyebrow">Order summary</h2><div className="mt-6 flex justify-between text-sm"><span>Subtotal</span><span>{formatPrice(total)}</span></div><p className="mt-3 text-xs leading-5 text-black/50">Shipping and taxes are calculated at checkout.</p><Link href="/checkout" className="mt-6 block w-full bg-ink py-4 text-center text-[10px] uppercase tracking-widest text-paper transition hover:bg-olive">Continue to checkout</Link><Link href="/shop" className="mt-5 block text-center text-[10px] uppercase tracking-widest underline underline-offset-4">Continue shopping</Link></aside>
    </div> : <div className="mt-14 border-t border-black/10 py-14 text-center"><ShoppingBag size={30} strokeWidth={1} className="mx-auto"/><p className="mt-5 font-display text-2xl">Your bag is empty.</p><p className="mt-2 text-sm text-black/55">Find something to make your own.</p><Link href="/shop" className="mt-6 inline-block bg-ink px-6 py-4 text-[10px] uppercase tracking-widest text-paper">Explore the collection</Link></div>}
  </div>;
}
