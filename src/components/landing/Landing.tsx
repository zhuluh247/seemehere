'use client'

// ─── R6 · Landing page — two products, one profile ─────────────────────────
// Clean violet/indigo SaaS look, rewritten to market BOTH the CV builder and
// the new Portfolio builder, lead with the template count, and answer the
// "why are we better than the paid guys" question with a generic-but-
// specific comparison table (no brand names).

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCvStore } from '@/lib/cv/store'
import { useAuthStore } from '@/lib/cv/auth-store'
import { TEMPLATE_META } from '@/components/cv/templates'
import { LoginModal } from '@/components/auth/LoginModal'
import { Button } from '@/components/ui/button'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import {
  Sparkles, ScanSearch, Gauge, Palette, FileDown, Gift, ArrowRight, Check, Globe,
  ShieldCheck, MousePointerClick, PenLine, Rocket, Globe2, X, FileText, Wand2,
} from 'lucide-react'
import { PORTFOLIO_STYLES, PORTFOLIO_PRO_STYLES, PORTFOLIO_LUXE_STYLES, type PortfolioLayout } from '@/lib/cv/types'

const PF_ALL_STYLES = [...PORTFOLIO_STYLES, ...PORTFOLIO_PRO_STYLES, ...PORTFOLIO_LUXE_STYLES]
const MARQUEE_CHUNK = `${PF_ALL_STYLES.map((s) => s.name).join('   ✦   ')}   ✦   `.repeat(3)

