import { ImageResponse } from 'next/og'
import { db } from '@/lib/db'
import { ensureSchema } from '@/lib/ensure-schema'
import { normalizeUsername, USERNAME_RE } from '@/lib/cv/username'

export const dynamic = 'force-dynamic'
export const contentType = 'image/png'

// ─── OG preview card for shared CV links (WhatsApp/X/Slack previews) ────────

const SIZE = { width: 1200, height: 630 }

export async function GET(_req: Request, ctx: { params: Promise<{ username: string }> }) {
  await ensureSchema()
  const { username: raw } = await ctx.params
  const username = normalizeUsername(decodeURIComponent(raw))

  let name = username
  let role = ''
  let initials = username.slice(0, 2).toUpperCase()

  try {
    if (USERNAME_RE.test(username)) {
      const row = await db.publishedCv.findUnique({ where: { username } })
      if (row) {
        name = row.displayName || username
        const cv = JSON.parse(row.cvJson || '{}') as { contact?: { jobTitle?: string } }
        role = cv.contact?.jobTitle || ''
        const parts = name.trim().split(/\s+/).filter(Boolean)
        initials = parts.length >= 2 ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase() : name.slice(0, 2).toUpperCase()
      }
    }
  } catch {}

  return new ImageResponse(
    (
      <div
        style={{
          ...SIZE,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 55%, #a855f7 100%)',
          color: 'white',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 150,
            height: 150,
            borderRadius: 75,
            background: 'rgba(255,255,255,0.18)',
            border: '5px solid rgba(255,255,255,0.7)',
            fontSize: 58,
            fontWeight: 800,
            marginBottom: 36,
          }}
        >
          {initials}
        </div>
        <div style={{ display: 'flex', fontSize: 72, fontWeight: 800, letterSpacing: -2 }}>{name}</div>
        {role && <div style={{ display: 'flex', fontSize: 34, opacity: 0.9, marginTop: 14 }}>{role}</div>}
        <div
          style={{
            display: 'flex',
            marginTop: 44,
            fontSize: 24,
            opacity: 0.85,
            background: 'rgba(255,255,255,0.14)',
            padding: '10px 28px',
            borderRadius: 999,
          }}
        >
          cv/{username}
        </div>
        <div style={{ display: 'flex', position: 'absolute', bottom: 28, fontSize: 20, opacity: 0.6 }}>
          Made with SEEMEHERE — the free CV builder
        </div>
      </div>
    ),
    SIZE,
  )
}
