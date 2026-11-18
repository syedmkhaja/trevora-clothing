import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/components/cart-context";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import CartDrawer from "@/components/cart-drawer";

export const metadata: Metadata = {
  title: { default: "TREVORA Clothing — Considered Streetwear", template: "%s | TREVORA Clothing" },
  description: "Modern streetwear for the considered everyday. Discover elevated essentials and thoughtfully designed layers from TREVORA Clothing.",
  openGraph: { title: "TREVORA Clothing", description: "Clothing for the considered everyday.", type: "website" }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><CartProvider><SiteHeader/><main>{children}</main><SiteFooter/><CartDrawer/></CartProvider></body></html>;
}
