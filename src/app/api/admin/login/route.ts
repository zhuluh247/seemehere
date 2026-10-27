import { NextRequest, NextResponse } from 'next/server'
import { ADMIN_COOKIE, adminConfigured, adminCookieOptions, createAdminToken, verifyAdminPassword } from '@/lib/admin'
import { clientIp, rateLimited } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'

// POST /api/admin/login { password } — rate-limited: 10 attempts / 15 min / IP
export async function POST(req: NextRequest) {
  if (rateLimited(`admin-login:${clientIp(req)}`, 10, 15 * 60 * 1000)) {
    return NextResponse.json({ error: 'Too many attempts — try again in a few minutes' }, { status: 429 })
  }

  if (!adminConfigured()) {
    return NextResponse.json(
      { error: 'Admin is not configured — set the ADMIN_PASSWORD environment variable on your server first' },
      { status: 503 },
    )
  }

  let password = ''
  try {
    const body = (await req.json()) as { password?: unknown }
    password = typeof body.password === 'string' ? body.password : ''
  } catch {}

  if (!verifyAdminPassword(password)) {
    return NextResponse.json({ error: 'Wrong password' }, { status: 401 })
  }

  const res = NextResponse.json({ ok: true })
  res.cookies.set(ADMIN_COOKIE, createAdminToken(), adminCookieOptions())
  return res
}
