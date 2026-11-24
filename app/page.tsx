import Link from "next/link";
import { ArrowDown, ArrowRight } from "lucide-react";
import ProductCard from "@/components/product-card";
import Newsletter from "@/components/newsletter";
import { products } from "@/lib/products";

export default function HomePage() {
  const featuredProducts = products.slice(0, 4);
  const newArrivals = products.slice(0, 8);

  return (
    <>
      {/* HERO */}
      <section className="relative min-h-[680px] overflow-hidden bg-black text-white md:min-h-[760px]">
        <img
          src="https://images.unsplash.com/photo-1523398002811-999ca8dec234?auto=format&fit=crop&w=2200&q=90"
          alt="TREVORA contemporary clothing collection"
          className="absolute inset-0 h-full w-full object-cover object-center opacity-70"
        />

        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/35 to-black/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10" />

        <div className="container-wide relative z-10 flex min-h-[680px] flex-col justify-end pb-16 pt-32 md:min-h-[760px] md:pb-24">
          <p className="eyebrow text-white/70">
            TREVORA CLOTHING · NEW COLLECTION
          </p>

          <h1 className="mt-5 max-w-4xl font-display text-6xl leading-[0.9] tracking-tight md:text-8xl lg:text-[110px]">
            Dress
            <br />
            <em className="font-normal">your way.</em>
          </h1>

          <p className="mt-7 max-w-md text-sm leading-7 text-white/75 md:text-base">
            Premium everyday essentials designed for modern streetwear,
            effortless styling and everyday confidence.
          </p>

          <div className="mt-9 flex flex-wrap gap-3">
            <Link
              href="/shop"
              className="inline-flex items-center gap-6 bg-white px-6 py-4 text-[10px] font-medium uppercase tracking-[0.2em] text-black transition hover:bg-white/90"
            >
              Shop collection
              <ArrowRight size={15} />
            </Link>

            <Link
              href="/about"
              className="inline-flex items-center gap-3 border border-white/50 px-6 py-4 text-[10px] uppercase tracking-[0.2em] text-white transition hover:bg-white hover:text-black"
            >
              Our story
            </Link>
          </div>
        </div>

        <div className="absolute bottom-8 right-8 hidden items-center gap-3 text-[9px] uppercase tracking-[0.2em] text-white/60 md:flex">
          <ArrowDown size={14} />
          Scroll to explore
        </div>
      </section>

      {/* TRUST BAR */}
      <section className="border-b border-black/10 bg-[#f7f5f1]">
        <div className="container-wide grid grid-cols-2 divide-x divide-black/10 md:grid-cols-4">
          <div className="px-4 py-7 text-center md:px-6">
            <p className="text-[10px] font-medium uppercase tracking-[0.16em]">
              Cash on Delivery
            </p>
            <p className="mt-2 text-xs text-black/50">
              Easy & convenient
            </p>
          </div>

          <div className="px-4 py-7 text-center md:px-6">
            <p className="text-[10px] font-medium uppercase tracking-[0.16em]">
              Secure Payment
            </p>
            <p className="mt-2 text-xs text-black/50">
              Safe checkout
            </p>
          </div>

          <div className="border-t border-black/10 px-4 py-7 text-center md:border-t-0 md:px-6">
            <p className="text-[10px] font-medium uppercase tracking-[0.16em]">
              Pan India Delivery
            </p>
            <p className="mt-2 text-xs text-black/50">
              Delivered to your door
            </p>
          </div>

          <div className="border-t border-black/10 px-4 py-7 text-center md:border-t-0 md:px-6">
            <p className="text-[10px] font-medium uppercase tracking-[0.16em]">
              TREVORA Quality
            </p>
            <p className="mt-2 text-xs text-black/50">
              Made for everyday
            </p>
          </div>
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="container-wide py-20 md:py-28">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <p className="eyebrow text-olive">Featured edit</p>

            <h2 className="mt-3 font-display text-4xl md:text-5xl">
              Essentials,
              <br />
              elevated.
            </h2>
          </div>

          <Link
            href="/shop"
            className="hidden items-center gap-2 text-xs uppercase tracking-widest transition hover:text-olive sm:flex"
          >
            Shop all
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4 md:gap-x-5">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <Link
          href="/shop"
          className="mt-