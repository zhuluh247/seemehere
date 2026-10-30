'use client'

// ─── R6 · Portfolio design panel (right rail of the builder) ────────────────
// Style picker (GenZ six + the 3 originals), light/dark, accent, font,
// corner radius, background texture, marquee ribbon and availability badge.

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { usePortfolioStore } from './portfolio-store'
import { pfModeLock } from '@/components/share/portfolio-themes'
import {
  PORTFOLIO_STYLES,
  PORTFOLIO_PRO_STYLES,
  PORTFOLIO_LUXE_STYLES,
  PORTFOLIO_LAYOUTS,
  PORTFOLIO_MOTIONS,
  PORTFOLIO_FONT_STACKS,
  type PortfolioLayout,
  type PortfolioFont,
  type PortfolioRadius,
  type PortfolioTexture,
} from '@/lib/cv/types'
import { Sun, Moon, Sparkles, Ribbon, CircleDot, SquareDashed, Zap, Briefcase, Flower2, CircleOff, Waves, PartyPopper } from 'lucide-react'

const ACCENTS = ['#4F46E5', '#0EA5E9', '#0D9488', '#10B981', '#F59E0B', '#C9A227', '#EF4444', '#8B5CF6', '#EC4899', '#0F172A']

/** Tiny CSS mock of each style — shown inside the picker cards */
function StyleMock({ id, accent }: { id: PortfolioLayout; accent: string }) {
  const box = 'h-16 overflow-hidden rounded-lg border border-slate-100'
  if (id === 'aura')
    return (
      <div className={`${box} flex flex-col items-center justify-center gap-1`} style={{ background: `linear-gradient(135deg, ${accent}26, #EC489920)` }}>
        <div className="h-4 w-4 rounded-full" style={{ background: `linear-gradient(135deg, ${accent}, #EC4899)` }} />
        <div className="h-1.5 w-14 rounded-full" style={{ background: `linear-gradient(90deg, ${accent}, #EC4899)` }} />
        <div className="h-1 w-10 rounded bg-slate-300" />
      </div>
    )
  if (id === 'riot')
    return (
      <div className={`${box} flex items-center justify-center bg-white p-2`}>
        <div className="flex flex-col items-start gap-1">
          <div className="h-3 w-16 -rotate-2 border-2 border-black bg-white shadow-[2px_2px_0_#000]" style={{ background: accent }} />
          <div className="h-1.5 w-12 rotate-1 border-2 border-black bg-white shadow-[2px_2px_0_#000]" />
          <div className="h-1.5 w-9 -rotate-1 border-2 border-black bg-amber-200 shadow-[2px_2px_0_#000]" />
        </div>
      </div>
    )
  if (id === 'editorial')
    return (
      <div className={`${box} flex flex-col items-center justify-center gap-1 bg-[#FAF9F6]`}>
        <div className="h-2.5 w-16 font-serif text-slate-800" style={{ fontFamily: 'Georgia, serif' }}>Aa</div>
        <div className="h-px w-12 bg-slate-300" />
        <div className="h-1 w-14 rounded bg-slate-200" />
      </div>
    )
  if (id === 'terminal')
    return (
      <div className={`${box} bg-[#0D1420] p-2 font-mono`}>
        <div className="mb-1 flex gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-[#FF5F57]" />
          <span className="h-1.5 w-1.5 rounded-full bg-[#FEBC2E]" />
          <span className="h-1.5 w-1.5 rounded-full bg-[#28C840]" />
        </div>
        <div className="text-[8px] text-emerald-400">➜ ~ whoami</div>
        <div className="text-[9px] font-bold" style={{ color: accent }}>Your Name</div>
        <div className="text-[8px] text-slate-500">▊</div>
      </div>
    )
  if (id === 'bento')
    return (
      <div className={`${box} grid grid-cols-3 grid-rows-2 gap-1 bg-slate-50 p-1.5`}>
        <div className="col-span-2 rounded-md border border-slate-200 bg-white" />
        <div className="rounded-md" style={{ background: accent }} />
        <div className="rounded-md border border-slate-200 bg-white" />
        <div className="rounded-md border border-slate-200 bg-white" />
        <div className="rounded-md bg-slate-200" />
      </div>
    )
  if (id === 'vogue')
    return (
      <div className={`${box} flex flex-col items-center justify-center gap-1.5 bg-white`}>
        <div className="text-[10px] font-light uppercase tracking-[0.3em] text-slate-700">NAME</div>
        <div className="h-px w-10" style={{ background: accent }} />
        <div className="text-[7px] uppercase tracking-[0.2em] text-slate-400">portfolio</div>
      </div>
    )
  if (id === 'atelier')
    return (
      <div className={`${box} flex flex-col justify-center gap-1 bg-[#F7F4EE] px-2.5`}>
        <div className="flex items-center justify-between">
          <div className="text-[6px] font-bold uppercase tracking-[0.3em] text-stone-400">Portfolio</div>
          <div className="h-px w-4 bg-stone-300" />
        </div>
        <div className="text-[11px] text-stone-800" style={{ fontFamily: 'Georgia, serif' }}>Aa</div>
        <div className="h-px w-full bg-stone-300/70" />
        <div className="h-1 w-10 rounded-sm bg-stone-200" />
      </div>
    )
  if (id === 'monolith')
    return (
      <div className={`${box} flex flex-col justify-center gap-1 bg-[#0B0D10] px-2.5`}>
        <div className="h-1 w-6" style={{ background: accent }} />
        <div className="text-[9px] font-black uppercase leading-tight text-white">NAME</div>
        <div className="grid grid-cols-3 gap-px bg-white/10">
          <div className="h-2 bg-[#0B0D10]" />
          <div className="h-2 bg-[#0B0D10]" />
          <div className="h-2 bg-[#0B0D10]" />
        </div>
      </div>
    )
  if (id === 'meridian')
    return (
      <div className={`${box} flex flex-col items-center justify-center gap-1 bg-slate-50`}>
        <div className="h-3.5 w-3.5 rounded-lg" style={{ background: accent }} />
        <div className="h-1.5 w-14 rounded bg-slate-700" />
        <div className="mt-0.5 flex gap-1">
          <div className="h-1.5 w-6 rounded-full border border-slate-200 bg-white" />
          <div className="h-1.5 w-6 rounded-full border border-slate-200 bg-white" />
        </div>
      </div>
    )
  if (id === 'noir')
    return (
      <div className={`${box} flex flex-col items-center justify-center gap-1.5 bg-[#0C0A08]`}>
        <div className="flex items-center gap-1">
          <div className="h-px w-4" style={{ background: `${accent}88` }} />
          <div className="h-1 w-1 rotate-45" style={{ background: accent }} />
          <div className="h-px w-4" style={{ background: `${accent}88` }} />
        </div>
        <div className="text-[11px] text-[#EAE2D6]" style={{ fontFamily: 'Georgia, serif' }}>Aa</div>
        <div className="text-[6px] uppercase tracking-[0.3em] text-[#8A7B57]">portfolio</div>
      </div>
    )
  if (id === 'lagoon')
    return (
      <div className={`${box} flex flex-col items-center justify-center gap-1`} style={{ background: 'linear-gradient(160deg, #E0F7F5, #BAE6FD)' }}>
        <div className="h-3.5 w-3.5 rounded-full ring-2 ring-white" style={{ background: accent }} />
        <div className="h-1.5 w-14 rounded-full" style={{ background: `linear-gradient(90deg, ${accent}, #38BDF8)` }} />
        <svg viewBox="0 0 60 8" className="h-1.5 w-full text-sky-400/40" fill="currentColor" preserveAspectRatio="none">
          <path d="M0 4 C 10 8 20 0 30 3 C 40 6 50 1 60 4 L 60 8 L 0 8 Z" />
        </svg>
      </div>
    )
  if (id === 'bloom')
    return (
      <div className={`${box} flex flex-col items-center justify-center gap-1.5 bg-[#FAF6F0]`}>
        <div className="relative">
          <div className="absolute -right-2 -top-2 h-3 w-3 rounded-full bg-rose-300/70 blur-[2px]" />
          <div className="h-4 w-4 rounded-2xl ring-2 ring-white" style={{ background: accent }} />
        </div>
        <div className="text-[10px] text-stone-800" style={{ fontFamily: 'Georgia, serif' }}>Aa</div>
        <div className="h-1 w-10 rounded-full bg-stone-200" />
      </div>
    )
  if (id === 'horizon')
    return (
      <div className={`${box} flex flex-col justify-center gap-1 px-2`} style={{ background: `linear-gradient(120deg, ${accent}, #312E81)` }}>
        <div className="h-1 w-8 rounded bg-white/60" />
        <div className="h-2 w-16 rounded bg-white" />
        <div className="h-1 w-12 rounded bg-white/50" />
      </div>
    )
  if (id === 'spotlight')
    return (
      <div className={`${box} flex flex-col items-center justify-center gap-1 bg-white`}>
        <div className="h-2.5 w-16 rounded bg-slate-800" />
        <div className="h-1 w-10 rounded bg-slate-300" />
        <div className="mt-0.5 h-px w-12 bg-slate-200" />
      </div>
    )
  return (
    <div className={`${box} flex flex-col items-center justify-center gap-1`} style={{ background: 'linear-gradient(180deg, #EEF2FF20, #fff)' }}>
      <div className="h-4 w-4 rounded-full" style={{ background: accent }} />
      <div className="h-1.5 w-14 rounded bg-slate-300" />
      <div className="h-1 w-10 rounded bg-slate-200" />
    </div>
  )
}

