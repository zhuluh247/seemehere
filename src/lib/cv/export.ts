'use client'

import { toPng } from 'html-to-image'
import { Document, Packer, Paragraph, TextRun, AlignmentType, BorderStyle } from 'docx'
import type { CvData, ThemeSpec } from './types'
import { dateRange } from '@/components/cv/templates/shared'

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 4000)
}

export function safeFileName(name: string): string {
  return (name.trim().replace(/[^a-zA-Z0-9 _-]/g, '').replace(/\s+/g, '-') || 'my-cv').slice(0, 60)
}

// ─── PDF (via browser print engine → Save as PDF; text-selectable, ATS-safe) ─
export function exportPdf() {
  window.print()
}

// ─── PNG (client-side capture of the full-size hidden render) ────────────────
export async function exportPng(displayName: string): Promise<void> {
  const node = document.getElementById('cv-renderer')
  if (!node) throw new Error('Renderer not ready')
  const dataUrl = await toPng(node, {
    pixelRatio: 2,
    width: 794,
    height: 1123,
    backgroundColor: '#ffffff',
    style: { transform: 'none' },
  })
  const res = await fetch(dataUrl)
  downloadBlob(await res.blob(), `${safeFileName(displayName)}-CV.png`)
}

// ─── DOCX (clean universal Word layout, themed headings) ────────────────────
export async function exportDocx(cv: CvData, theme: ThemeSpec, displayName: string): Promise<void> {
  const hex = theme.accent.replace('#', '').toUpperCase()
  const acc = hex
  const c = cv.contact

  const contactBits = [c.location, c.phone, c.email, c.linkedin, c.website, ...(cv.contact.links || []).map((l) => l.url)].filter(Boolean)
  const children: Paragraph[] = []

  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 60 },
      children: [new TextRun({ text: c.fullName || 'Your Name', bold: true, size: 56, color: '111827' })],
    }),
  )
  if (c.jobTitle) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 80 },
        children: [new TextRun({ text: c.jobTitle, size: 26, color: acc })],
      }),
    )
  }
  if (contactBits.length) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 240 },
        children: [new TextRun({ text: contactBits.join('  ·  '), size: 18, color: '6B7280' })],
      }),
    )
  }

  const section = (title: string) =>
    new Paragraph({
      spacing: { before: 240, after: 100 },
      border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: acc, space: 2 } },
      children: [new TextRun({ text: title.toUpperCase(), bold: true, size: 22, color: acc, characterSpacing: 40 })],
    })

  if (cv.summary) {
    children.push(section('Professional Summary'))
    children.push(new Paragraph({ spacing: { after: 120 }, children: [new TextRun({ text: cv.summary, size: 20 })] }))
  }

  if (cv.experience.length) {
    children.push(section('Professional Experience'))
    for (const e of cv.experience) {
      children.push(
        new Paragraph({
          spacing: { before: 120, after: 20 },
          children: [
            new TextRun({ text: e.role, bold: true, size: 22 }),
            new TextRun({ text: [e.company, e.location].filter(Boolean).join(', ') ? `  ·  ${[e.company, e.location].filter(Boolean).join(', ')}` : '', size: 20, color: '6B7280' }),
            new TextRun({ text: dateRange(e.startDate, e.endDate) ? `    ${dateRange(e.startDate, e.endDate)}` : '', size: 18, color: '9CA3AF' }),
          ],
        }),
      )
      for (const b of e.bullets.filter(Boolean)) {
        children.push(new Paragraph({ bullet: { level: 0 }, spacing: { after: 40 }, children: [new TextRun({ text: b, size: 20 })] }))
      }
    }
  }

  if (cv.education.length) {
    children.push(section('Education'))
    for (const e of cv.education) {
      children.push(
        new Paragraph({
          spacing: { before: 100, after: 20 },
          children: [
            new TextRun({ text: e.degree, bold: true, size: 22 }),
            new TextRun({ text: [e.school, e.location].filter(Boolean).join(', ') ? `  ·  ${[e.school, e.location].filter(Boolean).join(', ')}` : '', size: 20, color: '6B7280' }),
            new TextRun({ text: dateRange(e.startDate, e.endDate) ? `    ${dateRange(e.startDate, e.endDate)}` : '', size: 18, color: '9CA3AF' }),
          ],
        }),
      )
      if (e.note) children.push(new Paragraph({ spacing: { after: 40 }, children: [new TextRun({ text: e.note, italics: true, size: 18, color: '6B7280' })] }))
    }
  }

  if (cv.projects && cv.projects.length) {
    children.push(section('Projects'))
    for (const p of cv.projects) {
      children.push(
        new Paragraph({
          spacing: { before: 100, after: 20 },
          children: [
            new TextRun({ text: p.name, bold: true, size: 22 }),
            new TextRun({ text: [p.tech, p.repoUrl, p.liveUrl].filter(Boolean).join('  ·  ') ? `  ·  ${[p.tech, p.repoUrl, p.liveUrl].filter(Boolean).join('  ·  ')}` : '', size: 18, color: acc }),
          ],
        }),
      )
      if (p.description) children.push(new Paragraph({ spacing: { after: 40 }, children: [new TextRun({ text: p.description, size: 20 })] }))
    }
  }

  if (cv.skills.length) {
    children.push(section('Skills'))
    children.push(new Paragraph({ spacing: { after: 120 }, children: [new TextRun({ text: cv.skills.map((s) => s.name).join('  ·  '), size: 20 })] }))
  }

  if (cv.certifications.length) {
    children.push(section('Certifications'))
    for (const cert of cv.certifications) {
      children.push(
        new Paragraph({
          bullet: { level: 0 },
          spacing: { after: 40 },
          children: [
            new TextRun({ text: cert.name, bold: true, size: 20 }),
            new TextRun({ text: [cert.issuer, cert.year].filter(Boolean).join(' · ') ? ` — ${[cert.issuer, cert.year].filter(Boolean).join(' · ')}` : '', size: 20, color: '6B7280' }),
          ],
        }),
      )
    }
  }

  if (cv.languages.length) {
    children.push(section('Languages'))
    children.push(
      new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun({ text: cv.languages.map((l) => `${l.name} (${l.level})`).join('  ·  '), size: 20 })],
      }),
    )
  }

  const doc = new Document({
    creator: 'SEEMEHERE',
    title: `${displayName} — CV`,
    styles: { default: { document: { run: { font: 'Calibri', size: 20 } } } },
    sections: [
      {
        properties: { page: { margin: { top: 720, bottom: 720, left: 900, right: 900 } } },
        children: [
          ...children,
          new Paragraph({
            spacing: { before: 300 },
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: 'Made with SEEMEHERE', size: 14, color: '9CA3AF', italics: true })],
          }),
        ],
      },
    ],
  })

  const blob = await Packer.toBlob(doc)
  downloadBlob(blob, `${safeFileName(displayName)}-CV.docx`)
}

