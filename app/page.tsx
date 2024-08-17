import AboutMe from "@/components/AboutMe";
import Education from "@/components/Education";
import Grid from "@/components/Grid";
import Hero from "@/components/Hero";
import ProjectHeader from "@/components/ProjectHeader";
import Projects from "@/components/ProjectHeader";
import ProjectShowCase from "@/components/ProjectShowCase";
import Testimonials from "@/components/Testimonials";
import { FloatingNav } from "@/components/ui/FloatingNav";
import { navItems } from "@/data";
import Image from "next/image";

export default function Home() {
  return (
    <main className="relative bg-black-100 flex justify-center items-center flex-col overflow-hidden mx-auto sm:px-10 px-5">
      <div className="max-w-7xl w-full">
        <FloatingNav navItems={navItems} />
        <Hero />
        <Grid />
        <ProjectShowCase />
        <Education />
        <AboutMe />
        <Testimonials />
      </div>
    </main>
  );
}
