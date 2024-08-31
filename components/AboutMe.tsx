import React from "react";
import { SparklesCore } from "./ui/Sparkless";
import aboutMe from "@/public/aboutMe.png";
import ba from "@/public/businessAnaImg.png";
import Image from "next/image";
import { HoverBorderGradient } from "./ui/BorderGradiant";
import { FaCloudDownloadAlt, FaFacebook } from "react-icons/fa";
import { FaGithub } from "react-icons/fa";
import { FaLinkedin } from "react-icons/fa";
import ConfettiButton from "./ui/ConfettiButton";
import { MagicButton } from "./ui/MagicButton";

const AboutMe = () => {
  const handleDownload = () => {
    window.open(
      "https://drive.google.com/file/d/1WI5jh-lnapKYkwHJd162tZPFbov1H69D/view?usp=sharing",
      "_blank"
    );
  };
  return (
    <div id="about" className="mt-5 mb-10">
      {/* <div className="flex justify-center mb-3">
        <h1 className="text-base md:text-lg lg:text-xl text-blue-200 font-bold tracking-widest">
          About Me
        </h1>
      </div> */}

      {/* about */}
      <div className="flex flex-col gap-y-5 lg:flex-row justify-between group">
        <div className="w-full  flex justify-center items-center">
          <img
            className="w-[60%] group-hover:scale-110 transition-all duration-300 ease-in"
            src="/me.png"
            alt=""
          />
        </div>
        <div className="w-full flex items-center">
          <div className="">
            <p className="text-[10px] md:text-sm tracking-widest capitalize p-3 text-center text-blue-300">
              I am a results-oriented frontend developer with a strong passion
              for crafting intuitive and visually appealing user interfaces.
            </p>
            <div className="flex items-center justify-center flex-wrap sm:flex-nowrap  gap-1 gap-y-3 md:gap-3 mt-5">
              <HoverBorderGradient
                link="https://www.facebook.com/anik.chandra.dev.37"
                containerClassName="rounded-full"
                as="button"
                className="dark:bg-black bg-white text-black dark:text-white flex items-center space-x-2"
              >
                <FaFacebook className="text-blue-400 text-xs md:text-sm lg:text-lg" />
                <span className="text-xs md:text-sm">Facebook</span>
              </HoverBorderGradient>
              <HoverBorderGradient
                link="https://github.com/Anikcse19"
                containerClassName="rounded-full"
                as="button"
                className="dark:bg-black bg-white text-black dark:text-white flex items-center space-x-2"
              >
                <FaGithub className="text-xs md:text-sm lg:text-lg" />
                <span className="text-xs md:text-sm">Github</span>
              </HoverBorderGradient>
              <HoverBorderGradient
                link="https://www.linkedin.com/in/anik-deb-0117641b2/"
                containerClassName="rounded-full"
                as="button"
                className="dark:bg-black bg-white text-black dark:text-white flex items-center space-x-2"
              >
                <FaLinkedin className="text-blue-600 text-xs md:text-sm lg:text-lg" />
                <span className="text-xs md:text-sm">Linkedin</span>
              </HoverBorderGradient>
            </div>
            <div className="flex items-center justify-center mt-5">
              <div className="flex items-center gap-4">
                <p onClick={handleDownload}>
                  <MagicButton
                    title="Download my Resume"
                    icon={<FaCloudDownloadAlt />}
                    position="right"
                    from="resume"
                  />
                </p>
                <ConfettiButton />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutMe;
