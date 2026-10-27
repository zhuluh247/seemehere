import 'server-only'

// ─── Pluggable AI provider ───────────────────────────────────────────────────
// SEEMEHERE works with zero AI config (features hide gracefully).
// Providers:
//   zai     → z-ai-web-dev-sdk (default in the Z.ai sandbox, no key needed)
//   gemini  → Google Gemini REST API (free tier) — set GEMINI_API_KEY
//   none    → AI disabled, /api/ai returns 501 and the UI hides AI buttons

export type AiProvider = 'zai' | 'gemini' | 'none'

// Resolution order (AI_PROVIDER is OPTIONAL on real deployments):
//   AI_PROVIDER=gemini | zai | none  → explicit override
//   unset + GEMINI_API_KEY present   → gemini (auto — works on Render with just the key)
//   unset + no key                   → zai (sandbox); callZai degrades to a
//                                      graceful 501 when the SDK has no config file.
export function activeProvider(): AiProvider {
  const p = (process.env.AI_PROVIDER || '').toLowerCase()
  if (p === 'none') return 'none'
  if (p === 'gemini') return process.env.GEMINI_API_KEY ? 'gemini' : 'none'
  if (p === 'zai') return 'zai'
  // Auto: a Gemini key always wins (real deployments set only the key)
  if (process.env.GEMINI_API_KEY) return 'gemini'
  return 'zai'
}

const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash'

async function callZai(system: string, user: string): Promise<string> {
  // The sandbox SDK needs a .z-ai-config file that does not exist on normal
  // hosts (Render etc.). Never crash — degrade to a clean 501 instead.
  try {
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
  } catch (err) {
    if (err instanceof HttpError) throw err
    console.warn('[ai] z-ai SDK unavailable on this host — treating AI as not configured')
    throw new HttpError(501, 'AI is not configured on this deployment')
  }
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
  if (!res.ok) {
    // Log the body (bad key, quota, wrong model name…) but keep it diagnosable
    const detail = await res.text().catch(() => '')
    console.error(`[ai] Gemini error ${res.status}: ${detail.slice(0, 400)}`)
    throw new HttpError(502, 'AI request failed — check the GEMINI_API_KEY on the server')
  }
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