/** Tiny CSS mock of a portfolio style, used in the template gallery */
function PfMock({ id, accent }: { id: PortfolioLayout; accent: string }) {
  const box = 'aspect-[4/3] overflow-hidden rounded-lg border border-slate-100'
  if (id === 'aura')
    return (
      <div className={`${box} flex flex-col items-center justify-center gap-1.5`} style={{ background: `linear-gradient(135deg, ${accent}26, #EC489920)` }}>
        <div className="h-5 w-5 rounded-full" style={{ background: `linear-gradient(135deg, ${accent}, #EC4899)` }} />
        <div className="h-2 w-16 rounded-full" style={{ background: `linear-gradient(90deg, ${accent}, #EC4899)` }} />
        <div className="h-1 w-12 rounded bg-slate-300" />
      </div>
    )
  if (id === 'riot')
    return (
      <div className={`${box} flex items-center justify-center bg-white p-2`}>
        <div className="flex flex-col items-start gap-1">
          <div className="h-3.5 w-16 -rotate-2 border-2 border-black shadow-[2px_2px_0_#000]" style={{ background: accent }} />
          <div className="h-2 w-12 rotate-1 border-2 border-black bg-white shadow-[2px_2px_0_#000]" />
          <div className="h-2 w-9 -rotate-1 border-2 border-black bg-amber-200 shadow-[2px_2px_0_#000]" />
        </div>
      </div>
    )
  if (id === 'editorial')
    return (
      <div className={`${box} flex flex-col items-center justify-center gap-1.5 bg-[#FAF9F6]`}>
        <div className="font-serif text-xl font-bold text-slate-800" style={{ fontFamily: 'Georgia, serif' }}>Aa</div>
        <div className="h-px w-12 bg-slate-300" />
        <div className="h-1 w-14 rounded bg-slate-200" />
      </div>
    )
  if (id === 'terminal')
    return (
      <div className={`${box} bg-[#0D1420] p-2.5 font-mono`}>
        <div className="mb-1.5 flex gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-[#FF5F57]" />
          <span className="h-1.5 w-1.5 rounded-full bg-[#FEBC2E]" />
          <span className="h-1.5 w-1.5 rounded-full bg-[#28C840]" />
        </div>
        <div className="text-[8px] text-emerald-400">➜ ~ whoami</div>
        <div className="text-[10px] font-bold" style={{ color: accent }}>Your Name</div>
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
  if (id === 'atelier')
    return (
      <div className={`${box} flex flex-col justify-center gap-1.5 bg-[#F7F4EE] px-3`}>
        <div className="flex items-center justify-between">
          <div className="text-[7px] font-bold uppercase tracking-[0.3em] text-stone-400">Portfolio</div>
          <div className="h-px w-5 bg-stone-300" />
        </div>
        <div className="text-base text-stone-800" style={{ fontFamily: 'Georgia, serif' }}>Aa</div>
        <div className="h-px w-full bg-stone-300/70" />
        <div className="h-1 w-12 rounded-sm bg-stone-200" />
      </div>
    )
  if (id === 'monolith')
    return (
      <div className={`${box} flex flex-col justify-center gap-1.5 bg-[#0B0D10] px-3`}>
        <div className="h-1 w-7" style={{ background: accent }} />
        <div className="text-xs font-black uppercase leading-tight text-white">NAME</div>
        <div className="grid grid-cols-3 gap-px bg-white/10">
          <div className="h-3 bg-[#0B0D10]" />
          <div className="h-3 bg-[#0B0D10]" />
          <div className="h-3 bg-[#0B0D10]" />
        </div>
      </div>
    )
  if (id === 'meridian')
    return (
      <div className={`${box} flex flex-col items-center justify-center gap-1.5 bg-slate-50`}>
        <div className="h-4 w-4 rounded-lg" style={{ background: accent }} />
        <div className="h-2 w-16 rounded bg-slate-700" />
        <div className="mt-0.5 flex gap-1">
          <div className="h-2 w-7 rounded-full border border-slate-200 bg-white" />
          <div className="h-2 w-7 rounded-full border border-slate-200 bg-white" />
        </div>
      </div>
    )
  if (id === 'noir')
    return (
      <div className={`${box} flex flex-col items-center justify-center gap-2 bg-[#0C0A08]`}>
        <div className="flex items-center gap-1.5">
          <div className="h-px w-5" style={{ background: `${accent}88` }} />
          <div className="h-1.5 w-1.5 rotate-45" style={{ background: accent }} />
          <div className="h-px w-5" style={{ background: `${accent}88` }} />
        </div>
        <div className="text-sm text-[#EAE2D6]" style={{ fontFamily: 'Georgia, serif' }}>Aa</div>
        <div className="text-[7px] uppercase tracking-[0.3em] text-[#8A7B57]">portfolio</div>
      </div>
    )
  if (id === 'lagoon')
    return (
      <div className={`${box} flex flex-col items-center justify-center gap-2`} style={{ background: 'linear-gradient(160deg, #E0F7F5, #BAE6FD)' }}>
        <div className="h-4 w-4 rounded-full ring-2 ring-white" style={{ background: accent }} />
        <div className="h-2 w-16 rounded-full" style={{ background: `linear-gradient(90deg, ${accent}, #38BDF8)` }} />
        <svg viewBox="0 0 60 8" className="h-2 w-full text-sky-400/40" fill="currentColor" preserveAspectRatio="none">
          <path d="M0 4 C 10 8 20 0 30 3 C 40 6 50 1 60 4 L 60 8 L 0 8 Z" />
        </svg>
      </div>
    )
  if (id === 'bloom')
    return (
      <div className={`${box} flex flex-col items-center justify-center gap-2 bg-[#FAF6F0]`}>
        <div className="relative">
          <div className="absolute -right-2.5 -top-2.5 h-4 w-4 rounded-full bg-rose-300/70 blur-[2px]" />
          <div className="h-5 w-5 rounded-2xl ring-2 ring-white" style={{ background: accent }} />
        </div>
        <div className="text-sm text-stone-800" style={{ fontFamily: 'Georgia, serif' }}>Aa</div>
        <div className="h-1 w-12 rounded-full bg-stone-200" />
      </div>
    )
  return (
    <div className={`${box} flex flex-col items-center justify-center gap-1.5 bg-white`}>
      <div className="text-[11px] font-light uppercase tracking-[0.3em] text-slate-700">Name</div>
      <div className="h-px w-10" style={{ background: accent }} />
      <div className="text-[7px] uppercase tracking-[0.2em] text-slate-400">portfolio</div>
    </div>
  )
}

export function Landing() {
  const router = useRouter()
  const hasCv = useCvStore((s) => s.cv.contact.fullName.length > 0)
  const user = useAuthStore((s) => s.user)
  const fetchMe = useAuthStore((s) => s.fetchMe)
  const [loginOpen, setLoginOpen] = useState(false)
  const [gallery, setGallery] = useState<'cv' | 'portfolio'>('cv')

  const goBuild = () => router.push('/build')
  const goPortfolio = () => router.push('/portfolio')

  useEffect(() => {
    void fetchMe()
  }, [fetchMe])

  // R7 · scroll-reveal for every section marked .land-reveal
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>('.land-reveal'))
    if (els.length === 0) return
    if (typeof IntersectionObserver === 'undefined') {
      els.forEach((e) => e.classList.add('land-in'))
      return
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add('land-in')
            io.unobserve(e.target)
          }
        }
      },
      { threshold: 0.08, rootMargin: '0px 0px -6% 0px' },
    )
    els.forEach((e) => io.observe(e))
    return () => io.disconnect()
  }, [])

  const cvFeatures = [
    { icon: <Sparkles className="h-5 w-5" />, title: 'AI writing assistant', text: 'Weak bullet? One tap rewrites it with strong verbs and real metrics. Summary generated from your own CV — never generic.' },
    { icon: <ScanSearch className="h-5 w-5" />, title: 'ATS job match', text: 'Paste a job ad and see exactly which keywords your CV covers and which it is missing — before the robots reject you.' },
    { icon: <Gauge className="h-5 w-5" />, title: 'Honest CV scoring', text: 'A 0–100 review with concrete fixes: missing dates, weak openers, thin skills. Improve before you send.' },
  ]

  const pfFeatures = [
    { icon: <Palette className="h-5 w-5" />, title: '15 portfolio styles', text: 'GenZ (Aura, Riot, Terminal…), professional (Atelier, Monolith, Meridian) and beautiful (Noir, Lagoon, Bloom). Dark mode, accents, textures — and optional animations.' },
    { icon: <Globe2 className="h-5 w-5" />, title: 'Your own link', text: 'Publish at seemehere…/cv/yourname. Project cards with images, testimonials, gallery, contact — your name is the brand.' },
    { icon: <Wand2 className="h-5 w-5" />, title: 'Starts from your CV', text: 'One tap imports everything you already built. Registered users pick from any saved CV; everyone else, we find it in your browser.' },
  ]

  const comparison: { feature: string; us: string; them: string }[] = [
    { feature: 'Price', us: 'Free forever — every template, every export', them: 'Free to build, paid to download' },
    { feature: 'Watermark on your documents', us: 'Never', them: 'Watermark until you upgrade' },
    { feature: 'PDF, PNG, Word & TXT exports', us: 'Unlimited, unwatermarked', them: 'PDF locked behind a plan' },
    { feature: 'Portfolio website included', us: 'Yes — 15 styles + animations, your own link', them: 'Not offered, or a separate product' },
    { feature: 'AI writing, job match & scoring', us: 'Included', them: 'Premium add-on' },
    { feature: 'Account required', us: 'No — build instantly', them: 'Signup wall before you start' },
  ]

  const faqs = [
    { q: 'Is it really free?', a: 'Yes — every template, every color, every export, the portfolio website, AI help included. No trial, no watermark. SEEMEHERE makes money in other ways later; your CV will never be behind a paywall.' },
    { q: 'What is the difference between the CV builder and the Portfolio builder?', a: 'The CV builder produces the document you send to employers — ATS-ready PDF, PNG, Word and text exports, job match and scoring. The Portfolio builder produces a personal website — project cards with images, testimonials, gallery and a contact section, published at your own link. They are two products that share one account, and your portfolio can start from any CV with one tap.' },
    { q: 'Do I need an account?', a: 'No. You can build, export and even publish completely without one. An optional free account (just a username and password — no email) saves your in-progress CVs and portfolios to the cloud and lets you edit published pages anytime.' },
    { q: 'Where is my data stored?', a: 'While you edit, in your own browser — we never see it. Signed in? Your drafts also sync to our database so you never lose work and can continue on any device. Publishing stores only the snapshot people see at your link.' },
    { q: 'Are the PDFs ATS-friendly?', a: 'Yes. Our PDF export uses real selectable text (not screenshots), and all templates are single-column-safe, standard-font designs that parsing software reads correctly.' },
    { q: 'Can I use a photo?', a: 'Absolutely — upload a headshot and every CV template places it beautifully, and your portfolio hero shows it off. No photo? Your initials appear in a tasteful badge instead. Your call.' },
  ]

  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* Nav */}
      <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 text-base font-black text-white">S</span>
            <div className="leading-none">
              <div className="text-base font-black tracking-tight text-slate-900">SEEMEHERE</div>
              <div className="text-[10px] font-medium text-slate-400">get seen. get hired.</div>
            </div>
          </div>
          <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 md:flex">
            <a href="#products" className="hover:text-violet-700">Products</a>
            <a href="#templates" className="hover:text-violet-700">Templates</a>
            <a href="#compare" className="hover:text-violet-700">Why us</a>
            <a href="#how" className="hover:text-violet-700">How it works</a>
            <a href="#faq" className="hover:text-violet-700">FAQ</a>
          </nav>
          <div className="flex items-center gap-2">
            {user ? (
              <button onClick={goBuild} className="hidden text-sm font-medium text-slate-400 transition-colors hover:text-slate-800 sm:block">
                My CVs
              </button>
            ) : (
              <button onClick={() => setLoginOpen(true)} className="hidden text-sm font-medium text-slate-400 transition-colors hover:text-slate-800 sm:block">
                Sign in
              </button>
            )}
            <Button onClick={goBuild} className="rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-700 hover:to-indigo-700">
              {hasCv ? 'Continue my CV' : 'Create my CV — free'}
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* ── Hero ── */}
        <section className="relative overflow-hidden">
          <div className="land-blob pointer-events-none absolute -top-24 left-1/2 h-96 w-[900px] -translate-x-1/2 rounded-full bg-gradient-to-r from-violet-200/50 to-indigo-200/50 blur-3xl" />
          <div className="land-hero relative mx-auto max-w-6xl px-4 pb-16 pt-14 text-center sm:pt-20">
            <Badge variant="outline" className="mb-5 rounded-full border-violet-200 bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">
              <Sparkles className="mr-1.5 h-3.5 w-3.5" /> 20+ free templates · 12 CV + 15 portfolio · AI included
            </Badge>
            <h1 className="mx-auto max-w-3xl text-4xl font-black leading-tight tracking-tight text-slate-900 sm:text-6xl">
              A CV that gets interviews.{' '}
              <span className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">A website that gets seen.</span>
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
              Two free builders, one you: an ATS-proof CV in guided steps with AI that fixes your weak bullets — and a GenZ portfolio website with your own link. No paywall, no watermark, no signup.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button onClick={goBuild} size="lg" className="h-12 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 px-8 text-base font-semibold text-white shadow-lg shadow-violet-200 hover:from-violet-700 hover:to-indigo-700">
                <FileText className="mr-2 h-4 w-4" /> Build my CV <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
              <Button onClick={goPortfolio} size="lg" variant="outline" className="h-12 rounded-full border-violet-300 px-8 text-base font-semibold text-violet-700 hover:bg-violet-50">
                <Globe className="mr-2 h-4 w-4" /> Build my portfolio
              </Button>
            </div>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 text-xs text-slate-400">
              <span className="inline-flex items-center gap-1"><Check className="h-3.5 w-3.5 text-emerald-500" /> No credit card</span>
              <span className="inline-flex items-center gap-1"><Check className="h-3.5 w-3.5 text-emerald-500" /> Data stays in your browser</span>
              <span className="inline-flex items-center gap-1"><Check className="h-3.5 w-3.5 text-emerald-500" /> Unwatermarked exports</span>
              <span className="inline-flex items-center gap-1"><Check className="h-3.5 w-3.5 text-emerald-500" /> Free forever</span>
            </div>

            {/* Hero preview strip — CV pages + portfolio tiles */}
            <div className="relative mx-auto mt-12 max-w-4xl overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 p-3 shadow-2xl">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {TEMPLATE_META.slice(1, 4).map((t) => (
                  <img key={t.id} src={t.img} alt={`${t.name} CV template`} className="w-full rounded-lg border border-slate-200 object-cover object-top shadow-sm" style={{ aspectRatio: '794/1123' }} />
                ))}
                <div className="grid grid-rows-2 gap-2 rounded-lg border border-violet-200 bg-violet-50/60 p-2">
                  <div className="flex items-center justify-center gap-1.5 rounded-md bg-white px-2 text-[10px] font-bold text-violet-700 shadow-sm">
                    <Globe className="h-3 w-3" /> + 15 portfolio styles
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    <PfMock id="aura" accent="#4F46E5" />
                    <PfMock id="noir" accent="#C9A227" />
                    <PfMock id="riot" accent="#4F46E5" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Style-name marquee strip ── */}
        <div className="overflow-hidden border-y border-violet-100 bg-gradient-to-r from-violet-50/60 via-white to-indigo-50/60 py-2.5" aria-hidden>
          <div className="pf-marquee-track whitespace-nowrap text-[11px] font-extrabold uppercase tracking-[0.3em] text-violet-400">
            <span>{MARQUEE_CHUNK}</span>
            <span>{MARQUEE_CHUNK}</span>
          </div>
        </div>

        {/* ── Two products ── */}
        <section id="products" className="border-t border-slate-100 bg-slate-50 py-16">
          <div className="mx-auto max-w-6xl px-4">
            <div className="land-reveal mb-10 text-center">
              <h2 className="text-3xl font-black tracking-tight text-slate-900">Two products. One you.</h2>
              <p className="mx-auto mt-2 max-w-xl text-sm text-slate-500">The document that gets you hired — and the website that makes them remember your name.</p>
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              {/* CV builder card */}
              <div className="land-reveal flex flex-col rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white"><FileText className="h-5 w-5" /></span>
                  <div>
                    <h3 className="text-lg font-black text-slate-900">CV Builder</h3>
                    <p className="text-xs text-slate-500">The document · ATS-ready · exports that work</p>
                  </div>
                </div>
                <div className="mt-4 grid flex-1 grid-cols-3 gap-2">
                  {TEMPLATE_META.slice(0, 3).map((t) => (
                    <img key={t.id} src={t.img} alt={t.name} className="w-full rounded-md border border-slate-100 object-cover object-top" style={{ aspectRatio: '794/1123' }} />
                  ))}
                </div>
                <ul className="mt-5 space-y-2.5">
                  {cvFeatures.map((f) => (
                    <li key={f.title} className="flex items-start gap-2.5">
                      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-violet-50 text-violet-600">{f.icon}</span>
                      <div>
                        <span className="block text-xs font-bold text-slate-800">{f.title}</span>
                        <span className="block text-[11px] leading-snug text-slate-500">{f.text}</span>
                      </div>
                    </li>
                  ))}
                </ul>
                <Button onClick={goBuild} className="mt-6 w-full rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-700 hover:to-indigo-700">
                  Build my CV — free <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </div>

              {/* Portfolio card */}
              <div className="land-reveal flex flex-col rounded-3xl border-2 border-violet-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-fuchsia-500 to-violet-600 text-white"><Globe2 className="h-5 w-5" /></span>
                  <div>
                    <h3 className="text-lg font-black text-slate-900">Portfolio Builder <span className="ml-1 rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-bold text-violet-700">15 STYLES</span></h3>
                    <p className="text-xs text-slate-500">The website · your own link · GenZ to boardroom</p>
                  </div>
                </div>
                <div className="mt-4 grid flex-1 grid-cols-3 gap-2">
                  {(['aura', 'noir', 'bloom'] as PortfolioLayout[]).map((id) => (
                    <PfMock key={id} id={id} accent="#4F46E5" />
                  ))}
                </div>
                <ul className="mt-5 space-y-2.5">
                  {pfFeatures.map((f) => (
                    <li key={f.title} className="flex items-start gap-2.5">
                      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-fuchsia-50 text-fuchsia-600">{f.icon}</span>
                      <div>
                        <span className="block text-xs font-bold text-slate-800">{f.title}</span>
                        <span className="block text-[11px] leading-snug text-slate-500">{f.text}</span>
                      </div>
                    </li>
                  ))}
                </ul>
                <Button onClick={goPortfolio} className="mt-6 w-full rounded-full bg-gradient-to-r from-fuchsia-500 to-violet-600 text-white hover:from-fuchsia-600 hover:to-violet-700">
                  Build my portfolio — free <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* ── Template gallery ── */}
        <section id="templates" className="py-16">
          <div className="mx-auto max-w-6xl px-4">
            <div className="land-reveal mb-8 text-center">
              <h2 className="text-3xl font-black tracking-tight text-slate-900">20+ templates. Infinite colors. Zero nags.</h2>
              <p className="mt-2 text-sm text-slate-500">Every design accepts any palette — or your own hex — with one tap. All free, all unwatermarked.</p>
            </div>

            <div className="land-reveal mb-6 flex justify-center">
              <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 p-1">
                <button
                  onClick={() => setGallery('cv')}
                  className={`rounded-full px-4 py-1.5 text-xs font-bold transition-colors ${gallery === 'cv' ? 'bg-violet-600 text-white shadow-sm' : 'text-slate-600 hover:text-violet-700'}`}
                >
                  CV templates · 12
                </button>
                <button
                  onClick={() => setGallery('portfolio')}
                  className={`rounded-full px-4 py-1.5 text-xs font-bold transition-colors ${gallery === 'portfolio' ? 'bg-violet-600 text-white shadow-sm' : 'text-slate-600 hover:text-violet-700'}`}
                >
                  Portfolio styles · 15
                </button>
              </div>
            </div>

            {gallery === 'cv' ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
                {TEMPLATE_META.map((t) => (
                  <div key={t.id} className="group overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
                    <img src={t.img} alt={`${t.name} CV template`} className="w-full object-cover object-top" style={{ aspectRatio: '794/1123' }} />
                    <div className="p-2.5">
                      <div className="text-sm font-bold text-slate-800">{t.name}</div>
                      <div className="text-[10px] leading-tight text-slate-500">{t.blurb}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* No .land-reveal here: tab switching remounts this grid after the
                 scroll-reveal observer has run, so the reveal class never clears
                 and the gallery would stay invisible. The header above still reveals. */
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {PF_ALL_STYLES.map((s) => (
                  <div key={s.id} className="overflow-hidden rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
                    <PfMock id={s.id} accent="#4F46E5" />
                    <div className="mt-2.5 flex items-baseline justify-between gap-2">
                      <div className="text-sm font-bold text-slate-800">{s.name}</div>
                      <div className="text-[10px] italic text-violet-500">{s.vibe}</div>
                    </div>
                    <div className="text-[10px] leading-tight text-slate-500">{s.blurb}</div>
                  </div>
                ))}
                <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-violet-200 bg-violet-50/40 p-4 text-center">
                  <Globe className="mb-2 h-6 w-6 text-violet-400" />
                  <p className="text-xs font-semibold text-slate-700">Plus 3 classic styles from the early days — still alive for existing sites.</p>
                  <button onClick={goPortfolio} className="mt-2 text-[11px] font-bold text-violet-600 hover:underline">Try them in the builder →</button>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ── Why we're better — comparison ── */}
        <section id="compare" className="border-y border-slate-100 bg-slate-50 py-16">
          <div className="mx-auto max-w-4xl px-4">
            <div className="land-reveal mb-10 text-center">
              <h2 className="text-3xl font-black tracking-tight text-slate-900">Why SEEMEHERE beats the paid builders</h2>
              <p className="mt-2 text-sm text-slate-500">You know the ones — free to start, card required to leave.</p>
            </div>
            <div className="land-reveal overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-left">
                    <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wide text-slate-400">What matters</th>
                    <th className="px-5 py-3.5">
                      <span className="inline-flex items-center gap-1.5 text-sm font-black text-violet-700"><span className="flex h-5 w-5 items-center justify-center rounded-md bg-gradient-to-br from-violet-600 to-indigo-600 text-[10px] font-black text-white">S</span> SEEMEHERE</span>
                    </th>
                    <th className="px-5 py-3.5 text-sm font-semibold text-slate-400">Typical paid builders</th>
                  </tr>
                </thead>
                <tbody>
                  {comparison.map((row) => (
                    <tr key={row.feature} className="border-b border-slate-50 last:border-0">
                      <td className="px-5 py-3.5 text-xs font-semibold text-slate-700">{row.feature}</td>
                      <td className="px-5 py-3.5">
                        <span className="inline-flex items-start gap-1.5 text-xs font-semibold text-emerald-700">
                          <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" /> {row.us}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="inline-flex items-start gap-1.5 text-xs text-slate-400">
                          <X className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-300" /> {row.them}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-4 text-center text-[11px] text-slate-400">
              Comparison based on the free tiers of popular CV builder services as commonly advertised. We name no names — you already know them.
            </p>
          </div>
        </section>

        {/* ── How it works ── */}
        <section id="how" className="py-16">
          <div className="mx-auto max-w-5xl px-4">
            <h2 className="land-reveal mb-10 text-center text-3xl font-black tracking-tight text-slate-900">Ten minutes, either product</h2>
            <div className="grid gap-6 sm:grid-cols-2">
              {
                [
                  {
                    title: 'CV in 3 steps',
                    cta: goBuild,
                    steps: [
                      { icon: <MousePointerClick className="h-4 w-4" />, t: 'Pick a template', x: 'Twelve designs, any palette. Change your mind anytime.' },
                      { icon: <PenLine className="h-4 w-4" />, t: 'Fill the guided steps', x: 'Short steps, live preview, AI help exactly where people get stuck.' },
                      { icon: <Rocket className="h-4 w-4" />, t: 'Export or publish', x: 'PDF / PNG / Word / TXT — plus your own share link with your name on the filename.' },
                    ],
                  },
                  {
                    title: 'Portfolio in 3 steps',
                    cta: goPortfolio,
                    steps: [
                      { icon: <Wand2 className="h-4 w-4" />, t: 'Start from your CV', x: 'Everything imports in one tap — or start from scratch or the sample.' },
                      { icon: <Palette className="h-4 w-4" />, t: 'Pick a style, tune it', x: '15 styles from GenZ to boardroom, dark mode, accents, textures, animations, marquee.' },
                      { icon: <Globe className="h-4 w-4" />, t: 'Publish your link', x: 'Live at seemehere…/cv/yourname with a QR code ready to share.' },
                    ],
                  },
                ].map((col) => (
                  <div key={col.title} className="land-reveal rounded-2xl border border-slate-200 bg-white p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-sm font-black text-slate-900">{col.title}</h3>
                    <button onClick={col.cta} className="text-xs font-bold text-violet-600 hover:underline">Start →</button>
                  </div>
                  <div className="space-y-4">
                    {col.steps.map((s, i) => (
                      <div key={s.t} className="flex items-start gap-3">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-50 text-xs font-black text-violet-600">{i + 1}</span>
                        <div>
                          <span className="block text-xs font-bold text-slate-800">{s.t}</span>
                          <span className="block text-[11px] leading-snug text-slate-500">{s.x}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section id="faq" className="border-t border-slate-100 bg-slate-50 py-16">
          <div className="mx-auto max-w-3xl px-4">
            <h2 className="land-reveal mb-8 text-center text-3xl font-black tracking-tight text-slate-900">Fair questions, straight answers</h2>
            <Accordion type="single" collapsible className="land-reveal w-full">
              {faqs.map((f) => (
                <AccordionItem key={f.q} value={f.q}>
                  <AccordionTrigger className="text-left text-sm font-semibold text-slate-800">{f.q}</AccordionTrigger>
                  <AccordionContent className="text-sm leading-relaxed text-slate-600">{f.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* ── Final CTA ── */}
        <section className="px-4 py-16">
          <div className="land-reveal mx-auto max-w-4xl overflow-hidden rounded-3xl bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-12 text-center shadow-xl">
            <Globe className="mx-auto mb-4 h-8 w-8 text-white/80" />
            <h2 className="text-2xl font-black text-white sm:text-3xl">Ready to be seen?</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-violet-100">Build the CV, launch the website, share one link. cv/yourname is waiting — both are free.</p>
            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button onClick={goBuild} size="lg" className="h-12 rounded-full bg-white px-8 text-base font-bold text-violet-700 hover:bg-violet-50">
                Create my CV — free
              </Button>
              <Button onClick={goPortfolio} size="lg" variant="outline" className="h-12 rounded-full border-white/60 bg-transparent px-8 text-base font-bold text-white hover:bg-white/10">
                Build my portfolio
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* Sticky footer */}
      <footer className="mt-auto border-t border-slate-100 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-6 sm:flex-row">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-violet-600 to-indigo-600 text-[10px] font-black text-white">S</span>
            <span className="text-sm font-extrabold tracking-tight text-slate-700">SEEMEHERE</span>
            <span className="text-xs text-slate-400">· the free CV + portfolio builder</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-slate-400">
            <span className="inline-flex items-center gap-1"><ShieldCheck className="h-3.5 w-3.5" /> Your data stays yours</span>
            <span>© {new Date().getFullYear()} SEEMEHERE</span>
          </div>
        </div>
      </footer>

      <LoginModal open={loginOpen} onOpenChange={setLoginOpen} redirectTo="/build" />
    </div>
  )
}
