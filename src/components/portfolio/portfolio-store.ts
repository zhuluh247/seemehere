'use client'

// ─── R6 · Portfolio builder store ───────────────────────────────────────────
// Separate product from the CV builder: its own persisted state, its own
// publish info. The CV content inside (this.cv) is IMPORTED from a CV (local
// browser copy or a picked cloud draft) or typed from scratch — the portfolio
// builder never writes back to the CV builder's store.

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { CvData, PortfolioProject, PortfolioSectionKey, PortfolioSpec, PublishedInfo } from '@/lib/cv/types'
import { emptyCv, emptyPortfolio, normalizeCv, normalizePortfolio, uid } from '@/lib/cv/types'
import { SAMPLE_CV } from '@/lib/cv/sample'

interface PortfolioState {
  hydrated: boolean
  started: boolean // user picked a starting point
  name: string // draft label, e.g. "Sarah portfolio"
  cv: CvData // content feeding the website (imported or typed)
  portfolio: PortfolioSpec
  photoData: string
  publishInfo: PublishedInfo | null
  activeDraftId: string | null // cloud draft id when signed in

  setHydrated: () => void

  startFromCv: (cv: CvData, photoData: string, label?: string) => void
  startScratch: () => void
  loadSample: () => void
  hydrateDraft: (d: { id?: string; name?: string; cv: unknown; portfolio: unknown; photoData?: string }) => void
  resetAll: () => void

  setContactField: (field: keyof CvData['contact'], value: string) => void
  addLink: (kind: string, label: string, url: string) => void
  updateLink: (id: string, patch: Partial<{ url: string; label: string }>) => void
  removeLink: (id: string) => void
  setPhoto: (dataUrl: string) => void

  patchPortfolio: (patch: Partial<PortfolioSpec>) => void
  patchSections: (patch: Partial<PortfolioSpec['sections']>) => void
  moveSection: (key: PortfolioSectionKey, dir: -1 | 1) => void

  addProject: () => string
  updateProject: (id: string, patch: Partial<PortfolioProject>) => void
  removeProject: (id: string) => void
  moveProject: (id: string, dir: -1 | 1) => void

  setPublishInfo: (info: PublishedInfo | null) => void
  setActiveDraft: (id: string | null) => void
}

const emptyProject = (): PortfolioProject => ({ id: uid(), title: '', description: '', image: '', url: '', repoUrl: '', tags: '' })

/** Seed an enabled portfolio from imported CV content */
export function portfolioSeededFromCv(cv: CvData): PortfolioSpec {
  const base = emptyPortfolio()
  return {
    ...base,
    enabled: true,
    tagline: cv.contact.jobTitle || '',
    about: cv.summary || '',
    projects: cv.projects
      .filter((p) => p.name.trim())
      .map((p) => ({
        id: uid(),
        title: p.name,
        description: p.description,
        image: '',
        url: p.liveUrl,
        repoUrl: p.repoUrl,
        tags: p.tech,
      })),
  }
}

