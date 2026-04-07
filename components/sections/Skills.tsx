"use client";

import React from "react";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { fadeInUp, staggerContainer } from "@/lib/animations";

const SKILL_CATEGORIES = [
  {
    icon: "\u269B\uFE0F",
    title: "Frontend Development",
    description: "Building responsive, performant user interfaces",
    skills: ["React", "Next.js", "TypeScript", "Tailwind", "Redux", "Material UI", "HTML5", "CSS3"],
    gradient: "from-purple-600 to-purple-800",
  },
  {
    icon: "\uD83D\uDD27",
    title: "Backend Development",
    description: "Scalable server-side applications and APIs",
    skills: ["Node.js", "Express", "Python", "Web Sockets", "REST APIs", "GraphQL"],
    gradient: "from-pink-500 to-rose-600",
  },
  {
    icon: "\uD83D\uDDC4\uFE0F",
    title: "Database & Storage",
    description: "Efficient data modeling and management",
    skills: ["MongoDB", "Firebase", "PostgreSQL", "Redis"],
    gradient: "from-cyan-500 to-blue-600",
  },
  {
    icon: "\uD83D\uDE80",
    title: "DevOps & Tools",
    description: "Deployment and development workflow",
    skills: ["Git", "Vercel", "Netlify", "Jira", "Docker"],
    gradient: "from-orange-500 to-yellow-500",
  },
  {
    icon: "\uD83C\uDF08",
    title: "Design & Tools",
    description: "UI/UX design and development tools",
    skills: ["Figma", "VS Code", "Postman", "Chrome DevTools"],
    gradient: "from-teal-400 to-pink-300",
  },
  {
    icon: "\uD83D\uDCE1",
    title: "Mobile Development",
    description: "Cross-platform mobile applications",
    skills: ["React Native", "Expo", "iOS", "Android"],
    gradient: "from-red-500 to-orange-400",
  },
];

export const Skills: React.FC = () => {
  return (
    <section id="skills" className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="text-center mb-16"
        >
          <motion.p variants={fadeInUp} className="text-purple-400 text-sm uppercase tracking-widest mb-4">
            Expertise
          </motion.p>
          <motion.h2 variants={fadeInUp} className="text-4xl md:text-5xl font-bold text-white">
            Skills & Technologies
          </motion.h2>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {SKILL_CATEGORIES.map((category, index) => (
            <motion.div key={category.title} variants={fadeInUp}>
              <GlassCard className="p-7 h-full hover:translate-y-[-4px] transition-transform">
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${category.gradient} flex items-center justify-center text-2xl mb-5`}
                >
                  {category.icon}
                </div>

                <h3 className="text-lg font-bold text-white mb-2">{category.title}</h3>
                <p className="text-neutral-400 text-sm mb-5">{category.description}</p>

                <div className="flex flex-wrap gap-2">
                  {category.skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1.5 bg-white/5 hover:bg-purple-500/20 rounded-lg text-xs text-neutral-300 hover:text-purple-400 transition-colors cursor-default"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
