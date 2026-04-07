# Portfolio Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete redesign of Anik's portfolio with glassmorphism design, bento grid hero, 3D flip project cards, timeline experience, and full section rebuild.

**Architecture:** Single-page scroll layout with 6 main sections (Hero, Projects, Skills, Experience, About, Contact), glassmorphism cards throughout, using existing data with completely new UI components. Theme toggle, scroll animations, 3D effects preserved.

**Tech Stack:** Next.js 14 (App Router), Tailwind CSS, Framer Motion, TypeScript, next-themes, Lucide React icons

---

## File Structure

```
app/
  layout.tsx (modify - update metadata)
  globals.css (modify - add glassmorphism utilities)
  page.tsx (modify - complete rebuild)

components/
  sections/
    Hero.tsx (create - bento grid)
    Projects.tsx (create - 3D flip cards)
    Skills.tsx (create - category cards)
    Experience.tsx (create - timeline)
    About.tsx (create - two-column)
    Contact.tsx (create - form + info)
  ui/
    GlassCard.tsx (create - reusable glass component)
    Navigation.tsx (create - sticky nav with theme toggle)
    ThemeToggle.tsx (create - theme switcher)
  Footer.tsx (modify - glassmorphism update)

lib/
  animations.ts (create - framer motion variants)
  utils.ts (modify - add glass utility)
```

---

## Task 1: Update Global Styles & Utilities

**Files:**
- Modify: `app/globals.css`
- Modify: `lib/utils.ts`

- [ ] **Step 1: Add glassmorphism utilities to globals.css**

Open `app/globals.css` and add after the `@layer base` section:

```css
@layer utilities {
  .glass {
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .glass-dark {
    background: rgba(0, 0, 0, 0.3);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .text-gradient {
    background: linear-gradient(90deg, #a78bfa, #60a5fa);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .bg-gradient-primary {
    background: linear-gradient(135deg, #667eea, #764ba2);
  }

  .bg-gradient-secondary {
    background: linear-gradient(135deg, #f093fb, #f5576c);
  }

  .bg-gradient-tertiary {
    background: linear-gradient(135deg, #4facfe, #00f2fe);
  }

  .bg-gradient-quaternary {
    background: linear-gradient(135deg, #fa709a, #fee140);
  }

  .bg-gradient-quinary {
    background: linear-gradient(135deg, #a8edea, #fed6e3);
  }

  .bg-gradient-senary {
    background: linear-gradient(135deg, #ff0844, #ffb199);
  }

  /* Flip card utilities */
  .flip-card {
    perspective: 1000px;
  }

  .flip-card-inner {
    position: relative;
    width: 100%;
    height: 100%;
    transition: transform 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    transform-style: preserve-3d;
  }

  .flip-card:hover .flip-card-inner {
    transform: rotateY(180deg);
  }

  .flip-card-front,
  .flip-card-back {
    position: absolute;
    width: 100%;
    height: 100%;
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
  }

  .flip-card-back {
    transform: rotateY(180deg);
  }

  /* Timeline styles */
  .timeline-line {
    position: absolute;
    left: 7px;
    top: 0;
    bottom: 0;
    width: 2px;
    background: linear-gradient(180deg, #667eea, #764ba2, #667eea);
  }

  .timeline-dot {
    position: absolute;
    left: -37px;
    top: 28px;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: linear-gradient(135deg, #667eea, #764ba2);
    border: 3px solid #0f0f23;
    box-shadow: 0 0 20px rgba(102, 126, 234, 0.5);
  }

  /* Animation keyframes */
  @keyframes float {
    0%, 100% {
      transform: translate(0, 0);
    }
    50% {
      transform: translate(20px, -20px);
    }
  }

  .animate-float {
    animation: float 8s ease-in-out infinite;
  }

  .animate-float-delayed {
    animation: float 8s ease-in-out infinite;
    animation-delay: -4s;
  }
}
```

- [ ] **Step 2: Update layout metadata**

Open `app/layout.tsx` and update the metadata:

```typescript
export const metadata: Metadata = {
  title: "Anik Chandra Deb | Full Stack Developer",
  description: "Full Stack Developer specializing in Next.js, React, and Node.js. Building modern web applications with 4+ years of experience.",
};
```

