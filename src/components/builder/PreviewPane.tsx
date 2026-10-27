'use client'

import { useEffect, useRef, useState, useCallback, useSyncExternalStore } from 'react'
import { createPortal } from 'react-dom'
import { ZoomIn, ZoomOut, ScanSearch, FileDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCvStore } from '@/lib/cv/store'
import { CvPageA4, TEMPLATE_META } from '@/components/cv/templates'
import { exportPdf } from '@/lib/cv/export'
import { toast } from 'sonner'

/**
 * Live A4 preview (scaled to panel width) + fit controls + hidden full-size
 * renderer used by PDF/PNG export.
 */
export function PreviewPane({ mobileOverlay = false, onClose }: { mobileOverlay?: boolean; onClose?: () => void }) {
  const cv = useCvStore((s) => s.cv)
  const design = useCvStore((s) => s.design)
  const photoData = useCvStore((s) => s.photoData)
  const setDesign = useCvStore((s) => s.setDesign)

  const wrapRef = useRef<HTMLDivElement>(null)
  const [panelScale, setPanelScale] = useState(0.55)
  const [fits, setFits] = useState(true)

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

  // Overflow check against the hidden full-size render
  const checkFit = useCallback(() => {
    requestAnimationFrame(() => {
      const inner = document.getElementById('cv-render-inner')
      const page = inner?.querySelector('.cv-page') as HTMLElement | null
      if (!inner || !page) return
      const prev = inner.style.zoom
      inner.style.zoom = '1'
      const natural = page.scrollHeight // natural content height at zoom 1
      inner.style.zoom = prev
      setFits(natural <= 1123 + 4)
    })
  }, [])

  useEffect(() => {
    checkFit()
  }, [cv, design, photoData, checkFit])

  const autoFit = () => {
    const inner = document.getElementById('cv-render-inner')
    const page = inner?.querySelector('.cv-page') as HTMLElement | null
    if (!inner || !page) return
    inner.style.zoom = '1'
    const natural = page.scrollHeight
    const target = 1112
    const fit = natural > target ? Math.max(0.72, Math.floor((target / natural) * 100) / 100) : 1
    inner.style.zoom = String(fit)
    setDesign({ fontScale: fit })
    setFits(true)
    toast.success(fit < 1 ? `Fitted to one page (${Math.round(fit * 100)}%)` : 'Already fits on one page')
  }

  const template = TEMPLATE_META.find((t) => t.id === design.templateId)

  return (
    <div className={mobileOverlay ? 'fixed inset-0 z-50 bg-slate-900/95 flex flex-col' : 'flex flex-col'}>
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-t-xl bg-slate-100 border border-slate-200">
        <div className="text-xs font-medium text-slate-500 truncate">
          {template?.name} · A4 {fits ? <span className="text-emerald-600">· fits 1 page</span> : <span className="text-amber-600">· overflows</span>}
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7" title="Smaller text" onClick={() => setDesign({ fontScale: Math.max(0.72, Math.round((design.fontScale - 0.02) * 100) / 100) })}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-[11px] text-slate-500 w-9 text-center tabular-nums">{Math.round(design.fontScale * 100)}%</span>
          <Button variant="ghost" size="icon" className="h-7 w-7" title="Larger text" onClick={() => setDesign({ fontScale: Math.min(1.15, Math.round((design.fontScale + 0.02) * 100) / 100) })}>
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={autoFit} title="Auto-fit to one page">
            <ScanSearch className="h-3.5 w-3.5" /> Fit
          </Button>
          <Button variant="outline" size="sm" className="h-7 text-xs gap-1 hidden md:inline-flex" onClick={() => exportPdf()} title="Download PDF via print dialog">
            <FileDown className="h-3.5 w-3.5" /> PDF
          </Button>
          {mobileOverlay && (
            <Button variant="default" size="sm" className="h-7 text-xs" onClick={onClose}>
              Close
            </Button>
          )}
        </div>
      </div>

      {/* Scaled live preview */}
      <div ref={wrapRef} className="flex-1 overflow-auto rounded-b-xl border border-t-0 border-slate-200 bg-slate-200/60 p-3">
        <div style={{ zoom: panelScale }} className="shadow-xl">
          <CvPageA4
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
  )
}

/** Hidden full-size render used by PNG capture and printing (portal → body) */
export function HiddenRenderer() {
  const cv = useCvStore((s) => s.cv)
  const design = useCvStore((s) => s.design)
  const photoData = useCvStore((s) => s.photoData)
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  )
  if (!mounted) return null

  return createPortal(
    <div
      id="cv-renderer"
      aria-hidden
      style={{ position: 'fixed', left: -10000, top: 0, width: 794, height: 1123, overflow: 'hidden', background: '#fff' }}
    >
      <div id="cv-render-inner" style={{ zoom: design.fontScale }}>
        <CvPageA4
          templateId={design.templateId}
          theme={design.theme}
          data={cv}
          photoData={photoData}
          showPhoto={design.showPhoto}
          fontScale={1}
        />
      </div>
    </div>,
    document.body,
  )
}
