'use client'

import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { TemplateId } from '@/lib/cv/types'
import type { CvTemplateProps } from './shared'
import { themeVars } from './shared'
import { DEFAULT_PALETTE } from '@/lib/cv/palettes'
import { Classic } from './Classic'
import { Modern } from './Modern'
import { Minimal } from './Minimal'
import { Executive } from './Executive'
import { Creative } from './Creative'
import { Compact } from './Compact'
import { Aurora } from './Aurora'
import { Vertex } from './Vertex'
import { Editorial } from './Editorial'
import { Atlas } from './Atlas'
import { Slate } from './Slate'
import { Lumina } from './Lumina'
import './templates.css'

export const TEMPLATE_META: { id: TemplateId; name: string; blurb: string; img: string }[] = [
  { id: 'classic', name: 'Classic', blurb: 'Traditional serif · maximum ATS safety', img: '/templates/1-classic.png' },
  { id: 'modern', name: 'Modern', blurb: 'Sidebar + timeline · the crowd-pleaser', img: '/templates/2-modern.png' },
  { id: 'minimal', name: 'Minimal', blurb: 'Swiss whitespace · quiet confidence', img: '/templates/3-minimal.png' },
  { id: 'executive', name: 'Executive', blurb: 'Ivory & serif · senior leadership', img: '/templates/4-executive.png' },
  { id: 'creative', name: 'Creative', blurb: 'Bold gradient header · stand out', img: '/templates/5-creative.png' },
  { id: 'compact', name: 'Compact', blurb: 'Dense · fits the most per page', img: '/templates/6-compact.png' },
  { id: 'aurora', name: 'Aurora', blurb: 'Gradient banner · bold & vivid', img: '/templates/7-aurora.svg' },
  { id: 'vertex', name: 'Vertex', blurb: 'Accent rail · geometric precision', img: '/templates/8-vertex.svg' },
  { id: 'editorial', name: 'Editorial', blurb: 'Magazine serif · designer taste', img: '/templates/9-editorial.svg' },
  { id: 'atlas', name: 'Atlas', blurb: 'Header card · corporate polish', img: '/templates/10-atlas.svg' },
  { id: 'slate', name: 'Slate', blurb: 'Swiss stark · ultra-modern', img: '/templates/11-slate.svg' },
  { id: 'lumina', name: 'Lumina', blurb: 'Soft cards · warm & friendly', img: '/templates/12-lumina.svg' },
]

interface CvDocumentProps extends CvTemplateProps {
  templateId: TemplateId
}

/** Renders the chosen template inside the A4 page with themed CSS variables */
export function CvDocument({ templateId, theme, ...rest }: CvDocumentProps) {
  const t = theme ?? DEFAULT_PALETTE.theme
  const inner = (() => {
    switch (templateId) {
      case 'classic':
        return <Classic {...rest} />
      case 'modern':
        return <Modern {...rest} theme={theme} />
      case 'minimal':
        return <Minimal {...rest} />
      case 'executive':
        return <Executive {...rest} />
      case 'creative':
        return <Creative {...rest} />
      case 'compact':
        return <Compact {...rest} />
      case 'aurora':
        return <Aurora {...rest} />
      case 'vertex':
        return <Vertex {...rest} />
      case 'editorial':
        return <Editorial {...rest} />
      case 'atlas':
        return <Atlas {...rest} />
      case 'slate':
        return <Slate {...rest} />
      case 'lumina':
        return <Lumina {...rest} />
      default:
        return <Modern {...rest} theme={theme} />
    }
  })()

  return (
    <div style={themeVars(t)} className="cv-theme-root">
      {inner}
    </div>
  )
}

/** Full-size A4 wrapper — single-page legacy entry.
 *  Kept for backwards compatibility with hidden single-page measurement
 *  (PreviewPane's overflow check). For live multi-page rendering, use CvPages. */
export function CvPageA4({
  templateId,
  theme,
  data,
  photoData,
  showPhoto,
  fontScale = 1,
  innerRef,
}: {
  templateId: TemplateId
  theme: CvDocumentProps['theme']
  data: CvDocumentProps['data']
  photoData?: string
  showPhoto?: boolean
  fontScale?: number
  innerRef?: React.Ref<HTMLDivElement>
}) {
  return (
    <div ref={innerRef} style={{ width: 794, minHeight: 1123, background: '#fff' }}>
      <div style={{ zoom: fontScale }}>
        <CvDocument templateId={templateId} theme={theme} data={data} photoData={photoData} showPhoto={showPhoto} />
      </div>
    </div>
  )
}

