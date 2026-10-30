'use client'

// ─── R6 · Portfolio content editors (left rail of the builder) ──────────────
// One editor per website section. Hero/About/Projects/Testimonials/Gallery
// edit portfolio-owned content; Experience/Education/Skills are sourced from
// the imported CV (read-only here, with a re-import shortcut).

import { useRef } from 'react'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Field } from '@/components/builder/steps/fields'
import { usePortfolioStore } from './portfolio-store'
import { useCvStore } from '@/lib/cv/store'
import { LINK_KINDS, type PortfolioSectionKey } from '@/lib/cv/types'
import { compressImage, compressPhoto } from '@/lib/cv/export'
import { toast } from 'sonner'
import {
  Trash2, Plus, Image as ImageIcon, ChevronUp, ChevronDown, Wand2, UserRound, RefreshCw, PenLine,
} from 'lucide-react'

// ── Hero — who you are: name, title, photo, contacts, socials ────────────────

function HeroPanel() {
  const cv = usePortfolioStore((s) => s.cv)
  const setField = usePortfolioStore((s) => s.setContactField)
  const addLink = usePortfolioStore((s) => s.addLink)
  const updateLink = usePortfolioStore((s) => s.updateLink)
  const removeLink = usePortfolioStore((s) => s.removeLink)
  const photoData = usePortfolioStore((s) => s.photoData)
  const setPhoto = usePortfolioStore((s) => s.setPhoto)
  const fileRef = useRef<HTMLInputElement>(null)

  const pickPhoto = async (file: File | undefined) => {
    if (!file) return
    if (!file.type.startsWith('image/')) return toast.error('Please choose an image file')
    if (file.size > 10 * 1024 * 1024) return toast.error('Image too large — pick one under 10MB')
    try {
      setPhoto(await compressPhoto(file))
      toast.success('Photo updated')
    } catch {
      toast.error('Could not read that image')
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="group relative h-16 w-16 shrink-0 overflow-hidden rounded-full border border-slate-200 bg-slate-50"
          title="Upload photo"
        >
          {photoData ? (
            <img src={photoData} alt="Profile" className="h-full w-full object-cover" />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-slate-300"><UserRound className="h-6 w-6" /></span>
          )}
          <span className="absolute inset-0 hidden items-center justify-center bg-black/40 text-[10px] font-semibold text-white group-hover:flex">
            {photoData ? 'Change' : 'Upload'}
          </span>
        </button>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => pickPhoto(e.target.files?.[0])} />
        {photoData && (
          <Button variant="ghost" size="sm" className="h-8 text-xs text-red-400 hover:text-red-600" onClick={() => setPhoto('')}>
            <Trash2 className="h-3.5 w-3.5" /> Remove photo
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Field label="Your name" value={cv.contact.fullName} onChange={(v) => setField('fullName', v)} placeholder="Sarah Mitchell" />
        <Field label="Job title" value={cv.contact.jobTitle} onChange={(v) => setField('jobTitle', v)} placeholder="Product Designer" />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Field label="Email" value={cv.contact.email} onChange={(v) => setField('email', v)} placeholder="you@email.com" />
        <Field label="Phone (optional)" value={cv.contact.phone} onChange={(v) => setField('phone', v)} placeholder="+234 …" />
      </div>
      <Field label="Location" value={cv.contact.location} onChange={(v) => setField('location', v)} placeholder="Lagos, Nigeria" />

      {/* Socials */}
      <div>
        <Label className="text-xs font-medium text-slate-600">Social links</Label>
        {cv.contact.links.length > 0 && (
          <div className="mt-2 space-y-2">
            {cv.contact.links.map((l) => (
              <div key={l.id} className="flex items-center gap-2">
                <span className="w-24 shrink-0 truncate text-[11px] font-semibold text-slate-500">{l.label || l.kind}</span>
                <Input
                  value={l.url}
                  onChange={(e) => updateLink(l.id, { url: e.target.value })}
                  placeholder="github.com/you"
                  className="h-8 flex-1 text-xs"
                />
                <Button variant="ghost" size="icon" className="h-7 w-7 text-red-400 hover:text-red-600" onClick={() => removeLink(l.id)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>
        )}
        <div className="mt-2 flex flex-wrap gap-1.5">
          {LINK_KINDS.filter((k) => k.kind !== 'custom' || cv.contact.links.some((l) => l.kind === 'custom')).map((k) => {
            const has = cv.contact.links.some((l) => l.kind === k.kind)
            return (
              <button
                key={k.kind}
                type="button"
                disabled={has && k.kind !== 'custom'}
                onClick={() => addLink(k.kind, k.label, '')}
                className="rounded-full border border-slate-200 px-2.5 py-1 text-[10.5px] font-medium text-slate-600 transition-colors hover:border-violet-300 hover:text-violet-700 disabled:opacity-30"
              >
                + {k.label}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ── About — tagline + about text ─────────────────────────────────────────────

function AboutPanel() {
  const cv = usePortfolioStore((s) => s.cv)
  const portfolio = usePortfolioStore((s) => s.portfolio)
  const patch = usePortfolioStore((s) => s.patchPortfolio)
  return (
    <div className="space-y-3">
      <Field
        label="Hero tagline"
        value={portfolio.tagline}
        onChange={(v) => patch({ tagline: v })}
        placeholder={cv.contact.jobTitle || 'What you do, in one line'}
      />
      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-slate-600">About text</Label>
        <textarea
          value={portfolio.about}
          onChange={(e) => patch({ about: e.target.value })}
          rows={4}
          placeholder="Leave empty to use your CV summary"
          className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
        />
      </div>
    </div>
  )
}

// ── Projects ─────────────────────────────────────────────────────────────────

function ProjectsPanel() {
  const cv = useCvStore((s) => s.cv) // browser CV for the import shortcut
  const portfolio = usePortfolioStore((s) => s.portfolio)
  const patch = usePortfolioStore((s) => s.patchPortfolio)
  const addProject = usePortfolioStore((s) => s.addProject)
  const updateProject = usePortfolioStore((s) => s.updateProject)
  const removeProject = usePortfolioStore((s) => s.removeProject)
  const moveProject = usePortfolioStore((s) => s.moveProject)

  const pickImage = async (id: string, file: File | undefined) => {
    if (!file) return
    if (!file.type.startsWith('image/')) return toast.error('Please choose an image file')
    if (file.size > 10 * 1024 * 1024) return toast.error('Image too large — pick one under 10MB')
    try {
      updateProject(id, { image: await compressImage(file, 900, 0.8) })
      toast.success('Image added')
    } catch {
      toast.error('Could not read that image')
    }
  }

  const importFromBrowserCv = () => {
    const usable = cv.projects.filter((p) => p.name.trim())
    if (usable.length === 0) return toast.error('No CV projects found in this browser — add them in the CV builder first')
    let added = 0
    const existing = new Set(portfolio.projects.map((p) => p.title))
    for (const p of usable) {
      if (existing.has(p.name)) continue
      patch({ projects: [...portfolio.projects, { id: `${Date.now()}-${added}`, title: p.name, description: p.description, image: '', url: p.liveUrl, repoUrl: p.repoUrl, tags: p.tech }] })
      added++
    }
    if (added) toast.success(`${added} project${added > 1 ? 's' : ''} imported from your CV — add cover images!`)
    else toast.info('Your portfolio already has all the projects from this browser CV')
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1.5">
        <Button variant="outline" size="sm" className="h-8 gap-1 text-xs" onClick={importFromBrowserCv}>
          <Wand2 className="h-3.5 w-3.5" /> Import from CV
        </Button>
        <Button variant="outline" size="sm" className="h-8 gap-1 text-xs" onClick={() => addProject()}>
          <Plus className="h-3.5 w-3.5" /> Add project
        </Button>
      </div>

      {portfolio.projects.length === 0 && (
        <p className="rounded-lg border border-dashed border-slate-200 px-3 py-4 text-center text-xs text-slate-400">
          No projects yet — import from your CV or add one. Projects are the heart of a portfolio.
        </p>
      )}

      {portfolio.projects.map((p, i) => (
        <div key={p.id} className="space-y-2.5 rounded-xl border border-slate-200 bg-white p-3">
          <div className="flex items-start gap-3">
            <label className="group relative shrink-0 cursor-pointer">
              <div className="flex h-20 w-28 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                {p.image ? <img src={p.image} alt={p.title || 'Project'} className="h-full w-full object-cover" /> : <ImageIcon className="h-6 w-6 text-slate-300" />}
              </div>
              <span className="absolute inset-0 hidden items-center justify-center rounded-lg bg-black/40 text-[10px] font-semibold text-white group-hover:flex">
                {p.image ? 'Change' : 'Upload'}
              </span>
              <input type="file" accept="image/*" className="hidden" onChange={(e) => pickImage(p.id, e.target.files?.[0])} />
            </label>
            <div className="flex min-w-0 flex-1 flex-col">
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <Field label={`Project ${i + 1}`} value={p.title} onChange={(v) => updateProject(p.id, { title: v })} placeholder="GrowthLens dashboard" />
                </div>
                <div className="flex flex-col">
                  <button className="text-slate-300 hover:text-violet-600 disabled:opacity-30" disabled={i === 0} onClick={() => moveProject(p.id, -1)} tabIndex={-1}>
                    <ChevronUp className="h-3.5 w-3.5" />
                  </button>
                  <button className="text-slate-300 hover:text-violet-600 disabled:opacity-30" disabled={i === portfolio.projects.length - 1} onClick={() => moveProject(p.id, 1)} tabIndex={-1}>
                    <ChevronDown className="h-3.5 w-3.5" />
                  </button>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400 hover:text-red-600" onClick={() => removeProject(p.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <Field label="Description" value={p.description} onChange={(v) => updateProject(p.id, { description: v })} placeholder="One or two sentences" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <Field label="Live link" value={p.url} onChange={(v) => updateProject(p.id, { url: v })} placeholder="project.com" />
            <Field label="Code link" value={p.repoUrl} onChange={(v) => updateProject(p.id, { repoUrl: v })} placeholder="github.com/…" />
            <Field label="Tags" value={p.tags} onChange={(v) => updateProject(p.id, { tags: v })} placeholder="React · Design" />
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Testimonials ─────────────────────────────────────────────────────────────

function TestimonialsPanel() {
  const portfolio = usePortfolioStore((s) => s.portfolio)
  const patch = usePortfolioStore((s) => s.patchPortfolio)
  const move = (id: string, dir: -1 | 1) => {
    const arr = [...portfolio.testimonials]
    const i = arr.findIndex((x) => x.id === id)
    const j = i + dir
    if (i < 0 || j < 0 || j >= arr.length) return
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
    patch({ testimonials: arr })
  }
  return (
    <div className="space-y-3">
      <Button variant="outline" size="sm" className="h-8 gap-1 text-xs" onClick={() => patch({ testimonials: [...portfolio.testimonials, { id: `${Date.now()}-t`, quote: '', author: '', role: '' }] })}>
        <Plus className="h-3.5 w-3.5" /> Add testimonial
      </Button>
      {portfolio.testimonials.length === 0 && (
        <p className="rounded-lg border border-dashed border-slate-200 px-3 py-4 text-center text-xs text-slate-400">
          Short recommendations from bosses, clients or colleagues.
        </p>
      )}
      {portfolio.testimonials.map((t, i) => (
        <div key={t.id} className="space-y-2 rounded-xl border border-slate-200 bg-white p-3">
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <Field label={`Quote ${i + 1}`} value={t.quote} onChange={(v) => patch({ testimonials: portfolio.testimonials.map((x) => (x.id === t.id ? { ...x, quote: v } : x)) })} placeholder="Ada delivered beyond every expectation…" />
            </div>
            <div className="flex flex-col">
              <button className="text-slate-300 hover:text-violet-600 disabled:opacity-30" disabled={i === 0} onClick={() => move(t.id, -1)} tabIndex={-1}><ChevronUp className="h-3.5 w-3.5" /></button>
              <button className="text-slate-300 hover:text-violet-600 disabled:opacity-30" disabled={i === portfolio.testimonials.length - 1} onClick={() => move(t.id, 1)} tabIndex={-1}><ChevronDown className="h-3.5 w-3.5" /></button>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400 hover:text-red-600" onClick={() => patch({ testimonials: portfolio.testimonials.filter((x) => x.id !== t.id) })}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Field label="Who said it" value={t.author} onChange={(v) => patch({ testimonials: portfolio.testimonials.map((x) => (x.id === t.id ? { ...x, author: v } : x)) })} placeholder="Mrs. Bello" />
            <Field label="Their role" value={t.role} onChange={(v) => patch({ testimonials: portfolio.testimonials.map((x) => (x.id === t.id ? { ...x, role: v } : x)) })} placeholder="Manager, Acme Ltd" />
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Gallery ──────────────────────────────────────────────────────────────────

function GalleryPanel() {
  const portfolio = usePortfolioStore((s) => s.portfolio)
  const patch = usePortfolioStore((s) => s.patchPortfolio)
  const move = (id: string, dir: -1 | 1) => {
    const arr = [...portfolio.gallery]
    const i = arr.findIndex((x) => x.id === id)
    const j = i + dir
    if (i < 0 || j < 0 || j >= arr.length) return
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
    patch({ gallery: arr })
  }
  const pickImage = async (id: string, file: File | undefined) => {
    if (!file) return
    if (!file.type.startsWith('image/')) return toast.error('Please choose an image file')
    if (file.size > 10 * 1024 * 1024) return toast.error('Image too large — pick one under 10MB')
    try {
      const small = await compressImage(file, 900, 0.8)
      patch({ gallery: portfolio.gallery.map((g) => (g.id === id ? { ...g, image: small } : g)) })
      toast.success('Image added')
    } catch {
      toast.error('Could not read that image')
    }
  }
  return (
    <div className="space-y-3">
      <Button variant="outline" size="sm" className="h-8 gap-1 text-xs" onClick={() => patch({ gallery: [...portfolio.gallery, { id: `${Date.now()}-g`, image: '', caption: '' }] })}>
        <Plus className="h-3.5 w-3.5" /> Add image
      </Button>
      {portfolio.gallery.length === 0 && (
        <p className="rounded-lg border border-dashed border-slate-200 px-3 py-4 text-center text-xs text-slate-400">
          Visual showcase — designs, certificates, event photos, anything that proves your work.
        </p>
      )}
      {portfolio.gallery.map((g, i) => (
        <div key={g.id} className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-3">
          <label className="group relative shrink-0 cursor-pointer">
            <div className="flex h-20 w-28 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
              {g.image ? <img src={g.image} alt={g.caption || 'Gallery'} className="h-full w-full object-cover" /> : <ImageIcon className="h-6 w-6 text-slate-300" />}
            </div>
            <span className="absolute inset-0 hidden items-center justify-center rounded-lg bg-black/40 text-[10px] font-semibold text-white group-hover:flex">{g.image ? 'Change' : 'Upload'}</span>
            <input type="file" accept="image/*" className="hidden" onChange={(e) => pickImage(g.id, e.target.files?.[0])} />
          </label>
          <div className="flex min-w-0 flex-1 items-end gap-2">
            <div className="flex-1">
              <Field label={`Caption ${i + 1}`} value={g.caption} onChange={(v) => patch({ gallery: portfolio.gallery.map((x) => (x.id === g.id ? { ...x, caption: v } : x)) })} placeholder="Brand identity for Kudi Café" />
            </div>
            <div className="flex flex-col">
              <button className="text-slate-300 hover:text-violet-600 disabled:opacity-30" disabled={i === 0} onClick={() => move(g.id, -1)} tabIndex={-1}><ChevronUp className="h-3.5 w-3.5" /></button>
              <button className="text-slate-300 hover:text-violet-600 disabled:opacity-30" disabled={i === portfolio.gallery.length - 1} onClick={() => move(g.id, 1)} tabIndex={-1}><ChevronDown className="h-3.5 w-3.5" /></button>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400 hover:text-red-600" onClick={() => patch({ gallery: portfolio.gallery.filter((x) => x.id !== g.id) })}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}

// ── CV-sourced sections (experience / education / skills) ────────────────────

function CvSectionNote({ section }: { section: 'experience' | 'education' | 'skills' }) {
  const cv = usePortfolioStore((s) => s.cv)
  const count = section === 'experience' ? cv.experience.length : section === 'education' ? cv.education.length : cv.skills.length
  const label = section === 'experience' ? 'work experiences' : section === 'education' ? 'education entries' : 'skills'
  return (
    <div className="space-y-3">
      <div className="flex items-start gap-2.5 rounded-xl border border-sky-200 bg-sky-50 px-3 py-2.5 text-[11.5px] leading-relaxed text-sky-900">
        <RefreshCw className="mt-0.5 h-3.5 w-3.5 shrink-0 text-sky-500" />
        <div>
          <p>
            This section pulls straight from the CV you started from — currently <b>{count} {label}</b>. No double typing.
          </p>
          <p className="mt-1">To change it, update your CV and start a fresh portfolio from it, or edit entries in the CV builder.</p>
        </div>
      </div>
      <Link href="/build" target="_blank" className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 px-3 text-xs font-medium text-slate-600 hover:bg-slate-50">
        <PenLine className="h-3.5 w-3.5" /> Open CV builder
      </Link>
    </div>
  )
}

// ── switch ───────────────────────────────────────────────────────────────────

export function ContentPanel({ section }: { section: PortfolioSectionKey }) {
  switch (section) {
    case 'about': return <AboutPanel />
    case 'projects': return <ProjectsPanel />
    case 'experience': return <CvSectionNote section="experience" />
    case 'education': return <CvSectionNote section="education" />
    case 'skills': return <CvSectionNote section="skills" />
    case 'testimonials': return <TestimonialsPanel />
    case 'gallery': return <GalleryPanel />
    case 'contact': return <HeroPanel />
    default: return null
  }
}

export const SECTION_META: Record<PortfolioSectionKey, { label: string; hint: string }> = {
  about: { label: 'Hero & About', hint: 'Name, tagline and your story' },
  projects: { label: 'Projects', hint: 'The heart of your portfolio' },
  experience: { label: 'Experience', hint: 'Pulled from your CV' },
  education: { label: 'Education', hint: 'Pulled from your CV' },
  skills: { label: 'Skills', hint: 'Pulled from your CV' },
  testimonials: { label: 'Testimonials', hint: 'Kind words from others' },
  gallery: { label: 'Gallery', hint: 'Visual proof of your work' },
  contact: { label: 'Contact', hint: 'Email, phone and socials' },
}
