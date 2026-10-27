'use client'

import { useCvStore } from '@/lib/cv/store'
import { Field, AiRunButton } from './fields'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Trash2, ChevronUp, ChevronDown, Briefcase } from 'lucide-react'

export function ExperienceStep() {
  const items = useCvStore((s) => s.cv.experience)
  const add = useCvStore((s) => s.addExperience)
  const update = useCvStore((s) => s.updateExperience)
  const remove = useCvStore((s) => s.removeExperience)
  const move = useCvStore((s) => s.moveExperience)

  return (
    <div className="space-y-4">
      {items.length === 0 && (
        <div className="rounded-xl border-2 border-dashed border-slate-200 p-8 text-center">
          <Briefcase className="h-8 w-8 text-slate-300 mx-auto mb-2" />
          <p className="text-sm text-slate-500 mb-3">List your roles from newest to oldest. Internships and freelance work count too.</p>
          <Button size="sm" onClick={() => add()} className="gap-1.5">
            <Plus className="h-4 w-4" /> Add your first role
          </Button>
        </div>
      )}

      {items.map((e, idx) => (
        <div key={e.id} className="rounded-xl border border-slate-200 p-4 space-y-3 bg-white">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Role {idx + 1}</span>
            <div className="flex gap-0.5">
              <Button variant="ghost" size="icon" className="h-7 w-7" disabled={idx === 0} onClick={() => move(e.id, -1)} title="Move up">
                <ChevronUp className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7" disabled={idx === items.length - 1} onClick={() => move(e.id, 1)} title="Move down">
                <ChevronDown className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-red-400 hover:text-red-600" onClick={() => remove(e.id)} title="Remove">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Job title" value={e.role} onChange={(v) => update(e.id, { role: v })} placeholder="Marketing Manager" />
            <Field label="Company" value={e.company} onChange={(v) => update(e.id, { company: v })} placeholder="BrightWave Media" />
            <Field label="Location" value={e.location} onChange={(v) => update(e.id, { location: v })} placeholder="London" />
            <div className="grid grid-cols-2 gap-3">
              <Field label="Start" value={e.startDate} onChange={(v) => update(e.id, { startDate: v })} placeholder="2021" />
              <Field label="End" value={e.endDate} onChange={(v) => update(e.id, { endDate: v })} placeholder="Present" />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-600">Achievements</span>
              <Button variant="outline" size="sm" className="h-6 text-[11px] gap-1" onClick={() => update(e.id, { bullets: [...e.bullets, ''] })}>
                <Plus className="h-3 w-3" /> Add bullet
              </Button>
            </div>
            {e.bullets.map((b, bi) => (
              <div key={bi} className="flex gap-2 items-start">
                <span className="text-slate-300 mt-2.5 text-xs">•</span>
                <Textarea
                  value={b}
                  rows={2}
                  placeholder="e.g. Grew organic traffic 140% in 18 months by rebuilding the content strategy"
                  onChange={(ev) => {
                    const bullets = [...e.bullets]
                    bullets[bi] = ev.target.value
                    update(e.id, { bullets })
                  }}
                  className="min-h-0"
                />
                <div className="flex flex-col gap-1">
                  <AiRunButton
                    task="polish"
                    size="xs"
                    label="Polish"
                    payload={{ bullet: b, role: e.role, company: e.company }}
                    onDone={(r) => {
                      const polished = (r as { polished?: string })?.polished
                      if (polished) {
                        const bullets = [...e.bullets]
                        bullets[bi] = polished
                        update(e.id, { bullets })
                      }
                    }}
                  />
                  {e.bullets.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-full px-1 text-red-400 hover:text-red-600"
                      onClick={() => update(e.id, { bullets: e.bullets.filter((_, i) => i !== bi) })}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
            <p className="text-[11px] text-slate-400">Start with an action verb, end with a number. ✨ Polish fixes weak wording.</p>
          </div>
        </div>
      ))}

      {items.length > 0 && (
        <Button variant="outline" onClick={() => add()} className="w-full gap-1.5 border-dashed">
          <Plus className="h-4 w-4" /> Add another role
        </Button>
      )}
      <input type="hidden" value={items.length} aria-hidden />
    </div>
  )
}

export function EducationStep() {
  const items = useCvStore((s) => s.cv.education)
  const add = useCvStore((s) => s.addEducation)
  const update = useCvStore((s) => s.updateEducation)
  const remove = useCvStore((s) => s.removeEducation)
  const move = useCvStore((s) => s.moveEducation)

  return (
    <div className="space-y-4">
      {items.length === 0 && (
        <div className="rounded-xl border-2 border-dashed border-slate-200 p-8 text-center">
          <p className="text-sm text-slate-500 mb-3">Degrees, diplomas, bootcamps — anything formal you completed.</p>
          <Button size="sm" onClick={() => add()} className="gap-1.5">
            <Plus className="h-4 w-4" /> Add education
          </Button>
        </div>
      )}

      {items.map((e, idx) => (
        <div key={e.id} className="rounded-xl border border-slate-200 p-4 space-y-3 bg-white">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Education {idx + 1}</span>
            <div className="flex gap-0.5">
              <Button variant="ghost" size="icon" className="h-7 w-7" disabled={idx === 0} onClick={() => move(e.id, -1)}>
                <ChevronUp className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7" disabled={idx === items.length - 1} onClick={() => move(e.id, 1)}>
                <ChevronDown className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-red-400 hover:text-red-600" onClick={() => remove(e.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Degree / qualification" value={e.degree} onChange={(v) => update(e.id, { degree: v })} placeholder="BA (Hons) Marketing" />
            <Field label="School / university" value={e.school} onChange={(v) => update(e.id, { school: v })} placeholder="University of Manchester" />
            <Field label="Location" value={e.location} onChange={(v) => update(e.id, { location: v })} placeholder="Manchester" />
            <div className="grid grid-cols-2 gap-3">
              <Field label="Start" value={e.startDate} onChange={(v) => update(e.id, { startDate: v })} placeholder="2012" />
              <Field label="End" value={e.endDate} onChange={(v) => update(e.id, { endDate: v })} placeholder="2016" />
            </div>
          </div>
          <Field label="Note (honours, GPA, dissertation…)" value={e.note} onChange={(v) => update(e.id, { note: v })} placeholder="First Class Honours" />
        </div>
      ))}

      {items.length > 0 && (
        <Button variant="outline" onClick={() => add()} className="w-full gap-1.5 border-dashed">
          <Plus className="h-4 w-4" /> Add more education
        </Button>
      )}
    </div>
  )
}

export function _Unused() {
  return <Input />
}
