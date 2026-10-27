import 'server-only'
import { createHmac, randomBytes, scryptSync, timingSafeEqual, createHash } from 'crypto'
import type { NextRequest } from 'next/server'
import { db } from '@/lib/db'

// ─── SEEMEHERE accounts — lightweight username+password sessions ────────────
// Zero-config: the signing secret derives from AUTH_SECRET (optional) or the
// DATABASE_URL, so sessions work on any deployment without extra setup.

export const SESSION_COOKIE = 'smh_session'
export const SESSION_TTL = 60 * 60 * 24 * 30 // 30 days

function authSecret(): string {
  return (
    process.env.AUTH_SECRET ||
    createHash('sha256').update(`${process.env.DATABASE_URL || 'local'}:seemehere-auth-v1`).digest('hex')
  )
}

export function createSessionToken(userId: string): string {
  const exp = Math.floor(Date.now() / 1000) + SESSION_TTL
  const payload = `${userId}.${exp}`
  const sig = createHmac('sha256', authSecret()).update(payload).digest('base64url')
  return `${payload}.${sig}`
}

export function verifySessionToken(token: string | undefined | null): string | null {
  if (!token) return null
  const parts = token.split('.')
  if (parts.length !== 3) return null
  const [userId, exp, sig] = parts
  if (!userId || !exp || !sig) return null
  const expected = createHmac('sha256', authSecret()).update(`${userId}.${exp}`).digest('base64url')
  try {
    if (sig.length !== expected.length || !timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null
  } catch {
    return null
  }
  if (Number(exp) * 1000 < Date.now()) return null
  return userId
}

// ─── Passwords (scrypt, same proven scheme as the legacy claim keys) ────────

export function hashPassword(password: string): string {
  const salt = randomBytes(16)
  const hash = scryptSync(password, salt, 64)
  return `${salt.toString('hex')}:${hash.toString('hex')}`
}

export function verifyPassword(password: string, stored: string): boolean {
  try {
    const [saltHex, hashHex] = stored.split(':')
    if (!saltHex || !hashHex) return false
    const hash = scryptSync(password, Buffer.from(saltHex, 'hex'), 64)
    return timingSafeEqual(hash, Buffer.from(hashHex, 'hex'))
  } catch {
    return false
  }
}

// ─── Session helpers for route handlers ─────────────────────────────────────

export async function sessionUserId(req: NextRequest): Promise<string | null> {
  return verifySessionToken(req.cookies.get(SESSION_COOKIE)?.value)
}

export async function sessionUser(req: NextRequest) {
  const id = await sessionUserId(req)
  if (!id) return null
  try {
    return await db.user.findUnique({ where: { id } })
  } catch {
    return null
  }
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_TTL,
  }
}
