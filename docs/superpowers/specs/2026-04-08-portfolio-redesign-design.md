# Portfolio Redesign Design Specification

**Project:** Anik's Portfolio - Complete Redesign
**Date:** 2026-04-08
**Target:** Full Stack Developer roles
**Status:** Approved

## Overview

Complete redesign of existing Next.js portfolio to create a modern, glassmorphism-styled personal website that showcases full-stack development skills and helps attract job opportunities.

**Design Goals:**
- Showcase Full Stack development capabilities
- Modern, memorable visual design with glassmorphism
- Highlight 6+ production projects (RexVet, Darkak, etc.)
- Fast, responsive, and accessible
- Recruiters and hiring managers as primary audience

## Visual Style

### Glassmorphism Theme

**Background:** Dark gradient (#0f0f23 → #1a1a3e → #0f0f23)

**Glass Cards:**
- Background: `rgba(255, 255, 255, 0.05)`
- Backdrop blur: `10px`
- Border: `1px solid rgba(255, 255, 255, 0.1)`
- Border radius: `16-24px`
- Subtle hover effects with glow

**Accent Colors:**
- Primary gradient: `#667eea` → `#764ba2` (purple)
- Secondary gradients per section (pink, blue, orange, teal, red)
- Text highlights: `#a78bfa` (light purple)

**Typography:**
- Font: Inter or system-ui
- Headings: Bold, 700 weight
- Body: Regular, 400-500 weight
- Colors: White (#fff) for headings, light gray (#ccc/#aaa) for body

**Features Included:**
- Dark/Light theme toggle
- Scroll animations (fade/slide in)
- 3D interactive elements (keep existing Globe/components)
- Prominent resume download button
- Live animated stats counters

## Page Structure

### 1. Navigation Bar (Sticky)

**Components:**
- Logo: "AD." (left)
- Links: About, Projects, Experience, Contact (center/right)
- Theme toggle button: 🌓 (right)

**Style:** Glassmorphism card, fixed position at top

### 2. Hero Section (Bento Grid Layout)

**Layout:** CSS Grid with 2 columns, 2 rows

**Cards:**
1. **Main Card (2x2)** - Introduction
   - Greeting: "Hi, I'm"
   - Name: "Anik Chandra Deb" (large, bold)
   - Role: "Full Stack Developer specializing in Next.js, React, Node.js"
   - Animated role tags
   - CTA buttons: "View Projects →", "↓ Resume"
   - Floating orbs for depth

2. **Stats Card (1x1)** - Credibility indicators
   - Years Experience: "4+"
   - Projects Delivered: "15+"

3. **CTA Card (1x1)** - Availability
   - Status: "🚀 Available for work"
   - Text: "Open to full-time opportunities"
   - Button: "Let's Talk"

**Animations:** Floating orbs (keyframes float), hover lift effects

### 3. Projects Section (3D Flip Cards)

**Layout:** Responsive grid (auto-fit, minmax 320px)

**Card Front:**
- Project badge (Featured/Popular/Category)
- Emoji icon (64px)
- Title
- Short description
- "Hover to explore" hint

**Card Back (on hover):**
- Unique gradient background (6 different gradients)
- Full title
- Tech stack pills
- Action buttons: "View Live →", "GitHub"

**Projects to Display:**
1. RexVet - Veterinary Telehealth (purple gradient, Featured badge)
2. Sales & Analytics Dashboard (pink gradient)
3. Darkak E-Commerce (blue gradient, Popular badge)
4. Rex Marine Cargo (orange gradient)
5. Rex Sailing School (teal gradient)
6. Cuba Care Commerce (red gradient)

**Filter Tabs:** All, Full Stack, E-Commerce, SaaS, Healthcare

**Animation:** CSS 3D rotateY with springy easing (0.8s, cubic-bezier)

### 4. Skills Section (Category Cards)

**Layout:** Responsive grid (auto-fit, minmax 280px)

**Categories:**
1. Frontend Development (⚛️ purple icon)
2. Backend Development (🔧 pink icon)
3. Database & Storage (🗄️ blue icon)
4. DevOps & Deployment (🚀 orange icon)
5. Design & Tools (🎨 teal icon)
6. Mobile Development (📱 red icon)

**Card Content:**
- Gradient icon with emoji
- Category title
- Short description
- Skill tags (hoverable)

**Example Tags:**
- Frontend: React, Next.js, TypeScript, Tailwind, Framer Motion
- Backend: Node.js, Express, Next.js API, REST, GraphQL
- Database: PostgreSQL, MongoDB, Redis, Prisma, Mongoose
- DevOps: Vercel, Docker, Git, GitHub Actions
- Tools: Figma, VS Code, Postman, Chrome DevTools
- Mobile: React Native, Expo, iOS, Android

### 5. Experience Section (Vertical Timeline)

**Layout:** Single column, max-width 900px

**Timeline Style:**
- Gradient line on left (#667eea → #764ba2)
- Glowing dots at each position

**Timeline Card Content:**
- Date range
- Job title
- Company name
- Description
- Tech tags

**Animation:** Hover slides card right (translateX 8px)

**Flow:** Most recent at top → oldest at bottom

### 6. About Section (Two-Column)

**Layout:** Grid with 2 columns (stacks on mobile)

**Left Column:**
- Profile image (circular or rounded square)
- Placeholder: Replace with actual photo

**Right Column:**
- Heading: "Hello, I'm Anik"
- Bio text with highlighted keywords
- Stats row: 4+ years, 15+ projects, 10+ clients

### 7. Contact Section (Two-Column)

**Layout:** Grid with 2 columns (stacks on mobile)

**Left Column - Contact Info:**
- Email link
- LinkedIn link
- GitHub link
- Twitter link
- Location: Bangladesh

**Right Column - Contact Form:**
- Name input
- Email input
- Message textarea
- Submit button with gradient

### 8. Footer

**Components:**
- Logo: "AD."
- Copyright text
- Social links (repeat from contact)

## Technical Implementation

### Tech Stack

**Framework:** Next.js 14+ (App Router)
**Styling:** Tailwind CSS
**Animations:** Framer Motion
**3D Components:** Keep existing @react-three/fiber components (Globe)
**Theme:** next-themes for dark/light toggle
**Icons:** Lucide React or emoji (as shown in mockups)
**Language:** TypeScript

### Component Structure

```
app/
  page.tsx (main page)
  layout.tsx (root layout with theme provider)
  globals.css (theme variables, glassmorphism utilities)

components/
  ui/
    GlassCard.tsx (reusable glassmorphism card)
    Navigation.tsx (sticky nav with theme toggle)
    ThemeToggle.tsx
  sections/
    Hero.tsx (bento grid)
    Projects.tsx (3D flip cards)
    Skills.tsx (category cards)
    Experience.tsx (timeline)
    About.tsx (two-column layout)
    Contact.tsx (form + info)
  Footer.tsx

lib/
  utils.ts (cn helper for class merging)
  animations.ts (framer motion variants)

data/
  projects.ts (project data)
  skills.ts (skill categories)
  experience.ts (work history)
```

### Key Utilities

**Glassmorphism utility class:**
```css
.glass {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}
```

**3D Flip card:**
```css
.flip-card {
  perspective: 1000px;
}
.flip-card:hover .flip-card-inner {
  transform: rotateY(180deg);
}
```

### Responsive Breakpoints

- Mobile: < 768px (stack everything)
- Tablet: 768px - 1024px (adjust grid columns)
- Desktop: > 1024px (full layout)

## Performance Considerations

1. **Images:** Use Next.js Image component with optimization
2. **Animations:** Use CSS transforms (GPU accelerated)
3. **Code splitting:** Lazy load heavy components (3D Globe)
4. **Font loading:** Use next/font for optimal loading
5. **Bundle size:** Tree-shake unused Framer Motion features

## Accessibility

- Semantic HTML (nav, main, section, article)
- ARIA labels where needed
- Keyboard navigation support
- Focus states on all interactive elements
- Color contrast meets WCAG AA standards
- Reduced motion media query support

## Data Sources (Reuse Existing)

**Projects:** `data/index.ts` → `projects` array
**Skills:** Extract from project tech stacks
**Experience:** `data/index.ts` → `workExperience` array
**Navigation:** `data/index.ts` → `navItems` array

## Implementation Notes

1. **Preserve working 3D components** from current site (Globe, etc.)
2. **Keep project data structure** - only update UI
3. **Add theme provider** at root level
4. **Implement intersection observer** for scroll animations
5. **Use CSS custom properties** for easy theme customization
6. **Test on mobile** extensively - glassmorphism needs careful tuning

## Success Criteria

✅ Glassmorphism visual style implemented consistently
✅ All 6 sections working (Hero, Projects, Skills, Experience, About, Contact)
✅ 3D flip cards working smoothly on hover
✅ Dark/light theme toggle functional
✅ All projects from data displayed
✅ Responsive on mobile, tablet, desktop
✅ Scroll animations added
✅ Resume download button prominent
✅ Contact form functional (backend or email link)
✅ Page load time < 3 seconds
✅ No console errors
