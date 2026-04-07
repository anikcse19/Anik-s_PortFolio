"use client";

import { Navigation } from "@/components/ui/Navigation";
import { Hero } from "@/components/sections/Hero";
import { Projects } from "@/components/sections/Projects";
import { Skills } from "@/components/sections/Skills";
import { Experience } from "@/components/sections/Experience";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0f0f23]">
      <Navigation />
      <Hero />
      <Projects />
      <Skills />
      <Experience />
    </main>
  );
}
