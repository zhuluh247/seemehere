'use client'

// ─── R6 · Portfolio style system — the GenZ six ────────────────────────────
// Each style = a hero component + a token set (section titles, card/chip
// surfaces, grids, contact-card skin). PortfolioSite.tsx renders the shared
// section bodies through these tokens, so all 9 layouts (6 new + 3 R5
// originals) share one content pipeline.

import type { ReactNode } from 'react'
import type { PortfolioFont, PortfolioLayout, PortfolioSectionKey } from '@/lib/cv/types'
import {
  Mail, MapPin, Github, Linkedin, Twitter, Instagram, Youtube, Dribbble,
  Link2, Music2, Palette, Layers, BookOpen, ExternalLink, Code2, FileDown, Sparkles,
} from 'lucide-react'

export const withProtocol = (url: string): string => {
  const u = url.trim()
  if (!u) return ''
  if (/^https?:\/\//i.test(u)) return u
  return `https://${u}`
}

export function BrandIcon({ kind, className }: { kind: string; className?: string }) {
  switch (kind) {
    case 'github': return <Github className={className} />
    case 'linkedin': return <Linkedin className={className} />
    case 'x': return <Twitter className={className} />
    case 'instagram': return <Instagram className={className} />
    case 'youtube': return <Youtube className={className} />
    case 'tiktok': return <Music2 className={className} />
    case 'dribbble': return <Dribbble className={className} />
    case 'behance': return <Palette className={className} />
    case 'stackoverflow': return <Layers className={className} />
    case 'medium': return <BookOpen className={className} />
    default: return <Link2 className={className} />
  }
}

export interface PfSocial {
  kind: string
  label: string
  url: string
}

export interface PfHeroProps {
  accent: string
  dark: boolean
  soft?: string // legacy muted-text class (originals use it)
  name: string
  tagline: string
  location: string
  email: string
  photoData?: string
  socials: PfSocial[]
  badge: string // availability chip text ('' = hidden)
  cvLink?: string // /cv/name?mode=cv when live
  contactOn: boolean // "Hire me" CTA respects the contact section toggle
  username?: string
  preview?: boolean
}

// ── shared micro-components ──────────────────────────────────────────────────

/** Availability chip — green pulsing dot + text (used by every hero) */
export function PfBadge({ text, dark, className = '' }: { text: string; dark: boolean; className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-semibold ${
        dark ? 'bg-emerald-500/10 text-emerald-300 ring-1 ring-emerald-500/30' : 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
      } ${className}`}
    >
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
      </span>
      {text}
    </span>
  )
}

/** Scrolling ribbon under the hero — shown when PortfolioSpec.marquee is set */
export function PfMarquee({ text, accent }: { text: string; accent: string }) {
  const chunk = `${text}   ✦   `
  return (
    <div className="overflow-hidden border-y py-2.5" style={{ borderColor: `${accent}33`, background: `${accent}0d` }}>
      <div className="pf-marquee-track whitespace-nowrap text-sm font-extrabold uppercase tracking-[0.2em]" style={{ color: accent }}>
        <span>{chunk.repeat(8)}</span>
        <span aria-hidden>{chunk.repeat(8)}</span>
      </div>
    </div>
  )
}

/** Background texture layer — grid / dots / gradient blobs (plain = nothing) */
export function PfTexture({ kind, accent, dark }: { kind: string; accent: string; dark: boolean }) {
  if (kind === 'grid') {
    const line = dark ? 'rgba(148,163,184,.09)' : 'rgba(15,23,42,.06)'
    return (
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ backgroundImage: `linear-gradient(${line} 1px, transparent 1px), linear-gradient(90deg, ${line} 1px, transparent 1px)`, backgroundSize: '44px 44px' }}
      />
    )
  }
  if (kind === 'dots') {
    const dot = dark ? 'rgba(148,163,184,.16)' : 'rgba(15,23,42,.10)'
    return (
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ backgroundImage: `radial-gradient(${dot} 1.5px, transparent 1.5px)`, backgroundSize: '26px 26px' }}
      />
    )
  }
  if (kind === 'blobs') {
    return (
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(38% 30% at 12% 8%, ${accent}26, transparent 70%), radial-gradient(30% 26% at 88% 18%, ${accent}1a, transparent 70%), radial-gradient(34% 28% at 70% 92%, ${accent}14, transparent 70%)`,
        }}
      />
    )
  }
  return null
}

// ── AURA — gradient glow + glassmorphism ─────────────────────────────────────

function AuraHero(p: PfHeroProps) {
  const glass = p.dark ? 'bg-white/5 border-white/10 text-slate-200' : 'bg-white/65 border-white/70 text-slate-700'
  return (
    <section className="relative overflow-hidden px-6 pb-16 pt-14 text-center sm:pt-20">
      <div className="relative mx-auto max-w-3xl">
        {p.photoData && (
          <img
            src={p.photoData}
            alt={p.name || 'Profile'}
            className="mx-auto mb-7 h-28 w-28 rounded-full object-cover shadow-xl"
            style={{ border: `3px solid ${p.accent}` }}
          />
        )}
        {p.badge && <div className="mb-5"><PfBadge text={p.badge} dark={p.dark} /></div>}
        <h1
          className="text-5xl font-black leading-[1.04] tracking-tight sm:text-7xl"
          style={{
            backgroundImage: `linear-gradient(115deg, ${p.accent} 20%, #EC4899 90%)`,
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
          }}
        >
          {p.name || 'Your Name'}
        </h1>
        {p.tagline && <p className={`mt-5 text-lg font-semibold sm:text-xl ${p.dark ? 'text-slate-200' : 'text-slate-700'}`}>{p.tagline}</p>}
        {p.location && <p className={`mt-3 text-sm inline-flex items-center gap-1.5 ${p.dark ? 'text-slate-400' : 'text-slate-500'}`}><MapPin className="h-3.5 w-3.5" /> {p.location}</p>}
        {(p.socials.length > 0 || p.email) && (
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2.5">
            {p.email && (
              <a href={`mailto:${p.email}`} aria-label="Email" className={`inline-flex h-11 w-11 items-center justify-center rounded-full border backdrop-blur-md transition-transform hover:scale-110 ${glass}`}>
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
                className={`inline-flex h-11 w-11 items-center justify-center rounded-full border backdrop-blur-md transition-transform hover:scale-110 ${glass}`}
              >
                <BrandIcon kind={s.kind} className="h-4.5 w-4.5" />
              </a>
            ))}
          </div>
        )}
        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          {p.cvLink && (
            <a
              href={p.cvLink}
              className="inline-flex items-center gap-2 rounded-full px-7 py-3 text-sm font-bold text-white shadow-lg transition-transform hover:-translate-y-0.5"
              style={{ background: `linear-gradient(115deg, ${p.accent}, #EC4899)` }}
            >
              <FileDown className="h-4 w-4" /> Get my CV
            </a>
          )}
          {p.email && p.contactOn && (
            <a
              href={`mailto:${p.email}`}
              className={`inline-flex items-center gap-2 rounded-full border px-7 py-3 text-sm font-semibold backdrop-blur-md transition-transform hover:-translate-y-0.5 ${glass}`}
            >
              <Mail className="h-4 w-4" /> Hire me
            </a>
          )}
        </div>
      </div>
    </section>
  )
}

