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
          alt="TREVORA clothing collection"
          className="absolute inset-0 h-full w-full object-cover opacity-70"
        />

        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/35 to-black/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

        <div className="container-wide relative z-10 flex min-h-[680px] flex-col justify-end pb-16 md:min-h-[760px] md:pb-24">
          <p className="eyebrow text-white/70">
            TREVORA CLOTHING · NEW COLLECTION
          </p>

          <h1 className="mt-5 max-w-4xl font-display text-6xl leading-[0.9] md:text-8xl">
            Dress
            <br />
            <em className="font-normal">your way.</em>
          </h1>

          <p className="mt-7 max-w-md text-sm leading-7 text-white/75 md:text-base">
            Premium everyday essentials designed for modern streetwear,
            effortless styling and everyday confidence.
          </p>

          <Link
            href="/shop"
            className="mt-9 inline-flex w-fit items-center gap-6 bg-white px-6 py-4 text-[10px] uppercase tracking-[0.2em] text-black"
          >
            Shop collection
            <ArrowRight size={15} />
          </Link>
        </div>

        <div className="absolute bottom-8 right-8 hidden items-center gap-3 text-[9px] uppercase tracking-[0.2em] text-white/60 md:flex">
          <ArrowDown size={14} />
          Scroll to explore
        </div>
      </section>

      {/* TRUST BAR */}
      <section className="border-b border-black/10 bg-[#f7f5f1]">
        <div className="container-wide grid grid-cols-2 md:grid-cols-4">
          <div className="border-b border-black/10 px-4 py-6 text-center md:border-b-0">
            <p className="text-[10px] uppercase tracking-widest">
              Cash on Delivery
            </p>
            <p className="mt-2 text-xs text-black/50">Easy & convenient</p>
          </div>

          <div className="border-b border-black/10 px-4 py-6 text-center md:border-b-0">
            <p className="text-[10px] uppercase tracking-widest">
              Secure Payment
            </p>
            <p className="mt-2 text-xs text-black/50">Safe checkout</p>
          </div>

          <div className="border-b border-black/10 px-4 py-6 text-center md:border-b-0">
            <p className="text-[10px] uppercase tracking-widest">
              Pan India Delivery
            </p>
            <p className="mt-2 text-xs text-black/50">Delivered to your door</p>
          </div>

          <div className="px-4 py-6 text-center">
            <p className="text-[10px] uppercase tracking-widest">
              TREVORA Quality
            </p>
            <p className="mt-2 text-xs text-black/50">Made for everyday</p>
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
            className="hidden items-center gap-2 text-xs uppercase tracking-widest sm:flex"
          >
            Shop all
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <Link
          href="/shop"
          className="mt-10 flex items-center justify-center gap-2 border border-black/20 py-4 text-[10px] uppercase tracking-widest sm:hidden"
        >
          View all products
          <ArrowRight size={14} />
        </Link>
      </section>

      {/* BRAND STORY */}
      <section className="grid bg-[#e5e0d8] md:grid-cols-2">
        <div className="min-h-[460px] overflow-hidden md:min-h-[600px]">
          <img
            src="https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1400&q=90"
            alt="TREVORA everyday fashion"
            className="h-full min-h-[460px] w-full object-cover md:min-h-[600px]"
          />
        </div>

        <div className="flex flex-col justify-center px-8 py-16 md:px-16 lg:px-24">
          <p className="eyebrow text-olive">The TREVORA approach</p>

          <h2 className="mt-5 max-w-lg font-display text-4xl leading-tight md:text-6xl">
            Simple pieces.
            <br />
            Strong identity.
          </h2>

          <p className="mt-6 max-w-md text-sm leading-7 text-black/60">
            Everyday clothing should feel comfortable, confident and
            unmistakably yours. TREVORA brings together clean silhouettes,
            modern streetwear and easy-to-wear pieces.
          </p>

          <Link
            href="/about"
            className="mt-9 inline-flex w-fit items-center gap-3 border-b border-black pb-2 text-[10px] uppercase tracking-widest"
          >
            Discover our story
            <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      {/* NEW ARRIVALS */}
      <section className="container-wide py-20 md:py-28">
        <div className="mb-10">
          <p className="eyebrow text-olive">Fresh from TREVORA</p>

          <h2 className="mt-3 font-display text-4xl md:text-5xl">
            New arrivals.
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4">
          {newArrivals.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* BRAND STATEMENT */}
      <section className="bg-black px-6 py-24 text-center text-white md:py-32">
        <p className="eyebrow text-white/50">TREVORA</p>

        <h2 className="mt-6 font-display text-5xl md:text-7xl">
          Made for your
          <br />
          <em className="font-normal">everyday.</em>
        </h2>

        <p className="mx-auto mt-7 max-w-lg text-sm leading-7 text-white/60">
          From relaxed essentials to statement streetwear, build a wardrobe
          that feels like you.
        </p>

        <Link
          href="/shop"
          className="mt-9 inline-flex items-center gap-6 border border-white/40 px-7 py-4 text-[10px] uppercase tracking-[0.2em]"
        >
          Shop TREVORA
          <ArrowRight size={15} />
        </Link>
      </section>

      {/* INSTAGRAM */}
      <section className="container-wide py-20 text-center md:py-28">
        <p className="eyebrow text-olive">Follow the movement</p>

        <h2 className="mt-3 font-display text-4xl md:text-5xl">
          TREVORA community.
        </h2>

        <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-black/55">
          Follow us for new drops, styling inspiration and everything
          happening at TREVORA.
        </p>

        <a
          href="https://instagram.com/trevora.clothing"
          target="_blank"
          rel="noreferrer"
          className="mt-7 inline-flex items-center gap-3 border-b border-black pb-2 text-[10px] uppercase tracking-widest"
        >
          @trevora.clothing
          <ArrowRight size={14} />
        </a>
      </section>

      <Newsletter />
    </>
  );
}