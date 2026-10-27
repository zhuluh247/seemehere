'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCvStore } from '@/lib/cv/store'
import { useAuthStore } from '@/lib/cv/auth-store'
import { TEMPLATE_META } from '@/components/cv/templates'
import { LoginModal } from '@/components/auth/LoginModal'
import { Button } from '@/components/ui/button'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { Sparkles, ScanSearch, Gauge, Palette, FileDown, Gift, ArrowRight, Check, Globe, ShieldCheck, MousePointerClick, PenLine, Rocket, Globe2, LogIn } from 'lucide-react'

export function Landing() {
  const router = useRouter()
  const hasCv = useCvStore((s) => s.cv.contact.fullName.length > 0)
  const user = useAuthStore((s) => s.user)
  const fetchMe = useAuthStore((s) => s.fetchMe)
  const [loginOpen, setLoginOpen] = useState(false)

  const goBuild = () => router.push('/build')

  useEffect(() => {
    void fetchMe()
  }, [fetchMe])

  const features = [
    { icon: <Sparkles className="h-5 w-5" />, title: 'AI writing assistant', text: 'Weak bullet? One tap rewrites it with strong verbs and real metrics. Summary generated from your own CV — never generic.' },
    { icon: <ScanSearch className="h-5 w-5" />, title: 'ATS job match', text: 'Paste a job ad and see exactly which keywords your CV covers and which it is missing — before the robots reject you.' },
    { icon: <Gauge className="h-5 w-5" />, title: 'Honest CV scoring', text: 'A 0–100 review with concrete fixes: missing dates, weak openers, thin skills. Improve before you send.' },
    { icon: <Palette className="h-5 w-5" />, title: '6 templates, every color yours', text: 'Hand-crafted layouts from ATS-safe Classic to bold Creative. Any palette — or your own hex — recolors the whole design instantly.' },
    { icon: <FileDown className="h-5 w-5" />, title: 'Exports that actually work', text: 'Text-selectable PDF (ATS-parseable), PNG for LinkedIn, editable Word, plain text, and a personal share link.' },
    { icon: <Globe2 className="h-5 w-5" />, title: 'Your own portfolio website', text: 'Flip one switch and your share link becomes a full personal site — hero, project cards with images, experience and contact. Your name is the brand, not ours.' },
    { icon: <Gift className="h-5 w-5" />, title: 'Free. Genuinely free.', text: 'No account needed, no credit card, no watermark on your CV, no "upgrade to download". Build, export, share — £0 forever.' },
  ]

  const steps = [
    { icon: <MousePointerClick className="h-5 w-5" />, title: 'Pick a template', text: 'Six designs, twelve palettes, or any color you love. Change your mind anytime.' },
    { icon: <PenLine className="h-5 w-5" />, title: 'Fill the guided steps', text: 'Eleven short steps with live preview, smart examples and AI help exactly where people get stuck.' },
    { icon: <Rocket className="h-5 w-5" />, title: 'Export, publish, shine', text: 'Download PDF/PNG/Word/TXT — or publish your personal link and portfolio website at seemehere…/cv/yourname.' },
  ]

  const faqs = [
    { q: 'Is it really free?', a: 'Yes — every template, every color, every export, the portfolio website, AI help included. No trial, no watermark. SEEMEHERE makes money in other ways later; your CV will never be behind a paywall.' },
    { q: 'Do I need an account?', a: 'No. You can build, export and even publish completely without one. An optional free account (just a username and password — no email) saves your in-progress CVs to the cloud and lets you edit published pages anytime.' },
    { q: 'Where is my CV data stored?', a: 'While you edit, in your own browser — we never see your CV. Signed in? Your drafts also sync to our database so you never lose work and can continue on any device. Publishing stores only the snapshot people see at your link.' },
    { q: 'What if I forget my password?', a: 'Because there is no email, a forgotten password cannot be reset — we tell you this plainly at signup. Choose a password you will not forget. Anonymous published pages cannot be edited later either, so an account is the reliable path if you plan to update your CV.' },
    { q: 'Are the PDFs ATS-friendly?', a: 'Yes. Our PDF export uses real selectable text (not screenshots), and all templates are single-column-safe, standard-font designs that parsing software reads correctly.' },
    { q: 'Can I use a photo?', a: 'Absolutely — upload a headshot and every template places it beautifully. No photo? Your initials appear in a tasteful badge instead. Your call, per template.' },
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
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <a href="#templates" className="hover:text-violet-700">Templates</a>
            <a href="#features" className="hover:text-violet-700">Features</a>
            <a href="#how" className="hover:text-violet-700">How it works</a>
            <a href="#faq" className="hover:text-violet-700">FAQ</a>
          </nav>
          <div className="flex items-center gap-2">
            {user ? (
              <Button variant="ghost" onClick={goBuild} className="rounded-full gap-1.5 text-sm font-semibold text-violet-700 hover:bg-violet-50">
                <LogIn className="h-4 w-4" /> My CVs
              </Button>
            ) : (
              <Button variant="ghost" onClick={() => setLoginOpen(true)} className="rounded-full gap-1.5 text-sm font-semibold text-violet-700 hover:bg-violet-50">
                <LogIn className="h-4 w-4" /> Log in
              </Button>
            )}
            <Button onClick={goBuild} className="rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-700 hover:to-indigo-700">
              {hasCv ? 'Continue my CV' : 'Create my CV — free'}
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="pointer-events-none absolute -top-24 left-1/2 h-96 w-[900px] -translate-x-1/2 rounded-full bg-gradient-to-r from-violet-200/50 to-indigo-200/50 blur-3xl" />
          <div className="relative mx-auto max-w-6xl px-4 pb-16 pt-14 sm:pt-20 text-center">
            <Badge variant="outline" className="mb-5 rounded-full border-violet-200 bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">
              Free forever · No signup · AI included
            </Badge>
            <h1 className="mx-auto max-w-3xl text-4xl font-black leading-tight tracking-tight text-slate-900 sm:text-6xl">
              Your CV. One link.{' '}
              <span className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">Seen everywhere.</span>
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
              Build a beautiful, ATS-proof CV in eleven guided steps — with AI that fixes your weak bullet points, plus an optional portfolio website. Then share it as <b>cv/yourname</b>.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button onClick={goBuild} size="lg" className="h-12 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 px-8 text-base font-semibold text-white shadow-lg shadow-violet-200 hover:from-violet-700 hover:to-indigo-700">
                Build my CV now <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
              <a href="#templates" className="text-sm font-medium text-slate-500 hover:text-violet-700">see the templates ↓</a>
            </div>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 text-xs text-slate-400">
              <span className="inline-flex items-center gap-1"><Check className="h-3.5 w-3.5 text-emerald-500" /> No credit card</span>
              <span className="inline-flex items-center gap-1"><Check className="h-3.5 w-3.5 text-emerald-500" /> Data stays in your browser</span>
              <span className="inline-flex items-center gap-1"><Check className="h-3.5 w-3.5 text-emerald-500" /> Unwatermarked exports</span>
            </div>

            {/* Hero preview strip */}
            <div className="relative mx-auto mt-12 max-w-4xl overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 p-3 shadow-2xl">
              <div className="grid grid-cols-3 gap-3">
                {TEMPLATE_META.slice(1, 4).map((t) => (
                   
                  <img key={t.id} src={t.img} alt={t.name} className="w-full rounded-lg border border-slate-200 object-cover object-top shadow-sm" style={{ aspectRatio: '794/1123' }} />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Templates */}
        <section id="templates" className="border-t border-slate-100 bg-slate-50 py-16">
          <div className="mx-auto max-w-6xl px-4">
            <div className="mb-10 text-center">
              <h2 className="text-3xl font-black tracking-tight text-slate-900">Six templates. Infinite colors.</h2>
              <p className="mt-2 text-sm text-slate-500">Every template accepts any palette — or your own hex — with one tap in the builder.</p>
            </div>
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
          </div>
        </section>

        {/* Features */}
        <section id="features" className="py-16">
          <div className="mx-auto max-w-6xl px-4">
            <div className="mb-10 text-center">
              <h2 className="text-3xl font-black tracking-tight text-slate-900">Everything a great CV needs. Nothing it doesn&apos;t.</h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((f) => (
                <div key={f.title} className="rounded-2xl border border-slate-200 bg-white p-5 transition-all hover:-translate-y-0.5 hover:shadow-md">
                  <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">{f.icon}</span>
                  <h3 className="text-sm font-bold text-slate-900">{f.title}</h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-slate-600">{f.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how" className="border-y border-slate-100 bg-gradient-to-b from-slate-50 to-white py-16">
          <div className="mx-auto max-w-5xl px-4">
            <h2 className="mb-10 text-center text-3xl font-black tracking-tight text-slate-900">Ten minutes to a CV you are proud of</h2>
            <div className="grid gap-6 sm:grid-cols-3">
              {steps.map((s, i) => (
                <div key={s.title} className="relative rounded-2xl border border-slate-200 bg-white p-5">
                  <span className="absolute -top-3 left-5 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 px-2.5 py-0.5 text-[11px] font-bold text-white">Step {i + 1}</span>
                  <span className="mb-3 mt-1 flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">{s.icon}</span>
                  <h3 className="text-sm font-bold text-slate-900">{s.title}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-slate-600">{s.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="py-16">
          <div className="mx-auto max-w-3xl px-4">
            <h2 className="mb-8 text-center text-3xl font-black tracking-tight text-slate-900">Fair questions, straight answers</h2>
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((f) => (
                <AccordionItem key={f.q} value={f.q}>
                  <AccordionTrigger className="text-left text-sm font-semibold text-slate-800">{f.q}</AccordionTrigger>
                  <AccordionContent className="text-sm leading-relaxed text-slate-600">{f.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* Final CTA */}
        <section className="px-4 pb-16">
          <div className="mx-auto max-w-4xl overflow-hidden rounded-3xl bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-12 text-center shadow-xl">
            <Globe className="mx-auto mb-4 h-8 w-8 text-white/80" />
            <h2 className="text-2xl font-black text-white sm:text-3xl">Ready to be seen?</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-violet-100">Build it here. Publish it anywhere. cv/yourname is waiting.</p>
            <Button onClick={goBuild} size="lg" className="mt-6 h-12 rounded-full bg-white px-8 text-base font-bold text-violet-700 hover:bg-violet-50">
              Create my CV — free
            </Button>
          </div>
        </section>
      </main>

      {/* Sticky footer */}
      <footer className="mt-auto border-t border-slate-100 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-6 sm:flex-row">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-violet-600 to-indigo-600 text-[10px] font-black text-white">S</span>
            <span className="text-sm font-extrabold tracking-tight text-slate-700">SEEMEHERE</span>
            <span className="text-xs text-slate-400">· the free CV builder</span>
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
