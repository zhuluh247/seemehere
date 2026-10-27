'use client'

import { useSyncExternalStore } from 'react'

const subscribeNoop = () => () => {}

/** Hydration-safe "are we on the client yet" without setState-in-effect */
export function useMounted(): boolean {
  return useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false,
  )
}

/** Reads ?cv= / ?share= / #/cv/name from the URL (hydration-safe) */
export function useShareUser(): string | null {
  return useSyncExternalStore(
    subscribeNoop,
    () => {
      const p = new URLSearchParams(window.location.search)
      const cvUser = p.get('cv') || p.get('share')
      if (cvUser) return cvUser
      const m = window.location.hash.match(/^#\/cv\/([a-z0-9-]+)$/i)
      return m ? m[1] : null
    },
    () => null,
  )
}
