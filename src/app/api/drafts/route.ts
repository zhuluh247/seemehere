import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { sessionUser } from '@/lib/auth'
import { rateLimited, clientIp } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'

const MAX_PHOTO_CHARS = 400_000
const MAX_CV_CHARS = 300_000
const MAX_PORTFOLIO_CHARS = 1_500_000

interface DraftPayload {
  id?: string
  name?: string
  templateId?: string
  theme?: Record<string, string>
  cv?: unknown
  photoData?: string
  portfolio?: unknown
  publishedUser?: string
}

function parseDraft(raw: unknown) {
  const d = (raw || {}) as DraftPayload
  const cvJson = JSON.stringify(d.cv ?? {})
  if (cvJson.length > MAX_CV_CHARS) throw new Error('too-large')
  return {
    name: (d.name || 'My CV').slice(0, 80),
    templateId: (d.templateId || 'modern').slice(0, 20),
    themeJson: JSON.stringify(d.theme || {}),
    cvJson,
    photoData: (d.photoData || '').slice(0, MAX_PHOTO_CHARS),
    portfolioJson: JSON.stringify(d.portfolio ?? {}).slice(0, MAX_PORTFOLIO_CHARS),
    publishedUser: (d.publishedUser || '').slice(0, 30),
  }
}

function shape(row: {
  id: string
  name: string
  templateId: string
  themeJson: string
  cvJson: string
  photoData: string
  portfolioJson: string
  publishedUser: string
  updatedAt: Date
}) {
  let theme: unknown = {}
  let cv: unknown = {}
  let portfolio: unknown = {}
  try {
    theme = JSON.parse(row.themeJson || '{}')
  } catch {}
  try {
    cv = JSON.parse(row.cvJson || '{}')
  } catch {}
  try {
    portfolio = JSON.parse(row.portfolioJson || '{}')
  } catch {}
  return {
    id: row.id,
    name: row.name,
    templateId: row.templateId,
    theme,
    cv,
    photoData: row.photoData,
    portfolio,
    publishedUser: row.publishedUser,
    updatedAt: row.updatedAt,
  }
}

// GET → all drafts (full payloads) for the signed-in user
export async function GET(req: NextRequest) {
  const user = await sessionUser(req)
  if (!user) return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
  const rows = await db.draft.findMany({ where: { userId: user.id }, orderBy: { updatedAt: 'desc' } })
  return NextResponse.json({ drafts: rows.map(shape) })
}

// POST → create or upsert one draft
export async function POST(req: NextRequest) {
  const ip = clientIp(req)
  if (rateLimited(`drafts:${ip}`, 120, 60 * 60 * 1000)) {
    return NextResponse.json({ error: 'Slow down' }, { status: 429 })
  }
  const user = await sessionUser(req)
  if (!user) return NextResponse.json({ error: 'Not signed in' }, { status: 401 })

  let body: DraftPayload
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  let data
  try {
    data = parseDraft(body)
  } catch {
    return NextResponse.json({ error: 'Draft too large' }, { status: 413 })
  }

  if (body.id) {
    const existing = await db.draft.findUnique({ where: { id: body.id } })
    if (existing && existing.userId === user.id) {
      const updated = await db.draft.update({ where: { id: existing.id }, data })
      return NextResponse.json({ id: updated.id })
    }
    // unknown/foreign id → fall through and create a fresh draft
  }

  const created = await db.draft.create({ data: { ...data, userId: user.id } })
  return NextResponse.json({ id: created.id })
}
