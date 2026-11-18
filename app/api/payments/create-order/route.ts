import { NextResponse } from "next/server";
import { products } from "@/lib/products";
import { SHIPPING_CHARGE, type CustomerDetails, type PaymentMethod } from "@/lib/checkout";
import { getRazorpayClient, getRazorpayKeyId } from "@/lib/razorpay-server";

export const runtime = "nodejs";

type RequestedItem = { productId: string; quantity: number; size: string };
type RequestBody = { items: RequestedItem[]; customer: CustomerDetails; paymentMethod: PaymentMethod };

function isCustomer(value: unknown): value is CustomerDetails {
  if (!value || typeof value !== "object") return false;
  const customer = value as Record<string, unknown>;
  return ["fullName", "mobile", "email", "address", "city", "state", "pinCode"]
    .every(field => typeof customer[field] === "string" && customer[field].trim().length > 0)
    && /^[6-9]\d{9}$/.test(customer.mobile as string)
    && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email as string)
    && /^\d{6}$/.test(customer.pinCode as string);
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
    if (!rawItem || typeof rawItem.productId !== "string" || typeof rawItem.size !== "string" || !Number.isInteger(rawItem.quantity) || rawItem.quantity < 1 || rawItem.quantity > 20) {
      return NextResponse.json({ error: "One or more cart items are invalid." }, { status: 400 });
    }
    const product = products.find(candidate => candidate.id === rawItem.productId);
    if (!product) return NextResponse.json({ error: "A product in your cart is no longer available." }, { status: 400 });
    normalizedItems.push({ productId: product.id, name: product.name, quantity: rawItem.quantity, size: rawItem.size, unitPrice: product.price });
  }

  // Prices come from the server catalogue; client-supplied prices/totals are never accepted.
  const subtotal = normalizedItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const amountPaise = Math.round((subtotal + SHIPPING_CHARGE) * 100);
  try {
    const razorpay = getRazorpayClient();
    const order = await razorpay.orders.create({
      amount: amountPaise,
      currency: "INR",
      receipt: `trv_${crypto.randomUUID().replace(/-/g, "").slice(0, 20)}`,
      notes: { item_count: String(normalizedItems.reduce((sum, item) => sum + item.quantity, 0)) }
    });
    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: getRazorpayKeyId(),
      subtotal,
      shipping: SHIPPING_CHARGE,
      total: amountPaise / 100,
      items: normalizedItems
    });
  } catch (error) {
    console.error("Razorpay order creation failed", error);
    const configured = Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
    return NextResponse.json({ error: configured ? "We could not create your payment order. Please try again." : "Online payments are not configured yet. Please contact TREVORA support." }, { status: configured ? 502 : 503 });
  }
}
