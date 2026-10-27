'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { CvData, DesignSettings, PublishedInfo } from './types'
import { emptyCv, uid } from './types'
import { DEFAULT_PALETTE } from './palettes'
import { SAMPLE_CV } from './sample'

export type BuilderStep =
  | 'template' | 'contact' | 'experience' | 'education' | 'skills'
  | 'summary' | 'extras' | 'review' | 'jobmatch' | 'export'

export const STEP_ORDER: BuilderStep[] = [
  'template', 'contact', 'experience', 'education', 'skills',
  'summary', 'extras', 'review', 'jobmatch', 'export',
]

export const STEP_META: Record<BuilderStep, { title: string; hint: string }> = {
  template: { title: 'Template & Colors', hint: 'Pick a design, make it yours' },
  contact: { title: 'Contact & Photo', hint: 'Who you are and how to reach you' },
  experience: { title: 'Work Experience', hint: 'What you have achieved' },
  education: { title: 'Education', hint: 'Where you studied' },
  skills: { title: 'Skills', hint: 'What you are great at' },
  summary: { title: 'Professional Summary', hint: 'Your story in a few lines' },
  extras: { title: 'Certifications & Languages', hint: 'Optional extras that add weight' },
  review: { title: 'Review & Score', hint: 'How strong is your CV?' },
  jobmatch: { title: 'Job Match', hint: 'Beat the ATS robots' },
  export: { title: 'Export & Share', hint: 'Download or publish your CV' },
}

interface SeemehereState {
  hydrated: boolean
  cv: CvData
  design: DesignSettings
  photoData: string // compressed dataURL, '' = none
  publishInfo: PublishedInfo | null
  builderStarted: boolean

  setHydrated: () => void
  setBuilderStarted: (v: boolean) => void

  setContactField: (field: keyof CvData['contact'], value: string) => void
  setSummary: (v: string) => void

  addExperience: () => string
  updateExperience: (id: string, patch: Partial<CvData['experience'][number]>) => void
  removeExperience: (id: string) => void
  moveExperience: (id: string, dir: -1 | 1) => void

  addEducation: () => string
  updateEducation: (id: string, patch: Partial<CvData['education'][number]>) => void
  removeEducation: (id: string) => void
  moveEducation: (id: string, dir: -1 | 1) => void

  addSkill: (name: string) => void
  removeSkill: (id: string) => void
  setSkills: (names: string[]) => void

  addCertification: () => string
  updateCertification: (id: string, patch: Partial<CvData['certifications'][number]>) => void
  removeCertification: (id: string) => void

  addLanguage: () => string
  updateLanguage: (id: string, patch: Partial<CvData['languages'][number]>) => void
  removeLanguage: (id: string) => void

  setDesign: (patch: Partial<DesignSettings>) => void
  setPhoto: (dataUrl: string) => void
  setPublishInfo: (info: PublishedInfo | null) => void
  loadSample: () => void
  resetAll: () => void
}

const emptyEducation = () => ({ id: uid(), degree: '', school: '', location: '', startDate: '', endDate: '', note: '' })

