"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { fadeInUp, staggerContainer } from "@/lib/animations";
import { projects } from "@/data";

const GRADIENTS = [
  "from-purple-600 to-purple-800",      // RexVet
  "from-pink-500 to-rose-600",          // Analytics
  "from-cyan-500 to-blue-600",          // Darkak
  "from-orange-500 to-yellow-500",      // Rex Marine
  "from-teal-400 to-pink-300",          // Rex Sailing
  "from-red-500 to-orange-400",         // Cuba Care
];

const CATEGORIES = ["All", "Full Stack", "E-Commerce", "SaaS", "Healthcare"];

export const Projects: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState("All");

  const filteredProjects = projects.filter((project) => {
    if (activeFilter === "All") return true;
    const desc = project.title.toLowerCase() + " " + project.des.toLowerCase();
    if (activeFilter === "Healthcare") return desc.includes("vet") || desc.includes("health");
    if (activeFilter === "E-Commerce") return desc.includes("commerce") || desc.includes("shop") || desc.includes("market");
    if (activeFilter === "SaaS") return desc.includes("analytics") || desc.includes("management");
    return true;
  });

  return (
    <section id="projects" className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="text-center mb-16"
        >
          <motion.p variants={fadeInUp} className="text-purple-400 text-sm uppercase tracking-widest mb-4">
            My Work
          </motion.p>
          <motion.h2 variants={fadeInUp} className="text-4xl md:text-5xl font-bold text-white">
            Featured Projects
          </motion.h2>
        </motion.div>

        {/* Filter Tabs */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="flex flex-wrap justify-center gap-3 mb-12"
        >
          {CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => setActiveFilter(category)}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                activeFilter === category
                  ? "bg-purple-500/20 border border-purple-500/50 text-purple-400"
                  : "bg-white/5 border border-white/10 text-neutral-400 hover:bg-white/10"
              }`}
            >
              {category}
            </button>
          ))}
        </motion.div>

        {/* Projects Grid */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredProjects.map((project, index) => (
            <motion.div
              key={project.id}
              variants={fadeInUp}
              className="flip-card h-[420px]"
            >
              <div className="flip-card-inner">
                {/* Front of Card */}
                <GlassCard className="flip-card-front p-6 flex flex-col">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-medium mb-4 ${
                      index === 0 ? "bg-purple-500/20 text-purple-400" : "bg-white/5 text-neutral-400"
                    }`}
                  >
                    {index === 0 ? "⭐ Featured" : project.title.split("–")[0].trim()}
                  </span>

                  <div className="text-6xl mb-6">
                    {project.id === 1 ? "🐾" :
                     project.id === 2 ? "📊" :
                     project.id === 3 ? "🛒" :
                     project.id === 4 ? "🚢" :
                     project.id === 5 ? "⛵" : "🛍️"}
                  </div>

                  <h3 className="text-xl font-bold text-white mb-3">{project.title}</h3>
                  <p className="text-neutral-400 text-sm leading-relaxed mb-6 flex-grow">
                    {project.des}
                  </p>

                  <div className="bg-white/5 rounded-xl p-4 text-center text-purple-400 text-sm">
                    👆 Hover to explore
                  </div>
                </GlassCard>

                {/* Back of Card */}
                <div
                  className={`flip-card-back p-8 flex flex-col justify-center items-center text-center bg-gradient-to-br ${GRADIENTS[index % GRADIENTS.length]}`}
                >
                  <h3 className="text-2xl font-bold text-white mb-4">{project.title}</h3>

                  <div className="flex flex-wrap justify-center gap-2 mb-6">
                    {project.iconLists.slice(0, 4).map((tech) => (
                      <span
                        key={tech.id}
                        className="px-3 py-1 bg-white/20 rounded-full text-white text-xs font-medium"
                      >
                        {tech.title}
                      </span>
                    ))}
                  </div>

                  <div className="flex gap-3">
                    <a
                      href={project.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-5 py-2 bg-white text-purple-600 rounded-xl text-sm font-semibold hover:scale-105 transition-transform"
                    >
                      View Live →
                    </a>
                    <a
                      href="https://github.com/Anikcse19"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-5 py-2 bg-white/20 text-white rounded-xl text-sm font-semibold hover:scale-105 transition-transform"
                    >
                      GitHub
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
