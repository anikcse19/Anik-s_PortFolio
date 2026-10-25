/**
 * Initial content for onboarding, taken from the previous version of this
 * portfolio (data/index.ts and the old section components) and from details
 * Anik provided. Nothing here is invented:
 *
 *  - Unverified or conflicting items are seeded as DRAFTS for review.
 *  - Unsupported claims from the old site were removed (fake stats, "10+ happy
 *    clients", the unverified "35% API performance" figure, template tech tags).
 *  - Fields with unknown values are left empty rather than guessed.
 */
import type { ArticleInput, CaseStudyInput, ExperienceInput, ProjectInput, SkillCategoryInput } from "@/lib/validation/content";
import { defaultHomeConfig, type AboutSettings, type ContactSettings, type HomeConfig, type ProfileSettings } from "@/lib/validation/settings";

const seo = { title: "", description: "", ogImage: "" };

/* ------------------------------------------------------------------ Settings */

export const profile: ProfileSettings = {
  name: "Anik Chandra Deb",
  title: "Senior Full-Stack Software Engineer",
  positioning:
    "Full-stack engineer with strong frontend experience and practical product-development skills, with a growing focus on backend architecture, system design, security and scalable applications.",
  location: "Chattogram, Bangladesh",
  availability: "",
  // Résumé link from the previous site's "Download Resume" button.
  resumeUrl: "https://drive.google.com/file/d/1m2-fIuydChZ2q6GItzuNdJX7J0lfQIy8/view?usp=drive_link",
  portrait: { url: "/me.png", alt: "Portrait of Anik Chandra Deb", caption: "" },
  highlights: [],
};

export const contact: ContactSettings = {
  // The old site only had a placeholder (anik@example.com); set your real address in Admin › Contact.
  email: "",
  formEnabled: true,
  formIntro: "For full-time roles, remote positions or project enquiries, send a message or email me directly.",
  responseNote: "",
  socials: [
    { kind: "github", label: "GitHub", url: "https://github.com/Anikcse19" },
    { kind: "linkedin", label: "LinkedIn", url: "https://www.linkedin.com/in/anik-deb-0117641b2/" },
  ],
};

export const about: AboutSettings = {
  headline: "",
  sections: {
    introduction:
      "<p>I’m a software developer based in Chattogram, Bangladesh, with a full-stack background and strong frontend experience. I build production web applications — e-commerce and business systems, and the backend integrations behind them.</p>",
    philosophy: "",
    expertise:
      "<p>My day-to-day stack is React, Next.js, TypeScript and Node.js with Express, backed by MongoDB or PostgreSQL. Beyond the interface, I work on authentication and authorization, rate limiting, payment integrations and third-party APIs, with Redis and asynchronous job processing where a workload needs it, and Docker and CI/CD for delivery.</p>",
    learning:
      "<p>I am currently studying distributed-systems topics that I have explored but not yet run in production: Kafka and BullMQ for messaging and job queues, Kubernetes, database replication and sharding, load balancing, API gateways, reverse and forward proxies, and horizontal versus vertical scaling.</p>",
    journey: "",
    systemDesign:
      "<p>I’m increasingly focused on backend architecture and system design: how data is modelled and indexed, where caching and queues belong, how services fail and recover, and what changes when an application has to scale.</p>",
    approach: "",
    interests:
      "<p>I’m a co-founder of SoftHexis. Longer term, I want to keep growing as a strong software engineer while building that business.</p>",
  },
};

const homeConfig: HomeConfig = (() => {
  const config = defaultHomeConfig();
  config.sections = config.sections.map((s) => {
    if (s.type === "intro") {
      return {
        ...s,
        heading: "What I work on",
        intro:
          "I build production web applications — e-commerce platforms, business systems and the integrations around them: authentication, payments, third-party APIs and the data models underneath.\n\nMost of my experience is in frontend and full-stack work with React, Next.js, TypeScript and Node.js. I’m deliberately growing toward backend architecture, system design, security and applications that keep working as they scale.",
      };
    }
    if (s.type === "contact") {
      return { ...s, heading: "Let’s talk", intro: "Open to conversations about full-stack and frontend engineering roles, and selected project work." };
    }
    return s;
  });
  return config;
})();

export const homepage = { draft: homeConfig, published: homeConfig, publishedAt: new Date().toISOString() };

/* ------------------------------------------------------------------ Projects */

