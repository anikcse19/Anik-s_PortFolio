"use client";

import { Navigation } from "@/components/ui/Navigation";
import { Hero } from "@/components/sections/Hero";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0f0f23]">
      <Navigation />
      <Hero />
    </main>
  );
}
