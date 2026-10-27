import { NextRequest, NextResponse } from 'next/server'
import { randomBytes, scryptSync, timingSafeEqual } from 'crypto'
import { db } from '@/lib/db'
import { validateUsername } from '@/lib/cv/username'

export const dynamic = 'force-dynamic'

// ─── Light in-memory rate limit (per IP): 8 publishes / hour ────────────────
const hits = new Map<string, number[]>()
function rateLimited(ip: string, max: number, windowMs: number): boolean {
  const now = Date.now()
  const arr = (hits.get(ip) || []).filter((t) => now - t < windowMs)
  if (arr.length >= max) return true
  arr.push(now)
  hits.set(ip, arr)
  return false
}

const KEY_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'
function generateClaimKey(): string {
  const seg = (n: number) =>
    Array.from(randomBytes(n))
      .map((b) => KEY_ALPHABET[b % KEY_ALPHABET.length])
      .join('')
  return `SEEM-${seg(5)}-${seg(5)}`
}

function hashClaimKey(key: string): string {
  const salt = randomBytes(16)
  const hash = scryptSync(key, salt, 32)
  return `${salt.toString('hex')}:${hash.toString('hex')}`
}

function verifyClaimKey(key: string, stored: string): boolean {
  try {
    const [saltHex, hashHex] = stored.split(':')
    if (!saltHex || !hashHex) return false
    const hash = scryptSync(key, Buffer.from(saltHex, 'hex'), 32)
    return timingSafeEqual(hash, Buffer.from(hashHex, 'hex'))
  } catch {
    return false
  }
}

interface PublishBody {
  username?: string
  claimKey?: string // required to UPDATE an existing username
  displayName?: string
  templateId?: string
  theme?: Record<string, string>
  cv?: unknown
  photoData?: string
}

const MAX_PHOTO_CHARS = 400_000 // ~300KB of base64 — photos are compressed client-side
const MAX_CV_CHARS = 300_000

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') || 'local'
  if (rateLimited(ip, 8, 60 * 60 * 1000)) {
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
  const existing = await db.publishedCv.findUnique({ where: { username } })

  if (existing) {
    if (!body.claimKey) {
      return NextResponse.json({ error: `"${username}" is already taken`, code: 'username_taken' }, { status: 409 })
    }
    if (!verifyClaimKey(body.claimKey, existing.claimKeyHash)) {
      return NextResponse.json({ error: 'Wrong claim key for this username', code: 'bad_claim_key' }, { status: 403 })
    }
  }

  const cvJson = JSON.stringify(body.cv ?? {})
  if (cvJson.length > MAX_CV_CHARS) return NextResponse.json({ error: 'CV data too large' }, { status: 413 })
  const photoData = (body.photoData || '').slice(0, MAX_PHOTO_CHARS)

  const data = {
    displayName: (body.displayName || 'My CV').slice(0, 80),
    templateId: (body.templateId || 'modern').slice(0, 20),
    themeJson: JSON.stringify(body.theme || {}),
    cvJson,
    photoData,
  }

  if (existing) {
    await db.publishedCv.update({ where: { username }, data })
    return NextResponse.json({ username, updated: true, url: `/cv/${username}` })
  }

  const claimKey = generateClaimKey()
  await db.publishedCv.create({
    data: { username, claimKeyHash: hashClaimKey(claimKey), ...data },
  })

  return NextResponse.json({ username, claimKey, updated: false, url: `/cv/${username}` })
}
