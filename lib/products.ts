export type Product = {
  id: string;
  slug: string;
  name: string;
  category: "Outerwear" | "Tops" | "Bottoms" | "Accessories";
  price: number;
  description: string;
  image: string;
  tag?: string;
  colors: string[];
};

export const products: Product[] = [
  { id: "01", slug: "form-01-overshirt", name: "FORM 01 Overshirt", category: "Outerwear", price: 148, description: "A structured, heavyweight cotton overshirt with a relaxed shape and considered utility details. Built for the in-between moments.", image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=1000&q=85", tag: "Bestseller", colors: ["Stone", "Black"] },
  { id: "02", slug: "core-heavyweight-tee", name: "Core Heavyweight Tee", category: "Tops", price: 58, description: "Our everyday uniform, refined. Cut from dense organic cotton with a dropped shoulder and a clean, substantial hand feel.", image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1000&q=85", tag: "Essential", colors: ["Ivory", "Washed Black"] },
  { id: "03", slug: "relaxed-cargo-trouser", name: "Relaxed Cargo Trouser", category: "Bottoms", price: 132, description: "A modern utility trouser with a generous leg, adjustable hem and functional pockets. Made to move with you.", image: "https://images.unsplash.com/photo-1517438476312-10d79c077509?auto=format&fit=crop&w=1000&q=85", colors: ["Olive", "Black"] },
  { id: "04", slug: "everyday-hoodie", name: "Everyday Hoodie", category: "Tops", price: 118, description: "A softly structured fleece hoodie in a relaxed fit. Designed with a clean finish, considered proportions and a lived-in feel.", image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=1000&q=85", tag: "New", colors: ["Heather Grey", "Ink"] },
  { id: "05", slug: "studio-bomber", name: "Studio Bomber", category: "Outerwear", price: 198, description: "A quietly confident layer in a lightweight technical shell, finished with a subtle sheen and an easy, boxy silhouette.", image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=1000&q=85", colors: ["Black", "Moss"] },
  { id: "06", slug: "uniform-cap", name: "Uniform Cap", category: "Accessories", price: 42, description: "A six-panel cotton twill cap with tonal embroidered TREVORA lettering and an adjustable back strap.", image: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=1000&q=85", colors: ["Washed Black", "Sand"] },
  { id: "07", slug: "wide-leg-denim", name: "Wide Leg Denim", category: "Bottoms", price: 142, description: "A relaxed, full-length jean in sturdy washed denim. A timeless five-pocket construction with a contemporary shape.", image: "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=1000&q=85", tag: "Limited", colors: ["Vintage Indigo"] },
  { id: "08", slug: "merino-beanie", name: "Merino Beanie", category: "Accessories", price: 64, description: "A soft, close-knit merino wool beanie with a minimal folded cuff. Warmth without the noise.", image: "https://images.unsplash.com/photo-1576871337622-98d48d1cf531?auto=format&fit=crop&w=1000&q=85", colors: ["Charcoal", "Olive"] }
  { id: "09", slug: "vertex-oversized-t-shirt", name: "Vertex Oversized T-Shirt", category: "Tops", price: 499, description: "A premium oversized streetwear T-shirt with a relaxed silhouette and bold everyday presence.", image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1000&q=85", tag: "New", colors: ["Black", "White"] }
];

/** Prices are presented in Indian rupees throughout the storefront. */
export const formatPrice = (price: number) => new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2
}).format(price);
