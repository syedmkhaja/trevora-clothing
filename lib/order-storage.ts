import "server-only";

import postgres from "postgres";
import type { CheckoutOrder, CustomerDetails, PaymentMethod } from "@/lib/checkout";

export type OrderProduct = { productId: string; name: string; quantity: number; size: string; unitPrice: number };
export type PaymentAttempt = {
  orderId: string;
  customer: CustomerDetails;
  products: OrderProduct[];
  subtotalPaise: number;
  shippingPaise: number;
  amountPaise: number;
  paymentMethod: Exclude<PaymentMethod, "cod">;
};

let sqlClient: ReturnType<typeof postgres> | undefined;
let schemaPromise: Promise<void> | undefined;

function db() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not configured.");
  if (!sqlClient) sqlClient = postgres(url, { max: 1, idle_timeout: 20, connect_timeout: 10, prepare: false, ssl: "require" });
  return sqlClient;
}

async function ensureSchema() {
  if (!schemaPromise) {
    schemaPromise = (async () => {
      const client = db();
      await client`CREATE TABLE IF NOT EXISTS trevora_payment_attempts (
        razorpay_order_id TEXT PRIMARY KEY,
        customer_name TEXT NOT NULL,
        phone TEXT NOT NULL,
        email TEXT NOT NULL,
        address TEXT NOT NULL,
        city TEXT NOT NULL,
        state TEXT NOT NULL,
        pin_code TEXT NOT NULL,
        products JSONB NOT NULL,
        subtotal_paise BIGINT NOT NULL,
        shipping_paise BIGINT NOT NULL,
        amount_paise BIGINT NOT NULL,
        payment_method TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        payment_status TEXT NOT NULL DEFAULT 'pending'
      )`;
      await client`CREATE TABLE IF NOT EXISTS trevora_orders (
        id BIGSERIAL PRIMARY KEY,
        razorpay_order_id TEXT NOT NULL UNIQUE,
        razorpay_payment_id TEXT NOT NULL UNIQUE,
        customer_name TEXT NOT NULL,
        phone TEXT NOT NULL,
        email TEXT NOT NULL,
        address TEXT NOT NULL,
        city TEXT NOT NULL,
        state TEXT NOT NULL,
        pin_code TEXT NOT NULL,
        products JSONB NOT NULL,
        subtotal_paise BIGINT NOT NULL,
        shipping_paise BIGINT NOT NULL,
        amount_paise BIGINT NOT NULL,
        payment_status TEXT NOT NULL CHECK (payment_status = 'captured'),
        payment_method TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )`;
    })().catch(error => { schemaPromise = undefined; throw error; });
  }
  await schemaPromise;
}

export async function savePaymentAttempt(attempt: PaymentAttempt): Promise<void> {
  await ensureSchema();
  const client = db();
  const { customer, products } = attempt;
  await client`INSERT INTO trevora_payment_attempts (
    razorpay_order_id, customer_name, phone, email, address, city, state, pin_code,
    products, subtotal_paise, shipping_paise, amount_paise, payment_method
  ) VALUES (
    ${attempt.orderId}, ${customer.fullName}, ${customer.mobile}, ${customer.email},
    ${customer.address}, ${customer.city}, ${customer.state}, ${customer.pinCode},
    ${JSON.stringify(products)}::jsonb, ${attempt.subtotalPaise}, ${attempt.shippingPaise},
    ${attempt.amountPaise}, ${attempt.paymentMethod}
  ) ON CONFLICT (razorpay_order_id) DO NOTHING`;
}

type VerifyPaymentInput = { orderId: string; paymentId: string; amountPaise: number; currency: string };
export async function recordCapturedPayment(input: VerifyPaymentInput): Promise<CheckoutOrder> {
  await ensureSchema();
  const client = db();
  return client.begin(async transaction => {
    const [attempt] = await transaction`SELECT * FROM trevora_payment_attempts WHERE razorpay_order_id = ${input.orderId} FOR UPDATE`;
    if (!attempt) throw new Error("No matching checkout attempt exists for this payment.");
    if (input.currency !== "INR" || Number(attempt.amount_paise) !== input.amountPaise) {
      throw new Error("Verified payment amount or currency does not match the checkout.");
    }

    const [created] = await transaction`INSERT INTO trevora_orders (
      razorpay_order_id, razorpay_payment_id, customer_name, phone, email, address,
      city, state, pin_code, products, subtotal_paise, shipping_paise, amount_paise,
      payment_status, payment_method
    ) VALUES (
      ${input.orderId}, ${input.paymentId}, ${attempt.customer_name}, ${attempt.phone},
      ${attempt.email}, ${attempt.address}, ${attempt.city}, ${attempt.state},
      ${attempt.pin_code}, ${JSON.stringify(attempt.products)}::jsonb,
      ${attempt.subtotal_paise}, ${attempt.shipping_paise}, ${attempt.amount_paise},
      'captured', ${attempt.payment_method}
    ) ON CONFLICT DO NOTHING RETURNING *`;

    let order = created;
    if (!order) {
      const [existing] = await transaction`SELECT * FROM trevora_orders WHERE razorpay_order_id = ${input.orderId} OR razorpay_payment_id = ${input.paymentId} LIMIT 1`;
      if (!existing || existing.razorpay_order_id !== input.orderId || existing.razorpay_payment_id !== input.paymentId) {
        throw new Error("A conflicting order already exists for this payment.");
      }
      order = existing;
    }
    await transaction`UPDATE trevora_payment_attempts SET payment_status = 'captured' WHERE razorpay_order_id = ${input.orderId}`;

    const customer: CustomerDetails = {
      fullName: order.customer_name,
      mobile: order.phone,
      email: order.email,
      address: order.address,
      city: order.city,
      state: order.state,
      pinCode: order.pin_code
    };
    const products = order.products as OrderProduct[];
    const subtotal = Number(order.subtotal_paise) / 100;
    const shipping = Number(order.shipping_paise) / 100;
    return {
      reference: order.razorpay_order_id,
      paymentId: order.razorpay_payment_id,
      paymentStatus: "verified",
      customer,
      items: products.map(product => ({ ...product, lineTotal: product.unitPrice * product.quantity })),
      subtotal,
      shipping,
      total: Number(order.amount_paise) / 100,
      paymentMethod: order.payment_method as PaymentMethod,
      createdAt: new Date(order.created_at).toISOString()
    };
  });
}
