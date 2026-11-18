import type { Metadata } from "next";
import ContactContent from "@/components/contact-content";
export const metadata: Metadata = { title: "Contact", description: "Get in touch with TREVORA Clothing. We're here to help with orders, fit and anything else." };
export default function ContactPage() { return <ContactContent/>; }
