import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { validateUsername, suggestUsernames } from '@/lib/cv/username'

export const dynamic = 'force-dynamic'

const taken = async (u: string) => (await db.publishedCv.findUnique({ where: { username: u } })) !== null

export async function GET(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get('u') ?? ''
  const check = validateUsername(raw)
  if (!check.ok) {
    return NextResponse.json({ available: false, reason: check.reason, suggestions: [] })
  }
  const isTaken = await taken(check.username)
  if (!isTaken) return NextResponse.json({ available: true, reason: '', suggestions: [] })

  const suggestions = await suggestUsernames(check.username, taken)
  return NextResponse.json({ available: false, reason: `"${check.username}" is already taken`, suggestions })
}
