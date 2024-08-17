import React from "react";
import { BentoGrid, BentoGridItem } from "./ui/BentoGrid";
import { gridItems } from "@/data";
import {
  IconArrowWaveRightUp,
  IconBoxAlignRightFilled,
  IconBoxAlignTopLeft,
  IconClipboardCopy,
  IconFileBroken,
  IconSignature,
  IconTableColumn,
} from "@tabler/icons-react";
import { SparklesCore } from "./ui/Sparkless";
import webDevImg from "@/public/webDev.jpeg";
import webDesImg from "@/public/webDesign.jpeg";
import backDev from "@/public/backendImg.png";
import fullStack from "@/public/fullStackImg.png";
import contentWritingImg from "@/public/contentWritingImg.jpg";
import businessAnaImg from "@/public/businessAnaImg.png";
import SEOImg from "@/public/SEOImg.png";

const Grid = () => {
  return (
    <section id="services" className="py-5">
      {/* sparkless */}
      <div>
        <div className="h-fit w-full flex flex-col items-center justify-center overflow-hidden rounded-md mb-5">
          <h1 className="md:text-3xl text-3xl lg:text-6xl font-medium text-center text-gray-200 relative z-20 pb-2">
            Services
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
      <BentoGrid className="w-full mx-auto">
        {items.map((item, i) => (
          <BentoGridItem
            key={i}
            title={item.title}
            description={item.description}
            header={item.header}
            // icon={item.icon}
            className={i === 3 || i === 6 ? "md:col-span-2" : ""}
          />
        ))}
      </BentoGrid>
    </section>
  );
};

export default Grid;

const Skeleton = () => (
  <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-neutral-200 dark:from-neutral-900 dark:to-neutral-800 to-neutral-100"></div>
);
const items = [
  {
    title: "Web Development",
    description: "Explore the birth of groundbreaking ideas and inventions.",
    header: "/webDev.jpeg",
    // icon: <IconClipboardCopy className="h-4 w-4 text-neutral-500" />,
  },
  {
    title: "Web Desgning",
    description: "Dive into the transformative power of technology.",
    header: "/webDesign.jpeg",
    // icon: <IconFileBroken className="h-4 w-4 text-neutral-500" />,
  },
  {
    title: "Backend Development",
    description: "Discover the beauty of thoughtful and functional design.",
    header: "/backendImg.png",
    // icon: <IconSignature className="h-4 w-4 text-neutral-500" />,
  },
  {
    title: "Full Stack Development",
    description:
      "Understand the impact of effective communication in our lives.",
    header: "/fullStackImg.png",
    // icon: <IconTableColumn className="h-4 w-4 text-neutral-500" />,
  },
  {
    title: "Content Writing",
    description: "Join the quest for understanding and enlightenment.",
    header: "/contentWritingImg.jpg",
    // icon: <IconArrowWaveRightUp className="h-4 w-4 text-neutral-500" />,
  },
  {
    title: "Business Analyst",
    description: "Experience the thrill of bringing ideas to life.",
    header: "/businessAnaImg.png",
    // icon: <IconBoxAlignTopLeft className="h-4 w-4 text-neutral-500" />,
  },
  {
    title: "SEO Expert",
    description: "Embark on exciting journeys and thrilling discoveries.",
    header: "/SEOImg.png",
    // icon: <IconBoxAlignRightFilled className="h-4 w-4 text-neutral-500" />,
  },
];
