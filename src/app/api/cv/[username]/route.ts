import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { normalizeUsername, USERNAME_RE } from '@/lib/cv/username'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest, ctx: { params: Promise<{ username: string }> }) {
  const { username: raw } = await ctx.params
  const username = normalizeUsername(decodeURIComponent(raw))
  if (!USERNAME_RE.test(username)) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const statsOnly = req.nextUrl.searchParams.get('stats') === '1'
  const row = await db.publishedCv.findUnique({ where: { username } })
  if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Fire-and-forget view counter (skipped for owner stat checks)
  if (!statsOnly) {
    db.publishedCv.update({ where: { username }, data: { viewCount: { increment: 1 } } }).catch(() => {})
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
