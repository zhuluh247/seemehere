'use client'

import { useMemo, useState } from 'react'
import { useCvStore } from '@/lib/cv/store'
import { AiRunButton } from './fields'
import { Progress } from '@/components/ui/progress'
import { CheckCircle2, Circle, Gauge, ShieldCheck } from 'lucide-react'

interface ScoreResult {
  score: number
  strengths: string[]
  improvements: string[]
}

export function ReviewStep() {
  const cv = useCvStore((s) => s.cv)
  const photoData = useCvStore((s) => s.photoData)
  const showPhoto = useCvStore((s) => s.design.showPhoto)
  const [aiScore, setAiScore] = useState<ScoreResult | null>(null)

  const checks = useMemo(() => {
    const bulletsWithNumbers = cv.experience.flatMap((e) => e.bullets).filter((b) => /\d/.test(b)).length
    const weakOpeners = cv.experience.flatMap((e) => e.bullets).filter((b) => /^(worked|helped|responsible for|duties)/i.test(b.trim())).length
    return [
      { ok: !!(cv.contact.fullName && cv.contact.email && cv.contact.phone), label: 'Name, email and phone filled in' },
      { ok: !!cv.contact.location, label: 'Location added (recruiters filter by it)' },
      { ok: photoData !== '' || !showPhoto, label: showPhoto ? 'Profile photo uploaded (or hide it in step 1)' : 'Photo is switched off — fine' },
      { ok: cv.summary.trim().split(/\s+/).length >= 25, label: 'Summary is 25+ words' },
      { ok: cv.experience.length >= 1 && cv.experience.every((e) => e.role && e.company), label: 'Every role has a title and company' },
      { ok: bulletsWithNumbers >= 2, label: 'At least 2 achievements contain numbers' },
      { ok: weakOpeners === 0 && cv.experience.length > 0, label: 'No weak openers ("Worked at…", "Responsible for…")' },
      { ok: cv.education.length >= 1, label: 'Education added' },
      { ok: cv.skills.length >= 5, label: '5 or more skills listed' },
      { ok: cv.experience.every((e) => e.startDate), label: 'All roles have start dates' },
    ]
  }, [cv, photoData, showPhoto])

  const done = checks.filter((c) => c.ok).length
  const pct = Math.round((done / checks.length) * 100)

  const atsBasics = [
    { ok: !!(cv.contact.email && cv.contact.phone), label: 'Contact details are machine-readable' },
    { ok: cv.experience.length > 0, label: 'Has work experience section' },
    { ok: cv.skills.length >= 3, label: 'Skills section present' },
  ]

  return (
    <div className="space-y-6">
      {/* Completeness */}
      <div className="rounded-xl border border-slate-200 p-4">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-sm font-semibold text-slate-800">Completeness</h3>
          <span className="text-xs font-semibold text-slate-500">{done}/{checks.length}</span>
        </div>
        <Progress value={pct} className="h-2 mb-3" />
        <ul className="space-y-1.5">
          {checks.map((c, i) => (
            <li key={i} className="flex items-start gap-2 text-xs">
              {c.ok ? <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" /> : <Circle className="h-4 w-4 text-slate-300 shrink-0" />}
              <span className={c.ok ? 'text-slate-500' : 'text-slate-700'}>{c.label}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Light ATS formatting check (no AI needed) */}
      <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4">
        <h3 className="text-sm font-semibold text-emerald-900 flex items-center gap-1.5 mb-2">
          <ShieldCheck className="h-4 w-4" /> ATS format check
        </h3>
        <ul className="space-y-1.5">
          {atsBasics.map((c, i) => (
            <li key={i} className="flex items-start gap-2 text-xs">
              {c.ok ? <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" /> : <Circle className="h-4 w-4 text-emerald-300 shrink-0" />}
              <span className="text-emerald-900/80">{c.label}</span>
            </li>
          ))}
          <li className="flex items-start gap-2 text-xs">
            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
            <span className="text-emerald-900/80">All SEEMEHERE templates export text-selectable, ATS-parseable PDFs</span>
          </li>
        </ul>
      </div>

      {/* AI review */}
      <div className="rounded-xl border border-violet-200 bg-violet-50/40 p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
            <Gauge className="h-4 w-4 text-violet-500" /> AI review
          </h3>
          <AiRunButton
            task="score"
            label="Score my CV"
            payload={{ cv }}
            onDone={(r) => setAiScore(r as ScoreResult)}
          />
        </div>
        {!aiScore ? (
          <p className="text-xs text-slate-500">Get an honest 0–100 score with concrete fixes from an AI reviewer.</p>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="text-3xl font-extrabold text-violet-700 tabular-nums">{aiScore.score}</div>
              <div className="text-xs text-slate-500">/ 100 {aiScore.score >= 85 ? '— excellent!' : aiScore.score >= 71 ? '— good, polish and go' : aiScore.score >= 56 ? '— okay, some work to do' : '— needs attention'}</div>
            </div>
            <Progress value={aiScore.score} className="h-2" />
            {aiScore.strengths.length > 0 && (
              <div>
                <div className="text-xs font-semibold text-emerald-700 mb-1">Strengths</div>
                <ul className="space-y-1">{aiScore.strengths.map((s, i) => <li key={i} className="text-xs text-slate-600">• {s}</li>)}</ul>
              </div>
            )}
            {aiScore.improvements.length > 0 && (
              <div>
                <div className="text-xs font-semibold text-amber-700 mb-1">Fix these next</div>
                <ul className="space-y-1">{aiScore.improvements.map((s, i) => <li key={i} className="text-xs text-slate-600">• {s}</li>)}</ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
