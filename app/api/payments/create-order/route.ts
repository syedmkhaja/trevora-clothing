import { NextResponse } from "next/server";
import { products } from "@/lib/products";
import { SHIPPING_CHARGE, type CustomerDetails, type PaymentMethod } from "@/lib/checkout";
import { savePaymentAttempt } from "@/lib/order-storage";
import { getRazorpayClient, getRazorpayKeyId } from "@/lib/razorpay-server";

export const runtime = "nodejs";

type RequestedItem = { productId: string; quantity: number; size: string };
type RequestBody = { items: RequestedItem[]; customer: CustomerDetails; paymentMethod: PaymentMethod };

function isCustomer(value: unknown): value is CustomerDetails {
  if (!value || typeof value !== "object") return false;
  const customer = value as Record<string, unknown>;
  return ["fullName", "mobile", "email", "address", "city", "state", "pinCode"]
    .every(field => typeof customer[field] === "string" && (customer[field] as string).trim().length > 0)
    && (customer.fullName as string).length <= 120
    && /^[6-9]\d{9}$/.test(customer.mobile as string)
    && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email as string)
    && /^\d{6}$/.test(customer.pinCode as string)
    && (customer.address as string).length <= 500;
}

export async function POST(request: Request) {
  let body: unknown;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
  if (!body || typeof body !== "object") return NextResponse.json({ error: "Invalid checkout details." }, { status: 400 });
  const data = body as Partial<RequestBody>;
  if (!isCustomer(data.customer) || !Array.isArray(data.items) || data.items.length < 1 || data.items.length > 30) {
    return NextResponse.json({ error: "Please provide valid delivery details and cart items." }, { status: 400 });
  }
  if (!["upi", "card", "netbanking"].includes(String(data.paymentMethod))) {
    return NextResponse.json({ error: "This payment method is not available for online checkout." }, { status: 400 });
  }

  const normalizedItems: { productId: string; name: string; quantity: number; size: string; unitPrice: number }[] = [];
  for (const rawItem of data.items) {
    if (!rawItem || typeof rawItem.productId !== "string" || !Number.isInteger(rawItem.quantity) || rawItem.quantity < 1 || rawItem.quantity > 20) {
      return NextResponse.json({ error: "One or more cart items are invalid." }, { status: 400 });
    }
    const product = products.find(candidate => candidate.id === rawItem.productId);
    if (!product || !product.sizes.includes(rawItem.size as typeof product.sizes[number])) {
      return NextResponse.json({ error: "A product or size in your cart is no longer available." }, { status: 400 });
    }
    normalizedItems.push({ productId: product.id, name: product.name, quantity: rawItem.quantity, size: rawItem.size, unitPrice: product.price });
  }

  const subtotal = normalizedItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const subtotalPaise = Math.round(subtotal * 100);
  const shippingPaise = Math.round(SHIPPING_CHARGE * 100);
  const amountPaise = subtotalPaise + shippingPaise;
  try {
    const razorpay = getRazorpayClient();
    const order = await razorpay.orders.create({
      amount: amountPaise,
      currency: "INR",
      receipt: `trv_${crypto.randomUUID().replace(/-/g, "").slice(0, 20)}`,
      notes: { item_count: String(normalizedItems.reduce((sum, item) => sum + item.quantity, 0)) }
    });
    await savePaymentAttempt({
      orderId: order.id,
      customer: data.customer,
      products: normalizedItems,
      subtotalPaise,
      shippingPaise,
      amountPaise,
      paymentMethod: data.paymentMethod as Exclude<PaymentMethod, "cod">
    });
    return NextResponse.json({ orderId: order.id, amount: amountPaise, currency: "INR", keyId: getRazorpayKeyId() });
  } catch (error) {
    console.error("Razorpay order creation or checkout persistence failed", error);
    const configured = Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET && process.env.DATABASE_URL);
    return NextResponse.json({ error: configured ? "We could not prepare your payment order. Please try again." : "Online checkout storage or payment is not configured. Please contact TREVORA support." }, { status: configured ? 502 : 503 });
  }
}
