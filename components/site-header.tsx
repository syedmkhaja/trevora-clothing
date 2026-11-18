"use client";

import Link from "next/link";
import { Menu, ShoppingBag, X } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/components/cart-context";

export default function SiteHeader() {
  const { count, openCart } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const nav = [{ href: "/shop", label: "Shop" }, { href: "/about", label: "Our story" }, { href: "/contact", label: "Contact" }];
  return <header className="sticky top-0 z-40 border-b border-black/10 bg-paper/95 backdrop-blur">
    <div className="container-wide flex h-[76px] items-center justify-between">
      <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? "Close menu" : "Open menu"}>{menuOpen ? <X size={21}/> : <Menu size={21}/>}</button>
      <Link href="/" className="absolute left-1/2 -translate-x-1/2 text-[19px] font-semibold tracking-[.3em] md:static md:translate-x-0">TREVORA</Link>
      <nav className="hidden items-center gap-9 md:flex">{nav.map(item => <Link key={item.href} href={item.href} className="eyebrow transition hover:text-olive">{item.label}</Link>)}</nav>
      <button onClick={openCart} aria-label={`Open shopping bag, ${count} items`} className="relative flex items-center gap-2"><ShoppingBag size={19} strokeWidth={1.5}/><span className="hidden text-[10px] uppercase tracking-[.16em] sm:inline">Bag</span><span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-ink px-1 text-[9px] text-paper">{count}</span></button>
    </div>
    {menuOpen && <nav className="border-t border-black/10 bg-paper px-6 py-5 md:hidden">{nav.map(item => <Link key={item.href} onClick={() => setMenuOpen(false)} href={item.href} className="block py-3 text-xs uppercase tracking-[.2em]">{item.label}</Link>)}</nav>}
  </header>;
}
