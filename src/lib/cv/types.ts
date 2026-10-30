// ─── SEEMEHERE · Core CV data model ──────────────────────────────────────────

export interface Contact {
  fullName: string
  jobTitle: string
  email: string
  phone: string
  location: string
  website: string
  linkedin: string
  links: CvLink[] // flexible extra links (GitHub, X, Instagram, ...)
}

export type LinkKind =
  | 'github' | 'x' | 'instagram' | 'youtube' | 'tiktok'
  | 'dribbble' | 'behance' | 'stackoverflow' | 'medium' | 'custom'

export interface CvLink {
  id: string
  kind: LinkKind
  label: string // used for 'custom' (e.g. "Blog")
  url: string
}

export const LINK_KINDS: { kind: LinkKind; label: string; placeholder: string }[] = [
  { kind: 'github', label: 'GitHub', placeholder: 'github.com/you' },
  { kind: 'x', label: 'X / Twitter', placeholder: 'x.com/you' },
  { kind: 'instagram', label: 'Instagram', placeholder: 'instagram.com/you' },
  { kind: 'youtube', label: 'YouTube', placeholder: 'youtube.com/@you' },
  { kind: 'tiktok', label: 'TikTok', placeholder: 'tiktok.com/@you' },
  { kind: 'dribbble', label: 'Dribbble', placeholder: 'dribbble.com/you' },
  { kind: 'behance', label: 'Behance', placeholder: 'behance.net/you' },
  { kind: 'stackoverflow', label: 'Stack Overflow', placeholder: 'stackoverflow.com/users/…' },
  { kind: 'medium', label: 'Medium', placeholder: 'medium.com/@you' },
  { kind: 'custom', label: 'Custom link', placeholder: 'yoursite.com' },
]

export interface ExperienceItem {
  id: string
  role: string
  company: string
  location: string
  startDate: string // free text: "Mar 2021" / "2021"
  endDate: string // "Present" or date
  bullets: string[]
}

export interface EducationItem {
  id: string
  degree: string
  school: string
  location: string
  startDate: string
  endDate: string
  note: string // honours, dissertation, GPA...
}

export interface ProjectItem {
  id: string
  name: string
  description: string
  tech: string // "React · Tailwind · Postgres"
  repoUrl: string // GitHub repo or code link
  liveUrl: string // live demo / deployed site
}

export interface SkillItem {
  id: string
  name: string
}

export type LanguageLevel = 'Native' | 'Fluent' | 'Professional' | 'Conversational' | 'Basic'

export interface LanguageItem {
  id: string
  name: string
  level: LanguageLevel
}

export interface CertItem {
  id: string
  name: string
  issuer: string
  year: string
}

// ─── Custom sections (R3) — user-defined sections like "Volunteering" ──────

export interface CustomSectionItem {
  id: string
  title: string // entry heading, e.g. "Camp Coordinator"
  subtitle: string // optional context line, e.g. "Red Cross · 2023"
  body: string // free text; newlines are preserved when rendered
}

export interface CustomSection {
  id: string
  name: string // section title, e.g. "Volunteering"
  items: CustomSectionItem[]
}

export interface CvData {
  contact: Contact
  summary: string
  experience: ExperienceItem[]
  education: EducationItem[]
  projects: ProjectItem[]
  skills: SkillItem[]
  certifications: CertItem[]
  languages: LanguageItem[]
  // Layout (R3) — all optional so older saved CVs / cloud drafts stay valid:
  sectionOrder?: string[] // desired order of core section keys + custom section ids
  hiddenSections?: string[] // keys hidden from the rendered CV
  customSections?: CustomSection[]
}

// 12 templates: 6 originals + 6 premium (R5)
export type TemplateId =
  | 'classic' | 'modern' | 'minimal' | 'executive' | 'creative' | 'compact'
  | 'aurora' | 'vertex' | 'editorial' | 'atlas' | 'slate' | 'lumina'

export interface ThemeSpec {
  accent: string // primary accent (links, rules, highlights)
  headerBg: string // sidebar / header band background
  headerText: string // text on headerBg
  text: string // main body text
  muted: string // secondary text
}

export interface DesignSettings {
  templateId: TemplateId
  theme: ThemeSpec
  fontScale: number // content zoom 0.8 – 1.15 (page fit)
  showPhoto: boolean
}

