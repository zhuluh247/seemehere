'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useCvStore } from '@/lib/cv/store'
import { useAuthStore } from '@/lib/cv/auth-store'
import { exportPdf, exportPng, exportDocx, exportTxt } from '@/lib/cv/export'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { LoginModal } from '@/components/auth/LoginModal'
import { ShareRow } from '@/components/share/ShareRow'
import { QRCodeSVG } from 'qrcode.react'
import { FileText, FileImage, FileType2, FileType, Globe, Copy, Download, Loader2, ExternalLink, RefreshCw, Check, Eye, QrCode, Wand2, ArrowRight } from 'lucide-react'
import { toast } from 'sonner'

interface CheckResp {
  available: boolean
  reason: string
  suggestions: string[]
}

export function ExportStep() {
  const cv = useCvStore((s) => s.cv)
  const design = useCvStore((s) => s.design)
  const photoData = useCvStore((s) => s.photoData)
  const portfolio = useCvStore((s) => s.portfolio)
  const publishInfo = useCvStore((s) => s.publishInfo)
  const setPublishInfo = useCvStore((s) => s.setPublishInfo)

  const user = useAuthStore((s) => s.user)

  const [username, setUsername] = useState(publishInfo?.username ?? user?.username ?? '')
  const [check, setCheck] = useState<CheckResp | null>(null)
  const [checking, setChecking] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [success, setSuccess] = useState<{ username: string; url: string; updated: boolean } | null>(null)
  const [busyExport, setBusyExport] = useState('')
  const [origin, setOrigin] = useState('')
  const [loginOpen, setLoginOpen] = useState(false)
  const [views, setViews] = useState<number | null>(null)
  const [qrOpen, setQrOpen] = useState(false)

  useEffect(() => setOrigin(window.location.origin), [])

  // Default the username to the account handle when signing in
  useEffect(() => {
    if (user?.username && !publishInfo) setUsername((u) => u || user.username)
  }, [user, publishInfo])

  // Debounced username availability check
  useEffect(() => {
    if (publishInfo) return
    const u = username.trim().toLowerCase()
    if (!u) return setCheck(null)
    setChecking(true)
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/check-username?u=${encodeURIComponent(u)}`)
        setCheck((await res.json()) as CheckResp)
      } catch {
        setCheck(null)
      } finally {
        setChecking(false)
      }
    }, 450)
    return () => clearTimeout(t)
  }, [username, publishInfo])

  // Private view counter for the published page
  useEffect(() => {
    if (!publishInfo?.username) return setViews(null)
    fetch(`/api/cv/${publishInfo.username}?stats=1`)
      .then((r) => (r.ok ? r.json() : null))
      .then((j: { viewCount?: number } | null) => setViews(typeof j?.viewCount === 'number' ? j.viewCount : null))
      .catch(() => {})
  }, [publishInfo, success])

  const hasContent = cv.contact.fullName.trim().length > 0

  const runExport = async (kind: 'png' | 'docx') => {
    if (!hasContent) return toast.error('Add at least your name first — go back to Contact')
    setBusyExport(kind)
    try {
      if (kind === 'png') await exportPng(cv.contact.fullName)
      else await exportDocx(cv, design.theme, cv.contact.fullName)
      toast.success(kind === 'png' ? 'PNG downloaded' : 'Word file downloaded')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Export failed')
    } finally {
      setBusyExport('')
    }
  }

  const publish = async () => {
    const u = username.trim().toLowerCase()
    if (!hasContent) return toast.error('Add at least your name first')
    // Updating an already-published page: no availability gate needed — the
    // server verifies ownership (account match or secret update token).
    // The availability check only applies to brand-new link names.
    if (!publishInfo && (!check || !check.available)) return toast.error(check?.reason || 'Pick an available username')
    setPublishing(true)
    try {
      const res = await fetch('/api/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: u,
          kind: 'cv', // R6 split — the CV builder only ever publishes paper CVs
          claimKey: publishInfo?.updateToken || publishInfo?.claimKey || undefined, // proof of ownership
          displayName: cv.contact.fullName || 'My CV',
          templateId: design.templateId,
          theme: design.theme,
          cv,
          photoData: design.showPhoto ? photoData : '',
          // R6: portfolio websites live in the dedicated Portfolio Builder now.
          // Sending an explicitly disabled spec keeps old portfolio-enabled
          // localStorage data from flipping a republished CV back into a website.
          portfolio: { ...portfolio, enabled: false },
        }),
      })
      const j = (await res.json()) as { url?: string; error?: string; code?: string; updated?: boolean; updateToken?: string }
      if (!res.ok) {
        if (res.status === 409 && j.code === 'username_taken' && publishInfo) {
          toast.error('This link belongs to another browser or account. Sign in with the account that published it, or pick a new link name.')
        } else if (j.error) {
          toast.error(j.error)
        }
        return
      }
      setPublishInfo({
        username: u,
        claimKey: publishInfo?.claimKey || '',
        updateToken: j.updateToken || publishInfo?.updateToken || '',
        publishedAt: publishInfo?.publishedAt || new Date().toISOString(),
      })
      setSuccess({ username: u, url: `${origin}${j.url || `/cv/${u}`}`, updated: !!j.updated })
    } catch {
      toast.error('Could not reach the server — try again')
    } finally {
      setPublishing(false)
    }
  }

  const copy = async (text: string, what: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success(`${what} copied`)
    } catch {
      toast.error('Copy failed — select and copy manually')
    }
  }

  const dl = (label: string, icon: React.ReactNode, hint: string, onClick: () => void, busy = false) => (
    <button
      onClick={onClick}
      disabled={busy}
      className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3.5 text-left transition-all hover:-translate-y-0.5 hover:border-violet-300 hover:shadow-md disabled:opacity-60"
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-50 text-violet-600 group-hover:bg-violet-100">{icon}</span>
      <span className="flex-1 min-w-0">
        <span className="block text-sm font-semibold text-slate-800">{label}</span>
        <span className="block text-[11px] text-slate-500 truncate">{hint}</span>
      </span>
      {busy ? <Loader2 className="h-4 w-4 animate-spin text-violet-500" /> : <Download className="h-4 w-4 text-slate-300 group-hover:text-violet-500" />}
    </button>
  )

  const publishedUrl = publishInfo ? `${origin}/cv/${publishInfo.username}` : ''

  return (
    <div className="space-y-6">
      {/* Downloads */}
      <div>
        <h3 className="text-sm font-semibold text-slate-800 mb-3">Download your CV</h3>
        <div className="grid sm:grid-cols-2 gap-3">
          {dl('PDF — the one to send out', <FileText className="h-5 w-5" />, 'Print dialog → choose "Save as PDF"', () => exportPdf(cv.contact.fullName))}
          {dl('PNG image', <FileImage className="h-5 w-5" />, 'For LinkedIn previews & portfolios', () => runExport('png'), busyExport === 'png')}
          {dl('Word document', <FileType2 className="h-5 w-5" />, 'Editable .docx, clean universal layout', () => runExport('docx'), busyExport === 'docx')}
          {dl('Plain text', <FileType className="h-5 w-5" />, 'For portals that mangle PDFs', () => { if (hasContent) exportTxt(cv, cv.contact.fullName); else toast.error('Add at least your name first') })}
        </div>
      </div>

      {/* Portfolio website — now its own product (R6): teaser + hand-off */}
      <div className="flex items-start gap-3 rounded-xl border border-violet-200 bg-gradient-to-r from-violet-50 to-indigo-50 p-4">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-violet-600 text-white"><Wand2 className="h-5 w-5" /></span>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-slate-800">Want a full portfolio website?</h3>
          <p className="mt-1 text-xs leading-relaxed text-slate-600">
            Websites now live in their own builder — 6 GenZ styles (Aura, Riot, Editorial, Terminal, Bento, Vogue), project galleries, testimonials and your own link. It imports this CV in one tap.
          </p>
          <Button asChild size="sm" className="mt-3 h-8 gap-1.5 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 text-xs text-white">
            <Link href="/portfolio">Open the Portfolio Builder <ArrowRight className="h-3.5 w-3.5" /></Link>
          </Button>
        </div>
      </div>

      {/* Publish / share */}
      <div className="rounded-xl border border-slate-200 p-4 space-y-4">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600"><Globe className="h-5 w-5" /></span>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-slate-800">Publish &amp; get your personal link</h3>
            <p className="text-[11px] text-slate-500">
              Your CV goes live <b>instantly</b> at <b>seemehere…/cv/yourname</b> — free, no account needed, no ads on your page. (Portfolio websites are published from their own builder.)
            </p>
          </div>
        </div>

        {!publishInfo ? (
          <>
            <div className="space-y-2">
              <Label className="text-xs font-medium text-slate-600">Pick your link name</Label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 whitespace-nowrap">…/cv/</span>
                <Input value={username} onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))} placeholder={user?.username || 'miketyson'} className="flex-1" />
                {checking && <Loader2 className="h-4 w-4 animate-spin text-slate-300" />}
              </div>
              {check && (
                <div className="text-xs">
                  {check.available ? (
                    <span className="inline-flex items-center gap-1 text-emerald-600 font-medium"><Check className="h-3.5 w-3.5" />{username.toLowerCase()} is available — grab it!</span>
                  ) : (
                    <div className="space-y-1.5">
                      <span className="text-amber-700">{check.reason}</span>
                      {check.suggestions.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-slate-400">Try:</span>
                          {check.suggestions.map((s) => (
                            <button key={s} onClick={() => setUsername(s)} className="rounded-full border border-violet-200 bg-violet-50 px-2.5 py-0.5 text-[11px] font-medium text-violet-700 hover:bg-violet-100">
                              {s}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            <Button onClick={publish} disabled={publishing || !username.trim() || !check?.available || checking} className="w-full gap-2">
              {publishing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Globe className="h-4 w-4" />}
              {publishing ? 'Publishing…' : 'Publish & copy my link'}
            </Button>

            <p className="text-[11px] text-slate-500 text-center leading-relaxed">
              {user ? (
                <>Signed in — your page is saved to your account and you can edit &amp; republish it anytime.</>
              ) : (
                <>
                  No account needed — your link works immediately. Want to edit this page later?{' '}
                  <button className="font-semibold text-violet-600 underline" onClick={() => setLoginOpen(true)}>
                    Create a free account
                  </button>{' '}(optional — username + password, no email).
                </>
              )}
            </p>
          </>
        ) : (
          <div className="space-y-3">
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 flex items-center gap-2">
              <code className="text-xs font-semibold text-indigo-700 flex-1 truncate">{publishedUrl}</code>
              <Button variant="ghost" size="icon" className="h-7 w-7" title="Copy link" onClick={() => copy(publishedUrl, 'Link')}>
                <Copy className="h-3.5 w-3.5" />
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7" title="QR code" onClick={() => setQrOpen(true)}>
                <QrCode className="h-3.5 w-3.5" />
              </Button>
              <a href={`/cv/${publishInfo.username}`} target="_blank" rel="noopener noreferrer" className="inline-flex h-7 w-7 items-center justify-center rounded-md hover:bg-slate-200 text-slate-500" title="Open">
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
              {views !== null && (
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 border border-slate-200 px-2.5 py-1">
                  <Eye className="h-3.5 w-3.5 text-violet-500" /> {views} view{views === 1 ? '' : 's'} — only you can see this
                </span>
              )}
              {user ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-emerald-700 font-medium">
                  <Check className="h-3.5 w-3.5" /> Saved to your account — edit &amp; republish anytime
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 border border-slate-200 px-2.5 py-1 text-slate-600">
                  Optional: create an account later to edit this page
                </span>
              )}
            </div>

            <Button onClick={publish} disabled={publishing} variant="outline" className="w-full gap-2">
              {publishing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              {publishing ? 'Updating…' : 'Update published page with my latest edits'}
            </Button>

            {/* One-tap share — free growth loop */}
            {publishedUrl && (
              <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                <span className="text-[11px] font-medium text-slate-400">Share your page:</span>
                <ShareRow url={publishedUrl} />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Success dialog */}
      <Dialog open={!!success} onOpenChange={(open) => !open && setSuccess(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-600"><Globe className="h-4 w-4" /></span>
              {success?.updated ? 'Page updated!' : 'You are live! 🎉'}
            </DialogTitle>
            <DialogDescription>Your personal link is ready — share it anywhere.</DialogDescription>
          </DialogHeader>
          {success && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 p-2.5">
                <code className="text-xs font-semibold text-indigo-700 flex-1 truncate">{success.url}</code>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => copy(success.url, 'Link')}>
                  <Copy className="h-3.5 w-3.5" />
                </Button>
              </div>
              <div className="flex items-center justify-center rounded-xl border border-slate-200 bg-white p-3">
                <div className="text-center">
                  <QRCodeSVG value={success.url} size={128} level="M" fgColor="#312e81" />
                  <p className="mt-2 text-[10px] text-slate-400">Scan to open on a phone</p>
                </div>
              </div>
              {!user && (
                <p className="rounded-lg bg-slate-50 border border-slate-200 px-3 py-2 text-[11px] text-slate-600">
                  Tip: sign up later and you can edit this page anytime —{' '}
                  <button className="font-bold underline" onClick={() => setLoginOpen(true)}>create a free account</button> (optional).
                </p>
              )}
              <div className="flex flex-wrap items-center justify-center gap-2">
                <span className="text-[11px] font-medium text-slate-400">Tell people:</span>
                <ShareRow url={success.url} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button className="w-full" onClick={() => setSuccess(null)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* QR dialog */}
      <Dialog open={qrOpen} onOpenChange={setQrOpen}>
        <DialogContent className="sm:max-w-xs">
          <DialogHeader>
            <DialogTitle>QR code to your page</DialogTitle>
            <DialogDescription>Print it on a business card or CV header.</DialogDescription>
          </DialogHeader>
          <div className="flex justify-center rounded-xl border border-slate-200 bg-white p-4">
            {publishedUrl && <QRCodeSVG id="smh-qr" value={publishedUrl} size={192} level="M" fgColor="#1e1b4b" />}
          </div>
          <DialogFooter>
            <Button
              className="w-full gap-2"
              onClick={() => {
                const svg = document.querySelector('#smh-qr') as SVGSVGElement | null
                if (!svg) return
                const xml = new XMLSerializer().serializeToString(svg)
                const img = new Image()
                img.onload = () => {
                  const canvas = document.createElement('canvas')
                  canvas.width = 512
                  canvas.height = 512
                  const ctx = canvas.getContext('2d')
                  if (!ctx) return
                  ctx.fillStyle = '#ffffff'
                  ctx.fillRect(0, 0, 512, 512)
                  ctx.drawImage(img, 32, 32, 448, 448)
                  const a = document.createElement('a')
                  a.href = canvas.toDataURL('image/png')
                  a.download = `qr-cv-${publishInfo?.username || 'link'}.png`
                  a.click()
                }
                img.src = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(xml)))}`
              }}
            >
              <Download className="h-4 w-4" /> Download PNG
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <LoginModal
        open={loginOpen}
        onOpenChange={setLoginOpen}
        initialTab="signup"
        redirectTo="none"
        draftPayload={
          hasContent
            ? { name: cv.contact.fullName || 'My CV', templateId: design.templateId, theme: design.theme, cv, photoData, portfolio, publishedUser: username || '' }
            : undefined
        }
      />

      <p className="text-[11px] text-slate-400 text-center">Everything downloads straight from your browser — your CV data never leaves this page except the snapshot you publish.</p>
    </div>
  )
}
