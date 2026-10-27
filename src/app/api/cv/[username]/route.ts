import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { ensureSchema } from '@/lib/ensure-schema'
import { normalizeUsername, USERNAME_RE } from '@/lib/cv/username'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest, ctx: { params: Promise<{ username: string }> }) {
  await ensureSchema()
  const { username: raw } = await ctx.params
  const username = normalizeUsername(decodeURIComponent(raw))
  if (!USERNAME_RE.test(username)) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const statsOnly = req.nextUrl.searchParams.get('stats') === '1'
  const row = await db.publishedCv.findUnique({ where: { username } })
  if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Fire-and-forget analytics (skipped for owner stat checks and bots).
  // PageView is privacy-light: no IPs, no user agents — just the page,
  // the view mode, and the referrer HOST. Bots are filtered so the
  // owner-facing viewCount stays human too.
  if (!statsOnly) {
    const ua = (req.headers.get('user-agent') || '').toLowerCase()
    const isBot = /bot|crawl|spider|slurp|preview|monitor|uptime|pingdom|lighthouse|headless|curl|wget|python-requests|favicon/.test(ua)

    let portfolioEnabled = false
    try {
      portfolioEnabled = Boolean((JSON.parse(row.portfolioJson || '{}') as { enabled?: unknown }).enabled)
    } catch {}
    // ShareView appends ?mode=cv when the visitor forces the paper-CV view
    const mode = req.nextUrl.searchParams.get('mode') === 'cv' ? 'cv' : portfolioEnabled ? 'site' : 'cv'

    // Referrer host only (never the full path) — "" for direct/internal traffic
    let referrer = ''
    try {
      const ref = req.headers.get('referer')
      const refHost = ref ? new URL(ref).host : ''
      if (refHost && refHost !== req.headers.get('host')) referrer = refHost
    } catch {}

    if (!isBot) {
      db.publishedCv.update({ where: { username }, data: { viewCount: { increment: 1 } } }).catch(() => {})
      db.pageView.create({ data: { username, mode, referrer } }).catch(() => {})
    }
  }

  let theme: Record<string, string> = {}
  try {
    theme = JSON.parse(row.themeJson || '{}')
  } catch {}

  let cv: unknown = {}
  try {
    cv = JSON.parse(row.cvJson || '{}')
  } catch {}

  let portfolio: unknown = {}
  try {
    portfolio = JSON.parse(row.portfolioJson || '{}')
  } catch {}

  if (statsOnly) {
    return NextResponse.json({ viewCount: row.viewCount }, { headers: { 'Cache-Control': 'no-store' } })
  }

  return NextResponse.json(
    {
      username: row.username,
      displayName: row.displayName,
      templateId: row.templateId,
      theme,
      cv,
      photoData: row.photoData,
      portfolio,
      updatedAt: row.updatedAt,
    },
    { headers: { 'Cache-Control': 'no-store' } },
  )
}