// ─── TXT (plain-text for ATS portals) ────────────────────────────────────────
export function exportTxt(cv: CvData, displayName: string): void {
  const c = cv.contact
  const L: string[] = []
  const rule = '─'.repeat(52)

  L.push((c.fullName || 'Your Name').toUpperCase())
  if (c.jobTitle) L.push(c.jobTitle)
  const bits = [c.location, c.phone, c.email, c.linkedin, c.website, ...(cv.contact.links || []).map((l) => l.url)].filter(Boolean)
  if (bits.length) L.push(bits.join(' | '))
  L.push('')

  const sec = (t: string) => {
    L.push('', rule, t.toUpperCase(), rule)
  }

  if (cv.summary) {
    sec('Professional Summary')
    L.push(cv.summary)
  }
  if (cv.experience.length) {
    sec('Professional Experience')
    for (const e of cv.experience) {
      L.push(`* ${e.role}${e.company ? ` — ${[e.company, e.location].filter(Boolean).join(', ')}` : ''}${dateRange(e.startDate, e.endDate) ? ` (${dateRange(e.startDate, e.endDate)})` : ''}`)
      for (const b of e.bullets.filter(Boolean)) L.push(`  - ${b}`)
      L.push('')
    }
  }
  if (cv.education.length) {
    sec('Education')
    for (const e of cv.education) {
      L.push(`* ${e.degree}${e.school ? ` — ${[e.school, e.location].filter(Boolean).join(', ')}` : ''}${dateRange(e.startDate, e.endDate) ? ` (${dateRange(e.startDate, e.endDate)})` : ''}`)
      if (e.note) L.push(`  ${e.note}`)
    }
  }
  if (cv.projects && cv.projects.length) {
    sec('Projects')
    for (const p of cv.projects) {
      L.push(`* ${p.name}${[p.tech, p.repoUrl, p.liveUrl].filter(Boolean).length ? ` — ${[p.tech, p.repoUrl, p.liveUrl].filter(Boolean).join(' | ')}` : ''}`)
      if (p.description) L.push(`  ${p.description}`)
    }
  }
  if (cv.skills.length) {
    sec('Skills')
    L.push(cv.skills.map((s) => s.name).join(' | '))
  }
  if (cv.certifications.length) {
    sec('Certifications')
    for (const cert of cv.certifications) L.push(`* ${cert.name}${cert.issuer || cert.year ? ` — ${[cert.issuer, cert.year].filter(Boolean).join(' · ')}` : ''}`)
  }
  if (cv.languages.length) {
    sec('Languages')
    L.push(cv.languages.map((l) => `${l.name} (${l.level})`).join(' | '))
  }
  L.push('', 'Made with SEEMEHERE')

  downloadBlob(new Blob([L.join('\n')], { type: 'text/plain;charset=utf-8' }), `${safeFileName(displayName)}-CV.txt`)
}

// ─── Photo compression (max 480px, JPEG ~85%) ────────────────────────────────
export async function compressPhoto(file: File): Promise<string> {
  return compressImage(file, 480, 0.85)
}

// ─── Generic image compression (project/portfolio images, max 900px) ────────
export async function compressImage(file: File, maxDim = 900, quality = 0.82): Promise<string> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const fr = new FileReader()
    fr.onload = () => resolve(String(fr.result))
    fr.onerror = reject
    fr.readAsDataURL(file)
  })
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const im = new Image()
    im.onload = () => resolve(im)
    im.onerror = reject
    im.src = dataUrl
  })
  const scale = Math.min(1, maxDim / Math.max(img.width, img.height))
  const w = Math.round(img.width * scale)
  const h = Math.round(img.height * scale)
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  if (!ctx) return dataUrl
  ctx.drawImage(img, 0, 0, w, h)
  return canvas.toDataURL('image/jpeg', quality)
}