// ─── Portfolio website (Layer 2 share page) ─────────────────────────────────

export interface PortfolioProject {
  id: string
  title: string
  description: string
  image: string // compressed dataURL, '' = none
  url: string // live link
  repoUrl: string // code link
  tags: string // "React · Design"
}

export interface TestimonialItem {
  id: string
  quote: string // the recommendation text
  author: string // who said it
  role: string // their title/company, e.g. "Manager, Acme Ltd"
}

export interface GalleryItem {
  id: string
  image: string // compressed dataURL, '' = none
  caption: string
}

// R7: 15 portfolio layouts — the 3 R5 originals stay renderable for backward
// compatibility. R6 added the GenZ six; R7 adds 3 professional styles and 3
// beautiful ones, so every taste from boardroom to art school is covered.
export type PortfolioLayout =
  | 'signature' | 'horizon' | 'spotlight' // originals (legacy, still rendered)
  | 'aura' | 'riot' | 'editorial' | 'terminal' | 'bento' | 'vogue' // GenZ six (R6)
  | 'atelier' | 'monolith' | 'meridian' // professional three (R7)
  | 'noir' | 'lagoon' | 'bloom' // beautiful three (R7)

export const PORTFOLIO_LAYOUTS: { id: PortfolioLayout; name: string; blurb: string }[] = [
  { id: 'signature', name: 'Signature', blurb: 'Centered hero · soft glow' },
  { id: 'horizon', name: 'Horizon', blurb: 'Bold banner · left-aligned' },
  { id: 'spotlight', name: 'Spotlight', blurb: 'Editorial · big type, minimal' },
]

/** The 6 headline GenZ styles (R6) — shown first in the portfolio builder */
export const PORTFOLIO_STYLES: { id: PortfolioLayout; name: string; blurb: string; vibe: string }[] = [
  { id: 'aura', name: 'Aura', blurb: 'Gradient glow · glass cards', vibe: 'the aesthetic one' },
  { id: 'riot', name: 'Riot', blurb: 'Neobrutalism · stickers & shadows', vibe: 'the loud one' },
  { id: 'editorial', name: 'Editorial', blurb: 'Magazine serif · numbered sections', vibe: 'the writer one' },
  { id: 'terminal', name: 'Terminal', blurb: 'Monospace · dark dev console', vibe: 'the dev one' },
  { id: 'bento', name: 'Bento', blurb: 'Bento grid · image-forward tiles', vibe: 'the creator one' },
  { id: 'vogue', name: 'Vogue', blurb: 'Luxe minimal · thin rules', vibe: 'the elegant one' },
]

/** R7 · The professional three — boardroom-grade, for serious portfolios */
export const PORTFOLIO_PRO_STYLES: { id: PortfolioLayout; name: string; blurb: string; vibe: string }[] = [
  { id: 'atelier', name: 'Atelier', blurb: 'Studio minimal · ivory & serif', vibe: 'the refined one' },
  { id: 'monolith', name: 'Monolith', blurb: 'Bold corporate · oversized type', vibe: 'the executive one' },
  { id: 'meridian', name: 'Meridian', blurb: 'Clean consulting · structured', vibe: 'the polished one' },
]

/** R7 · The beautiful three — pure visual atmosphere */
export const PORTFOLIO_LUXE_STYLES: { id: PortfolioLayout; name: string; blurb: string; vibe: string }[] = [
  { id: 'noir', name: 'Noir', blurb: 'Black & gold · quiet luxury', vibe: 'the cinematic one' },
  { id: 'lagoon', name: 'Lagoon', blurb: 'Aqua calm · flowing waves', vibe: 'the serene one' },
  { id: 'bloom', name: 'Bloom', blurb: 'Soft botanical · garden pastels', vibe: 'the graceful one' },
]

export const PORTFOLIO_ALL_LAYOUTS: PortfolioLayout[] = [
  ...PORTFOLIO_STYLES.map((s) => s.id),
  ...PORTFOLIO_PRO_STYLES.map((s) => s.id),
  ...PORTFOLIO_LUXE_STYLES.map((s) => s.id),
  ...PORTFOLIO_LAYOUTS.map((l) => l.id),
]

