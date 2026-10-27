import { NextResponse } from 'next/server'
import { adminConfigured } from '@/lib/admin'

// GET /api/admin/session — is admin configured, and is this browser signed in?
export async function GET() {
  return NextResponse.json(
    { configured: adminConfigured() },
    { headers: { 'Cache-Control': 'no-store' } },
  )
}
