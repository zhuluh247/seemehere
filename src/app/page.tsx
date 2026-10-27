'use client'

import { Landing } from '@/components/landing/Landing'
import { ShareView } from '@/components/share/ShareView'
import { useMounted, useShareUser } from '@/hooks/use-mounted'
import { Loader2 } from 'lucide-react'

/**
 * Landing page (route `/`).
 * - `/build`        → the CV builder
 * - `/cv/username`  → public share page (production)
 * - `/?cv=username` → public share view (works everywhere, incl. previews)
 */
export default function Home() {
  const mounted = useMounted()
  const shareUser = useShareUser()

  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <Loader2 className="h-6 w-6 animate-spin text-violet-500" />
      </div>
    )
  }

  if (shareUser) return <ShareView username={shareUser} />

  return <Landing />
}
