'use client'

// ─── R6 · Portfolio publish panel ───────────────────────────────────────────
// Username picker + publish (kind: "portfolio") + success dialog with QR,
// one-tap share and a private view counter. Publishes to the same
// /cv/{username} namespace — the page renders as a portfolio website.

import { useEffect, useState } from 'react'
import { usePortfolioStore } from './portfolio-store'
import { useAuthStore } from '@/lib/cv/auth-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { LoginModal } from '@/components/auth/LoginModal'
import { ShareRow } from '@/components/share/ShareRow'
import { QRCodeSVG } from 'qrcode.react'
import { Globe, Copy, Loader2, ExternalLink, RefreshCw, Check, Eye, QrCode, Download } from 'lucide-react'
import { toast } from 'sonner'

interface CheckResp {
  available: boolean
  reason: string
  suggestions: string[]
}

export function PublishPanel() {
  const cv = usePortfolioStore((s) => s.cv)
  const portfolio = usePortfolioStore((s) => s.portfolio)
  const photoData = usePortfolioStore((s) => s.photoData)
  const publishInfo = usePortfolioStore((s) => s.publishInfo)
  const setPublishInfo = usePortfolioStore((s) => s.setPublishInfo)
  const name = usePortfolioStore((s) => s.name)

  const user = useAuthStore((s) => s.user)

  const [username, setUsername] = useState(publishInfo?.username ?? user?.username ?? '')
  const [check, setCheck] = useState<CheckResp | null>(null)
  const [checking, setChecking] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [success, setSuccess] = useState<{ username: string; url: string; updated: boolean } | null>(null)
  const [origin, setOrigin] = useState('')
  const [loginOpen, setLoginOpen] = useState(false)
  const [views, setViews] = useState<number | null>(null)
  const [qrOpen, setQrOpen] = useState(false)

  useEffect(() => setOrigin(window.location.origin), [])

  useEffect(() => {
    if (user?.username && !publishInfo) setUsername((u) => u || user.username)
  }, [user, publishInfo])

  // Debounced availability check
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

  // Private view counter
  useEffect(() => {
    if (!publishInfo?.username) return setViews(null)
    fetch(`/api/cv/${publishInfo.username}?stats=1`)
      .then((r) => (r.ok ? r.json() : null))
      .then((j: { viewCount?: number } | null) => setViews(typeof j?.viewCount === 'number' ? j.viewCount : null))
      .catch(() => {})
  }, [publishInfo, success])

  const hasContent = cv.contact.fullName.trim().length > 0 || portfolio.projects.some((p) => p.title.trim())

  const publish = async () => {
    const u = username.trim().toLowerCase()
    if (!hasContent) return toast.error('Add your name or at least one project first')
    if (!publishInfo && (!check || !check.available)) return toast.error(check?.reason || 'Pick an available username')
    setPublishing(true)
    try {
      const res = await fetch('/api/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: u,
          kind: 'portfolio',
          claimKey: publishInfo?.updateToken || publishInfo?.claimKey || undefined,
          displayName: cv.contact.fullName || name || 'My portfolio',
          templateId: portfolio.layout, // portfolio style id lives in templateId
          theme: { accent: portfolio.accent },
          cv,
          photoData,
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

  const publishedUrl = publishInfo ? `${origin}/cv/${publishInfo.username}` : ''

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-200 p-4">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-violet-50 text-violet-600"><Globe className="h-5 w-5" /></span>
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-semibold text-slate-800">Publish &amp; get your personal link</h3>
            <p className="mt-0.5 text-[11px] text-slate-500">
              Your website goes live <b>instantly</b> at <b>seemehere…/cv/yourname</b> — free, no account needed, no ads, your name is the brand.
            </p>
          </div>
        </div>

        {!publishInfo ? (
          <div className="mt-4 space-y-3">
            <div className="space-y-2">
              <Label className="text-xs font-medium text-slate-600">Pick your link name</Label>
              <div className="flex items-center gap-2">
                <span className="whitespace-nowrap text-xs text-slate-400">…/cv/</span>
                <Input value={username} onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))} placeholder={user?.username || 'sarahm'} className="flex-1" />
                {checking && <Loader2 className="h-4 w-4 animate-spin text-slate-300" />}
              </div>
              {check && (
                <div className="text-xs">
                  {check.available ? (
                    <span className="inline-flex items-center gap-1 font-medium text-emerald-600"><Check className="h-3.5 w-3.5" />{username.toLowerCase()} is available — grab it!</span>
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
              {publishing ? 'Publishing…' : 'Publish my portfolio'}
            </Button>

            <p className="text-center text-[11px] leading-relaxed text-slate-500">
              {user ? (
                <>Signed in — your site is saved to your account and you can edit &amp; republish anytime.</>
              ) : (
                <>
                  No account needed. Want to edit this site later?{' '}
                  <button className="font-semibold text-violet-600 underline" onClick={() => setLoginOpen(true)}>
                    Create a free account
                  </button>{' '}(optional — username + password, no email).
                </>
              )}
            </p>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3">
              <code className="flex-1 truncate text-xs font-semibold text-indigo-700">{publishedUrl}</code>
              <Button variant="ghost" size="icon" className="h-7 w-7" title="Copy link" onClick={() => copy(publishedUrl, 'Link')}>
                <Copy className="h-3.5 w-3.5" />
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7" title="QR code" onClick={() => setQrOpen(true)}>
                <QrCode className="h-3.5 w-3.5" />
              </Button>
              <a href={`/cv/${publishInfo.username}`} target="_blank" rel="noopener noreferrer" className="inline-flex h-7 w-7 items-center justify-center rounded-md text-slate-500 hover:bg-slate-200" title="Open">
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
              {views !== null && (
                <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1">
                  <Eye className="h-3.5 w-3.5 text-violet-500" /> {views} view{views === 1 ? '' : 's'} — only you can see this
                </span>
              )}
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 font-medium text-emerald-700">
                <Check className="h-3.5 w-3.5" /> Live — republish after edits
              </span>
            </div>

            <Button onClick={publish} disabled={publishing} variant="outline" className="w-full gap-2">
              {publishing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              {publishing ? 'Updating…' : 'Update my site with the latest changes'}
            </Button>

            <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
              <span className="text-[11px] font-medium text-slate-400">Share your site:</span>
              <ShareRow url={publishedUrl} text={`Check out my portfolio — ${publishedUrl}`} />
            </div>
          </div>
        )}
      </div>

      {/* Success dialog */}
      <Dialog open={!!success} onOpenChange={(open) => !open && setSuccess(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-600"><Globe className="h-4 w-4" /></span>
              {success?.updated ? 'Site updated!' : 'You are live! 🎉'}
            </DialogTitle>
            <DialogDescription>Your portfolio website is ready — share it anywhere.</DialogDescription>
          </DialogHeader>
          {success && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 p-2.5">
                <code className="flex-1 truncate text-xs font-semibold text-indigo-700">{success.url}</code>
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
                <p className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-[11px] text-slate-600">
                  Tip: sign up later and you can edit this site anytime —{' '}
                  <button className="font-bold underline" onClick={() => setLoginOpen(true)}>create a free account</button> (optional).
                </p>
              )}
              <div className="flex flex-wrap items-center justify-center gap-2">
                <span className="text-[11px] font-medium text-slate-400">Tell people:</span>
                <ShareRow url={success.url} text={`Check out my portfolio — ${success.url}`} />
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
            <DialogTitle>QR code to your portfolio</DialogTitle>
            <DialogDescription>Perfect for your CV header, business card or CV header.</DialogDescription>
          </DialogHeader>
          <div className="flex justify-center rounded-xl border border-slate-200 bg-white p-4">
            {publishedUrl && <QRCodeSVG id="pf-qr" value={publishedUrl} size={192} level="M" fgColor="#1e1b4b" />}
          </div>
          <DialogFooter>
            <Button
              className="w-full gap-2"
              onClick={() => {
                const svg = document.querySelector('#pf-qr') as SVGSVGElement | null
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
                  a.download = `qr-portfolio-${publishInfo?.username || 'link'}.png`
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

      <LoginModal open={loginOpen} onOpenChange={setLoginOpen} initialTab="signup" redirectTo="none" />

      <p className="text-center text-[11px] text-slate-400">
        Publishing stores only the snapshot people see at your link — your editing data stays in this browser (and your account, if signed in).
      </p>
    </div>
  )
}
