'use client'

// ─── Portfolio website renderer ─────────────────────────────────────────────
// Website-style share page. No SEEMEHERE header, no "unlisted" chrome —
// the owner's name is the brand. Tiny footer credit only.
//
// Layouts (15):
//   R5 originals  — signature / horizon / spotlight (legacy, pixel-identical)
//   R6 GenZ six   — aura / riot / editorial / terminal / bento / vogue
//   R7 additions  — atelier / monolith / meridian (professional)
//                   noir / lagoon / bloom (beautiful)
//                   (new ones render through the token system in portfolio-themes.tsx)
//
// R6 global tokens: font, radius, background texture, marquee ribbon,
// availability badge, and a custom section order — all optional so every
// pre-R6 published page keeps rendering exactly as before.
// R7 adds the motion token: off / subtle / rich — scroll reveals, hero
// entrance and hover lifts, all disabled for prefers-reduced-motion users.

import type { CvData, PortfolioSpec, PortfolioSectionKey } from '@/lib/cv/types'
import { useCallback, useEffect, useRef, useState } from 'react'
import {
  normalizePortfolio,
  normalizeCv,
  PORTFOLIO_SECTION_ORDER,
  PORTFOLIO_SECTION_LABELS,
  PORTFOLIO_FONT_STACKS,
  PORTFOLIO_RADIUS_PX,
  type PortfolioLayout,
} from '@/lib/cv/types'
import {
  pfTokens,
  isPfNewLayout,
  BrandIcon,
  PfMarquee,
  PfTexture,
  withProtocol,
  ExternalLink,
  Code2,
  type PfTokens,
} from './portfolio-themes'
import {
  Mail, MapPin, Phone, Briefcase, GraduationCap, Sparkles, Quote, UserPlus, FileDown,
  Menu, X, ChevronLeft, ChevronRight,
} from 'lucide-react'
import { dateRange } from '@/components/cv/templates/shared'

interface PortfolioSiteProps {
  data: CvData
  photoData?: string
  portfolio: Partial<PortfolioSpec> | unknown
  /** preview mode = inside the builder (no live-CV link) */
  preview?: boolean
  /** live username → enables "Get my CV" pointing at /cv/name?mode=cv */
  username?: string
}

// ─── legacy R5 heroes (visual output unchanged from R5) ─────────────────────

type LegacyHeroProps = {
  accent: string
  dark: boolean
  soft?: string
  name: string
  tagline: string
  location: string
  email: string
  photoData?: string
  socials: { kind: string; label: string; url: string }[]
  cvLink?: string
  contactOn: boolean
}

function SignatureHero(p: LegacyHeroProps) {
  return (
    <section
      className="relative overflow-hidden px-6 pb-16 pt-20 text-center sm:px-10 sm:pt-24"
      style={{
        background: p.dark
          ? `radial-gradient(ellipse 70% 60% at 50% -10%, ${p.accent}33, transparent), #020617`
          : `radial-gradient(ellipse 70% 60% at 50% -10%, ${p.accent}1f, transparent), #ffffff`,
      }}
    >
      <div className="mx-auto max-w-3xl">
        {p.photoData && (
          <img
            src={p.photoData}
            alt={p.name || 'Profile'}
            className="mx-auto mb-7 h-28 w-28 rounded-full border-4 object-cover shadow-xl"
            style={{ borderColor: p.accent }}
          />
        )}
        <h1 className="text-4xl font-black tracking-tight sm:text-6xl">{p.name || 'Your Name'}</h1>
        {p.tagline && (
          <p className="mt-4 text-base font-medium sm:text-lg" style={{ color: p.accent }}>
            {p.tagline}
          </p>
        )}
        {p.location && <p className={`mt-3 text-sm ${p.soft} inline-flex items-center gap-1.5`}><MapPin className="h-3.5 w-3.5" /> {p.location}</p>}
        {(p.socials.length > 0 || p.email) && (
          <div className="mt-7 flex flex-wrap items-center justify-center gap-2.5">
            {p.email && (
              <a
                href={`mailto:${p.email}`}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full text-white transition-transform hover:scale-110"
                style={{ background: p.accent }}
                aria-label="Email"
              >
                <Mail className="h-4.5 w-4.5" />
              </a>
            )}
            {p.socials.map((s, i) => (
              <a
                key={i}
                href={withProtocol(s.url)}
                target="_blank"
                rel="noopener noreferrer"
                title={s.label}
                className={`inline-flex h-10 w-10 items-center justify-center rounded-full border transition-transform hover:scale-110 ${p.dark ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-white border-slate-200 text-slate-700'}`}
              >
                <BrandIcon kind={s.kind} className="h-4.5 w-4.5" />
              </a>
            ))}
          </div>
        )}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          {p.cvLink && (
            <a
              href={p.cvLink}
              className="inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold text-white shadow-lg transition-transform hover:-translate-y-0.5"
              style={{ background: p.accent }}
            >
              <FileDown className="h-4 w-4" /> Get my CV
            </a>
          )}
          {p.email && p.contactOn && (
            <a
              href={`mailto:${p.email}`}
              className={`inline-flex items-center gap-2 rounded-full border px-6 py-2.5 text-sm font-semibold transition-transform hover:-translate-y-0.5 ${p.dark ? 'bg-slate-900 border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-800'}`}
            >
              <Mail className="h-4 w-4" /> Hire me
            </a>
          )}
        </div>
      </div>
    </section>
  )
}

