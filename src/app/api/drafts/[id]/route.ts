import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { ensureSchema } from '@/lib/ensure-schema'
import { sessionUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function DELETE(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  await ensureSchema()
  const user = await sessionUser(req)
  if (!user) return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
  const { id } = await ctx.params
  const row = await db.draft.findUnique({ where: { id } })
  if (!row || row.userId !== user.id) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  await db.draft.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
