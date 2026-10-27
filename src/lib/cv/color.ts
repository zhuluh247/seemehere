// ─── Color utilities for the editable theme system ──────────────────────────

export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  let h = hex.replace('#', '').trim()
  if (h.length === 3) h = h.split('').map((c) => c + c).join('')
  const n = parseInt(h, 16)
  if (isNaN(n) || h.length !== 6) return { r: 79, g: 70, b: 229 } // fallback indigo
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 }
}

export function rgbToHex(r: number, g: number, b: number): string {
  const c = (v: number) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')
  return `#${c(r)}${c(g)}${c(b)}`
}

/** Mix two hex colors. t=0 → a, t=1 → b */
export function mix(a: string, b: string, t: number): string {
  const A = hexToRgb(a)
  const B = hexToRgb(b)
  return rgbToHex(A.r + (B.r - A.r) * t, A.g + (B.g - A.g) * t, A.b + (B.b - A.b) * t)
}

export const darken = (hex: string, t: number): string => mix(hex, '#000000', t)
export const lighten = (hex: string, t: number): string => mix(hex, '#ffffff', t)

/** Relative luminance (0 dark → 1 light) */
export function luminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex)
  const f = (v: number) => {
    const s = v / 255
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
  }
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b)
}

/** Pick readable text color for a background */
export function readableOn(bg: string, dark = '#1F2937', light = '#FFFFFF'): string {
  return luminance(bg) > 0.45 ? dark : light
}

/** Build a full ThemeSpec from just an accent color (used by the custom picker) */
export function themeFromAccent(accent: string) {
  const headerBg = darken(accent, 0.62)
  return {
    accent,
    headerBg,
    headerText: readableOn(headerBg),
    text: '#111827',
    muted: '#6B7280',
  }
}

/** Light tint used for soft chips / tag backgrounds */
export const softTint = (accent: string): string => lighten(accent, 0.9)
