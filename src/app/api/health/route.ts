import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// Keep-alive endpoint for the free cron pinger (cron-job.org → every 10 min)
export async function GET(_req: NextRequest) {
  return NextResponse.json({ ok: true, service: 'seemehere', ts: new Date().toISOString() })
}
