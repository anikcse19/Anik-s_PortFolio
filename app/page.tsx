"use client";
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
import { useState } from "react";

export default function Home() {
  const [pageType, setPageType] = useState("about-me");
  return (
    <main className="relative bg-black-100 flex justify-center items-center flex-col overflow-hidden mx-auto sm:px-10 px-5">
      <div className=" w-full flex flex-col gap-y-3 lg:gap-y-10 pt-10">
        {/* <FloatingNav className="hidden md:flex" navItems={navItems} /> */}
        {/* <Hero /> */}
        <div className="flex justify-around">
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
            <span
              onClick={() => {
                setPageType("about-me");
              }}
              className={`${
                pageType == "about-me" && " border-b-4 border-red-600"
              } cursor-pointer px-4 py-1 rounded text-[10px] text-sm text-center`}
            >
              About Me
            </span>

            <span
              onClick={() => {
                setPageType("projects");
              }}
              className={`${
                pageType == "projects" && " border-b-4 border-red-600"
              } cursor-pointer px-4 py-1 rounded text-[10px] text-sm text-center`}
            >
              Projects
            </span>
            <span
              onClick={() => {
                setPageType("experience");
              }}
              className={`${
                pageType == "experience" && " border-b-4 border-red-600"
              } cursor-pointer px-4 py-1 rounded text-[10px] text-sm text-center`}
            >
              Experience
            </span>
            <span
              onClick={() => {
                setPageType("technologies");
              }}
              className={`${
                pageType == "technologies" && " border-b-4 border-red-600"
              } cursor-pointer px-4 py-1 rounded text-[10px] text-sm text-center`}
            >
              Technologies
            </span>
            <span
              onClick={() => {
                setPageType("education");
              }}
              className={`${
                pageType == "education" && " border-b-4 border-red-600"
              } cursor-pointer px-4 py-1 rounded text-[10px] text-sm text-center`}
            >
              Education
            </span>
            <span
              onClick={() => {
                setPageType("services");
              }}
              className={`${
                pageType == "services" && " border-b-4 border-red-600"
              } cursor-pointer px-4 py-1 rounded text-[10px] text-sm text-center`}
            >
              Services
            </span>
            <span
              onClick={() => {
                setPageType("testimonials");
              }}
              className={`${
                pageType == "testimonials" && " border-b-4 border-red-600"
              } cursor-pointer px-4 py-1 rounded text-[10px] text-sm text-center`}
            >
              Testimonials
            </span>
          </div>
        </div>
        {pageType == "about-me" ? (
          <AboutMe />
        ) : pageType == "projects" ? (
          <ProjectShowCase />
        ) : pageType == "experience" ? (
          <Experiences />
        ) : pageType == "technologies" ? (
          <Technologies />
        ) : pageType == "education" ? (
          <Education />
        ) : pageType == "services" ? (
          <Grid />
        ) : (
          pageType == "testimonials" && <Testimonials />
        )}

        <Footer />
      </div>
    </main>
  );
}