/** Orderable portfolio sections (hero is always first, footer always last) */
export type PortfolioSectionKey = 'about' | 'projects' | 'experience' | 'education' | 'skills' | 'testimonials' | 'gallery' | 'contact'
export const PORTFOLIO_SECTION_ORDER: PortfolioSectionKey[] = ['about', 'projects', 'experience', 'education', 'skills', 'testimonials', 'gallery', 'contact']

export type PortfolioRadius = 'sharp' | 'round' | 'pill'
export type PortfolioTexture = 'plain' | 'grid' | 'dots' | 'blobs'
export type PortfolioFont = 'sans' | 'serif' | 'mono' | 'grotesk'

/** R7 · Animation level for the whole page (optional token, older data = off) */
export type PortfolioMotion = 'off' | 'subtle' | 'rich'
export const PORTFOLIO_MOTIONS: { id: PortfolioMotion; name: string; blurb: string }[] = [
  { id: 'off', name: 'None', blurb: 'Perfectly still — a printed page' },
  { id: 'subtle', name: 'Subtle', blurb: 'Sections fade in as you scroll' },
  { id: 'rich', name: 'Rich', blurb: 'Reveals + hero entrance + hover lifts' },
]

export const PORTFOLIO_FONT_STACKS: Record<PortfolioFont, string> = {
  sans: 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  serif: 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif',
  mono: 'ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace',
  grotesk: '"Space Grotesk", ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif',
}

export const PORTFOLIO_RADIUS_PX: Record<PortfolioRadius, string> = {
  sharp: '0px',
  round: '16px',
  pill: '28px',
}

export interface PortfolioSpec {
  enabled: boolean
  mode: 'light' | 'dark'
  layout: PortfolioLayout // website template (R5 originals + R6 GenZ six)
  accent: string
  tagline: string // hero subtitle (defaults to job title)
  about: string // defaults to CV summary when empty
  sections: Record<PortfolioSectionKey, boolean>
  projects: PortfolioProject[]
  testimonials: TestimonialItem[]
  gallery: GalleryItem[]
  // ── R6 design tokens (all optional so older saved data stays valid) ──
  font?: PortfolioFont // type personality (undefined = style's own default)
  radius?: PortfolioRadius // corner personality (sharp/round/pill)
  texture?: PortfolioTexture // background texture (plain/grid/dots/blobs)
  marquee?: string // scrolling ribbon text, '' = off
  badge?: string // hero availability chip, '' = hidden
  sectionOrder?: PortfolioSectionKey[] // custom section order
  motion?: PortfolioMotion // R7 animation level (undefined/legacy = off)
}

export const emptyPortfolio = (): PortfolioSpec => ({
  enabled: false,
  mode: 'light',
  layout: 'aura',
  accent: '#4F46E5',
  tagline: '',
  about: '',
  sections: { about: true, projects: true, experience: true, education: false, skills: true, contact: true, testimonials: false, gallery: false },
  projects: [],
  testimonials: [],
  gallery: [],
  radius: 'round',
  texture: 'plain',
  marquee: '',
  badge: '',
  sectionOrder: [],
  motion: 'subtle', // new portfolios start with tasteful motion; legacy data (no field) stays off
})

export interface PublishedInfo {
  username: string
  claimKey: string // legacy — no longer issued; kept for old browsers' saved data
  /** Secret proof-of-ownership for anonymous updates: issued by the server on
   *  every successful publish, stored hashed server-side, sent back on update */
  updateToken?: string
  publishedAt: string
}

export const LANGUAGE_LEVELS: LanguageLevel[] = ['Native', 'Fluent', 'Professional', 'Conversational', 'Basic']

export const emptyCv = (): CvData => ({
  contact: { fullName: '', jobTitle: '', email: '', phone: '', location: '', website: '', linkedin: '', links: [] },
  summary: '',
  experience: [],
  education: [],
  projects: [],
  skills: [],
  certifications: [],
  languages: [],
  sectionOrder: [],
  hiddenSections: [],
  customSections: [],
})

/** Upgrade older saved CVs (pre-projects / pre-links) so old browsers don't break.
 *  R6: also repairs missing entry ids so React keys are always stable. */
