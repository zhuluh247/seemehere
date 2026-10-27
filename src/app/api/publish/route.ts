import { NextRequest, NextResponse } from 'next/server'
import { randomBytes, scryptSync, timingSafeEqual } from 'crypto'
import { db } from '@/lib/db'
import { ensureSchema } from '@/lib/ensure-schema'
import { validateUsername } from '@/lib/cv/username'
import { sessionUser } from '@/lib/auth'
import { rateLimited, clientIp } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'

// ─── Light in-memory rate limit (per IP): 8 publishes / hour ────────────────

interface PublishBody {
  username?: string
  claimKey?: string // legacy — accepted to update pre-v1.1 anonymous pages
  displayName?: string
  templateId?: string
  theme?: Record<string, string>
  cv?: unknown
  photoData?: string
  portfolio?: unknown
}

const MAX_PHOTO_CHARS = 400_000
const MAX_CV_CHARS = 300_000
const MAX_PORTFOLIO_CHARS = 1_500_000

function hashLegacyClaimKey(key: string): string {
  const salt = randomBytes(16)
  const hash = scryptSync(key, salt, 32)
  return `${salt.toString('hex')}:${hash.toString('hex')}`
}

function verifyLegacyClaimKey(key: string, stored: string): boolean {
  try {
    const [saltHex, hashHex] = stored.split(':')
    if (!saltHex || !hashHex) return false
    const hash = scryptSync(key, Buffer.from(saltHex, 'hex'), 32)
    return timingSafeEqual(hash, Buffer.from(hashHex, 'hex'))
  } catch {
    return false
  }
}

export async function POST(req: NextRequest) {
  await ensureSchema()
  const ip = clientIp(req)
  if (rateLimited(`publish:${ip}`, 8, 60 * 60 * 1000)) {
    return NextResponse.json({ error: 'Too many publishes — try again in a bit' }, { status: 429 })
  }

  let body: PublishBody
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const check = validateUsername(body.username || '')
  if (!check.ok) return NextResponse.json({ error: check.reason }, { status: 400 })
  const username = check.username

  const user = await sessionUser(req)
  const existing = await db.publishedCv.findUnique({ where: { username } })

  if (existing) {
    if (user && existing.ownerUserId === user.id) {
      // owner republishing — allowed
    } else if (body.claimKey && existing.claimKeyHash && verifyLegacyClaimKey(body.claimKey, existing.claimKeyHash)) {
      // legacy claim-key update (pre-v1.1 pages) — still honoured
    } else {
      return NextResponse.json({ error: `"${username}" is already taken`, code: 'username_taken' }, { status: 409 })
    }
  }

  const cvJson = JSON.stringify(body.cv ?? {})
  if (cvJson.length > MAX_CV_CHARS) return NextResponse.json({ error: 'CV data too large' }, { status: 413 })
  const portfolioJson = JSON.stringify(body.portfolio ?? {}).slice(0, MAX_PORTFOLIO_CHARS)
  const photoData = (body.photoData || '').slice(0, MAX_PHOTO_CHARS)

  const data = {
    displayName: (body.displayName || 'My CV').slice(0, 80),
    templateId: (body.templateId || 'modern').slice(0, 20),
    themeJson: JSON.stringify(body.theme || {}),
    cvJson,
    photoData,
    portfolioJson,
    ...(user ? { ownerUserId: user.id } : {}),
  }

  // Fresh secret update token on EVERY successful publish/update. Stored
  // hashed server-side, returned once to the client (kept in localStorage).
  // Anonymous owners then prove ownership by sending it back as `claimKey`
  // (verified below via the legacy claim-key path) — so the same browser can
  // always update its own page, account or no account.
  const updateToken = randomBytes(24).toString('hex')

  if (existing) {
    await db.publishedCv.update({ where: { username }, data: { ...data, claimKeyHash: hashLegacyClaimKey(updateToken) } })
    return NextResponse.json({ username, updated: true, url: `/cv/${username}`, updateToken })
  }

  await db.publishedCv.create({
    data: { username, claimKeyHash: hashLegacyClaimKey(updateToken), ...data },
  })

  return NextResponse.json({ username, updated: false, url: `/cv/${username}`, updateToken })
}
