'use client'

import { useState } from 'react'
import {
  ChevronUp, ChevronDown, Eye, EyeOff, Trash2, Plus, Pencil, LayoutList, Info,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCvStore } from '@/lib/cv/store'
import type { TemplateId } from '@/lib/cv/types'
import { effectiveSectionOrder, sectionHasContent, SECTION_LABELS } from '@/lib/cv/sections'
import { Field, AreaField } from './fields'

/** Per-template notes so the UI is honest about what reorder can do */
const TEMPLATE_HINT: Record<TemplateId, string> = {
  classic: 'Classic: every section is fully reorderable.',
  modern: 'Modern: Skills & Languages live in the sidebar — hideable, but their position is fixed. Certifications travel with Education.',
  minimal: 'Minimal: the About + Contact intro stays at the top — the rest reorders freely. Certifications & Languages travel with Education.',
  executive: 'Executive: the intro summary stays at the top. Skills & Languages share one block and move together.',
  creative: 'Creative: fully reorderable. Certifications travel with Education.',
  compact: 'Compact: Education · Certifications · Languages share the bottom band and move together.',
}

/** Step · Sections & Layout — reorder core + custom sections, hide/show, and
 *  build your own sections (name + entries with title, subtitle and body). */
export function SectionsStep() {
  const cv = useCvStore((s) => s.cv)
  const design = useCvStore((s) => s.design)
  const toggleSectionHidden = useCvStore((s) => s.toggleSectionHidden)
  const moveSection = useCvStore((s) => s.moveSection)
  const addCustomSection = useCvStore((s) => s.addCustomSection)
  const updateCustomSection = useCvStore((s) => s.updateCustomSection)
  const removeCustomSection = useCvStore((s) => s.removeCustomSection)
  const addCustomItem = useCvStore((s) => s.addCustomItem)
  const updateCustomItem = useCvStore((s) => s.updateCustomItem)
  const removeCustomItem = useCvStore((s) => s.removeCustomItem)
  const moveCustomItem = useCvStore((s) => s.moveCustomItem)

  const [openId, setOpenId] = useState<string | null>(null)

  const order = effectiveSectionOrder(cv)
  const customMap = new Map((cv.customSections || []).map((s) => [s.id, s]))
  const hiddenList = cv.hiddenSections || []

  const addSection = () => {
    const id = addCustomSection()
    setOpenId(id)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-2 rounded-xl border border-sky-200 bg-sky-50 px-3 py-2.5 text-[11.5px] leading-relaxed text-sky-900">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-sky-500" />
        <div>
          <p>Drag-free reordering: use the arrows. Hidden sections are skipped on every template — screen, PDF, PNG and your published page.</p>
          <p className="mt-1 text-sky-700">{TEMPLATE_HINT[design.templateId]}</p>
        </div>
      </div>

      {/* Ordered section list */}
      <div className="space-y-2">
        {order.map((key, i) => {
          const custom = customMap.get(key)
          const label = custom ? custom.name || 'Untitled section' : SECTION_LABELS[key] || key
          const hasContent = custom ? custom.items.length > 0 && !!custom.name.trim() : sectionHasContent(cv, key)
          const isHidden = hiddenList.includes(key)
          const isOpen = openId === key

          return (
            <div key={key} className={`rounded-xl border ${isHidden ? 'border-slate-200 bg-slate-50' : 'border-slate-200 bg-white'}`}>
              <div className="flex items-center gap-1.5 px-3 py-2">
                <LayoutList className={`h-4 w-4 shrink-0 ${isHidden ? 'text-slate-300' : 'text-violet-500'}`} />
                <div className="min-w-0 flex-1">
                  <span className={`truncate text-[13px] font-semibold ${isHidden ? 'text-slate-400' : 'text-slate-800'}`}>{label}</span>
                  {custom && <span className="ml-1.5 rounded-full bg-violet-100 px-1.5 py-0.5 text-[9.5px] font-bold uppercase tracking-wide text-violet-600">custom</span>}
                  {!hasContent && !isHidden && <span className="ml-1.5 text-[10.5px] text-slate-400">(empty — won&apos;t show)</span>}
                </div>

                {/* Reorder */}
                <Button variant="ghost" size="icon" className="h-7 w-7" title="Move up" disabled={i === 0} onClick={() => moveSection(key, -1)}>
                  <ChevronUp className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7" title="Move down" disabled={i === order.length - 1} onClick={() => moveSection(key, 1)}>
                  <ChevronDown className="h-4 w-4" />
                </Button>

                {/* Hide / show */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  title={isHidden ? 'Show section' : 'Hide section'}
                  onClick={() => toggleSectionHidden(key)}
                >
                  {isHidden ? <EyeOff className="h-4 w-4 text-slate-400" /> : <Eye className="h-4 w-4 text-slate-500" />}
                </Button>

                {/* Custom section controls */}
                {custom && (
                  <>
                    <Button variant="ghost" size="icon" className="h-7 w-7" title="Edit section" onClick={() => setOpenId(isOpen ? null : key)}>
                      <Pencil className={`h-3.5 w-3.5 ${isOpen ? 'text-violet-600' : 'text-slate-400'}`} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      title="Delete section"
                      onClick={() => {
                        if (confirm(`Delete "${label}"? This can't be undone.`)) {
                          removeCustomSection(key)
                          if (isOpen) setOpenId(null)
                        }
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5 text-rose-400" />
                    </Button>
                  </>
                )}
              </div>

              {/* Custom section editor */}
              {custom && isOpen && (
                <div className="space-y-3 border-t border-slate-100 px-3 py-3">
                  <Field
                    label="Section title"
                    value={custom.name}
                    onChange={(v) => updateCustomSection(custom.id, { name: v })}
                    placeholder="e.g. Volunteering, Awards, Interests"
                  />
                  <div className="space-y-3">
                    {custom.items.map((it, idx) => (
                      <div key={it.id} className="space-y-2 rounded-lg border border-slate-200 bg-slate-50/60 p-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10.5px] font-bold uppercase tracking-wide text-slate-400">Entry {idx + 1}</span>
                          <div className="flex items-center gap-0.5">
                            <Button variant="ghost" size="icon" className="h-6 w-6" title="Move up" disabled={idx === 0} onClick={() => moveCustomItem(custom.id, it.id, -1)}>
                              <ChevronUp className="h-3.5 w-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-6 w-6" title="Move down" disabled={idx === custom.items.length - 1} onClick={() => moveCustomItem(custom.id, it.id, 1)}>
                              <ChevronDown className="h-3.5 w-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-6 w-6" title="Remove entry" onClick={() => removeCustomItem(custom.id, it.id)}>
                              <Trash2 className="h-3.5 w-3.5 text-rose-400" />
                            </Button>
                          </div>
                        </div>
                        <Field label="Title" value={it.title} onChange={(v) => updateCustomItem(custom.id, it.id, { title: v })} placeholder="e.g. Camp Coordinator" />
                        <Field label="Subtitle (optional)" value={it.subtitle} onChange={(v) => updateCustomItem(custom.id, it.id, { subtitle: v })} placeholder="e.g. Red Cross · 2023" />
                        <AreaField
                          label="Description (optional)"
                          value={it.body}
                          onChange={(v) => updateCustomItem(custom.id, it.id, { body: v })}
                          placeholder="What you did, results, highlights…"
                          rows={3}
                          hint="Line breaks are kept on the CV."
                        />
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" size="sm" className="h-7 gap-1.5 text-xs" onClick={() => addCustomItem(custom.id)}>
                    <Plus className="h-3.5 w-3.5" /> Add entry
                  </Button>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <Button variant="outline" className="w-full gap-1.5 border-dashed border-violet-300 text-violet-700 hover:bg-violet-50" onClick={addSection}>
        <Plus className="h-4 w-4" /> Add custom section
      </Button>
      <p className="text-center text-[11px] text-slate-400">
        Custom sections appear on every template and are included when you publish or export.
      </p>
    </div>
  )
}
