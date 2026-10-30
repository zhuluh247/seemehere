'use client'

import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { createPortal } from 'react-dom'
import { ZoomIn, ZoomOut, FileDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCvStore } from '@/lib/cv/store'
import { CvPages, TEMPLATE_META } from '@/components/cv/templates'
import { exportPdf } from '@/lib/cv/export'

/** Hydration-safe mounted flag (SSR-safe; resolves to true on the client) */
const subscribeNoop = () => () => {}
function useMounted(): boolean {
  return useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false,
  )
}

/**
 * Live A4 preview (scaled to panel width) + fit controls + hidden multi-page
 * renderer used by PDF/PNG export. Multi-page renders into N viewports so
 * longer CVs flow onto page 2, 3, … without clipping.
 */
export function PreviewPane({ mobileOverlay = false, onClose }: { mobileOverlay?: boolean; onClose?: () => void }) {
  const cv = useCvStore((s) => s.cv)
  const design = useCvStore((s) => s.design)
  const photoData = useCvStore((s) => s.photoData)
  const setDesign = useCvStore((s) => s.setDesign)

  const wrapRef = useRef<HTMLDivElement>(null)
  const [panelScale, setPanelScale] = useState(0.55)
  const [pageCount, setPageCount] = useState(1)

  // Scale preview to panel width
  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const ro = new ResizeObserver(() => {
      const w = el.clientWidth
      setPanelScale(Math.min(1, w / 794))
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // Read the page count reported by the multi-page renderer (set via data attr)
  useEffect(() => {
    const check = () => {
      const host = document.getElementById('cv-renderer')
      const pages = host?.querySelectorAll('.cv-page-viewport').length ?? 1
      setPageCount(pages)
    }
    const t = setInterval(check, 600)
    check()
    return () => clearInterval(t)
  }, [cv, design, photoData])

  const template = TEMPLATE_META.find((t) => t.id === design.templateId)

  return (
    <div className={mobileOverlay ? 'fixed inset-0 z-50 bg-slate-900/95 flex flex-col' : 'flex flex-col'}>
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-t-xl bg-slate-100 border border-slate-200">
        <div className="text-xs font-medium text-slate-500 truncate">
          {template?.name} · A4
          <span className="ml-1.5 inline-flex items-center gap-1 rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-semibold text-slate-700">
            {pageCount} page{pageCount === 1 ? '' : 's'}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7" title="Smaller text" onClick={() => setDesign({ fontScale: Math.max(0.72, Math.round((design.fontScale - 0.02) * 100) / 100) })}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-[11px] text-slate-500 w-9 text-center tabular-nums">{Math.round(design.fontScale * 100)}%</span>
          <Button variant="ghost" size="icon" className="h-7 w-7" title="Larger text" onClick={() => setDesign({ fontScale: Math.min(1.15, Math.round((design.fontScale + 0.02) * 100) / 100) })}>
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" className="h-7 text-xs gap-1 hidden md:inline-flex" onClick={() => exportPdf(cv.contact.fullName)} title="Download PDF via print dialog">
            <FileDown className="h-3.5 w-3.5" /> PDF
          </Button>
          {mobileOverlay && (
            <Button variant="default" size="sm" className="h-7 text-xs" onClick={onClose}>
              Close
            </Button>
          )}
        </div>
      </div>

      {/* Scaled live preview — multi-page stack */}
      <div ref={wrapRef} className="flex-1 overflow-auto rounded-b-xl border border-t-0 border-slate-200 bg-slate-200/60 p-3">
        <div style={{ zoom: panelScale }} className="inline-block">
          <div className="cv-pages-stack">
            <CvPages
              templateId={design.templateId}
              theme={design.theme}
              data={cv}
              photoData={photoData}
              showPhoto={design.showPhoto}
              fontScale={design.fontScale}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

/** Hidden multi-page render used by PNG capture (per-page) and printing.
 *  Portals to body so it isn't affected by parent transforms/clipping. */
export function HiddenRenderer() {
  const cv = useCvStore((s) => s.cv)
  const design = useCvStore((s) => s.design)
  const photoData = useCvStore((s) => s.photoData)
  const mounted = useMounted()
  if (!mounted) return null

  return createPortal(
    <div
      id="cv-renderer"
      aria-hidden
      style={{ position: 'fixed', left: -10000, top: 0, width: 794, background: '#fff' }}
    >
      <CvPages
        templateId={design.templateId}
        theme={design.theme}
        data={cv}
        photoData={photoData}
        showPhoto={design.showPhoto}
        fontScale={design.fontScale}
      />
    </div>,
    document.body,
  )
}
