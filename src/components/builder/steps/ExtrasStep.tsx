'use client'

import { useCvStore } from '@/lib/cv/store'
import { Field, LevelSelect } from './fields'
import { Button } from '@/components/ui/button'
import { Plus, Trash2, Award, Languages } from 'lucide-react'

export function ExtrasStep() {
  const certs = useCvStore((s) => s.cv.certifications)
  const langs = useCvStore((s) => s.cv.languages)
  const addCert = useCvStore((s) => s.addCertification)
  const updCert = useCvStore((s) => s.updateCertification)
  const delCert = useCvStore((s) => s.removeCertification)
  const addLang = useCvStore((s) => s.addLanguage)
  const updLang = useCvStore((s) => s.updateLanguage)
  const delLang = useCvStore((s) => s.removeLanguage)

  return (
    <div className="space-y-7">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
              <Award className="h-4 w-4 text-violet-500" /> Certifications
            </h3>
            <p className="text-[11px] text-slate-500">Optional — courses, licences, professional memberships.</p>
          </div>
          <Button variant="outline" size="sm" className="gap-1" onClick={() => addCert()}>
            <Plus className="h-3.5 w-3.5" /> Add
          </Button>
        </div>
        {certs.length === 0 && <p className="text-xs text-slate-400 rounded-lg border border-dashed border-slate-200 px-3 py-4 text-center">None added — that is perfectly fine.</p>}
        {certs.map((c, i) => (
          <div key={c.id} className="rounded-xl border border-slate-200 p-3 grid sm:grid-cols-[2fr_1.4fr_.6fr_auto] gap-3 items-end bg-white">
            <Field label={`Certificate ${i + 1}`} value={c.name} onChange={(v) => updCert(c.id, { name: v })} placeholder="Google Analytics IQ" />
            <Field label="Issuer" value={c.issuer} onChange={(v) => updCert(c.id, { issuer: v })} placeholder="Google" />
            <Field label="Year" value={c.year} onChange={(v) => updCert(c.id, { year: v })} placeholder="2022" />
            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400 hover:text-red-600" onClick={() => delCert(c.id)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
              <Languages className="h-4 w-4 text-violet-500" /> Languages
            </h3>
            <p className="text-[11px] text-slate-500">Optional — great for international applications.</p>
          </div>
          <Button variant="outline" size="sm" className="gap-1" onClick={() => addLang()}>
            <Plus className="h-3.5 w-3.5" /> Add
          </Button>
        </div>
        {langs.length === 0 && <p className="text-xs text-slate-400 rounded-lg border border-dashed border-slate-200 px-3 py-4 text-center">None added — that is perfectly fine.</p>}
        {langs.map((l, i) => (
          <div key={l.id} className="rounded-xl border border-slate-200 p-3 grid sm:grid-cols-[2fr_1.2fr_auto] gap-3 items-end bg-white">
            <Field label={`Language ${i + 1}`} value={l.name} onChange={(v) => updLang(l.id, { name: v })} placeholder="Spanish" />
            <div className="space-y-1.5">
              <span className="text-xs font-medium text-slate-600">Level</span>
              <LevelSelect value={l.level} onChange={(v) => updLang(l.id, { level: v as typeof l.level })} />
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400 hover:text-red-600" onClick={() => delLang(l.id)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}
