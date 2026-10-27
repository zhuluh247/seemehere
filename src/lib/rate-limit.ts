// ─── Tiny shared in-memory rate limiter (per key, sliding window) ───────────
// Good enough for a single-instance free deployment. Resets on restart —
// acceptable: limits are abuse protection, not billing boundaries.

const buckets = new Map<string, number[]>()

export function rateLimited(key: string, max: number, windowMs: number): boolean {
  const now = Date.now()
  const arr = (buckets.get(key) || []).filter((t) => now - t < windowMs)
  if (arr.length >= max) {
    buckets.set(key, arr)
    return true
  }
  arr.push(now)
  buckets.set(key, arr)
  return false
}

/** Best-effort client identity for rate limiting (proxy-aware) */
export function clientIp(req: Request): string {
  return (req.headers.get('x-forwarded-for') || '').split(',')[0].trim() || 'local'
}
