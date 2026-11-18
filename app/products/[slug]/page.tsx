import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { products } from "@/lib/products";
import ProductDetail from "@/components/product-detail";

type Props = { params: { slug: string } };
export function generateStaticParams() { return products.map(product => ({ slug: product.slug })); }
export function generateMetadata({ params }: Props): Metadata {
  const product = products.find(item => item.slug === params.slug);
  return product ? { title: product.name, description: product.description, openGraph: { title: `${product.name} | TREVORA`, description: product.description, images: [product.image] } } : {};
}
export default function ProductPage({ params }: Props) {
  const product = products.find(item => item.slug === params.slug);
  if (!product) notFound();
  return <><div className="container-wide pt-6 text-[10px] uppercase tracking-widest text-black/45"><Link href="/shop" className="hover:text-black">Shop</Link><span className="mx-2">/</span><span>{product.name}</span></div><ProductDetail product={product}/></>;
}