- [ ] **Step 3: Run dev server to verify no errors**

Run: `npm run dev`
Expected: Server starts without errors, glass utilities available

- [ ] **Step 4: Commit**

```bash
git add app/globals.css app/layout.tsx
git commit -m "feat: add glassmorphism utilities and update metadata"
```

---

## Task 2: Create Reusable Glass Card Component

**Files:**
- Create: `components/ui/GlassCard.tsx`

- [ ] **Step 1: Create GlassCard component**

Create `components/ui/GlassCard.tsx`:

```typescript
import React from "react";
import { cn } from "@/lib/utils";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "dark" | "gradient";
  gradient?: string;
  onClick?: () => void;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className,
  variant = "default",
  gradient,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        "rounded-2xl transition-all duration-300",
        variant === "default" && "glass",
        variant === "dark" && "glass-dark",
        variant === "gradient" && "p-[1px]",
        onClick && "cursor-pointer hover:translate-y-[-4px]",
        className
      )}
      style={
        variant === "gradient" && gradient
          ? {
              background: gradient,
            }
          : undefined
      }
    >
      {variant === "gradient" ? (
        <div className="bg-[#0f0f23]/90 backdrop-blur-xl rounded-2xl p-6 h-full">
          {children}
        </div>
      ) : (
        children
      )}
    </div>
  );
};
```

- [ ] **Step 2: Create Navigation component**

Create `components/ui/Navigation.tsx`:

```typescript
"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "./ThemeToggle";

export const Navigation: React.FC = () => {
  const navItems = [
    { name: "About", href: "#about" },
    { name: "Projects", href: "#projects" },
    { name: "Skills", href: "#skills" },
    { name: "Experience", href: "#experience" },
    { name: "Contact", href: "#contact" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-4 py-4">
      <div className="max-w-7xl mx-auto">
        <div className="glass rounded-full px-6 py-3 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-white">
            AD.
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-neutral-400 hover:text-purple-400 transition-colors text-sm font-medium"
              >
                {item.name}
              </Link>
            ))}
          </div>

          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
};
```

- [ ] **Step 3: Create ThemeToggle component**

Create `components/ui/ThemeToggle.tsx`:

```typescript
"use client";

import React from "react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export const ThemeToggle: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
        <span className="text-lg">🌓</span>
      </button>
    );
  }

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 transition-colors flex items-center justify-center"
      aria-label="Toggle theme"
    >
      {theme === "dark" ? (
        <span className="text-lg">☀️</span>
      ) : (
        <span className="text-lg">🌙</span>
      )}
    </button>
  );
};
```

- [ ] **Step 4: Create animation variants**

Create `lib/animations.ts`:

```typescript
import { Variants } from "framer-motion";

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 60 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.4, 0.25, 1],
    },
  },
};

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.4, 0.25, 1],
    },
  },
};

export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -100 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.4, 0.25, 1],
    },
  },
};
```

- [ ] **Step 5: Run dev server to verify components render**

Run: `npm run dev`
Expected: No TypeScript errors, components compile successfully

- [ ] **Step 6: Commit**

```bash
git add components/ui/GlassCard.tsx components/ui/Navigation.tsx components/ui/ThemeToggle.tsx lib/animations.ts
git commit -m "feat: add reusable GlassCard, Navigation, ThemeToggle, and animation variants"
```

---

## Task 3: Create Hero Section with Bento Grid

**Files:**
- Create: `components/sections/Hero.tsx`

- [ ] **Step 1: Create Hero component**

Create `components/sections/Hero.tsx`:

```typescript
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
      </motion.section>
    );
};
```

- [ ] **Step 2: Update page.tsx to use new Hero**

Open `app/page.tsx` and replace entire content with:

```typescript
"use client";

import { Navigation } from "@/components/ui/Navigation";
import { Hero } from "@/components/sections/Hero";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0f0f23]">
      <Navigation />
      <Hero />
    </main>
  );
}
```

- [ ] **Step 3: Run dev server and verify Hero section**

Run: `npm run dev`
Expected: Hero section visible with bento grid, animated role words, stats card, CTA card

