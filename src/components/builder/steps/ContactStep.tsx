'use client'

import { useCvStore } from '@/lib/cv/store'
import { Field } from './fields'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Upload, Trash2, Link2, Plus } from 'lucide-react'
import { useRef, useState } from 'react'
import { compressPhoto } from '@/lib/cv/export'
import { toast } from 'sonner'
import { initialsOf } from '@/components/cv/templates/shared'
import { LINK_KINDS, type LinkKind } from '@/lib/cv/types'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function ContactStep() {
  const contact = useCvStore((s) => s.cv.contact)
  const setContactField = useCvStore((s) => s.setContactField)
  const addLink = useCvStore((s) => s.addLink)
  const updateLink = useCvStore((s) => s.updateLink)
  const removeLink = useCvStore((s) => s.removeLink)
  const photoData = useCvStore((s) => s.photoData)
  const setPhoto = useCvStore((s) => s.setPhoto)
  const showPhoto = useCvStore((s) => s.design.showPhoto)
  const fileRef = useRef<HTMLInputElement>(null)
  const [pickerOpen, setPickerOpen] = useState(false)

  const onPick = async (file: File | undefined) => {
    if (!file) return
    if (!file.type.startsWith('image/')) return toast.error('Please choose an image file')
    if (file.size > 8 * 1024 * 1024) return toast.error('Image too large — pick one under 8MB')
    try {
      const small = await compressPhoto(file)
      setPhoto(small)
      toast.success('Photo added — it will be compressed and stored safely')
    } catch {
      toast.error('Could not read that image')
    }
  }

  const addAndFocus = (kind: LinkKind) => {
    addLink(kind)
    setPickerOpen(false)
  }

  const kindLabel = (kind: string, label: string) => LINK_KINDS.find((k) => k.kind === kind)?.label || label || 'Link'

  return (
    <div className="space-y-5">
      {/* Photo */}
      <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
        <div className="h-20 w-20 rounded-full overflow-hidden bg-white border-2 border-violet-200 flex items-center justify-center shrink-0">
          {photoData ? (
            <img src={photoData} alt="Profile" className="h-full w-full object-cover" />
          ) : (
            <span className="text-lg font-bold text-violet-600">{contact.fullName ? initialsOf(contact.fullName) : 'CV'}</span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <Label className="text-sm font-medium text-slate-800">Profile photo</Label>
          <p className="text-[11px] text-slate-500 mb-2">Optional. We shrink it to ~40KB so it saves safely in your browser.</p>
          <div className="flex gap-2">
            <Button type="button" variant="outline" size="sm" className="h-7 text-xs gap-1.5" onClick={() => fileRef.current?.click()}>
              <Upload className="h-3.5 w-3.5" /> {photoData ? 'Replace' : 'Upload photo'}
            </Button>
            {photoData && (
              <Button type="button" variant="ghost" size="sm" className="h-7 text-xs text-red-500 hover:text-red-600 gap-1" onClick={() => setPhoto('')}>
                <Trash2 className="h-3.5 w-3.5" /> Remove
              </Button>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => onPick(e.target.files?.[0])} />
        </div>
        <div className="hidden sm:flex flex-col items-end gap-1">
          <Label htmlFor="photo-in-templates" className="text-[11px] text-slate-500">Use in templates</Label>
          <Switch id="photo-in-templates" checked={showPhoto} onCheckedChange={() => {}} disabled className="opacity-50" />
          <span className="text-[10px] text-slate-400">toggle in step 1</span>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Full name *" value={contact.fullName} onChange={(v) => setContactField('fullName', v)} placeholder="Sarah Mitchell" />
        <Field label="Job title" value={contact.jobTitle} onChange={(v) => setContactField('jobTitle', v)} placeholder="Senior Marketing Manager" />
        <Field label="Email *" value={contact.email} onChange={(v) => setContactField('email', v)} placeholder="you@email.com" type="email" />
        <Field label="Phone *" value={contact.phone} onChange={(v) => setContactField('phone', v)} placeholder="+44 7700 900123" />
        <Field label="Location" value={contact.location} onChange={(v) => setContactField('location', v)} placeholder="London, United Kingdom" />
        <Field label="LinkedIn" value={contact.linkedin} onChange={(v) => setContactField('linkedin', v)} placeholder="linkedin.com/in/you" />
        <Field label="Website / portfolio" value={contact.website} onChange={(v) => setContactField('website', v)} placeholder="yoursite.com" />
      </div>

      {/* Flexible links — GitHub, X, Instagram, YouTube... */}
      <div className="rounded-xl border border-slate-200 p-4 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
              <Link2 className="h-4 w-4 text-violet-500" /> More links
            </h3>
            <p className="text-[11px] text-slate-500">GitHub, X, Instagram, YouTube, Dribbble — anything a recruiter should see. All optional.</p>
          </div>
          <DropdownMenu open={pickerOpen} onOpenChange={setPickerOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 gap-1 shrink-0">
                <Plus className="h-3.5 w-3.5" /> Add a link
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="max-h-72 overflow-y-auto">
              {LINK_KINDS.map((k) => (
                <DropdownMenuItem key={k.kind} onClick={() => addAndFocus(k.kind)} className="text-xs">
                  {k.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {contact.links.length === 0 && (
          <p className="text-xs text-slate-400 rounded-lg border border-dashed border-slate-200 px-3 py-3 text-center">
            No extra links yet — GitHub is a must for developers, Dribbble for designers.
          </p>
        )}

        {contact.links.map((l) => {
          const meta = LINK_KINDS.find((k) => k.kind === l.kind)
          return (
            <div key={l.id} className="grid grid-cols-[110px_1fr_auto] sm:grid-cols-[130px_1fr_auto] gap-2 items-end">
              {l.kind === 'custom' ? (
                <Field label="Label" value={l.label} onChange={(v) => updateLink(l.id, { label: v })} placeholder="Blog" />
              ) : (
                <div className="pb-1.5">
                  <span className="block text-[11px] font-medium text-slate-400 uppercase tracking-wide">{meta?.label}</span>
                </div>
              )}
              <Field
                label={l.kind === 'custom' ? 'URL' : ' '}
                value={l.url}
                onChange={(v) => updateLink(l.id, { url: v })}
                placeholder={meta?.placeholder || 'yoursite.com'}
              />
              <div className="flex items-center pb-1">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400 hover:text-red-600" onClick={() => removeLink(l.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )
        })}
      </div>

      <p className="text-[11px] text-slate-400">* Recommended — recruiters and ATS systems look for these first.</p>
    </div>
  )
}
