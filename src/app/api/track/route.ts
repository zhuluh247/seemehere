import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { ensureSchema } from '@/lib/ensure-schema'

export const dynamic = 'force-dynamic'

// POST /api/track — privacy-light visit counter for the MAIN website (home page).
// Records a PageView row with an empty username and mode "home" so the admin
// dashboard can separate "main site visitors" from per-CV page views.
// No IPs, no user agents, no fingerprints — same policy as CV page views.
// The client only pings once per browser session (sessionStorage guard), and
// bots are filtered by user-agent, so this stays human-shaped data.

export async function POST(req: NextRequest) {
  try {
    await ensureSchema()

    const ua = (req.headers.get('user-agent') || '').toLowerCase()
    const isBot = /bot|crawl|spider|slurp|preview|monitor|uptime|pingdom|lighthouse|headless|curl|wget|python-requests|favicon/.test(ua)
    if (!isBot) {
      // Referrer host only (never the full path) — "" for direct/internal traffic
      let referrer = ''
      try {
        const ref = req.headers.get('referer')
        const refHost = ref ? new URL(ref).host : ''
        if (refHost && refHost !== req.headers.get('host')) referrer = refHost
      } catch {}
      await db.pageView.create({ data: { username: '', mode: 'home', referrer } })
    }
  } catch {
    // Analytics must never break the page — swallow everything
  }
  return NextResponse.json({ ok: true }, { headers: { 'Cache-Control': 'no-store' } })
}
