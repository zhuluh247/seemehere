'use client'

import { useEffect, useRef, useState } from 'react'
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
import './templates.css'

export const TEMPLATE_META: { id: TemplateId; name: string; blurb: string; img: string }[] = [
  { id: 'classic', name: 'Classic', blurb: 'Traditional serif · maximum ATS safety', img: '/templates/1-classic.png' },
  { id: 'modern', name: 'Modern', blurb: 'Sidebar + timeline · the crowd-pleaser', img: '/templates/2-modern.png' },
  { id: 'minimal', name: 'Minimal', blurb: 'Swiss whitespace · quiet confidence', img: '/templates/3-minimal.png' },
  { id: 'executive', name: 'Executive', blurb: 'Ivory & serif · senior leadership', img: '/templates/4-executive.png' },
  { id: 'creative', name: 'Creative', blurb: 'Bold gradient header · stand out', img: '/templates/5-creative.png' },
  { id: 'compact', name: 'Compact', blurb: 'Dense · fits the most per page', img: '/templates/6-compact.png' },
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

/** Measure a hidden render of the template to determine natural content height,
 *  then split into N A4-sized viewport slices. Each slice is overflow:hidden
 *  so only its 1123px portion of the rendered template shows. Page 1 fills
 *  first, page 2 picks up where page 1 ended, and so on — no content is lost
 *  and nothing gets cut off mid-row (sections have break-inside: avoid in CSS). */
export function CvPages({
  templateId,
  theme,
  data,
  photoData,
  showPhoto,
  fontScale = 1,
  className = '',
}: {
  templateId: TemplateId
  theme: CvDocumentProps['theme']
  data: CvDocumentProps['data']
  photoData?: string
  showPhoto?: boolean
  fontScale?: number
  className?: string
}) {
  const measureRef = useRef<HTMLDivElement>(null)
  const [pageCount, setPageCount] = useState(1)
  const [naturalHeight, setNaturalHeight] = useState(PAGE_HEIGHT)

  // Re-measure whenever content or zoom changes
  useEffect(() => {
    const node = measureRef.current
    if (!node) return
    const measure = () => {
      // Measure inside the inner zoom wrapper for accuracy
      const inner = node.querySelector<HTMLElement>('[data-measure-inner]')
      const target = inner ?? node
      const h = Math.ceil(target.scrollHeight / (fontScale || 1))
      setNaturalHeight(h)
      setPageCount(Math.max(1, Math.ceil(h / PAGE_HEIGHT)))
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

  // The template renders ONCE here, then again N times for the visible
  // viewports. React's reconciliation is fast enough; alternative (DOM clone
  // via innerHTML) would break React's ownership of the measurement container.
  const pages = Array.from({ length: pageCount })

  return (
    <div className={`cv-pages-stack ${className}`.trim()}>
      {/* Hidden measurement render — never visible, used to compute page count */}
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
        <div data-measure-inner style={{ zoom: fontScale }}>
          <CvDocument templateId={templateId} theme={theme} data={data} photoData={photoData} showPhoto={showPhoto} />
        </div>
      </div>

      {/* Visible viewport slices — one per A4 page */}
      {pages.map((_, i) => (
        <div
          key={i}
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
              transform: `translateZ(0)`, // GPU layer hint
            }}
          >
            <div style={{ zoom: fontScale }}>
              <CvDocument templateId={templateId} theme={theme} data={data} photoData={photoData} showPhoto={showPhoto} />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// Convenience for code that still imports useMounted-style snapshot.
export const _subscribeNoop = () => () => {}