function HorizonHero(p: LegacyHeroProps) {
  return (
    <section
      className="relative overflow-hidden px-6 pb-16 pt-16 text-white sm:px-10 sm:pt-20"
      style={{
        background: `linear-gradient(140deg, ${p.accent} 0%, color-mix(in srgb, ${p.accent} 55%, #020617) 78%)`,
      }}
    >
      <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full" style={{ background: 'rgba(255,255,255,.09)' }} />
      <div className="pointer-events-none absolute -bottom-32 left-1/3 h-64 w-64 rounded-full" style={{ background: 'rgba(255,255,255,.06)' }} />
      <div className="relative mx-auto max-w-5xl">
        {p.photoData && (
          <img
            src={p.photoData}
            alt={p.name || 'Profile'}
            className="mb-7 h-24 w-24 rounded-2xl border-4 object-cover shadow-xl"
            style={{ borderColor: 'rgba(255,255,255,.4)' }}
          />
        )}
        <p className="text-xs font-bold uppercase tracking-[0.3em] opacity-80">{p.tagline || 'Portfolio'}</p>
        <h1 className="mt-3 max-w-3xl text-4xl font-black leading-[1.05] tracking-tight sm:text-6xl">{p.name || 'Your Name'}</h1>
        {p.location && (
          <p className="mt-4 inline-flex items-center gap-1.5 text-sm opacity-85">
            <MapPin className="h-3.5 w-3.5" /> {p.location}
          </p>
        )}
        {(p.socials.length > 0 || p.email) && (
          <div className="mt-7 flex flex-wrap items-center gap-2.5">
            {p.email && (
              <a
                href={`mailto:${p.email}`}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-900 transition-transform hover:scale-110"
                aria-label="Email"
              >
                <Mail className="h-4.5 w-4.5" />
              </a>
            )}
            {p.socials.map((s, i) => (
              <a
                key={i}
                href={withProtocol(s.url)}
                target="_blank"
                rel="noopener noreferrer"
                title={s.label}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/40 bg-white/10 text-white transition-transform hover:scale-110"
              >
                <BrandIcon kind={s.kind} className="h-4.5 w-4.5" />
              </a>
            ))}
          </div>
        )}
        <div className="mt-8 flex flex-wrap items-center gap-3">
          {p.cvLink && (
            <a
              href={p.cvLink}
              className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-2.5 text-sm font-bold text-slate-900 shadow-lg transition-transform hover:-translate-y-0.5"
            >
              <FileDown className="h-4 w-4" /> Get my CV
            </a>
          )}
          {p.email && p.contactOn && (
            <a
              href={`mailto:${p.email}`}
              className="inline-flex items-center gap-2 rounded-full border border-white/50 bg-white/10 px-6 py-2.5 text-sm font-semibold text-white backdrop-blur transition-transform hover:-translate-y-0.5 hover:bg-white/20"
            >
              <Mail className="h-4 w-4" /> Hire me
            </a>
          )}
        </div>
      </div>
    </section>
  )
}

function SpotlightHero(p: LegacyHeroProps) {
  return (
    <section
      className={`px-6 pb-14 pt-20 text-center sm:pt-28 ${p.dark ? '' : 'bg-white'}`}
      style={p.dark ? { background: `radial-gradient(ellipse 60% 50% at 50% -10%, ${p.accent}22, transparent), #020617` } : undefined}
    >
      <div className="mx-auto max-w-3xl">
        {p.photoData && (
          <img
            src={p.photoData}
            alt={p.name || 'Profile'}
            className="mx-auto mb-8 h-24 w-24 rounded-full object-cover"
            style={{ border: `2px solid ${p.accent}` }}
          />
        )}
        <h1 className="text-5xl font-black leading-[1.02] tracking-tight sm:text-7xl">{p.name || 'Your Name'}</h1>
        {p.tagline && (
          <p className="mt-6 text-[11px] font-bold uppercase tracking-[0.35em]" style={{ color: p.accent }}>
            {p.tagline}
          </p>
        )}
        {p.location && <p className={`mt-4 text-sm ${p.soft} inline-flex items-center gap-1.5`}><MapPin className="h-3.5 w-3.5" /> {p.location}</p>}
        {(p.socials.length > 0 || p.email) && (
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            {p.email && (
              <a
                href={`mailto:${p.email}`}
                className={`inline-flex h-10 w-10 items-center justify-center rounded-full transition-transform hover:scale-110 ${p.dark ? 'text-slate-300' : 'text-slate-600'}`}
                style={{ border: `1px solid ${p.accent}`, color: p.accent }}
                aria-label="Email"
              >
                <Mail className="h-4.5 w-4.5" />
              </a>
            )}
            {p.socials.map((s, i) => (
              <a
                key={i}
                href={withProtocol(s.url)}
                target="_blank"
                rel="noopener noreferrer"
                title={s.label}
                className={`inline-flex h-10 w-10 items-center justify-center rounded-full transition-transform hover:scale-110 ${p.dark ? 'border border-slate-700 text-slate-300' : 'border border-slate-300 text-slate-600'}`}
              >
                <BrandIcon kind={s.kind} className="h-4.5 w-4.5" />
              </a>
            ))}
          </div>
        )}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
          {p.cvLink && (
            <a
              href={p.cvLink}
              className="inline-flex items-center gap-1.5 text-sm font-bold uppercase tracking-widest transition-opacity hover:opacity-70"
              style={{ color: p.accent }}
            >
              <FileDown className="h-4 w-4" /> Get my CV
            </a>
          )}
          {p.email && p.contactOn && (
            <a
              href={`mailto:${p.email}`}
              className={`inline-flex items-center gap-1.5 text-sm font-bold uppercase tracking-widest transition-opacity hover:opacity-70 ${p.dark ? 'text-slate-200' : 'text-slate-800'}`}
            >
              <Mail className="h-4 w-4" /> Hire me
            </a>
          )}
        </div>
      </div>
    </section>
  )
}

/** Token adapter for the 3 R5 originals — reproduces the exact R5 output */
function legacyTokens(layout: PortfolioLayout): PfTokens {
  return {
    id: layout,
    Hero: layout === 'horizon' ? HorizonHero : layout === 'spotlight' ? SpotlightHero : SignatureHero,
    defaultFont: 'sans',
    contactSkin: layout === 'spotlight' ? 'outline' : 'gradient',
    aboutCenter: layout === 'spotlight',
    skillsCenter: layout === 'spotlight',
    card: (d) =>
      layout === 'spotlight'
        ? d
          ? 'bg-slate-950 border border-slate-800'
          : 'bg-white border border-slate-200'
        : d
          ? 'bg-slate-900 border border-slate-800 shadow-sm'
          : 'bg-white border border-slate-200 shadow-sm',
    chip: (d) =>
      layout === 'spotlight'
        ? d
          ? 'border border-slate-700 text-slate-300'
          : 'border border-slate-300 text-slate-600'
        : d
          ? 'bg-slate-800 text-slate-300'
          : 'bg-slate-100 text-slate-700',
    projectsGrid: layout === 'horizon' ? 'grid gap-6 sm:grid-cols-2 lg:grid-cols-3' : 'grid gap-6 sm:grid-cols-2',
    title: (_k, _i, children, accent, dark) => {
      if (layout === 'spotlight') {
        return (
          <div className="mb-8 flex items-center justify-center gap-4">
            <span className={`h-px w-10 ${dark ? 'bg-slate-700' : 'bg-slate-300'}`} />
            <h2 className="text-xs font-bold uppercase tracking-[0.3em]">{children}</h2>
            <span className={`h-px w-10 ${dark ? 'bg-slate-700' : 'bg-slate-300'}`} />
          </div>
        )
      }
      if (layout === 'horizon') {
        return (
          <div className="mb-6 flex items-center gap-3">
            <span className="h-2.5 w-2.5 rounded-[3px]" style={{ background: accent }} />
            <h2 className="text-xl font-extrabold uppercase tracking-tight sm:text-2xl">{children}</h2>
          </div>
        )
      }
      return (
        <div className="mb-6 flex items-center gap-3">
          <span className="h-px w-8" style={{ background: accent }} />
          <h2 className="text-lg font-bold tracking-tight sm:text-xl">{children}</h2>
        </div>
      )
    },
  }
}

