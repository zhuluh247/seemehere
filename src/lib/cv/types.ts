// ─── SEEMEHERE · Core CV data model ──────────────────────────────────────────

export interface Contact {
  fullName: string
  jobTitle: string
  email: string
  phone: string
  location: string
  website: string
  linkedin: string
}

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

export interface PublishedInfo {
  username: string
  claimKey: string
  publishedAt: string
}

export const LANGUAGE_LEVELS: LanguageLevel[] = ['Native', 'Fluent', 'Professional', 'Conversational', 'Basic']

export const emptyCv = (): CvData => ({
  contact: { fullName: '', jobTitle: '', email: '', phone: '', location: '', website: '', linkedin: '' },
  summary: '',
  experience: [],
  education: [],
  skills: [],
  certifications: [],
  languages: [],
})

export const uid = (): string =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : Math.random().toString(36).slice(2) + Date.now().toString(36)