function project(p: Partial<ProjectInput> & Pick<ProjectInput, "title" | "slug" | "summary">): ProjectInput {
  return {
    type: "professional",
    category: "",
    year: "",
    organization: "",
    role: "",
    technologies: [],
    overview: "",
    problem: "",
    contribution: "",
    architecture: "",
    decisions: [],
    features: [],
    challenges: [],
    outcomes: [],
    impact: [],
    coverImage: null,
    gallery: [],
    liveUrl: "",
    repoUrl: "",
    featured: false,
    status: "published",
    seo,
    sortOrder: 0,
    ...p,
  };
}

export const projects: ProjectInput[] = [
  project({
    title: "RexVet — Online Veterinary Telehealth Platform",
    slug: "rexvet",
    summary:
      "A nonprofit platform providing affordable 24/7 veterinary telehealth, connecting pet owners with licensed vets for remote consultations, guidance and care.",
    category: "Healthcare",
    technologies: ["Next.js", "JavaScript", "Tailwind CSS", "WebSockets"],
    coverImage: { url: "/p1.png", alt: "RexVet homepage: “Online Veterinary Care” headline with a booking button and a video introduction from the CEO", caption: "" },
    liveUrl: "https://rexvet.org/",
    featured: true,
    sortOrder: 10,
  }),
  project({
    title: "Sales & Analytics Management System",
    slug: "sales-analytics-management-system",
    summary:
      "An e-commerce back office with role-based access for administrators, managers and support staff, covering orders, inventory, customers and sales analytics.",
    category: "Business systems",
    technologies: ["Next.js", "JavaScript", "Tailwind CSS", "Material UI"],
    coverImage: { url: "/p2.png", alt: "Analytics dashboard showing order, sales and revenue totals, an order-status donut chart and a sidebar of admin modules", caption: "" },
    // The old link pointed at a login-protected admin dashboard, so no public live URL is listed.
    liveUrl: "",
    sortOrder: 20,
  }),
  project({
    title: "Darkak — Multi-vendor E-commerce",
    slug: "darkak",
    summary: "A responsive multi-vendor e-commerce platform built for the Bangladeshi market, designed to work smoothly across devices.",
    category: "E-commerce",
    technologies: ["React", "JavaScript", "Tailwind CSS", "Material UI"],
    coverImage: { url: "/p3.png", alt: "Darkak storefront with category navigation, search bar and a promotional banner for wireless earbuds", caption: "" },
    liveUrl: "https://darkak.com.bd/",
    featured: true,
    sortOrder: 30,
  }),
  project({
    title: "Rex Marine — International Shipping & Logistics Platform",
    slug: "rex-marine-cargo",
    summary:
      "A shipping and logistics website with interactive features such as shipment tracking, load-board access and contact workflows that support day-to-day operations.",
    category: "Logistics",
    technologies: ["Next.js", "TypeScript", "Tailwind CSS"],
    coverImage: { url: "/p4.png", alt: "Rex Marine homepage with the headline “Ship anything anywhere” over a cargo ship, with shipping and tracking buttons", caption: "" },
    liveUrl: "https://www.rexmarinecargo.com/",
    featured: true,
    sortOrder: 40,
  }),
  project({
    title: "Rex Sailing — Sailing School & Charter Platform",
    slug: "rex-sailing",
    summary: "A sailing school and charter website offering training, certifications and sailing experiences in the Caribbean, with multi-language support.",
    category: "Education & travel",
    technologies: ["Next.js", "TypeScript", "Tailwind CSS"],
    coverImage: { url: "/p5.png", alt: "Rex Sailing homepage hero with people on a sailboat at sunset and a “View passages” button", caption: "" },
    liveUrl: "https://www.rexsailing.com/en",
    sortOrder: 50,
  }),
  project({
    title: "Cubazo — Cross-border Commerce Platform",
    slug: "cubazo",
    summary:
      "A Spanish-language commerce platform that lets people abroad buy essential goods and send them to family in Cuba, with fast delivery and support services.",
    category: "E-commerce",
    technologies: ["Next.js", "TypeScript", "Tailwind CSS"],
    coverImage: { url: "/p6.png", alt: "Cubazo homepage in Spanish with a marketplace headline and a currency exchange calculator", caption: "" },
    liveUrl: "https://cubazo.com/es",
    sortOrder: 60,
  }),
];

/* ---------------------------------------------------------------- Experience */

