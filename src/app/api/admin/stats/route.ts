import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { ensureSchema } from '@/lib/ensure-schema'
import { isAdmin } from '@/lib/admin'

export const dynamic = 'force-dynamic'

// GET /api/admin/stats — dashboard payload for /admin (admin cookie required).
// All aggregation is DB-agnostic (works on Postgres and SQLite dev alike).
//
// Two traffic streams live in PageView:
//   username != ""  → public CV / portfolio page views
//   username == ""  → MAIN WEBSITE visits (home page, mode "home")
// They are reported separately so "Views" never mix with "Website visitors".

interface TopRow {
  username: string
  displayName: string
  templateId: string
  views: number // all-time PageView rows
  legacyViewCount: number // PublishedCv.viewCount (pre-R4 counter, still shown to owners)
  lastViewedAt: string | null
  updatedAt: string
  publishedAt: string
}

const DAY = 24 * 60 * 60 * 1000

function dayKey(d: Date): string {
  return d.toISOString().slice(0, 10)
}

export async function GET(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  await ensureSchema()

  const now = Date.now()
  const since7 = new Date(now - 7 * DAY)
  const since30 = new Date(now - 30 * DAY)

  try {
    const [
      published, users, viewsAllTime, views7, views30,
      homeAllTime, home7, home30, cvRows30, homeRows30,
    ] = await Promise.all([
      db.publishedCv.count(),
      db.user.count(),
      db.pageView.count({ where: { username: { not: '' } } }),
      db.pageView.count({ where: { username: { not: '' }, createdAt: { gte: since7 } } }),
      db.pageView.count({ where: { username: { not: '' }, createdAt: { gte: since30 } } }),
      // main website visitors (home page pings, username = "")
      db.pageView.count({ where: { username: '' } }),
      db.pageView.count({ where: { username: '', createdAt: { gte: since7 } } }),
      db.pageView.count({ where: { username: '', createdAt: { gte: since30 } } }),
      // daily buckets source — capped for safety on spammy traffic
      db.pageView.findMany({
        where: { username: { not: '' }, createdAt: { gte: since30 } },
        select: { username: true, createdAt: true },
        orderBy: { createdAt: 'asc' },
        take: 200_000,
      }),
      db.pageView.findMany({
        where: { username: '', createdAt: { gte: since30 } },
        select: { createdAt: true },
        orderBy: { createdAt: 'asc' },
        take: 200_000,
      }),
    ])

    // Zero-filled 30-day series (UTC days, oldest → today)
    const daily: { date: string; views: number; home: number }[] = []
    const byDay = new Map<string, number>()
    for (let i = 29; i >= 0; i--) {
      const date = dayKey(new Date(now - i * DAY))
      daily.push({ date, views: 0, home: 0 })
      byDay.set(date, daily.length - 1)
    }
    for (const row of cvRows30) {
      const idx = byDay.get(dayKey(row.createdAt))
      if (idx !== undefined) daily[idx].views++
    }
    for (const row of homeRows30) {
      const idx = byDay.get(dayKey(row.createdAt))
      if (idx !== undefined) daily[idx].home++
    }

    // Top pages, all-time PageView counts (CV pages only — never the home ping)
    const grouped = await db.pageView.groupBy({
      by: ['username'],
      where: { username: { not: '' } },
      _count: { username: true },
      _max: { createdAt: true },
      orderBy: { _count: { username: 'desc' } },
      take: 20,
    })
    const topUsernames = grouped.map((g) => g.username)
    const rows = topUsernames.length
      ? await db.publishedCv.findMany({
          where: { username: { in: topUsernames } },
          select: { username: true, displayName: true, templateId: true, viewCount: true, publishedAt: true, updatedAt: true },
        })
      : []
    const byUsername = new Map(rows.map((r) => [r.username, r]))
    const top: TopRow[] = grouped
      .map((g) => {
        const r = byUsername.get(g.username)
        return {
          username: g.username,
          displayName: r?.displayName || g.username,
          templateId: r?.templateId || 'modern',
          views: g._count.username,
          legacyViewCount: r?.viewCount ?? 0,
          lastViewedAt: g._max.createdAt ? g._max.createdAt.toISOString() : null,
          updatedAt: (r?.updatedAt || new Date(0)).toISOString(),
          publishedAt: (r?.publishedAt || new Date(0)).toISOString(),
        }
      })
      .sort((a, b) => b.views - a.views)

    // Recently updated publishes (the freshest content on the site)
    const recentRaw = await db.publishedCv.findMany({
      orderBy: { updatedAt: 'desc' },
      take: 10,
      select: { username: true, displayName: true, templateId: true, viewCount: true, publishedAt: true, updatedAt: true },
    })
    const recent: TopRow[] = recentRaw.map((r) => ({
      username: r.username,
      displayName: r.displayName,
      templateId: r.templateId,
      views: 0,
      legacyViewCount: r.viewCount,
      lastViewedAt: null,
      updatedAt: r.updatedAt.toISOString(),
      publishedAt: r.publishedAt.toISOString(),
    }))

    return NextResponse.json(
      {
        totals: { published, users, viewsAllTime, views7, views30, homeAllTime, home7, home30 },
        daily,
        top,
        recent,
      },
      { headers: { 'Cache-Control': 'no-store' } },
    )
  } catch (err) {
    console.error('[admin/stats] failed:', (err as Error).message)
    return NextResponse.json({ error: 'Failed to load stats' }, { status: 500 })
  }
}
