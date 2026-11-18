import Link from "next/link";
import type { Product } from "@/lib/products";
import { formatPrice } from "@/lib/products";

export default function ProductCard({ product }: { product: Product }) {
  return <article className="group"><Link href={`/products/${product.slug}`} className="relative block overflow-hidden bg-[#e8e4dc]"><div className="aspect-[4/5] overflow-hidden"><img src={product.image} alt={product.name} loading="lazy" className="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-[1.04]"/></div>{product.tag && <span className="absolute left-3 top-3 bg-paper px-3 py-2 text-[9px] uppercase tracking-[.16em]">{product.tag}</span>}<span className="absolute bottom-3 right-3 translate-y-2 bg-paper/95 px-3 py-2 text-[9px] uppercase tracking-widest opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">View product</span></Link><div className="flex justify-between gap-2 pt-3"><div><Link href={`/products/${product.slug}`} className="text-sm hover:text-olive">{product.name}</Link><p className="mt-1 text-[10px] uppercase tracking-widest text-black/45">{product.category}</p></div><span className="text-sm">{formatPrice(product.price)}</span></div></article>;
}
