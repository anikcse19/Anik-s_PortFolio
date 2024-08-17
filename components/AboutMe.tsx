import React from "react";
import { SparklesCore } from "./ui/Sparkless";
import aboutMe from "@/public/aboutMe.png";
import ba from "@/public/businessAnaImg.png";
import Image from "next/image";
import { HoverBorderGradient } from "./ui/BorderGradiant";
import { FaFacebook } from "react-icons/fa";
import { FaGithub } from "react-icons/fa";
import { FaLinkedin } from "react-icons/fa";
import ConfettiButton from "./ui/ConfettiButton";

const AboutMe = () => {
  console.log(ba, "ba");

  return (
    <div id="about" className="mt-5 mb-10">
      {/* sparkless */}
      <div>
        <div className="h-fit w-full flex flex-col items-center justify-center overflow-hidden rounded-md mb-5">
          <h1 className="md:text-3xl text-3xl lg:text-6xl font-medium text-center text-blue-200 relative z-20 pb-2">
            About Me
          </h1>
          <div className="w-[40rem] h-16 relative">
            {/* Gradients */}
            <div className="absolute inset-x-20 top-0 bg-gradient-to-r from-transparent via-indigo-500 to-transparent h-[12px] w-3/4 blur-sm" />
            <div className="absolute inset-x-20 top-0 bg-gradient-to-r from-transparent via-indigo-500 to-transparent h-px w-3/4" />
            <div className="absolute inset-x-60 top-0 bg-gradient-to-r from-transparent via-sky-500 to-transparent h-[5px] w-1/4 blur-sm" />
            <div className="absolute inset-x-60 top-0 bg-gradient-to-r from-transparent via-sky-500 to-transparent h-px w-1/4" />

            {/* Core component */}
            <SparklesCore
              background="transparent"
              minSize={0.4}
              maxSize={1}
              particleDensity={1200}
              className="w-full h-full"
              particleColor="#FFFFFF"
            />

            {/* Radial Gradient to prevent sharp edges */}
            <div className="absolute inset-0 w-full h-full  [mask-image:radial-gradient(350px_200px_at_top,transparent_20%,white)]"></div>
          </div>
        </div>
      </div>
      {/* about */}
      <div
        className="group w-[90%] lg:w-[90%] mx-auto h-[400px] rounded-md
       relative"
      >
        <div
          style={{
            backgroundImage: " url('/me.jpeg')",
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
            filter: "blur(3px)" /* Apply blur to the entire element */,
          }}
          className={`bg-cover bg-center w-full h-full group-hover:scale-110 group-hover:blur-0 transition-all duration-500 ease-in-out`}
        />{" "}
        <div className="absolute bottom-[10%] left-[50%] -translate-x-1/2">
          <p className="text-sm tracking-widest capitalize p-3 text-center">
            Knack of building applications with front and back end operations.
          </p>
          <div className="flex items-center justify-center gap-3 mt-5">
            <HoverBorderGradient
              link="https://github.com/Anikcse19"
              containerClassName="rounded-full"
              as="button"
              className="dark:bg-black bg-white text-black dark:text-white flex items-center space-x-2"
            >
              <FaFacebook className="text-blue-400" />
              <span>Facebook</span>
            </HoverBorderGradient>
            <HoverBorderGradient
              link="https://github.com/Anikcse19"
              containerClassName="rounded-full"
              as="button"
              className="dark:bg-black bg-white text-black dark:text-white flex items-center space-x-2"
            >
              <FaGithub className="" />
              <span>Github</span>
            </HoverBorderGradient>
            <HoverBorderGradient
              link="https://www.linkedin.com/in/anik-deb-0117641b2/"
              containerClassName="rounded-full"
              as="button"
              className="dark:bg-black bg-white text-black dark:text-white flex items-center space-x-2"
            >
              <FaLinkedin className="text-blue-600" />
              <span>LinkedIn</span>
            </HoverBorderGradient>
          </div>
          <div className="flex items-center justify-center mt-5">
            <ConfettiButton />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutMe;
