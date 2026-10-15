# Anik Chandra Deb — Portfolio & CMS

A CMS-driven engineering portfolio. The public site is mostly statically rendered; a private admin panel at `/admin` manages all content in MongoDB.

**Stack:** Next.js 16 (App Router, Server Components, Server Actions) · React 19 · TypeScript (strict) · Tailwind CSS 3 · MongoDB + Mongoose · Zod · Tiptap · Mermaid · Vitest

---

## Local development

Requirements: Node.js ≥ 20.9 and a MongoDB instance (local `mongod`, Docker, or Atlas).

```bash
npm install
cp .env.example .env.local        # then fill in values (see below)
npm run onboard                   # indexes + current portfolio content + first admin
npm run dev                       # http://localhost:3000  ·  admin: http://localhost:3000/admin
```

`npm run onboard` is idempotent: existing items (matched by slug) and existing settings are kept. Use `npm run onboard -- --force-settings` to overwrite settings with the seed values.

### Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` / `build` / `start` | Next.js |
| `npm run lint` | ESLint (flat config, `eslint-config-next`) |
| `npm run typecheck` | Generates route types, then `tsc --noEmit` |
| `npm test` | Vitest (DB tests use `mongodb://127.0.0.1:27017/portfolio_test`, or `MONGODB_URI_TEST`; skipped if unreachable) |
| `npm run onboard` | Seed content/settings and create the admin from `ADMIN_*` variables |
| `npm run admin:create` | Create an admin (prompts if `ADMIN_*` vars are not set). `-- --reset` resets a password |
| `npm run db:indexes` | Create/update MongoDB indexes (production disables auto-indexing) |

## Environment variables

| Variable | Required | Notes |
| --- | --- | --- |
| `MONGODB_URI` | yes | Local or Atlas connection string |
| `MONGODB_DB` | no | Overrides the database name in the URI |
| `SITE_URL` | production | Canonical origin, e.g. `https://anik.dev`. Falls back to Vercel’s production URL |
| `AUTH_SECRET` | production | ≥ 32 random characters; used to HMAC IPs/rate-limit keys |
| `ADMIN_EMAIL`, `ADMIN_NAME`, `ADMIN_PASSWORD` | scripts only | Read by `onboard` / `admin:create`. **Do not** set these on Vercel |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL` | no | Contact-form email notifications. Without them, messages are still stored and shown in Admin › Messages |
| `IMAGE_REMOTE_HOSTS` | no | Comma-separated hosts that `next/image` may optimize (`none` disables). Defaults: Cloudinary, Unsplash, Imgur, ImgBB, GitHub |

No secret is exposed through `NEXT_PUBLIC_*`. The only public build variable is the list of optimizable image hosts.

## Deploying to Vercel (free tier)

1. **Database:** create a free MongoDB Atlas M0 cluster, a database user, and allow access from `0.0.0.0/0` (Vercel functions have no fixed IPs). Copy the `mongodb+srv://` URI.
2. **Provision from your machine:** put the Atlas URI and `ADMIN_*` values in `.env.local` (or export them), then run `npm run onboard`. This creates indexes, seeds content, and creates the admin. Remove `ADMIN_PASSWORD` from the file afterwards.
3. **Vercel project:** import the repository. Set `MONGODB_URI`, `SITE_URL`, `AUTH_SECRET` (and SMTP variables if wanted) for Production and Preview. Deploy.
4. **Domain:** add it under Vercel › Domains, update `SITE_URL`, and redeploy so canonical URLs and the sitemap use it.
5. **Verify:** open `/`, `/projects`, `/sitemap.xml`, `/robots.txt`; sign in at `/admin`; edit and publish something and confirm it appears publicly; send a test message through `/contact` and check Admin › Messages.

The build reads published content from the database to pre-render pages, so `MONGODB_URI` must be available at build time. Without it, the build succeeds with empty content.

### Free-tier limitations

- **Atlas M0:** 512 MB storage, shared CPU, no automated backups. Back up with `mongodump --uri "$MONGODB_URI"` periodically and restore with `mongorestore`.
- **Vercel Hobby:** function duration and image-optimization quotas apply. Images from hosts outside the allow-list render as plain `<img>` (not optimized), which doesn’t use the quota.
- **Images are URLs only.** Hosts must allow hotlinking. Google Drive, Dropbox and Google Photos share links usually don’t work. Use the direct image address, GitHub, Cloudinary’s free plan, ImgBB, or commit files under `/public`.
- There are no background jobs. Contact emails are sent during the request; if SMTP fails, the message is still saved.

## Architecture

```
app/(site)/…              public pages (ISR, revalidate 1h + on-demand tag invalidation)
app/admin/login           sign-in (no public registration)
app/admin/(panel)/…       CMS: dashboard, projects, case studies, articles, experience, skills,
                          about, homepage, profile, navigation, contact, SEO, appearance,
                          images, messages, security
app/admin/preview/…       admin-only previews of drafts and the homepage draft
app/admin/_actions/…      server actions — each re-authenticates via adminAction()
lib/data/public.ts        cached, published-only read layer
lib/admin/…               CRUD, settings, dashboard, link checker
lib/auth/…                scrypt passwords, DB sessions, MongoDB rate limiting
lib/validation/…          zod schemas (single source of truth)
lib/models/…              Mongoose models + indexes
proxy.ts                  optimistic redirect for /admin (not an auth boundary)
```

### Security model

- **Sessions:** a random 256-bit token in an `httpOnly`, `SameSite=Lax`, `Secure` (`__Host-` prefixed in production) cookie. Only its SHA-256 hash is stored. Sessions have a 7-day absolute expiry and a 24-hour idle expiry, and are revoked on logout and on password change.
- **Authorization:** every admin page, private query and server action checks the session on the server. Server actions also get Next.js’s built-in Origin/Host check (CSRF).
- **Login protection:** rate limited per IP (10 / 15 min) and per account (5 failures / 15 min). The response is the same for unknown accounts and wrong passwords. The contact form is limited to 5 messages per hour per IP, with a honeypot and a minimum fill time.
- **XSS:** rich text is sanitized with an allow-list on write and again on render. Mermaid runs in `strict` mode. Visitor messages are rendered as text. JSON-LD is escaped.
- **URL validation:** links and images accept only http(s), site paths and mailto, with no private hosts. Post-login redirects are restricted to `/admin`. The link checker blocks private networks (SSRF guard).
- **Headers:** CSP, `X-Frame-Options: DENY`, `nosniff`, Referrer-Policy and Permissions-Policy. `/admin` responses are `no-store` and `noindex`.
- **Password reset:** there is no email-based reset. Use `npm run admin:create -- --reset` with database access.
