// ─── Single source of truth for the public site URL ─────────────────────────
// The app is domain-agnostic: set NEXT_PUBLIC_SITE_URL in Render to your own
// domain when you move off seemehere.onrender.com, and every absolute URL
// (OG/social preview cards, share intents, QR codes, vCard notes, sitemap)
// follows automatically. Trailing slashes are trimmed so joins are safe.

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://seemehere.onrender.com').replace(/\/+$/, '')

/** SITE_URL + path, e.g. siteUrl('/cv/ada') → https://yourdomain.com/cv/ada */
export function siteUrl(path = ''): string {
  if (!path) return SITE_URL
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`
}
