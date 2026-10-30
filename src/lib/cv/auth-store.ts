'use client'

import { create } from 'zustand'
import type { CvData, DesignSettings, PortfolioSpec } from './types'

// ─── Client auth store — optional username+password sessions ────────────────
// The session lives in an httpOnly cookie; this store mirrors /api/auth/me
// and manages cloud drafts (profiles).

export interface CloudDraft {
  id: string
  name: string
  kind?: string // "cv" | "portfolio" (R6 split; older drafts default to cv)
  templateId: string
  theme: Partial<DesignSettings['theme']>
  cv: CvData
  photoData: string
  portfolio: Partial<PortfolioSpec>
  publishedUser: string
  updatedAt: string
}

interface AuthState {
  user: { username: string } | null
  authChecked: boolean // /api/auth/me has answered at least once
  checkingAuth: boolean
  profiles: CloudDraft[]
  activeProfileId: string | null
  cloudSaveState: 'idle' | 'saving' | 'saved' | 'error'

  fetchMe: () => Promise<void>
  signup: (username: string, password: string, draft?: unknown) => Promise<{ ok: boolean; error?: string }>
  login: (username: string, password: string) => Promise<{ ok: boolean; error?: string }>
  logout: () => Promise<void>

  loadProfiles: () => Promise<CloudDraft[]>
  saveActiveDraft: (payload: {
    id: string | null
    name: string
    kind?: 'cv' | 'portfolio'
    templateId: string
    theme: DesignSettings['theme']
    cv: CvData
    photoData: string
    portfolio: PortfolioSpec
    publishedUser?: string
  }) => Promise<string | null>
  deleteProfile: (id: string) => Promise<void>
  setActiveProfileId: (id: string | null) => void
  setCloudSaveState: (s: AuthState['cloudSaveState']) => void
}

export const useAuthStore = create<AuthState>()((set, get) => ({
  user: null,
  authChecked: false,
  checkingAuth: false,
  profiles: [],
  activeProfileId: null,
  cloudSaveState: 'idle',

  fetchMe: async () => {
    if (get().checkingAuth) return
    set({ checkingAuth: true })
    try {
      const res = await fetch('/api/auth/me', { cache: 'no-store' })
      const j = (await res.json()) as { user: { username: string } | null }
      set({ user: j.user, authChecked: true })
      if (j.user) void get().loadProfiles()
      else set({ profiles: [], activeProfileId: null })
    } catch {
      set({ authChecked: true })
    } finally {
      set({ checkingAuth: false })
    }
  },

  signup: async (username, password, draft) => {
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, draft }),
      })
      const j = (await res.json()) as { user?: { username: string }; error?: string }
      if (!res.ok || !j.user) return { ok: false, error: j.error || 'Could not create the account' }
      set({ user: j.user, activeProfileId: null })
      await get().loadProfiles()
      return { ok: true }
    } catch {
      return { ok: false, error: 'Could not reach the server' }
    }
  },

  login: async (username, password) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })
      const j = (await res.json()) as { user?: { username: string }; error?: string }
      if (!res.ok || !j.user) return { ok: false, error: j.error || 'Sign in failed' }
      set({ user: j.user })
      await get().loadProfiles()
      return { ok: true }
    } catch {
      return { ok: false, error: 'Could not reach the server' }
    }
  },

  logout: async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch {}
    set({ user: null, profiles: [], activeProfileId: null, cloudSaveState: 'idle' })
  },

  loadProfiles: async () => {
    try {
      const res = await fetch('/api/drafts', { cache: 'no-store' })
      if (!res.ok) return []
      const j = (await res.json()) as { drafts: CloudDraft[] }
      set({ profiles: j.drafts })
      return j.drafts
    } catch {
      return []
    }
  },

  saveActiveDraft: async (payload) => {
    set({ cloudSaveState: 'saving' })
    try {
      const res = await fetch('/api/drafts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error('failed')
      const j = (await res.json()) as { id: string }
      const profiles = get().profiles
      const existingIdx = profiles.findIndex((p) => p.id === j.id)
      const entry: CloudDraft = {
        id: j.id,
        name: payload.name,
        kind: payload.kind || 'cv',
        templateId: payload.templateId,
        theme: payload.theme,
        cv: payload.cv,
        photoData: payload.photoData,
        portfolio: payload.portfolio,
        publishedUser: payload.publishedUser || '',
        updatedAt: new Date().toISOString(),
      }
      if (existingIdx >= 0) {
        const next = [...profiles]
        next[existingIdx] = { ...next[existingIdx], ...entry }
        set({ profiles: next })
      } else {
        set({ profiles: [entry, ...profiles] })
      }
      set({ cloudSaveState: 'saved', activeProfileId: j.id })
      return j.id
    } catch {
      set({ cloudSaveState: 'error' })
      return null
    }
  },

  deleteProfile: async (id) => {
    try {
      await fetch(`/api/drafts/${id}`, { method: 'DELETE' })
    } catch {}
    const next = get().profiles.filter((p) => p.id !== id)
    set({ profiles: next, activeProfileId: get().activeProfileId === id ? null : get().activeProfileId })
  },

  setActiveProfileId: (id) => set({ activeProfileId: id }),
  setCloudSaveState: (s) => set({ cloudSaveState: s }),
}))
