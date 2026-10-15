# Web Performance Playbook — Building Fast UIs from Day One

Oct 14, 2026 · @Betafore

## 1. Why this document exists

Performance problems are almost never caused by one big mistake — they are the sum of hundreds of small, avoidable decisions made over months. A team ships features for a year, then runs Lighthouse and finds a 40–50 mobile score, and fixing it costs weeks of rework. This playbook exists so that never happens again: performance is designed in from day one, not patched in at the end.

**Who this is for:** frontend developers, UI engineers, and reviewers — from juniors learning the fundamentals to seniors enforcing standards in code review.

**How to use it:**

1. Read sections 2–3 first — they explain *what* is measured and *the mindset* that prevents debt.
2. Sections 4–9 are the practice areas: each one lists what to do, what never to do, and why.
3. Section 10 contains hands-on exercises — run them yourself to *see* the score difference each practice makes.
4. Section 11 is the checklist — pin it to your PR template and CI pipeline.

**The core principle:** a slow site is a sum of small negligences; a fast site is a sum of small disciplines. Every image you don't size, every library you import whole, every font you load blocking — each costs 1–3 points. Fifty of them cost you fifty points.

## 2. How performance is measured

You cannot maintain what you do not measure. Three **Core Web Vitals** are the industry-standard user-experience metrics, and they drive both your Lighthouse score and Google search ranking.

| Metric | What it measures | Good | Needs work | Poor |
| --- | --- | --- | --- | --- |
| **LCP** (Largest Contentful Paint) | How fast the main content becomes visible | ≤ 2.5 s | 2.5–4 s | > 4 s |
| **INP** (Interaction to Next Paint) | How fast the page responds to clicks/taps/keys | ≤ 200 ms | 200–500 ms | > 500 ms |
| **CLS** (Cumulative Layout Shift) | How much content jumps around while loading | ≤ 0.1 | 0.1–0.25 | > 0.25 |

