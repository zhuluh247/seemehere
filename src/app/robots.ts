import type { MetadataRoute } from 'next'
import { getSiteSettings } from '@/lib/settings'
import { SITE_URL } from '@/lib/site'

// robots.txt at /robots.txt (replaces the old static public/robots.txt).
// Social preview bots are ALWAYS allowed so WhatsApp/X/LinkedIn cards render,
// even while /cv/ pages stay unlisted for search engines. Indexers get
// /cv/ disallowed unless the admin enabled "Index public CV pages".
// force-dynamic: the SEO toggle applies instantly (settings are 60s-cached,
// so this is still just one tiny DB read per request).
export const dynamic = 'force-dynamic'

export default async function robots(): Promise<MetadataRoute.Robots> {
  let indexCvPages = false
  try {
    indexCvPages = (await getSiteSettings()).indexCvPages
  } catch {}

  const indexer = {
    userAgent: '*',
    allow: '/',
    disallow: indexCvPages ? ['/api/', '/admin'] : ['/api/', '/admin', '/cv/'],
  }

  return {
    rules: [
      { userAgent: ['Twitterbot', 'facebookexternalhit', 'WhatsApp'], allow: '/' },
      indexer,
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
