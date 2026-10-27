import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { ensureSchema } from '@/lib/ensure-schema'

export const dynamic = 'force-dynamic'

// ─── vCard download (.vcf) — "Add to contacts" on portfolio websites ────────
// GET /api/vcard/[username] → text/vcard attachment built from the published
// CV contact block. Recruiters can save the person straight to their phone.

function esc(value: string): string {
  // RFC 6350 escaping: backslash, semicolon, comma, newlines
  return (value || '')
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n')
}

/** Fold long content lines at 73 octets per RFC (continuation = space) */
function fold(line: string): string {
  if (line.length <= 73) return line
  const parts: string[] = []
  let rest = line
  while (rest.length > 73) {
    parts.push(rest.slice(0, 73))
    rest = ` ${rest.slice(73)}`
  }
  parts.push(rest)
  return parts.join('\r\n')
}

function base64Photo(photoData: string): { type: string; data: string } | null {
  const m = /^data:image\/(png|jpeg|jpg);base64,(.+)$/i.exec(photoData || '')
  if (!m) return null
  return { type: m[1].toLowerCase() === 'png' ? 'PNG' : 'JPEG', data: m[2] }
}

export async function GET(_req: Request, { params }: { params: Promise<{ username: string }> }) {
  await ensureSchema()
  const { username } = await params
  const row = await db.publishedCv.findUnique({ where: { username: (username || '').toLowerCase() } })
  if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  let cv: { contact?: Record<string, unknown> } = {}
  try {
    cv = JSON.parse(row.cvJson || '{}')
  } catch {
    /* empty CV — still emit a minimal card */
  }
  const c = (cv.contact || {}) as Record<string, unknown>
  const str = (k: string): string => (typeof c[k] === 'string' ? (c[k] as string).trim() : '')
  const fullName = str('fullName') || row.displayName || username
  const nameParts = fullName.split(/\s+/)
  const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : ''
  const firstName = nameParts.length > 1 ? nameParts.slice(0, -1).join(' ') : fullName

  const lines: string[] = ['BEGIN:VCARD', 'VERSION:3.0', `N:${esc(lastName)};${esc(firstName)};;;`, `FN:${esc(fullName)}`]
  if (str('jobTitle')) lines.push(`TITLE:${esc(str('jobTitle'))}`)
  if (str('phone')) lines.push(`TEL;TYPE=CELL,VOICE:${esc(str('phone'))}`)
  if (str('email')) lines.push(`EMAIL;TYPE=INTERNET,WORK:${esc(str('email'))}`)
  if (str('website')) lines.push(`URL:${esc(/^https?:\/\//i.test(str('website')) ? str('website') : `https://${str('website')}`)}`)
  if (str('linkedin')) lines.push(`URL:${esc(/^https?:\/\//i.test(str('linkedin')) ? str('linkedin') : `https://${str('linkedin')}`)}`)
  if (str('location')) lines.push(`ADR;TYPE=HOME:;;${esc(str('location'))};;;;`)
  const photo = base64Photo(row.photoData || '')
  if (photo) lines.push(fold(`PHOTO;ENCODING=BASE64;TYPE=${photo.type}:${photo.data}`))
  lines.push(`NOTE:${esc('Made with SEEMEHERE — free CV & portfolio builder')}`)
  lines.push(`REV:${new Date(row.updatedAt || Date.now()).toISOString()}`, 'END:VCARD')

  const body = lines.join('\r\n')
  const fileName = (fullName.replace(/[^a-zA-Z0-9 _-]/g, '').replace(/\s+/g, '-') || username).toLowerCase()

  return new NextResponse(body, {
    status: 200,
    headers: {
      'Content-Type': 'text/vcard; charset=utf-8',
      'Content-Disposition': `attachment; filename="${fileName}.vcf"`,
      'Cache-Control': 'no-store',
    },
  })
}
