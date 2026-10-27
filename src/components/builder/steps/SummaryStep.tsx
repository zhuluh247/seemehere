'use client'

import { useCvStore } from '@/lib/cv/store'
import { AreaField, AiRunButton } from './fields'
import { Badge } from '@/components/ui/badge'

export function SummaryStep() {
  const summary = useCvStore((s) => s.cv.summary)
  const setSummary = useCvStore((s) => s.setSummary)
  const cv = useCvStore((s) => s.cv)
  const words = summary.trim() ? summary.trim().split(/\s+/).length : 0

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-slate-500">3 short lines at the top of your CV. Tell them who you are, what you have done, what you bring.</p>
        <AiRunButton
          task="summary"
          label="Generate from my CV"
          payload={{ cv }}
          onDone={(r) => {
            const s = (r as { summary?: string })?.summary
            if (s) setSummary(s)
          }}
        />
      </div>
      <AreaField
        label="Professional summary"
        value={summary}
        onChange={setSummary}
        rows={5}
        placeholder="Results-driven marketing leader with 8+ years of experience…"
        hint={`${words} words · sweet spot is 40–60 words`}
      />
      {words > 0 && words < 25 && <Badge variant="outline" className="text-amber-600 border-amber-300">A bit short — aim for 40–60 words</Badge>}
      {words > 80 && <Badge variant="outline" className="text-amber-600 border-amber-300">A bit long — recruiters skim, keep it tight</Badge>}
    </div>
  )
}
