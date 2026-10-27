'use client'

import type { CSSProperties } from 'react'
import { Mail, Phone, MapPin, Link2, Linkedin } from 'lucide-react'
import type { CvData, ThemeSpec } from '@/lib/cv/types'
import { softTint, lighten } from '@/lib/cv/color'

export interface CvTemplateProps {
  data: CvData
  theme: ThemeSpec
  photoData?: string
  showPhoto?: boolean
}

/** Inline CSS variables consumed by templates.css */
export function themeVars(theme: ThemeSpec): CSSProperties {
  return {
    '--acc': theme.accent,
    '--acc-soft': softTint(theme.accent),
    '--acc-dark': lighten(theme.accent, -0.15),
    '--hdr': theme.headerBg,
    '--hdr-txt': theme.headerText,
    '--txt': theme.text,
    '--mut': theme.muted,
  } as CSSProperties
}

export function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return 'CV'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

interface PhotoProps {
  photoData?: string
  name: string
  className?: string
}

/** Photo with graceful initials fallback */
export function CvPhoto({ photoData, name, className = '' }: PhotoProps) {
  if (photoData) {
     
    return <img className={className} src={photoData} alt={name || 'Profile photo'} />
  }
  return <div className={`cv-photo-initials ${className}`}>{initialsOf(name)}</div>
}

export function showC(conds: (string | undefined | false)[]): string {
  return conds.filter(Boolean).join(' · ')
}

/* Contact icon sets — small wrappers so every template stays consistent */
export const CIcon = {
  mail: (cls?: string) => <Mail className={cls} strokeWidth={2} />,
  phone: (cls?: string) => <Phone className={cls} strokeWidth={2} />,
  pin: (cls?: string) => <MapPin className={cls} strokeWidth={2} />,
  web: (cls?: string) => <Link2 className={cls} strokeWidth={2} />,
  li: (cls?: string) => <Linkedin className={cls} strokeWidth={2} />,
}

export interface ContactLine {
  icon: keyof typeof CIcon
  text: string
}

export function contactLines(data: CvData): ContactLine[] {
  const c = data.contact
  const out: ContactLine[] = []
  if (c.email) out.push({ icon: 'mail', text: c.email })
  if (c.phone) out.push({ icon: 'phone', text: c.phone })
  if (c.location) out.push({ icon: 'pin', text: c.location })
  if (c.website) out.push({ icon: 'web', text: c.website })
  if (c.linkedin) out.push({ icon: 'li', text: c.linkedin })
  return out
}

/** "2021 – Present" helper */
export function dateRange(start: string, end: string): string {
  if (start && end) return `${start} – ${end}`
  return start || end || ''
}
