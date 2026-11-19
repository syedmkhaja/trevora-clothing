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

export type CODOrderInput = {
  orderId: string;
  idempotencyKey: string;
  customer: CustomerDetails;
  products: OrderProduct[];
  subtotalPaise: number;
  shippingPaise: number;
  amountPaise: number;
};

type StoredOrder = {
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
  cod_order_id: string | null;
  order_status: string | null;
  customer_name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pin_code: string;
  products: OrderProduct[];
  subtotal_paise: string | number;
  shipping_paise: string | number;
  amount_paise: string | number;
  payment_status: "captured" | "pending";
  payment_method: PaymentMethod;
  created_at: Date | string;
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
        razorpay_order_id TEXT PRIMARY KEY, customer_name TEXT NOT NULL, phone TEXT NOT NULL,
        email TEXT NOT NULL, address TEXT NOT NULL, city TEXT NOT NULL, state TEXT NOT NULL,
        pin_code TEXT NOT NULL, products JSONB NOT NULL, subtotal_paise BIGINT NOT NULL,
        shipping_paise BIGINT NOT NULL, amount_paise BIGINT NOT NULL, payment_method TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), payment_status TEXT NOT NULL DEFAULT 'pending'
      )`;
      await client`CREATE TABLE IF NOT EXISTS trevora_orders (
        id BIGSERIAL PRIMARY KEY, razorpay_order_id TEXT UNIQUE, razorpay_payment_id TEXT UNIQUE,
        customer_name TEXT NOT NULL, phone TEXT NOT NULL, email TEXT NOT NULL, address TEXT NOT NULL,
        city TEXT NOT NULL, state TEXT NOT NULL, pin_code TEXT NOT NULL, products JSONB NOT NULL,
        subtotal_paise BIGINT NOT NULL, shipping_paise BIGINT NOT NULL, amount_paise BIGINT NOT NULL,
        payment_status TEXT NOT NULL, payment_method TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )`;
      await client`ALTER TABLE trevora_orders ADD COLUMN IF NOT EXISTS cod_order_id TEXT UNIQUE`;
      await client`ALTER TABLE trevora_orders ADD COLUMN IF NOT EXISTS order_status TEXT`;
      await client`ALTER TABLE trevora_orders ADD COLUMN IF NOT EXISTS idempotency_key TEXT UNIQUE`;
      await client`ALTER TABLE trevora_orders ALTER COLUMN razorpay_order_id DROP NOT NULL`;
      await client`ALTER TABLE trevora_orders ALTER COLUMN razorpay_payment_id DROP NOT NULL`;
      await client`ALTER TABLE trevora_orders DROP CONSTRAINT IF EXISTS trevora_orders_payment_status_check`;
      await client`ALTER TABLE trevora_orders ADD CONSTRAINT trevora_orders_payment_status_check CHECK (payment_status IN ('captured', 'pending'))`;
    })().catch(error => { schemaPromise = undefined; throw error; });
  }
  await schemaPromise;
}

export async function savePaymentAttempt(attempt: PaymentAttempt): Promise<void> {
  await ensureSchema();
  const { customer, products } = attempt;
  await db()`INSERT INTO trevora_payment_attempts (
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
function toCheckoutOrder(order: StoredOrder): CheckoutOrder {
  const customer: CustomerDetails = { fullName: order.customer_name, mobile: order.phone, email: order.email, address: order.address, city: order.city, state: order.state, pinCode: order.pin_code };
  const products = order.products;
  const isCOD = order.payment_method === "cod";
  return {
    reference: isCOD && order.cod_order_id ? order.cod_order_id : (order.razorpay_order_id ?? ""),
    paymentId: order.razorpay_payment_id ?? "",
    paymentStatus: isCOD ? "pending" : "verified",
    orderStatus: isCOD ? "COD Order" : undefined,
    customer,
    items: products.map(product => ({ ...product, lineTotal: product.unitPrice * product.quantity })),
    subtotal: Number(order.subtotal_paise) / 100,
    shipping: Number(order.shipping_paise) / 100,
    total: Number(order.amount_paise) / 100,
    paymentMethod: order.payment_method,
    createdAt: new Date(order.created_at).toISOString()
  };
}

export async function recordCapturedPayment(input: VerifyPaymentInput): Promise<CheckoutOrder> {
  await ensureSchema();
  const client = db();
  return client.begin(async transaction => {
    const [attempt] = await transaction`SELECT * FROM trevora_payment_attempts WHERE razorpay_order_id = ${input.orderId} FOR UPDATE`;
    if (!attempt) throw new Error("No matching checkout attempt exists for this payment.");
    if (input.currency !== "INR" || Number(attempt.amount_paise) !== input.amountPaise) throw new Error("Verified payment amount or currency does not match the checkout.");
    const [created] = await transaction`INSERT INTO trevora_orders (
      razorpay_order_id, razorpay_payment_id, cod_order_id, order_status, customer_name, phone, email, address,
      city, state, pin_code, products, subtotal_paise, shipping_paise, amount_paise, payment_status, payment_method
    ) VALUES (
      ${input.orderId}, ${input.paymentId}, NULL, NULL, ${attempt.customer_name}, ${attempt.phone}, ${attempt.email}, ${attempt.address},
      ${attempt.city}, ${attempt.state}, ${attempt.pin_code}, ${JSON.stringify(attempt.products)}::jsonb,
      ${attempt.subtotal_paise}, ${attempt.shipping_paise}, ${attempt.amount_paise}, 'captured', ${attempt.payment_method}
    ) ON CONFLICT DO NOTHING RETURNING *`;
    let order = created as StoredOrder | undefined;
    if (!order) {
      const [existing] = await transaction`SELECT * FROM trevora_orders WHERE razorpay_order_id = ${input.orderId} OR razorpay_payment_id = ${input.paymentId} LIMIT 1`;
      if (!existing || existing.razorpay_order_id !== input.orderId || existing.razorpay_payment_id !== input.paymentId) throw new Error("A conflicting order already exists for this payment.");
      order = existing as StoredOrder;
    }
    await transaction`UPDATE trevora_payment_attempts SET payment_status = 'captured' WHERE razorpay_order_id = ${input.orderId}`;
    return toCheckoutOrder(order);
  });
}

export async function createCODOrder(input: CODOrderInput): Promise<CheckoutOrder> {
  await ensureSchema();
  const client = db();
  return client.begin(async transaction => {
    const [existing] = await transaction`SELECT * FROM trevora_orders WHERE idempotency_key = ${input.idempotencyKey} OR cod_order_id = ${input.orderId} LIMIT 1`;
    if (existing) return toCheckoutOrder(existing as StoredOrder);
    const [created] = await transaction`INSERT INTO trevora_orders (
      razorpay_order_id, razorpay_payment_id, cod_order_id, order_status, customer_name, phone, email, address,
      city, state, pin_code, products, subtotal_paise, shipping_paise, amount_paise,
      payment_status, payment_method, idempotency_key
    ) VALUES (
      NULL, NULL, ${input.orderId}, 'COD Order', ${input.customer.fullName}, ${input.customer.mobile}, ${input.customer.email},
      ${input.customer.address}, ${input.customer.city}, ${input.customer.state}, ${input.customer.pinCode},
      ${JSON.stringify(input.products)}::jsonb, ${input.subtotalPaise}, ${input.shippingPaise}, ${input.amountPaise},
      'pending', 'cod', ${input.idempotencyKey}
    ) ON CONFLICT DO NOTHING RETURNING *`;
    if (created) return toCheckoutOrder(created as StoredOrder);
    const [retried] = await transaction`SELECT * FROM trevora_orders WHERE cod_order_id = ${input.orderId} OR idempotency_key = ${input.idempotencyKey} LIMIT 1`;
    if (!retried) throw new Error("COD order could not be recorded after a uniqueness conflict.");
    return toCheckoutOrder(retried as StoredOrder);
  });
}

export async function getOrderByRazorpayId(orderId: string): Promise<CheckoutOrder | null> {
  await ensureSchema();
  const [order] = await db()`SELECT * FROM trevora_orders WHERE razorpay_order_id = ${orderId} AND payment_status = 'captured' LIMIT 1`;
  return order ? toCheckoutOrder(order as StoredOrder) : null;
}

export async function getCODOrderById(orderId: string): Promise<CheckoutOrder | null> {
  await ensureSchema();
  const [order] = await db()`SELECT * FROM trevora_orders WHERE cod_order_id = ${orderId} AND payment_method = 'cod' LIMIT 1`;
  return order ? toCheckoutOrder(order as StoredOrder) : null;
}