export function normalizeCv(raw: unknown): CvData {
  const base = emptyCv()
  if (!raw || typeof raw !== 'object') return base
  const cv = raw as Partial<CvData>
  const contact = { ...base.contact, ...(cv.contact || {}) }
  if (!Array.isArray(contact.links)) contact.links = []
  const withIds = <T extends { id?: string }>(list: unknown): T[] =>
    Array.isArray(list) ? list.filter(Boolean).map((x) => ({ ...(x as T), id: (x as T).id || uid() })) : []
  return {
    contact,
    summary: typeof cv.summary === 'string' ? cv.summary : '',
    experience: withIds<ExperienceItem>(cv.experience),
    education: withIds<EducationItem>(cv.education),
    projects: withIds<ProjectItem>(cv.projects),
    skills: withIds<SkillItem>(cv.skills),
    certifications: withIds<CertItem>(cv.certifications),
    languages: withIds<LanguageItem>(cv.languages),
    sectionOrder: Array.isArray(cv.sectionOrder)
      ? cv.sectionOrder.filter((k): k is string => typeof k === 'string')
      : [],
    hiddenSections: Array.isArray(cv.hiddenSections)
      ? cv.hiddenSections.filter((k): k is string => typeof k === 'string')
      : [],
    customSections: Array.isArray(cv.customSections)
      ? cv.customSections.map((raw) => {
          const cs = (raw || {}) as Partial<CustomSection>
          return {
            id: typeof cs.id === 'string' && cs.id ? cs.id : uid(),
            name: typeof cs.name === 'string' ? cs.name : '',
            items: withIds<CustomSectionItem>(cs.items),
          }
        })
      : [],
  }
}

/** Upgrade an older PortfolioSpec / any object into a full PortfolioSpec */
export function normalizePortfolio(raw: unknown): PortfolioSpec {
  const base = emptyPortfolio()
  if (!raw || typeof raw !== 'object') return base
  const p = raw as Partial<PortfolioSpec>
  const RADII: PortfolioRadius[] = ['sharp', 'round', 'pill']
  const TEXTURES: PortfolioTexture[] = ['plain', 'grid', 'dots', 'blobs']
  const FONTS: PortfolioFont[] = ['sans', 'serif', 'mono', 'grotesk']
  const MOTIONS: PortfolioMotion[] = ['off', 'subtle', 'rich']
  return {
    enabled: !!p.enabled,
    mode: p.mode === 'dark' ? 'dark' : 'light',
    layout: (PORTFOLIO_ALL_LAYOUTS.includes(p.layout as PortfolioLayout) ? p.layout : 'aura') as PortfolioLayout,
    accent: typeof p.accent === 'string' ? p.accent : base.accent,
    tagline: typeof p.tagline === 'string' ? p.tagline : '',
    about: typeof p.about === 'string' ? p.about : '',
    sections: { ...base.sections, ...(p.sections || {}) },
    projects: Array.isArray(p.projects)
      ? p.projects.map((x) => ({ ...(x || ({} as PortfolioProject)), id: (x as PortfolioProject)?.id || uid() }))
      : [],
    testimonials: Array.isArray(p.testimonials)
      ? p.testimonials.map((x) => ({ ...(x || ({} as TestimonialItem)), id: (x as TestimonialItem)?.id || uid() }))
      : [],
    gallery: Array.isArray(p.gallery)
      ? p.gallery.map((x) => ({ ...(x || ({} as GalleryItem)), id: (x as GalleryItem)?.id || uid() }))
      : [],
    font: (FONTS.includes(p.font as PortfolioFont) ? p.font : undefined) as PortfolioFont | undefined,
    radius: (RADII.includes(p.radius as PortfolioRadius) ? p.radius : base.radius) as PortfolioRadius,
    texture: (TEXTURES.includes(p.texture as PortfolioTexture) ? p.texture : base.texture) as PortfolioTexture,
    marquee: typeof p.marquee === 'string' ? p.marquee : '',
    badge: typeof p.badge === 'string' ? p.badge : '',
    motion: (MOTIONS.includes(p.motion as PortfolioMotion) ? p.motion : 'off') as PortfolioMotion,
    sectionOrder: Array.isArray(p.sectionOrder)
      ? (p.sectionOrder.filter((k): k is PortfolioSectionKey => typeof k === 'string' && (PORTFOLIO_SECTION_ORDER as string[]).includes(k)))
      : [],
  }
}

export const uid = (): string =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : Math.random().toString(36).slice(2) + Date.now().toString(36)
