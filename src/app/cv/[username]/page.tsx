import type { Metadata } from 'next'
import { ShareView } from '@/components/share/ShareView'
import { db } from '@/lib/db'
import { getSiteSettings } from '@/lib/settings'
import { normalizeUsername, USERNAME_RE } from '@/lib/cv/username'

// Canonical public share route: /cv/{username}
// (also reachable as /?cv={username})

// Always render fresh: the robots meta must follow the admin "Index public
// CV pages" toggle immediately (never serve a stale cached shell).
export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ username: string }> }): Promise<Metadata> {
  const { username: raw } = await params
  const username = normalizeUsername(decodeURIComponent(raw))

  let displayName = username
  let jobTitle = ''
  let summary = ''
  try {
    if (USERNAME_RE.test(username)) {
      const row = await db.publishedCv.findUnique({ where: { username } })
      if (row) {
        displayName = row.displayName || username
        try {
          const cv = JSON.parse(row.cvJson || '{}') as { contact?: { jobTitle?: string }; summary?: string }
          jobTitle = cv.contact?.jobTitle || ''
          summary = cv.summary || ''
        } catch {}
      }
    }
  } catch {}

  // Admin SEO toggle: public CV pages stay unlisted by design unless the
  // site owner opted into indexing (also flips sitemap.xml + robots.txt).
  let indexCvPages = false
  try {
    indexCvPages = (await getSiteSettings()).indexCvPages
  } catch {}

  const title = jobTitle ? `${displayName} — ${jobTitle}` : `${displayName} — CV`
  const description = (summary || `CV of ${displayName}, built free with SEEMEHERE.`).slice(0, 180)

  return {
    title,
    description,
    robots: indexCvPages ? { index: true, follow: true } : { index: false, follow: false },
    openGraph: {
      title,
      description,
      images: [`/api/og/${username}`],
      type: 'profile',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`/api/og/${username}`],
    },
  }
}

export default async function CvSharePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params
  return <ShareView username={decodeURIComponent(username).toLowerCase()} />
}
