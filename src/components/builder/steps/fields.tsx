'use client'

import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Sparkles, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { callAi, AiUnavailableError } from '@/lib/cv/ai-client'
import { toast } from 'sonner'

export function Field({ label, value, onChange, placeholder, type = 'text' }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-slate-600">{label}</Label>
      <Input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
    </div>
  )
}

export function AreaField({ label, value, onChange, placeholder, rows = 3, hint }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; rows?: number; hint?: string }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-slate-600">{label}</Label>
      <Textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={rows} />
      {hint && <p className="text-[11px] text-slate-400">{hint}</p>}
    </div>
  )
}

export function LevelSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="h-9">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {['Native', 'Fluent', 'Professional', 'Conversational', 'Basic'].map((l) => (
          <SelectItem key={l} value={l}>
            {l}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

/** Sparkles button that runs an AI task with shared error handling */
export function AiRunButton({
  task,
  payload,
  onDone,
  label,
  size = 'sm',
}: {
  task: string
  payload: Record<string, unknown>
  onDone: (result: unknown) => void
  label: string
  size?: 'sm' | 'xs'
}) {
  const [busy, setBusy] = useState(false)
  const run = async () => {
    setBusy(true)
    try {
      const r = await callAi<unknown>(task, payload)
      onDone(r)
    } catch (err) {
      if (err instanceof AiUnavailableError) toast.error('AI is not available here — you can still write everything by hand ✍️')
      else toast.error(err instanceof Error ? err.message : 'AI request failed')
    } finally {
      setBusy(false)
    }
  }
  return (
    <Button type="button" variant="outline" size="sm" className={`gap-1.5 border-violet-200 text-violet-700 hover:bg-violet-50 hover:text-violet-800 ${size === 'xs' ? 'h-6 px-2 text-[11px]' : 'h-7 text-xs'}`} onClick={run} disabled={busy}>
      {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
      {busy ? 'Thinking…' : label}
    </Button>
  )
}