const PAGE_HEIGHT = 1123 // A4 screen px at 96dpi (210mm × 297mm → 794×1123)

/* ─── Section-aware pagination ──────────────────────────────────────────────
   The old engine sliced the continuous render every 1123px, which cut text
   mid-line/mid-word at page borders. The new engine measures every SECTION
   (and every entry inside oversized sections) and assigns whole blocks to
   pages: a section that doesn't fit the remaining space moves entirely to the
   next page, so breaks always land BETWEEN sections — never inside a word.

   Every template tags its flow units with well-known classes; the selector
   list below is the single source of truth. Entries (second group) are only
   used to split a section that is taller than a full A4 page. Untagged zones
   (Modern's sidebar, Vertex's color rail) repeat on every page by design. */

const BLOCK_SEL = [
  // classic
  '.cl-hdr', '.cl-dbl', '.cl-sec', '.cl-entry',
  // modern (main column only — sidebar repeats on every page)
  '.md-name2', '.md-role2', '.md-rule', '.md-sec2', '.md-xp',
  // minimal / executive / creative / compact
  '.mn-hdr', '.mn-sec', '.mn-xp',
  '.ex-hdr', '.ex-sec', '.ex-xp',
  '.cr-band', '.cr-sec', '.cr-item',
  '.cp-hdr', '.cp-sec', '.cp-xp',
  // aurora / vertex / editorial / atlas / slate / lumina
  '.au-band', '.au-sec', '.au-item',
  '.vx-head', '.vx-sec', '.vx-item',
  '.ed-hdr', '.ed-sec', '.ed-item',
  '.at-hdr', '.at-sec', '.at-item',
  '.sl-hdr', '.sl-sec', '.sl-item',
  '.lm-hdr', '.lm-sec', '.lm-item',
].join(', ')

const BLOCK_SEL_TOP = BLOCK_SEL // same list; "top-level" is derived from ancestry

interface Blk {
  i: number // data-cvb index (document order across ALL tagged blocks)
  y: number // top edge relative to the template root (unscaled page px)
  h: number
  isTop: boolean // no other block ancestor → top-level flow unit
  parent: number // data-cvb index of the nearest block ancestor (-1 if top)
  entries: number[] // child entry indices (for top-level sections)
}

const SAFETY_PX = 14 // margin of error for reflow differences on a page copy

/** Measure + group blocks into page-sized sets. Returns null when the
 *  template exposes no known blocks (caller falls back to pixel slicing).
 *  `unit` = device px per layout px (captures ALL ancestor zoom levels),
 *  derived from a 1123px ruler inside the same zoom context, so the math is
 *  identical in the preview (zoomed by panel width) and the hidden renderer. */
