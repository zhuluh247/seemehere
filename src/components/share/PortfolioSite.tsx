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
import { useEffect, useRef } from 'react'
import {
  normalizePortfolio,
  normalizeCv,
  PORTFOLIO_SECTION_ORDER,
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

// ─── helpers ─────────────────────────────────────────────────────────────────

const SECTION_LABELS: Record<PortfolioSectionKey, string> = {
  about: 'About',
  projects: 'Projects',
  experience: 'Experience',
  education: 'Education',
  skills: 'Skills',
  testimonials: 'Kind words',
  gallery: 'Gallery',
  contact: 'Contact',
}

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
  }, [motion, layout, visibleKey])

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
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {p.gallery.filter((g) => g.image).map((g) => (
            <figure key={g.id} className={`pf-card group overflow-hidden border ${cardCls}`} style={rVar}>
              <a href={g.image} target="_blank" rel="noopener noreferrer" className="block">
                <img src={g.image} alt={g.caption || 'Gallery image'} className="h-52 w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]" />
              </a>
              {g.caption && <figcaption className={`px-4 py-2.5 text-xs ${soft}`}>{g.caption}</figcaption>}
            </figure>
          ))}
        </div>
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
        <div className="pf-hero">
          <Hero {...heroProps} />
        </div>
        {p.marquee?.trim() ? <div data-pf-reveal><PfMarquee text={p.marquee.trim()} accent={accent} /></div> : null}

        <div className={wrap}>
          {orderedSections(p).map((key, i) => {
            if (!sections[key]) return null
            const node = body[key]
            return node ? <div key={key} data-pf-reveal>{node}</div> : null
          })}

          {/* ── Tiny footer credit (the ONLY SEEMEHERE branding on the page) ── */}
          <footer data-pf-reveal className={`pb-8 pt-2 text-center text-[11px] ${soft}`}>
            {username && !preview ? (
              <a href="/" className="hover:underline" style={{ color: accent }}>Made with SEEMEHERE</a>
            ) : (
              <span>Made with SEEMEHERE</span>
            )}
          </footer>
        </div>
      </div>
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
