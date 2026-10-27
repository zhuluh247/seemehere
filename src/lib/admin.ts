import 'server-only'
import { createHash, createHmac, timingSafeEqual } from 'crypto'
import type { NextRequest } from 'next/server'

// ─── Admin access (R4) — single shared password via ADMIN_PASSWORD env ──────
// Same proven HMAC-cookie pattern as user sessions (src/lib/auth.ts):
// zero extra infra, works on any deployment, no new dependencies.
//
// To enable the dashboard, set ADMIN_PASSWORD on the server (Render env).
// Without it, /admin shows a friendly "not configured" notice and every
// admin API returns 503 — the dashboard is disabled, nothing breaks.

export const ADMIN_COOKIE = 'smh_admin'
export const ADMIN_TTL = 60 * 60 * 24 * 7 // 7 days

export function adminConfigured(): boolean {
  return Boolean(process.env.ADMIN_PASSWORD)
}

function adminSecret(): string {
  // Separate derivation salt from user sessions, so rotating AUTH_SECRET or
  // DATABASE_URL invalidates both independently.
  return (
    process.env.AUTH_SECRET ||
    createHash('sha256').update(`${process.env.DATABASE_URL || 'local'}:seemehere-admin-v1`).digest('hex')
  )
}

export function createAdminToken(): string {
  const exp = Math.floor(Date.now() / 1000) + ADMIN_TTL
  const payload = `admin.${exp}`
  const sig = createHmac('sha256', adminSecret()).update(payload).digest('base64url')
  return `${payload}.${sig}`
}

export function verifyAdminToken(token: string | undefined | null): boolean {
  if (!token) return false
  const parts = token.split('.')
  if (parts.length !== 3) return false
  const [scope, exp, sig] = parts
  if (scope !== 'admin' || !exp || !sig) return false
  const expected = createHmac('sha256', adminSecret()).update(`${scope}.${exp}`).digest('base64url')
  try {
    if (sig.length !== expected.length || !timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return false
  } catch {
    return false
  }
  if (Number(exp) * 1000 < Date.now()) return false
  return true
}

/** Constant-time password check against ADMIN_PASSWORD. */
export function verifyAdminPassword(password: unknown): boolean {
  if (typeof password !== 'string' || !password) return false
  const expected = process.env.ADMIN_PASSWORD || ''
  if (!expected) return false
  const a = Buffer.from(createHash('sha256').update(password).digest('hex'))
  const b = Buffer.from(createHash('sha256').update(expected).digest('hex'))
  return a.length === b.length && timingSafeEqual(a, b)
}

/** Guard for admin API routes — true when the request carries a valid cookie. */
export function isAdmin(req: NextRequest): boolean {
  return verifyAdminToken(req.cookies.get(ADMIN_COOKIE)?.value)
}

export function adminCookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: ADMIN_TTL,
  }
}
