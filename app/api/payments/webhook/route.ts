import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { recordCapturedPayment } from "@/lib/order-storage";
import { getRazorpayClient } from "@/lib/razorpay-server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!webhookSecret) return NextResponse.json({ error: "Webhook is not configured." }, { status: 503 });
  const signature = request.headers.get("x-razorpay-signature");
  if (!signature || !/^[a-f\d]{64}$/i.test(signature)) return NextResponse.json({ error: "Invalid webhook signature." }, { status: 400 });

  const rawBody = await request.text();
  const expected = createHmac("sha256", webhookSecret).update(rawBody).digest();
  const received = Buffer.from(signature, "hex");
  if (received.length !== expected.length || !timingSafeEqual(expected, received)) {
    return NextResponse.json({ error: "Webhook signature verification failed." }, { status: 400 });
  }

  let event: { event?: string; payload?: { payment?: { entity?: { id?: string; order_id?: string; amount?: number; currency?: string } } } };
  try { event = JSON.parse(rawBody) as typeof event; } catch {
    return NextResponse.json({ error: "Invalid webhook body." }, { status: 400 });
  }
  if (event.event !== "payment.captured") return NextResponse.json({ received: true });
  const payment = event.payload?.payment?.entity;
  if (!payment || typeof payment.id !== "string" || typeof payment.order_id !== "string" || !Number.isInteger(payment.amount) || typeof payment.currency !== "string") {
    return NextResponse.json({ error: "Webhook payment payload is incomplete." }, { status: 400 });
  }

  try {
    // Re-fetch provider state instead of trusting the webhook payload alone.
    const client = getRazorpayClient();
    const [verifiedPayment, order] = await Promise.all([client.payments.fetch(payment.id), client.orders.fetch(payment.order_id)]);
    if (verifiedPayment.order_id !== order.id || verifiedPayment.amount !== order.amount || verifiedPayment.currency !== "INR" || verifiedPayment.status !== "captured") {
      return NextResponse.json({ error: "Provider payment state does not match the webhook." }, { status: 400 });
    }
    await recordCapturedPayment({ orderId: order.id, paymentId: verifiedPayment.id, amountPaise: verifiedPayment.amount, currency: verifiedPayment.currency });
    return NextResponse.json({ received: true, recorded: true });
  } catch (error) {
    console.error("Razorpay webhook order persistence failed", error);
    return NextResponse.json({ error: "Payment event could not be recorded; Razorpay will retry the webhook." }, { status: 500 });
  }
}