// ── RIOT — neobrutalism (light personality: thick borders, hard shadows) ────

function RiotStar({ className, color }: { className?: string; color: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill={color} aria-hidden>
      <path d="M12 0l2.4 7.2L22 6l-5.2 5.6L24 16l-7.6-.4L15 24l-3-6.4L9 24l-1.4-8.4L0 16l7.2-4.4L2 6l7.6 1.2L12 0z" />
    </svg>
  )
}

function RiotHero(p: PfHeroProps) {
  return (
    <section className="relative overflow-hidden px-6 pb-14 pt-12 sm:pt-16">
      <RiotStar className="absolute right-[8%] top-10 h-10 w-10 rotate-12" color={p.accent} />
      <RiotStar className="absolute bottom-14 left-[6%] h-6 w-6 -rotate-12" color="#FACC15" />
      <div className="pointer-events-none absolute -right-10 top-24 h-28 w-28 rotate-12 rounded-xl border-4 border-black bg-sky-300/60" />
      <div className="relative mx-auto max-w-4xl">
        {p.badge && (
          <span className="inline-block -rotate-2 rounded-md border-2 border-black bg-emerald-300 px-3 py-1 text-xs font-black uppercase tracking-wide shadow-[3px_3px_0_#000]">
            {p.badge}
          </span>
        )}
        <h1 className="mt-5">
          <span
            className="inline-block max-w-full -rotate-1 break-words border-4 border-black px-4 py-2 text-4xl font-black uppercase leading-[1.05] tracking-tight text-white shadow-[8px_8px_0_#000] sm:text-6xl"
            style={{ background: p.accent }}
          >
            {p.name || 'Your Name'}
          </span>
        </h1>
        {p.tagline && (
          <p className="mt-6 inline-block rotate-[0.5deg] border-2 border-black bg-white px-3.5 py-1.5 text-sm font-bold shadow-[3px_3px_0_#000]">
            {p.tagline}
          </p>
        )}
        {p.photoData && (
          <div className="mt-8 inline-block rotate-2 overflow-hidden rounded-lg border-4 border-black shadow-[6px_6px_0_#000]">
            <img src={p.photoData} alt={p.name || 'Profile'} className="h-36 w-36 object-cover" />
          </div>
        )}
        {p.location && <p className="mt-4 text-sm font-bold uppercase tracking-wide text-slate-500">📍 {p.location}</p>}
        {(p.socials.length > 0 || p.email) && (
          <div className="mt-7 flex flex-wrap items-center gap-3">
            {p.email && (
              <a
                href={`mailto:${p.email}`}
                aria-label="Email"
                className="inline-flex h-11 w-11 items-center justify-center rounded-lg border-2 border-black bg-white shadow-[3px_3px_0_#000] transition-transform hover:-translate-y-0.5 hover:shadow-[4px_5px_0_#000]"
              >
                <Mail className="h-5 w-5" />
              </a>
            )}
            {p.socials.map((s, i) => (
              <a
                key={i}
                href={withProtocol(s.url)}
                target="_blank"
                rel="noopener noreferrer"
                title={s.label}
                className={`inline-flex h-11 w-11 items-center justify-center rounded-lg border-2 border-black shadow-[3px_3px_0_#000] transition-transform hover:-translate-y-0.5 hover:shadow-[4px_5px_0_#000] ${i % 2 ? 'bg-amber-200' : 'bg-white'}`}
              >
                <BrandIcon kind={s.kind} className="h-5 w-5" />
              </a>
            ))}
          </div>
        )}
        <div className="mt-9 flex flex-wrap items-center gap-4">
          {p.cvLink && (
            <a
              href={p.cvLink}
              className="inline-flex items-center gap-2 rounded-lg border-4 border-black px-6 py-2.5 text-sm font-black uppercase tracking-wide shadow-[6px_6px_0_#000] transition-transform hover:-translate-y-0.5 hover:shadow-[7px_8px_0_#000]"
              style={{ background: p.accent, color: '#fff' }}
            >
              <FileDown className="h-4 w-4" /> Get my CV
            </a>
          )}
          {p.email && p.contactOn && (
            <a
              href={`mailto:${p.email}`}
              className="inline-flex items-center gap-2 rounded-lg border-4 border-black bg-white px-6 py-2.5 text-sm font-black uppercase tracking-wide shadow-[6px_6px_0_#000] transition-transform hover:-translate-y-0.5 hover:shadow-[7px_8px_0_#000]"
            >
              <Mail className="h-4 w-4" /> Hire me
            </a>
          )}
        </div>
      </div>
    </section>
  )
}

// ── EDITORIAL — magazine serif, numbered sections ────────────────────────────

function EditorialHero(p: PfHeroProps) {
  const year = new Date().getFullYear()
  return (
    <section className="px-6 pb-12 pt-14 text-center sm:pt-20">
      <p className="text-[10px] font-bold uppercase tracking-[0.45em] opacity-50">Portfolio · {year}</p>
      <h1 className="mx-auto mt-7 max-w-3xl font-serif text-5xl font-bold leading-[1.04] tracking-tight sm:text-7xl">
        {p.name || 'Your Name'}
      </h1>
      {p.tagline && <p className="mt-5 font-serif text-xl italic sm:text-2xl" style={{ color: p.accent }}>{p.tagline}</p>}
      {p.badge && <div className="mt-6 flex justify-center"><PfBadge text={p.badge} dark={p.dark} /></div>}
      <div className="mx-auto mt-9 flex max-w-xs items-center gap-3">
        <span className="h-px flex-1 bg-current opacity-20" />
        <span className="h-1.5 w-1.5 rotate-45" style={{ background: p.accent }} />
        <span className="h-px flex-1 bg-current opacity-20" />
      </div>
      {p.photoData && (
        <img src={p.photoData} alt={p.name || 'Profile'} className="mx-auto mt-9 h-24 w-24 rounded-full object-cover" style={{ border: `2px solid ${p.accent}` }} />
      )}
      {p.location && <p className={`mt-5 text-sm inline-flex items-center gap-1.5 opacity-70`}><MapPin className="h-3.5 w-3.5" /> {p.location}</p>}
      {(p.socials.length > 0 || p.email) && (
        <div className="mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          {p.email && (
            <a href={`mailto:${p.email}`} className="text-[11px] font-bold uppercase tracking-[0.25em] transition-opacity hover:opacity-60" style={{ color: p.accent }}>
              Email
            </a>
          )}
          {p.socials.map((s, i) => (
            <a
              key={i}
              href={withProtocol(s.url)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] font-bold uppercase tracking-[0.25em] opacity-70 transition-opacity hover:opacity-100"
            >
              {s.label || s.kind}
            </a>
          ))}
        </div>
      )}
      <div className="mt-10 flex flex-wrap items-center justify-center gap-x-10 gap-y-3">
        {p.cvLink && (
          <a href={p.cvLink} className="inline-flex items-center gap-2 border-b-2 pb-1 text-xs font-bold uppercase tracking-[0.3em] transition-opacity hover:opacity-60" style={{ borderColor: p.accent, color: p.accent }}>
            <FileDown className="h-3.5 w-3.5" /> Get my CV
          </a>
        )}
        {p.email && p.contactOn && (
          <a href={`mailto:${p.email}`} className="inline-flex items-center gap-2 border-b-2 border-current pb-1 text-xs font-bold uppercase tracking-[0.3em] opacity-70 transition-opacity hover:opacity-100">
            <Mail className="h-3.5 w-3.5" /> Hire me
          </a>
        )}
      </div>
    </section>
  )
}

