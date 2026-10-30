'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCvStore, STEP_ORDER, STEP_META, type BuilderStep } from '@/lib/cv/store'
import { useAuthStore } from '@/lib/cv/auth-store'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { ChevronLeft, ChevronRight, Eye, EyeOff, CloudCheck, CloudOff, CloudUpload, X, UserRound, Plus, LogOut, ChevronDown } from 'lucide-react'
import { PreviewPane, HiddenRenderer } from './PreviewPane'
import { TemplateStep } from './steps/TemplateStep'
import { ContactStep } from './steps/ContactStep'
import { ExperienceStep, EducationStep } from './steps/ExperienceStep'
import { SkillsStep } from './steps/SkillsStep'
import { SummaryStep } from './steps/SummaryStep'
import { ExtrasStep } from './steps/ExtrasStep'
import { SectionsStep } from './steps/SectionsStep'
import { ReviewStep } from './steps/ReviewStep'
import { JobMatchStep } from './steps/JobMatchStep'
import { ExportStep } from './steps/ExportStep'
import { LoginModal } from '@/components/auth/LoginModal'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function Builder() {
  const router = useRouter()
  const [step, setStep] = useState<BuilderStep>('template')
  const [mobilePreview, setMobilePreview] = useState(false)
  const [loginOpen, setLoginOpen] = useState(false)
  const [exitOpen, setExitOpen] = useState(false)
  // R8 · welcome-back prompt — shown once per page load when a CV is in progress
  const [resumeOpen, setResumeOpen] = useState(false)
  const resumeAsked = useRef(false)
  const hydrated = useCvStore((s) => s.hydrated)
  const cv = useCvStore((s) => s.cv)
  const design = useCvStore((s) => s.design)
  const photoData = useCvStore((s) => s.photoData)
  const portfolio = useCvStore((s) => s.portfolio)
  const publishInfo = useCvStore((s) => s.publishInfo)
  const hydrateFromCloud = useCvStore((s) => s.hydrateFromCloud)
  const resetAll = useCvStore((s) => s.resetAll)

  const user = useAuthStore((s) => s.user)
  const profiles = useAuthStore((s) => s.profiles)
  const activeProfileId = useAuthStore((s) => s.activeProfileId)
  const cloudSaveState = useAuthStore((s) => s.cloudSaveState)
  const fetchMe = useAuthStore((s) => s.fetchMe)
  const saveActiveDraft = useAuthStore((s) => s.saveActiveDraft)
  const logout = useAuthStore((s) => s.logout)

  const idx = STEP_ORDER.indexOf(step)
  const meta = STEP_META[step]
  const pct = Math.round(((idx + 1) / STEP_ORDER.length) * 100)
  const hasContent = cv.contact.fullName.trim().length > 0

  const go = (dir: -1 | 1) => {
    const next = STEP_ORDER[idx + dir]
    if (next) {
      setStep(next)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  // Auth session check on mount
  useEffect(() => {
    void fetchMe()
  }, [fetchMe])

  // R8 · welcome back — a moment after hydration (so signed-in users' cloud
  // bootstrap has had a chance to fill the editor), if the CV holds real work,
  // ask: continue editing or start a new one. Runs once per page load.
  useEffect(() => {
    if (!hydrated || resumeAsked.current) return
    const t = setTimeout(() => {
      resumeAsked.current = true
      const c = useCvStore.getState().cv
      const rich = !!(
        c.contact.fullName.trim() ||
        c.summary.trim() ||
        c.experience.length > 0 ||
        c.education.length > 0 ||
        c.projects.length > 0 ||
        c.skills.length > 0
      )
      if (rich) setResumeOpen(true)
    }, 700)
    return () => clearTimeout(t)
  }, [hydrated])

  // If signed in with cloud profiles but this browser has an empty CV → open most recent profile
  const bootstrapDone = useRef(false)
  useEffect(() => {
    if (!user || !hydrated || bootstrapDone.current) return
    if (profiles.length === 0) return
    bootstrapDone.current = true
    if (!cv.contact.fullName.trim() && !activeProfileId) {
      hydrateFromCloud(profiles[0])
    }
  }, [user, hydrated, profiles, activeProfileId, cv.contact.fullName, hydrateFromCloud])

  // Cloud autosave (debounced) — only when signed in (kind: "cv")
  useEffect(() => {
    if (!user || !hydrated || !hasContent) return
    const t = setTimeout(() => {
      void saveActiveDraft({
        id: activeProfileId,
        name: cv.contact.fullName || 'My CV',
        kind: 'cv',
        templateId: design.templateId,
        theme: design.theme,
        cv,
        photoData,
        portfolio,
        publishedUser: publishInfo?.username || '',
      })
    }, 1800)
    return () => clearTimeout(t)
  }, [user, hydrated, hasContent, cv, design, photoData, portfolio, publishInfo, activeProfileId, saveActiveDraft])

  const requestExit = () => {
    if (user) router.push('/') // cloud autosave is on — safe to leave
    else setExitOpen(true)
  }

  const stepBody = {
    template: <TemplateStep />,
    contact: <ContactStep />,
    experience: <ExperienceStep />,
    education: <EducationStep />,
    skills: <SkillsStep />,
    summary: <SummaryStep />,
    extras: <ExtrasStep />,
    sections: <SectionsStep />,
    review: <ReviewStep />,
    jobmatch: <JobMatchStep />,
    export: <ExportStep />,
  }[step]

  const saveChip = !user ? (
    <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-slate-500 bg-slate-50 border border-slate-200 rounded-full px-2.5 py-1">
      <CloudCheck className="h-3.5 w-3.5 text-emerald-500" /> Saved in this browser
    </div>
  ) : cloudSaveState === 'saving' ? (
    <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-slate-500 bg-slate-50 border border-slate-200 rounded-full px-2.5 py-1">
      <CloudUpload className="h-3.5 w-3.5 animate-pulse" /> Saving…
    </div>
  ) : cloudSaveState === 'error' ? (
    <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-2.5 py-1">
      <CloudOff className="h-3.5 w-3.5" /> Offline — saved in browser
    </div>
  ) : (
    <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2.5 py-1">
      <CloudCheck className="h-3.5 w-3.5" /> Saved to your account
    </div>
  )

  return (
    <div className="min-h-screen flex flex-col bg-slate-100">
      {/* ── Top bar ── */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-2.5 px-4 py-2">
          <button onClick={requestExit} className="flex items-center gap-2 text-left" aria-label="Back to SEEMEHERE home">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 text-[13px] font-black text-white">S</span>
            <span className="hidden sm:block text-sm font-extrabold tracking-tight text-slate-800">SEEMEHERE</span>
          </button>

          {saveChip}

          <div className="flex-1" />

          {/* Profile / auth */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white py-1 pl-1 pr-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 text-[10px] font-black text-white">
                    {user.username.slice(0, 1).toUpperCase()}
                  </span>
                  <span className="hidden sm:inline max-w-28 truncate">{user.username}</span>
                  <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-60">
                <DropdownMenuLabel className="text-[11px] text-slate-400">My CV profiles</DropdownMenuLabel>
                {profiles.filter((p) => (p.kind || 'cv') !== 'portfolio').length === 0 && <div className="px-2 py-1.5 text-xs text-slate-400">Nothing saved yet</div>}
                {profiles.filter((p) => (p.kind || 'cv') !== 'portfolio').map((p) => (
                  <DropdownMenuItem key={p.id} onClick={() => hydrateFromCloud(p)} className="gap-2 text-xs">
                    <span className="flex-1 truncate">{p.name || 'My CV'}</span>
                    {p.id === activeProfileId && <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="gap-2 text-xs"
                  onClick={() => {
                    resetAll()
                    useAuthStore.getState().setActiveProfileId(null)
                    setStep('template')
                  }}
                >
                  <Plus className="h-3.5 w-3.5 text-violet-500" /> New CV profile
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2 text-xs" onClick={() => void logout()}>
                  <LogOut className="h-3.5 w-3.5 text-slate-400" /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="outline" size="sm" className="h-8 gap-1.5 rounded-full text-xs" onClick={() => setLoginOpen(true)}>
              <UserRound className="h-3.5 w-3.5" /> Sign in
            </Button>
          )}

          {/* Exit */}
          <button
            onClick={requestExit}
            title="Save & exit"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-400 hover:bg-slate-50 hover:text-slate-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* ── Step nav — top on every screen size ── */}
        <div className="border-t border-slate-100 bg-white/95">
          <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-2">
            <Button variant="outline" size="sm" onClick={() => go(-1)} disabled={idx === 0} className="h-8 gap-1 shrink-0">
              <ChevronLeft className="h-4 w-4" /> Back
            </Button>
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <Progress value={pct} className="h-1.5" />
              <span className="hidden sm:block shrink-0 text-[11px] font-semibold text-slate-500 tabular-nums">
                {meta.title.split(' &')[0]} · {idx + 1}/{STEP_ORDER.length}
              </span>
            </div>
            {idx < STEP_ORDER.length - 1 ? (
              <Button size="sm" onClick={() => go(1)} className="h-8 shrink-0 gap-1 bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-700 hover:to-indigo-700">
                Next <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <span className="hidden sm:block text-[11px] font-medium text-emerald-600">Finish line 🎉</span>
            )}
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-5">
        {!hydrated ? (
          <div className="flex h-64 items-center justify-center text-sm text-slate-400">Loading your workspace…</div>
        ) : (
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_460px]">
            {/* Left: step content */}
            <section>
              {/* Step chips */}
              <div className="mb-3 flex gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {STEP_ORDER.map((s, i) => (
                  <button
                    key={s}
                    onClick={() => setStep(s)}
                    className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors ${
                      s === step ? 'border-violet-600 bg-violet-600 text-white' : i < idx ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-white text-slate-500'
                    }`}
                  >
                    {i + 1}. {STEP_META[s].title.split(' &')[0].split(' —')[0]}
                  </button>
                ))}
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
                <div className="mb-5">
                  <h2 className="text-lg font-bold text-slate-900">{meta.title}</h2>
                  <p className="text-xs text-slate-500">{meta.hint}</p>
                </div>
                {stepBody}
              </div>
            </section>

            {/* Right: live preview (desktop) */}
            <aside className="hidden lg:block">
              <div className="sticky top-[124px] max-h-[calc(100vh-140px)]">
                <PreviewPane />
              </div>
            </aside>
          </div>
        )}
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
          <PreviewPane mobileOverlay onClose={() => setMobilePreview(false)} />
        </div>
      )}

      {/* Hidden full-size render for export/print */}
      <HiddenRenderer />

      {/* Exit dialog (not signed in) */}
      <AlertDialog open={exitOpen} onOpenChange={setExitOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Leave the builder?</AlertDialogTitle>
            <AlertDialogDescription>
              Your CV is autosaved in this browser — but a browser wipe loses it. Create a free account (username + password) and it&apos;s saved to the cloud forever.
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
              <AlertDialogAction
                className="flex-1 border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                onClick={() => router.push('/')}
              >
                Leave anyway
              </AlertDialogAction>
            </div>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* R8 · Welcome back — returning to a CV in progress */}
      <AlertDialog open={resumeOpen} onOpenChange={setResumeOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Welcome back!</AlertDialogTitle>
            <AlertDialogDescription>
              You have a CV in progress{cv.contact.fullName.trim() ? ` — “${cv.contact.fullName.trim()}”` : ''} saved {user ? 'to your account' : 'in this browser'}. Continue editing it, or start a new one
              {user ? ' — your saved profiles stay untouched and you can switch back anytime from the menu.' : '. Starting fresh clears the copy in this browser — export a PDF first if you want to keep it.'}
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
                resetAll()
                useAuthStore.getState().setActiveProfileId(null)
                setStep('template')
              }}
            >
              Start a new CV
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Login / signup modal */}
      <LoginModal
        open={loginOpen}
        onOpenChange={setLoginOpen}
        initialTab="signup"
        redirectTo="/build"
        draftPayload={
          hasContent
            ? {
                name: cv.contact.fullName || 'My CV',
                templateId: design.templateId,
                theme: design.theme,
                cv,
                photoData,
                portfolio,
                publishedUser: publishInfo?.username || '',
              }
            : undefined
        }
      />
    </div>
  )
}
