import 'server-only'

// ─── Pluggable AI provider ───────────────────────────────────────────────────
// SEEMEHERE works with zero AI config (features hide gracefully).
// Providers:
//   zai     → z-ai-web-dev-sdk (default in the Z.ai sandbox, no key needed)
//   gemini  → Google Gemini REST API (free tier) — set GEMINI_API_KEY
//   none    → AI disabled, /api/ai returns 501 and the UI hides AI buttons

export type AiProvider = 'zai' | 'gemini' | 'none'

export function activeProvider(): AiProvider {
  const p = (process.env.AI_PROVIDER || 'zai').toLowerCase()
  if (p === 'none') return 'none'
  if (p === 'gemini') return process.env.GEMINI_API_KEY ? 'gemini' : 'none'
  return 'zai'
}

const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash'

async function callZai(system: string, user: string): Promise<string> {
  const ZAI = (await import('z-ai-web-dev-sdk')).default
  const zai = await ZAI.create()
  const res = await zai.chat.completions.create({
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ],
  })
  const content = (res as unknown as { choices?: { message?: { content?: string } }[] })?.choices?.[0]?.message?.content
  if (!content) throw new Error('Empty AI response')
  return content
}

async function callGemini(system: string, user: string): Promise<string> {
  const key = process.env.GEMINI_API_KEY
  if (!key) throw new Error('GEMINI_API_KEY missing')
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${key}`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents: [{ role: 'user', parts: [{ text: user }] }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 2048 },
    }),
  })
  if (!res.ok) throw new Error(`Gemini error ${res.status}`)
  const json = await res.json()
  const text = json?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text || '').join('') || ''
  if (!text) throw new Error('Empty AI response')
  return text
}

export async function runAi(system: string, user: string): Promise<string> {
  const provider = activeProvider()
  if (provider === 'none') throw new HttpError(501, 'AI is not configured on this deployment')
  if (provider === 'gemini') return callGemini(system, user)
  return callZai(system, user)
}

export class HttpError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

/** Ask the model for strict JSON and parse defensively */
export async function runAiJson<T>(system: string, user: string): Promise<T> {
  const raw = await runAi(`${system}\n\nRespond with STRICT JSON only. No markdown fences, no commentary.`, user)
  const cleaned = raw.replace(/```json\s*|```\s*/g, '').trim()
  const start = cleaned.search(/[[{]/)
  const end = Math.max(cleaned.lastIndexOf('}'), cleaned.lastIndexOf(']'))
  if (start === -1 || end === -1) throw new HttpError(502, 'AI returned unparseable output')
  return JSON.parse(cleaned.slice(start, end + 1)) as T
}