function paginate(
  root: HTMLElement,
  unit: number,
): Set<number>[] | null {
  if (!(unit > 0)) return null
  const rootRect = root.getBoundingClientRect()
  const naturalH = rootRect.height / unit
  const els = Array.from(root.querySelectorAll<HTMLElement>(BLOCK_SEL_TOP))
  if (els.length === 0) return null

  const blocks: Blk[] = []
  els.forEach((el, k) => {
    el.setAttribute('data-cvb', String(k))
    const r = el.getBoundingClientRect()
    blocks.push({
      i: k,
      y: (r.top - rootRect.top) / unit,
      h: r.height / unit,
      isTop: !(el.parentElement && el.parentElement.closest(BLOCK_SEL_TOP)),
      parent: -1,
      entries: [],
    })
  })
  // link entries to their parent section
  els.forEach((el, k) => {
    if (blocks[k].isTop) return
    const p = el.parentElement && (el.parentElement.closest(BLOCK_SEL_TOP) as HTMLElement | null)
    blocks[k].parent = p ? Number(p.getAttribute('data-cvb')) : -1
  })
  const byIdx = new Map(blocks.map((b) => [b.i, b]))
  for (const b of blocks) if (!b.isTop && b.parent >= 0) byIdx.get(b.parent)?.entries.push(b.i)

  const tops = blocks.filter((b) => b.isTop)
  if (tops.length === 0) return null

  // Usable height for blocks on ANY page copy: every page re-renders from the
  // template's own padding down, so capacity = A4 minus top pad minus bottom pad.
  const firstY = tops[0].y
  const last = tops.reduce((a, b) => (b.y + b.h > a.y + a.h ? b : a), tops[0])
  const padBottom = Math.max(0, naturalH - (last.y + last.h))
  const cap = Math.max(120, PAGE_HEIGHT - firstY - padBottom - SAFETY_PX)

  const pageSets: Set<number>[] = []
  let cur = new Set<number>()
  let curH = 0

  const flush = () => {
    if (cur.size) pageSets.push(cur)
    cur = new Set<number>()
    curH = 0
  }
  const placeWhole = (b: Blk, gap: number) => {
    cur.add(b.i)
    for (const e of b.entries) cur.add(e)
    curH += gap + b.h
  }

  /** Split an oversized section across pages at ENTRY boundaries. The section
   *  shell (title) repeats on each continuation page — standard CV practice. */
  const splitSection = (b: Blk) => {
    const ents = b.entries.map((i) => byIdx.get(i)!).filter(Boolean)
    if (ents.length === 0) {
      placeWhole(b, 0) // nothing splittable inside — let the viewport clip it
      return
    }
    const shellTop = Math.max(0, ents[0].y - b.y)
    cur = new Set([b.i])
    curH = shellTop
    let prev: Blk | null = null
    for (const e of ents) {
      const gap = prev ? Math.max(0, e.y - (prev.y + prev.h)) : 0
      // `cur.size === 1` forces the first entry to stay with its section title
      if (curH + gap + e.h <= cap || cur.size === 1) {
        cur.add(e.i)
        curH += gap + e.h
      } else {
        flush()
        cur = new Set([b.i, e.i])
        curH = shellTop + e.h
      }
      prev = e
    }
  }

  for (let t = 0; t < tops.length; t++) {
    const b = tops[t]
    if (cur.size === 0) {
      if (b.h <= cap) placeWhole(b, 0)
      else if (b.entries.length) splitSection(b)
      else placeWhole(b, 0)
      continue
    }
    const prev = tops[t - 1]
    const gap = Math.max(0, b.y - (prev.y + prev.h))
    if (curH + gap + b.h <= cap) {
      placeWhole(b, gap)
    } else {
      flush()
      if (b.h <= cap) placeWhole(b, 0)
      else if (b.entries.length) splitSection(b)
      else placeWhole(b, 0)
    }
  }
  flush()
  if (pageSets.length === 0) return null
  return pageSets
}

interface CvPagesProps {
  templateId: TemplateId
  theme: CvDocumentProps['theme']
  data: CvDocumentProps['data']
  photoData?: string
  showPhoto?: boolean
  fontScale?: number
  className?: string
}

/** One visible A4 page: renders the template once, then hides every block
 *  that belongs to a different page (before first paint, via layout effect).
 *  The first visible top-level block gets .cvb-first so pages start flush. */
function PageCopy({
  set,
  templateId,
  theme,
  data,
  photoData,
  showPhoto,
  fontScale = 1,
}: CvPagesProps & { set: Set<number> }) {
  const ref = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const rootEl = ref.current
    if (!rootEl) return
    const els = Array.from(rootEl.querySelectorAll<HTMLElement>(BLOCK_SEL))
    els.forEach((el, k) => el.setAttribute('data-cvb', String(k)))
    let firstTopDone = false
    for (const el of els) {
      const on = set.has(Number(el.getAttribute('data-cvb')))
      el.style.display = on ? '' : 'none'
      const isTop = !(el.parentElement && el.parentElement.closest(BLOCK_SEL))
      if (isTop) {
        const isFirst = on && !firstTopDone
        el.classList.toggle('cvb-first', isFirst)
        if (isFirst) firstTopDone = true
      }
    }
    return () => {
      for (const el of els) {
        el.style.display = ''
        el.classList.remove('cvb-first')
      }
    }
  }, [set])

  return (
    <div ref={ref} style={{ zoom: fontScale }}>
      <CvDocument templateId={templateId} theme={theme} data={data} photoData={photoData} showPhoto={showPhoto} />
    </div>
  )
}

/** Multi-page A4 renderer. Measures a hidden full render of the template,
 *  groups whole sections into pages (see paginate()), then renders one
 *  viewport copy per page. Falls back to the legacy pixel-slice only when a
 *  template exposes none of the known block classes. */
