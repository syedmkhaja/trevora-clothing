import type { Metadata } from "next";
import ShopClient from "@/components/shop-client";
export const metadata: Metadata = { title: "Shop", description: "Explore the latest TREVORA Clothing collection: considered essentials, modern streetwear and everyday layers." };
export default function ShopPage() { return <ShopClient/>; }
