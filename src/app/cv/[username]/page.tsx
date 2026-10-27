import type { Metadata } from 'next'
import { ShareView } from '@/components/share/ShareView'
import { db } from '@/lib/db'
import { normalizeUsername, USERNAME_RE } from '@/lib/cv/username'

// Canonical public share route: /cv/{username}
// (also reachable as /?cv={username})

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

  const title = jobTitle ? `${displayName} — ${jobTitle}` : `${displayName} — CV`
  const description = (summary || `CV of ${displayName}, built free with SEEMEHERE.`).slice(0, 180)

  return {
    title,
    description,
    robots: { index: false, follow: false }, // unlisted by design
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
