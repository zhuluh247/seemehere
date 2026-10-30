'use client'

// ─── R6 · Portfolio Builder (route /portfolio) ──────────────────────────────
// A fully separate product from the CV builder:
//   Start screen  — "Start from my CV" (anonymous: this browser's CV is
//                   detected; signed-in: pick from ALL your saved CVs),
//                   start from scratch, or load the sample.
//   Editor        — Content / Design / Publish tabs + live site preview.
//   Publish       — same /cv/{username} namespace, kind "portfolio".
// Autosaves to the browser always, and to cloud drafts (kind "portfolio")
// when signed in.

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { usePortfolioStore } from './portfolio-store'
import { useCvStore } from '@/lib/cv/store'
import { useAuthStore, type CloudDraft } from '@/lib/cv/auth-store'
import { DesignPanel } from './DesignPanel'
import { ContentPanel, SECTION_META } from './ContentPanels'
import { PublishPanel } from './PublishPanel'
import { PortfolioSite } from '@/components/share/PortfolioSite'
import { LoginModal } from '@/components/auth/LoginModal'
import { Button } from '@/components/ui/button'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  ArrowRight, ChevronDown, ChevronLeft, ChevronUp, CloudCheck, CloudOff, CloudUpload, Eye, EyeOff, FileText, Globe,
  LayoutTemplate, LogOut, Monitor, Plus, Rocket, RotateCcw, Smartphone, Sparkles, UserRound, Wand2, X, PenLine,
} from 'lucide-react'
import { PORTFOLIO_SECTION_ORDER, type PortfolioSectionKey } from '@/lib/cv/types'
import { normalizeCv } from '@/lib/cv/types'
import { DEFAULT_PALETTE } from '@/lib/cv/palettes'

type Tab = 'content' | 'design' | 'publish'

// ── live preview frame ───────────────────────────────────────────────────────

function PreviewFrame({ mobileOverlay = false, onClose }: { mobileOverlay?: boolean; onClose?: () => void }) {
  const cv = usePortfolioStore((s) => s.cv)
  const portfolio = usePortfolioStore((s) => s.portfolio)
  const photoData = usePortfolioStore((s) => s.photoData)

  const wrapRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(0.5)
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop')
  const simWidth = device === 'desktop' ? 1280 : 390

  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const ro = new ResizeObserver(() => setScale(Math.min(1, el.clientWidth / simWidth)))
    ro.observe(el)
    return () => ro.disconnect()
  }, [simWidth])

  return (
    <div className={mobileOverlay ? 'fixed inset-0 z-50 flex flex-col bg-slate-900/95' : 'flex h-full flex-col'}>
      <div className="flex items-center justify-between gap-2 rounded-t-xl border border-slate-200 bg-slate-100 px-3 py-2">
        <div className="truncate text-xs font-medium text-slate-500">
          Live preview · <span className="font-semibold text-slate-700">{portfolio.layout}</span>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7" title="Desktop preview" onClick={() => setDevice('desktop')}>
            <Monitor className={`h-4 w-4 ${device === 'desktop' ? 'text-violet-600' : ''}`} />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" title="Phone preview" onClick={() => setDevice('mobile')}>
            <Smartphone className={`h-4 w-4 ${device === 'mobile' ? 'text-violet-600' : ''}`} />
          </Button>
          {mobileOverlay && (
            <Button variant="default" size="sm" className="h-7 text-xs" onClick={onClose}>Close</Button>
          )}
        </div>
      </div>
      <div ref={wrapRef} className="flex-1 overflow-auto rounded-b-xl border border-t-0 border-slate-200 bg-slate-200/60 p-3">
        <div style={{ width: simWidth, zoom: scale }} className="overflow-hidden rounded-lg shadow-xl">
          <PortfolioSite data={cv} photoData={photoData || undefined} portfolio={portfolio} preview />
        </div>
      </div>
    </div>
  )
}

// ── start screen ─────────────────────────────────────────────────────────────

/** R8 · StartScreen doubles as the "choose a different starting point" page:
 *  when a portfolio is already in progress it shows a Continue card on top
 *  and asks before replacing it with a different starting point. */