export const useCvStore = create<SeemehereState>()(
  persist(
    (set, get) => ({
      hydrated: false,
      cv: emptyCv(),
      design: { templateId: 'modern', theme: { ...DEFAULT_PALETTE.theme }, fontScale: 1, showPhoto: true },
      photoData: '',
      publishInfo: null,
      builderStarted: false,

      setHydrated: () => set({ hydrated: true }),
      setBuilderStarted: (v) => set({ builderStarted: v }),

      setContactField: (field, value) => set((s) => ({ cv: { ...s.cv, contact: { ...s.cv.contact, [field]: value } } })),
      setSummary: (v) => set((s) => ({ cv: { ...s.cv, summary: v } })),

      addExperience: () => {
        const id = uid()
        set((s) => ({ cv: { ...s.cv, experience: [...s.cv.experience, { id, role: '', company: '', location: '', startDate: '', endDate: '', bullets: [''] }] } }))
        return id
      },
      updateExperience: (id, patch) =>
        set((s) => ({ cv: { ...s.cv, experience: s.cv.experience.map((e) => (e.id === id ? { ...e, ...patch } : e)) } })),
      removeExperience: (id) => set((s) => ({ cv: { ...s.cv, experience: s.cv.experience.filter((e) => e.id !== id) } })),
      moveExperience: (id, dir) =>
        set((s) => {
          const arr = [...s.cv.experience]
          const i = arr.findIndex((e) => e.id === id)
          const j = i + dir
          if (i < 0 || j < 0 || j >= arr.length) return s
          ;[arr[i], arr[j]] = [arr[j], arr[i]]
          return { cv: { ...s.cv, experience: arr } }
        }),

      addEducation: () => {
        const item = emptyEducation()
        set((s) => ({ cv: { ...s.cv, education: [...s.cv.education, item] } }))
        return item.id
      },
      updateEducation: (id, patch) =>
        set((s) => ({ cv: { ...s.cv, education: s.cv.education.map((e) => (e.id === id ? { ...e, ...patch } : e)) } })),
      removeEducation: (id) => set((s) => ({ cv: { ...s.cv, education: s.cv.education.filter((e) => e.id !== id) } })),
      moveEducation: (id, dir) =>
        set((s) => {
          const arr = [...s.cv.education]
          const i = arr.findIndex((e) => e.id === id)
          const j = i + dir
          if (i < 0 || j < 0 || j >= arr.length) return s
          ;[arr[i], arr[j]] = [arr[j], arr[i]]
          return { cv: { ...s.cv, education: arr } }
        }),

      addSkill: (name) => {
        const n = name.trim()
        if (!n) return
        set((s) => {
          if (s.cv.skills.some((k) => k.name.toLowerCase() === n.toLowerCase())) return s
          return { cv: { ...s.cv, skills: [...s.cv.skills, { id: uid(), name: n }] } }
        })
      },
      removeSkill: (id) => set((s) => ({ cv: { ...s.cv, skills: s.cv.skills.filter((k) => k.id !== id) } })),
      setSkills: (names) => set((s) => ({ cv: { ...s.cv, skills: names.map((n) => ({ id: uid(), name: n })) } })),

      addCertification: () => {
        const id = uid()
        set((s) => ({ cv: { ...s.cv, certifications: [...s.cv.certifications, { id, name: '', issuer: '', year: '' }] } }))
        return id
      },
      updateCertification: (id, patch) =>
        set((s) => ({ cv: { ...s.cv, certifications: s.cv.certifications.map((c) => (c.id === id ? { ...c, ...patch } : c)) } })),
      removeCertification: (id) => set((s) => ({ cv: { ...s.cv, certifications: s.cv.certifications.filter((c) => c.id !== id) } })),

      addLanguage: () => {
        const id = uid()
        set((s) => ({ cv: { ...s.cv, languages: [...s.cv.languages, { id, name: '', level: 'Conversational' as const }] } }))
        return id
      },
      updateLanguage: (id, patch) =>
        set((s) => ({ cv: { ...s.cv, languages: s.cv.languages.map((l) => (l.id === id ? { ...l, ...patch } : l)) } })),
      removeLanguage: (id) => set((s) => ({ cv: { ...s.cv, languages: s.cv.languages.filter((l) => l.id !== id) } })),

      setDesign: (patch) => set((s) => ({ design: { ...s.design, ...patch } })),
      setPhoto: (dataUrl) => set({ photoData: dataUrl }),
      setPublishInfo: (info) => set({ publishInfo: info }),

      loadSample: () => set({ cv: JSON.parse(JSON.stringify(SAMPLE_CV)) }),
      resetAll: () =>
        set({
          cv: emptyCv(),
          design: { templateId: 'modern', theme: { ...DEFAULT_PALETTE.theme }, fontScale: 1, showPhoto: true },
          photoData: '',
          publishInfo: null,
          builderStarted: false,
        }),
    }),
    {
      name: 'seemehere-cv-v1',
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ cv: s.cv, design: s.design, photoData: s.photoData, publishInfo: s.publishInfo, builderStarted: s.builderStarted }),
      onRehydrateStorage: () => (state) => state?.setHydrated(),
    },
  ),
)

// Convenience getter used by exports/publish
export const getCvSnapshot = () => {
  const s = useCvStore.getState()
  return { cv: s.cv, design: s.design, photoData: s.photoData, displayName: s.cv.contact.fullName || 'My CV' }
}