- [ ] **Step 4: Commit**

```bash
git add components/sections/Hero.tsx app/page.tsx
git commit -m "feat: add Hero section with bento grid layout"
```

---

## Task 4: Create Projects Section with 3D Flip Cards

**Files:**
- Create: `components/sections/Projects.tsx`

- [ ] **Step 1: Create Projects component**

Create `components/sections/Projects.tsx`:

```typescript
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
    // Simple categorization based on project description/title
    const desc = project.title.toLowerCase() + " " + project.des.toLowerCase();
    if (activeFilter === "Healthcare") return desc.includes("vet") || desc.includes("health");
    if (activeFilter === "E-Commerce") return desc.includes("commerce") || desc.includes("shop");
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
```

- [ ] **Step 2: Add Projects to page.tsx**

Open `app/page.tsx` and update:

```typescript
"use client";

import { Navigation } from "@/components/ui/Navigation";
import { Hero } from "@/components/sections/Hero";
import { Projects } from "@/components/sections/Projects";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0f0f23]">
      <Navigation />
      <Hero />
      <Projects />
    </main>
  );
}
```

- [ ] **Step 3: Run dev server and verify Projects section**

Run: `npm run dev`
Expected: Projects visible with flip card animation on hover

- [ ] **Step 4: Commit**

```bash
git add components/sections/Projects.tsx app/page.tsx
git commit -m "feat: add Projects section with 3D flip cards"
```

---

## Task 5: Create Skills Section

**Files:**
- Create: `components/sections/Skills.tsx`

- [ ] **Step 1: Create Skills component**

Create `components/sections/Skills.tsx`:

```typescript
"use client";

import React from "react";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { fadeInUp, staggerContainer } from "@/lib/animations";

const SKILL_CATEGORIES = [
  {
    icon: "⚛️",
    title: "Frontend Development",
    description: "Building responsive, performant user interfaces",
    skills: ["React", "Next.js", "TypeScript", "Tailwind", "Redux", "Material UI", "HTML5", "CSS3"],
    gradient: "from-purple-600 to-purple-800",
  },
  {
    icon: "🔧",
    title: "Backend Development",
    description: "Scalable server-side applications and APIs",
    skills: ["Node.js", "Express", "Python", "Web Sockets", "REST APIs", "GraphQL"],
    gradient: "from-pink-500 to-rose-600",
  },
  {
    icon: "🗄️",
    title: "Database & Storage",
    description: "Efficient data modeling and management",
    skills: ["MongoDB", "Firebase", "PostgreSQL", "Redis"],
    gradient: "from-cyan-500 to-blue-600",
  },
  {
    icon: "🚀",
    title: "DevOps & Tools",
    description: "Deployment and development workflow",
    skills: ["Git", "Vercel", "Netlify", "Jira", "Docker"],
    gradient: "from-orange-500 to-yellow-500",
  },
  {
    icon: "🎨",
    title: "Design & Tools",
    description: "UI/UX design and development tools",
    skills: ["Figma", "VS Code", "Postman", "Chrome DevTools"],
    gradient: "from-teal-400 to-pink-300",
  },
  {
    icon: "📱",
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
        {/* Section Header */}
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

        {/* Skills Grid */}
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
```

- [ ] **Step 2: Add Skills to page.tsx**

Open `app/page.tsx` and update:

```typescript
import { Skills } from "@/components/sections/Skills";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0f0f23]">
      <Navigation />
      <Hero />
      <Projects />
      <Skills />
    </main>
  );
}
```

- [ ] **Step 3: Run dev server and verify Skills section**

Run: `npm run dev`
Expected: Skills grid with 6 category cards, hover effects on tags

- [ ] **Step 4: Commit**

```bash
git add components/sections/Skills.tsx app/page.tsx
git commit -m "feat: add Skills section with category cards"
```

---

## Task 6: Create Experience Section with Timeline

**Files:**
- Create: `components/sections/Experience.tsx`

- [ ] **Step 1: Create Experience component**

Create `components/sections/Experience.tsx`:

```typescript
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
```

- [ ] **Step 2: Add Experience to page.tsx**

Open `app/page.tsx` and update:

```typescript
import { Experience } from "@/components/sections/Experience";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0f0f23]">
      <Navigation />
      <Hero />
      <Projects />
      <Skills />
      <Experience />
    </main>
  );
}
```

- [ ] **Step 3: Run dev server and verify Experience section**

Run: `npm run dev`
Expected: Timeline with gradient line, glowing dots, cards slide right on hover

- [ ] **Step 4: Commit**

```bash
git add components/sections/Experience.tsx app/page.tsx
git commit -m "feat: add Experience section with timeline"
```

---

## Task 7: Create About Section

**Files:**
- Create: `components/sections/About.tsx`

- [ ] **Step 1: Create About component**

Create `components/sections/About.tsx`:

```typescript
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
```

- [ ] **Step 2: Add About to page.tsx**

Open `app/page.tsx` and update:

```typescript
import { About } from "@/components/sections/About";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0f0f23]">
      <Navigation />
      <Hero />
      <Projects />
      <Skills />
      <Experience />
      <About />
    </main>
  );
}
```

- [ ] **Step 3: Run dev server and verify About section**

Run: `npm run dev`
Expected: About section with profile image, bio, stats, social links

- [ ] **Step 4: Commit**

```bash
git add components/sections/About.tsx app/page.tsx
git commit -m "feat: add About section with profile and bio"
```

---

## Task 8: Create Contact Section

**Files:**
- Create: `components/sections/Contact.tsx`

- [ ] **Step 1: Create Contact component**

Create `components/sections/Contact.tsx`:

```typescript
"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { fadeInUp, staggerContainer } from "@/lib/animations";
import toast from "react-hot-toast";

const CONTACT_INFO = [
  { icon: "📧", label: "Email", value: "anik@example.com", href: "mailto:anik@example.com" },
  { icon: "💼", label: "LinkedIn", value: "LinkedIn", href: "https://www.linkedin.com/in/anik-deb-0117641b2/" },
  { icon: "🐙", label: "GitHub", value: "GitHub", href: "https://github.com/Anikcse19" },
  { icon: "📍", label: "Location", value: "Chattogram, Bangladesh" },
];

export const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.message) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to send message");

      toast.success("Message sent successfully!");
      setFormData({ name: "", email: "", message: "" });
    } catch (error) {
      toast.error("Failed to send message. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section id="contact" className="py-20 px-4">
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
            Get In Touch
          </motion.p>
          <motion.h2 variants={fadeInUp} className="text-4xl md:text-5xl font-bold text-white">
            Let&apos;s Work Together
          </motion.h2>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8"
        >
          {/* Contact Info */}
          <motion.div variants={fadeInUp}>
            <GlassCard className="p-8 h-full">
              <h3 className="text-2xl font-bold text-white mb-2">Contact Information</h3>
              <p className="text-neutral-400 mb-8">Feel free to reach out through any of these channels</p>

              <div className="space-y-4">
                {CONTACT_INFO.map((info) => (
                  <div key={info.label}>
                    {info.href ? (
                      <a
                        href={info.href}
                        target={info.href.startsWith("http") ? "_blank" : undefined}
                        rel="noopener noreferrer"
                        className="flex items-center gap-4 p-4 bg-white/5 hover:bg-purple-500/10 rounded-xl transition-colors group"
                      >
                        <span className="text-xl">{info.icon}</span>
                        <span className="text-neutral-300 group-hover:text-purple-400 transition-colors">
                          {info.value}
                        </span>
                      </a>
                    ) : (
                      <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl">
                        <span className="text-xl">{info.icon}</span>
                        <span className="text-neutral-300">{info.value}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </GlassCard>
          </motion.div>

          {/* Contact Form */}
          <motion.div variants={fadeInUp}>
            <GlassCard className="p-8">
              <h3 className="text-xl font-bold text-white mb-6">Send a Message</h3>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-neutral-400 text-sm mb-2">Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Your name"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-purple-500/50 focus:bg-white/8 text-white placeholder-neutral-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-neutral-400 text-sm mb-2">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="your@email.com"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-purple-500/50 focus:bg-white/8 text-white placeholder-neutral-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-neutral-400 text-sm mb-2">Message</label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Tell me about your project..."
                    rows={5}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-purple-500/50 focus:bg-white/8 text-white placeholder-neutral-500 transition-all resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-500 hover:to-purple-700 text-white font-semibold rounded-xl transition-all hover:translate-y-[-2px] hover:shadow-lg hover:shadow-purple-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                >
                  {isLoading ? "Sending..." : "Send Message →"}
                </button>
              </form>
            </GlassCard>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};
```