function experience(e: Partial<ExperienceInput> & Pick<ExperienceInput, "organization" | "title">): ExperienceInput {
  return {
    organizationUrl: "",
    employmentType: null,
    location: "",
    workMode: null,
    startDate: "",
    endDate: "",
    isCurrent: false,
    summary: "",
    achievements: [],
    technologies: [],
    status: "draft",
    sortOrder: 0,
    ...e,
  };
}

export const experiences: ExperienceInput[] = [
  experience({
    organization: "Betafore",
    // Title and dates were not available — confirm before publishing.
    title: "Software Developer (confirm title)",
    isCurrent: true,
    summary: "",
    status: "draft",
  }),
  experience({
    organization: "SoftHexis",
    title: "Co-founder",
    employmentType: "founder",
    isCurrent: true,
    status: "draft",
  }),
  experience({
    // From the old site ("April 2025 – Present"). It conflicts with Betafore being the current role, so it stays a draft for review.
    organization: "RexVet",
    title: "Full Stack Developer",
    location: "United States",
    workMode: "remote",
    startDate: "2025-04",
    summary:
      "Building modern, scalable and accessible products with Next.js and TypeScript, including component libraries and design-system work, in collaboration with cross-functional teams.",
    technologies: ["Next.js", "TypeScript", "React"],
    status: "draft",
  }),
  experience({
    organization: "ScientistX",
    title: "Full Stack Developer",
    location: "Dhaka",
    workMode: "remote",
    startDate: "2024-01",
    endDate: "2025-05",
    summary:
      "Developed and maintained full-stack web applications using React, Node.js and Express. Built and consumed GraphQL and REST APIs and implemented authentication.",
    technologies: ["React", "Node.js", "Express", "GraphQL", "MongoDB"],
    status: "published",
  }),
  experience({
    organization: "CloudySign LLC",
    title: "Frontend Developer",
    location: "Dubai",
    workMode: "remote",
    startDate: "2021-02",
    endDate: "2023-12",
    summary:
      "Translated wireframes into responsive interfaces with React and Tailwind CSS, worked with REST APIs, managed state with Redux and Zustand, and implemented authentication, role-based access control and session management.",
    technologies: ["React", "Tailwind CSS", "Redux", "Zustand", "REST APIs"],
    status: "published",
  }),
];

/* -------------------------------------------------------------------- Skills */

function category(name: string, slug: string, description: string, skills: [string, SkillCategoryInput["skills"][number]["level"]?][], sortOrder: number): SkillCategoryInput {
  return {
    name,
    slug,
    description,
    skills: skills.map(([n, level]) => ({ name: n, level: level ?? null, note: "" })),
    status: "published",
    sortOrder,
  };
}

export const skillCategories: SkillCategoryInput[] = [
  category("Frontend engineering", "frontend", "Component-based interfaces with an emphasis on responsiveness and maintainability.", [["React"], ["Next.js"], ["TypeScript"], ["JavaScript"], ["Tailwind CSS"], ["Redux"], ["Zustand"], ["Material UI"]], 10),
  category("Backend engineering", "backend", "APIs and the integrations business applications depend on.", [["Node.js"], ["Express.js"], ["REST APIs"], ["GraphQL"], ["WebSockets"], ["Payment integrations"], ["Third-party APIs"], ["Async job processing"]], 20),
  category("Databases & data modelling", "databases", "Schema design, indexing and caching.", [["MongoDB"], ["Mongoose"], ["PostgreSQL"], ["Redis"]], 30),
  category("Security & authentication", "security", "Protecting accounts, sessions and APIs.", [["Authentication"], ["Authorization / RBAC"], ["Session management"], ["Rate limiting"]], 40),
  category("Infrastructure & delivery", "infrastructure", "Packaging, deploying and shipping changes.", [["Docker"], ["CI/CD"], ["Vercel"], ["Git"]], 50),
  category(
    "System design & distributed systems",
    "system-design",
    "Topics I have studied and explored, not yet used in production.",
    [["Kafka", "learning"], ["BullMQ", "learning"], ["Kubernetes", "learning"], ["Replication & sharding", "learning"], ["Load balancing", "learning"], ["API gateways", "learning"], ["Reverse & forward proxies", "learning"], ["Horizontal & vertical scaling", "learning"]],
    60,
  ),
  category("Tooling", "tooling", "Everyday development tools.", [["Postman"], ["Chrome DevTools"], ["Figma"], ["Jira"]], 70),
];

/* -------------------------------------------------------------- Case studies */

