// ─── SEEMEHERE · Section layout model (R3) ───────────────────────────────────
// Core CV sections can be reordered and hidden; user-defined custom sections
// join the same order list. Templates honor this through their main-flow
// blocks: fused blocks (e.g. Executive's "Expertise & Languages") move with
// their primary key, and sections a template keeps in a fixed zone (Modern's
// sidebar, Minimal's intro) can still be hidden everywhere but not reordered.
//
// All CvData layout fields are optional — this module coalesces them so older
// saved CVs (localStorage, cloud drafts, published JSON) keep rendering.

import type { CvData } from './types'

export type SectionKey =
  | 'summary' | 'experience' | 'projects' | 'education'
  | 'certifications' | 'skills' | 'languages'

export const SECTION_LIST: { key: SectionKey; label: string }[] = [
  { key: 'summary', label: 'Summary / Profile' },
  { key: 'experience', label: 'Experience' },
  { key: 'projects', label: 'Projects' },
  { key: 'education', label: 'Education' },
  { key: 'certifications', label: 'Certifications' },
  { key: 'skills', label: 'Skills' },
  { key: 'languages', label: 'Languages' },
]

export const SECTION_LABELS: Record<string, string> = Object.fromEntries(
  SECTION_LIST.map((s) => [s.key, s.label]),
)

/** Canonical fallback order — the layout every template shows out of the box */
export const DEFAULT_SECTION_ORDER: string[] = SECTION_LIST.map((s) => s.key)
const CORE_KEYS = new Set<string>(DEFAULT_SECTION_ORDER)

/**
 * Full desired order: the user's sectionOrder (or the default) with every
 * custom section id included. Unknown keys are dropped; missing keys are
 * appended in canonical order so nothing silently disappears.
 */
export function effectiveSectionOrder(cv: Pick<CvData, 'sectionOrder' | 'customSections'>): string[] {
  const custom = (cv.customSections || []).map((s) => s.id)
  const base = cv.sectionOrder && cv.sectionOrder.length > 0 ? cv.sectionOrder : DEFAULT_SECTION_ORDER
  const out: string[] = []
  for (const k of base) {
    if ((CORE_KEYS.has(k) || custom.includes(k)) && !out.includes(k)) out.push(k)
  }
  for (const k of DEFAULT_SECTION_ORDER) if (!out.includes(k)) out.push(k)
  for (const id of custom) if (!out.includes(id)) out.push(id)
  return out
}

/** Is this section key (core or custom id) hidden from the rendered CV? */
export function isSectionHidden(cv: Pick<CvData, 'hiddenSections'>, key: string): boolean {
  return (cv.hiddenSections || []).includes(key)
}

/** Does the section have content to render? Used for "(empty)" hints in the UI */
export function sectionHasContent(cv: CvData, key: string): boolean {
  switch (key) {
    case 'summary':
      return cv.summary.trim().length > 0
    case 'experience':
      return cv.experience.length > 0
    case 'projects':
      return cv.projects.length > 0
    case 'education':
      return cv.education.length > 0
    case 'certifications':
      return cv.certifications.length > 0
    case 'skills':
      return cv.skills.length > 0
    case 'languages':
      return cv.languages.length > 0
    default:
      return false
  }
}