- [ ] **Step 2: Add Contact to page.tsx**

Open `app/page.tsx` and update:

```typescript
import { Contact } from "@/components/sections/Contact";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0f0f23]">
      <Navigation />
      <Hero />
      <Projects />
      <Skills />
      <Experience />
      <About />
      <Contact />
    </main>
  );
}
```

- [ ] **Step 3: Run dev server and verify Contact section**

Run: `npm run dev`
Expected: Contact section with info cards and form, toast notifications on submit

- [ ] **Step 4: Commit**

```bash
git add components/sections/Contact.tsx app/page.tsx
git commit -m "feat: add Contact section with form"
```

---

## Task 9: Update Footer

**Files:**
- Modify: `components/Footer.jsx`

- [ ] **Step 1: Update Footer component**

Open `components/Footer.jsx` and replace with:

```typescript
import React from "react";
import { GlassCard } from "@/components/ui/GlassCard";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="py-12 px-4 border-t border-white/5">
      <div className="max-w-6xl mx-auto">
        <div className="glass rounded-2xl p-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Logo */}
            <div className="text-2xl font-bold text-white">AD.</div>

            {/* Copyright */}
            <p className="text-neutral-400 text-sm">
              © {currentYear} Anik Chandra Deb. All rights reserved.
            </p>

            {/* Location */}
            <div className="flex items-center gap-2 text-neutral-400 text-sm">
              <span>📍</span>
              <span>Chattogram, Bangladesh</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
```

- [ ] **Step 2: Rename to .tsx and add to page.tsx**

Rename file and update `app/page.tsx`:

```bash
mv components/Footer.jsx components/Footer.tsx
```

Update `app/page.tsx`:

```typescript
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0f0f23]">
      <Navigation />
      <Hero />
      <Projects />
      <Skills />
      <Experience />
      <About />
      <Contact />
      <Footer />
    </main>
  );
}
```

- [ ] **Step 3: Run dev server and verify Footer**

Run: `npm run dev`
Expected: Glassmorphism footer with logo, copyright, location

- [ ] **Step 4: Commit**

```bash
git add components/Footer.tsx app/page.tsx
git commit -m "feat: update Footer with glassmorphism design"
```

---

## Task 10: Final Polish and Testing

**Files:**
- All components

- [ ] **Step 1: Test responsive behavior**

Run: `npm run dev`
Test at: 375px (mobile), 768px (tablet), 1024px+ (desktop)
Expected: All sections responsive, navigation collapses gracefully

- [ ] **Step 2: Test theme toggle**

Click theme toggle button
Expected: Dark/light themes switch, no layout breaks

- [ ] **Step 3: Test scroll animations**

Scroll through page
Expected: Elements fade in smoothly on scroll

- [ ] **Step 4: Test all links**

Click all navigation links, project links, social links
Expected: All links work correctly

- [ ] **Step 5: Test contact form**

Submit form with valid/invalid data
Expected: Toast notifications appear

- [ ] **Step 6: Build production version**

Run: `npm run build`
Expected: No errors, successful build

- [ ] **Step 7: Fix any console errors**

Check browser console for errors
Expected: No console errors or warnings

- [ ] **Step 8: Final commit**

```bash
git add .
git commit -m "feat: complete portfolio redesign with glassmorphism UI"
```

---

## Completion Checklist

- [ ] All 6 sections implemented (Hero, Projects, Skills, Experience, About, Contact)
- [ ] Glassmorphism styling applied consistently
- [ ] 3D flip cards working on Projects
- [ ] Timeline working on Experience
- [ ] Theme toggle functional
- [ ] All real data imported correctly
- [ ] Responsive on all screen sizes
- [ ] No console errors
- [ ] Production build successful
- [ ] All links verified