Supporting diagnostic metrics: **TTFB** (server response, target < 800 ms), **FCP** (first paint, target < 1.8 s), **TBT** (Total Blocking Time — Lighthouse's lab proxy for INP, target < 200 ms).

**Lab data vs field data — know the difference:**

- **Lab data** (Lighthouse, DevTools): a simulated run on throttled hardware. Reproducible, great for catching regressions in CI. This is where your "40–50 mobile score" comes from.
- **Field data** (CrUX, real-user monitoring): what real visitors on real devices actually experience. This is what Google ranks you on. A perfect lab score with poor field data means your real users are on slower networks/devices than the lab assumes.

**Your toolbox:**

| Tool | Use it for |
| --- | --- |
| [PageSpeed Insights](https://pagespeed.web.dev/) | Lab + field data for any public URL |
| Lighthouse (Chrome DevTools) | Local audits during development |
| DevTools Performance panel | Finding long tasks, layout thrash, render bottlenecks |
| DevTools Network panel | Payload sizes, waterfall, caching behavior |
| [WebPageTest](https://www.webpagetest.org/) | Deep waterfall analysis, filmstrips, multi-location tests |
| `webpack-bundle-analyzer` / `source-map-explorer` | Seeing exactly what's inside your JS bundle |
| Lighthouse CI | Automated performance budgets in your pipeline |

**Rule:** always audit on **mobile, throttled** settings. Mobile is the worst case and the majority of traffic — if mobile is fast, desktop is fast.

## 3. The golden rules (mindset & budgets)

These five rules prevent the "big app, 45 score" situation. Everything in sections 4–9 is an application of these.

**Rule 1 — Set a performance budget on day one.** A budget is a hard limit the build fails against, not a wish. A sensible starting budget for a content/product site:

| Resource | Budget (compressed, initial load) |
| --- | --- |
| JavaScript | ≤ 170 KB |
| CSS | ≤ 50 KB |
| Images above the fold | ≤ 200 KB |
| Fonts | ≤ 100 KB (2–3 files max) |
| Total initial page weight | ≤ 500 KB–1 MB |
| Lighthouse mobile score | ≥ 90 (fail CI below 85) |

**Rule 2 — Measure continuously, not at the end.** Run Lighthouse on every PR (Lighthouse CI). A 3-point regression caught today is a 5-minute fix; fifty of them found next year is a rewrite.

**Rule 3 — Ship less.** The fastest byte is the one you never send. Before adding any library, image, font, or tracking script, ask: *what does this cost, and is it worth it?* `npm install` is a performance decision.

**Rule 4 — Prioritize the critical path.** The user needs to see and use the above-the-fold content fast. Everything else — below-fold images, modals, analytics, chat widgets — loads *after*, lazily.

**Rule 5 — Build for the worst device, not your MacBook.** Your dev machine is 5–10× faster than a median Android phone on 4G. Test throttled (DevTools → Performance → CPU 4× slowdown, network Fast 4G/3G) at least weekly.

**Anti-patterns that create performance debt:**

- "We'll optimize later" — later never comes cheaply; cost grows with codebase size.
- Treating performance as one person's job — it's a review criterion, like correctness.
- Only testing on desktop broadband — your 40–50 mobile score was invisible for months because nobody looked.
- Adding dependencies without checking their size ([bundlephobia.com](https://bundlephobia.com/) takes 10 seconds).

## 4. Images & media — the #1 offender

Images are typically 50–70% of page weight and the most common cause of poor LCP and CLS. Most image problems are fixed by five habits.

**❌ Never do this:**

```html
<!-- 4000px camera photo, no dimensions, eager loaded -->
<img src="hero.png">
```

This one line commits four sins: oversized file, wrong format (PNG for a photo), no width/height (causes CLS), and it loads even if it's off-screen.

**✅ Do this instead:**

```html
<img
  src="hero-800.webp"
  srcset="hero-400.webp 400w, hero-800.webp 800w, hero-1600.webp 1600w"
  sizes="(max-width: 600px) 100vw, 800px"
  width="800" height="450"
  alt="Product dashboard"
  fetchpriority="high"
>
```

**The five habits:**

1. **Modern formats.** WebP or AVIF for everything; AVIF is \~30% smaller than WebP. Keep JPEG/PNG only as a `<picture>` fallback if you must support very old browsers. SVG for icons and logos.
2. **Serve the size displayed.** Never let the browser downscale a 4000px image into a 400px slot. Use `srcset`/`sizes`, or an image CDN (Cloudinary, imgix, Next.js `<Image>`) that resizes on the fly.
3. **Always set `width` and `height`** (or CSS `aspect-ratio`). The browser reserves the space before the image loads — this alone eliminates most CLS.
4. **Lazy-load everything below the fold:** `loading="lazy"`. But **never** lazy-load the LCP/hero image — give it `fetchpriority="high"` instead (and preload it if it's set via CSS background).
5. **Compress.** Quality 75–85 is visually indistinguishable from 100 and half the size. Automate it in the build or CDN — never rely on humans remembering.

**Video:** never use GIF for animation (a 5 MB GIF is a 300 KB MP4/WebM). Use `<video autoplay muted loop playsinline>` with `preload="none"` or `poster` for below-fold video. Embed YouTube with a façade (thumbnail + click-to-load) — a raw YouTube iframe pulls \~500 KB of JS on page load.

**Quick impact reference:**

| Mistake | Typical cost |
| --- | --- |
| Unoptimized hero photo (2–4 MB) | LCP +2–5 s, 10–20 Lighthouse points |
| Missing width/height on images | CLS 0.1–0.4, 5–15 points |
| Eager-loading 30 below-fold images | LCP +1–2 s on mobile |
| GIF instead of video | 2–10 MB wasted |

## 5. JavaScript discipline

JavaScript is the most expensive resource byte-for-byte: it must be downloaded, parsed, compiled, **and executed** — all on the main thread. 1 MB of JS hurts far more than 1 MB of image. In large apps, uncontrolled JS growth is the usual reason mobile scores drift from 90 to 45.

**❌ Never do this:**

```js
// Imports the ENTIRE library (~70 KB) for one function
import _ from 'lodash';
_.debounce(fn, 300);

// Imports a 500 KB chart library on every page,
// even pages with no charts
import Chart from 'chart.js';

// moment.js: 300 KB with locales, for date formatting
import moment from 'moment';
```

**✅ Do this instead:**

```js
// Import only what you use (tree-shakeable)
import debounce from 'lodash-es/debounce';   // ~2 KB

// Load heavy components only when needed
const Chart = lazy(() => import('./ChartPanel'));

// Pick small alternatives
import { format } from 'date-fns';            // ~7 KB used
// or use the built-in Intl.DateTimeFormat    // 0 KB
```

**The rules:**

1. **Code-split by route.** Every page loads only its own JS. Modern frameworks (Next.js, Nuxt, SvelteKit) do this by default — don't defeat it by importing everything in a shared root layout.
2. **Lazy-load heavy, conditional UI:** modals, editors, charts, maps, admin panels. If it's not visible on first paint, it shouldn't be in the first bundle.
3. **Audit every dependency.** Check [bundlephobia.com](https://bundlephobia.com/) before `npm install`. Prefer small/native alternatives: `date-fns` or `Intl` over `moment`, native `fetch` over `axios` (when sufficient), CSS over JS animation libraries.
4. **Inspect the bundle quarterly** with `webpack-bundle-analyzer` or `source-map-explorer`. Teams are routinely shocked to find two chart libraries, three date libraries, and a 200 KB polyfill nobody needs.
5. **Defer non-critical scripts:** `defer` for your app code, and load analytics/chat/tracking after the page is interactive (`requestIdleCallback` or on first interaction).
6. **Keep the main thread free.** Break up long tasks (> 50 ms) — they are what destroys INP. Use `scheduler.yield()`/`setTimeout` chunking for big loops, web workers for heavy computation (parsing, search indexing, image processing).
7. **Avoid re-render storms** (framework-specific detail in section 9): a keystroke that re-renders a 500-row table is an INP killer.

**Third-party scripts — the silent killer.** Tag managers, A/B testing, chat widgets, ad scripts often add 500 KB–2 MB of JS you don't control. Rules: every third-party tag needs an owner and a justification; load them after interactivity; review the list quarterly and delete dead ones; use façades for heavy embeds. One tag manager left to grow freely can single-handedly cost 20 Lighthouse points.

## 6. CSS, rendering & layout stability

CSS blocks rendering: the browser paints nothing until all CSS in `<head>` is downloaded and parsed. And after first paint, careless DOM/CSS work causes layout shift (CLS) and jank.

**Keep CSS small and render-friendly:**

- Ship only the CSS each page uses. Utility frameworks (Tailwind) purge unused classes automatically; with plain CSS, audit with DevTools → Coverage. A 500 KB global stylesheet on every page is pure render delay.
- Inline the **critical CSS** (above-the-fold styles, \~10–15 KB) in `<head>` and load the rest asynchronously, if you're chasing the last few hundred ms of FCP.
- Avoid `@import` in CSS files — it chains requests serially.

**Eliminate layout shift (CLS) — reserve space for everything that arrives late:**

```css
/* ❌ Content jumps down when the banner/ad/image loads */
.ad-slot { }

/* ✅ Space is reserved before it loads */
.ad-slot { min-height: 250px; }
img, video { aspect-ratio: 16 / 9; width: 100%; }
```

Common CLS causes and fixes:

| Cause | Fix |
| --- | --- |
| Images without dimensions | `width`/`height` attributes or `aspect-ratio` |
| Ads, embeds, banners injected at top | Reserve a fixed-size slot |
| Web fonts swapping in | `font-display: swap` + `size-adjust` fallback (section 7) |
| Content injected above existing content | Insert below the viewport, or reserve space |
| Skeleton that doesn't match final layout | Make the skeleton the same size as the content |

**Animate cheaply — only `transform` and `opacity`:**

```css
/* ❌ Animating layout properties: recalculates layout every frame */
.card:hover { margin-top: -8px; width: 320px; }

/* ✅ Compositor-only: GPU handles it, main thread stays free */
.card { transition: transform 0.2s; }
.card:hover { transform: translateY(-8px) scale(1.02); }
```

Never animate `width`, `height`, `top`, `left`, `margin` — they trigger layout + paint on every frame and drop you below 60 fps on mobile.

**Avoid layout thrashing in JS** — don't alternate reads and writes of layout properties in a loop:

```js
// ❌ Read-write-read-write: forces a synchronous layout each iteration
items.forEach(el => { el.style.height = el.offsetHeight * 2 + 'px'; });

// ✅ Batch: read everything, then write everything
const heights = items.map(el => el.offsetHeight);
items.forEach((el, i) => { el.style.height = heights[i] * 2 + 'px'; });
```

**For very long lists** (feeds, tables with 1000+ rows): virtualize (render only visible rows — `react-window`, `vue-virtual-scroller`) or use CSS `content-visibility: auto` on off-screen sections so the browser skips rendering them.

## 7. Fonts

Fonts block text rendering (invisible text, FOIT) or cause layout shift when they swap in (FOUT). A careless font setup costs 5–10 points; the fix takes an hour.

**The rules:**

1. **Use WOFF2 only** — it's supported everywhere and 30% smaller than WOFF.
2. **Limit yourself to 2–3 font files total** (e.g. regular + bold of one family). Every weight/style is a separate download. Prefer a variable font if you need many weights — one file covers them all.
3. **Self-host.** Third-party font CSS (Google Fonts) adds an extra DNS + connection to another origin on the critical path. Download the WOFF2 files and serve them from your own domain/CDN with long cache headers.
4. **Always set `font-display: swap`** — text shows immediately in a fallback font, then swaps. Never leave the default (invisible text for up to 3 s).
5. **Preload the one font used above the fold:**

```html
<link rel="preload" href="/fonts/inter-var.woff2"
      as="font" type="font/woff2" crossorigin>
```

6. **Kill the swap-shift.** `font-display: swap` fixes invisibility but can cause CLS when the real font is a different size. Fix with a size-matched fallback:

```css
@font-face {
  font-family: 'Inter';
  src: url('/fonts/inter-var.woff2') format('woff2');
  font-display: swap;
}
@font-face {
  font-family: 'Inter-fallback';
  src: local('Arial');
  size-adjust: 107%;        /* match Inter's metrics */
  ascent-override: 90%;
}
body { font-family: 'Inter', 'Inter-fallback', sans-serif; }
```

7. **Subset** — if you only need Latin characters, strip the rest (`glyphhanger`, or download the Latin subset). A full multi-script font can be 300 KB; a Latin subset is 20–40 KB.
8. **System font stack is a valid choice.** `font-family: system-ui, sans-serif` costs 0 KB and 0 ms. For dashboards and internal tools it's often the right call.

## 8. Network, caching & data

Even perfect assets are slow if delivered badly. These are mostly one-time infrastructure settings — set them once, verify them in CI.

**Delivery checklist:**

- **CDN in front of everything** — static assets served from an edge near the user. TTFB from another continent without a CDN is 300–800 ms before a single byte of your app arrives.
- **Compression on:** Brotli (preferred) or gzip for all text responses (HTML, CSS, JS, JSON). Verify in DevTools → Network → `content-encoding` header. Uncompressed JS is 3–5× larger.
- **HTTP/2 or HTTP/3** — parallel requests on one connection; eliminates old-school domain sharding.
- **Long-lived immutable caching for fingerprinted assets:** `Cache-Control: public, max-age=31536000, immutable` for `app.a3f8c2.js`. Build tools fingerprint by default — don't serve assets without hashes.
- **Short/no cache for HTML** (`no-cache` or short max-age + ETag) so deploys show up immediately.

**Resource hints — tell the browser what matters:**

```html
<!-- Open the connection to critical third-party origins early -->
<link rel="preconnect" href="https://cdn.example.com" crossorigin>

<!-- Preload the LCP image / critical font (use sparingly: 2–3 max) -->
<link rel="preload" as="image" href="/hero-800.webp" fetchpriority="high">
```

Don't preload everything — each preload competes with genuinely critical resources. Preloading 10 things is the same as preloading nothing.

**API & data discipline (what makes big apps feel slow):**

- **Don't over-fetch.** Paginate lists (don't return 5,000 rows to render 20), select only needed fields, and avoid request waterfalls (A finishes → then B starts → then C). Fire independent requests in parallel; fetch critical data on the server/at route level, not after the component mounts.
- **Cache API responses client-side** (TanStack Query, SWR) so navigating back is instant instead of re-fetching.
- **Debounce** search-as-you-type (250–300 ms) — don't fire a request per keystroke.
- **Watch JSON size.** A 2 MB JSON payload must be downloaded *and* parsed on the main thread. If a response is over \~100 KB, question it.
- **TTFB belongs to the backend too:** slow DB queries, missing indexes, and cold serverless starts show up as a bad Lighthouse score. If TTFB > 800 ms, no frontend trick saves you — fix the server first (caching, query optimization, edge rendering).

## 9. Framework-specific practices

The fundamentals above apply everywhere; these are the extra traps and tools of the common stacks.

**Choose the right rendering strategy per page** — this decision alone often separates a 50 from a 90:

| Strategy | Use for | Why |
| --- | --- | --- |
| SSG (static) | Marketing, docs, blogs | Pre-built HTML from CDN — fastest possible |
| ISR / cached SSR | Product pages, listings | Static speed + periodic freshness |
| SSR | Personalized, SEO-critical dynamic pages | Content in first response; watch TTFB |
| Client-side SPA | Logged-in dashboards, internal tools | Fine when SEO/first-load matters less — but still budget the JS |

The classic failure: building the *public, SEO-facing* site as a pure client-side SPA. Users stare at a blank page while 1.5 MB of JS downloads, parses, executes, then fetches data. If the first paint depends on JavaScript finishing, mobile scores of 40–50 are the natural result.

**React / Next.js:**

- Use `next/image`, `next/font`, and `next/dynamic` — they implement sections 4, 7, and 5 for you. Plain `<img>` in a Next.js app is a review flag.
- Keep client components small ('use client' pushes everything below it into the browser bundle). Fetch data in server components where possible.
- Fix re-render storms: don't put frequently-changing state in a top-level context; memoize expensive children (`memo`, `useMemo`) *after profiling* with React DevTools Profiler, not by habit.
- Lists > \~100 complex rows: virtualize (`react-window` / `@tanstack/virtual`).

**Vue / Nuxt:**

- Use `<NuxtImg>`, `defineAsyncComponent`, and route-level code splitting (automatic — don't break it with global imports in plugins).
- Use `v-show` vs `v-if` deliberately; `shallowRef` for large objects you don't need deeply reactive; `v-once`/`v-memo` for static-heavy lists.

**Universal SPA pitfalls (any framework):**

- A "shared bundle" that grows forever because everything is imported in the root layout/store.
- Rendering 2,000 DOM nodes that are off-screen (use virtualization / `content-visibility`).
- Blocking route transitions on *all* data — show the shell immediately, stream/suspend the data.
- State libraries re-rendering the whole tree on any change — select narrow slices of state.
- Shipping dev builds or source-map-bloated bundles to production (verify bundle size in CI, not by eye).

## 10. Experience the difference — hands-on exercises

Reading numbers is not the same as seeing them move. Each exercise below is a before/after experiment: measure, change one thing, measure again, and record the delta. Run them in Chrome DevTools → Lighthouse, **Mobile** mode, incognito window (extensions skew scores). These make an excellent onboarding week for new team members.

**Exercise 1 — The unoptimized image (30 min).** Build a one-page site with a 3–4 MB JPEG hero as plain `<img src>`. Audit it. Then: convert to WebP at quality 80, resize to display width, add `width`/`height` and `fetchpriority="high"`. Audit again. *Expected: LCP drops by seconds; score jumps 10–25 points; CLS warning disappears.*

**Exercise 2 — The library you didn't need (30 min).** Make a page that imports all of `lodash` and `moment` to format one date and debounce one input. Check bundle size (`npx vite build` or your bundler's output). Replace with `Intl.DateTimeFormat` and a 10-line debounce. *Expected: \~350 KB → a few KB; TBT and score improve visibly on throttled CPU.*

**Exercise 3 — Layout shift hunt (20 min).** Create a page where an image without dimensions, a late-injected banner, and a swapping web font all load above existing text. Watch it on "Slow 4G" throttling — feel the jumping. Open DevTools → Performance → Layout Shift badges. Apply the fixes from sections 6–7. *Expected: CLS from \~0.3 to \~0.*

**Exercise 4 — The blocking long task (30 min).** Add a button that sorts/processes a 100k-item array synchronously, then try clicking other buttons while it runs — the page is frozen. Move the work to a Web Worker or chunk it with `await scheduler.yield()`. *Expected: page stays responsive; INP/TBT recovers.*

**Exercise 5 — Lazy vs eager (20 min).** Put 30 large images on a page, all eager. Audit. Add `loading="lazy"` to everything below the fold. Audit. *Expected: initial network payload drops by megabytes; LCP improves.*

**Exercise 6 — Feel the real device (15 min).** Open your own production app with CPU 4× slowdown + Fast 4G throttling. Navigate for five minutes. Everything that annoys you is what a median mobile user feels every day. Write down the three worst moments — those are your next tickets.

**Exercise 7 — Audit a real site (45 min).** Pick any slow public site, run PageSpeed Insights, and write a one-page diagnosis: the three biggest problems, which section of this playbook each violates, and the fix. Reviewing this diagnosis in a group is the fastest way to calibrate a whole team.

> **Record your results.** Keep a simple table per exercise: metric → before → after. The habit of "measure, change, measure" *is* the skill this playbook teaches.

## 11. The checklist & guardrails

**PR review checklist** — copy this into your pull-request template:

- [ ] New images: modern format, sized to display, `width`/`height` set, lazy if below fold
- [ ] LCP/hero element is **not** lazy-loaded; has `fetchpriority="high"`
- [ ] New dependency: size checked on bundlephobia, no smaller/native alternative exists
- [ ] Heavy component (chart, editor, map, modal) is dynamically imported
- [ ] No new render-blocking script/stylesheet in `<head>` without justification
- [ ] Animations use `transform`/`opacity` only
- [ ] Lists that can grow large are paginated or virtualized
- [ ] API calls: no waterfall, no over-fetching, debounced where user-driven
- [ ] Anything injected after load (banner, embed, ad) has reserved space
- [ ] New third-party script: owner named, loaded post-interactive

**CI guardrails (automate — humans forget):**

- [ ] Lighthouse CI on every PR: fail below mobile score 85, warn below 90
- [ ] Bundle-size check (`size-limit` / bundlesize): fail if initial JS grows past budget
- [ ] Image optimization enforced in the build or CDN, not left to authors
- [ ] Compression + cache headers verified in a deploy smoke test

**Recurring rituals:**

| Cadence | Action |
| --- | --- |
| Every PR | Lighthouse CI + bundle-size check (automated) |
| Weekly | One dev browses the app on throttled mobile settings |
| Monthly | Review field data (CrUX / RUM dashboard) against targets |
| Quarterly | Bundle analysis + third-party script audit; delete the dead weight |

**Red flags that predict a future 45 score — act when you see them:**

- Initial JS bundle crossed 300 KB and nobody noticed
- "Temporary" tag-manager scripts that are now 18 months old
- Lighthouse hasn't been run in over a month
- Plain `<img>` tags appearing in a framework that provides an image component
- A page that fetches data in 4+ sequential round trips
- The phrase "we'll optimize before launch"

## 12. Glossary & further reading

| Term | Meaning |
| --- | --- |
| LCP | Largest Contentful Paint — time until the main content is visible |
| INP | Interaction to Next Paint — responsiveness of user interactions |
| CLS | Cumulative Layout Shift — visual stability score |
| TTFB | Time To First Byte — server + network latency |
| FCP | First Contentful Paint — first pixel of content |
| TBT | Total Blocking Time — lab proxy for interactivity |
| FOIT / FOUT | Flash of Invisible / Unstyled Text during font load |
| Critical path | The minimum resources needed for the first render |
| Hydration | JS attaching interactivity to server-rendered HTML |
| Tree-shaking | Bundler removing unused code from imports |
| RUM | Real User Monitoring — field performance data |
| Façade | Lightweight placeholder that loads a heavy embed on click |

**Further reading (the canonical sources):**

- [web.dev — Core Web Vitals & performance guides](https://web.dev/performance) — Google's official documentation; the source of truth for metrics and thresholds
- [MDN Web Performance](https://developer.mozilla.org/en-US/docs/Web/Performance) — reference-level depth on every API mentioned here
- [Chrome DevTools documentation](https://developer.chrome.com/docs/devtools) — how to use every panel referenced in section 2
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci) — setting up the automated guardrails from section 11
- [bundlephobia.com](https://bundlephobia.com/) — dependency cost checker
- Your framework's performance docs (Next.js / Nuxt / SvelteKit each has a dedicated optimization guide)

*Thresholds and tooling evolve — re-verify the numbers in section 2 against web.dev once a year and update this document.*
