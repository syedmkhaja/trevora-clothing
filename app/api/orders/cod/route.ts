import { NextResponse } from "next/server";
import { products } from "@/lib/products";
import { SHIPPING_CHARGE, type CustomerDetails } from "@/lib/checkout";
import { createCODOrder } from "@/lib/order-storage";

export const runtime = "nodejs";

type RequestedItem = { productId: string; quantity: number; size: string };
type RequestBody = { items: RequestedItem[]; customer: CustomerDetails };

function isCustomer(value: unknown): value is CustomerDetails {
  if (!value || typeof value !== "object") return false;
  const customer = value as Record<string, unknown>;
  return ["fullName", "mobile", "email", "address", "city", "state", "pinCode"]
    .every(field => typeof customer[field] === "string" && (customer[field] as string).trim().length > 0)
    && (customer.fullName as string).trim().length <= 120
    && /^[6-9]\d{9}$/.test((customer.mobile as string).trim())
    && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((customer.email as string).trim())
    && (customer.address as string).trim().length <= 500
    && /^\d{6}$/.test((customer.pinCode as string).trim());
}

export async function POST(request: Request) {
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid request body." }, { status: 400 }); }
  if (!body || typeof body !== "object") return NextResponse.json({ error: "Invalid checkout details." }, { status: 400 });
  const data = body as Partial<RequestBody>;
  if (!isCustomer(data.customer) || !Array.isArray(data.items) || data.items.length < 1 || data.items.length > 30) {
    return NextResponse.json({ error: "Please provide valid delivery details and cart items." }, { status: 400 });
  }

  const headerKey = request.headers.get("x-cod-idempotency-key")?.trim();
  if (!headerKey || !/^[A-Za-z0-9-]{16,100}$/.test(headerKey)) {
    return NextResponse.json({ error: "Missing or invalid order submission token. Refresh checkout and try again." }, { status: 400 });
  }

  const normalizedItems: { productId: string; name: string; quantity: number; size: string; unitPrice: number }[] = [];
  for (const rawItem of data.items) {
    if (!rawItem || typeof rawItem.productId !== "string" || typeof rawItem.size !== "string" || !["XS", "S", "M", "L", "XL", "One Size"].includes(rawItem.size) || !Number.isInteger(rawItem.quantity) || rawItem.quantity < 1 || rawItem.quantity > 20) {
      return NextResponse.json({ error: "One or more cart items are invalid." }, { status: 400 });
    }
    const product = products.find(candidate => candidate.id === rawItem.productId);
    if (!product) return NextResponse.json({ error: "A product in your cart is no longer available." }, { status: 400 });
    normalizedItems.push({ productId: product.id, name: product.name, quantity: rawItem.quantity, size: rawItem.size, unitPrice: product.price });
  }

  const subtotalPaise = normalizedItems.reduce((sum, item) => sum + Math.round(item.unitPrice * 100) * item.quantity, 0);
  const shippingPaise = Math.round(SHIPPING_CHARGE * 100);
  const amountPaise = subtotalPaise + shippingPaise;
  const orderId = `TRV-COD-${crypto.randomUUID().replace(/-/g, "").slice(0, 16).toUpperCase()}`;

  try {
    const order = await createCODOrder({ orderId, idempotencyKey: headerKey, customer: data.customer, products: normalizedItems, subtotalPaise, shippingPaise, amountPaise });
    const response = NextResponse.json({ orderId: order.reference, order });
    response.cookies.set("trevora-cod-receipt", order.reference, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/checkout/confirmation",
      maxAge: 60 * 60 * 24 * 7
    });
    return response;
  } catch (error) {
    const details = error as { name?: unknown; code?: unknown; constraint?: unknown };
    console.error("COD order persistence failed", {
      errorName: typeof details?.name === "string" ? details.name : "UnknownError",
      databaseCode: typeof details?.code === "string" ? details.code : undefined,
      constraint: typeof details?.constraint === "string" ? details.constraint : undefined,
      databaseConfigured: Boolean(process.env.DATABASE_URL)
    });
    return NextResponse.json({ error: "We could not record your COD order. Please try again or contact support." }, { status: 502 });
  }
}
