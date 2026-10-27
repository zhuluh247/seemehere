'use client'

import { useState } from 'react'
import { useCvStore, STEP_ORDER, STEP_META, type BuilderStep } from '@/lib/cv/store'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { ChevronLeft, ChevronRight, Eye, EyeOff, CloudCheck } from 'lucide-react'
import { PreviewPane, HiddenRenderer } from './PreviewPane'
import { TemplateStep } from './steps/TemplateStep'
import { ContactStep } from './steps/ContactStep'
import { ExperienceStep, EducationStep } from './steps/ExperienceStep'
import { SkillsStep } from './steps/SkillsStep'
import { SummaryStep } from './steps/SummaryStep'
import { ExtrasStep } from './steps/ExtrasStep'
import { ReviewStep } from './steps/ReviewStep'
import { JobMatchStep } from './steps/JobMatchStep'
import { ExportStep } from './steps/ExportStep'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

export function Builder({ onExit }: { onExit: () => void }) {
  const [step, setStep] = useState<BuilderStep>('template')
  const [mobilePreview, setMobilePreview] = useState(false)
  const hydrated = useCvStore((s) => s.hydrated)

  const idx = STEP_ORDER.indexOf(step)
  const meta = STEP_META[step]
  const pct = Math.round(((idx + 1) / STEP_ORDER.length) * 100)

  const go = (dir: -1 | 1) => {
    const next = STEP_ORDER[idx + dir]
    if (next) setStep(next)
  }

  const stepBody = {
    template: <TemplateStep />,
    contact: <ContactStep />,
    experience: <ExperienceStep />,
    education: <EducationStep />,
    skills: <SkillsStep />,
    summary: <SummaryStep />,
    extras: <ExtrasStep />,
    review: <ReviewStep />,
    jobmatch: <JobMatchStep />,
    export: <ExportStep />,
  }[step]

  return (
    <div className="min-h-screen flex flex-col bg-slate-100">
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-2.5">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button className="flex items-center gap-2 text-left">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 text-[13px] font-black text-white">S</span>
                <span className="hidden sm:block text-sm font-extrabold tracking-tight text-slate-800">SEEMEHERE</span>
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Leave the builder?</AlertDialogTitle>
                <AlertDialogDescription>Your CV is saved in this browser and will be here when you return.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Keep building</AlertDialogCancel>
                <AlertDialogAction onClick={onExit}>Leave</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <div className="hidden md:flex items-center gap-1.5 text-[11px] text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-full px-2.5 py-1">
            <CloudCheck className="h-3.5 w-3.5" /> Saved in this browser
          </div>

          <div className="flex-1" />

          <div className="hidden sm:block w-40">
            <Progress value={pct} className="h-1.5" />
          </div>
          <span className="text-[11px] font-medium text-slate-500 tabular-nums">{idx + 1}/{STEP_ORDER.length}</span>
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

              {/* Nav */}
              <div className="mt-4 flex items-center justify-between">
                <Button variant="outline" onClick={() => go(-1)} disabled={idx === 0} className="gap-1">
                  <ChevronLeft className="h-4 w-4" /> Back
                </Button>
                {idx < STEP_ORDER.length - 1 ? (
                  <Button onClick={() => go(1)} className="gap-1 bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-700 hover:to-indigo-700">
                    Next: {STEP_META[STEP_ORDER[idx + 1]].title.split(' &')[0]} <ChevronRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <span className="text-xs font-medium text-emerald-600">You reached the finish line 🎉</span>
                )}
              </div>
            </section>

            {/* Right: live preview (desktop) */}
            <aside className="hidden lg:block">
              <div className="sticky top-[68px] max-h-[calc(100vh-84px)]">
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
    </div>
  )
}
