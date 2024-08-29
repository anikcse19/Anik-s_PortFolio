import AboutMe from "@/components/AboutMe";
import Education from "@/components/Education";
import Grid from "@/components/Grid";
import Hero from "@/components/Hero";

import ProjectHeader from "@/components/ProjectHeader";
import Projects from "@/components/ProjectHeader";
import ProjectShowCase from "@/components/ProjectShowCase";
import Testimonials from "@/components/Testimonials";
import Technologies from "@/components/Technologies";
import Footer from "@/components/Footer";
import { FloatingNav } from "@/components/ui/FloatingNav";
import { navItems } from "@/data";
import Image from "next/image";
import Experiences from "@/components/Experiences";

export default function Home() {
  return (
    <main className="relative bg-black-100 flex justify-center items-center flex-col overflow-hidden mx-auto sm:px-10 px-5">
      <div className="max-w-7xl w-full flex flex-col gap-y-10">
        {/* <FloatingNav className="hidden md:flex" navItems={navItems} /> */}
        <Hero />
        <AboutMe />
        <ProjectShowCase />
        <Experiences />
        <Technologies />
        <Education />
        <Grid />
        <Testimonials />
        <Footer />
      </div>
    </main>
  );
}