export function CvPages({
  templateId,
  theme,
  data,
  photoData,
  showPhoto,
  fontScale = 1,
  className = '',
}: CvPagesProps) {
  const measureRef = useRef<HTMLDivElement>(null)
  // null = not measured yet → render a single full page (no flash of empty)
  const [pageSets, setPageSets] = useState<Set<number>[] | null>(null)
  const [sliceCount, setSliceCount] = useState(1)

  // Re-measure whenever content or zoom changes
  useEffect(() => {
    const node = measureRef.current
    if (!node) return
    const measure = () => {
      const inner = node.querySelector<HTMLElement>('[data-measure-inner]')
      const tplRoot = node.querySelector<HTMLElement>('.cv-page')
      if (!inner || !tplRoot) return
      // The ruler lives inside the SAME zoom context as the template root, so
      // unit = device px per layout px — ancestor panel-zoom included, always.
      const ruler = node.querySelector<HTMLElement>('[data-cv-ruler]')
      const rulerH = ruler ? ruler.getBoundingClientRect().height : PAGE_HEIGHT * (fontScale || 1)
      const unit = rulerH / PAGE_HEIGHT

      const sets = paginate(tplRoot, unit)
      if (sets && sets.length > 0) {
        setPageSets(sets)
        setSliceCount(sets.length)
      } else {
        // Fallback: natural height via the root rect, legacy pixel slicing
        const naturalH = tplRoot.getBoundingClientRect().height / unit
        setPageSets(null)
        setSliceCount(Math.max(1, Math.ceil(naturalH / PAGE_HEIGHT)))
      }
    }
    measure()
    // Defer a second measurement for web-font / image load
    const t = setTimeout(measure, 240)
    const ro = new ResizeObserver(measure)
    ro.observe(node)
    return () => {
      clearTimeout(t)
      ro.disconnect()
    }
  }, [data, photoData, showPhoto, fontScale, templateId, theme])

  const useSlices = pageSets === null

  return (
    <div className={`cv-pages-stack ${className}`.trim()}>
      {/* Hidden measurement render — never visible, used to compute pages */}
      <div
        ref={measureRef}
        aria-hidden
        style={{
          position: 'absolute',
          left: -10000,
          top: 0,
          width: 794,
          overflow: 'visible',
          visibility: 'hidden',
          pointerEvents: 'none',
        }}
      >
        <div data-measure-inner style={{ zoom: fontScale, position: 'relative' }}>
          {/* 1123px ruler — gives the exact device-px-per-layout-px factor,
              immune to any ancestor zoom (preview panel scale etc.) */}
          <div data-cv-ruler aria-hidden style={{ position: 'absolute', top: 0, left: 0, width: 1, height: PAGE_HEIGHT, pointerEvents: 'none' }} />
          <CvDocument templateId={templateId} theme={theme} data={data} photoData={photoData} showPhoto={showPhoto} />
        </div>
      </div>

      {/* Visible A4 pages — one viewport per page */}
      {useSlices
        ? Array.from({ length: sliceCount }).map((_, i) => (
            <div
              key={`s-${i}`}
              className="cv-page-viewport"
              data-page-index={i}
              style={{
                width: 794,
                height: PAGE_HEIGHT,
                overflow: 'hidden',
                position: 'relative',
                background: '#fff',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: -i * PAGE_HEIGHT,
                  left: 0,
                  right: 0,
                  width: 794,
                  transform: `translateZ(0)`,
                }}
              >
                <div style={{ zoom: fontScale }}>
                  <CvDocument templateId={templateId} theme={theme} data={data} photoData={photoData} showPhoto={showPhoto} />
                </div>
              </div>
            </div>
          ))
        : pageSets!.map((set, i) => (
            <div
              key={`p-${i}`}
              className="cv-page-viewport"
              data-page-index={i}
              style={{
                width: 794,
                height: PAGE_HEIGHT,
                overflow: 'hidden',
                position: 'relative',
                background: '#fff',
              }}
            >
              <PageCopy
                set={set}
                templateId={templateId}
                theme={theme}
                data={data}
                photoData={photoData}
                showPhoto={showPhoto}
                fontScale={fontScale}
              />
            </div>
          ))}
    </div>
  )
}

// Convenience for code that still imports useMounted-style snapshot.
export const _subscribeNoop = () => () => {}