// ── TERMINAL — dark dev console (forces dark) ────────────────────────────────

function TerminalHero(p: PfHeroProps) {
  const handle = (p.name || 'your-name').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'portfolio'
  return (
    <section className="px-6 pb-12 pt-12 sm:pt-16">
      <div className="mx-auto max-w-3xl overflow-hidden rounded-xl border border-white/10 bg-[#0D1420] shadow-2xl shadow-black/40">
        <div className="flex items-center gap-1.5 border-b border-white/10 bg-white/5 px-4 py-3">
          <span className="h-3 w-3 rounded-full bg-[#FF5F57]" />
          <span className="h-3 w-3 rounded-full bg-[#FEBC2E]" />
          <span className="h-3 w-3 rounded-full bg-[#28C840]" />
          <span className="ml-3 font-mono text-[11px] text-slate-400">{handle}@portfolio — zsh</span>
        </div>
        <div className="space-y-3 px-5 py-7 font-mono text-sm sm:px-7 sm:text-base">
          <p className="text-slate-400"><span className="text-emerald-400">➜</span> <span className="text-sky-400">~</span> whoami</p>
          <p className="text-2xl font-bold tracking-tight sm:text-4xl" style={{ color: p.accent }}>{p.name || 'Your Name'}</p>
          {p.tagline && <p className="text-slate-400"># {p.tagline}</p>}
          {p.location && <p className="text-slate-500">{"//"} 📍 {p.location}</p>}
          {p.badge && (
            <p>
              <span className="rounded bg-emerald-500/15 px-2.5 py-1 text-xs font-semibold text-emerald-300">● {p.badge}</span>
            </p>
          )}
          {p.photoData && (
            <img src={p.photoData} alt={p.name || 'Profile'} className="my-2 h-20 w-20 rounded-lg border border-white/10 object-cover" />
          )}
          {(p.socials.length > 0 || p.email) && (
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-slate-500">links =</span>
              {p.email && (
                <a href={`mailto:${p.email}`} className="rounded border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-slate-200 transition-colors hover:border-white/25">
                  "email"
                </a>
              )}
              {p.socials.map((s, i) => (
                <a
                  key={i}
                  href={withProtocol(s.url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-slate-200 transition-colors hover:border-white/25"
                >
                  <BrandIcon kind={s.kind} className="h-3 w-3" /> "{s.label || s.kind}"
                </a>
              ))}
            </div>
          )}
          <div className="flex flex-wrap gap-3 pt-2">
            {p.cvLink && (
              <a
                href={p.cvLink}
                className="inline-flex items-center gap-2 rounded-md px-4 py-2 font-mono text-xs font-bold text-black transition-transform hover:-translate-y-0.5"
                style={{ background: p.accent }}
              >
                $ open cv.pdf
              </a>
            )}
            {p.email && p.contactOn && (
              <a
                href={`mailto:${p.email}`}
                className="inline-flex items-center gap-2 rounded-md border border-white/15 px-4 py-2 font-mono text-xs font-bold text-slate-200 transition-colors hover:border-white/35"
              >
                $ ./hire-me.sh
              </a>
            )}
          </div>
          <p className="pt-1 text-slate-400">
            <span className="text-emerald-400">➜</span> <span className="text-sky-400">~</span> <span className="pf-cursor">▊</span>
          </p>
        </div>
      </div>
    </section>
  )
}

// ── BENTO — image-forward tile grid ──────────────────────────────────────────

function BentoHero(p: PfHeroProps) {
  const tile = `overflow-hidden rounded-3xl border p-5 ${p.dark ? 'border-white/10 bg-white/5' : 'border-slate-200/70 bg-white shadow-sm'}`
  const tileMuted = p.dark ? 'text-slate-400' : 'text-slate-500'
  return (
    <section className="px-6 pb-10 pt-12 sm:pt-16">
      <div className="mx-auto grid max-w-4xl grid-cols-2 gap-3 sm:grid-cols-4">
        <div className={`${tile} col-span-2 flex flex-col justify-between sm:col-span-3 sm:p-7`}>
          {p.badge && <div className="mb-4"><PfBadge text={p.badge} dark={p.dark} /></div>}
          <div>
            <h1 className="text-3xl font-black tracking-tight sm:text-5xl">{p.name || 'Your Name'}</h1>
            {p.tagline && <p className="mt-3 text-base font-medium sm:text-lg" style={{ color: p.accent }}>{p.tagline}</p>}
          </div>
          <div className="mt-6 flex flex-wrap gap-2.5">
            {p.cvLink && (
              <a href={p.cvLink} className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-bold text-white transition-transform hover:-translate-y-0.5" style={{ background: p.accent }}>
                <FileDown className="h-3.5 w-3.5" /> Get my CV
              </a>
            )}
            {p.email && p.contactOn && (
              <a href={`mailto:${p.email}`} className={`inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-xs font-semibold transition-transform hover:-translate-y-0.5 ${p.dark ? 'border-white/15 text-slate-200' : 'border-slate-200 text-slate-700'}`}>
                <Mail className="h-3.5 w-3.5" /> Hire me
              </a>
            )}
          </div>
        </div>

        <div className={`${tile} flex items-center justify-center`}>
          {p.photoData ? (
            <img src={p.photoData} alt={p.name || 'Profile'} className="h-24 w-24 rounded-2xl object-cover sm:h-28 sm:w-28" />
          ) : (
            <span className="flex h-24 w-24 items-center justify-center rounded-2xl text-3xl font-black text-white sm:h-28 sm:w-28" style={{ background: p.accent }}>
              {(p.name || '?').trim().charAt(0).toUpperCase()}
            </span>
          )}
        </div>

        <div className={`${tile} col-span-2 sm:col-span-1`}>
          <p className={`text-[10px] font-bold uppercase tracking-widest ${tileMuted}`}>Location</p>
          <p className="mt-2 flex items-center gap-1.5 text-sm font-semibold"><MapPin className="h-4 w-4" style={{ color: p.accent }} /> {p.location || '—'}</p>
          {p.email && <p className="mt-2 truncate text-xs text-slate-400">{p.email}</p>}
        </div>

        {(p.socials.length > 0 || p.email) && (
          <div className={`${tile} col-span-2`}>
            <p className={`text-[10px] font-bold uppercase tracking-widest ${tileMuted}`}>Find me</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {p.email && (
                <a href={`mailto:${p.email}`} aria-label="Email" className="inline-flex h-9 w-9 items-center justify-center rounded-full text-white transition-transform hover:scale-110" style={{ background: p.accent }}>
                  <Mail className="h-4 w-4" />
                </a>
              )}
              {p.socials.map((s, i) => (
                <a
                  key={i}
                  href={withProtocol(s.url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={s.label}
                  className={`inline-flex h-9 w-9 items-center justify-center rounded-full border transition-transform hover:scale-110 ${p.dark ? 'border-white/10 text-slate-300' : 'border-slate-200 text-slate-600'}`}
                >
                  <BrandIcon kind={s.kind} className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
        )}

        <div className={`${tile} col-span-2 flex items-center justify-center py-4`}>
          <span className="inline-flex items-center gap-2 text-xs font-semibold" style={{ color: p.accent }}>
            <Sparkles className="h-4 w-4" /> Building in public · {new Date().getFullYear()}
          </span>
        </div>
      </div>
    </section>
  )
}

// ── VOGUE — luxe minimal, thin rules ─────────────────────────────────────────

function VogueHero(p: PfHeroProps) {
  return (
    <section className="px-6 pb-16 pt-20 text-center sm:pt-28">
      <p className="text-[10px] uppercase tracking-[0.5em] opacity-40">Portfolio</p>
      <h1 className="mx-auto mt-9 max-w-4xl break-words text-4xl font-light uppercase leading-[1.15] tracking-[0.14em] sm:text-6xl sm:tracking-[0.28em]">
        {p.name || 'Your Name'}
      </h1>
      {p.tagline && <p className="mt-7 font-serif text-lg italic opacity-70 sm:text-xl">{p.tagline}</p>}
      {p.badge && <div className="mt-7 flex justify-center"><PfBadge text={p.badge} dark={p.dark} /></div>}
      <span className="mx-auto mt-11 block h-px w-16" style={{ background: p.accent }} />
      {p.photoData && (
        <img src={p.photoData} alt={p.name || 'Profile'} className="mx-auto mt-12 h-28 w-28 rounded-full object-cover" style={{ border: `1px solid ${p.accent}55` }} />
      )}
      {p.location && <p className={`mt-8 text-[11px] uppercase tracking-[0.3em] opacity-50`}>{p.location}</p>}
      {(p.socials.length > 0 || p.email) && (
        <div className="mt-9 flex flex-wrap items-center justify-center gap-x-8 gap-y-2.5">
          {p.email && (
            <a href={`mailto:${p.email}`} className="text-[11px] uppercase tracking-[0.25em] opacity-60 transition-opacity hover:opacity-100">
              Email
            </a>
          )}
          {p.socials.map((s, i) => (
            <a
              key={i}
              href={withProtocol(s.url)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] uppercase tracking-[0.25em] opacity-60 transition-opacity hover:opacity-100"
            >
              {s.label || s.kind}
            </a>
          ))}
        </div>
      )}
      <div className="mt-12 flex flex-wrap items-center justify-center gap-x-10 gap-y-3">
        {p.cvLink && (
          <a
            href={p.cvLink}
            className="inline-flex items-center gap-2 border-b pb-1.5 text-[11px] uppercase tracking-[0.3em] transition-opacity hover:opacity-60"
            style={{ borderColor: p.accent, color: p.accent }}
          >
            <FileDown className="h-3.5 w-3.5" /> Get my CV
          </a>
        )}
        {p.email && p.contactOn && (
          <a
            href={`mailto:${p.email}`}
            className="inline-flex items-center gap-2 border-b border-current pb-1.5 text-[11px] uppercase tracking-[0.3em] opacity-60 transition-opacity hover:opacity-100"
          >
            <Mail className="h-3.5 w-3.5" /> Hire me
          </a>
        )}
      </div>
    </section>
  )
}

// ── ATELIER — studio minimal · ivory & serif (professional) ─────────────────

function AtelierHero(p: PfHeroProps) {
  const year = new Date().getFullYear()
  return (
    <section className="relative overflow-hidden px-6 pb-14 pt-10 sm:pt-14">
      <div className="mx-auto max-w-4xl">
        <div className="flex items-center justify-between border-b pb-4 text-[10px] font-bold uppercase tracking-[0.4em] opacity-50">
          <span>Portfolio</span>
          <span>{year}</span>
        </div>
        <h1
          className="mt-10 break-words font-serif font-medium leading-[1.05] tracking-tight"
          style={{ fontSize: 'clamp(2.75rem, 7.5vw, 4.75rem)' }}
        >
          {p.name || 'Your Name'}
        </h1>
        {p.tagline && <p className="mt-5 max-w-xl font-serif text-lg italic opacity-75 sm:text-xl">{p.tagline}</p>}
        {p.badge && <div className="mt-7"><PfBadge text={p.badge} dark={p.dark} /></div>}
        <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] font-semibold uppercase tracking-[0.25em] opacity-70">
          {p.location && (
            <span className="inline-flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> {p.location}</span>
          )}
          {p.socials.map((s, i) => (
            <a
              key={i}
              href={withProtocol(s.url)}
              target="_blank"
              rel="noopener noreferrer"
              className="transition-opacity hover:opacity-60"
            >
              {s.label || s.kind}
            </a>
          ))}
        </div>
        <div className="mt-9 flex flex-wrap items-center gap-3">
          {p.cvLink && (
            <a
              href={p.cvLink}
              className="inline-flex items-center gap-2 border px-6 py-3 text-[11px] font-bold uppercase tracking-[0.25em] transition-colors hover:bg-black/5"
              style={{ borderColor: p.accent, color: p.dark ? '#E7E5E4' : '#292524' }}
            >
              <FileDown className="h-3.5 w-3.5" /> Download CV
            </a>
          )}
          {p.email && p.contactOn && (
            <a
              href={`mailto:${p.email}`}
              className="inline-flex items-center gap-2 px-6 py-3 text-[11px] font-bold uppercase tracking-[0.25em] text-white transition-opacity hover:opacity-85"
              style={{ background: p.accent }}
            >
              Start a project <span aria-hidden>&rarr;</span>
            </a>
          )}
        </div>
      </div>
    </section>
  )
}

// ── MONOLITH — bold corporate spec-sheet (professional, always dark) ────────

function MonolithHero(p: PfHeroProps) {
  const specs = [
    p.location ? { label: 'Based in', value: p.location } : null,
    p.email ? { label: 'Contact', value: p.email } : null,
    p.badge ? { label: 'Status', value: p.badge } : null,
  ].filter(Boolean) as { label: string; value: string }[]
  return (
    <section className="relative overflow-hidden px-6 pb-14 pt-12 sm:pt-16">
      <span className="pf-ambient pointer-events-none absolute -right-24 top-10 h-64 w-64 rounded-full border-[24px] border-white/[0.04]" aria-hidden />
      <span className="pf-ambient pointer-events-none absolute -left-20 bottom-6 h-44 w-44 rounded-full border-[18px] border-white/[0.03]" aria-hidden />
      <div className="relative mx-auto max-w-4xl">
        <p className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.4em] text-slate-400">
          <span className="inline-block h-2.5 w-2.5" style={{ background: p.accent }} /> Portfolio — {new Date().getFullYear()}
        </p>
        <h1
          className="mt-6 break-words font-black uppercase leading-[0.95] tracking-tight text-white"
          style={{ fontSize: 'clamp(2.6rem, 9vw, 6.25rem)' }}
        >
          {p.name || 'Your Name'}
        </h1>
        <div className="mt-5 h-1.5 w-24" style={{ background: p.accent }} />
        {p.tagline && <p className="mt-6 max-w-2xl text-base font-medium text-slate-300 sm:text-lg">{p.tagline}</p>}
        {specs.length > 0 && (
          <div className="mt-9 grid gap-px overflow-hidden border border-white/10 bg-white/10 sm:grid-cols-3">
            {specs.map((s) => (
              <div key={s.label} className="min-w-0 bg-[#0B0D10] px-5 py-4">
                <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-slate-500">{s.label}</p>
                <p className="mt-1.5 truncate text-sm font-semibold text-slate-200">{s.value}</p>
              </div>
            ))}
          </div>
        )}
        {(p.socials.length > 0 || p.email) && (
          <div className="mt-8 flex flex-wrap items-center gap-2.5">
            {p.email && (
              <a
                href={`mailto:${p.email}`}
                aria-label="Email"
                className="inline-flex h-10 w-10 items-center justify-center border border-white/15 bg-white/5 text-slate-200 transition-colors hover:border-white/40"
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
                className="inline-flex h-10 w-10 items-center justify-center border border-white/15 text-slate-300 transition-colors hover:border-white/40 hover:text-white"
              >
                <BrandIcon kind={s.kind} className="h-4.5 w-4.5" />
              </a>
            ))}
          </div>
        )}
        <div className="mt-9 flex flex-wrap gap-3">
          {p.cvLink && (
            <a
              href={p.cvLink}
              className="inline-flex items-center gap-2 px-7 py-3 text-xs font-black uppercase tracking-[0.2em] text-black transition-transform hover:-translate-y-0.5"
              style={{ background: p.accent }}
            >
              <FileDown className="h-4 w-4" /> View my CV
            </a>
          )}
          {p.email && p.contactOn && (
            <a
              href={`mailto:${p.email}`}
              className="inline-flex items-center gap-2 border border-white/25 px-7 py-3 text-xs font-black uppercase tracking-[0.2em] text-slate-200 transition-colors hover:border-white/50"
            >
              <Mail className="h-4 w-4" /> Work with me
            </a>
          )}
        </div>
      </div>
    </section>
  )
}

// ── MERIDIAN — clean consulting, structured (professional) ──────────────────

function MeridianHero(p: PfHeroProps) {
  return (
    <section className="relative overflow-hidden px-6 pb-14 pt-14 text-center sm:pt-20">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-56" aria-hidden style={{ background: `linear-gradient(180deg, ${p.accent}14, transparent)` }} />
      <div className="relative mx-auto max-w-2xl">
        {p.photoData && (
          <img
            src={p.photoData}
            alt={p.name || 'Profile'}
            className={`mx-auto mb-6 h-24 w-24 rounded-2xl object-cover shadow-lg ring-4 ${p.dark ? 'ring-slate-900' : 'ring-white'}`}
          />
        )}
        <p className="text-[10px] font-bold uppercase tracking-[0.35em] opacity-50">Portfolio &amp; Curriculum Vitae</p>
        <h1 className="mt-4 break-words text-4xl font-extrabold tracking-tight sm:text-6xl">{p.name || 'Your Name'}</h1>
        {p.tagline && <p className="mt-4 text-base font-medium sm:text-lg" style={{ color: p.accent }}>{p.tagline}</p>}
        {p.badge && <div className="mt-5 flex justify-center"><PfBadge text={p.badge} dark={p.dark} /></div>}
        {p.location && <p className="mt-3 text-sm opacity-70 inline-flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> {p.location}</p>}
        {(p.socials.length > 0 || p.email) && (
          <div className="mt-7 flex flex-wrap items-center justify-center gap-2">
            {p.email && (
              <a
                href={`mailto:${p.email}`}
                className="inline-flex h-10 items-center gap-1.5 rounded-full border px-4 text-xs font-semibold transition-colors"
                style={{ borderColor: `${p.accent}55`, color: p.dark ? '#E2E8F0' : '#334155' }}
              >
                <Mail className="h-3.5 w-3.5" style={{ color: p.accent }} /> Email
              </a>
            )}
            {p.socials.map((s, i) => (
              <a
                key={i}
                href={withProtocol(s.url)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-10 items-center gap-1.5 rounded-full border border-slate-200 px-4 text-xs font-semibold text-slate-600 transition-colors hover:border-slate-400 dark:border-slate-700 dark:text-slate-300"
              >
                <BrandIcon kind={s.kind} className="h-3.5 w-3.5" /> {s.label || s.kind}
              </a>
            ))}
          </div>
        )}
        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          {p.cvLink && (
            <a
              href={p.cvLink}
              className="inline-flex items-center gap-2 rounded-full px-7 py-3 text-sm font-bold text-white shadow-md transition-transform hover:-translate-y-0.5"
              style={{ background: p.accent }}
            >
              <FileDown className="h-4 w-4" /> Get my CV
            </a>
          )}
          {p.email && p.contactOn && (
            <a
              href={`mailto:${p.email}`}
              className="inline-flex items-center gap-2 rounded-full border px-7 py-3 text-sm font-semibold transition-colors"
              style={{ borderColor: `${p.accent}55`, color: p.dark ? '#E2E8F0' : '#334155' }}
            >
              <Mail className="h-4 w-4" style={{ color: p.accent }} /> Hire me
            </a>
          )}
        </div>
      </div>
    </section>
  )
}

// ── NOIR — black & gold, quiet luxury (beautiful, always dark) ──────────────

function NoirHero(p: PfHeroProps) {
  return (
    <section className="relative overflow-hidden px-6 pb-16 pt-20 text-center sm:pt-28">
      <div className="pointer-events-none absolute inset-0" aria-hidden style={{ background: 'radial-gradient(45% 32% at 50% 0%, rgba(212,175,55,.09), transparent 70%)' }} />
      <div className="relative mx-auto max-w-3xl">
        <p className="text-[10px] uppercase tracking-[0.55em] opacity-50">Portfolio — {new Date().getFullYear()}</p>
        <h1
          className="mt-8 break-words font-serif font-medium leading-[1.08]"
          style={{ fontSize: 'clamp(2.4rem, 6.5vw, 4.25rem)', letterSpacing: '0.06em' }}
        >
          {p.name || 'Your Name'}
        </h1>
        <div className="mx-auto mt-8 flex max-w-xs items-center gap-3">
          <span className="h-px flex-1" style={{ background: `${p.accent}66` }} />
          <span className="h-1.5 w-1.5 rotate-45" style={{ background: p.accent }} />
          <span className="h-px flex-1" style={{ background: `${p.accent}66` }} />
        </div>
        {p.tagline && <p className="mt-7 font-serif text-lg italic opacity-80 sm:text-xl">{p.tagline}</p>}
        {p.badge && <div className="mt-6 flex justify-center"><PfBadge text={p.badge} dark /></div>}
        {p.photoData && (
          <img
            src={p.photoData}
            alt={p.name || 'Profile'}
            className="mx-auto mt-10 h-28 w-28 rounded-full object-cover"
            style={{ border: `1px solid ${p.accent}88`, padding: '4px' }}
          />
        )}
        {p.location && <p className="mt-6 text-[11px] uppercase tracking-[0.3em] opacity-50">{p.location}</p>}
        {(p.socials.length > 0 || p.email) && (
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-7 gap-y-2.5">
            {p.email && (
              <a href={`mailto:${p.email}`} className="text-[11px] uppercase tracking-[0.25em] opacity-60 transition-opacity hover:opacity-100">Email</a>
            )}
            {p.socials.map((s, i) => (
              <a
                key={i}
                href={withProtocol(s.url)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] uppercase tracking-[0.25em] opacity-60 transition-opacity hover:opacity-100"
              >
                {s.label || s.kind}
              </a>
            ))}
          </div>
        )}
        <div className="mt-11 flex flex-wrap items-center justify-center gap-x-9 gap-y-3">
          {p.cvLink && (
            <a
              href={p.cvLink}
              className="inline-flex items-center gap-2 border-b pb-1.5 text-[11px] uppercase tracking-[0.3em] transition-opacity hover:opacity-70"
              style={{ borderColor: p.accent, color: p.accent }}
            >
              <FileDown className="h-3.5 w-3.5" /> Get my CV
            </a>
          )}
          {p.email && p.contactOn && (
            <a
              href={`mailto:${p.email}`}
              className="inline-flex items-center gap-2 border-b border-current pb-1.5 text-[11px] uppercase tracking-[0.3em] opacity-60 transition-opacity hover:opacity-100"
            >
              <Mail className="h-3.5 w-3.5" /> Hire me
            </a>
          )}
        </div>
      </div>
    </section>
  )
}

// ── LAGOON — aqua calm, flowing waves (beautiful) ───────────────────────────

function LagoonHero(p: PfHeroProps) {
  return (
    <section className="relative overflow-hidden px-6 pb-28 pt-14 text-center sm:pt-20">
      <span className="pf-ambient pointer-events-none absolute -left-16 top-16 h-40 w-40 rounded-full bg-gradient-to-br from-sky-200/50 to-teal-100/40 blur-2xl" aria-hidden />
      <span className="pf-ambient pointer-events-none absolute -right-10 bottom-28 h-52 w-52 rounded-full bg-gradient-to-br from-cyan-200/40 to-sky-100/30 blur-2xl" aria-hidden />
      <svg
        className="pointer-events-none absolute bottom-0 left-0 h-16 w-full text-sky-400/20 sm:h-24"
        viewBox="0 0 1440 90"
        fill="currentColor"
        preserveAspectRatio="none"
        aria-hidden
      >
        <path d="M0 45 C 240 90 480 0 720 35 C 960 70 1200 20 1440 55 L 1440 90 L 0 90 Z" />
      </svg>
      <div className="relative mx-auto max-w-2xl">
        {p.badge && <div className="mb-5 flex justify-center"><PfBadge text={p.badge} dark={p.dark} /></div>}
        {p.photoData && (
          <img
            src={p.photoData}
            alt={p.name || 'Profile'}
            className={`mx-auto mb-7 h-28 w-28 rounded-full object-cover shadow-lg shadow-sky-500/20 ring-4 ${p.dark ? 'ring-white/10' : 'ring-white'}`}
          />
        )}
        <h1
          className="break-words bg-clip-text text-4xl font-black tracking-tight text-transparent sm:text-6xl"
          style={{ backgroundImage: `linear-gradient(100deg, ${p.accent}, #38BDF8)` }}
        >
          {p.name || 'Your Name'}
        </h1>
        {p.tagline && <p className={`mt-5 text-lg font-semibold sm:text-xl ${p.dark ? 'text-sky-100' : 'text-teal-800'}`}>{p.tagline}</p>}
        {p.location && <p className={`mt-3 text-sm inline-flex items-center gap-1.5 ${p.dark ? 'text-sky-200/70' : 'text-teal-700/70'}`}><MapPin className="h-3.5 w-3.5" /> {p.location}</p>}
        {(p.socials.length > 0 || p.email) && (
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2.5">
            {p.email && (
              <a
                href={`mailto:${p.email}`}
                aria-label="Email"
                className={`inline-flex h-11 w-11 items-center justify-center rounded-full shadow-sm transition-transform hover:scale-110 ${p.dark ? 'bg-white/10 text-sky-100 ring-1 ring-white/15 backdrop-blur' : 'bg-white/80 text-teal-700 ring-1 ring-white shadow-sm backdrop-blur'}`}
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
                className={`inline-flex h-11 w-11 items-center justify-center rounded-full transition-transform hover:scale-110 ${p.dark ? 'bg-white/10 text-sky-100 ring-1 ring-white/15 backdrop-blur' : 'bg-white/80 text-teal-700 ring-1 ring-white shadow-sm backdrop-blur'}`}
              >
                <BrandIcon kind={s.kind} className="h-4.5 w-4.5" />
              </a>
            ))}
          </div>
        )}
        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          {p.cvLink && (
            <a
              href={p.cvLink}
              className="inline-flex items-center gap-2 rounded-full px-7 py-3 text-sm font-bold text-white shadow-lg shadow-sky-500/25 transition-transform hover:-translate-y-0.5"
              style={{ background: `linear-gradient(100deg, ${p.accent}, #38BDF8)` }}
            >
              <FileDown className="h-4 w-4" /> Get my CV
            </a>
          )}
          {p.email && p.contactOn && (
            <a
              href={`mailto:${p.email}`}
              className={`inline-flex items-center gap-2 rounded-full border px-7 py-3 text-sm font-semibold backdrop-blur transition-transform hover:-translate-y-0.5 ${p.dark ? 'border-white/20 text-sky-100' : 'border-teal-200 bg-white/60 text-teal-800'}`}
            >
              <Mail className="h-4 w-4" /> Hire me
            </a>
          )}
        </div>
      </div>
    </section>
  )
}

// ── BLOOM — soft botanical, garden pastels (beautiful) ──────────────────────

function BloomHero(p: PfHeroProps) {
  return (
    <section className="relative overflow-hidden px-6 pb-16 pt-16 text-center sm:pt-24">
      <span className="pf-ambient pointer-events-none absolute -top-8 right-[12%] h-36 w-36 rounded-full bg-rose-300/40 blur-2xl" aria-hidden />
      <span className="pf-ambient pointer-events-none absolute bottom-10 left-[8%] h-44 w-44 rounded-full bg-emerald-300/40 blur-2xl" aria-hidden />
      <span className="pf-ambient pointer-events-none absolute right-[30%] top-1/2 h-24 w-24 rounded-full bg-amber-200/40 blur-xl" aria-hidden />
      <div className="relative mx-auto max-w-2xl">
        {p.badge && <div className="mb-5 flex justify-center"><PfBadge text={p.badge} dark={p.dark} /></div>}
        {p.photoData && (
          <img
            src={p.photoData}
            alt={p.name || 'Profile'}
            className={`mx-auto mb-7 h-32 w-32 rounded-[2.5rem] object-cover shadow-xl ${p.dark ? 'ring-4 ring-white/10' : 'ring-4 ring-white'}`}
          />
        )}
        <p className="text-[11px] font-semibold uppercase tracking-[0.35em] opacity-50">Portfolio</p>
        <h1 className="mt-4 break-words font-serif text-4xl leading-[1.08] tracking-tight sm:text-6xl">{p.name || 'Your Name'}</h1>
        {p.tagline && <p className="mt-5 font-serif text-lg italic opacity-75 sm:text-xl">{p.tagline}</p>}
        {p.location && <p className={`mt-4 text-sm inline-flex items-center gap-1.5 ${p.dark ? 'text-stone-400' : 'text-stone-500'}`}><MapPin className="h-3.5 w-3.5" /> {p.location}</p>}
        {(p.socials.length > 0 || p.email) && (
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2.5">
            {p.email && (
              <a
                href={`mailto:${p.email}`}
                aria-label="Email"
                className={`inline-flex h-11 w-11 items-center justify-center rounded-full transition-transform hover:scale-110 ${p.dark ? 'bg-white/10 text-stone-200 ring-1 ring-white/15' : 'bg-white/85 text-stone-600 ring-1 ring-stone-200 shadow-sm'}`}
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
                className={`inline-flex h-11 w-11 items-center justify-center rounded-full transition-transform hover:scale-110 ${p.dark ? 'bg-white/10 text-stone-200 ring-1 ring-white/15' : 'bg-white/85 text-stone-600 ring-1 ring-stone-200 shadow-sm'}`}
              >
                <BrandIcon kind={s.kind} className="h-4.5 w-4.5" />
              </a>
            ))}
          </div>
        )}
        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          {p.cvLink && (
            <a
              href={p.cvLink}
              className="inline-flex items-center gap-2 rounded-full px-7 py-3 text-sm font-bold text-white shadow-lg transition-transform hover:-translate-y-0.5"
              style={{ background: p.accent }}
            >
              <FileDown className="h-4 w-4" /> Get my CV
            </a>
          )}
          {p.email && p.contactOn && (
            <a
              href={`mailto:${p.email}`}
              className={`inline-flex items-center gap-2 rounded-full border px-7 py-3 text-sm font-semibold transition-transform hover:-translate-y-0.5 ${p.dark ? 'border-white/20 text-stone-200' : 'border-stone-300 bg-white/70 text-stone-700'}`}
            >
              <Mail className="h-4 w-4" /> Hire me
            </a>
          )}
        </div>
      </div>
    </section>
  )
}

// ── token registry ─────────────────────────────────────────────────────────

export interface PfTokens {
  id: PortfolioLayout
  Hero: (p: PfHeroProps) => ReactNode
  defaultFont: PortfolioFont
  forceDark?: boolean
  forceLight?: boolean
  aboutCenter?: boolean
  skillsCenter?: boolean
  contactSkin: 'gradient' | 'outline'
  card: (dark: boolean) => string
  chip: (dark: boolean) => string
  projectsGrid: string
  /** Section heading — key/index let Terminal fake file names and Editorial number sections */
  title: (key: PortfolioSectionKey, idx: number, children: ReactNode, accent: string, dark: boolean) => ReactNode
}

const TERMINAL_FILES: Record<string, string> = {
  about: 'cat about.md',
  projects: 'ls projects/',
  experience: 'tail -f experience.log',
  education: 'cat education.csv',
  skills: 'cat skills.json',
  testimonials: 'cat reviews.txt',
  gallery: 'ls gallery/',
  contact: './contact.sh',
}

export function pfTokens(layout: PortfolioLayout): PfTokens {
  switch (layout) {
    case 'aura':
      return {
        id: 'aura',
        Hero: AuraHero,
        defaultFont: 'grotesk',
        contactSkin: 'gradient',
        aboutCenter: false,
        skillsCenter: false,
        card: (d) => (d ? 'border border-white/10 bg-white/5 backdrop-blur-xl' : 'border border-black/5 bg-white/70 shadow-lg shadow-slate-200/60 backdrop-blur-xl'),
        chip: (d) => (d ? 'bg-white/10 text-slate-200 ring-1 ring-white/10' : 'bg-white/80 text-slate-700 ring-1 ring-black/5 backdrop-blur'),
        projectsGrid: 'grid gap-6 sm:grid-cols-2',
        title: (_k, _i, children, accent) => (
          <div className="mb-7 flex items-center gap-3">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl text-white shadow-md" style={{ background: `linear-gradient(135deg, ${accent}, #EC4899)` }}>
              <Sparkles className="h-3.5 w-3.5" />
            </span>
            <h2 className="text-xl font-black tracking-tight sm:text-2xl">{children}</h2>
          </div>
        ),
      }
    case 'riot':
      return {
        id: 'riot',
        Hero: RiotHero,
        defaultFont: 'sans',
        forceLight: true,
        contactSkin: 'outline',
        card: () => 'border-4 border-black bg-white shadow-[5px_5px_0_#000]',
        chip: () => 'border-2 border-black bg-white font-bold shadow-[2px_2px_0_#000]',
        projectsGrid: 'grid gap-7 sm:grid-cols-2',
        title: (_k, _i, children, accent) => (
          <div className="mb-8">
            <h2 className="inline-block -rotate-1 border-4 border-black px-4 py-1.5 text-xl font-black uppercase tracking-tight text-white shadow-[5px_5px_0_#000] sm:text-2xl" style={{ background: accent }}>
              {children}
            </h2>
          </div>
        ),
      }
    case 'editorial':
      return {
        id: 'editorial',
        Hero: EditorialHero,
        defaultFont: 'serif',
        contactSkin: 'outline',
        card: (d) => (d ? 'border border-stone-800 bg-stone-950' : 'border border-stone-200 bg-white'),
        chip: (d) => (d ? 'border border-stone-700 text-stone-300' : 'border border-stone-300 text-stone-600'),
        projectsGrid: 'grid gap-8 sm:grid-cols-2',
        title: (_k, i, children, accent) => (
          <div className="mb-8 flex items-baseline gap-4 border-b border-current/10 pb-3">
            <span className="font-serif text-3xl italic" style={{ color: accent }}>{String(i + 1).padStart(2, '0')}.</span>
            <h2 className="font-serif text-2xl font-bold tracking-tight sm:text-3xl">{children}</h2>
          </div>
        ),
      }
    case 'terminal':
      return {
        id: 'terminal',
        Hero: TerminalHero,
        defaultFont: 'mono',
        forceDark: true,
        contactSkin: 'outline',
        card: () => 'border border-emerald-500/15 bg-[#0D1420]',
        chip: () => 'border border-emerald-500/30 bg-emerald-500/10 font-mono text-emerald-300',
        projectsGrid: 'grid gap-5 sm:grid-cols-2',
        title: (k, _i, children, accent) => (
          <div className="mb-7 flex flex-wrap items-center gap-2 border-b border-white/10 pb-3 font-mono">
            <span className="text-emerald-400">➜</span>
            <span className="text-sky-400">~</span>
            <h2 className="text-base font-bold uppercase tracking-[0.15em] sm:text-lg" style={{ color: accent }}>
              {TERMINAL_FILES[k] || children}
            </h2>
            {TERMINAL_FILES[k] && <span className="font-mono text-sm text-slate-500"># {children}</span>}
          </div>
        ),
      }
    case 'bento':
      return {
        id: 'bento',
        Hero: BentoHero,
        defaultFont: 'grotesk',
        contactSkin: 'gradient',
        card: (d) => (d ? 'rounded-3xl border border-white/10 bg-white/5' : 'rounded-3xl border border-slate-200/70 bg-white shadow-sm'),
        chip: (d) => (d ? 'bg-white/10 text-slate-200' : 'bg-slate-100 text-slate-700'),
        projectsGrid: 'grid gap-5 sm:grid-cols-2',
        title: (_k, _i, children, accent) => (
          <div className="mb-7 flex items-center gap-3">
            <span className="h-6 w-6 rounded-lg" style={{ background: accent }} />
            <h2 className="text-2xl font-black tracking-tight">{children}</h2>
          </div>
        ),
      }
    case 'vogue':
      return {
        id: 'vogue',
        Hero: VogueHero,
        defaultFont: 'serif',
        contactSkin: 'outline',
        card: (d) => (d ? 'border border-white/10 bg-transparent' : 'border border-slate-200/80 bg-transparent'),
        chip: (d) => (d ? 'border border-white/20 text-slate-300' : 'border border-slate-300 text-slate-600'),
        projectsGrid: 'grid gap-10 sm:grid-cols-2',
        title: (_k, _i, children, accent, dark) => (
          <div className="mb-10 text-center">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.45em]" style={{ color: dark ? '#94a3b8' : '#64748b' }}>
              {children}
            </h2>
            <span className="mx-auto mt-4 block h-px w-12" style={{ background: accent }} />
          </div>
        ),
      }
    case 'atelier':
      return {
        id: 'atelier',
        Hero: AtelierHero,
        defaultFont: 'serif',
        contactSkin: 'outline',
        card: (d) => (d ? 'border border-stone-700/70 bg-stone-900/50' : 'border border-stone-300/80 bg-[#FDFBF6]'),
        chip: (d) => (d ? 'border border-stone-700 text-stone-300' : 'border border-stone-300 text-stone-600'),
        projectsGrid: 'grid gap-x-8 gap-y-10 sm:grid-cols-2',
        title: (_k, i, children, _accent, _dark) => (
          <div className="mb-9 flex items-center gap-4">
            <span className="text-[10px] font-bold uppercase tracking-[0.35em] opacity-40">{String(i + 1).padStart(2, '0')}</span>
            <h2 className="font-serif text-2xl tracking-tight sm:text-3xl">{children}</h2>
            <span className="h-px flex-1 bg-current opacity-10" />
          </div>
        ),
      }
    case 'monolith':
      return {
        id: 'monolith',
        Hero: MonolithHero,
        defaultFont: 'sans',
        forceDark: true,
        contactSkin: 'outline',
        card: () => 'border border-white/10 bg-white/[0.03]',
        chip: () => 'border border-white/15 bg-white/5 text-slate-200',
        projectsGrid: 'grid gap-6 sm:grid-cols-2',
        title: (_k, i, children, accent, _dark) => (
          <div className="mb-8 border-b-2 border-white/10 pb-4">
            <div className="flex items-end justify-between gap-4">
              <h2 className="text-2xl font-black uppercase tracking-tight sm:text-3xl">{children}</h2>
              <span className="shrink-0 text-4xl font-black leading-none sm:text-5xl" style={{ color: `${accent}55` }}>{String(i + 1).padStart(2, '0')}</span>
            </div>
          </div>
        ),
      }
    case 'meridian':
      return {
        id: 'meridian',
        Hero: MeridianHero,
        defaultFont: 'sans',
        contactSkin: 'gradient',
        card: (d) => (d ? 'border border-slate-800 bg-slate-900/60 shadow-sm' : 'border border-slate-200/80 bg-white shadow-sm'),
        chip: (d) => (d ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700'),
        projectsGrid: 'grid gap-6 sm:grid-cols-2',
        title: (_k, _i, children, accent, _dark) => (
          <div className="mb-7 border-l-4 pl-4" style={{ borderColor: accent }}>
            <h2 className="text-xl font-extrabold tracking-tight sm:text-2xl">{children}</h2>
          </div>
        ),
      }
    case 'noir':
      return {
        id: 'noir',
        Hero: NoirHero,
        defaultFont: 'serif',
        forceDark: true,
        contactSkin: 'outline',
        card: () => 'border border-[#2C261B] bg-[#131009]',
        chip: () => 'border border-[#3B3323] text-[#D6C28E]',
        projectsGrid: 'grid gap-8 sm:grid-cols-2',
        title: (_k, _i, children, accent, _dark) => (
          <div className="mb-10 flex items-center justify-center gap-4">
            <span className="h-px w-10" style={{ background: `${accent}55` }} />
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.5em]" style={{ color: accent }}>{children}</h2>
            <span className="h-px w-10" style={{ background: `${accent}55` }} />
          </div>
        ),
      }
    case 'lagoon':
      return {
        id: 'lagoon',
        Hero: LagoonHero,
        defaultFont: 'sans',
        contactSkin: 'gradient',
        card: (d) => (d ? 'rounded-2xl border border-white/10 bg-white/5 backdrop-blur' : 'rounded-2xl border border-sky-100 bg-white/80 shadow-sm shadow-sky-100/60 backdrop-blur'),
        chip: (d) => (d ? 'bg-white/10 text-sky-100 ring-1 ring-white/10' : 'bg-sky-50 text-teal-700 ring-1 ring-sky-100'),
        projectsGrid: 'grid gap-6 sm:grid-cols-2',
        title: (_k, _i, children, accent, _dark) => (
          <div className="mb-8">
            <h2 className="text-xl font-extrabold tracking-tight sm:text-2xl">{children}</h2>
            <span className="mt-2.5 block h-1.5 w-14 rounded-full" style={{ background: `linear-gradient(90deg, ${accent}, #38BDF8)` }} />
          </div>
        ),
      }
    case 'bloom':
      return {
        id: 'bloom',
        Hero: BloomHero,
        defaultFont: 'serif',
        contactSkin: 'gradient',
        card: (d) => (d ? 'rounded-3xl border border-white/10 bg-white/5' : 'rounded-3xl border border-stone-200/70 bg-white/80 shadow-sm'),
        chip: (d) => (d ? 'bg-white/10 text-stone-200 ring-1 ring-white/10' : 'bg-white/85 text-stone-600 ring-1 ring-stone-200'),
        projectsGrid: 'grid gap-6 sm:grid-cols-2',
        title: (_k, _i, children, accent, _dark) => (
          <div className="mb-8 flex items-center gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white" style={{ background: accent }}>
              <Sparkles className="h-3.5 w-3.5" />
            </span>
            <h2 className="font-serif text-2xl tracking-tight">{children}</h2>
          </div>
        ),
      }
    default:
      return pfTokens('aura')
  }
}

export const PF_NEW_LAYOUTS: PortfolioLayout[] = [
  // R6 GenZ six
  'aura', 'riot', 'editorial', 'terminal', 'bento', 'vogue',
  // R7 professional three + beautiful three
  'atelier', 'monolith', 'meridian', 'noir', 'lagoon', 'bloom',
]
export const isPfNewLayout = (l: PortfolioLayout): boolean => PF_NEW_LAYOUTS.includes(l)

/** Styles that lock the light/dark mode (they ARE a mode — part of the personality) */
export function pfModeLock(layout: PortfolioLayout): 'dark' | 'light' | null {
  if (layout === 'terminal' || layout === 'monolith' || layout === 'noir') return 'dark'
  if (layout === 'riot') return 'light'
  return null
}

/** Icon used by the shared "Live / Code" project links */
export { ExternalLink, Code2 }
