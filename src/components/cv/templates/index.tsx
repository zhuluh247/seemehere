'use client'

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

/** Full-size A4 wrapper with content zoom (font scale / page fit) */
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
    <div ref={innerRef} style={{ width: 794, height: 1123, overflow: 'hidden', background: '#fff' }}>
      <div style={{ zoom: fontScale }}>
        <CvDocument templateId={templateId} theme={theme} data={data} photoData={photoData} showPhoto={showPhoto} />
      </div>
    </div>
  )
}
