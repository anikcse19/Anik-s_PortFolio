"use client";

import React from "react";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { fadeInUp, staggerContainer } from "@/lib/animations";
import Image from "next/image";

export const About: React.FC = () => {
  const socialLinks = [
    { name: "Facebook", href: "https://www.facebook.com/anik.chandra.dev.37", icon: "📘" },
    { name: "GitHub", href: "https://github.com/Anikcse19", icon: "🐙" },
    { name: "LinkedIn", href: "https://www.linkedin.com/in/anik-deb-0117641b2/", icon: "💼" },
  ];

  return (
    <section id="about" className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="text-center mb-16"
        >
          <motion.p variants={fadeInUp} className="text-purple-400 text-sm uppercase tracking-widest mb-4">
            Introduction
          </motion.p>
          <motion.h2 variants={fadeInUp} className="text-4xl md:text-5xl font-bold text-white">
            About Me
          </motion.h2>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
        >
          {/* Profile Image */}
          <motion.div variants={fadeInUp} className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-blue-600 rounded-3xl blur-2xl opacity-30" />
              <GlassCard className="relative w-72 h-72 md:w-80 md:h-80 rounded-3xl overflow-hidden">
                <Image
                  src="/me.png"
                  alt="Anik Chandra Deb"
                  width={320}
                  height={320}
                  className="w-full h-full object-cover"
                />
              </GlassCard>
            </div>
          </motion.div>

          {/* Bio Content */}
          <motion.div variants={fadeInUp} className="space-y-6">
            <h3 className="text-3xl font-bold text-white">Hello, I&apos;m Anik</h3>
            <p className="text-neutral-300 leading-relaxed">
              I&apos;m a <span className="text-purple-400 font-semibold">Full Stack Developer</span> based in{" "}
              <span className="text-purple-400 font-semibold">Chattogram, Bangladesh</span> with a passion for building
              beautiful, functional web applications.
            </p>
            <p className="text-neutral-400 leading-relaxed">
              With expertise in <span className="text-blue-400 font-medium">React, Next.js, and Node.js</span>, I create
              seamless user experiences backed by robust server-side architecture. I love turning complex problems into
              simple, elegant solutions.
            </p>
            <p className="text-neutral-400 leading-relaxed">
              When I&apos;m not coding, you&apos;ll find me exploring new technologies, contributing to open source, or sharing
              knowledge with the developer community.
            </p>

            {/* Stats */}
            <div className="flex gap-8 pt-4">
              <div>
                <div className="text-3xl font-bold text-gradient">4+</div>
                <div className="text-neutral-500 text-sm">Years Coding</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-gradient">15+</div>
                <div className="text-neutral-500 text-sm">Projects</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-gradient">10+</div>
                <div className="text-neutral-500 text-sm">Happy Clients</div>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex flex-wrap gap-4 pt-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-5 py-2.5 bg-white/5 hover:bg-purple-500/20 rounded-full text-neutral-300 hover:text-purple-400 transition-colors"
                >
                  <span>{social.icon}</span>
                  <span className="text-sm font-medium">{social.name}</span>
                </a>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};