export const usePortfolioStore = create<PortfolioState>()(
  persist(
    (set) => ({
      hydrated: false,
      started: false,
      name: 'My portfolio',
      cv: emptyCv(),
      portfolio: emptyPortfolio(),
      photoData: '',
      publishInfo: null,
      activeDraftId: null,

      setHydrated: () => set({ hydrated: true }),

      startFromCv: (cv, photoData, label) =>
        set({
          started: true,
          cv: normalizeCv(cv),
          photoData: photoData || '',
          portfolio: portfolioSeededFromCv(normalizeCv(cv)),
          name: label || `${cv.contact.fullName || 'My'} portfolio`,
          publishInfo: null,
        }),

      startScratch: () => set({ started: true, cv: emptyCv(), portfolio: { ...emptyPortfolio(), enabled: true }, publishInfo: null }),

      loadSample: () => {
        const cv = JSON.parse(JSON.stringify(SAMPLE_CV)) as CvData
        set({ started: true, cv, photoData: '', portfolio: portfolioSeededFromCv(cv), name: 'Sample portfolio', publishInfo: null })
      },

      hydrateDraft: (d) =>
        set({
          started: true,
          name: d.name || 'My portfolio',
          cv: normalizeCv(d.cv),
          portfolio: normalizePortfolio(d.portfolio),
          photoData: d.photoData || '',
          activeDraftId: d.id || null,
        }),

      resetAll: () =>
        set({
          started: false,
          name: 'My portfolio',
          cv: emptyCv(),
          portfolio: emptyPortfolio(),
          photoData: '',
          publishInfo: null,
          activeDraftId: null,
        }),

      setContactField: (field, value) => set((s) => ({ cv: { ...s.cv, contact: { ...s.cv.contact, [field]: value } } })),
      addLink: (kind, label, url) =>
        set((s) => ({
          cv: { ...s.cv, contact: { ...s.cv.contact, links: [...s.cv.contact.links, { id: uid(), kind: kind as CvData['contact']['links'][number]['kind'], label, url }] } },
        })),
      updateLink: (id, patch) =>
        set((s) => ({
          cv: { ...s.cv, contact: { ...s.cv.contact, links: s.cv.contact.links.map((l) => (l.id === id ? { ...l, ...patch } : l)) } },
        })),
      removeLink: (id) =>
        set((s) => ({ cv: { ...s.cv, contact: { ...s.cv.contact, links: s.cv.contact.links.filter((l) => l.id !== id) } } })),
      setPhoto: (dataUrl) => set({ photoData: dataUrl }),

      patchPortfolio: (patch) => set((s) => ({ portfolio: { ...s.portfolio, ...patch } })),
      patchSections: (patch) => set((s) => ({ portfolio: { ...s.portfolio, sections: { ...s.portfolio.sections, ...patch } } })),
      moveSection: (key, dir) =>
        set((s) => {
          const base: PortfolioSectionKey[] = ['about', 'projects', 'experience', 'education', 'skills', 'testimonials', 'gallery', 'contact']
          const custom = (s.portfolio.sectionOrder || []).filter((k) => base.includes(k))
          const order = [...custom, ...base.filter((k) => !custom.includes(k))]
          const i = order.indexOf(key)
          const j = i + dir
          if (i < 0 || j < 0 || j >= order.length) return s
          ;[order[i], order[j]] = [order[j], order[i]]
          return { portfolio: { ...s.portfolio, sectionOrder: order } }
        }),

      addProject: () => {
        const pr = emptyProject()
        set((s) => ({ portfolio: { ...s.portfolio, enabled: true, projects: [...s.portfolio.projects, pr] } }))
        return pr.id
      },
      updateProject: (id, patch) =>
        set((s) => ({ portfolio: { ...s.portfolio, projects: s.portfolio.projects.map((x) => (x.id === id ? { ...x, ...patch } : x)) } })),
      removeProject: (id) =>
        set((s) => ({ portfolio: { ...s.portfolio, projects: s.portfolio.projects.filter((x) => x.id !== id) } })),
      moveProject: (id, dir) =>
        set((s) => {
          const arr = [...s.portfolio.projects]
          const i = arr.findIndex((x) => x.id === id)
          const j = i + dir
          if (i < 0 || j < 0 || j >= arr.length) return s
          ;[arr[i], arr[j]] = [arr[j], arr[i]]
          return { portfolio: { ...s.portfolio, projects: arr } }
        }),

      setPublishInfo: (info) => set({ publishInfo: info }),
      setActiveDraft: (id) => set({ activeDraftId: id }),
    }),
    {
      name: 'seemehere-portfolio-v1',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ started: s.started, name: s.name, cv: s.cv, portfolio: s.portfolio, photoData: s.photoData, publishInfo: s.publishInfo, activeDraftId: s.activeDraftId }),
      migrate: (persisted: unknown) => {
        const p = (persisted || {}) as Record<string, unknown>
        return {
          ...p,
          cv: normalizeCv(p.cv),
          portfolio: normalizePortfolio(p.portfolio ?? p.portfolioJson),
        }
      },
      onRehydrateStorage: () => (state) => state?.setHydrated(),
    },
  ),
)

/** Convenience snapshot used by publish + autosave */
export const getPortfolioSnapshot = () => {
  const s = usePortfolioStore.getState()
  return {
    cv: s.cv,
    portfolio: s.portfolio,
    photoData: s.photoData,
    displayName: s.cv.contact.fullName || 'My portfolio',
  }
}
