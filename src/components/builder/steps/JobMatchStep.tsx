'use client'

import { useState } from 'react'
import { useCvStore } from '@/lib/cv/store'
import { AiRunButton } from './fields'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Crosshair, Check, AlertTriangle } from 'lucide-react'

interface MatchResult {
  score: number
  matched: string[]
  missing: string[]
  tips: string[]
}

export function JobMatchStep() {
  const cv = useCvStore((s) => s.cv)
  const [jobText, setJobText] = useState('')
  const [result, setResult] = useState<MatchResult | null>(null)

  return (
    <div className="space-y-5">
      <div className="rounded-xl bg-slate-50 border border-slate-200 p-3.5 text-xs text-slate-600 leading-relaxed">
        <b className="text-slate-800">How it works:</b> paste the job ad you are targeting. SEEMEHERE compares it against your CV, shows a match score, the keywords you already cover, and — most usefully — <b>the keywords you are missing</b>. We never invent experience; we just show you where your real story aligns.
      </div>

      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-slate-600">Job description ({jobText.length}/15,000)</span>
        <AiRunButton
          task="ats-match"
          label="Analyze match"
          payload={{ cv, jobText }}
          onDone={(r) => setResult(r as MatchResult)}
        />
      </div>
      <Textarea
        value={jobText}
        onChange={(e) => setJobText(e.target.value.slice(0, 15000))}
        rows={8}
        placeholder={"Paste the full job ad here…\n\nResponsibilities…\nRequirements: 3+ years of experience in…, proficiency with…"}
        className="text-xs"
      />

      {result && (
        <div className="space-y-4 rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="text-3xl font-extrabold text-violet-700 tabular-nums">{result.score}%</div>
            <div className="flex-1">
              <Progress value={result.score} className="h-2" />
              <p className="text-[11px] text-slate-500 mt-1">
                {result.score >= 75 ? 'Strong match — apply with confidence' : result.score >= 50 ? 'Decent match — closing a few gaps would help' : 'Big gaps — consider tailoring your CV for this role'}
              </p>
            </div>
          </div>

          {result.matched.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-emerald-700 mb-1.5 flex items-center gap-1"><Check className="h-3.5 w-3.5" /> You already cover</div>
              <div className="flex flex-wrap gap-1.5">
                {result.matched.map((k) => (
                  <Badge key={k} variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[11px]">{k}</Badge>
                ))}
              </div>
            </div>
          )}

          {result.missing.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-amber-700 mb-1.5 flex items-center gap-1"><AlertTriangle className="h-3.5 w-3.5" /> Missing from your CV</div>
              <div className="flex flex-wrap gap-1.5">
                {result.missing.map((k) => (
                  <Badge key={k} variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-[11px]">{k}</Badge>
                ))}
              </div>
            </div>
          )}

          {result.tips.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1"><Crosshair className="h-3.5 w-3.5 text-violet-500" /> Where to work them in</div>
              <ul className="space-y-1">{result.tips.map((t, i) => <li key={i} className="text-xs text-slate-600">• {t}</li>)}</ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
