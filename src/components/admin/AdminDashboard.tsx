'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  BarChart3,
  ExternalLink,
  Eye,
  FileText,
  Globe2,
  Home,
  Info,
  Lock,
  LogOut,
  RefreshCw,
  Save,
  Search,
  Users,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'

// ─── Admin dashboard (R4) — /admin ──────────────────────────────────────────
// Single shared password (ADMIN_PASSWORD env). Overview: page-view analytics.
// SEO tab: site title/description + the "index public CV pages" toggle that
// drives robots meta, robots.txt and sitemap.xml together.

interface TopRow {
  username: string
  displayName: string
  templateId: string
  views: number
  legacyViewCount: number
  lastViewedAt: string | null
  updatedAt: string
  publishedAt: string
}

interface Stats {
  totals: {
    published: number
    users: number
    viewsAllTime: number
    views7: number
    views30: number
    homeAllTime: number
    home7: number
    home30: number
  }
  daily: { date: string; views: number; home: number }[]
  top: TopRow[]
  recent: TopRow[]
}

interface Settings {
  siteTitle: string
  siteDescription: string
  indexCvPages: boolean
}

type Phase = 'boot' | 'login' | 'ready' | 'notconfigured'

const nf = new Intl.NumberFormat('en-GB')

function fmtDate(iso: string | null): string {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.getTime() === 0 ? '—' : d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function AdminDashboard() {
  const { toast } = useToast()
  const [phase, setPhase] = useState<Phase>('boot')
  const [password, setPassword] = useState('')
  const [signingIn, setSigningIn] = useState(false)
  const [loginError, setLoginError] = useState('')
  const [tab, setTab] = useState<'overview' | 'seo'>('overview')

  const [stats, setStats] = useState<Stats | null>(null)
  const [statsLoading, setStatsLoading] = useState(false)

  const [settings, setSettings] = useState<Settings>({ siteTitle: '', siteDescription: '', indexCvPages: false })
  const [settingsLoading, setSettingsLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  // ── data loaders ──────────────────────────────────────────────────────────
  const loadStats = useCallback(async () => {
    setStatsLoading(true)
    try {
      const res = await fetch('/api/admin/stats', { cache: 'no-store' })
      if (res.status === 401) {
        setPhase('login')
        return
      }
      if (res.ok) setStats((await res.json()) as Stats)
    } catch {
      // network hiccup — keep old stats on screen
    } finally {
      setStatsLoading(false)
    }
  }, [])

  const loadSettings = useCallback(async () => {
    setSettingsLoading(true)
    try {
      const res = await fetch('/api/admin/settings', { cache: 'no-store' })
      if (res.status === 401) {
        setPhase('login')
        return
      }
      if (res.ok) setSettings((await res.json()) as Settings)
    } catch {
      // ignore
    } finally {
      setSettingsLoading(false)
    }
  }, [])

  // ── boot: is admin configured? are we already signed in? ──────────────────
  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const res = await fetch('/api/admin/session', { cache: 'no-store' })
        const j = (await res.json()) as { configured?: boolean }
        if (!alive) return
        if (!j.configured) {
          setPhase('notconfigured')
          return
        }
        // Configured — probe a guarded endpoint to see if we hold a valid cookie
        const probe = await fetch('/api/admin/stats', { cache: 'no-store' })
        if (!alive) return
        if (probe.ok) {
          setPhase('ready')
          const j2 = (await probe.json()) as Stats
          setStats(j2)
        } else {
          setPhase('login')
        }
      } catch {
        if (alive) setPhase('login')
      }
    })()
    return () => {
      alive = false
    }
  }, [])

  useEffect(() => {
    if (phase === 'ready' && tab === 'seo') void loadSettings()
  }, [phase, tab, loadSettings])

  // ── actions ───────────────────────────────────────────────────────────────
  async function signIn(e: React.FormEvent) {
    e.preventDefault()
    setSigningIn(true)
    setLoginError('')
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      const j = (await res.json()) as { error?: string }
      if (!res.ok) {
        setLoginError(j.error || 'Sign in failed')
        return
      }
      setPassword('')
      setPhase('ready')
      void loadStats()
    } catch {
      setLoginError('Network error — try again')
    } finally {
      setSigningIn(false)
    }
  }

  async function signOut() {
    try {
      await fetch('/api/admin/logout', { method: 'POST' })
    } catch {}
    setStats(null)
    setPhase('login')
  }

  async function saveSettings() {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })
      if (res.status === 401) {
        setPhase('login')
        return
      }
      if (!res.ok) throw new Error('failed')
      toast({ title: 'Settings saved', description: 'Search engines see the change within a few minutes.' })
    } catch {
      toast({ title: 'Could not save settings', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  // ── boot spinner ──────────────────────────────────────────────────────────
  if (phase === 'boot') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
      </div>
    )
  }

  // ── not configured ────────────────────────────────────────────────────────
  if (phase === 'notconfigured') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50">
            <Info className="h-6 w-6 text-indigo-600" />
          </div>
          <h1 className="text-xl font-bold text-slate-900">Admin is not enabled yet</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Add the <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[13px] text-indigo-700">ADMIN_PASSWORD</code>{' '}
            environment variable on your server (Render → Environment), then restart the service and reload this page.
          </p>
        </div>
      </div>
    )
  }

  // ── login ─────────────────────────────────────────────────────────────────
  if (phase === 'login') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <form onSubmit={signIn} className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50">
            <Lock className="h-6 w-6 text-indigo-600" />
          </div>
          <h1 className="text-center text-xl font-bold text-slate-900">SEEMEHERE Admin</h1>
          <p className="mt-1 text-center text-sm text-slate-500">Enter the admin password to continue.</p>
          <div className="mt-6 space-y-2">
            <Label htmlFor="admin-password">Password</Label>
            <Input
              id="admin-password"
              type="password"
              autoFocus
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
            {loginError && <p className="text-sm text-red-600">{loginError}</p>}
          </div>
          <Button type="submit" className="mt-5 w-full bg-indigo-600 hover:bg-indigo-700" disabled={signingIn || !password}>
            {signingIn ? 'Signing in…' : 'Sign in'}
          </Button>
          <p className="mt-4 text-center text-xs leading-5 text-slate-400">
            Sessions last 7 days. Set or change the password any time via the ADMIN_PASSWORD environment variable.
          </p>
        </form>
      </div>
    )
  }

  // ── dashboard ─────────────────────────────────────────────────────────────
  const maxDaily = Math.max(1, ...(stats?.daily.map((d) => d.views + d.home) || [1]))
  const totals = stats?.totals

  return (
    <div className="min-h-screen bg-slate-50">
      {/* header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white">
              <BarChart3 className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold leading-tight text-slate-900">Admin</h1>
              <p className="text-xs text-slate-500">SEEMEHERE dashboard</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={signOut} className="text-slate-600">
            <LogOut className="mr-1.5 h-4 w-4" /> Sign out
          </Button>
        </div>
        <div className="mx-auto flex max-w-5xl gap-1 px-4">
          {(
            [
              { id: 'overview', label: 'Overview', icon: Eye },
              { id: 'seo', label: 'SEO settings', icon: Search },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`-mb-px flex items-center gap-1.5 border-b-2 px-3 py-2.5 text-sm font-medium transition-colors ${
                tab === t.id
                  ? 'border-indigo-600 text-indigo-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <t.icon className="h-4 w-4" /> {t.label}
            </button>
          ))}
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8">
        {tab === 'overview' && (
          <div className="space-y-6">
            {/* stat cards */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
              {[
                { label: 'Published CVs', value: totals?.published, icon: FileText, tone: 'plain' as const },
                { label: 'Accounts', value: totals?.users, icon: Users, tone: 'plain' as const },
                { label: 'Website visitors', value: totals?.homeAllTime, icon: Home, tone: 'emerald' as const },
                { label: 'CV views (all time)', value: totals?.viewsAllTime, icon: Globe2, tone: 'indigo' as const },
                { label: 'CV views (7 days)', value: totals?.views7, icon: Eye, tone: 'plain' as const },
                { label: 'CV views (30 days)', value: totals?.views30, icon: BarChart3, tone: 'plain' as const },
              ].map((c) => (
                <div
                  key={c.label}
                  className={`rounded-2xl border bg-white p-4 shadow-sm ${
                    c.tone === 'indigo'
                      ? 'border-indigo-200 bg-indigo-50/40'
                      : c.tone === 'emerald'
                        ? 'border-emerald-200 bg-emerald-50/40'
                        : 'border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                    <c.icon
                      className={`h-3.5 w-3.5 ${
                        c.tone === 'indigo' ? 'text-indigo-600' : c.tone === 'emerald' ? 'text-emerald-600' : 'text-slate-400'
                      }`}
                    />
                    {c.label}
                  </div>
                  <div
                    className={`mt-1.5 text-2xl font-bold tabular-nums ${
                      c.tone === 'indigo' ? 'text-indigo-700' : c.tone === 'emerald' ? 'text-emerald-700' : 'text-slate-900'
                    }`}
                  >
                    {c.value === undefined ? <span className="text-slate-300">—</span> : nf.format(c.value)}
                  </div>
                </div>
              ))}
            </div>

            {/* 30-day chart — stacked: CV views + website visitors */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-slate-900">Traffic — last 30 days</h2>
                <div className="flex items-center gap-3">
                  <span className="hidden items-center gap-1.5 text-[11px] text-slate-500 sm:inline-flex">
                    <span className="h-2.5 w-2.5 rounded-sm bg-indigo-500" /> CV views
                  </span>
                  <span className="hidden items-center gap-1.5 text-[11px] text-slate-500 sm:inline-flex">
                    <span className="h-2.5 w-2.5 rounded-sm bg-emerald-400" /> Website visitors
                  </span>
                  <Button variant="ghost" size="sm" onClick={() => void loadStats()} disabled={statsLoading} className="text-slate-500">
                    <RefreshCw className={`mr-1.5 h-4 w-4 ${statsLoading ? 'animate-spin' : ''}`} /> Refresh
                  </Button>
                </div>
              </div>
              <div className="flex h-36 items-end gap-[3px]">
                {(stats?.daily || Array.from({ length: 30 }, (_, i) => ({ date: String(i), views: 0, home: 0 }))).map((d, i) => {
                  const total = d.views + d.home
                  return (
                    <div
                      key={i}
                      className="group relative flex h-full flex-1 flex-col justify-end"
                      style={{ minWidth: 4 }}
                      title={`${d.date}: ${nf.format(d.views)} CV view${d.views === 1 ? '' : 's'} · ${nf.format(d.home)} site visitor${d.home === 1 ? '' : 's'}`}
                    >
                      {d.home > 0 && (
                        <div
                          className="rounded-t bg-emerald-400/90 transition-colors group-hover:bg-emerald-500"
                          style={{ height: `${Math.max(2, (d.home / maxDaily) * 100)}%` }}
                        />
                      )}
                      {d.views > 0 && (
                        <div
                          className={`${d.home > 0 ? '' : 'rounded-t'} bg-indigo-500/80 transition-colors group-hover:bg-indigo-600`}
                          style={{ height: `${Math.max(2, (d.views / maxDaily) * 100)}%` }}
                        />
                      )}
                      {total === 0 && <div className="h-[2px] rounded-t bg-slate-200" />}
                    </div>
                  )
                })}
              </div>
              <div className="mt-2 flex justify-between text-[11px] text-slate-400">
                <span>{stats?.daily[0]?.date || ''}</span>
                <span>today</span>
              </div>
            </div>

            {/* top pages */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-5 py-4">
                <h2 className="text-sm font-semibold text-slate-900">Top pages — all-time views</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-slate-400">
                      <th className="px-5 py-2.5 font-medium">Page</th>
                      <th className="px-5 py-2.5 font-medium">Views</th>
                      <th className="hidden px-5 py-2.5 font-medium sm:table-cell">Last viewed</th>
                      <th className="hidden px-5 py-2.5 font-medium md:table-cell">Updated</th>
                      <th className="px-5 py-2.5" />
                    </tr>
                  </thead>
                  <tbody>
                    {stats?.top.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-5 py-8 text-center text-slate-400">
                          No page views recorded yet — share a CV link to see analytics here.
                        </td>
                      </tr>
                    )}
                    {stats?.top.map((r) => (
                      <tr key={r.username} className="border-b border-slate-50 last:border-0">
                        <td className="px-5 py-3">
                          <div className="font-medium text-slate-900">{r.displayName}</div>
                          <div className="text-xs text-slate-400">/cv/{r.username}</div>
                        </td>
                        <td className="px-5 py-3 tabular-nums font-semibold text-indigo-700">{nf.format(r.views)}</td>
                        <td className="hidden px-5 py-3 text-slate-500 sm:table-cell">{fmtDate(r.lastViewedAt)}</td>
                        <td className="hidden px-5 py-3 text-slate-500 md:table-cell">{fmtDate(r.updatedAt)}</td>
                        <td className="px-5 py-3 text-right">
                          <a
                            href={`/cv/${r.username}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-800"
                          >
                            View <ExternalLink className="h-3 w-3" />
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* recent publishes */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-5 py-4">
                <h2 className="text-sm font-semibold text-slate-900">Recently updated CVs</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-slate-400">
                      <th className="px-5 py-2.5 font-medium">Page</th>
                      <th className="hidden px-5 py-2.5 font-medium sm:table-cell">Template</th>
                      <th className="px-5 py-2.5 font-medium">Owner views</th>
                      <th className="hidden px-5 py-2.5 font-medium sm:table-cell">Updated</th>
                      <th className="px-5 py-2.5" />
                    </tr>
                  </thead>
                  <tbody>
                    {stats?.recent.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-5 py-8 text-center text-slate-400">
                          Nothing published yet.
                        </td>
                      </tr>
                    )}
                    {stats?.recent.map((r) => (
                      <tr key={r.username} className="border-b border-slate-50 last:border-0">
                        <td className="px-5 py-3">
                          <div className="font-medium text-slate-900">{r.displayName}</div>
                          <div className="text-xs text-slate-400">/cv/{r.username}</div>
                        </td>
                        <td className="hidden px-5 py-3 capitalize text-slate-500 sm:table-cell">{r.templateId}</td>
                        <td className="px-5 py-3 tabular-nums text-slate-600">{nf.format(r.legacyViewCount)}</td>
                        <td className="hidden px-5 py-3 text-slate-500 sm:table-cell">{fmtDate(r.updatedAt)}</td>
                        <td className="px-5 py-3 text-right">
                          <a
                            href={`/cv/${r.username}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-800"
                          >
                            View <ExternalLink className="h-3 w-3" />
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <p className="text-xs leading-5 text-slate-400">
              Analytics are privacy-light: no IPs, no user agents, no fingerprints — just which page was viewed, in which
              mode, and when. Bot traffic is filtered out automatically. “Website visitors” counts home-page sessions
              (one per browser per day); “CV views” counts public CV and portfolio page loads.
            </p>
          </div>
        )}

        {tab === 'seo' && (
          <div className="max-w-2xl space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-sm font-semibold text-slate-900">Search engine listing</h2>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                The title and description search engines show for your site&apos;s home page. Changes go live within a few
                minutes — no redeploy needed.
              </p>
              <div className="mt-4 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="seo-title">Site title</Label>
                  <Input
                    id="seo-title"
                    value={settingsLoading ? '…' : settings.siteTitle}
                    onChange={(e) => setSettings((s) => ({ ...s, siteTitle: e.target.value }))}
                    maxLength={200}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="seo-desc">Site description</Label>
                  <Textarea
                    id="seo-desc"
                    rows={3}
                    value={settingsLoading ? '…' : settings.siteDescription}
                    onChange={(e) => setSettings((s) => ({ ...s, siteDescription: e.target.value }))}
                    maxLength={500}
                  />
                  <p className="text-right text-[11px] text-slate-400">{settings.siteDescription.length}/500</p>
                </div>
                {/* Google-style search result preview */}
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Search result preview</p>
                  <p className="mt-2 truncate text-sm text-[#1a0dab]">{settings.siteTitle || 'Your site title'}</p>
                  <p className="text-xs text-[#006621]">seemehere.onrender.com</p>
                  <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-600">
                    {settings.siteDescription || 'Your site description appears here.'}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-sm font-semibold text-slate-900">Index public CV pages</h2>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    OFF (default): share pages stay <span className="font-medium">unlisted</span> — invisible to Google,
                    reachable only by their secret links. ON: /cv pages are listed in sitemap.xml, allowed in robots.txt,
                    and marked index/follow so they can rank.
                  </p>
                </div>
                <Switch
                  checked={settings.indexCvPages}
                  onCheckedChange={(v) => setSettings((s) => ({ ...s, indexCvPages: v }))}
                  className="mt-1 data-[state=checked]:bg-indigo-600"
                />
              </div>
            </div>

            <Button onClick={() => void saveSettings()} disabled={saving || settingsLoading} className="bg-indigo-600 hover:bg-indigo-700">
              <Save className="mr-1.5 h-4 w-4" /> {saving ? 'Saving…' : 'Save settings'}
            </Button>
          </div>
        )}
      </main>
    </div>
  )
}
