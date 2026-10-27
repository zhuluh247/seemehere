import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { validateUsername, suggestUsernames } from '@/lib/cv/username'
import { sessionUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// A username is taken if it is a published CV **or** an account —
// both share the same namespace (cv/{username} doubles as the profile handle).
// Exception: your OWN account username is always available to you.

const cvTaken = async (u: string) => (await db.publishedCv.findUnique({ where: { username: u } })) !== null
const userTaken = async (u: string) => (await db.user.findUnique({ where: { username: u } })) !== null

export async function GET(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get('u') ?? ''
  const check = validateUsername(raw)
  if (!check.ok) {
    return NextResponse.json({ available: false, reason: check.reason, suggestions: [] })
  }

  const me = await sessionUser(req)
  if (me && me.username === check.username) {
    return NextResponse.json({ available: true, reason: '', suggestions: [] })
  }

  const isTaken = (await cvTaken(check.username)) || (await userTaken(check.username))
  if (!isTaken) return NextResponse.json({ available: true, reason: '', suggestions: [] })

  const suggestions = await suggestUsernames(check.username, async (u) => (await cvTaken(u)) || (await userTaken(u)))
  return NextResponse.json({ available: false, reason: `"${check.username}" is already taken`, suggestions })
}
