"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowLeft, CreditCard, Landmark, Smartphone, WalletCards } from "lucide-react";
import { useCart } from "@/components/cart-context";
import type { CartItem } from "@/components/cart-context";
import { formatINR, paymentMethodLabels, SHIPPING_CHARGE, type CheckoutOrder, type CustomerDetails, type PaymentMethod } from "@/lib/checkout";

type RazorpaySuccess = { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string };
type RazorpayOptions = {
  key: string; amount: number; currency: "INR"; name: string; description: string; order_id: string;
  prefill: { name: string; email: string; contact: string };
  method: { upi: boolean; card: boolean; netbanking: boolean };
  theme: { color: string };
  handler: (response: RazorpaySuccess) => void | Promise<void>;
  modal: { ondismiss: () => void };
};
type RazorpayInstance = { open: () => void; on: (event: string, handler: (response: { error?: { description?: string } }) => void) => void };
type RazorpayConstructor = new (options: RazorpayOptions) => RazorpayInstance;
declare global { interface Window { Razorpay?: RazorpayConstructor } }

type PaymentState = "success" | "failed" | "cancelled" | "order-error" | null;
type CreateOrderResponse = { orderId: string; amount: number; currency: "INR"; keyId: string };
type ApiError = { error?: string };
type Errors = Partial<Record<keyof CustomerDetails, string>>;

const initialCustomer: CustomerDetails = { fullName: "", mobile: "", email: "", address: "", city: "", state: "", pinCode: "" };
const paymentMethods: { id: PaymentMethod; icon: typeof Smartphone; detail: string }[] = [
  { id: "upi", icon: Smartphone, detail: "UPI apps including BHIM, PhonePe and Google Pay" },
  { id: "card", icon: CreditCard, detail: "Credit and debit cards" },
  { id: "netbanking", icon: Landmark, detail: "Major Indian banks" },
  { id: "cod", icon: WalletCards, detail: "Pay in cash when your order is delivered" }
];

