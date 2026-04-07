"use client";

import React from "react";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { fadeInUp, staggerContainer } from "@/lib/animations";

const EXPERIENCES = [
  {
    date: "April 2025 – Present",
    title: "Full Stack Developer",
    company: "RexVet",
    location: "US (Remote)",
    description: "Leading the frontend team in building modern, scalable, and accessible digital products using Next.js and TypeScript. Architecting component libraries and establishing design systems. Collaborating with cross-functional teams to integrate AI-based features.",
    tags: ["Next.js", "TypeScript", "React", "Leadership"],
  },
  {
    date: "Jan 2024 – May 2025",
    title: "Full Stack Developer",
    company: "ScientistX",
    location: "Dhaka (Remote)",
    description: "Developed and maintained full-stack web applications using React, Node.js, and Express. Built and consumed GraphQL and RESTful APIs. Implemented authentication systems and enhanced API performance by 35% through optimization.",
    tags: ["React", "Node.js", "Express", "GraphQL", "MongoDB"],
  },
  {
    date: "Feb 2021 – Dec 2023",
    title: "Frontend Developer",
    company: "CloudySign LLC",
    location: "Dubai (Remote)",
    description: "Designed and implemented RESTful APIs and translated wireframes into responsive interfaces using Tailwind CSS and React. Managed state using Redux/Zustand and implemented user authentication, role-based access control, and secure session management.",
    tags: ["React", "Tailwind", "Redux", "REST APIs"],
  },
];

export const Experience: React.FC = () => {
  return (
    <section id="experience" className="py-20 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="text-center mb-16"
        >
          <motion.p variants={fadeInUp} className="text-purple-400 text-sm uppercase tracking-widest mb-4">
            Career Journey
          </motion.p>
          <motion.h2 variants={fadeInUp} className="text-4xl md:text-5xl font-bold text-white">
            Work Experience
          </motion.h2>
        </motion.div>

        {/* Timeline */}
        <div className="relative pl-10">
          {/* Timeline Line */}
          <div className="timeline-line" />

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="space-y-8"
          >
            {EXPERIENCES.map((exp, index) => (
              <motion.div key={index} variants={fadeInUp} className="relative">
                {/* Timeline Dot */}
                <div className="timeline-dot" />

                <GlassCard className="p-6 hover:translate-x-2 transition-transform cursor-default">
                  <p className="text-purple-400 text-sm font-medium mb-2">{exp.date}</p>
                  <h3 className="text-xl font-bold text-white mb-1">{exp.title}</h3>
                  <p className="text-neutral-400 text-sm mb-4">
                    <span className="text-neutral-300">{exp.company}</span> • {exp.location}
                  </p>
                  <p className="text-neutral-500 text-sm leading-relaxed mb-4">{exp.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {exp.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 bg-purple-500/10 rounded-lg text-xs text-purple-400"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};
