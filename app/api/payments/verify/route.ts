import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { getRazorpayClient } from "@/lib/razorpay-server";

export const runtime = "nodejs";

type VerificationBody = { razorpay_order_id?: unknown; razorpay_payment_id?: unknown; razorpay_signature?: unknown };

export async function POST(request: Request) {
  let body: VerificationBody;
  try { body = await request.json() as VerificationBody; } catch {
    return NextResponse.json({ error: "Invalid verification request." }, { status: 400 });
  }
  const orderId = body.razorpay_order_id;
  const paymentId = body.razorpay_payment_id;
  const signature = body.razorpay_signature;
  if (typeof orderId !== "string" || typeof paymentId !== "string" || typeof signature !== "string" || !/^[a-f\d]{64}$/i.test(signature)) {
    return NextResponse.json({ error: "Payment verification details are invalid." }, { status: 400 });
  }

  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) return NextResponse.json({ error: "Online payments are not configured." }, { status: 503 });
  const expected = createHmac("sha256", secret).update(`${orderId}|${paymentId}`).digest();
  const received = Buffer.from(signature, "hex");
  if (received.length !== expected.length || !timingSafeEqual(received, expected)) {
    return NextResponse.json({ error: "Payment signature verification failed." }, { status: 400 });
  }

  try {
    const razorpay = getRazorpayClient();
    const [payment, order] = await Promise.all([
      razorpay.payments.fetch(paymentId),
      razorpay.orders.fetch(orderId)
    ]);
    if (payment.order_id !== orderId || order.id !== orderId || payment.amount !== order.amount || payment.currency !== "INR" || order.currency !== "INR") {
      return NextResponse.json({ error: "Payment details do not match the created order." }, { status: 400 });
    }
    if (payment.status !== "captured" && payment.captured !== true) {
      return NextResponse.json({ error: "Payment is not captured yet. Please check your payment status before retrying." }, { status: 409 });
    }
    return NextResponse.json({ verified: true, orderId, paymentId, amount: payment.amount, currency: payment.currency });
  } catch (error) {
    console.error("Razorpay payment verification failed", error);
    return NextResponse.json({ error: "We could not verify this payment. Please contact support before retrying." }, { status: 502 });
  }
}
