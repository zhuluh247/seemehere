'use client'

import { useState } from 'react'
import { useCvStore } from '@/lib/cv/store'
import { Landing } from '@/components/landing/Landing'
import { Builder } from '@/components/builder/Builder'
import { ShareView } from '@/components/share/ShareView'
import { useMounted, useShareUser } from '@/hooks/use-mounted'
import { Loader2 } from 'lucide-react'

/**
 * App shell.
 * - `/`               → landing + builder (state-based views)
 * - `/?cv=username`   → public share view (works everywhere, incl. preview)
 * - `/cv/[username]`  → canonical public share route (production)
 */
export default function Home() {
  const mounted = useMounted()
  const shareUser = useShareUser()
  const [view, setView] = useState<'landing' | 'builder'>('landing')
  const builderStarted = useCvStore((s) => s.builderStarted)
  const setBuilderStarted = useCvStore((s) => s.setBuilderStarted)

  const start = () => {
    setBuilderStarted(true)
    setView('builder')
  }

  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <Loader2 className="h-6 w-6 animate-spin text-violet-500" />
      </div>
    )
  }

  if (shareUser) return <ShareView username={shareUser} />

  if (view === 'builder' || builderStarted) return <Builder onExit={() => setView('landing')} />

  return <Landing onStart={start} />
}
