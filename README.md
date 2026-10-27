# SEEMEHERE — Free CV Builder

Build a beautiful, ATS-friendly CV in your browser. No sign-up required, no paywall, no watermarks.
Editing autosaves locally; sign in (optional, username + password — no email) to sync drafts to the
cloud, and publish to a personal link at `/cv/yourname` — or flip one switch and that link becomes
a full **portfolio website**.

![templates](public/templates/1-classic.png)

## What's inside

- **6 professional templates** — Classic, Modern, Minimal, Executive, Creative, Compact
- **Every color editable** — 12 curated palettes + custom hex, with live preview
- **Headshot support** — or a tasteful initials badge when there's no photo
- **Projects & links** — GitHub, X, Instagram, YouTube, Dribbble, Behance and more (all optional);
  every project carries its repo and live-demo links
- **Portfolio website** — your share link becomes a personal website: hero, about, project cards
  with images, experience timeline, skills, contact. Light/dark, any accent, zero SEEMEHERE branding
  (a tiny footer credit is the only trace)
- **Optional accounts** — username + password, no email; cloud-synced CV profiles, edit published
  pages anytime. Anonymous publishing still works with zero friction
- **One-click fit-to-one-page** — content auto-scales, no manual squeezing
- **Imports** — upload an old CV PDF and AI fills every step for you
- **Exports** — PDF (text-selectable, ATS-safe), PNG, Word (.docx), TXT, QR code for your link
- **AI assist (optional)** — bullet polish, summary writer, skill suggestions, CV score, light ATS check
  - free Google Gemini tier; AI buttons simply hide if no key is configured; per-IP rate limits
- **Private by design** — editing data lives in the user's browser until they sign in or publish;
  only published snapshots and opted-in drafts touch the server

## Tech stack

Next.js 16 · TypeScript · Tailwind CSS 4 · shadcn/ui · Prisma · Neon Postgres (production)

## Run locally (optional)

```bash
npm install
cp .env.example .env
npm run db:push     # creates the local SQLite dev database
npm run dev         # http://localhost:3000
```

## Deploy (fully free, ~15 minutes, once)

GitHub → Render (free web service) → Neon (free Postgres) → cron-job.org (free keep-alive pinger).

Full step-by-step checklist (including the database SQL): **[README-DEPLOY.md](README-DEPLOY.md)**

Every later update is just `git push` — Render auto-deploys.
