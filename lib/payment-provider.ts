import type { CheckoutOrder, CustomerDetails, PaymentMethod } from "@/lib/checkout";
import type { Product } from "@/lib/products";

export type CheckoutLineItem = { product: Product; quantity: number; size: string };
export type PaymentInitialization = {
  status: "pending-integration";
  reference: string;
  message: string;
};

/**
 * Provider boundary for a future payment gateway (for example, Razorpay).
 * Implementations must create server-verified payment sessions; never mark a
 * payment as successful in the browser. The current adapter is intentionally
 * a safe placeholder and does not submit orders or collect payment.
 */
export interface PaymentProvider {
  initialize(input: { customer: CustomerDetails; items: CheckoutLineItem[]; paymentMethod: PaymentMethod; total: number }): Promise<PaymentInitialization>;
}

export const paymentProvider: PaymentProvider = {
  async initialize() {
    const uuid = typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID().replace(/-/g, "").slice(0, 10).toUpperCase()
      : Math.random().toString(36).slice(2, 12).toUpperCase();
    return {
      status: "pending-integration",
      reference: `TR-${uuid}`,
      message: "Payment integration is pending. No order has been placed and no payment has been taken."
    };
  }
};

export function createCheckoutRecord(
  reference: string,
  customer: CustomerDetails,
  items: CheckoutLineItem[],
  shipping: number,
  paymentMethod: PaymentMethod,
): CheckoutOrder {
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  return {
    reference,
    customer,
    items: items.map(({ product, quantity, size }) => ({
      productId: product.id,
      name: product.name,
      quantity,
      size,
      unitPrice: product.price,
      lineTotal: product.price * quantity
    })),
    subtotal,
    shipping,
    total: subtotal + shipping,
    paymentMethod,
    createdAt: new Date().toISOString()
  };
}
