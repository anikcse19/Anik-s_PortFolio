"use client";
import React from "react";
import { LampContainer } from "./ui/Lamp";
import { motion } from "framer-motion";

const ProjectHeader = () => {
  return (
    <div className="my-4 md:my-10">
      {/* Lamp */}
      <div>
        <LampContainer>
          <motion.h1
            initial={{ opacity: 0.5, y: 100 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.1,
              duration: 0.3,
              ease: "easeInOut",
            }}
            className=" bg-gradient-to-br from-slate-300 to-slate-500 py-4 bg-clip-text text-center text-4xl font-medium tracking-tight text-white-200 md:text-7xl"
          >
            My Projects
          </motion.h1>
        </LampContainer>
      </div>
    </div>
  );
};

export default ProjectHeader;
