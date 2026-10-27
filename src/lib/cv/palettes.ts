import type { ThemeSpec } from './types'

// ─── 12 curated palettes — every template color is editable ─────────────────
export interface Palette {
  id: string
  name: string
  theme: ThemeSpec
}

export const PALETTES: Palette[] = [
  { id: 'indigo-night', name: 'Indigo Night', theme: { accent: '#4F46E5', headerBg: '#1E1B4B', headerText: '#FFFFFF', text: '#111827', muted: '#6B7280' } },
  { id: 'royal-blue', name: 'Royal Blue', theme: { accent: '#2563EB', headerBg: '#1E3A8A', headerText: '#FFFFFF', text: '#111827', muted: '#6B7280' } },
  { id: 'teal-tide', name: 'Teal Tide', theme: { accent: '#0D9488', headerBg: '#134E4A', headerText: '#FFFFFF', text: '#111827', muted: '#6B7280' } },
  { id: 'emerald-isle', name: 'Emerald Isle', theme: { accent: '#059669', headerBg: '#064E3B', headerText: '#FFFFFF', text: '#111827', muted: '#6B7280' } },
  { id: 'forest-pine', name: 'Forest Pine', theme: { accent: '#15803D', headerBg: '#14532D', headerText: '#FFFFFF', text: '#111827', muted: '#6B7280' } },
  { id: 'burgundy', name: 'Burgundy', theme: { accent: '#9F1239', headerBg: '#4C0519', headerText: '#FFFFFF', text: '#111827', muted: '#6B7280' } },
  { id: 'plum', name: 'Plum', theme: { accent: '#7E22CE', headerBg: '#3B0764', headerText: '#FFFFFF', text: '#111827', muted: '#6B7280' } },
  { id: 'terracotta', name: 'Terracotta', theme: { accent: '#C2410C', headerBg: '#431407', headerText: '#FFFFFF', text: '#111827', muted: '#6B7280' } },
  { id: 'golden-heritage', name: 'Golden Heritage', theme: { accent: '#B08D57', headerBg: '#3E3227', headerText: '#FFFFFF', text: '#2D2A26', muted: '#6B6257' } },
  { id: 'charcoal', name: 'Charcoal', theme: { accent: '#334155', headerBg: '#0F172A', headerText: '#FFFFFF', text: '#111827', muted: '#6B7280' } },
  { id: 'steel-slate', name: 'Steel Slate', theme: { accent: '#475569', headerBg: '#1E293B', headerText: '#FFFFFF', text: '#111827', muted: '#64748B' } },
  { id: 'rosewood', name: 'Rosewood', theme: { accent: '#BE185D', headerBg: '#500724', headerText: '#FFFFFF', text: '#111827', muted: '#6B7280' } },
]

export const DEFAULT_PALETTE = PALETTES[0]