// ─── R9 · Site navigation — desktop bar + mobile hamburger drawer ───────────
// One accessible component, 15 personalities: the nav inherits each template's
// accent/darkness/font and gets a per-style skin (Terminal mono prompt, Riot
// neobrutalist tilt, Noir letterspaced small caps, Monolith heavy caps...).
// "Home" is always first; every visible section with content gets an entry.

type NavKey = 'home' | PortfolioSectionKey
interface NavItem { key: NavKey; label: string }

interface NavSkin {
  bar: string // bottom border
  barBg: string // translucent backdrop for the sticky bar
  brand: string // brand text classes
  link: string // base link classes
  linkIdle: string
  linkActive: string
  linkActiveStyle: React.CSSProperties
  drawerItem: string
  cvBtn: React.CSSProperties
  activePrefix?: string // terminal's "> " prompt on the active link
}

function navSkin(layout: PortfolioLayout, dark: boolean, accent: string): NavSkin {
  const base: NavSkin = {
    bar: dark ? 'border-slate-800/80' : 'border-slate-200/80',
    barBg: dark ? 'bg-slate-950/75' : 'bg-white/75',
    brand: 'font-extrabold tracking-tight',
    link: 'rounded-full px-3 py-1.5 text-[13px] font-semibold transition-colors',
    linkIdle: dark ? 'text-slate-300 hover:text-white hover:bg-white/5' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100',
    linkActive: 'text-white',
    linkActiveStyle: { background: accent },
    drawerItem: dark ? 'hover:bg-white/5' : 'hover:bg-black/5',
    cvBtn: { background: accent, color: '#ffffff' },
  }
  switch (layout) {
    case 'terminal':
      return {
        ...base,
        barBg: 'bg-[#0A0F14]/85',
        brand: 'font-mono font-bold tracking-tight',
        link: 'px-2 py-1 font-mono text-[12.5px] transition-colors',
        linkIdle: 'text-emerald-300/70 hover:text-emerald-200',
        linkActive: 'text-emerald-200',
        linkActiveStyle: { background: 'rgba(16,185,129,.12)', boxShadow: 'inset 0 0 0 1px rgba(16,185,129,.35)' },
        activePrefix: '>',
      }
    case 'riot':
      return {
        ...base,
        bar: 'border-b-4 border-black',
        barBg: 'bg-white/90',
        link: 'px-2.5 py-1 text-[13px] font-black uppercase tracking-tight transition-transform hover:-rotate-1',
        linkIdle: 'text-slate-700 hover:text-black',
        linkActive: 'text-black',
        linkActiveStyle: { background: accent, boxShadow: '3px 3px 0 #000' },
        cvBtn: { background: accent, color: '#000000' },
      }
    case 'noir':
      return {
        ...base,
        barBg: 'bg-[#0C0A08]/85',
        brand: 'font-serif uppercase tracking-[0.18em]',
        link: 'px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] transition-colors',
        linkIdle: 'text-[#b5a58c]/80 hover:text-[#EAE2D6]',
        linkActive: 'text-[#EAE2D6]',
        linkActiveStyle: { boxShadow: `inset 0 -2px 0 ${accent}` },
        cvBtn: { background: accent, color: '#0C0A08' },
      }
    case 'monolith':
      return {
        ...base,
        barBg: 'bg-[#0B0D10]/85',
        brand: 'font-black uppercase tracking-tight',
        link: 'px-2.5 py-1 text-[11.5px] font-extrabold uppercase tracking-wider transition-colors',
        linkIdle: 'text-slate-400 hover:text-white',
        linkActive: 'text-white',
        linkActiveStyle: { boxShadow: `inset 0 -3px 0 ${accent}` },
      }
    case 'editorial':
      return {
        ...base,
        brand: 'font-serif',
        link: 'px-2.5 py-1 font-serif text-[13.5px] transition-colors',
        linkIdle: dark ? 'text-stone-400 hover:text-stone-200' : 'text-stone-600 hover:text-stone-900',
        linkActive: dark ? 'text-stone-100' : 'text-stone-900',
        linkActiveStyle: { boxShadow: `inset 0 -2px 0 ${dark ? '#D6D3D1' : '#1C1917'}` },
      }
    default:
      return base
  }
}

