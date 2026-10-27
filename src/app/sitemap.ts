import type { MetadataRoute } from 'next'
import { db } from '@/lib/db'
import { ensureSchema } from '@/lib/ensure-schema'
import { getSiteSettings } from '@/lib/settings'
import { SITE_URL } from '@/lib/site'

// Dynamic sitemap at /sitemap.xml.
// Static pages always listed; public /cv/{username} pages are listed ONLY
// when the admin turned on "Index public CV pages" in SEO settings
// (default: OFF — share pages are unlisted by design).
// force-dynamic: the SEO toggle applies instantly (settings are 60s-cached).
export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE_URL}/build`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
  ]

  try {
    await ensureSchema()
    const settings = await getSiteSettings()
    if (!settings.indexCvPages) return staticEntries

    const rows = await db.publishedCv.findMany({
      select: { username: true, updatedAt: true },
      orderBy: { updatedAt: 'desc' },
      take: 5000,
    })
    return [
      ...staticEntries,
      ...rows.map((r) => ({
        url: `${SITE_URL}/cv/${encodeURIComponent(r.username)}`,
        lastModified: r.updatedAt,
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      })),
    ]
  } catch {
    return staticEntries // DB hiccup — never break /sitemap.xml
  }
}
