import { NextRequest, NextResponse } from 'next/server'
import { sessionUser } from '@/lib/auth'
import { ensureSchema } from '@/lib/ensure-schema'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  await ensureSchema()
  const user = await sessionUser(req)
  return NextResponse.json({ user: user ? { username: user.username } : null })
}
