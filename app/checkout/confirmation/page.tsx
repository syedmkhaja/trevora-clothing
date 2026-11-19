import type { Metadata } from "next";
import { cookies } from "next/headers";
import CheckoutConfirmationPage from "@/components/checkout-confirmation";
import { getOrderByRazorpayId } from "@/lib/order-storage";
import { verifyOrderReceiptToken } from "@/lib/order-receipt-auth";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Payment confirmation", description: "Your verified TREVORA payment receipt." };

export default async function Page() {
  const token = cookies().get("trevora-order-receipt")?.value;
  const orderId = token ? verifyOrderReceiptToken(token) : null;
  const order = orderId ? await getOrderByRazorpayId(orderId).catch(() => null) : null;
  return <CheckoutConfirmationPage order={order}/>;
}
