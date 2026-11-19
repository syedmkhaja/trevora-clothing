import type { Metadata } from "next";
import { cookies } from "next/headers";
import CheckoutConfirmationPage from "@/components/checkout-confirmation";
import { getCODOrderById, getOrderByRazorpayId } from "@/lib/order-storage";
import { verifyOrderReceiptToken } from "@/lib/order-receipt-auth";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Order confirmation", description: "Your TREVORA order confirmation." };

export default async function Page() {
  const receiptCookies = cookies();
  const codId = receiptCookies.get("trevora-cod-receipt")?.value;
  const codOrder = codId && /^TRV-COD-[A-Z0-9]+$/.test(codId) ? await getCODOrderById(codId).catch(() => null) : null;
  if (codOrder) return <CheckoutConfirmationPage order={codOrder}/>;

  const token = receiptCookies.get("trevora-order-receipt")?.value;
  const orderId = token ? verifyOrderReceiptToken(token) : null;
  const order = orderId ? await getOrderByRazorpayId(orderId).catch(() => null) : null;
  return <CheckoutConfirmationPage order={order}/>;
}
