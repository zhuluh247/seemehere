'use client'

import { useEffect, useState } from 'react'
import { useCvStore } from '@/lib/cv/store'
import { useAuthStore } from '@/lib/cv/auth-store'
import { exportPdf, exportPng, exportDocx, exportTxt } from '@/lib/cv/export'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { LoginModal } from '@/components/auth/LoginModal'
import { QRCodeSVG } from 'qrcode.react'
import { FileText, FileImage, FileType2, FileType, Globe, Copy, Download, Loader2, ExternalLink, RefreshCw, Check, Eye, QrCode } from 'lucide-react'
import { toast } from 'sonner'
import { PortfolioStep } from './PortfolioStep'

interface CheckResp {
  available: boolean
  reason: string
  suggestions: string[]
}

/** One-tap share intents — WhatsApp / X / LinkedIn / copy */
function ShareRow({ url }: { url: string }) {
  const text = `Check out my new CV & portfolio — ${url}`
  const open = (href: string) => window.open(href, '_blank', 'noopener,width=620,height=640')
  const btn = 'inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition-colors hover:text-violet-600 hover:border-violet-300'
  return (
    <>
      <button className={`${btn} hover:!text-[#25D366]`} title="Share on WhatsApp" onClick={() => open(`https://wa.me/?text=${encodeURIComponent(text)}`)}>
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
      </button>
      <button className={btn} title="Share on X" onClick={() => open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`)}>
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
      </button>
      <button className={`${btn} hover:!text-[#0A66C2]`} title="Share on LinkedIn" onClick={() => open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`)}>
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1 0-4.125 2.062 2.062 0 0 1 0 4.125zM7.119 20.452H3.554V9h3.565v11.452z"/></svg>
      </button>
      <button
        className={`${btn} hover:!text-violet-600`}
        title="Copy link"
        onClick={() => navigator.clipboard.writeText(url).then(() => toast.success('Link copied')).catch(() => toast.error('Copy failed'))}
      >
        <Copy className="h-3.5 w-3.5" />
      </button>
    </>
  )
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
          claimKey: publishInfo?.updateToken || publishInfo?.claimKey || undefined, // proof of ownership
          displayName: cv.contact.fullName || 'My CV',
          templateId: design.templateId,
          theme: design.theme,
          cv,
          photoData: design.showPhoto ? photoData : '',
          portfolio,
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
          {dl('PDF — the one to send out', <FileText className="h-5 w-5" />, 'Print dialog → choose "Save as PDF"', exportPdf)}
          {dl('PNG image', <FileImage className="h-5 w-5" />, 'For LinkedIn previews & portfolios', () => runExport('png'), busyExport === 'png')}
          {dl('Word document', <FileType2 className="h-5 w-5" />, 'Editable .docx, clean universal layout', () => runExport('docx'), busyExport === 'docx')}
          {dl('Plain text', <FileType className="h-5 w-5" />, 'For portals that mangle PDFs', () => { if (hasContent) exportTxt(cv, cv.contact.fullName); else toast.error('Add at least your name first') })}
        </div>
      </div>

      {/* Portfolio website — creation lives here, below the exports */}
      <PortfolioStep />

      {/* Publish / share */}
      <div className="rounded-xl border border-slate-200 p-4 space-y-4">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600"><Globe className="h-5 w-5" /></span>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-slate-800">Publish &amp; get your personal link</h3>
            <p className="text-[11px] text-slate-500">
              Your {portfolio.enabled ? 'portfolio website' : 'CV'} goes live <b>instantly</b> at <b>seemehere…/cv/yourname</b> — free, no account needed, no ads on your page.
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
