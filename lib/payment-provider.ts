import type { CheckoutOrder } from "@/lib/checkout";

export type CheckoutLineItem = {
  product: { id: string; name: string; price: number };
  quantity: number;
  size: string;
};

/** Build a view model from the server-verified durable order response. */
export function checkoutOrderFromResponse(order: CheckoutOrder): CheckoutOrder {
  return order;
}
