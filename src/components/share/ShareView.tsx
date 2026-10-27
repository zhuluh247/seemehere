'use client'

import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import Link from 'next/link'
import type { CvData, PortfolioSpec, TemplateId, ThemeSpec } from '@/lib/cv/types'
import { normalizePortfolio } from '@/lib/cv/types'
import { DEFAULT_PALETTE } from '@/lib/cv/palettes'
import { CvPageA4, TEMPLATE_META } from '@/components/cv/templates'
import { PortfolioSite } from './PortfolioSite'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Globe, ArrowRight } from 'lucide-react'

const subscribeNoop = () => () => {}

/** Hydration-safe read of ?mode=cv (force the paper CV even when portfolio is on) */
function useForceCvMode(): boolean {
  return useSyncExternalStore(
    subscribeNoop,
    () => new URLSearchParams(window.location.search).get('mode') === 'cv',
    () => false,
  )
}

interface PublishedCv {
  username: string
  displayName: string
  templateId: TemplateId
  theme: Partial<ThemeSpec>
  cv: CvData
  photoData: string
  portfolio: Partial<PortfolioSpec>
  updatedAt: string
}

/** Public page for a published username — website (portfolio) or classic paper CV */
export function ShareView({ username }: { username: string }) {
  const [data, setData] = useState<PublishedCv | null>(null)
  const [state, setState] = useState<'loading' | 'ready' | 'notfound'>('loading')
  const wrapRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)
  const forceCv = useForceCvMode()

  useEffect(() => {
    let alive = true
    fetch(`/api/cv/${encodeURIComponent(username)}`)
      .then(async (res) => {
        if (!alive) return
        if (res.status === 404) return setState('notfound')
        if (!res.ok) throw new Error('failed')
        const j = (await res.json()) as PublishedCv
        setData(j)
        setState('ready')
      })
      .catch(() => alive && setState('notfound'))
    return () => {
      alive = false
    }
  }, [username])

  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const ro = new ResizeObserver(() => setScale(Math.min(1, (el.clientWidth - 8) / 794)))
    ro.observe(el)
    return () => ro.disconnect()
  }, [state])

  const theme: ThemeSpec = { ...DEFAULT_PALETTE.theme, ...(data?.theme || {}) }
  const pf = data ? normalizePortfolio(data.portfolio) : null
  const showPortfolio = !!pf?.enabled && !forceCv

  if (state === 'ready' && data && showPortfolio) {
    // Website mode — no app chrome at all, tiny footer credit inside the site
    return <PortfolioSite data={data.cv} photoData={data.photoData} portfolio={data.portfolio} username={data.username} />
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-200">
      {/* Floating website switch — appears only when the owner has a portfolio
          site and the visitor forced the paper-CV view (?mode=cv).
          No SEEMEHERE chrome on the owner's page — branding stays in the tiny footer pill. */}
      {showPortfolio === false && pf?.enabled && (
        <Link
          href={typeof window !== 'undefined' ? window.location.pathname : '#'}
          className="fixed right-4 top-4 z-30 rounded-full border border-slate-200 bg-white/95 px-3.5 py-1.5 text-[11px] font-semibold text-violet-600 shadow-sm backdrop-blur hover:bg-white"
        >
          View website →
        </Link>
      )}

      <main ref={wrapRef} className="mx-auto w-full max-w-4xl flex-1 px-3 py-6">
        {state === 'loading' && (
          <div className="mx-auto" style={{ width: 794 * Math.min(1, scale) }}>
            <Skeleton className="mx-auto h-[1123px] w-full max-w-full rounded-xl" />
          </div>
        )}

        {state === 'notfound' && (
          <div className="mx-auto mt-20 max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <Globe className="mx-auto mb-3 h-10 w-10 text-slate-300" />
            <h1 className="text-lg font-bold text-slate-800">This CV link is empty</h1>
            <p className="mt-1 text-sm text-slate-500">
              Nothing is published at <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">cv/{username}</code>. The owner may have removed it, or the name is still available.
            </p>
            <Button asChild className="mt-5 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-700 hover:to-indigo-700">
              <Link href="/">Build your own CV — free <ArrowRight className="ml-1 h-4 w-4" /></Link>
            </Button>
          </div>
        )}

        {state === 'ready' && data && (
          <div className="flex flex-col items-center gap-5">
            <div style={{ zoom: scale }} className="rounded-xl shadow-2xl">
              <CvPageA4
                templateId={(TEMPLATE_META.some((t) => t.id === data.templateId) ? data.templateId : 'modern') as TemplateId}
                theme={theme}
                data={data.cv}
                photoData={data.photoData || undefined}
                showPhoto
              />
            </div>
            <div className="mb-6 rounded-full border border-slate-300 bg-white/90 px-4 py-2 text-xs text-slate-500 shadow-sm">
              <Link href="/" className="font-semibold text-violet-700 hover:underline">Made with SEEMEHERE</Link>
              {' '}— build your free CV at <Link href="/" className="font-semibold text-violet-700 hover:underline">seemehere</Link>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
