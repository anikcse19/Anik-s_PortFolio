import React from "react";
import { Cover } from "./ui/Cover";
import { projects } from "@/data";
import { CardBody, CardContainer, CardItem } from "@/components/ui/3d-card";
import Image from "next/image";
import { AnimatedTooltip } from "./ui/AnimatedTooltip";
import Link from "next/link";
const ProjectShowCase = () => {
  return (
    <div id="projects" className="w-full">
      <div className="w-full ">
        <h1 className="text-base md:text-lg lg:text-xl font-semibold max-w-7xl mx-auto text-center mt-6 relative z-20 py-6 bg-clip-text text-blue-200 bg-gradient-to-b from-neutral-800 via-neutral-700 to-neutral-700 dark:from-neutral-800 dark:via-white dark:to-white">
          Review and Give Feedback of My Projects
        </h1>
        <div className="w-full">
          <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 lg:gap-x-3">
            {projects.map((project) => (
              <CardContainer key={project.id} className="inter-var w-full">
                <CardBody className="bg-gray-50 relative group/card  dark:hover:shadow-2xl dark:hover:shadow-emerald-500/[0.1] dark:bg-[#020817] dark:border-white/[0.2] border-black/[0.1] w-auto sm:w-[30rem] h-auto rounded-xl p-6 border  ">
                  <CardItem
                    from="title"
                    translateZ="50"
                    className="text-sm font-bold text-neutral-600 dark:text-white "
                  >
                    {project.title}
                  </CardItem>
                  <CardItem
                    from="desc"
                    as="p"
                    translateZ="60"
                    className="text-neutral-500 text-sm lg:text-[10px] max-w-sm mt-2 py-5 dark:text-neutral-300"
                  >
                    {project.des}
                  </CardItem>
                  <CardItem
                    from="img"
                    translateZ="100"
                    rotateX={20}
                    rotateZ={-10}
                    className="w-full mt-4"
                  >
                    <Image
                      src={project.img}
                      height="1000"
                      width="1000"
                      className="h-60 w-full object-cover object-center rounded-xl group-hover/card:shadow-xl"
                      alt="thumbnail"
                    />
                  </CardItem>
                  <div className="flex justify-between items-center mt-20">
                    <CardItem
                      from="tooltip"
                      translateZ={20}
                      translateX={-40}
                      // as="button"
                      className="px-4 py-2 rounded-xl text-xs font-normal dark:text-white flex items-center gap-2"
                    >
                      <AnimatedTooltip items={project.iconLists} />
                    </CardItem>
                    <CardItem
                      from="show"
                      projectLink={project.link}
                      translateZ={20}
                      translateX={40}
                      as="button"
                      className="px-4 py-2 rounded-xl bg-black dark:bg-white dark:text-black text-white text-xs font-bold"
                    >
                      Show
                    </CardItem>
                  </div>
                </CardBody>
              </CardContainer>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectShowCase;