function StartScreen({ onLogin, hasExisting, existingName, onContinue }: { onLogin: () => void; hasExisting?: boolean; existingName?: string; onContinue?: () => void }) {
  const router = useRouter()
  const startFromCv = usePortfolioStore((s) => s.startFromCv)
  const startScratch = usePortfolioStore((s) => s.startScratch)
  const loadSample = usePortfolioStore((s) => s.loadSample)

  const localCv = useCvStore((s) => s.cv)
  const localPhoto = useCvStore((s) => s.photoData)
  const user = useAuthStore((s) => s.user)
  const profiles = useAuthStore((s) => s.profiles)
  const fetchMe = useAuthStore((s) => s.fetchMe)

  // R8 · replacing an in-progress portfolio with another starting point
  // needs one explicit confirmation — the pending action runs on confirm
  const [replaceOpen, setReplaceOpen] = useState(false)
  const pendingAction = useRef<(() => void) | null>(null)
  const guard = (action: () => void) => {
    if (hasExisting) {
      pendingAction.current = action
      setReplaceOpen(true)
    } else action()
  }

  useEffect(() => {
    void fetchMe()
  }, [fetchMe])

  const localHasCv = localCv.contact.fullName.trim().length > 0
  const cvDrafts = profiles.filter((p) => (p.kind || 'cv') !== 'portfolio' && normalizeCv(p.cv).contact.fullName.trim())

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10">
      <div className="text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">
          <Sparkles className="h-3.5 w-3.5" /> 6 GenZ styles · free forever
        </span>
        <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">Build your portfolio website</h1>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-slate-600">
          A real personal website — hero, project cards, testimonials, contact — published at your own link. Start from your CV and you&apos;re 90% done before you type a word.
        </p>
      </div>

      <div className="mt-8 space-y-4">
        {/* R8 · resume the in-progress portfolio */}
        {hasExisting && onContinue && (
          <button
            onClick={onContinue}
            className="flex w-full items-center gap-3 rounded-2xl border-2 border-emerald-300 bg-emerald-50/60 p-4 text-left transition-all hover:-translate-y-0.5 hover:shadow-md"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white"><Rocket className="h-5 w-5" /></span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-bold text-slate-900">Continue editing{existingName ? ` — ${existingName}` : ''}</span>
              <span className="block text-xs text-slate-500">Pick up right where you left off — everything is still here.</span>
            </span>
            <span className="shrink-0 rounded-full bg-emerald-600 px-4 py-1.5 text-xs font-bold text-white">Resume →</span>
          </button>
        )}

        {/* Start-from-CV card stays below */}
        <div className="rounded-2xl border-2 border-violet-200 bg-violet-50/40 p-5">
          <div className="flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600 text-white"><Wand2 className="h-5 w-5" /></span>
            <div>
              <h2 className="text-base font-bold text-slate-900">Start from my CV</h2>
              <p className="text-xs text-slate-500">Imports your name, bio, projects, experience and skills automatically.</p>
            </div>
          </div>

          {/* This browser's CV — works for everyone, account or not */}
          {localHasCv && (
            <button
              onClick={() => guard(() => startFromCv(localCv, localPhoto))}
              className="mt-4 flex w-full items-center gap-3 rounded-xl border-2 border-violet-300 bg-white p-3.5 text-left transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-violet-100 text-violet-700"><FileText className="h-5 w-5" /></span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-bold text-slate-800">{localCv.contact.fullName || 'Your CV'}</span>
                <span className="block truncate text-xs text-slate-500">
                  Found in this browser{localCv.contact.jobTitle ? ` · ${localCv.contact.jobTitle}` : ''} · {localCv.projects.length} projects
                </span>
              </span>
              <span className="shrink-0 rounded-full bg-violet-600 px-4 py-1.5 text-xs font-bold text-white">Use it →</span>
            </button>
          )}

          {/* Saved cloud CVs — registered users with many CVs pick one */}
          {user && cvDrafts.length > 0 && (
            <div className="mt-3 space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Or pick one of your saved CVs ({cvDrafts.length})</p>
              {cvDrafts.map((d: CloudDraft) => (
                <button
                  key={d.id}
                  onClick={() => guard(() => startFromCv(normalizeCv(d.cv), d.photoData || '', `${d.name || 'My CV'} site`))}
                  className="flex w-full items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 text-left transition-all hover:-translate-y-0.5 hover:border-violet-300 hover:shadow-sm"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500"><FileText className="h-4.5 w-4.5" /></span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-slate-800">{d.name || normalizeCv(d.cv).contact.fullName || 'My CV'}</span>
                    <span className="block truncate text-[11px] text-slate-400">
                      {normalizeCv(d.cv).contact.jobTitle || 'CV'}
                      {d.publishedUser ? ` · published at cv/${d.publishedUser}` : ''} · {new Date(d.updatedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                    </span>
                  </span>
                  <span className="shrink-0 text-xs font-semibold text-violet-600">Start →</span>
                </button>
              ))}
            </div>
          )}

          {!user && !localHasCv && (
            <div className="mt-4 rounded-xl border border-dashed border-violet-300 bg-white/70 p-4 text-center">
              <p className="text-xs leading-relaxed text-slate-600">
                No CV found in this browser yet. Build one first — it takes about ten minutes and every CV doubles as a portfolio in one tap.
              </p>
              <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                <Button size="sm" className="h-8 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 text-xs text-white" onClick={() => router.push('/build')}>
                  <PenLine className="h-3.5 w-3.5" /> Build my CV first
                </Button>
                <Button size="sm" variant="outline" className="h-8 rounded-full text-xs" onClick={onLogin}>
                  <UserRound className="h-3.5 w-3.5" /> Sign in to see saved CVs
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* ── Scratch & sample ── */}
        <div className="grid gap-3 sm:grid-cols-2">
          <button
            onClick={() => guard(startScratch)}
            className="rounded-2xl border border-slate-200 bg-white p-5 text-left transition-all hover:-translate-y-0.5 hover:border-violet-300 hover:shadow-md"
          >
            <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600"><LayoutTemplate className="h-5 w-5" /></span>
            <span className="block text-sm font-bold text-slate-800">Start from scratch</span>
            <span className="mt-1 block text-xs leading-relaxed text-slate-500">Blank canvas — type as you go. Great if your work lives outside a CV.</span>
          </button>
          <button
            onClick={() => guard(loadSample)}
            className="rounded-2xl border border-slate-200 bg-white p-5 text-left transition-all hover:-translate-y-0.5 hover:border-violet-300 hover:shadow-md"
          >
            <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-600"><Sparkles className="h-5 w-5" /></span>
            <span className="block text-sm font-bold text-slate-800">Try the sample</span>
            <span className="mt-1 block text-xs leading-relaxed text-slate-500">A finished demo portfolio you can poke at — swap in your details after.</span>
          </button>
        </div>

        <p className="pt-2 text-center text-[11px] text-slate-400">
          Everything saves in this browser automatically. Create a free account to keep drafts in the cloud. · <Link href="/" className="underline hover:text-violet-600">Back to SEEMEHERE</Link>
        </p>
      </div>

      {/* R8 · replace-in-progress confirmation */}
      <AlertDialog open={replaceOpen} onOpenChange={setReplaceOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Replace your current portfolio?</AlertDialogTitle>
            <AlertDialogDescription>
              You have a portfolio in progress{existingName ? ` — “${existingName}”` : ''}. Picking a different starting point replaces its content with the new one. Pages you already published are not affected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                pendingAction.current = null
              }}
            >
              Keep my portfolio
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-700 hover:to-indigo-700"
              onClick={() => {
                const run = pendingAction.current
                pendingAction.current = null
                run?.()
              }}
            >
              Start fresh
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

// ── main builder ─────────────────────────────────────────────────────────────

export function PortfolioBuilder() {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('content')
  const [openSection, setOpenSection] = useState<PortfolioSectionKey>('about')
  const [mobilePreview, setMobilePreview] = useState(false)
  const [loginOpen, setLoginOpen] = useState(false)
  const [exitOpen, setExitOpen] = useState(false)
  // R8 · wizard navigation + welcome-back flow
  const [startOverOpen, setStartOverOpen] = useState(false)
  const [resumeOpen, setResumeOpen] = useState(false)
  const resumeAsked = useRef(false)

  const hydrated = usePortfolioStore((s) => s.hydrated)
  const started = usePortfolioStore((s) => s.started)
  const name = usePortfolioStore((s) => s.name)
  const cv = usePortfolioStore((s) => s.cv)
  const portfolio = usePortfolioStore((s) => s.portfolio)
  const photoData = usePortfolioStore((s) => s.photoData)
  const publishInfo = usePortfolioStore((s) => s.publishInfo)
  const patchSections = usePortfolioStore((s) => s.patchSections)
  const moveSection = usePortfolioStore((s) => s.moveSection)
  const resetAll = usePortfolioStore((s) => s.resetAll)
  const unstart = usePortfolioStore((s) => s.unstart)
  const resume = usePortfolioStore((s) => s.resume)

  const user = useAuthStore((s) => s.user)
  const profiles = useAuthStore((s) => s.profiles)
  const cloudSaveState = useAuthStore((s) => s.cloudSaveState)
  const fetchMe = useAuthStore((s) => s.fetchMe)
  const saveActiveDraft = useAuthStore((s) => s.saveActiveDraft)
  const logout = useAuthStore((s) => s.logout)

  useEffect(() => {
    void fetchMe()
  }, [fetchMe])

  const hasContent = cv.contact.fullName.trim().length > 0

  // R8 · does the draft hold real work? Used by the welcome-back prompt and
  // the start screen's Continue card (name alone is not enough for scratch
  // users who only typed projects/testimonials so far).
  const hasWork =
    hasContent ||
    portfolio.tagline.trim().length > 0 ||
    portfolio.about.trim().length > 0 ||
    portfolio.projects.some((p) => p.title.trim()) ||
    portfolio.testimonials.some((t) => t.quote.trim()) ||
    portfolio.gallery.some((g) => g.image)

  // R8 · welcome back — after hydration, if the user returns to a portfolio
  // in progress, ask: continue editing or start over. Runs once per page load.
  useEffect(() => {
    if (!hydrated || resumeAsked.current) return
    const t = setTimeout(() => {
      resumeAsked.current = true
      const st = usePortfolioStore.getState()
      const rich =
        st.cv.contact.fullName.trim().length > 0 ||
        st.portfolio.tagline.trim().length > 0 ||
        st.portfolio.about.trim().length > 0 ||
        st.portfolio.projects.some((p) => p.title.trim()) ||
        st.portfolio.testimonials.some((t2) => t2.quote.trim()) ||
        st.portfolio.gallery.some((g) => g.image)
      if (st.started && rich) setResumeOpen(true)
    }, 700)
    return () => clearTimeout(t)
  }, [hydrated])

  // R8 · tab switching with a scroll reset so each step opens at the top
  const switchTab = (t: Tab) => {
    setTab(t)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Cloud autosave (debounced) — kind "portfolio"
  useEffect(() => {
    if (!user || !hydrated || !started || (!hasContent && portfolio.projects.length === 0)) return
    const t = setTimeout(() => {
      void saveActiveDraft({
        id: usePortfolioStore.getState().activeDraftId,
        name: name || 'My portfolio',
        kind: 'portfolio',
        templateId: portfolio.layout,
        theme: { ...DEFAULT_PALETTE.theme, accent: portfolio.accent },
        cv,
        photoData,
        portfolio,
        publishedUser: publishInfo?.username || '',
      }).then((id) => {
        if (id) usePortfolioStore.getState().setActiveDraft(id)
      })
    }, 1800)
    return () => clearTimeout(t)
  }, [user, hydrated, started, hasContent, cv, portfolio, photoData, publishInfo, name, saveActiveDraft])

  const requestExit = () => {
    if (user) router.push('/')
    else setExitOpen(true)
  }

  const goHome = useCallback(() => {
    if (user || !started) router.push('/')
    else setExitOpen(true)
  }, [user, started, router])

  const saveChip = !user ? (
    <div className="hidden items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] text-slate-500 sm:flex">
      <CloudCheck className="h-3.5 w-3.5 text-emerald-500" /> Saved in this browser
    </div>
  ) : cloudSaveState === 'saving' ? (
    <div className="hidden items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] text-slate-500 sm:flex">
      <CloudUpload className="h-3.5 w-3.5 animate-pulse" /> Saving…
    </div>
  ) : cloudSaveState === 'error' ? (
    <div className="hidden items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] text-amber-700 sm:flex">
      <CloudOff className="h-3.5 w-3.5" /> Offline — saved in browser
    </div>
  ) : (
    <div className="hidden items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] text-emerald-700 sm:flex">
      <CloudCheck className="h-3.5 w-3.5" /> Saved to your account
    </div>
  )

  const portfolioDrafts = profiles.filter((p) => (p.kind || 'cv') === 'portfolio')

  if (!hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <div className="text-sm text-slate-400">Loading your portfolio workspace…</div>
      </div>
    )
  }

  if (!started) {
    return (
      <div className="min-h-screen bg-slate-100">
        <PortfolioTopBar onHome={goHome} saveChip={null} user={user} onLogin={() => setLoginOpen(true)} onLogout={logout} portfolioDrafts={[]} onOpenDraft={undefined} onNew={undefined} />
        <StartScreen
          onLogin={() => setLoginOpen(true)}
          hasExisting={hasWork}
          existingName={name && name !== 'My portfolio' ? name : cv.contact.fullName || undefined}
          onContinue={resume}
        />
        <LoginModal open={loginOpen} onOpenChange={setLoginOpen} redirectTo="/portfolio" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-100">
      <PortfolioTopBar
        onHome={goHome}
        saveChip={saveChip}
        user={user}
        onLogin={() => setLoginOpen(true)}
        onLogout={logout}
        portfolioDrafts={portfolioDrafts}
        onOpenDraft={(d) => usePortfolioStore.getState().hydrateDraft({ id: d.id, name: d.name, cv: d.cv, portfolio: d.portfolio, photoData: d.photoData })}
        onNew={() => {
          resetAll()
          useAuthStore.getState().setActiveProfileId(null)
        }}
      />

      {/* Tab nav — numbered steps so the order is obvious (R8) */}
      <div className="sticky top-[57px] z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-2 px-4 py-2">
          {(
            [
              { id: 'content', n: 1, label: 'Content', icon: PenLine },
              { id: 'design', n: 2, label: 'Design', icon: LayoutTemplate },
              { id: 'publish', n: 3, label: 'Publish', icon: Rocket },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              onClick={() => switchTab(t.id)}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                tab === t.id ? 'border-violet-600 bg-violet-600 text-white' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span className={`flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-black ${tab === t.id ? 'bg-white/25 text-white' : 'bg-slate-100 text-slate-500'}`}>
                {t.n}
              </span>
              <t.icon className="h-3.5 w-3.5" /> {t.label}
            </button>
          ))}
          {publishInfo && (
            <a
              href={`/cv/${publishInfo.username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-auto hidden items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 sm:inline-flex"
            >
              <Globe className="h-3.5 w-3.5" /> cv/{publishInfo.username} — live
            </a>
          )}
        </div>
      </div>

      {/* Main */}
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-5">
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_480px]">
          {/* Left: tabs */}
          <section>
            {tab === 'content' && (
              <div className="space-y-3">
                {/* Sections list */}
                <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
                  <p className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">Website sections — drag-free reorder, eye to hide</p>
                  <div className="grid gap-1 sm:grid-cols-2">
                    {PORTFOLIO_SECTION_ORDER.map((key, i) => {
                      const visible = portfolio.sections[key]
                      const active = openSection === key
                      return (
                        <div
                          key={key}
                          className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 transition-colors ${
                            active ? 'border-violet-400 bg-violet-50' : 'border-slate-200 bg-white hover:bg-slate-50'
                          }`}
                        >
                          <button onClick={() => setOpenSection(key)} className="flex min-w-0 flex-1 items-center gap-2 text-left">
                            <span className={`truncate text-xs font-semibold ${visible ? 'text-slate-700' : 'text-slate-400 line-through'}`}>
                              {SECTION_META[key].label}
                            </span>
                          </button>
                          <button
                            title={visible ? 'Hide section' : 'Show section'}
                            onClick={() => patchSections({ [key]: !visible } as never)}
                            className={`shrink-0 rounded p-0.5 ${visible ? 'text-slate-400 hover:text-violet-600' : 'text-slate-300 hover:text-violet-500'}`}
                          >
                            {visible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                          </button>
                          <button title="Move up" disabled={i === 0} onClick={() => moveSection(key, -1)} className="shrink-0 rounded p-0.5 text-slate-300 hover:text-violet-600 disabled:opacity-30">
                            <ChevronUp className="h-3.5 w-3.5" />
                          </button>
                          <button title="Move down" disabled={i === PORTFOLIO_SECTION_ORDER.length - 1} onClick={() => moveSection(key, 1)} className="shrink-0 rounded p-0.5 text-slate-300 hover:text-violet-600 disabled:opacity-30">
                            <ChevronDown className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Active section editor */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <h2 className="text-base font-bold text-slate-900">{SECTION_META[openSection].label}</h2>
                  <p className="mb-4 text-xs text-slate-500">{SECTION_META[openSection].hint}</p>
                  <ContentPanel section={openSection} />
                </div>
              </div>
            )}

            {tab === 'design' && (
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="mb-4 text-base font-bold text-slate-900">Design</h2>
                <DesignPanel />
              </div>
            )}

            {tab === 'publish' && (
              <div className="space-y-4">
                <PublishPanel />
              </div>
            )}

            {/* R8 · wizard navigation — explicit Back / Next on every step,
                so nobody has to guess that the tabs above are the way forward */}
            <div className="mt-5 flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
              {tab === 'content' ? (
                <button
                  onClick={() => setStartOverOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-3.5 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50"
                >
                  <RotateCcw className="h-3.5 w-3.5" /> Start over
                </button>
              ) : (
                <button
                  onClick={() => switchTab(tab === 'design' ? 'content' : 'design')}
                  className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-3.5 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50"
                >
                  <ChevronLeft className="h-3.5 w-3.5" /> Back
                </button>
              )}
              <span className="hidden text-[11px] font-medium text-slate-400 sm:block">
                Step {tab === 'content' ? 1 : tab === 'design' ? 2 : 3} of 3
              </span>
              {tab !== 'publish' ? (
                <Button
                  onClick={() => switchTab(tab === 'content' ? 'design' : 'publish')}
                  className="h-8 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 text-xs text-white hover:from-violet-700 hover:to-indigo-700"
                >
                  Next: {tab === 'content' ? 'Design' : 'Publish'} <ArrowRight className="ml-1 h-3.5 w-3.5" />
                </Button>
              ) : (
                <span className="text-[11px] font-semibold text-emerald-600">Final step — publish below 🎉</span>
              )}
            </div>
          </section>

          {/* Right: live preview (desktop) */}
          <aside className="hidden lg:block">
            <div className="sticky top-[110px] h-[calc(100vh-130px)]">
              <PreviewFrame />
            </div>
          </aside>
        </div>
      </main>

      {/* Mobile preview toggle */}
      <button
        onClick={() => setMobilePreview((v) => !v)}
        className="fixed bottom-4 right-4 z-40 flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-lg lg:hidden"
      >
        {mobilePreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        {mobilePreview ? 'Hide preview' : 'Preview'}
      </button>
      {mobilePreview && (
        <div className="fixed inset-0 z-50 p-3 lg:hidden">
          <PreviewFrame mobileOverlay onClose={() => setMobilePreview(false)} />
        </div>
      )}

      {/* Exit dialog (not signed in) */}
      <AlertDialog open={exitOpen} onOpenChange={setExitOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Leave the portfolio builder?</AlertDialogTitle>
            <AlertDialogDescription>
              Your site is autosaved in this browser — but a browser wipe loses it. A free account (username + password) keeps it in the cloud forever.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col gap-2 sm:flex-col">
            <AlertDialogAction
              className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-700 hover:to-indigo-700"
              onClick={() => {
                setExitOpen(false)
                setLoginOpen(true)
              }}
            >
              Create free account &amp; save
            </AlertDialogAction>
            <div className="flex w-full gap-2">
              <AlertDialogCancel className="flex-1">Keep building</AlertDialogCancel>
              <AlertDialogAction className="flex-1 border border-slate-200 bg-white text-slate-600 hover:bg-slate-50" onClick={() => router.push('/')}>
                Leave anyway
              </AlertDialogAction>
            </div>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* R8 · Start over → back to the starting-point screen (content kept
          until the user actively picks a different start; the start screen
          shows a Continue card so this is always reversible) */}
      <AlertDialog open={startOverOpen} onOpenChange={setStartOverOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Go back to the starting options?</AlertDialogTitle>
            <AlertDialogDescription>
              You&apos;ll see the three starting points again (your CV, scratch, sample). Nothing is deleted — your current portfolio stays saved, and the next screen has a &ldquo;Continue editing&rdquo; button to come right back.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep building</AlertDialogCancel>
            <AlertDialogAction
              className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-700 hover:to-indigo-700"
              onClick={() => {
                setStartOverOpen(false)
                unstart()
                window.scrollTo({ top: 0 })
              }}
            >
              Show starting options
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* R8 · Welcome back — returning to a portfolio in progress */}
      <AlertDialog open={resumeOpen} onOpenChange={setResumeOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Welcome back!</AlertDialogTitle>
            <AlertDialogDescription>
              You have a portfolio in progress{name && name !== 'My portfolio' ? ` — “${name}”` : ''} saved {user ? 'to your account' : 'in this browser'}. Continue editing it, or start something new.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col gap-2 sm:flex-col">
            <AlertDialogAction
              className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-700 hover:to-indigo-700"
              onClick={() => setResumeOpen(false)}
            >
              Continue editing
            </AlertDialogAction>
            <AlertDialogCancel
              className="w-full border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              onClick={() => {
                setResumeOpen(false)
                unstart()
              }}
            >
              Start over with a different starting point
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <LoginModal open={loginOpen} onOpenChange={setLoginOpen} redirectTo="/portfolio" />
    </div>
  )
}

function PortfolioTopBar({
  onHome, saveChip, user, onLogin, onLogout, portfolioDrafts, onOpenDraft, onNew,
}: {
  onHome: () => void
  saveChip: React.ReactNode | null
  user: { username: string } | null
  onLogin: () => void
  onLogout: () => Promise<void>
  portfolioDrafts: CloudDraft[]
  onOpenDraft?: (d: CloudDraft) => void
  onNew?: () => void
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-2.5 px-4 py-2">
        <button onClick={onHome} className="flex items-center gap-2 text-left" aria-label="Back to SEEMEHERE home">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 text-[13px] font-black text-white">S</span>
          <span className="hidden text-sm font-extrabold tracking-tight text-slate-800 sm:block">SEEMEHERE</span>
          <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-bold text-violet-700">Portfolio</span>
        </button>

        {saveChip}

        <div className="flex-1" />

        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white py-1 pl-1 pr-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 text-[10px] font-black text-white">
                  {user.username.slice(0, 1).toUpperCase()}
                </span>
                <span className="hidden max-w-28 truncate sm:inline">{user.username}</span>
                <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-60">
              <DropdownMenuLabel className="text-[11px] text-slate-400">My portfolios</DropdownMenuLabel>
              {portfolioDrafts.length === 0 && <div className="px-2 py-1.5 text-xs text-slate-400">Nothing saved yet</div>}
              {portfolioDrafts.map((p) => (
                <DropdownMenuItem key={p.id} onClick={() => onOpenDraft?.(p)} className="gap-2 text-xs">
                  <span className="flex-1 truncate">{p.name || 'My portfolio'}</span>
                  {p.publishedUser && <span className="text-[10px] text-slate-400">cv/{p.publishedUser}</span>}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              {onNew && (
                <DropdownMenuItem className="gap-2 text-xs" onClick={onNew}>
                  <Plus className="h-3.5 w-3.5 text-violet-500" /> New portfolio
                </DropdownMenuItem>
              )}
              <DropdownMenuItem className="gap-2 text-xs" onClick={() => void onLogout()}>
                <LogOut className="h-3.5 w-3.5 text-slate-400" /> Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button variant="outline" size="sm" className="h-8 gap-1.5 rounded-full text-xs" onClick={onLogin}>
            <UserRound className="h-3.5 w-3.5" /> Sign in
          </Button>
        )}

        <button onClick={onHome} title="Save & exit" className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-400 hover:bg-slate-50 hover:text-slate-700">
          <X className="h-4 w-4" />
        </button>
      </div>
    </header>
  )
}
