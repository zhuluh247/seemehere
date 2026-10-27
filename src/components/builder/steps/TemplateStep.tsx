'use client'

import { useCvStore } from '@/lib/cv/store'
import { PALETTES } from '@/lib/cv/palettes'
import { themeFromAccent } from '@/lib/cv/color'
import { TEMPLATE_META } from '@/components/cv/templates'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Check, Wand2, RotateCcw, FileUp } from 'lucide-react'
import { toast } from 'sonner'
import { useState } from 'react'
import { ImportDialog } from './ImportDialog'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

export function TemplateStep() {
  const design = useCvStore((s) => s.design)
  const setDesign = useCvStore((s) => s.setDesign)
  const loadSample = useCvStore((s) => s.loadSample)
  const resetAll = useCvStore((s) => s.resetAll)
  const cv = useCvStore((s) => s.cv)
  const [customHex, setCustomHex] = useState(design.theme.accent)
  const [importOpen, setImportOpen] = useState(false)

  const applyCustom = (hex: string) => {
    const m = /^#[0-9a-fA-F]{6}$/.test(hex)
    if (!m) return
    setCustomHex(hex.toLowerCase())
    setDesign({ theme: themeFromAccent(hex.toLowerCase()) })
  }

  const activePaletteId = PALETTES.find((p) => JSON.stringify(p.theme) === JSON.stringify(design.theme))?.id

  return (
    <div className="space-y-7">
      {/* Templates */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-slate-800">1 · Choose your template</h3>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={() => { loadSample(); toast.success('Sample CV loaded — make it yours!') }}>
              <Wand2 className="h-3.5 w-3.5" /> Try sample data
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="sm" className="h-7 text-xs text-slate-400 hover:text-red-600 gap-1">
                  <RotateCcw className="h-3.5 w-3.5" /> Reset
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Start over?</AlertDialogTitle>
                  <AlertDialogDescription>This erases everything you wrote and resets the design. There is no undo.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Keep my CV</AlertDialogCancel>
                  <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={() => { resetAll(); toast.info('Fresh start — good luck!') }}>
                    Erase everything
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
        {cv.contact.fullName === '' && (
          <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-3">
            Tip: press <b>Try sample data</b> to see the templates fully filled, then overwrite with your own story.
          </p>
        )}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {TEMPLATE_META.map((t) => {
            const active = design.templateId === t.id
            return (
              <button
                key={t.id}
                onClick={() => setDesign({ templateId: t.id })}
                className={`group relative rounded-xl border-2 overflow-hidden text-left transition-all hover:-translate-y-0.5 hover:shadow-md ${active ? 'border-violet-600 shadow-md' : 'border-slate-200'}`}
              >
                <img src={t.img} alt={`${t.name} template`} className="w-full aspect-[794/1123] object-cover object-top bg-white" />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-900/85 to-transparent px-2.5 pt-6 pb-2">
                  <div className="text-xs font-semibold text-white">{t.name}</div>
                  <div className="text-[10px] text-slate-300 leading-tight">{t.blurb}</div>
                </div>
                {active && (
                  <span className="absolute top-2 right-2 h-6 w-6 rounded-full bg-violet-600 text-white flex items-center justify-center shadow">
                    <Check className="h-3.5 w-3.5" />
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Colors */}
      <div>
        <h3 className="text-sm font-semibold text-slate-800 mb-1">2 · Make the colors yours</h3>
        <p className="text-xs text-slate-500 mb-3">One tap recolors every template — headers, rules, tags, everything.</p>
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
          {PALETTES.map((p) => {
            const active = activePaletteId === p.id
            return (
              <button
                key={p.id}
                title={p.name}
                onClick={() => setDesign({ theme: { ...p.theme } })}
                className={`relative rounded-xl border-2 p-1.5 transition-all hover:-translate-y-0.5 ${active ? 'border-violet-600' : 'border-slate-200'}`}
              >
                <div className="h-9 rounded-lg mb-1" style={{ background: p.theme.headerBg }} />
                <div className="flex gap-1">
                  <span className="h-2.5 flex-1 rounded-full" style={{ background: p.theme.accent }} />
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: p.theme.accent, opacity: 0.35 }} />
                </div>
                <div className="text-[10px] text-slate-600 mt-1 truncate">{p.name}</div>
                {active && <Check className="absolute top-2.5 right-2.5 h-3.5 w-3.5 text-white drop-shadow" />}
              </button>
            )
          })}
        </div>

        <div className="flex items-center gap-3 mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
          <input
            type="color"
            value={/^#[0-9a-fA-F]{6}$/.test(customHex) ? customHex : '#4f46e5'}
            onChange={(e) => applyCustom(e.target.value)}
            className="h-9 w-12 rounded cursor-pointer border border-slate-200 bg-white"
            aria-label="Custom accent color"
          />
          <div className="flex-1">
            <Label className="text-xs font-medium text-slate-600">Custom accent</Label>
            <div className="flex items-center gap-2">
              <input
                value={customHex}
                onChange={(e) => applyCustom(e.target.value.trim())}
                placeholder="#4F46E5"
                className="w-28 rounded-md border border-slate-200 px-2 py-1 text-xs"
              />
              <span className="text-[11px] text-slate-400">Any hex — header shade is derived automatically</span>
            </div>
          </div>
        </div>
      </div>

      {/* Photo */}
      <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3">
        <div>
          <Label htmlFor="show-photo" className="text-sm font-medium text-slate-800">Show profile photo</Label>
          <p className="text-[11px] text-slate-500">Off = elegant initials badge instead. Choose per taste.</p>
        </div>
        <Switch id="show-photo" checked={design.showPhoto} onCheckedChange={(v) => setDesign({ showPhoto: v })} />
      </div>

      {/* Import from PDF */}
      <div className="flex items-center justify-between rounded-xl border border-violet-200 bg-gradient-to-r from-violet-50 to-indigo-50 p-3">
        <div>
          <Label className="text-sm font-medium text-slate-800">Have an old CV?</Label>
          <p className="text-[11px] text-slate-500">Upload the PDF — AI fills every step for you, then you polish.</p>
        </div>
        <Button type="button" variant="outline" size="sm" className="h-8 gap-1.5 text-xs border-violet-300 bg-white" onClick={() => setImportOpen(true)}>
          <FileUp className="h-3.5 w-3.5 text-violet-600" /> Import from PDF
        </Button>
      </div>

      <ImportDialog open={importOpen} onOpenChange={setImportOpen} />
    </div>
  )
}
