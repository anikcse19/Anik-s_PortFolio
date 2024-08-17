"use client";
import React from "react";
import { Spotlight } from "./ui/Spotlight";
import { TextGenerateEffect } from "./ui/text-generate-effect";
import { MagicButton } from "./ui/MagicButton";
import { FaLocationArrow } from "react-icons/fa";
import { FaCloudDownloadAlt } from "react-icons/fa";
import { FloatingNav } from "./ui/FloatingNav";
import { link } from "fs";
import { FlipWords } from "./ui/FlipWords";

const Hero = () => {
  const words = [
    "Web-Developer",
    "Frontend-Developer",
    "Backend-Developer",
    "Software-Developer",
  ];

  // const handleDownload = () => {
  //   console.log("cliked");

  //   const link = document.createElement("a");
  //   link.href =
  //     "https://drive.google.com/uc?export=download&id=1WI5jh-lnapKYkwHJd162tZPFbov1H69D";
  //   link.download = "Anik's_Resume.pdf"; // This sets the default name for the downloaded file
  //   link.click();
  // };
  const handleDownload = () => {
    window.open(
      "https://drive.google.com/file/d/1WI5jh-lnapKYkwHJd162tZPFbov1H69D/view?usp=sharing",
      "_blank"
    );
    // try {
    //   const response = await fetch(
    //     "https://drive.google.com/uc?export=download&id=1WI5jh-lnapKYkwHJd162tZPFbov1H69DL"
    //   );

    //   // Ensure the response is ok
    //   if (!response.ok) {
    //     throw new Error("Network response was not ok");
    //   }

    //   const blob = await response.blob();
    //   const url = window.URL.createObjectURL(blob);
    //   const a = document.createElement("a");
    //   a.href = url;
    //   a.download = "Your_Resume.pdf"; // Set the name of the downloaded file
    //   document.body.appendChild(a);
    //   a.click();
    //   window.URL.revokeObjectURL(url);
    //   document.body.removeChild(a);
    // } catch (error) {
    //   console.error("Download error:", error);
    // }
  };

  return (
    <div className="mb-20 pt-36 ">
      <div className="">
        {" "}
        <Spotlight
          className="-top-40 -left-10 md:left-22 md:-top-20 h-screen"
          fill="white"
        />
        <Spotlight
          className="h-[80vh] w-[50vw] top-10 left-full"
          fill="purple"
        />
        <Spotlight className="-right-40 top-2 h-[80vh] w-[50vw]" fill="white" />
        <Spotlight
          className="-right-[1000px] top-10 h-[80vh] w-[50vw] rotate-90"
          fill="white"
        />
      </div>

      <div className="h-fit w-full dark:bg-black-100 bg-white  dark:bg-grid-white/[0.01] bg-grid-black/[0.2]  flex items-center justify-center absolute top-0 left-0">
        {/* Radial gradient for the container to give a faded look */}
        <div className="absolute pointer-events-none inset-0 flex items-center justify-center dark:bg-black-100 bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />
      </div>
      <div className=" flex justify-center my-15 z-50 relative">
        <div className="flex flex-col gap-y-3 items-center max-w-[89vw] md:max-w-2xl lg:max-w-[60vw]">
          <div className="text-sm md:text-base lg:text-lg mx-auto font-normal text-neutral-600 dark:text-blue-200">
            Hi, I am Anik. I am a
            <FlipWords words={words} />
          </div>
          <TextGenerateEffect
            className="text-blue-300 tracking-wider text-sm"
            duration={2}
            // filter={false}
            words="Hello, How are You? Hope good! Let's Explore!"
          />

          {/* <p className="p-2 text-sm md:text-base tracking-wider">
            Hi i am anik, a next js developer bases in bangladesh
          </p> */}
          <div className="flex items-center gap-2">
            <a href="#projects">
              <MagicButton
                title="Show my work"
                icon={<FaLocationArrow />}
                position="right"
                from="work"
              />
            </a>
            <p onClick={handleDownload}>
              <MagicButton
                title="Download my Resume"
                icon={<FaCloudDownloadAlt />}
                position="right"
                from="resume"
              />
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
