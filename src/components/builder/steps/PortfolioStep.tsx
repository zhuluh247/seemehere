'use client'

import { useRef, useState } from 'react'
import { useCvStore } from '@/lib/cv/store'
import { Field } from './fields'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Globe, Upload, Trash2, Plus, Image as ImageIcon, Eye, ChevronUp, ChevronDown, Wand2, Moon, Sun, Quote, Images } from 'lucide-react'
import { compressImage } from '@/lib/cv/export'
import { toast } from 'sonner'
import { PortfolioSite } from '@/components/share/PortfolioSite'
import { uid } from '@/lib/cv/types'

const ACCENTS = ['#4F46E5', '#0EA5E9', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#0F172A']

export function PortfolioStep() {
  const cv = useCvStore((s) => s.cv)
  const portfolio = useCvStore((s) => s.portfolio)
  const patchPortfolio = useCvStore((s) => s.patchPortfolio)
  const patchSections = useCvStore((s) => s.patchPortfolioSections)
  const addPProject = useCvStore((s) => s.addPortfolioProject)
  const updPProject = useCvStore((s) => s.updatePortfolioProject)
  const delPProject = useCvStore((s) => s.removePortfolioProject)
  const movePProject = useCvStore((s) => s.movePortfolioProject)
  const [previewOpen, setPreviewOpen] = useState(false)

  const pickImage = async (id: string, file: File | undefined) => {
    if (!file) return
    if (!file.type.startsWith('image/')) return toast.error('Please choose an image file')
    if (file.size > 10 * 1024 * 1024) return toast.error('Image too large — pick one under 10MB')
    try {
      const small = await compressImage(file, 900, 0.8)
      updPProject(id, { image: small })
      toast.success('Image added')
    } catch {
      toast.error('Could not read that image')
    }
  }

  const pickGalleryImage = async (id: string, file: File | undefined) => {
    if (!file) return
    if (!file.type.startsWith('image/')) return toast.error('Please choose an image file')
    if (file.size > 10 * 1024 * 1024) return toast.error('Image too large — pick one under 10MB')
    try {
      const small = await compressImage(file, 900, 0.8)
      patchPortfolio({ gallery: portfolio.gallery.map((g) => (g.id === id ? { ...g, image: small } : g)) })
      toast.success('Image added')
    } catch {
      toast.error('Could not read that image')
    }
  }

  const moveList = <T extends { id: string }>(list: T[], id: string, dir: -1 | 1): T[] => {
    const i = list.findIndex((x) => x.id === id)
    const j = i + dir
    if (i < 0 || j < 0 || j >= list.length) return list
    const copy = [...list]
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
    return copy
  }

  const importFromCv = () => {
    const usable = cv.projects.filter((p) => p.name.trim())
    if (usable.length === 0) return toast.error('No CV projects to import — add some in Projects & Extras first')
    let added = 0
    for (const p of usable) {
      if (portfolio.projects.some((pp) => pp.title === p.name)) continue
      const id = addPProject()
      updPProject(id, {
        title: p.name,
        description: p.description,
        url: p.liveUrl,
        repoUrl: p.repoUrl,
        tags: p.tech,
      })
      added++
    }
    if (added) toast.success(`${added} project${added > 1 ? 's' : ''} imported — add images to make them shine`)
    else toast.info('Your portfolio already has all your CV projects')
  }

  return (
    <div className="space-y-6">
      {/* Enable */}
      <div className={`rounded-xl border p-4 flex items-start gap-3 transition-colors ${portfolio.enabled ? 'border-violet-300 bg-violet-50/60' : 'border-slate-200 bg-slate-50'}`}>
        <Switch checked={portfolio.enabled} onCheckedChange={(v) => patchPortfolio({ enabled: v })} className="mt-0.5" />
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
            <Globe className="h-4 w-4 text-violet-500" /> Portfolio website
          </h3>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
            When you publish, your share link becomes a <b>full personal website</b> — hero, about, project cards with images, experience and contact. Clean design, no ads, no SEEMEHERE banner — your name is the brand. Your CV stays downloadable from the site.
          </p>
        </div>
      </div>

      {portfolio.enabled && (
        <>
          {/* Look */}
          <div className="rounded-xl border border-slate-200 p-4 space-y-4">
            <h3 className="text-sm font-semibold text-slate-800">Look &amp; feel</h3>
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant={portfolio.mode === 'light' ? 'default' : 'outline'}
                  size="sm"
                  className={`h-8 gap-1.5 text-xs ${portfolio.mode === 'light' ? 'bg-slate-800 hover:bg-slate-900' : ''}`}
                  onClick={() => patchPortfolio({ mode: 'light' })}
                >
                  <Sun className="h-3.5 w-3.5" /> Light
                </Button>
                <Button
                  type="button"
                  variant={portfolio.mode === 'dark' ? 'default' : 'outline'}
                  size="sm"
                  className={`h-8 gap-1.5 text-xs ${portfolio.mode === 'dark' ? 'bg-slate-900 hover:bg-slate-800' : ''}`}
                  onClick={() => patchPortfolio({ mode: 'dark' })}
                >
                  <Moon className="h-3.5 w-3.5" /> Dark
                </Button>
              </div>
              <div className="flex items-center gap-1.5">
                {ACCENTS.map((c) => (
                  <button
                    key={c}
                    onClick={() => patchPortfolio({ accent: c })}
                    className={`h-7 w-7 rounded-full border-2 transition-transform hover:scale-110 ${portfolio.accent === c ? 'border-slate-800 scale-110' : 'border-transparent'}`}
                    style={{ background: c }}
                    aria-label={`Accent ${c}`}
                  />
                ))}
                <Input
                  value={portfolio.accent}
                  onChange={(e) => patchPortfolio({ accent: e.target.value.slice(0, 7) })}
                  className="w-24 h-8 text-xs font-mono"
                  placeholder="#4F46E5"
                />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <Field
                label="Hero tagline"
                value={portfolio.tagline}
                onChange={(v) => patchPortfolio({ tagline: v })}
                placeholder={cv.contact.jobTitle || 'What you do, in one line'}
              />
              <div className="flex items-end pb-1.5">
                <Button type="button" variant="outline" size="sm" className="h-9 gap-1.5 text-xs" onClick={() => setPreviewOpen(true)}>
                  <Eye className="h-3.5 w-3.5" /> Preview the website
                </Button>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-slate-600">About text</Label>
              <textarea
                value={portfolio.about}
                onChange={(e) => patchPortfolio({ about: e.target.value })}
                rows={3}
                placeholder="Leave empty to use your CV summary"
                className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
              />
            </div>
          </div>

          {/* Sections */}
          <div className="rounded-xl border border-slate-200 p-4">
            <h3 className="text-sm font-semibold text-slate-800 mb-3">Sections on the website</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {(
                [
                  ['about', 'About'],
                  ['projects', 'Projects'],
                  ['experience', 'Experience'],
                  ['education', 'Education'],
                  ['skills', 'Skills'],
                  ['contact', 'Contact'],
                  ['testimonials', 'Testimonials'],
                  ['gallery', 'Gallery'],
                ] as const
              ).map(([key, label]) => (
                <label key={key} className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 cursor-pointer hover:bg-slate-50">
                  <Switch checked={portfolio.sections[key]} onCheckedChange={(v) => patchSections({ [key]: v })} className="scale-90" />
                  {label}
                </label>
              ))}
            </div>
            <p className="mt-2 text-[11px] text-slate-400">Experience, education and skills pull straight from your CV — no double typing.</p>
          </div>

          {/* Projects */}
          <div className="rounded-xl border border-slate-200 p-4 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-semibold text-slate-800">Project cards</h3>
                <p className="text-[11px] text-slate-500">Showcase work with images. Import from your CV, then dress them up.</p>
              </div>
              <div className="flex gap-1.5">
                <Button variant="outline" size="sm" className="h-8 gap-1 text-xs" onClick={importFromCv}>
                  <Wand2 className="h-3.5 w-3.5" /> Import from CV
                </Button>
                <Button variant="outline" size="sm" className="h-8 gap-1 text-xs" onClick={() => addPProject()}>
                  <Plus className="h-3.5 w-3.5" /> Add
                </Button>
              </div>
            </div>

            {portfolio.projects.length === 0 && (
              <p className="text-xs text-slate-400 rounded-lg border border-dashed border-slate-200 px-3 py-4 text-center">No project cards yet — import from your CV or add one.</p>
            )}

            {portfolio.projects.map((p, i) => (
              <div key={p.id} className="rounded-xl border border-slate-200 p-3 space-y-3 bg-white">
                <div className="flex items-start gap-3">
                  {/* Image thumb / upload */}
                  <label className="relative group cursor-pointer shrink-0">
                    <div className="h-20 w-28 overflow-hidden rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-center">
                      {p.image ? (
                        <img src={p.image} alt={p.title || 'Project'} className="h-full w-full object-cover" />
                      ) : (
                        <ImageIcon className="h-6 w-6 text-slate-300" />
                      )}
                    </div>
                    <span className="absolute inset-0 hidden group-hover:flex items-center justify-center rounded-lg bg-black/40 text-[10px] font-semibold text-white">
                      {p.image ? 'Change' : 'Upload'}
                    </span>
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => pickImage(p.id, e.target.files?.[0])} />
                  </label>
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex gap-2 items-end">
                      <div className="flex-1">
                        <Field label={`Card ${i + 1} title`} value={p.title} onChange={(v) => updPProject(p.id, { title: v })} placeholder="GrowthLens dashboard" />
                      </div>
                      <div className="flex flex-col">
                        <button className="text-slate-300 hover:text-violet-600 disabled:opacity-30" disabled={i === 0} onClick={() => movePProject(p.id, -1)} tabIndex={-1}>
                          <ChevronUp className="h-3.5 w-3.5" />
                        </button>
                        <button className="text-slate-300 hover:text-violet-600 disabled:opacity-30" disabled={i === portfolio.projects.length - 1} onClick={() => movePProject(p.id, 1)} tabIndex={-1}>
                          <ChevronDown className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400 hover:text-red-600" onClick={() => delPProject(p.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <Field label="Description" value={p.description} onChange={(v) => updPProject(p.id, { description: v })} placeholder="One or two sentences" />
                    <div className="grid sm:grid-cols-3 gap-2">
                      <Field label="Live link" value={p.url} onChange={(v) => updPProject(p.id, { url: v })} placeholder="project.com" />
                      <Field label="Code link" value={p.repoUrl} onChange={(v) => updPProject(p.id, { repoUrl: v })} placeholder="github.com/…" />
                      <Field label="Tags" value={p.tags} onChange={(v) => updPProject(p.id, { tags: v })} placeholder="React · Design" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Testimonials */}
          <div className="rounded-xl border border-slate-200 p-4 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-1.5"><Quote className="h-4 w-4 text-violet-500" /> Testimonials</h3>
                <p className="text-[11px] text-slate-500">Short recommendations from bosses, clients or colleagues.</p>
              </div>
              <Button variant="outline" size="sm" className="h-8 gap-1 text-xs" onClick={() => patchPortfolio({ testimonials: [...portfolio.testimonials, { id: uid(), quote: '', author: '', role: '' }] })}>
                <Plus className="h-3.5 w-3.5" /> Add
              </Button>
            </div>
            {portfolio.testimonials.length === 0 && (
              <p className="text-xs text-slate-400 rounded-lg border border-dashed border-slate-200 px-3 py-4 text-center">No testimonials yet — add the best line anyone has said about your work.</p>
            )}
            {portfolio.testimonials.map((t, i) => (
              <div key={t.id} className="rounded-xl border border-slate-200 p-3 space-y-2 bg-white">
                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <Field label={`Quote ${i + 1}`} value={t.quote} onChange={(v) => patchPortfolio({ testimonials: portfolio.testimonials.map((x) => (x.id === t.id ? { ...x, quote: v } : x)) })} placeholder="Ada delivered beyond every expectation…" />
                  </div>
                  <div className="flex flex-col">
                    <button className="text-slate-300 hover:text-violet-600 disabled:opacity-30" disabled={i === 0} onClick={() => patchPortfolio({ testimonials: moveList(portfolio.testimonials, t.id, -1) })} tabIndex={-1}><ChevronUp className="h-3.5 w-3.5" /></button>
                    <button className="text-slate-300 hover:text-violet-600 disabled:opacity-30" disabled={i === portfolio.testimonials.length - 1} onClick={() => patchPortfolio({ testimonials: moveList(portfolio.testimonials, t.id, 1) })} tabIndex={-1}><ChevronDown className="h-3.5 w-3.5" /></button>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400 hover:text-red-600" onClick={() => patchPortfolio({ testimonials: portfolio.testimonials.filter((x) => x.id !== t.id) })}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="grid sm:grid-cols-2 gap-2">
                  <Field label="Who said it" value={t.author} onChange={(v) => patchPortfolio({ testimonials: portfolio.testimonials.map((x) => (x.id === t.id ? { ...x, author: v } : x)) })} placeholder="Mrs. Bello" />
                  <Field label="Their role / company" value={t.role} onChange={(v) => patchPortfolio({ testimonials: portfolio.testimonials.map((x) => (x.id === t.id ? { ...x, role: v } : x)) })} placeholder="Manager, Acme Ltd" />
                </div>
              </div>
            ))}
          </div>

          {/* Gallery */}
          <div className="rounded-xl border border-slate-200 p-4 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-1.5"><Images className="h-4 w-4 text-violet-500" /> Gallery</h3>
                <p className="text-[11px] text-slate-500">Visual showcase — designs, certificates, event photos, anything that proves your work.</p>
              </div>
              <Button variant="outline" size="sm" className="h-8 gap-1 text-xs" onClick={() => patchPortfolio({ gallery: [...portfolio.gallery, { id: uid(), image: '', caption: '' }] })}>
                <Plus className="h-3.5 w-3.5" /> Add
              </Button>
            </div>
            {portfolio.gallery.length === 0 && (
              <p className="text-xs text-slate-400 rounded-lg border border-dashed border-slate-200 px-3 py-4 text-center">No gallery images yet.</p>
            )}
            {portfolio.gallery.map((g, i) => (
              <div key={g.id} className="rounded-xl border border-slate-200 p-3 flex items-start gap-3 bg-white">
                <label className="relative group cursor-pointer shrink-0">
                  <div className="h-20 w-28 overflow-hidden rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-center">
                    {g.image ? <img src={g.image} alt={g.caption || 'Gallery'} className="h-full w-full object-cover" /> : <ImageIcon className="h-6 w-6 text-slate-300" />}
                  </div>
                  <span className="absolute inset-0 hidden group-hover:flex items-center justify-center rounded-lg bg-black/40 text-[10px] font-semibold text-white">{g.image ? 'Change' : 'Upload'}</span>
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => pickGalleryImage(g.id, e.target.files?.[0])} />
                </label>
                <div className="flex-1 min-w-0">
                  <div className="flex items-end gap-2">
                    <div className="flex-1">
                      <Field label={`Caption ${i + 1}`} value={g.caption} onChange={(v) => patchPortfolio({ gallery: portfolio.gallery.map((x) => (x.id === g.id ? { ...x, caption: v } : x)) })} placeholder="Brand identity for Kudi Café" />
                    </div>
                    <div className="flex flex-col">
                      <button className="text-slate-300 hover:text-violet-600 disabled:opacity-30" disabled={i === 0} onClick={() => patchPortfolio({ gallery: moveList(portfolio.gallery, g.id, -1) })} tabIndex={-1}><ChevronUp className="h-3.5 w-3.5" /></button>
                      <button className="text-slate-300 hover:text-violet-600 disabled:opacity-30" disabled={i === portfolio.gallery.length - 1} onClick={() => patchPortfolio({ gallery: moveList(portfolio.gallery, g.id, 1) })} tabIndex={-1}><ChevronDown className="h-3.5 w-3.5" /></button>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400 hover:text-red-600" onClick={() => patchPortfolio({ gallery: portfolio.gallery.filter((x) => x.id !== g.id) })}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Live preview overlay */}
      {previewOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 p-2 sm:p-6 overflow-y-auto" onClick={() => setPreviewOpen(false)}>
          <div className="mx-auto max-w-5xl overflow-hidden rounded-xl shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between bg-slate-900 px-4 py-2">
              <span className="text-[11px] font-medium text-slate-300">Preview — how visitors will see your website</span>
              <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs text-white hover:bg-white/10" onClick={() => setPreviewOpen(false)}>
                <X className="h-3.5 w-3.5" /> Close
              </Button>
            </div>
            <PortfolioSite
              data={cv}
              photoData={useCvStore.getState().photoData}
              portfolio={portfolio}
              preview
            />
          </div>
        </div>
      )}
    </div>
  )
}

function X(props: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={props.className}>
      <path d="M18 6 6 18" /><path d="m6 6 12 12" />
    </svg>
  )
}
