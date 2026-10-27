import type { Metadata } from 'next'
import { ShareView } from '@/components/share/ShareView'

// Canonical public share route: /cv/{username}
// (also reachable as /?cv={username})

export async function generateMetadata({ params }: { params: Promise<{ username: string }> }): Promise<Metadata> {
  const { username } = await params
  return {
    title: `${username} — CV | SEEMEHERE`,
    description: `CV of ${username}, built free with SEEMEHERE.`,
    robots: { index: false, follow: false }, // unlisted by design
  }
}

export default async function CvSharePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params
  return <ShareView username={decodeURIComponent(username).toLowerCase()} />
}
