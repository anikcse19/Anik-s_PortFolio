"use client";

import React from "react";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { fadeInUp, staggerContainer } from "@/lib/animations";
import { FaLocationArrow, FaCloudDownloadAlt } from "react-icons/fa";

const ROLE_WORDS = ["Full Stack Developer", "React Developer", "Next.js Developer", "Node.js Developer"];

export const Hero: React.FC = () => {
  const [currentWordIndex, setCurrentWordIndex] = React.useState(0);
  const [isDeleting, setIsDeleting] = React.useState(false);

  React.useEffect(() => {
    const timeout = setTimeout(
      () => {
        if (isDeleting) {
          setCurrentWordIndex((prev) => (prev === 0 ? ROLE_WORDS.length - 1 : prev - 1));
          setIsDeleting(false);
        } else {
          setCurrentWordIndex((prev) => (prev + 1) % ROLE_WORDS.length);
          setIsDeleting(true);
        }
      },
      isDeleting ? 100 : 2000
    );

    return () => clearTimeout(timeout);
  }, [currentWordIndex, isDeleting]);

  const handleResumeDownload = () => {
    window.open(
      "https://drive.google.com/file/d/1m2-fIuydChZ2q6GItzuNdJX7J0lfQIy8/view?usp=drive_link",
      "_blank"
    );
  };

  return (
    <section className="min-h-screen pt-32 pb-20 px-4 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0f0f23] via-[#1a1a3e] to-[#0f0f23] -z-10" />

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto"
      >
        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 md:grid-rows-2 gap-4 md:gap-6">
          {/* Main Card - Spans 2 columns and 2 rows */}
          <motion.div
            variants={fadeInUp}
            className="md:col-span-2 md:row-span-2 relative"
          >
            <GlassCard className="h-full p-8 md:p-12 relative overflow-hidden">
              {/* Floating orbs */}
              <div className="floating-orb animate-float absolute -top-12 -right-12 w-48 h-48 bg-purple-500/30 rounded-full blur-3xl" />
              <div className="floating-orb animate-float-delayed absolute -bottom-10 -left-10 w-36 h-36 bg-purple-400/20 rounded-full blur-3xl" />

              <div className="relative z-10 flex flex-col justify-center h-full min-h-[400px]">
                <p className="text-purple-400 text-lg md:text-xl mb-4">Hi, I&apos;m</p>
                <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
                  Anik Chandra Deb
                </h1>
                <p className="text-xl md:text-2xl text-neutral-400 mb-8">
                  <span className="text-blue-400">{ROLE_WORDS[currentWordIndex]}</span> specializing in{" "}
                  <span className="text-purple-400">Next.js</span>, <span className="text-purple-400">React</span>, and{" "}
                  <span className="text-purple-400">Node.js</span>
                </p>
                <div className="flex flex-wrap gap-4">
                  <a
                    href="#projects"
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-500 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold transition-all hover:translate-y-[-2px] hover:shadow-lg hover:shadow-purple-500/30"
                  >
                    View Projects <FaLocationArrow />
                  </a>
                  <button
                    onClick={handleResumeDownload}
                    className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-xl font-semibold transition-all hover:translate-y-[-2px]"
                  >
                    Download Resume <FaCloudDownloadAlt />
                  </button>
                </div>
              </div>
            </GlassCard>
          </motion.div>

          {/* Stats Card */}
          <motion.div variants={fadeInUp} className="flex flex-col justify-center">
            <GlassCard className="h-full p-8">
              <div className="text-center space-y-6">
                <div>
                  <div className="text-4xl md:text-5xl font-bold text-gradient mb-2">4+</div>
                  <div className="text-neutral-400 text-sm">Years Experience</div>
                </div>
                <div className="w-full h-px bg-white/10" />
                <div>
                  <div className="text-4xl md:text-5xl font-bold text-gradient mb-2">15+</div>
                  <div className="text-neutral-400 text-sm">Projects Delivered</div>
                </div>
              </div>
            </GlassCard>
          </motion.div>

          {/* CTA Card */}
          <motion.div variants={fadeInUp} className="flex flex-col justify-center">
            <GlassCard className="h-full p-8 text-center">
              <div className="text-5xl mb-4">🚀</div>
              <p className="text-purple-400 font-semibold mb-2">Available for work</p>
              <p className="text-neutral-400 text-sm mb-6">Open to full-time opportunities</p>
              <a
                href="#contact"
                className="inline-block bg-gradient-to-r from-purple-600 to-purple-800 text-white px-6 py-2 rounded-xl text-sm font-semibold transition-all hover:translate-y-[-2px]"
              >
                Let&apos;s Talk
              </a>
            </GlassCard>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
};
