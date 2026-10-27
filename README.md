# SEEMEHERE — Free CV Builder

Build a beautiful, ATS-friendly CV in your browser. No sign-up, no paywall, no watermarks.
Live editing autosaves to your browser; published CVs get a clean share link at `/cv/yourname`.

![templates](public/templates/1-classic.png)

## What's inside

- **6 professional templates** — Classic, Modern, Minimal, Executive, Creative, Compact
- **Every color editable** — 12 curated palettes + custom hex, with live preview
- **Headshot support** — or a tasteful initials badge when there's no photo
- **One-click fit-to-one-page** — content auto-scales, no manual squeezing
- **Exports** — PDF (text-selectable, ATS-safe), PNG, Word (.docx), TXT
- **Share links** — claim `cv/yourname`, get a secret Claim Key to edit later (no accounts)
- **AI assist (optional)** — bullet polish, summary writer, skill suggestions, CV score, light ATS check
  - runs on the free Google Gemini tier; AI buttons simply hide if no key is configured
- **Private by design** — editing data lives in the user's browser (localStorage);
  only published snapshots touch the server (one small Postgres table)

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

Full step-by-step checklist: **[README-DEPLOY.md](README-DEPLOY.md)**

Every later update is just `git push` — Render auto-deploys.
