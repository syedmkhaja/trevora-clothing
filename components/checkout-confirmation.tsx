import Link from "next/link";
import type { CheckoutOrder } from "@/lib/checkout";
import { formatINR, paymentMethodLabels } from "@/lib/checkout";

export default function CheckoutConfirmationPage({ order }: { order: CheckoutOrder | null }) {
  if (!order) return (
    <div className="container-wide flex min-h-[55vh] flex-col items-center justify-center py-16 text-center">
      <p className="eyebrow text-olive">Order details unavailable</p>
      <h1 className="mt-4 font-display text-4xl">We could not find this order.</h1>
      <Link href="/shop" className="mt-7 bg-ink px-6 py-4 text-[10px] uppercase tracking-widest text-paper">Continue shopping</Link>
    </div>
  );
  const isCOD = order.paymentMethod === "cod";
  const { customer, items, reference, paymentId, subtotal, shipping, total, paymentMethod, paymentStatus } = order;
  return (
    <div className="container-wide min-h-[55vh] py-12 md:py-20">
      <div className="mx-auto max-w-3xl">
        <p className="eyebrow text-olive">{isCOD ? `${order.orderStatus ?? "COD"} · ${reference}` : `Payment verified · ${reference}`}</p>
        <h1 className="mt-4 font-display text-4xl md:text-5xl">{isCOD ? "Order placed." : "Payment successful."}</h1>
        <div className="mt-7 border border-olive/40 bg-olive/10 p-5 text-sm leading-6">
          {isCOD ? <><strong>Cash on Delivery</strong><br/>Order ID: {reference}<br/>Final amount payable: {formatINR(total)}</> : <>Razorpay confirmed this payment. Payment ID: {paymentId}.<br/>Order reference: {reference}</>}
        </div>
        <div className="mt-10 grid gap-10 md:grid-cols-2">
          <section>
            <h2 className="font-display text-2xl">Items ordered</h2>
            <div className="mt-4 divide-y divide-black/10">
              {items.map(item => (
                <div key={`${item.productId}-${item.size}`} className="flex justify-between gap-4 py-4 text-sm">
                  <div><p>{item.name}</p><p className="mt-1 text-xs text-black/50">Qty {item.quantity} · Size {item.size}</p></div>
                  <span className="shrink-0">{formatINR(item.lineTotal)}</span>
                </div>
              ))}
            </div>
            <div className="space-y-3 border-t border-black/15 pt-4 text-sm">
              <div className="flex justify-between"><span>Subtotal</span><span>{formatINR(subtotal)}</span></div>
              <div className="flex justify-between"><span>Shipping</span><span>{formatINR(shipping)}</span></div>
              <div className="flex justify-between font-medium"><span>{isCOD ? "Amount payable" : "Total paid"}</span><span>{formatINR(total)}</span></div>
            </div>
          </section>
          <section>
            <h2 className="font-display text-2xl">Delivery details</h2>
            <div className="mt-4 space-y-2 text-sm leading-6">
              <p className="font-medium">{customer.fullName}</p>
              <p>{customer.address}<br/>{customer.city}, {customer.state} {customer.pinCode}</p>
              <p>{customer.mobile}<br/>{customer.email}</p>
              <p className="border-t border-black/10 pt-3">Payment method: {paymentMethodLabels[paymentMethod]} · {isCOD ? "Pending" : paymentStatus}</p>
            </div>
          </section>
        </div>
        <p className="mt-8 border-t border-black/10 pt-5 text-sm leading-6 text-black/55">{isCOD ? "Your COD order is securely recorded and awaiting dispatch." : "Your captured payment and order details are securely recorded."}</p>
        <div className="mt-8 flex flex-wrap gap-4">
          <Link href="/shop" className="bg-ink px-6 py-4 text-[10px] uppercase tracking-widest text-paper transition hover:bg-olive">Continue shopping</Link>
          <Link href="/cart" className="border border-black/25 px-6 py-4 text-[10px] uppercase tracking-widest transition hover:border-black">Return to bag</Link>
        </div>
      </div>
    </div>
  );
}
