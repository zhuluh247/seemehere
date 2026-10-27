'use client'

import type { CvData, PortfolioSpec, ThemeSpec } from '@/lib/cv/types'
import { normalizePortfolio } from '@/lib/cv/types'
import {
  Mail, MapPin, Phone, Github, Linkedin, Twitter, Instagram, Youtube, Dribbble,
  Globe, Link2, Music2, Palette, Layers, BookOpen, ExternalLink, Code2,
  Briefcase, GraduationCap, Sparkles, FileDown, Quote, UserPlus,
} from 'lucide-react'
import { dateRange } from '@/components/cv/templates/shared'

// ─── Portfolio website renderer ─────────────────────────────────────────────
// Website-style share page. No SEEMEHERE header, no "unlisted" chrome —
// the owner's name is the brand. Tiny footer credit only.
//
// R5: three website layouts (PortfolioSpec.layout):
//   signature — centered hero with soft radial glow (the original)
//   horizon   — bold full-width accent banner, left-aligned, punchy
//   spotlight — editorial: huge centered type, flat bordered cards

interface PortfolioSiteProps {
  data: CvData
  photoData?: string
  portfolio: Partial<PortfolioSpec> | unknown
  /** preview mode = inside the builder (no live-CV link) */
  preview?: boolean
  /** live username → enables "Get my CV" pointing at /cv/name?mode=cv */
  username?: string
}

