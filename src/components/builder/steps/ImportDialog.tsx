'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useCvStore } from '@/lib/cv/store'
import { normalizeCv, type CvData } from '@/lib/cv/types'
import { FileUp, Loader2, Sparkles, Upload } from 'lucide-react'
import { toast } from 'sonner'

interface ImportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

/** Extract raw text from a PDF client-side (pdfjs), then let AI structure it */
async function extractPdfText(file: File): Promise<string> {
  const pdfjs = await import('pdfjs-dist')
  pdfjs.GlobalWorkerOptions.workerSrc = '/pdf/pdf.worker.min.mjs'
  const buf = await file.arrayBuffer()
  const doc = await pdfjs.getDocument({ data: new Uint8Array(buf) }).promise
  const pages = Math.min(doc.numPages, 8)
  let text = ''
  for (let i = 1; i <= pages; i++) {
    const page = await doc.getPage(i)
    const content = await page.getTextContent()
    for (const item of content.items) {
      if ('str' in item) text += item.str + (item.hasEOL ? '\n' : ' ')
    }
    text += '\n'
  }
  return text.trim()
}

export function ImportDialog({ open, onOpenChange }: ImportDialogProps) {
  const importCv = useCvStore((s) => s.importCv)
  const [busy, setBusy] = useState(false)
  const [dragOver, setDragOver] = useState(false)

  const handleFile = async (file: File | undefined) => {
    if (!file) return
    if (!file.name.toLowerCase().endsWith('.pdf')) return toast.error('Please choose a PDF file')
    if (file.size > 15 * 1024 * 1024) return toast.error('PDF too large — keep it under 15MB')
    setBusy(true)
    try {
      const text = await extractPdfText(file)
      if (text.length < 40) {
        toast.error('Could not read enough text from that PDF — it may be a scan. Try a text-based CV.')
        return
      }
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task: 'parse-cv', payload: { text } }),
      })
      const j = (await res.json()) as { result?: unknown; error?: string }
      if (!res.ok) {
        toast.error(
          res.status === 501
            ? 'AI import is not switched on for this site — you can still fill the steps manually (it takes ~10 minutes).'
            : j.error || 'Could not import that CV',
        )
        return
      }
      const parsed = normalizeCv(j.result)
      if (!parsed.contact.fullName) {
        toast.error('The AI could not find a name in that CV — try another file or fill manually')
        return
      }
      importCv(parsed as CvData)
      toast.success(`Imported ${parsed.contact.fullName}'s CV — check each step and polish with AI`)
      onOpenChange(false)
    } catch (err) {
      toast.error(err instanceof Error && err.message.includes('AI') ? err.message : 'Import failed — try a different PDF')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !busy && onOpenChange(o)}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-violet-500" /> Import an existing CV
          </DialogTitle>
          <DialogDescription>
            Upload your old PDF — AI reads it and fills every step. You keep full control: review, edit and polish afterwards.
          </DialogDescription>
        </DialogHeader>

        <label
          onDragOver={(e) => {
            e.preventDefault()
            setDragOver(true)
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault()
            setDragOver(false)
            if (!busy) void handleFile(e.dataTransfer.files?.[0])
          }}
          className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors ${
            dragOver ? 'border-violet-400 bg-violet-50' : 'border-slate-200 hover:border-violet-300 hover:bg-slate-50'
          }`}
        >
          {busy ? (
            <>
              <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
              <span className="text-sm font-medium text-slate-600">Reading your CV…</span>
              <span className="text-[11px] text-slate-400">usually 5–15 seconds</span>
            </>
          ) : (
            <>
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-violet-50 text-violet-500">
                <FileUp className="h-6 w-6" />
              </span>
              <span className="text-sm font-semibold text-slate-700">Drop your CV here or click to browse</span>
              <span className="text-[11px] text-slate-400">PDF only · max 15MB · stays on your device except the AI read</span>
            </>
          )}
          <input type="file" accept="application/pdf,.pdf" className="hidden" disabled={busy} onChange={(e) => handleFile(e.target.files?.[0])} />
        </label>

        <p className="text-[11px] leading-relaxed text-slate-400">
          Text-based PDFs work best (not scans). Nothing is stored on our servers — the extracted text is only sent to the AI to structure it, then thrown away.
        </p>

        <div className="flex justify-end">
          <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)} disabled={busy} className="gap-1.5 text-xs">
            <Upload className="h-3.5 w-3.5" /> I&apos;ll fill manually instead
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
