"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { ArrowLeft, CreditCard, Landmark, Smartphone, WalletCards } from "lucide-react";
import { useCart } from "@/components/cart-context";
import { formatINR, paymentMethodLabels, SHIPPING_CHARGE, type CustomerDetails, type PaymentMethod } from "@/lib/checkout";
import { createCheckoutRecord, paymentProvider } from "@/lib/payment-provider";

const initialCustomer: CustomerDetails = {
  fullName: "", mobile: "", email: "", address: "", city: "", state: "", pinCode: ""
};
const paymentMethods: { id: PaymentMethod; icon: typeof Smartphone; detail: string }[] = [
  { id: "upi", icon: Smartphone, detail: "UPI apps such as BHIM, PhonePe and Google Pay" },
  { id: "card", icon: CreditCard, detail: "Credit and debit cards" },
  { id: "netbanking", icon: Landmark, detail: "Major Indian banks" },
  { id: "cod", icon: WalletCards, detail: "Cash on delivery" }
];
type Errors = Partial<Record<keyof CustomerDetails, string>>;

export default function CheckoutPage() {
  const { items, total, setCheckoutOrder } = useCart();
  const router = useRouter();
  const [customer, setCustomer] = useState(initialCustomer);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("upi");
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState("");
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
    if (items.length === 0) return;
    const validationErrors = validate();
    setErrors(validationErrors);
    setFormError("");
    if (Object.keys(validationErrors).length > 0) {
      setFormError("Please correct the highlighted details to continue.");
      return;
    }

    setSubmitting(true);
    try {
      // This adapter is intentionally a no-payment demo. Replace it with a
      // server-backed provider session before accepting real orders.
      const result = await paymentProvider.initialize({ customer, items, paymentMethod, total: finalTotal });
      setCheckoutOrder(createCheckoutRecord(result.reference, customer, items, SHIPPING_CHARGE, paymentMethod));
      setFormError(result.message);
      router.push("/checkout/confirmation");
    } catch {
      setFormError("Checkout details could not be prepared. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (items.length === 0) {
    return <div className="container-wide flex min-h-[55vh] flex-col items-center justify-center py-16 text-center">
      <p className="eyebrow text-olive">Nothing to check out</p>
      <h1 className="mt-4 font-display text-4xl">Your bag is empty.</h1>
      <p className="mt-3 text-sm text-black/55">Add something to your bag before continuing.</p>
      <Link href="/shop" className="mt-7 bg-ink px-6 py-4 text-[10px] uppercase tracking-widest text-paper transition hover:bg-olive">Continue shopping</Link>
    </div>;
  }

  const inputClass = "mt-2 block w-full border-b border-black/25 bg-transparent py-3 text-sm outline-none transition focus:border-black";
  function errorFor(field: keyof CustomerDetails) {
    return errors[field] ? <p className="mt-2 text-xs text-red-700" role="alert">{errors[field]}</p> : null;
  }

  return <div className="container-wide py-10 md:py-16">
    <Link href="/cart" className="inline-flex items-center gap-2 text-[10px] uppercase tracking-widest text-black/55 hover:text-black"><ArrowLeft size={14}/> Back to bag</Link>
    <p className="eyebrow mt-8 text-olive">Your selection</p>
    <h1 className="mt-3 font-display text-5xl md:text-6xl">Checkout</h1>
    <div className="mt-10 grid items-start gap-12 lg:grid-cols-[1fr_380px]">
      <form onSubmit={handleSubmit} noValidate className="space-y-10">
        <section>
          <h2 className="font-display text-2xl">Delivery details</h2>
          <div className="mt-5 grid gap-x-6 gap-y-5 sm:grid-cols-2">
            <label className="block text-[10px] uppercase tracking-widest sm:col-span-2">Customer name
              <input autoComplete="name" value={customer.fullName} onChange={event => updateField("fullName", event.target.value)} className={inputClass} aria-invalid={Boolean(errors.fullName)} aria-describedby={errors.fullName ? "checkout-name-error" : undefined}/>
              {errors.fullName && <span id="checkout-name-error">{errorFor("fullName")}</span>}
            </label>
            <label className="block text-[10px] uppercase tracking-widest">Mobile number
              <input autoComplete="tel" type="tel" inputMode="numeric" maxLength={10} value={customer.mobile} onChange={event => updateField("mobile", event.target.value.replace(/\D/g, ""))} placeholder="10-digit mobile number" className={inputClass} aria-invalid={Boolean(errors.mobile)}/>{errorFor("mobile")}
            </label>
            <label className="block text-[10px] uppercase tracking-widest">Email address
              <input autoComplete="email" type="email" value={customer.email} onChange={event => updateField("email", event.target.value)} className={inputClass} aria-invalid={Boolean(errors.email)}/>{errorFor("email")}
            </label>
            <label className="block text-[10px] uppercase tracking-widest sm:col-span-2">Full delivery address
              <textarea autoComplete="street-address" rows={2} value={customer.address} onChange={event => updateField("address", event.target.value)} placeholder="House / flat, street, area, landmark" className={`${inputClass} resize-y`} aria-invalid={Boolean(errors.address)}/>{errorFor("address")}
            </label>
            <label className="block text-[10px] uppercase tracking-widest">City
              <input autoComplete="address-level2" value={customer.city} onChange={event => updateField("city", event.target.value)} className={inputClass} aria-invalid={Boolean(errors.city)}/>{errorFor("city")}
            </label>
            <label className="block text-[10px] uppercase tracking-widest">State
              <input autoComplete="address-level1" value={customer.state} onChange={event => updateField("state", event.target.value)} className={inputClass} aria-invalid={Boolean(errors.state)}/>{errorFor("state")}
            </label>
            <label className="block text-[10px] uppercase tracking-widest">PIN code
              <input autoComplete="postal-code" inputMode="numeric" maxLength={6} value={customer.pinCode} onChange={event => updateField("pinCode", event.target.value.replace(/\D/g, ""))} placeholder="6-digit PIN code" className={inputClass} aria-invalid={Boolean(errors.pinCode)}/>{errorFor("pinCode")}
            </label>
          </div>
        </section>

        <section>
          <h2 className="font-display text-2xl">Payment method</h2>
          <p className="mt-2 text-sm leading-6 text-black/55">Select your preferred method. Payment is not processed in this demo.</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {paymentMethods.map(({ id, icon: Icon, detail }) => <label key={id} className={`flex cursor-pointer gap-3 border p-4 transition ${paymentMethod === id ? "border-ink bg-[#e9e5dd]" : "border-black/15 hover:border-black/40"}`}>
              <input type="radio" name="paymentMethod" value={id} checked={paymentMethod === id} onChange={() => setPaymentMethod(id)} className="mt-1 accent-[#171816]"/>
              <Icon size={18} strokeWidth={1.5}/><span><span className="block text-sm">{paymentMethodLabels[id]}</span><span className="mt-1 block text-xs text-black/50">{detail}</span></span>
            </label>)}
          </div>
        </section>

        <div className="border border-olive/40 bg-olive/10 p-4 text-sm leading-6" role="status">Demo checkout only: no payment will be collected and no order will be placed. A real payment provider and order backend must be connected before launch.</div>
        {formError && <p className="text-sm text-red-700" role="alert">{formError}</p>}
        <button type="submit" disabled={submitting} className="w-full bg-ink py-4 text-[10px] uppercase tracking-[.18em] text-paper transition hover:bg-olive disabled:cursor-wait disabled:opacity-60">{submitting ? "Preparing review…" : "Review checkout details"}</button>
      </form>

      <aside className="h-fit bg-[#e9e5dd] p-5 sm:p-6">
        <h2 className="eyebrow">Order summary <span className="text-black/45">({items.reduce((sum, item) => sum + item.quantity, 0)} items)</span></h2>
        <div className="mt-5 max-h-[360px] space-y-4 overflow-y-auto">
          {items.map(item => <div key={`${item.product.id}-${item.size}`} className="flex gap-3"><img src={item.product.image} alt={item.product.name} className="h-20 w-16 object-cover"/><div className="min-w-0 flex-1"><p className="text-sm">{item.product.name}</p><p className="mt-1 text-xs text-black/50">Quantity {item.quantity} · Size {item.size}</p><div className="mt-2 flex justify-between gap-2 text-xs"><span>{formatINR(item.product.price)} × {item.quantity}</span><span>{formatINR(item.product.price * item.quantity)}</span></div></div></div>)}
        </div>
        <div className="mt-5 space-y-3 border-t border-black/15 pt-5 text-sm"><div className="flex justify-between"><span>Subtotal</span><span>{formatINR(total)}</span></div><div className="flex justify-between"><span>Shipping</span><span>{formatINR(SHIPPING_CHARGE)}</span></div><div className="flex justify-between border-t border-black/15 pt-4 font-medium"><span>Final total</span><span>{formatINR(finalTotal)}</span></div></div>
        <p className="mt-4 text-xs leading-5 text-black/50">This is a demo summary. Payment is not taken.</p>
      </aside>
    </div>
  </div>;
}