function loadRazorpay(): Promise<boolean> {
  if (typeof window === "undefined") return Promise.resolve(false);
  if (window.Razorpay) return Promise.resolve(true);
  return new Promise(resolve => {
    const existing = document.querySelector<HTMLScriptElement>("script[data-razorpay-checkout]");
    if (existing) {
      existing.addEventListener("load", () => resolve(Boolean(window.Razorpay)), { once: true });
      existing.addEventListener("error", () => resolve(false), { once: true });
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.dataset.razorpayCheckout = "true";
    script.onload = () => resolve(Boolean(window.Razorpay));
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

async function readJson<T>(response: Response): Promise<T> { return response.json() as Promise<T>; }

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart();
  const router = useRouter();
  const lock = useRef(false);
  const codIdempotencyKey = useRef("");
  const [customer, setCustomer] = useState(initialCustomer);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("upi");
  const [errors, setErrors] = useState<Errors>({});
  const [paymentState, setPaymentState] = useState<PaymentState>(null);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const finalTotal = total + SHIPPING_CHARGE;

  function updateField(field: keyof CustomerDetails, value: string) {
    setCustomer(current => ({ ...current, [field]: value }));
    setErrors(current => ({ ...current, [field]: "" }));
  }

  function validate(): Errors {
    const next: Errors = {};
    if (customer.fullName.trim().length < 2) next.fullName = "Please enter your full name.";
    if (!/^[6-9]\d{9}$/.test(customer.mobile.trim())) next.mobile = "Enter a valid 10-digit Indian mobile number.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email.trim())) next.email = "Enter a valid email address.";
    if (customer.address.trim().length < 8) next.address = "Please enter your complete delivery address.";
    if (!customer.city.trim()) next.city = "Please enter your city.";
    if (!customer.state.trim()) next.state = "Please enter your state.";
    if (!/^\d{6}$/.test(customer.pinCode.trim())) next.pinCode = "Enter a valid 6-digit Indian PIN code.";
    return next;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (lock.current || !items.length) return;
    setPaymentState(null);
    setMessage("");

    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length) {
      setMessage("Please correct the highlighted details to continue.");
      return;
    }

    lock.current = true;
    setSubmitting(true);
    let checkoutOpened = false;

    // COD is persisted through the store's order API and never initializes or opens Razorpay.
    if (paymentMethod === "cod") {
      try {
        if (!codIdempotencyKey.current) codIdempotencyKey.current = crypto.randomUUID();
        const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
        const response = await fetch("/api/orders/cod", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-cod-idempotency-key": codIdempotencyKey.current
          },
          body: JSON.stringify({
            customer,
            items: items.map((item: CartItem) => ({ productId: item.product.id, quantity: item.quantity, size: item.size })),
            subtotal,
            shipping: SHIPPING_CHARGE,
            total: subtotal + SHIPPING_CHARGE
          })
        });
        const result = await readJson<{ order?: CheckoutOrder; error?: string }>(response);
        if (!response.ok || !result.order || result.order.paymentMethod !== "cod") {
          setPaymentState("order-error");
          setMessage(result.error ?? "We could not confirm your COD order. Please contact support before placing another order.");
          return;
        }
        clearCart();
        setPaymentState("success");
        router.push("/checkout/confirmation");
      } catch {
        setPaymentState("order-error");
        setMessage("We could not confirm whether your COD order was recorded. Please check the order status or contact support before trying again.");
      } finally {
        setSubmitting(false);
        lock.current = false;
      }
      return;
    }

    try {
      if (!await loadRazorpay() || !window.Razorpay) throw new Error("Razorpay Checkout could not be loaded. Check your connection and try again.");
      const createResponse = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customer, paymentMethod, items: items.map((item: CartItem) => ({ productId: item.product.id, quantity: item.quantity, size: item.size })) })
      });
      const created = await readJson<CreateOrderResponse & ApiError>(createResponse);
      if (!createResponse.ok) {
        setPaymentState("order-error");
        setMessage(created.error ?? "We could not create your payment order. Please try again.");
        return;
      }

      const checkout = new window.Razorpay({
        key: created.keyId,
        amount: created.amount,
        currency: "INR",
        name: "TREVORA CLOTHING",
        description: "TREVORA streetwear order",
        order_id: created.orderId,
        prefill: { name: customer.fullName, email: customer.email, contact: customer.mobile },
        method: { upi: paymentMethod === "upi", card: paymentMethod === "card", netbanking: paymentMethod === "netbanking" },
        theme: { color: "#171816" },
        handler: async paymentResponse => {
          try {
            const response = await fetch("/api/payments/verify", {
              method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(paymentResponse)
            });
            const result = await readJson<{ verified?: boolean; error?: string; order?: CheckoutOrder }>(response);
            if (!response.ok || result.verified !== true || !result.order) {
              setPaymentState("failed");
              setMessage("Payment verification is unresolved. Check your order status or contact support before trying another payment.");
              return;
            }
            clearCart();
            setPaymentState("success");
            router.push("/checkout/confirmation");
          } catch {
            setPaymentState("failed");
            setMessage("Payment may have been captured, but verification could not be completed. Check your order status or contact support before trying another payment.");
          }
        },
        modal: { ondismiss: () => {
          setPaymentState("cancelled");
          setMessage("Payment was cancelled. Your cart is unchanged.");
          lock.current = false;
        } }
      });
      checkout.on("payment.failed", response => {
        setPaymentState("failed");
        setMessage(response.error?.description ?? "Payment failed. Your cart is unchanged; please retry.");
        lock.current = false;
      });
      checkout.open();
      checkoutOpened = true;
    } catch (error) {
      setPaymentState("order-error");
      setMessage(error instanceof Error ? error.message : "Unable to start checkout. Please try again.");
      lock.current = false;
    } finally {
      setSubmitting(false);
      if (!checkoutOpened) lock.current = false;
    }
  }

  if (!items.length) return <div className="container-wide flex min-h-[55vh] flex-col items-center justify-center py-16 text-center"><p className="eyebrow text-olive">Nothing to check out</p><h1 className="mt-4 font-display text-4xl">Your bag is empty.</h1><p className="mt-3 text-sm text-black/55">Add something to your bag before continuing.</p><Link href="/shop" className="mt-7 bg-ink px-6 py-4 text-[10px] uppercase tracking-widest text-paper transition hover:bg-olive">Continue shopping</Link></div>;

  const inputClass = "mt-2 block w-full border-b border-black/25 bg-transparent py-3 text-sm outline-none transition focus:border-black";
  function errorFor(field: keyof CustomerDetails) {
    return errors[field] ? <p id={`checkout-${field}-error`} className="mt-2 text-xs text-red-700" role="alert">{errors[field]}</p> : null;
  }
  const stateClasses: Record<Exclude<PaymentState, null>, string> = {
    success: "border-olive/40 bg-olive/10 text-ink",
    failed: "border-red-300 bg-red-50 text-red-900",
    cancelled: "border-black/20 bg-black/5 text-ink",
    "order-error": "border-red-300 bg-red-50 text-red-900"
  };

  return <div className="container-wide py-10 md:py-16">
    <Link href="/cart" className="inline-flex items-center gap-2 text-[10px] uppercase tracking-widest text-black/55 hover:text-black"><ArrowLeft size={14}/> Back to bag</Link>
    <p className="eyebrow mt-8 text-olive">Your selection</p><h1 className="mt-3 font-display text-5xl md:text-6xl">Checkout</h1>
    <div className="mt-10 grid items-start gap-12 lg:grid-cols-[1fr_380px]">
      <form onSubmit={handleSubmit} noValidate className="space-y-10">
        <section><h2 className="font-display text-2xl">Delivery details</h2><div className="mt-5 grid gap-x-6 gap-y-5 sm:grid-cols-2">
          <label className="block text-[10px] uppercase tracking-widest sm:col-span-2">Customer name<input autoComplete="name" value={customer.fullName} onChange={event => updateField("fullName", event.target.value)} className={inputClass} aria-invalid={Boolean(errors.fullName)} aria-describedby={errors.fullName ? "checkout-fullName-error" : undefined}/>{errorFor("fullName")}</label>
          <label className="block text-[10px] uppercase tracking-widest">Mobile number<input autoComplete="tel" type="tel" inputMode="numeric" maxLength={10} value={customer.mobile} onChange={event => updateField("mobile", event.target.value.replace(/\D/g, ""))} placeholder="10-digit mobile number" className={inputClass} aria-invalid={Boolean(errors.mobile)} aria-describedby={errors.mobile ? "checkout-mobile-error" : undefined}/>{errorFor("mobile")}</label>
          <label className="block text-[10px] uppercase tracking-widest">Email address<input autoComplete="email" type="email" value={customer.email} onChange={event => updateField("email", event.target.value)} className={inputClass} aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? "checkout-email-error" : undefined}/>{errorFor("email")}</label>
          <label className="block text-[10px] uppercase tracking-widest sm:col-span-2">Full delivery address<textarea autoComplete="street-address" rows={2} value={customer.address} onChange={event => updateField("address", event.target.value)} placeholder="House / flat, street, area, landmark" className={`${inputClass} resize-y`} aria-invalid={Boolean(errors.address)} aria-describedby={errors.address ? "checkout-address-error" : undefined}/>{errorFor("address")}</label>
          <label className="block text-[10px] uppercase tracking-widest">City<input autoComplete="address-level2" value={customer.city} onChange={event => updateField("city", event.target.value)} className={inputClass} aria-invalid={Boolean(errors.city)} aria-describedby={errors.city ? "checkout-city-error" : undefined}/>{errorFor("city")}</label>
          <label className="block text-[10px] uppercase tracking-widest">State<input autoComplete="address-level1" value={customer.state} onChange={event => updateField("state", event.target.value)} className={inputClass} aria-invalid={Boolean(errors.state)} aria-describedby={errors.state ? "checkout-state-error" : undefined}/>{errorFor("state")}</label>
          <label className="block text-[10px] uppercase tracking-widest">PIN code<input autoComplete="postal-code" inputMode="numeric" maxLength={6} value={customer.pinCode} onChange={event => updateField("pinCode", event.target.value.replace(/\D/g, ""))} placeholder="6-digit PIN code" className={inputClass} aria-invalid={Boolean(errors.pinCode)} aria-describedby={errors.pinCode ? "checkout-pinCode-error" : undefined}/>{errorFor("pinCode")}</label>
        </div></section>
        <section><h2 className="font-display text-2xl">Payment method</h2><p className="mt-2 text-sm leading-6 text-black/55">Online payments are securely verified by Razorpay. Cash on Delivery orders are recorded securely and paid upon delivery.</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {paymentMethods.map(({ id, icon: Icon, detail }) => <label key={id} className={`flex cursor-pointer gap-3 border p-4 transition ${paymentMethod === id ? "border-ink bg-[#e9e5dd]" : "border-black/15 hover:border-black/40"}`}><input type="radio" name="paymentMethod" value={id} checked={paymentMethod === id} onChange={() => setPaymentMethod(id)} className="mt-1 accent-[#171816]"/><Icon size={18} strokeWidth={1.5}/><span><span className="block text-sm">{paymentMethodLabels[id]}</span><span className="mt-1 block text-xs text-black/50">{detail}</span></span></label>)}
          </div>
        </section>
        {message && <p className={`border p-4 text-sm leading-6 ${paymentState ? stateClasses[paymentState] : "border-red-300 bg-red-50 text-red-900"}`} role="alert">{message}</p>}
        <button type="submit" disabled={submitting || lock.current} className="w-full bg-ink py-4 text-[10px] uppercase tracking-[.18em] text-paper transition hover:bg-olive disabled:cursor-wait disabled:opacity-60">{submitting ? (paymentMethod === "cod" ? "Placing order…" : "Connecting to Razorpay…") : paymentMethod === "cod" ? `Place order — ${formatINR(finalTotal)}` : `Pay ${formatINR(finalTotal)}`}</button>
      </form>
      <aside className="h-fit bg-[#e9e5dd] p-5 sm:p-6"><h2 className="eyebrow">Order summary <span className="text-black/45">({items.reduce((sum, item) => sum + item.quantity, 0)} items)</span></h2><div className="mt-5 max-h-[360px] space-y-4 overflow-y-auto">{items.map(item => <div key={`${item.product.id}-${item.size}`} className="flex gap-3"><img src={item.product.image} alt={item.product.name} className="h-20 w-16 object-cover"/><div className="min-w-0 flex-1"><p className="text-sm">{item.product.name}</p><p className="mt-1 text-xs text-black/50">Quantity {item.quantity} · Size {item.size}</p><div className="mt-2 flex justify-between gap-2 text-xs"><span>{formatINR(item.product.price)} × {item.quantity}</span><span>{formatINR(item.product.price * item.quantity)}</span></div></div></div>)}</div><div className="mt-5 space-y-3 border-t border-black/15 pt-5 text-sm"><div className="flex justify-between"><span>Subtotal</span><span>{formatINR(total)}</span></div><div className="flex justify-between"><span>Shipping</span><span>{formatINR(SHIPPING_CHARGE)}</span></div><div className="flex justify-between border-t border-black/15 pt-4 font-medium"><span>Final total</span><span>{formatINR(finalTotal)}</span></div></div></aside>
    </div>
  </div>;
}
