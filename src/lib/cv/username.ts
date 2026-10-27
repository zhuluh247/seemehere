// Shared username rules for SEEMEHERE share links
export const USERNAME_RE = /^[a-z0-9](?:[a-z0-9-]{1,28}[a-z0-9])$/

export const RESERVED_USERNAMES = new Set([
  'www', 'api', 'app', 'admin', 'administrator', 'cv', 'about', 'help', 'support',
  'login', 'signin', 'signup', 'register', 'dashboard', 'settings', 'profile',
  'seemehere', 'root', 'null', 'undefined', 'mail', 'email', 'blog', 'docs',
  'status', 'legal', 'privacy', 'terms', 'contact', 'faq', 'pricing', 'features',
])

export function normalizeUsername(raw: string): string {
  return raw.trim().toLowerCase()
}

export function validateUsername(raw: string): { ok: true; username: string } | { ok: false; reason: string } {
  const username = normalizeUsername(raw)
  if (!username) return { ok: false, reason: 'Choose a username for your link' }
  if (username.length < 3) return { ok: false, reason: 'Username must be at least 3 characters' }
  if (username.length > 30) return { ok: false, reason: 'Username must be 30 characters or fewer' }
  if (!USERNAME_RE.test(username))
    return { ok: false, reason: 'Use letters, numbers and dashes only (no spaces, must start/end with a letter or number)' }
  if (RESERVED_USERNAMES.has(username)) return { ok: false, reason: 'That username is reserved — try another' }
  return { ok: true, username }
}

/** Suggest available alternatives when a username is taken */
export async function suggestUsernames(base: string, isTaken: (u: string) => Promise<boolean>): Promise<string[]> {
  const cleaned = base.replace(/-+$/, '')
  const candidates = [
    `${cleaned}2`,
    `${cleaned}-cv`,
    `cv-${cleaned}`,
    `${cleaned}${Math.floor(10 + Math.random() * 90)}`,
    `the-${cleaned}`,
    `${cleaned}${Math.floor(100 + Math.random() * 900)}`,
  ]
  const seen = new Set<string>()
  const out: string[] = []
  for (const c of candidates) {
    if (seen.has(c) || !USERNAME_RE.test(c) || RESERVED_USERNAMES.has(c)) continue
    seen.add(c)
    if (!(await isTaken(c))) out.push(c)
    if (out.length >= 4) break
  }
  return out
}
