import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { ensureSchema } from '@/lib/ensure-schema'
import { normalizeUsername } from '@/lib/cv/username'
import { createSessionToken, verifyPassword, sessionCookieOptions, SESSION_COOKIE } from '@/lib/auth'
import { rateLimited, clientIp } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  await ensureSchema()
  const ip = clientIp(req)
  if (rateLimited(`login:${ip}`, 15, 15 * 60 * 1000)) {
    return NextResponse.json({ error: 'Too many attempts — wait a few minutes' }, { status: 429 })
  }

  let body: { username?: string; password?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const username = normalizeUsername(body.username || '')
  const password = String(body.password || '')
  if (!username || !password) return NextResponse.json({ error: 'Enter your username and password' }, { status: 400 })

  const user = await db.user.findUnique({ where: { username } })
  // Same message for both cases — do not reveal which usernames exist
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return NextResponse.json({ error: 'Wrong username or password' }, { status: 401 })
  }

  const res = NextResponse.json({ user: { username: user.username } })
  res.cookies.set(SESSION_COOKIE, createSessionToken(user.id), sessionCookieOptions())
  return res
}