let n = 0;
const id = () => `seed${String(++n).padStart(8, "0")}`;
const rich = (html: string) => ({ id: id(), type: "rich" as const, html });

export const caseStudies: CaseStudyInput[] = [
  {
    title: "Running a CMS-driven portfolio on a serverless free tier",
    slug: "serverless-portfolio-cms",
    summary:
      "How this site serves mostly static pages while a private admin panel edits everything in MongoDB — with secure sessions, tag-based cache invalidation and no file storage.",
    kind: "production",
    context: "Personal project · this website",
    role: "",
    technologies: ["Next.js", "TypeScript", "MongoDB", "Mongoose", "Zod", "Tailwind CSS"],
    coverImage: null,
    relatedProjectId: null,
    featured: true,
    // Review, add "What I implemented" in your own words, then publish.
    status: "draft",
    seo,
    sortOrder: 10,
    sections: [
      {
        id: id(),
        heading: "Requirements & constraints",
        topic: "requirements",
        blocks: [
          rich(
            "<ul><li>Deploy on Vercel’s free tier: serverless functions, no persistent filesystem, no long-running workers.</li><li>Persist content in a free MongoDB Atlas cluster.</li><li>Images are referenced by URL only — no uploads.</li><li>Drafts must never leak through public pages, the sitemap or metadata.</li><li>Public pages should be fast and cacheable; edits should appear immediately.</li></ul>",
          ),
        ],
      },
      {
        id: id(),
        heading: "Architecture",
        topic: "architecture",
        blocks: [
          rich("<p>The public site is rendered by React Server Components that read through a small cached data layer. The admin panel writes through Server Actions, which validate input, persist it and invalidate the affected cache tags.</p>"),
          {
            id: id(),
            type: "diagram",
            title: "Read and write paths",
            source:
              "flowchart LR\n  V[Visitor] --> P[Public pages<br/>ISR + cached queries]\n  P --> C[(Tagged data cache)]\n  C -->|miss| DB[(MongoDB Atlas)]\n  A[Admin] --> SA[Server Actions]\n  SA -->|session check + zod| DB\n  SA -->|updateTag| C",
            description:
              "Visitors hit public pages that read from a tagged data cache, which falls back to MongoDB on a miss. The admin uses server actions that check the session, validate with zod, write to MongoDB and then invalidate the cache tags.",
          },
        ],
      },
      {
        id: id(),
        heading: "Data model",
        topic: "data_model",
        blocks: [
          rich(
            "<p>Each content type (projects, case studies, articles, experience, skills, image library, messages) has its own collection with a unique index on <code>slug</code> and a compound index on <code>status</code> and sort order. Site-wide settings are stored once per key in a <code>settings</code> collection. Zod schemas are the single source of truth for validation; nested rich content is stored as structured blocks validated at the boundary.</p>",
          ),
        ],
      },
      {
        id: id(),
        heading: "Caching",
        topic: "caching",
        blocks: [
          rich(
            "<p>Every public query is wrapped in a cache entry tagged by content type, with a one-hour safety revalidation. Mutations call <code>updateTag</code>, so the next request rebuilds only what changed and the editor sees the result immediately.</p>",
          ),
        ],
      },
      {
        id: id(),
        heading: "Authentication & security",
        topic: "auth",
        blocks: [
          rich(
            "<ul><li>Passwords are hashed with scrypt (N = 2^17).</li><li>Sessions use a random 256-bit token in an httpOnly cookie; only its SHA-256 hash is stored, with idle and absolute expiry.</li><li>Login and contact endpoints are rate-limited with counters in MongoDB, so limits hold across serverless instances.</li><li>Every server action re-checks the session; the edge proxy only performs an optimistic redirect.</li><li>Rich text is sanitized against an allow-list on write and again on render.</li></ul>",
          ),
          {
            id: id(),
            type: "callout",
            tone: "tradeoff",
            title: "MongoDB instead of Redis for rate limiting",
            html: "<p>A Redis instance would be faster, but it would add a second paid or quota-limited service. At this traffic level an atomic upsert with a TTL index is sufficient.</p>",
          },
        ],
      },
      {
        id: id(),
        heading: "What I would improve next",
        topic: "next_steps",
        blocks: [rich("<ul><li>Capture image dimensions when a URL is saved, to improve layout hints.</li><li>Add end-to-end tests for the admin editing flows.</li></ul>")],
      },
    ],
  },
];

export const articles: ArticleInput[] = [];
