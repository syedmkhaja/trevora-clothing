"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (email.trim()) setSubmitted(true);
  }
  return <section className="bg-[#e9e5dd] px-5 py-16 text-center md:py-20"><p className="eyebrow text-olive">A note from us</p><h2 className="mt-4 font-display text-3xl md:text-4xl">Stay in the know.</h2><p className="mx-auto mt-3 max-w-md text-sm leading-6 text-black/55">New releases, considered inspiration and the occasional good thing. No noise.</p><form onSubmit={handleSubmit} className="mx-auto mt-7 flex max-w-md border-b border-black/40"><label className="sr-only" htmlFor="newsletter-email">Email address</label><input id="newsletter-email" type="email" required value={email} onChange={event => setEmail(event.target.value)} placeholder="Your email address" className="min-w-0 flex-1 bg-transparent py-3 text-sm outline-none placeholder:text-black/40"/><button aria-label="Subscribe to newsletter" className="flex items-center gap-2 text-[10px] uppercase tracking-widest">{submitted ? "You're on the list" : "Subscribe"}<ArrowRight size={15}/></button></form></section>;
}
