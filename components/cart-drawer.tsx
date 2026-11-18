"use client";

import Link from "next/link";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { formatPrice } from "@/lib/products";
import { useCart } from "@/components/cart-context";

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, setQuantity, total } = useCart();
  if (!isOpen) return null;
  return <div className="fixed inset-0 z-[60]" role="dialog" aria-modal="true" aria-label="Shopping cart">
    <button className="absolute inset-0 bg-black/45" onClick={closeCart} aria-label="Close cart overlay" />
    <aside className="absolute right-0 top-0 flex h-full w-full max-w-[470px] flex-col bg-paper shadow-2xl animate-[slideIn_.3s_ease]">
      <div className="flex items-center justify-between border-b border-black/10 px-6 py-5"><div className="flex items-center gap-3"><ShoppingBag size={18}/><h2 className="text-sm uppercase tracking-[.18em]">Your bag <span className="text-black/45">({items.reduce((a, i) => a + i.quantity, 0)})</span></h2></div><button onClick={closeCart} aria-label="Close cart"><X size={20}/></button></div>
      {items.length ? <><div className="flex-1 overflow-y-auto px-6">{items.map(item => <div key={`${item.product.id}-${item.size}`} className="flex gap-4 border-b border-black/10 py-5"><img src={item.product.image} alt={item.product.name} className="h-28 w-24 object-cover"/><div className="flex flex-1 flex-col"><div className="flex justify-between gap-3"><div><p className="text-sm">{item.product.name}</p><p className="mt-1 text-xs text-black/50">Size: {item.size}</p></div><p className="text-sm">{formatPrice(item.product.price * item.quantity)}</p></div><div className="mt-auto flex items-center justify-between"><div className="flex items-center border border-black/15"><button className="p-2" onClick={() => setQuantity(item.product.id, item.size, item.quantity - 1)} aria-label="Decrease quantity"><Minus size={13}/></button><span className="min-w-7 text-center text-xs">{item.quantity}</span><button className="p-2" onClick={() => setQuantity(item.product.id, item.size, item.quantity + 1)} aria-label="Increase quantity"><Plus size={13}/></button></div><button onClick={() => removeItem(item.product.id, item.size)} className="text-black/45 hover:text-black" aria-label={`Remove ${item.product.name}`}><Trash2 size={16}/></button></div></div></div>)}</div><div className="border-t border-black/10 p-6"><div className="mb-4 flex justify-between text-sm"><span>Subtotal</span><span>{formatPrice(total)}</span></div><p className="mb-5 text-xs text-black/50">Shipping and taxes calculated at checkout.</p><Link href="/cart" onClick={closeCart} className="block bg-ink py-4 text-center text-xs uppercase tracking-[.18em] text-paper transition hover:bg-olive">View cart & checkout</Link></div></> : <div className="flex flex-1 flex-col items-center justify-center"><ShoppingBag size={30} strokeWidth={1}/><p className="mt-5 text-sm">Your bag is currently empty.</p><Link href="/shop" onClick={closeCart} className="mt-6 border-b border-ink pb-1 text-xs uppercase tracking-widest">Explore the collection</Link></div>}
    </aside>
    <style jsx>{`@keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }`}</style>
  </div>;
}
