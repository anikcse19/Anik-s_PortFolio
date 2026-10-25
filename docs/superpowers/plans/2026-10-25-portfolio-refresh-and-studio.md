# Portfolio refresh + password-separated Studio

**Date:** 2026-10-25
**Supersedes visual direction of:** `2026-04-08-portfolio-redesign.md` (glassmorphism, never shipped) and the editorial "journal" UI currently live.

## Goals

1. **Portfolio (`/` and its pages): a hiring-grade personal site.** Calm, consistent and scannable for recruiters and hiring managers at larger companies. Fix what made the current UI feel messy:
   - Numbered mono "rails" (`01 — WORK`) and uppercase mono labels on nearly every element.
   - Project "ledger" rows with four loosely aligned columns.
   - The skills grid leaves orphan cards (4 categories in a 3-column grid).
   - Every section uses a different layout idiom.
2. **Studio (`/studio` and its pages): the same person, framed as a custom software service provider.** Not a freelancer profile or a job seeker. Clients hire you for projects: services, process, engagement models, selected client work, FAQ and a project-inquiry form.
3. **A password gate between the two areas ("zones").** Moving from the portfolio to the studio needs a password. Moving from the studio (or any of its pages) back to the portfolio needs a password too.

## Gate behaviour (decided)

- Two zones: `portfolio` (everything public except below) and `studio` (`/studio` and children). `/admin`, `/unlock`, `/_next`, API routes, metadata routes and static files are neutral.
- A visitor's **landing zone** is remembered in an http-only cookie (`site_zone`, 30 days). Opening a shared link directly works without a password, so recruiters can be sent `/` and clients `/studio`.
- Any navigation into the *other* zone (link, typed URL or back button) is redirected by `proxy.ts` to `/unlock?next=…`, a neutral password screen that does not reveal what's behind it.
- A correct password switches the cookie to the target zone and continues to the requested page. Wrong attempts are rate limited per IP (10 per 15 minutes, stored in MongoDB like the login limiter).
- The password comes from `SITE_GATE_PASSWORD` (env). If it's unset, crossing is impossible (fails closed) and the unlock screen says so.
- **This is a soft separation, not access control.** Anyone who clears cookies can land in either zone directly; the gate stops casual cross-browsing between the two identities.

## Architecture

| Piece | File(s) |
| --- | --- |
| Zone rules (pure, unit tested) | `lib/zones.ts`, `tests/zones.test.ts` |
| Enforcement | `proxy.ts` (admin redirect kept, zone gate added, matcher widened) |
| Unlock screen + action | `app/unlock/page.tsx`, `app/unlock/unlock-form.tsx`, `app/unlock/actions.ts` |
| Studio content (CMS) | new `studio` settings key in `lib/validation/settings.ts`; `/admin/studio` form |
| Studio pages | `app/studio/{layout,page,not-found}.tsx`, `work/`, `work/[slug]/`, `start/`, `[...rest]/` |
| Studio components | `components/studio/*` |
| Project inquiries | `lib/contact.ts` generalized; `Message` gains `source` + `details`; admin inbox shows them |
| Portfolio refresh | `globals.css`, `section-header`, `home-view`, `project-list`, `content-lists`, `site-shell`, `header-nav`, inner pages, `detail-views` |

Both zones share the root layout, theme toggle and admin-controlled typography. The studio scopes its own accent palette (`.zone-studio`) so it reads as a separate brand.

## Portfolio design system changes

- New site-only primitives: `.eyebrow` (small accent label), `.chip` (rounded tech pill), `.card` (rounded surface with border). The admin keeps `.label` and `.tag` unchanged.
- One section header pattern everywhere: eyebrow, heading, optional intro, "view all" link aligned right.
- Hero: availability pill, name, title, positioning, three CTAs (work, résumé, contact) and a profile card with computed facts (current role, years of experience, location, focus) plus the portrait when set.
- Stats strip computed from real data (years of experience, published projects, companies). Nothing is hard-coded.
- Projects: uniform cards (cover, type and year, title, summary, chips); the ledger layout becomes a clean list with thumbnails.
- Skills: one card per category with chips; the column count adapts so there are no orphans.
- Experience: vertical timeline with dates, role, company, summary and chips.
- Contact: a single CTA card.
- Header gets a résumé button; the footer is simplified.

## Studio content model (`settings.studio`)

`brandName`, `tagline`, `headline`, `subheadline`, `availability`, `highlights[] {value,label}`, `services[] {title,description,items[]}`, `process[] {title,description,duration}`, `engagements[] {name,description,priceNote,includes[],featured}`, `faqs[] {question,answer}`, `workIds[]`, `inquiry {intro,responseNote,budgets[],timelines[]}`, `contactEmail`, `indexable`.

Defaults are written as editable commitments, not invented facts. Studio pages are `noindex` and left out of the sitemap unless `indexable` is turned on, which keeps search results for your name from linking the two identities.

## Tasks

1. `lib/zones.ts` + tests; extend env schema with `SITE_GATE_PASSWORD`; update `.env.example`.
2. `proxy.ts` zone enforcement; `/unlock` page, form and action (rate limited, timing-safe compare).
3. `studio` settings schema + defaults + admin page/form + admin nav entry.
4. Inquiry support: schema, `Message` fields, `handleStudioInquiry`, mail body, admin message list.
5. Studio shell, landing, work index, work detail, start-a-project, 404 and catch-all.
6. Portfolio design primitives and component refresh (home, lists, header and footer, inner pages, detail views).
7. Sitemap and robots awareness of the studio; 404 handling per zone.
8. Verify: `npm run check` (lint, typecheck, tests), plus screenshots of `/`, `/projects`, `/studio`, `/unlock` and a manual cross-zone walk-through with curl.

## Renaming the studio route

The URL segment is the folder `app/studio` plus `STUDIO_BASE` in `lib/zones.ts`. Rename both together.
