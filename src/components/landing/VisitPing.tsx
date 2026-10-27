'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

/**
 * VisitPing — counts MAIN WEBSITE visitors for the admin dashboard.
 * Mounted once in the root layout; fires a single POST /api/track when the
 * visitor lands on the home page ("/"), at most once per browser session
 * (sessionStorage guard, one ping per day maximum). The ?cv=username share
 * view is excluded — those visits are counted as CV page views instead.
 * Privacy-light: no cookies, no IPs — just one counter row per session.
 */
export function VisitPing() {
  const pathname = usePathname()

  useEffect(() => {
    try {
      if (pathname !== '/') return
      // Ignore the share-view query (?cv=name) — that's a CV visit, not a site visit
      if (new URLSearchParams(window.location.search).get('cv')) return
      const key = 'shm-home-visit'
      const today = new Date().toISOString().slice(0, 10)
      if (sessionStorage.getItem(key) === today) return
      sessionStorage.setItem(key, today)
      fetch('/api/track', { method: 'POST', keepalive: true }).catch(() => {})
    } catch {
      // storage may be unavailable (private mode) — count nothing rather than crash
    }
  }, [pathname])

  return null
}
