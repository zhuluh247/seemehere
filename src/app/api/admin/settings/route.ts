import { NextRequest, NextResponse } from 'next/server'
import { isAdmin } from '@/lib/admin'
import { getSiteSettings, saveSiteSettings } from '@/lib/settings'
import { ensureSchema } from '@/lib/ensure-schema'

export const dynamic = 'force-dynamic'

// GET /api/admin/settings — current SEO settings (admin cookie required)
export async function GET(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  await ensureSchema()
  const settings = await getSiteSettings()
  return NextResponse.json(settings, { headers: { 'Cache-Control': 'no-store' } })
}

// PUT /api/admin/settings — save SEO settings (admin cookie required)
export async function PUT(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  await ensureSchema()

  try {
    const body = (await req.json()) as {
      siteTitle?: unknown
      siteDescription?: unknown
      indexCvPages?: unknown
    }
    const saved = await saveSiteSettings({
      siteTitle: typeof body.siteTitle === 'string' ? body.siteTitle : undefined,
      siteDescription: typeof body.siteDescription === 'string' ? body.siteDescription : undefined,
      indexCvPages: typeof body.indexCvPages === 'boolean' ? body.indexCvPages : undefined,
    })
    return NextResponse.json(saved, { headers: { 'Cache-Control': 'no-store' } })
  } catch (err) {
    console.error('[admin/settings] save failed:', (err as Error).message)
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 })
  }
}
