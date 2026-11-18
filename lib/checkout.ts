export type PaymentMethod = "upi" | "card" | "netbanking" | "cod";

export type CustomerDetails = {
  fullName: string;
  mobile: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pinCode: string;
};

export type CheckoutOrder = {
  reference: string;
  customer: CustomerDetails;
  items: { productId: string; name: string; quantity: number; size: string; unitPrice: number; lineTotal: number }[];
  subtotal: number;
  shipping: number;
  total: number;
  paymentMethod: PaymentMethod;
  createdAt: string;
};

export const SHIPPING_CHARGE = 9.99;

export const paymentMethodLabels: Record<PaymentMethod, string> = {
  upi: "UPI",
  card: "Credit / Debit Card",
  netbanking: "Net Banking",
  cod: "Cash on Delivery"
};
