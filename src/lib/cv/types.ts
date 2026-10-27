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

export interface CvData {
  contact: Contact
  summary: string
  experience: ExperienceItem[]
  education: EducationItem[]
  projects: ProjectItem[]
  skills: SkillItem[]
  certifications: CertItem[]
  languages: LanguageItem[]
}

export type TemplateId = 'classic' | 'modern' | 'minimal' | 'executive' | 'creative' | 'compact'

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

export interface PortfolioSpec {
  enabled: boolean
  mode: 'light' | 'dark'
  accent: string
  tagline: string // hero subtitle (defaults to job title)
  about: string // defaults to CV summary when empty
  sections: {
    about: boolean
    projects: boolean
    experience: boolean
    education: boolean
    skills: boolean
    contact: boolean
    testimonials: boolean
    gallery: boolean
  }
  projects: PortfolioProject[]
  testimonials: TestimonialItem[]
  gallery: GalleryItem[]
}

export const emptyPortfolio = (): PortfolioSpec => ({
  enabled: false,
  mode: 'light',
  accent: '#4F46E5',
  tagline: '',
  about: '',
  sections: { about: true, projects: true, experience: true, education: false, skills: true, contact: true, testimonials: false, gallery: false },
  projects: [],
  testimonials: [],
  gallery: [],
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
})

/** Upgrade older saved CVs (pre-projects / pre-links) so old browsers don't break */
export function normalizeCv(raw: unknown): CvData {
  const base = emptyCv()
  if (!raw || typeof raw !== 'object') return base
  const cv = raw as Partial<CvData>
  const contact = { ...base.contact, ...(cv.contact || {}) }
  if (!Array.isArray(contact.links)) contact.links = []
  return {
    contact,
    summary: typeof cv.summary === 'string' ? cv.summary : '',
    experience: Array.isArray(cv.experience) ? cv.experience : [],
    education: Array.isArray(cv.education) ? cv.education : [],
    projects: Array.isArray(cv.projects) ? cv.projects : [],
    skills: Array.isArray(cv.skills) ? cv.skills : [],
    certifications: Array.isArray(cv.certifications) ? cv.certifications : [],
    languages: Array.isArray(cv.languages) ? cv.languages : [],
  }
}

/** Upgrade an older PortfolioSpec / any object into a full PortfolioSpec */
export function normalizePortfolio(raw: unknown): PortfolioSpec {
  const base = emptyPortfolio()
  if (!raw || typeof raw !== 'object') return base
  const p = raw as Partial<PortfolioSpec>
  return {
    enabled: !!p.enabled,
    mode: p.mode === 'dark' ? 'dark' : 'light',
    accent: typeof p.accent === 'string' ? p.accent : base.accent,
    tagline: typeof p.tagline === 'string' ? p.tagline : '',
    about: typeof p.about === 'string' ? p.about : '',
    sections: { ...base.sections, ...(p.sections || {}) },
    projects: Array.isArray(p.projects) ? p.projects : [],
    testimonials: Array.isArray(p.testimonials) ? p.testimonials : [],
    gallery: Array.isArray(p.gallery) ? p.gallery : [],
  }
}

export const uid = (): string =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : Math.random().toString(36).slice(2) + Date.now().toString(36)
