import type { CheckoutOrder, CustomerDetails, PaymentMethod } from "@/lib/checkout";
import type { Product } from "@/lib/products";

export type CheckoutLineItem = { product: Product; quantity: number; size: string };

export function createCheckoutRecord(
  razorpayOrderId: string,
  razorpayPaymentId: string,
  customer: CustomerDetails,
  items: CheckoutLineItem[],
  shipping: number,
  paymentMethod: PaymentMethod,
): CheckoutOrder {
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  return {
    reference: razorpayOrderId,
    paymentId: razorpayPaymentId,
    paymentStatus: "verified",
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
