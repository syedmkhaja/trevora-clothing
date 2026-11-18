import type { Metadata } from "next";
import CheckoutConfirmationPage from "@/components/checkout-confirmation";
export const metadata: Metadata = { title: "Checkout review", description: "Review your TREVORA checkout details." };
export default function Page() { return <CheckoutConfirmationPage/>; }
