# 🚀 SEEMEHERE — Deploy to Render (fully free, ~15 minutes, once)

This guide takes the finished app from GitHub to a live URL on Render's free tier,
with a free permanent Neon Postgres database and a free keep-alive pinger.
After step 9 you never touch any of this again — every `git push` auto-deploys.

---

## What you need before starting

- [ ] A **GitHub** account (free) — github.com/signup
- [ ] A **Render** account (free) — render.com → *Sign up with GitHub*
- [ ] A **Neon** account (free) — neon.tech → *Sign up with GitHub*
- [ ] *(Optional, for AI features)* A **Google AI Studio** key (free) — aistudio.google.com/apikey

---

## 1 · Push the code to GitHub

```bash
# inside the project folder
git init
git add -A
git commit -m "SEEMEHERE v1 — free CV builder"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/seemehere.git
git push -u origin main
```

> Create the empty repo on github.com first (**New repository** → name `seemehere` → Public or Private both fine).

## 2 · Create the free Neon database

1. neon.tech → **New project** → name it `seemehere`
2. Open the project → **Connection string** → copy the pooled string
   (looks like `postgresql://user:pass@ep-xxx-pooler.region.aws.neon.tech/neondb?sslmode=require`)

Keep this tab open — you'll paste it in step 4.

## 3 · Create the Render service

1. Render dashboard → **New +** → **Blueprint**
2. Pick your `seemehere` repository → Render reads `render.yaml` automatically
3. Before applying, it will ask for two secrets:

| Variable | What to paste |
|---|---|
| `DATABASE_URL` | the Neon connection string from step 2 |
| `GEMINI_API_KEY` | your free AI key (or leave empty — the app works without AI and simply hides the AI buttons) |

4. Click **Apply** → Render installs, builds and starts the app (~3–5 min first time).

## 4 · Create the database table (one command, once)

The share-page storage needs one table. From your computer:

```bash
DATABASE_URL="paste-your-neon-string-here" npx prisma db push --schema prisma/schema.postgres.prisma
```

That's it — schema lives in `prisma/schema.postgres.prisma`, the Postgres twin of the dev schema.

## 5 · Verify

Open `https://seemehere-xxxx.onrender.com/api/health` → you should see
`{"ok":true,"service":"seemehere",...}`. Your app is live. 🎉

## 6 · Add the anti-sleep pinger (2 minutes, important!)

Render's free tier sleeps apps after 15 idle minutes (a visiting recruiter would wait ~50 s for wake-up).
A free pinger keeps it warm — the free plan allows one always-on service, so this costs nothing:

1. cron-job.org → **Create cronjob** (free account)
2. URL: `https://YOUR-APP.onrender.com/api/health`
3. Schedule: **every 10 minutes**
4. Save. Done — your service now never sleeps.

## 7 · (Optional) Custom domain

Render → your service → **Settings → Custom domains** → add `seemehere.yourdomain.com`
and point a CNAME record at Render. SSL is automatic. Without a domain your app lives
happily at `https://seemehere-xxxx.onrender.com` — also fine forever.

---

## How the free stack fits together

```
GitHub (code)  →  Render free web service (app host)
                        │  DATABASE_URL env var
                        ▼
                 Neon free Postgres (published CV snapshots only)
cron-job.org (free) → pings /api/health every 10 min → no sleep
```

- **Editing data** never touches the server — it autosaves in each user's browser.
- **Published CVs** = one small table in Neon (free tier holds tens of thousands).
- **PDF/PNG/Word/TXT exports** happen 100% in the user's browser — zero server cost.
- **AI** runs through `/api/ai` with the provider from `AI_PROVIDER`:
  - `gemini` — free Google Gemini tier (recommended for your deploy)
  - `none` — AI buttons hide, everything else works

## Environment variables (Render dashboard → Environment)

| Key | Value | Required |
|---|---|---|
| `DATABASE_URL` | Neon pooled connection string | ✅ (for share links) |
| `AI_PROVIDER` | `gemini` / `none` | ✅ |
| `GEMINI_API_KEY` | from aistudio.google.com/apikey | only if AI wanted |
| `GEMINI_MODEL` | `gemini-2.0-flash` | optional (has default) |
| `NODE_VERSION` | `20.18.0` | set by render.yaml |

## Updating the app later

```bash
git add -A && git commit -m "update" && git push
```
Render auto-deploys. Nothing else to do.

## Honest fine print

- Render free = 750 h/month (one always-on service fits exactly) and 100 GB bandwidth.
- Neon free = 0.5 GB storage — that's roughly 50,000+ published CVs at our compressed sizes.
- If SEEMEHERE ever goes commercial, Render requires the $7/mo Starter plan — a happy-day problem.
- The claim key is the only key to editing a published username — the app tells users to save it.
