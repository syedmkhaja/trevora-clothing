import type { Metadata } from "next";
import CheckoutPage from "@/components/checkout-page";
export const metadata: Metadata = { title: "Checkout", description: "Review your TREVORA selection and delivery details." };
export default function Page() { return <CheckoutPage/>; }
