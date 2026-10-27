import 'server-only'
import { db } from './db'

// ─── Site settings (R4) — admin-editable, stored in the SiteSetting table ───
// Read with a 60-second in-process cache so metadata generation stays cheap.
// Every read is failure-tolerant: if the DB hiccups we fall back to the
// built-in defaults below, so a settings problem can never take pages down.

export interface SiteSettings {
  /** <title> of the landing page + fallback title everywhere */
  siteTitle: string
  /** meta description of the landing page */
  siteDescription: string
  /** allow search engines to index public /cv/{username} pages (default: OFF — unlisted by design) */
  indexCvPages: boolean
}

export const DEFAULT_SETTINGS: SiteSettings = {
  siteTitle: 'SEEMEHERE — Free CV Builder | Your CV. One link. Seen everywhere.',
  siteDescription:
    'Build a beautiful, ATS-proof CV free in 10 guided steps. 6 templates, every color editable, AI writing help, PDF/PNG/Word export and a personal share link at cv/yourname. No signup, no watermark, £0 forever.',
  indexCvPages: false,
}

const KEYS = ['siteTitle', 'siteDescription', 'indexCvPages'] as const
const TTL_MS = 60_000

let cache: { at: number; value: SiteSettings } | null = null

function applyRow(value: SiteSettings, key: string, raw: string): void {
  if (key === 'siteTitle' && raw.trim()) value.siteTitle = raw.trim().slice(0, 200)
  if (key === 'siteDescription' && raw.trim()) value.siteDescription = raw.trim().slice(0, 500)
  if (key === 'indexCvPages') value.indexCvPages = raw === '1'
}

/** Current settings (60s cache, never throws). */
export async function getSiteSettings(): Promise<SiteSettings> {
  if (cache && Date.now() - cache.at < TTL_MS) return cache.value
  const value: SiteSettings = { ...DEFAULT_SETTINGS }
  try {
    const rows = await db.siteSetting.findMany({ where: { key: { in: [...KEYS] } } })
    for (const row of rows) applyRow(value, row.key, row.value)
  } catch {
    // DB unavailable — serve defaults rather than breaking the page
  }
  cache = { at: Date.now(), value }
  return value
}

/** Persist a settings patch (admin-only route calls this) and refresh the cache. */
export async function saveSiteSettings(patch: Partial<SiteSettings>): Promise<SiteSettings> {
  const current = await getSiteSettings()
  const next: SiteSettings = { ...current }

  if (typeof patch.siteTitle === 'string') {
    next.siteTitle = (patch.siteTitle.trim() || DEFAULT_SETTINGS.siteTitle).slice(0, 200)
  }
  if (typeof patch.siteDescription === 'string') {
    next.siteDescription = (patch.siteDescription.trim() || DEFAULT_SETTINGS.siteDescription).slice(0, 500)
  }
  if (typeof patch.indexCvPages === 'boolean') next.indexCvPages = patch.indexCvPages

  const rows: { key: string; value: string }[] = [
    { key: 'siteTitle', value: next.siteTitle },
    { key: 'siteDescription', value: next.siteDescription },
    { key: 'indexCvPages', value: next.indexCvPages ? '1' : '0' },
  ]
  for (const row of rows) {
    await db.siteSetting.upsert({ where: { key: row.key }, create: row, update: { value: row.value } })
  }
  cache = { at: Date.now(), value: next }
  return next
}

/** Test-only: drop the in-process cache. */
export function invalidateSettingsCache(): void {
  cache = null
}