const STYLE_GROUPS: { key: string; label: string; icon: typeof Zap; styles: typeof PORTFOLIO_STYLES; cols: string }[] = [
  { key: 'genz', label: 'GenZ', icon: Zap, styles: PORTFOLIO_STYLES, cols: 'grid-cols-2' },
  { key: 'pro', label: 'Professional', icon: Briefcase, styles: PORTFOLIO_PRO_STYLES, cols: 'grid-cols-3' },
  { key: 'luxe', label: 'Beautiful', icon: Flower2, styles: PORTFOLIO_LUXE_STYLES, cols: 'grid-cols-3' },
]

export function DesignPanel() {
  const portfolio = usePortfolioStore((s) => s.portfolio)
  const patch = usePortfolioStore((s) => s.patchPortfolio)

  const accent = portfolio.accent
  const modeLock = pfModeLock(portfolio.layout)
  const activeMotion = portfolio.motion || 'off'
  const motionBlurb = PORTFOLIO_MOTIONS.find((m) => m.id === activeMotion)?.blurb

  return (
    <div className="space-y-5">
      {/* Style picker — three families + the originals */}
      <div>
        <Label className="text-xs font-semibold text-slate-700">Style</Label>
        <p className="mt-0.5 text-[10px] text-slate-400">15 styles — switch any time, content stays.</p>
        {STYLE_GROUPS.map((g) => (
          <div key={g.key} className="mt-3">
            <p className="mb-1.5 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              <g.icon className="h-3 w-3" style={{ color: g.key === 'genz' ? '#8B5CF6' : g.key === 'pro' ? '#0EA5E9' : '#EC4899' }} /> {g.label}
            </p>
            <div className={`grid gap-2 ${g.cols}`}>
              {g.styles.map((l) => {
                const active = portfolio.layout === l.id
                return (
                  <button
                    key={l.id}
                    type="button"
                    onClick={() => patch({ layout: l.id })}
                    className={`rounded-xl border-2 p-2 text-left transition-all hover:-translate-y-0.5 ${active ? 'border-violet-600 bg-violet-50/50 shadow-sm' : 'border-slate-200'}`}
                  >
                    <StyleMock id={l.id} accent={accent} />
                    <div className="mt-1.5 text-xs font-bold text-slate-800">{l.name}</div>
                    <div className="text-[10px] leading-tight text-slate-500">{l.vibe}</div>
                  </button>
                )
              })}
            </div>
          </div>
        ))}

        {/* Originals — kept for existing sites, tucked under the newer styles */}
        <details className="mt-2">
          <summary className="cursor-pointer text-[11px] font-medium text-slate-400 hover:text-slate-600">Original styles (from the early days)</summary>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {PORTFOLIO_LAYOUTS.map((l) => {
              const active = portfolio.layout === l.id
              return (
                <button
                  key={l.id}
                  type="button"
                  onClick={() => patch({ layout: l.id })}
                  className={`rounded-lg border-2 p-1.5 text-left transition-all ${active ? 'border-violet-600 bg-violet-50/50' : 'border-slate-200'}`}
                >
                  <StyleMock id={l.id} accent={accent} />
                  <div className="mt-1 text-[10px] font-semibold text-slate-700">{l.name}</div>
                </button>
              )
            })}
          </div>
        </details>
      </div>

      {/* Light / dark (some styles lock their own mode — it IS the personality) */}
      {!modeLock && (
        <div>
          <Label className="text-xs font-semibold text-slate-700">Mode</Label>
          <div className="mt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={() => patch({ mode: 'light' })}
              className={`inline-flex h-8 flex-1 items-center justify-center gap-1.5 rounded-lg border text-xs font-semibold transition-colors ${
                portfolio.mode === 'light' ? 'border-slate-800 bg-slate-800 text-white' : 'border-slate-200 bg-white text-slate-600'
              }`}
            >
              <Sun className="h-3.5 w-3.5" /> Light
            </button>
            <button
              type="button"
              onClick={() => patch({ mode: 'dark' })}
              className={`inline-flex h-8 flex-1 items-center justify-center gap-1.5 rounded-lg border text-xs font-semibold transition-colors ${
                portfolio.mode === 'dark' ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-white text-slate-600'
              }`}
            >
              <Moon className="h-3.5 w-3.5" /> Dark
            </button>
          </div>
        </div>
      )}
      {modeLock === 'dark' && (
        <p className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-[11px] text-slate-500">
          {portfolio.layout === 'terminal'
            ? 'Terminal always runs dark — that\u2019s the whole point of a terminal. 🖥️'
            : portfolio.layout === 'monolith'
              ? 'Monolith always runs dark — a closed boardroom has no daylight.'
              : 'Noir lives in the dark — that\u2019s where the gold shines.'}
        </p>
      )}

      {/* R7 · Animation level */}
      <div>
        <Label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700"><PartyPopper className="h-3.5 w-3.5 text-fuchsia-500" /> Animations</Label>
        <div className="mt-2 grid grid-cols-3 gap-1.5">
          {(
            [
              { id: 'off', label: 'None', icon: CircleOff },
              { id: 'subtle', label: 'Subtle', icon: Waves },
              { id: 'rich', label: 'Rich', icon: Sparkles },
            ] as const
          ).map((m) => {
            const active = activeMotion === m.id
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => patch({ motion: m.id })}
                className={`inline-flex items-center justify-center gap-1 rounded-lg border px-1 py-1.5 text-[11px] font-medium transition-colors ${active ? 'border-violet-600 bg-violet-50 text-violet-700' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}
              >
                <m.icon className="h-3.5 w-3.5" /> {m.label}
              </button>
            )
          })}
        </div>
        <p className="mt-1 text-[10px] text-slate-400">{motionBlurb} Visitors who prefer reduced motion always get the still version.</p>
      </div>

      {/* Accent */}
      <div>
        <Label className="text-xs font-semibold text-slate-700">Accent color</Label>
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          {ACCENTS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => patch({ accent: c })}
              className={`h-7 w-7 rounded-full border-2 transition-transform hover:scale-110 ${accent === c ? 'scale-110 border-slate-800' : 'border-transparent'}`}
              style={{ background: c }}
              aria-label={`Accent ${c}`}
            />
          ))}
          <Input value={accent} onChange={(e) => patch({ accent: e.target.value.slice(0, 7) })} className="h-8 w-24 font-mono text-xs" placeholder="#4F46E5" />
        </div>
      </div>

      {/* Font personality */}
      <div>
        <Label className="text-xs font-semibold text-slate-700">Typeface</Label>
        <p className="mt-0.5 text-[10px] text-slate-400">Each style ships with its own — override if you like.</p>
        <div className="mt-2 grid grid-cols-2 gap-1.5">
          {(
            [
              { id: undefined, label: 'Style default' },
              { id: 'sans', label: 'Sans (clean)' },
              { id: 'grotesk', label: 'Grotesk (modern)' },
              { id: 'serif', label: 'Serif (editorial)' },
              { id: 'mono', label: 'Mono (dev)' },
            ] as { id: PortfolioFont | undefined; label: string }[]
          ).map((f) => {
            const active = f.id === undefined ? !portfolio.font : portfolio.font === f.id
            return (
              <button
                key={f.label}
                type="button"
                onClick={() => patch({ font: f.id })}
                className={`rounded-lg border px-2 py-1.5 text-[11px] font-medium transition-colors ${active ? 'border-violet-600 bg-violet-50 text-violet-700' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}
                style={f.id ? { fontFamily: PORTFOLIO_FONT_STACKS[f.id] } : undefined}
              >
                {f.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Corner radius */}
      <div>
        <Label className="text-xs font-semibold text-slate-700">Corners</Label>
        <div className="mt-2 grid grid-cols-3 gap-1.5">
          {(
            [
              { id: 'sharp', label: 'Sharp' },
              { id: 'round', label: 'Round' },
              { id: 'pill', label: 'Soft' },
            ] as { id: PortfolioRadius; label: string }[]
          ).map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => patch({ radius: r.id })}
              className={`rounded-lg border px-2 py-1.5 text-[11px] font-medium transition-colors ${portfolio.radius === r.id ? 'border-violet-600 bg-violet-50 text-violet-700' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Background texture */}
      <div>
        <Label className="text-xs font-semibold text-slate-700">Background</Label>
        <div className="mt-2 grid grid-cols-4 gap-1.5">
          {(
            [
              { id: 'plain', label: 'Plain', icon: CircleDot },
              { id: 'grid', label: 'Grid', icon: SquareDashed },
              { id: 'dots', label: 'Dots', icon: CircleDot },
              { id: 'blobs', label: 'Glow', icon: Sparkles },
            ] as { id: PortfolioTexture; label: string; icon: typeof CircleDot }[]
          ).map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => patch({ texture: t.id })}
              className={`flex flex-col items-center gap-1 rounded-lg border px-1 py-2 text-[10px] font-medium transition-colors ${
                (portfolio.texture || 'plain') === t.id ? 'border-violet-600 bg-violet-50 text-violet-700' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              <t.icon className="h-3.5 w-3.5" /> {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Availability badge */}
      <div>
        <Label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700"><Sparkles className="h-3.5 w-3.5 text-emerald-500" /> Availability badge</Label>
        <Input
          value={portfolio.badge || ''}
          onChange={(e) => patch({ badge: e.target.value })}
          placeholder="Open to work — leave empty to hide"
          className="mt-2 h-9 text-xs"
          maxLength={40}
        />
      </div>

      {/* Marquee ribbon */}
      <div>
        <Label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700"><Ribbon className="h-3.5 w-3.5 text-violet-500" /> Scrolling ribbon</Label>
        <Input
          value={portfolio.marquee || ''}
          onChange={(e) => patch({ marquee: e.target.value })}
          placeholder="e.g. OPEN FOR FREELANCE · DESIGN · CODE — empty = off"
          className="mt-2 h-9 text-xs"
          maxLength={60}
        />
        <p className="mt-1 text-[10px] text-slate-400">A scrolling banner under your hero. GenZ energy, use with confidence.</p>
      </div>

      <p className="text-[10px] leading-relaxed text-slate-400">
        Everything applies live — publish once and your link shows the latest look. Template count: 6 GenZ + 3 professional + 3 beautiful + 3 originals = 15.
      </p>
    </div>
  )
}
