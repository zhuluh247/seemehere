import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { validateUsername } from '@/lib/cv/username'
import { createSessionToken, hashPassword, sessionCookieOptions, SESSION_COOKIE } from '@/lib/auth'
import { rateLimited, clientIp } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'

// Create an account: username + password, optional, no email.
// If the user was editing a CV, the client sends the current draft so
// "create account & save" never loses work.

interface SignupBody {
  username?: string
  password?: string
  draft?: {
    name?: string
    templateId?: string
    theme?: Record<string, string>
    cv?: unknown
    photoData?: string
    portfolio?: unknown
    publishedUser?: string
  }
}

const MAX_PHOTO_CHARS = 400_000
const MAX_CV_CHARS = 300_000
const MAX_PORTFOLIO_CHARS = 1_500_000

export async function POST(req: NextRequest) {
  const ip = clientIp(req)
  if (rateLimited(`signup:${ip}`, 10, 60 * 60 * 1000)) {
    return NextResponse.json({ error: 'Too many attempts — try again later' }, { status: 429 })
  }

  let body: SignupBody
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const check = validateUsername(body.username || '')
  if (!check.ok) return NextResponse.json({ error: check.reason }, { status: 400 })
  const username = check.username

  const password = String(body.password || '')
  if (password.length < 6) return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 })
  if (password.length > 100) return NextResponse.json({ error: 'Password too long' }, { status: 400 })

  // Usernames share one namespace with published CV links
  const [userTaken, cvTaken] = await Promise.all([
    db.user.findUnique({ where: { username } }),
    db.publishedCv.findUnique({ where: { username } }),
  ])
  if (userTaken || cvTaken) {
    return NextResponse.json({ error: `"${username}" is already taken — try another` }, { status: 409 })
  }

  const user = await db.user.create({ data: { username, passwordHash: hashPassword(password) } })

  // Persist the current draft if the client sent one (never lose work)
  if (body.draft && typeof body.draft === 'object') {
    const d = body.draft
    try {
      const cvJson = JSON.stringify(d.cv ?? {})
      if (cvJson.length <= MAX_CV_CHARS) {
        await db.draft.create({
          data: {
            userId: user.id,
            name: (d.name || 'My CV').slice(0, 80),
            templateId: (d.templateId || 'modern').slice(0, 20),
            themeJson: JSON.stringify(d.theme || {}),
            cvJson,
            photoData: (d.photoData || '').slice(0, MAX_PHOTO_CHARS),
            portfolioJson: JSON.stringify(d.portfolio ?? {}).slice(0, MAX_PORTFOLIO_CHARS),
            publishedUser: (d.publishedUser || '').slice(0, 30),
          },
        })
      }
    } catch {
      // draft persistence is best-effort on signup; account is created either way
    }
  }

  const res = NextResponse.json({ user: { username } })
  res.cookies.set(SESSION_COOKIE, createSessionToken(user.id), sessionCookieOptions())
  return res
}
