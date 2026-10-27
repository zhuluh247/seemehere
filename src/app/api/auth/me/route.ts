import { NextRequest, NextResponse } from 'next/server'
import { sessionUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const user = await sessionUser(req)
  return NextResponse.json({ user: user ? { username: user.username } : null })
}
