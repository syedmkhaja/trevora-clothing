import type { Metadata } from "next";
import AboutContent from "@/components/about-content";
export const metadata: Metadata = { title: "Our story", description: "Discover the TREVORA point of view: thoughtful materials, considered design and clothing for the everyday." };
export default function AboutPage() { return <AboutContent/>; }
