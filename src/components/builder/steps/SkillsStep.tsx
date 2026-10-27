'use client'

import { useCvStore } from '@/lib/cv/store'
import { AiRunButton } from './fields'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { X, Plus, Wrench } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

export function SkillsStep() {
  const skills = useCvStore((s) => s.cv.skills)
  const addSkill = useCvStore((s) => s.addSkill)
  const removeSkill = useCvStore((s) => s.removeSkill)
  const setSkills = useCvStore((s) => s.setSkills)
  const role = useCvStore((s) => s.cv.contact.jobTitle)
  const [draft, setDraft] = useState('')

  const commit = () => {
    if (draft.trim()) {
      addSkill(draft)
      setDraft('')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-500">Type a skill and press Enter. Aim for 8–12.</p>
        <AiRunButton
          task="skills"
          label={`Suggest for "${role || 'my role'}"`}
          payload={{ role: role || 'Professional', existing: skills.map((s) => s.name) }}
          onDone={(r) => {
            const suggested = (r as { skills?: string[] })?.skills || []
            const merged = [...skills.map((s) => s.name), ...suggested].slice(0, 18)
            setSkills(Array.from(new Set(merged.map((m) => m.trim()).filter(Boolean))))
            toast.success(`Added ${suggested.length} suggestions`)
          }}
        />
      </div>

      <div className="flex gap-2">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              commit()
            }
          }}
          placeholder="e.g. Digital Strategy"
        />
        <Button variant="outline" onClick={commit} className="gap-1">
          <Plus className="h-4 w-4" /> Add
        </Button>
      </div>

      {skills.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-slate-200 p-8 text-center">
          <Wrench className="h-8 w-8 text-slate-300 mx-auto mb-2" />
          <p className="text-sm text-slate-500">No skills yet — add a few or let AI suggest them.</p>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {skills.map((s) => (
            <span key={s.id} className="group inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white py-1 pl-3 pr-1.5 text-xs font-medium text-slate-700 shadow-sm">
              {s.name}
              <button onClick={() => removeSkill(s.id)} className="h-5 w-5 rounded-full hover:bg-red-50 hover:text-red-500 text-slate-300 flex items-center justify-center" title="Remove">
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