const withProtocol = (url: string): string => {
  const u = url.trim()
  if (!u) return ''
  if (/^https?:\/\//i.test(u)) return u
  return `https://${u}`
}

type LayoutId = 'signature' | 'horizon' | 'spotlight'

/** Section heading — one component, three accents (one per layout) */
function SectionTitle({ accent, layout, dark, children }: { accent: string; layout: LayoutId; dark: boolean; children: React.ReactNode }) {
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
  // signature
  return (
    <div className="mb-6 flex items-center gap-3">
      <span className="h-px w-8" style={{ background: accent }} />
      <h2 className="text-lg font-bold tracking-tight sm:text-xl">{children}</h2>
    </div>
  )
}

function BrandIcon({ kind, className }: { kind: string; className?: string }) {
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

export function PortfolioSite({ data, photoData, portfolio, preview, username }: PortfolioSiteProps) {
  const p = normalizePortfolio(portfolio)
  const c = data.contact
  const dark = p.mode === 'dark'
  const layout: LayoutId = p.layout
  const accent = /^#[0-9a-fA-F]{3,8}$/.test(p.accent) ? p.accent : '#4F46E5'

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

  // ── per-layout styling tokens ──────────────────────────────────────────────
  const shell = dark
    ? 'bg-slate-950 text-slate-200'
    : 'bg-white text-slate-800'
  const soft = dark ? 'text-slate-400' : 'text-slate-500'
  const wrap =
    layout === 'spotlight'
      ? 'mx-auto max-w-3xl px-6 sm:px-10'
      : layout === 'horizon'
        ? 'mx-auto max-w-5xl px-6 sm:px-10'
        : 'mx-auto max-w-4xl px-6 sm:px-10'

  // card / chip surfaces per layout
  const card =
    layout === 'spotlight'
      ? dark
        ? 'bg-slate-950 border border-slate-800'
        : 'bg-white border border-slate-200'
      : dark
        ? 'bg-slate-900 border border-slate-800 shadow-sm'
        : 'bg-white border border-slate-200 shadow-sm'
  const chip = dark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700'
  const chipSpotlight = dark ? 'border border-slate-700 text-slate-300' : 'border border-slate-300 text-slate-600'

  const heroSocialCls =
    layout === 'horizon'
      ? 'inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/40 bg-white/10 text-white transition-transform hover:scale-110'
      : layout === 'spotlight'
        ? `inline-flex h-10 w-10 items-center justify-center rounded-full transition-transform hover:scale-110 ${dark ? 'border border-slate-700 text-slate-300' : 'border border-slate-300 text-slate-600'}`
        : `inline-flex h-10 w-10 items-center justify-center rounded-full border transition-transform hover:scale-110 ${dark ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-white border-slate-200 text-slate-700'}`

  const cvLink = username && !preview ? `/cv/${username}?mode=cv` : undefined

  return (
    <div className={`${shell} min-h-full font-sans`} style={{ ['--pa' as string]: accent }}>
      {/* ═══ HERO — three layouts ═══ */}
      {layout === 'horizon' ? (
        // ── Horizon: bold accent banner, left-aligned ──
        <section
          className="relative overflow-hidden px-6 pb-16 pt-16 text-white sm:px-10 sm:pt-20"
          style={{
            background: `linear-gradient(140deg, ${accent} 0%, color-mix(in srgb, ${accent} 55%, #020617) 78%)`,
          }}
        >
          <div
            className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full"
            style={{ background: 'rgba(255,255,255,.09)' }}
          />
          <div
            className="pointer-events-none absolute -bottom-32 left-1/3 h-64 w-64 rounded-full"
            style={{ background: 'rgba(255,255,255,.06)' }}
          />
          <div className="relative mx-auto max-w-5xl">
            {photoData && (
              <img
                src={photoData}
                alt={c.fullName || 'Profile'}
                className="mb-7 h-24 w-24 rounded-2xl border-4 object-cover shadow-xl"
                style={{ borderColor: 'rgba(255,255,255,.4)' }}
              />
            )}
            <p className="text-xs font-bold uppercase tracking-[0.3em] opacity-80">{tagline || 'Portfolio'}</p>
            <h1 className="mt-3 max-w-3xl text-4xl font-black leading-[1.05] tracking-tight sm:text-6xl">
              {c.fullName || 'Your Name'}
            </h1>
            {c.location && (
              <p className="mt-4 inline-flex items-center gap-1.5 text-sm opacity-85">
                <MapPin className="h-3.5 w-3.5" /> {c.location}
              </p>
            )}
            {(socials.length > 0 || c.email) && (
              <div className="mt-7 flex flex-wrap items-center gap-2.5">
                {c.email && (
                  <a
                    href={`mailto:${c.email}`}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-900 transition-transform hover:scale-110"
                    aria-label="Email"
                  >
                    <Mail className="h-4.5 w-4.5" />
                  </a>
                )}
                {socials.map((s, i) => (
                  <a
                    key={i}
                    href={withProtocol(s.url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={s.label}
                    className={heroSocialCls}
                  >
                    <BrandIcon kind={s.kind} className="h-4.5 w-4.5" />
                  </a>
                ))}
              </div>
            )}
            <div className="mt-8 flex flex-wrap items-center gap-3">
              {cvLink && (
                <a
                  href={cvLink}
                  className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-2.5 text-sm font-bold text-slate-900 shadow-lg transition-transform hover:-translate-y-0.5"
                >
                  <FileDown className="h-4 w-4" /> Get my CV
                </a>
              )}
              {c.email && sections.contact !== false && (
                <a
                  href={`mailto:${c.email}`}
                  className="inline-flex items-center gap-2 rounded-full border border-white/50 bg-white/10 px-6 py-2.5 text-sm font-semibold text-white backdrop-blur transition-transform hover:-translate-y-0.5 hover:bg-white/20"
                >
                  <Mail className="h-4 w-4" /> Hire me
                </a>
              )}
            </div>
          </div>
        </section>
      ) : layout === 'spotlight' ? (
        // ── Spotlight: editorial, huge centered type ──
        <section
          className={`px-6 pb-14 pt-20 text-center sm:pt-28 ${dark ? '' : 'bg-white'}`}
          style={
            dark
              ? { background: `radial-gradient(ellipse 60% 50% at 50% -10%, ${accent}22, transparent), #020617` }
              : undefined
          }
        >
          <div className="mx-auto max-w-3xl">
            {photoData && (
              <img
                src={photoData}
                alt={c.fullName || 'Profile'}
                className="mx-auto mb-8 h-24 w-24 rounded-full object-cover"
                style={{ border: `2px solid ${accent}` }}
              />
            )}
            <h1 className="text-5xl font-black leading-[1.02] tracking-tight sm:text-7xl">{c.fullName || 'Your Name'}</h1>
            {tagline && (
              <p className="mt-6 text-[11px] font-bold uppercase tracking-[0.35em]" style={{ color: accent }}>
                {tagline}
              </p>
            )}
            {c.location && <p className={`mt-4 text-sm ${soft} inline-flex items-center gap-1.5`}><MapPin className="h-3.5 w-3.5" /> {c.location}</p>}
            {(socials.length > 0 || c.email) && (
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                {c.email && (
                  <a
                    href={`mailto:${c.email}`}
                    className={`inline-flex h-10 w-10 items-center justify-center rounded-full transition-transform hover:scale-110 ${dark ? 'text-slate-300' : 'text-slate-600'}`}
                    style={{ border: `1px solid ${accent}`, color: accent }}
                    aria-label="Email"
                  >
                    <Mail className="h-4.5 w-4.5" />
                  </a>
                )}
                {socials.map((s, i) => (
                  <a
                    key={i}
                    href={withProtocol(s.url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={s.label}
                    className={heroSocialCls}
                  >
                    <BrandIcon kind={s.kind} className="h-4.5 w-4.5" />
                  </a>
                ))}
              </div>
            )}
            <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
              {cvLink && (
                <a
                  href={cvLink}
                  className="inline-flex items-center gap-1.5 text-sm font-bold uppercase tracking-widest transition-opacity hover:opacity-70"
                  style={{ color: accent }}
                >
                  <FileDown className="h-4 w-4" /> Get my CV
                </a>
              )}
              {c.email && sections.contact !== false && (
                <a
                  href={`mailto:${c.email}`}
                  className={`inline-flex items-center gap-1.5 text-sm font-bold uppercase tracking-widest transition-opacity hover:opacity-70 ${dark ? 'text-slate-200' : 'text-slate-800'}`}
                >
                  <Mail className="h-4 w-4" /> Hire me
                </a>
              )}
            </div>
          </div>
        </section>
      ) : (
        // ── Signature: centered hero with soft radial glow (original) ──
        <section
          className="relative overflow-hidden px-6 pb-16 pt-20 text-center sm:px-10 sm:pt-24"
          style={{
            background: dark
              ? `radial-gradient(ellipse 70% 60% at 50% -10%, ${accent}33, transparent), #020617`
              : `radial-gradient(ellipse 70% 60% at 50% -10%, ${accent}1f, transparent), #ffffff`,
          }}
        >
          <div className="mx-auto max-w-3xl">
            {photoData && (
              <img
                src={photoData}
                alt={c.fullName || 'Profile'}
                className="mx-auto mb-7 h-28 w-28 rounded-full border-4 object-cover shadow-xl"
                style={{ borderColor: accent }}
              />
            )}
            <h1 className="text-4xl font-black tracking-tight sm:text-6xl">{c.fullName || 'Your Name'}</h1>
            {tagline && (
              <p className="mt-4 text-base font-medium sm:text-lg" style={{ color: accent }}>
                {tagline}
              </p>
            )}
            {c.location && <p className={`mt-3 text-sm ${soft} inline-flex items-center gap-1.5`}><MapPin className="h-3.5 w-3.5" /> {c.location}</p>}
            {(socials.length > 0 || c.email) && (
              <div className="mt-7 flex flex-wrap items-center justify-center gap-2.5">
                {c.email && (
                  <a
                    href={`mailto:${c.email}`}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full text-white transition-transform hover:scale-110"
                    style={{ background: accent }}
                    aria-label="Email"
                  >
                    <Mail className="h-4.5 w-4.5" />
                  </a>
                )}
                {socials.map((s, i) => (
                  <a
                    key={i}
                    href={withProtocol(s.url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={s.label}
                    className={heroSocialCls}
                  >
                    <BrandIcon kind={s.kind} className="h-4.5 w-4.5" />
                  </a>
                ))}
              </div>
            )}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              {cvLink && (
                <a
                  href={cvLink}
                  className="inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold text-white shadow-lg transition-transform hover:-translate-y-0.5"
                  style={{ background: accent }}
                >
                  <FileDown className="h-4 w-4" /> Get my CV
                </a>
              )}
              {c.email && sections.contact !== false && (
                <a
                  href={`mailto:${c.email}`}
                  className={`inline-flex items-center gap-2 rounded-full border px-6 py-2.5 text-sm font-semibold transition-transform hover:-translate-y-0.5 ${dark ? 'bg-slate-900 border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-800'}`}
                >
                  <Mail className="h-4 w-4" /> Hire me
                </a>
              )}
            </div>
          </div>
        </section>
      )}

      <div className={wrap}>
        {/* ── About ── */}
        {sections.about && about && (
          <section className="py-12">
            <SectionTitle accent={accent} layout={layout} dark={dark}>About</SectionTitle>
            <p className={`whitespace-pre-line leading-relaxed ${layout === 'spotlight' ? 'text-center text-base' : ''} ${dark ? 'text-slate-300' : 'text-slate-600'}`}>
              {about}
            </p>
          </section>
        )}

        {/* ── Projects ── */}
        {sections.projects && p.projects.length > 0 && (
          <section className="py-12">
            <SectionTitle accent={accent} layout={layout} dark={dark}>Projects</SectionTitle>
            <div className={`grid gap-6 ${layout === 'horizon' ? 'sm:grid-cols-2 lg:grid-cols-3' : 'sm:grid-cols-2'}`}>
              {p.projects.filter((pr) => pr.title || pr.image).map((pr) => (
                <div key={pr.id} className={`overflow-hidden rounded-2xl border transition-shadow ${layout === 'spotlight' ? '' : 'shadow-sm hover:shadow-lg'} ${card}`}>
                  {pr.image && <img src={pr.image} alt={pr.title || 'Project'} className="h-44 w-full object-cover" />}
                  <div className="p-5">
                    <h3 className="font-bold">{pr.title}</h3>
                    {pr.tags && (
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {pr.tags.split(/[·,|]/).map((t, ti) => (
                          t.trim() && (
                            <span key={`${t}-${ti}`} className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${layout === 'spotlight' ? chipSpotlight : chip}`}>
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
        )}

        {/* ── Gallery ── */}
        {sections.gallery !== false && p.gallery.length > 0 && (
          <section className="py-12">
            <SectionTitle accent={accent} layout={layout} dark={dark}>Gallery</SectionTitle>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {p.gallery.filter((g) => g.image).map((g) => (
                <figure key={g.id} className={`group overflow-hidden rounded-2xl border ${card}`}>
                  <a href={g.image} target="_blank" rel="noopener noreferrer" className="block">
                    <img
                      src={g.image}
                      alt={g.caption || 'Gallery image'}
                      className="h-52 w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                    />
                  </a>
                  {g.caption && (
                    <figcaption className={`px-4 py-2.5 text-xs ${soft}`}>{g.caption}</figcaption>
                  )}
                </figure>
              ))}
            </div>
          </section>
        )}

        {/* ── Experience ── */}
        {sections.experience && data.experience.length > 0 && (
          <section className="py-12">
            <SectionTitle accent={accent} layout={layout} dark={dark}>Experience</SectionTitle>
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
        )}

        {/* ── Education ── */}
        {sections.education && data.education.length > 0 && (
          <section className="py-12">
            <SectionTitle accent={accent} layout={layout} dark={dark}>Education</SectionTitle>
            <div className="space-y-5">
              {data.education.map((e) => (
                <div key={e.id} className={`flex items-start gap-4 rounded-2xl border p-5 ${card}`}>
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
        )}

        {/* ── Skills ── */}
        {sections.skills && data.skills.length > 0 && (
          <section className="py-12">
            <SectionTitle accent={accent} layout={layout} dark={dark}>Skills</SectionTitle>
            <div className={`flex flex-wrap gap-2 ${layout === 'spotlight' ? 'justify-center' : ''}`}>
              {data.skills.map((s) => (
                <span key={s.id} className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold ${layout === 'spotlight' ? chipSpotlight : chip}`}>
                  <Sparkles className="h-3 w-3" style={{ color: accent }} />
                  {s.name}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* ── Testimonials ── */}
        {sections.testimonials !== false && p.testimonials.length > 0 && (
          <section className="py-12">
            <SectionTitle accent={accent} layout={layout} dark={dark}>Kind words</SectionTitle>
            <div className="grid gap-5 sm:grid-cols-2">
              {p.testimonials.filter((t) => t.quote.trim()).map((t) => (
                <blockquote key={t.id} className={`relative rounded-2xl border p-5 ${layout === 'spotlight' ? '' : 'shadow-sm'} ${card}`}>
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
        )}

        {/* ── Contact — "Let's work together" card (fixed R5: the email pill
               can never outgrow the card or collide with the phone row) ── */}
        {sections.contact && (
          <section className="py-12">
            <div
              className="rounded-3xl px-6 py-10 text-center"
              style={
                layout === 'spotlight'
                  ? dark
                    ? { background: '#0f172a', color: '#e2e8f0', border: '1px solid #1e293b' }
                    : { background: '#ffffff', color: '#1e293b', border: `1.5px solid ${accent}` }
                  : { background: `linear-gradient(135deg, ${accent}, ${accent}cc)`, color: '#ffffff' }
              }
            >
              <Briefcase className="mx-auto mb-3 h-7 w-7 opacity-80" />
              <h2 className="text-2xl font-black">Let&apos;s work together</h2>
              <p className="mt-2 text-sm opacity-80">I&apos;m open to new opportunities — drop me a line.</p>

              {/* Email + phone each get their own centered row; the pill wraps
                  long addresses instead of stretching, so it never bleeds into
                  the phone line below (that was the old bug). */}
              <div className="mt-6 flex flex-col items-center gap-3">
                {c.email && (
                  <a
                    href={`mailto:${c.email}`}
                    className="inline-flex max-w-full items-center justify-center gap-2 rounded-full px-6 py-2.5 text-sm font-bold shadow-lg transition-transform hover:-translate-y-0.5"
                    style={
                      layout === 'spotlight'
                        ? { background: accent, color: '#ffffff' }
                        : { background: '#ffffff', color: accent }
                    }
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
                      layout === 'spotlight'
                        ? { color: accent, borderColor: accent, border: `1px solid ${accent}` }
                        : { background: 'rgba(255,255,255,.15)', color: '#ffffff', borderColor: 'rgba(255,255,255,.4)', ['--tw-ring-color' as string]: 'rgba(255,255,255,.4)' }
                    }
                  >
                    <UserPlus className="h-3.5 w-3.5" /> Add me to contacts
                  </a>
                </div>
              )}
            </div>
          </section>
        )}

        {/* ── Tiny footer credit (the ONLY SEEMEHERE branding on the page) ── */}
        <footer className={`pb-8 pt-2 text-center text-[11px] ${soft}`}>
          {username && !preview ? (
            <a href="/" className="hover:underline" style={{ color: accent }}>Made with SEEMEHERE</a>
          ) : (
            <span>Made with SEEMEHERE</span>
          )}
        </footer>
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

// Re-export ThemeSpec type usage guard (keeps tree-shaking honest)
export type { ThemeSpec }