function SiteNav(p: {
  layout: PortfolioLayout
  dark: boolean
  accent: string
  brand: string
  photo?: string
  shell: string // template shell classes — the drawer tints itself with these
  items: NavItem[]
  active: NavKey
  preview?: boolean
  cvLink?: string
  onNavigate: (k: NavKey) => void
}) {
  const skin = navSkin(p.layout, p.dark, p.accent)
  const [open, setOpen] = useState(false)
  const barRef = useRef<HTMLElement | null>(null)
  const [narrow, setNarrow] = useState(false)

  // The bar switches to the hamburger below ~768px of ITS OWN width — this
  // matches the md: breakpoint on the live site AND makes the builder's
  // simulated phone preview show the real mobile nav (Tailwind breakpoints
  // only see the real viewport, never the simulated 390px box).
  useEffect(() => {
    const el = barRef.current
    if (!el) return
    const ro = new ResizeObserver(() => setNarrow(el.clientWidth < 768))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // Escape closes the drawer; body scroll locks while it's open — but only on
  // the live site, because in the builder preview <body> IS the editor page.
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    if (!p.preview) document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      if (!p.preview) document.body.style.overflow = ''
    }
  }, [open, p.preview])

  const go = (k: NavKey) => {
    setOpen(false)
    p.onNavigate(k)
  }

  const brandNode = (extra: string) => (
    <button onClick={() => go('home')} className={`flex min-w-0 items-center gap-2 text-left ${extra}`} aria-label="Home">
      {p.photo ? (
        <img
          src={p.photo}
          alt=""
          className="h-7 w-7 shrink-0 rounded-full object-cover ring-2"
          style={{ ['--tw-ring-color' as string]: p.accent }}
        />
      ) : (
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-black text-white" style={{ background: p.accent }}>
          {(p.brand || 'P').trim().charAt(0).toUpperCase() || 'P'}
        </span>
      )}
      <span className={`max-w-[36vw] truncate text-sm sm:max-w-52 ${skin.brand}`}>{p.brand || 'Portfolio'}</span>
    </button>
  )

  return (
    <>
      <header ref={barRef} className={`pf-nav sticky top-0 z-40 border-b backdrop-blur-md ${skin.bar} ${skin.barBg}`}>
        <div className="mx-auto flex h-14 max-w-5xl items-center gap-3 px-4 sm:px-6">
          {brandNode('')}
          {!narrow && (
            <nav className="ml-auto flex items-center gap-0.5" aria-label="Site sections">
              {p.items.map((it) => {
                const on = p.active === it.key
                return (
                  <button
                    key={it.key}
                    onClick={() => go(it.key)}
                    aria-current={on ? 'page' : undefined}
                    className={`${skin.link} ${on ? skin.linkActive : skin.linkIdle}`}
                    style={on ? skin.linkActiveStyle : undefined}
                  >
                    {on && skin.activePrefix ? `${skin.activePrefix} ` : ''}
                    {it.label}
                  </button>
                )
              })}
            </nav>
          )}
          <div className="ml-auto flex items-center gap-2 md:ml-2">
            {p.cvLink && (
              <a
                href={p.cvLink}
                className="hidden items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold shadow-sm transition-transform hover:-translate-y-0.5 sm:inline-flex"
                style={skin.cvBtn}
              >
                <FileDown className="h-3.5 w-3.5" /> CV
              </a>
            )}
            {narrow && (
              <button
                onClick={() => setOpen(true)}
                aria-label="Open menu"
                className={`inline-flex h-9 w-9 items-center justify-center rounded-lg border ${p.dark ? 'border-slate-700/80 text-slate-200' : 'border-slate-200 text-slate-700'}`}
              >
                <Menu className="h-4.5 w-4.5" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Mobile hamburger drawer — slides in from the right. In the builder
          preview the sim wrapper's translateZ(0) turns this fixed layer into
          a sim-box-relative one, so it stays inside the device frame. */}
      {open && (
        <div className="fixed inset-0 z-50" role="dialog" aria-modal="true">
          <button aria-label="Close menu" onClick={() => setOpen(false)} className="pf-drawer-overlay absolute inset-0 bg-black/55" />
          <div className={`pf-drawer-panel absolute inset-y-0 right-0 flex w-72 max-w-[85vw] flex-col shadow-2xl ${p.shell}`}>
            <div className={`flex items-center justify-between border-b px-4 py-3 ${p.dark ? 'border-white/10' : 'border-slate-200'}`}>
              {brandNode('')}
              <button
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className={`inline-flex h-8 w-8 items-center justify-center rounded-lg ${p.dark ? 'text-slate-400 hover:bg-white/10' : 'text-slate-500 hover:bg-slate-100'}`}
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>
            <nav className="flex-1 space-y-1 overflow-y-auto p-3" aria-label="Site sections">
              {p.items.map((it, i) => {
                const on = p.active === it.key
                return (
                  <button
                    key={it.key}
                    onClick={() => go(it.key)}
                    aria-current={on ? 'page' : undefined}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition-colors ${skin.drawerItem} ${on ? 'text-white' : ''}`}
                    style={on ? { background: p.accent } : undefined}
                  >
                    <span className={`w-5 shrink-0 text-[10px] font-black ${on ? 'text-white/70' : 'opacity-40'}`}>
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    {it.label}
                  </button>
                )
              })}
            </nav>
            {p.cvLink && (
              <div className={`border-t px-4 py-3 ${p.dark ? 'border-white/10' : 'border-slate-200'}`}>
                <a href={p.cvLink} className="flex items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-bold" style={skin.cvBtn}>
                  <FileDown className="h-4 w-4" /> Download my CV
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}

// ─── R9 · Gallery grid engine — every template ships a designed layout ──────
// masonry: natural-height columns (Lagoon, Bloom) · uniform: equal tiles
// (Atelier, Monolith...) · feature: oversized first image (Vogue, Noir...)
// bento: mixed-span tiles (Bento, Riot, Terminal). Captions + lightbox shared.

type GalleryVariant = 'masonry' | 'uniform' | 'feature' | 'bento'

const GALLERY_VARIANTS: Record<PortfolioLayout, GalleryVariant> = {
  signature: 'uniform', horizon: 'uniform', spotlight: 'feature',
  aura: 'uniform', riot: 'bento', editorial: 'feature', terminal: 'bento',
  bento: 'bento', vogue: 'feature', atelier: 'uniform', monolith: 'uniform',
  meridian: 'uniform', noir: 'feature', lagoon: 'masonry', bloom: 'masonry',
}

function GalleryGrid(p: {
  images: { id: string; image: string; caption: string }[]
  variant: GalleryVariant
  cardCls: string
  soft: string
  rVar?: React.CSSProperties
  onOpen: (index: number) => void
}) {
  const fig = 'pf-card group relative overflow-hidden border'
  const imgBtn = 'block w-full cursor-zoom-in'
  const zoom = 'transition-transform duration-300 group-hover:scale-[1.03]'

  if (p.variant === 'masonry') {
    return (
      <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
        {p.images.map((g, i) => (
          <figure key={g.id} className={`${fig} mb-4 break-inside-avoid ${p.cardCls}`} style={p.rVar}>
            <button type="button" onClick={() => p.onOpen(i)} className={imgBtn} aria-label={g.caption || 'View image'}>
              <img src={g.image} alt={g.caption || 'Gallery image'} loading="lazy" className={`w-full object-cover ${zoom}`} />
            </button>
            {g.caption && <figcaption className={`px-4 py-2.5 text-xs ${p.soft}`}>{g.caption}</figcaption>}
          </figure>
        ))}
      </div>
    )
  }

  if (p.variant === 'bento') {
    return (
      <div className="grid auto-rows-[150px] grid-cols-2 gap-3 sm:auto-rows-[170px] lg:grid-cols-4">
        {p.images.map((g, i) => {
          // 0 → 2×2 feature tile · every 4th → 2×1 wide · the rest square
          const span = i === 0 ? 'col-span-2 row-span-2' : i % 4 === 3 ? 'col-span-2' : ''
          return (
            <figure key={g.id} className={`${fig} ${p.cardCls} ${span}`} style={p.rVar}>
              <button type="button" onClick={() => p.onOpen(i)} className="block h-full w-full cursor-zoom-in" aria-label={g.caption || 'View image'}>
                <img src={g.image} alt={g.caption || 'Gallery image'} loading="lazy" className={`h-full w-full object-cover ${zoom}`} />
              </button>
              {g.caption && (
                <figcaption className="pointer-events-none absolute inset-x-0 bottom-0 truncate bg-gradient-to-t from-black/70 to-transparent px-3 pb-2 pt-7 text-[11px] font-medium text-white">
                  {g.caption}
                </figcaption>
              )}
            </figure>
          )
        })}
      </div>
    )
  }

  // uniform + feature share the tile grid; feature just promotes image #1
  const feature = p.variant === 'feature'
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
      {p.images.map((g, i) => {
        const first = feature && i === 0
        const lone = p.images.length === 1
        return (
          <figure key={g.id} className={`${fig} ${p.cardCls} ${first || lone ? 'col-span-2 lg:col-span-2' : ''}`} style={p.rVar}>
            <button type="button" onClick={() => p.onOpen(i)} className={imgBtn} aria-label={g.caption || 'View image'}>
              <img
                src={g.image}
                alt={g.caption || 'Gallery image'}
                loading="lazy"
                className={`${first || lone ? 'aspect-[16/10] lg:aspect-[16/9]' : 'aspect-[4/3]'} w-full object-cover ${zoom}`}
              />
            </button>
            {g.caption && <figcaption className={`truncate px-3 py-2 text-xs ${p.soft}`}>{g.caption}</figcaption>}
          </figure>
        )
      })}
    </div>
  )
}

// ─── helpers ─────────────────────────────────────────────────────────────────

const SECTION_LABELS = PORTFOLIO_SECTION_LABELS

function orderedSections(p: PortfolioSpec): PortfolioSectionKey[] {
  const custom = (p.sectionOrder || []).filter((k) => PORTFOLIO_SECTION_ORDER.includes(k))
  return [...custom, ...PORTFOLIO_SECTION_ORDER.filter((k) => !custom.includes(k))]
}

// ─── main renderer ───────────────────────────────────────────────────────────

export function PortfolioSite({ data: rawData, photoData, portfolio, preview, username }: PortfolioSiteProps) {
  // Normalize at the boundary — repairs missing ids on legacy entries so all
  // list keys are stable (pre-R3 share data had no ids).
  const data = normalizeCv(rawData)
  const p = normalizePortfolio(portfolio)
  const c = data.contact
  const layout: PortfolioLayout = p.layout
  const accent = /^#[0-9a-fA-F]{3,8}$/.test(p.accent) ? p.accent : '#4F46E5'
  const isNew = isPfNewLayout(layout)
  const tokens = isNew ? pfTokens(layout) : legacyTokens(layout)
  const dark = tokens.forceDark ? true : tokens.forceLight ? false : p.mode === 'dark'
  const font = p.font || tokens.defaultFont
  const radius = PORTFOLIO_RADIUS_PX[p.radius || 'round']
  const motion = p.motion || 'off'
  const rootRef = useRef<HTMLDivElement | null>(null)

  // ── R9 · site pages: home (hero + chosen sections) + one page per section.
  // Live sites navigate via the URL hash (#/gallery — shareable, back-button
  // friendly); the builder preview just flips internal state so it never
  // hijacks the editor's URL.
  const [view, setView] = useState<NavKey>('home')
  const [spyKey, setSpyKey] = useState<NavKey>('home')
  const [lightbox, setLightbox] = useState<number | null>(null)
  const live = !!username && !preview

  const sections = p.sections
  const tagline = p.tagline || c.jobTitle
  const about = p.about || data.summary

  // all socials: flexible links + legacy linkedin/website
  const socials: { kind: string; label: string; url: string }[] = []
  if (c.linkedin) socials.push({ kind: 'linkedin', label: 'LinkedIn', url: c.linkedin })
  if (c.website) socials.push({ kind: 'website', label: 'Website', url: c.website })
  for (const l of c.links || []) {
    if (!l.url) continue
    socials.push({ kind: l.kind, label: l.label || l.kind, url: l.url })
  }

  const shell = layout === 'terminal'
    ? 'bg-[#0A0F14] text-slate-300'
    : layout === 'monolith'
      ? 'bg-[#0B0D10] text-slate-200'
      : layout === 'noir'
        ? 'bg-[#0C0A08] text-[#EAE2D6]'
        : layout === 'editorial'
          ? dark
            ? 'bg-stone-950 text-stone-200'
            : 'bg-[#FAF9F6] text-stone-800'
          : layout === 'atelier'
            ? dark
              ? 'bg-[#1C1917] text-stone-200'
              : 'bg-[#F7F4EE] text-stone-800'
            : layout === 'lagoon'
              ? dark
                ? 'bg-[#07242B] text-slate-200'
                : 'bg-[#F0F9F8] text-slate-800'
              : layout === 'bloom'
                ? dark
                  ? 'bg-[#211B15] text-stone-200'
                  : 'bg-[#FAF6F0] text-stone-800'
                : layout === 'meridian'
                  ? dark
                    ? 'bg-slate-950 text-slate-200'
                    : 'bg-slate-50 text-slate-800'
                  : dark
                    ? 'bg-slate-950 text-slate-200'
                    : 'bg-white text-slate-800'
  const soft = dark ? 'text-slate-400' : 'text-slate-500'
  const wrap = layout === 'spotlight' ? 'mx-auto max-w-3xl px-6 sm:px-10' : layout === 'horizon' ? 'mx-auto max-w-5xl px-6 sm:px-10' : 'mx-auto max-w-4xl px-6 sm:px-10'
  const gap = 'py-12'
  const rVar = isNew ? { borderRadius: radius } : undefined

  const cvLink = username && !preview ? `/cv/${username}?mode=cv` : undefined
  const heroProps = {
    accent,
    dark,
    soft,
    name: c.fullName,
    tagline,
    location: c.location,
    email: c.email,
    photoData: photoData || undefined,
    socials,
    badge: (p.badge || '').trim(),
    cvLink,
    contactOn: !!sections.contact,
    username,
    preview,
  }

  const renderTitle = (k: PortfolioSectionKey, i: number) => tokens.title(k, i, SECTION_LABELS[k], accent, dark)

  const cardCls = tokens.card(dark)
  const chipCls = tokens.chip(dark)

  // ── R9 · which sections are real menu/homepage candidates — visible AND
  // non-empty, so no menu item ever leads to a blank page.
  const readyMap: Record<PortfolioSectionKey, boolean> = {
    about: !!about,
    projects: p.projects.length > 0,
    experience: data.experience.length > 0,
    education: data.education.length > 0,
    skills: data.skills.length > 0,
    testimonials: p.testimonials.length > 0,
    gallery: p.gallery.length > 0,
    contact: true,
  }
  const allPages = orderedSections(p).filter((k) => sections[k] && readyMap[k])
  // homepage = hero + the ⌂-picked subset; undefined/empty homeSections = ALL
  // sections on home (pre-R9 one-pager behaviour, untouched published sites)
  const homePicked = p.homeSections && p.homeSections.length > 0
    ? p.homeSections.filter((k) => sections[k] && readyMap[k])
    : allPages
  const homeKeys = homePicked.length > 0 ? homePicked : allPages // a homepage is never empty
  const navItems: NavItem[] = [
    { key: 'home', label: 'Home' },
    ...allPages.map((k) => ({ key: k as NavKey, label: SECTION_LABELS[k] })),
  ]
  const activeView: NavKey = view !== 'home' && allPages.includes(view) ? view : 'home'
  const allPagesKey = allPages.join(',')

  // live-only URL sync: read #/gallery on load, keep listening for back/forward
  useEffect(() => {
    if (!live) return
    const apply = () => {
      const h = decodeURIComponent(window.location.hash || '').replace(/^#\/?/, '')
      setView((PORTFOLIO_SECTION_ORDER as string[]).includes(h) ? (h as PortfolioSectionKey) : 'home')
    }
    apply()
    window.addEventListener('hashchange', apply)
    return () => window.removeEventListener('hashchange', apply)
  }, [live])

  const navigate = useCallback(
    (k: NavKey) => {
      setView(k)
      if (live) {
        const target = k === 'home' ? '#/' : `#/${k}`
        const current = window.location.hash
        const alreadyHome = k === 'home' && (current === '' || current === '#' || current === '#/')
        if (current !== target && !alreadyHome) window.location.hash = target
      }
      // scroll the site viewport back to the top — the browser window on the
      // live site, the preview pane (.pf-viewport) inside the builder
      requestAnimationFrame(() => {
        const scroller = rootRef.current?.closest('.pf-viewport') as HTMLElement | null
        if (scroller) scroller.scrollTo({ top: 0 })
        else window.scrollTo({ top: 0 })
      })
    },
    [live],
  )

  // R9 · scroll-spy on the homepage — the menu highlights the section you are
  // reading. Works both in the browser window (live) and inside the builder's
  // scrolling preview pane (IO root = .pf-viewport).
  useEffect(() => {
    if (activeView !== 'home') {
      setSpyKey(activeView)
      return
    }
    const root = rootRef.current
    if (!root) return
    const heroEl = root.querySelector<HTMLElement>('[data-pf-sec="home"]')
    const nodes = [
      ...(heroEl ? [heroEl] : []),
      ...homeKeys.map((k) => root.querySelector<HTMLElement>(`[data-pf-sec="${k}"]`)).filter((n): n is HTMLElement => !!n),
    ]
    if (nodes.length === 0) {
      setSpyKey('home')
      return
    }
    const scroller = root.closest('.pf-viewport') as HTMLElement | null
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            const k = (e.target as HTMLElement).dataset.pfSec as NavKey | undefined
            if (k) setSpyKey(k)
          }
        }
      },
      // thin horizontal band ~22% from the top decides "which section am I in"
      { root: scroller, rootMargin: '-18% 0px -72% 0px', threshold: 0 },
    )
    nodes.forEach((n) => io.observe(n))
    return () => io.disconnect()
  }, [activeView, allPagesKey, layout]) // homeKeys derive from allPages/sections

  // R9 · lightbox keyboard support + body scroll lock (live only, same reason
  // as the drawer — the preview pane must not freeze the builder page)
  const galleryCount = p.gallery.filter((g) => g.image).length
  useEffect(() => {
    if (lightbox === null) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightbox(null)
      if (e.key === 'ArrowRight' && galleryCount > 0) setLightbox((v) => (v === null ? v : (v + 1) % galleryCount))
      if (e.key === 'ArrowLeft' && galleryCount > 0) setLightbox((v) => (v === null ? v : (v - 1 + galleryCount) % galleryCount))
    }
    window.addEventListener('keydown', onKey)
    if (!preview) document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      if (!preview) document.body.style.overflow = ''
    }
  }, [lightbox, galleryCount, preview])

  // ── R7 motion system — IntersectionObserver adds .pf-in to reveal targets.
  // Re-runs when the layout, motion level or visible section set changes so
  // the builder preview re-animates live and newly enabled sections observe.
  const visibleKey = orderedSections(p)
    .filter((k) => sections[k])
    .join(',') + '|' + [p.projects.length, p.testimonials.length, p.gallery.length, data.experience.length, data.education.length, data.skills.length].join(',')
  useEffect(() => {
    if (motion === 'off') return
    const root = rootRef.current
    if (!root) return
    const targets = Array.from(root.querySelectorAll<HTMLElement>('[data-pf-reveal]'))
    if (targets.length === 0) return
    // stagger index per parent group (sibling cards cascade in)
    const counts = new Map<Element, number>()
    targets.forEach((t) => {
      const parent = t.parentElement
      if (!parent) return
      const n = counts.get(parent) || 0
      t.style.setProperty('--pf-d', String(Math.min(n, 5)))
      counts.set(parent, n + 1)
    })
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add('pf-in')
            io.unobserve(e.target)
          }
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -6% 0px' },
    )
    targets.forEach((t) => io.observe(t))
    return () => {
      io.disconnect()
      targets.forEach((t) => t.classList.remove('pf-in'))
    }
  }, [motion, layout, visibleKey, activeView, allPagesKey])

  // ── section bodies (shared across all 15 layouts, token-skinned) ─────────
  const body: Record<PortfolioSectionKey, React.ReactNode> = {
    about: about ? (
      <section className={gap}>
        {renderTitle("about", 0)}
        <p
          className={`whitespace-pre-line leading-relaxed ${tokens.aboutCenter ? 'text-center text-base' : ''} ${dark ? 'text-slate-300' : 'text-slate-600'} ${layout === 'editorial' && !tokens.aboutCenter ? 'font-serif text-[17px]' : ''}`}
        >
          {about}
        </p>
      </section>
    ) : null,

    projects: p.projects.length > 0 ? (
      <section className={gap}>
        {renderTitle("projects", 1)}
        <div className={tokens.projectsGrid}>
          {p.projects.filter((pr) => pr.title || pr.image).map((pr) => (
            <div key={pr.id} className={`pf-card overflow-hidden border transition-shadow ${layout === 'spotlight' ? '' : 'shadow-sm hover:shadow-lg'} ${cardCls}`} style={rVar}>
              {pr.image && <img src={pr.image} alt={pr.title || 'Project'} className="h-44 w-full object-cover" />}
              <div className="p-5">
                <h3 className="font-bold">{pr.title}</h3>
                {pr.tags && (
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {pr.tags.split(/[·,|]/).map((t, ti) => (
                      t.trim() && (
                        <span key={`${t}-${ti}`} className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${chipCls}`} style={rVar ? { borderRadius: 'calc(var(--pf-r, 16px) * 0.6)' } : undefined}>
                          {t.trim()}
                        </span>
                      )
                    ))}
                  </div>
                )}
                {pr.description && <p className={`mt-2.5 text-sm leading-relaxed ${dark ? 'text-slate-400' : 'text-slate-600'}`}>{pr.description}</p>}
                {(pr.url || pr.repoUrl) && (
                  <div className="mt-4 flex flex-wrap gap-3 text-xs font-semibold" style={{ color: accent }}>
                    {pr.url && (
                      <a href={withProtocol(pr.url)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:underline">
                        <ExternalLink className="h-3.5 w-3.5" /> Live
                      </a>
                    )}
                    {pr.repoUrl && (
                      <a href={withProtocol(pr.repoUrl)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:underline">
                        <Code2 className="h-3.5 w-3.5" /> Code
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    ) : null,

    gallery: p.gallery.length > 0 ? (
      <section className={gap}>
        {renderTitle("gallery", 6)}
        <GalleryGrid
          images={p.gallery.filter((g) => g.image).map((g) => ({ id: g.id, image: g.image, caption: g.caption }))}
          variant={GALLERY_VARIANTS[layout]}
          cardCls={cardCls}
          soft={soft}
          rVar={rVar}
          onOpen={setLightbox}
        />
      </section>
    ) : null,

    experience: data.experience.length > 0 ? (
      <section className={gap}>
        {renderTitle("experience", 2)}
        <div className="relative space-y-8 pl-6">
          <span className={`absolute left-0 top-2 bottom-2 w-px ${dark ? 'bg-slate-800' : 'bg-slate-200'}`} />
          {data.experience.map((e) => (
            <div key={e.id} className="relative">
              <span className="absolute -left-[26px] top-1.5 h-2.5 w-2.5 rounded-full ring-4" style={{ background: accent, ['--tw-ring-color' as string]: dark ? '#020617' : '#ffffff' }} />
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="font-bold">{e.role}</h3>
                <span className={`text-xs ${soft}`}>{dateRange(e.startDate, e.endDate)}</span>
              </div>
              <p className="text-sm font-medium" style={{ color: accent }}>
                {[e.company, e.location].filter(Boolean).join(' — ')}
              </p>
              {e.bullets.filter(Boolean).length > 0 && (
                <ul className={`mt-2 space-y-1 text-sm ${dark ? 'text-slate-400' : 'text-slate-600'}`}>
                  {e.bullets.filter(Boolean).map((b, i) => (
                    <li key={i} className="flex gap-2"><span style={{ color: accent }}>›</span>{b}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </section>
    ) : null,

    education: data.education.length > 0 ? (
      <section className={gap}>
        {renderTitle("education", 3)}
        <div className="space-y-5">
          {data.education.map((e) => (
            <div key={e.id} className={`pf-card flex items-start gap-4 border p-5 ${cardCls}`} style={rVar}>
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ background: `${accent}1a`, color: accent }}>
                <GraduationCap className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <h3 className="font-bold">{e.degree}</h3>
                <p className={`text-sm ${soft}`}>{[e.school, e.location].filter(Boolean).join(' · ')}</p>
                <p className="mt-1 text-xs" style={{ color: accent }}>
                  {dateRange(e.startDate, e.endDate)}
                  {e.note ? ` · ${e.note}` : ''}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    ) : null,

    skills: data.skills.length > 0 ? (
      <section className={gap}>
        {renderTitle("skills", 4)}
        <div className={`flex flex-wrap gap-2 ${tokens.skillsCenter ? 'justify-center' : ''}`}>
          {data.skills.map((s) => (
            <span key={s.id} className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold ${chipCls}`} style={rVar ? { borderRadius: '999px' } : undefined}>
              {layout === 'terminal' ? (
                <>[{s.name}]</>
              ) : (
                <>
                  <Sparkles className="h-3 w-3" style={{ color: accent }} /> {s.name}
                </>
              )}
            </span>
          ))}
        </div>
      </section>
    ) : null,

    testimonials: p.testimonials.length > 0 ? (
      <section className={gap}>
        {renderTitle("testimonials", 5)}
        <div className="grid gap-5 sm:grid-cols-2">
          {p.testimonials.filter((t) => t.quote.trim()).map((t) => (
            <blockquote key={t.id} className={`pf-card relative border p-5 ${layout === 'spotlight' ? '' : 'shadow-sm'} ${cardCls}`} style={rVar}>
              <Quote className="absolute right-4 top-4 h-6 w-6 opacity-15" style={{ color: accent }} />
              <p className={`text-sm leading-relaxed ${dark ? 'text-slate-300' : 'text-slate-700'}`}>&ldquo;{t.quote}&rdquo;</p>
              <footer className="mt-4 flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold" style={{ background: `${accent}1a`, color: accent }}>
                  {(t.author || '?').trim().charAt(0).toUpperCase()}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{t.author}</p>
                  {t.role && <p className={`truncate text-xs ${soft}`}>{t.role}</p>}
                </div>
              </footer>
            </blockquote>
          ))}
        </div>
      </section>
    ) : null,

    contact: (
      <section className={gap}>
        {(() => {
          const outline = tokens.contactSkin === 'outline'
          const skin = outline
            ? dark
              ? { background: '#0f172a', color: '#e2e8f0', border: '1px solid #1e293b' }
              : { background: '#ffffff', color: '#1e293b', border: `1.5px solid ${accent}` }
            : { background: `linear-gradient(135deg, ${accent}, ${accent}cc)`, color: '#ffffff' }
          return (
            <div className="px-6 py-10 text-center" style={{ ...skin, ...(rVar ? { borderRadius: `calc(var(--pf-r, 16px) * 1.75)` } : {}) }}>
              <Briefcase className="mx-auto mb-3 h-7 w-7 opacity-80" />
              <h2 className="text-2xl font-black">Let&apos;s work together</h2>
              <p className="mt-2 text-sm opacity-80">I&apos;m open to new opportunities — drop me a line.</p>
              <div className="mt-6 flex flex-col items-center gap-3">
                {c.email && (
                  <a
                    href={`mailto:${c.email}`}
                    className="inline-flex max-w-full items-center justify-center gap-2 rounded-full px-6 py-2.5 text-sm font-bold shadow-lg transition-transform hover:-translate-y-0.5"
                    style={outline ? { background: accent, color: '#ffffff' } : { background: '#ffffff', color: accent }}
                  >
                    <Mail className="h-4 w-4 shrink-0" />
                    <span className="break-all">{c.email}</span>
                  </a>
                )}
                {c.phone && (
                  <p className={`inline-flex items-center gap-1.5 text-xs opacity-80`}>
                    <Phone className="h-3 w-3 shrink-0" /> {c.phone}
                  </p>
                )}
              </div>
              {username && !preview && (c.email || c.phone) && (
                <div className="mt-5">
                  <a
                    href={`/api/vcard/${username}`}
                    className="inline-flex items-center gap-2 rounded-full px-5 py-2 text-xs font-semibold ring-1 backdrop-blur transition-transform hover:-translate-y-0.5"
                    style={
                      outline
                        ? { color: accent, borderColor: accent, border: `1px solid ${accent}` }
                        : { background: 'rgba(255,255,255,.15)', color: '#ffffff', borderColor: 'rgba(255,255,255,.4)', ['--tw-ring-color' as string]: 'rgba(255,255,255,.4)' }
                    }
                  >
                    <UserPlus className="h-3.5 w-3.5" /> Add me to contacts
                  </a>
                </div>
              )}
            </div>
          )
        })()}
      </section>
    ),
  }

  const Hero = tokens.Hero

  // one wrapper per rendered section — data-pf-sec powers the scroll-spy
  const sectionNode = (key: PortfolioSectionKey) => {
    const node = body[key]
    if (!node) return null
    return (
      <div key={key} data-pf-reveal data-pf-sec={key}>
        {node}
      </div>
    )
  }

  const footer = (
    <footer data-pf-reveal className={`pb-8 pt-2 text-center text-[11px] ${soft}`}>
      {username && !preview ? (
        <a href="/" className="hover:underline" style={{ color: accent }}>Made with SEEMEHERE</a>
      ) : (
        <span>Made with SEEMEHERE</span>
      )}
    </footer>
  )

  return (
    <div
      ref={rootRef}
      data-pf-motion={motion}
      className={`${shell} min-h-full overflow-x-clip font-sans`}
      style={{
        ['--pa' as string]: accent,
        ['--pf-r' as string]: radius,
        fontFamily: PORTFOLIO_FONT_STACKS[font],
      }}
    >
      <PfTexture kind={p.texture || 'plain'} accent={accent} dark={dark} />
      <div className="relative">
        {/* R9 · site menu bar + mobile hamburger (all 15 templates) */}
        <SiteNav
          layout={layout}
          dark={dark}
          accent={accent}
          brand={c.fullName}
          photo={photoData || undefined}
          shell={shell}
          items={navItems}
          active={spyKey}
          preview={preview}
          cvLink={cvLink}
          onNavigate={navigate}
        />

        {activeView === 'home' ? (
          <>
            <div className="pf-hero" data-pf-sec="home">
              <Hero {...heroProps} />
            </div>
            {/* marquee is a hero flourish — home page only */}
            {p.marquee?.trim() ? <div data-pf-reveal><PfMarquee text={p.marquee.trim()} accent={accent} /></div> : null}

            <div className={wrap}>
              {homeKeys.map((key) => sectionNode(key))}
              {footer}
            </div>
          </>
        ) : (
          // R9 · a section the owner left off the homepage gets its own page
          <div className={`${wrap} pt-12`}>
            {sectionNode(activeView as PortfolioSectionKey)}
            {footer}
          </div>
        )}
      </div>

      {/* R9 · gallery lightbox — tap to enlarge, arrows/Esc to browse & close */}
      {lightbox !== null && p.gallery.filter((g) => g.image)[lightbox] && (
        <div
          className="pf-lightbox fixed inset-0 z-[70] flex items-center justify-center bg-black/90 p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => setLightbox(null)}
        >
          <button aria-label="Close" className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20">
            <X className="h-5 w-5" />
          </button>
          {galleryCount > 1 && (
            <>
              <button
                aria-label="Previous image"
                onClick={(e) => { e.stopPropagation(); setLightbox((lightbox - 1 + galleryCount) % galleryCount) }}
                className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                aria-label="Next image"
                onClick={(e) => { e.stopPropagation(); setLightbox((lightbox + 1) % galleryCount) }}
                className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}
          <figure className="max-h-full" onClick={(e) => e.stopPropagation()}>
            <img
              src={p.gallery.filter((g) => g.image)[lightbox].image}
              alt={p.gallery.filter((g) => g.image)[lightbox].caption || 'Gallery image'}
              className="max-h-[82vh] max-w-full rounded-lg object-contain shadow-2xl"
            />
            {p.gallery.filter((g) => g.image)[lightbox].caption && (
              <figcaption className="mt-3 text-center text-sm text-white/80">
                {p.gallery.filter((g) => g.image)[lightbox].caption}
              </figcaption>
            )}
          </figure>
        </div>
      )}
    </div>
  )
}

/** Small helper so share pages can force the classic paper-CV look */
export function portfolioLooksEnabled(portfolio: unknown): boolean {
  try {
    const p = normalizePortfolio(portfolio)
    return !!p.enabled
  } catch {
    return false
  }
}
