import 'server-only'
import { siteUrl } from '@/lib/site'

// ─── Pluggable AI provider ───────────────────────────────────────────────────
// SEEMEHERE works with zero AI config (features hide gracefully).
// Providers:
//   gemini      → Google Gemini REST API — GEMINI_API_KEY
//   openrouter  → OpenRouter (one key, 400+ models) — OPENROUTER_API_KEY
//   zai         → z-ai-web-dev-sdk (default in the Z.ai sandbox, no key needed)
//   none        → AI disabled, /api/ai returns 501 and the UI hides AI buttons
//
// Resolution order (AI_PROVIDER is OPTIONAL):
//   AI_PROVIDER=gemini|openrouter|zai|none  → explicit override
//   unset + GEMINI_API_KEY                  → gemini … AND if Gemini is busy
//         (429/5xx) while OPENROUTER_API_KEY is also set, the same call is
//         automatically retried on OpenRouter — the user never sees the error.
//   unset + only OPENROUTER_API_KEY         → openrouter
//   unset + neither                         → zai (sandbox); degrades to 501

export type AiProvider = 'zai' | 'gemini' | 'openrouter' | 'none'

export function activeProvider(): AiProvider {
  const p = (process.env.AI_PROVIDER || '').toLowerCase()
  if (p === 'none') return 'none'
  if (p === 'gemini') return process.env.GEMINI_API_KEY ? 'gemini' : 'none'
  if (p === 'openrouter') return process.env.OPENROUTER_API_KEY ? 'openrouter' : 'none'
  if (p === 'zai') return 'zai'
  if (process.env.GEMINI_API_KEY) return 'gemini'
  if (process.env.OPENROUTER_API_KEY) return 'openrouter'
  return 'zai'
}

const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-3.8-flash'

// Switch models ANYTIME from the Render dashboard — no code edits needed:
//   google/gemini-3.8-flash        (default — same brain as your Gemini key,
//                                   but routed via OpenRouter's providers)
//   google/gemini-3.5-flash-lite   (cheapest paid, ~$0.10 / million input)
//   google/gemma-4-31b-it:free     (100% free tier)
// Full catalog: https://openrouter.ai/models
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || 'google/gemini-3.8-flash'

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

function busyStatus(status: number): boolean {
  return status === 429 || status >= 500
}

async function geminiOnce(system: string, user: string, thinkingBudget: number | null): Promise<string> {
  const key = process.env.GEMINI_API_KEY
  if (!key) throw new Error('GEMINI_API_KEY missing')
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${key}`
  const gen: Record<string, unknown> = { temperature: 0.7, maxOutputTokens: 8192 }
  // thinkingBudget 0 = answer instantly (Gemini 3.x flash models think by
  // default, which is slow AND can burn the whole token budget -> empty text)
  if (thinkingBudget !== null) gen.thinkingConfig = { thinkingBudget }
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents: [{ role: 'user', parts: [{ text: user }] }],
      generationConfig: gen,
    }),
  })
  if (!res.ok) {
    // Log the body (bad key, quota, high demand…) but keep it diagnosable
    const detail = await res.text().catch(() => '')
    console.error(`[ai] Gemini error ${res.status}: ${detail.slice(0, 400)}`)
    throw new HttpError(
      res.status,
      busyStatus(res.status) ? 'AI is busy right now — one moment' : 'AI request failed — check the GEMINI_API_KEY on the server',
    )
  }
  const json = await res.json()
  return json?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text || '').join('') || ''
}

async function callGemini(system: string, user: string): Promise<string> {
  // Attempt 1: thinking OFF → fast (2–5s). If the API rejects the option or the
  // answer comes back empty, attempt 2 falls back to the plain legacy config.
  let text = ''
  try {
    text = await geminiOnce(system, user, 0)
  } catch (err) {
    const retryable = err instanceof HttpError && err.status >= 500
    if (!retryable) throw err
    console.warn('[ai] retrying Gemini without thinkingConfig')
    text = await geminiOnce(system, user, null)
  }
  if (!text) {
    console.warn('[ai] empty Gemini answer — retrying once with default config')
    text = await geminiOnce(system, user, null)
  }
  if (!text) throw new HttpError(502, 'AI came back empty — try again')
  return text
}

async function callOpenRouter(system: string, user: string): Promise<string> {
  const key = process.env.OPENROUTER_API_KEY
  if (!key) throw new Error('OPENROUTER_API_KEY missing')
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
      'HTTP-Referer': siteUrl(),
      'X-Title': 'SEEMEHERE',
    },
    body: JSON.stringify({
      model: OPENROUTER_MODEL,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      temperature: 0.7,
      max_tokens: 8192,
    }),
  })
  if (!res.ok) {
    const detail = await res.text().catch(() => '')
    console.error(`[ai] OpenRouter error ${res.status}: ${detail.slice(0, 400)}`)
    throw new HttpError(
      busyStatus(res.status) ? 503 : 502,
      busyStatus(res.status) ? 'AI is busy right now — one moment' : 'AI request failed — check the OPENROUTER_API_KEY on the server',
    )
  }
  const json = await res.json()
  const text = json?.choices?.[0]?.message?.content || ''
  if (!text) throw new HttpError(502, 'AI came back empty — try again')
  return text
}

export async function runAi(system: string, user: string): Promise<string> {
  const provider = activeProvider()
  if (provider === 'none') throw new HttpError(501, 'AI is not configured on this deployment')
  if (provider === 'openrouter') return callOpenRouter(system, user)
  if (provider === 'zai') return callZai(system, user)
  // Gemini primary — automatic escape hatch to OpenRouter on busy/quota errors
  try {
    return await callGemini(system, user)
  } catch (err) {
    if (err instanceof HttpError && busyStatus(err.status) && process.env.OPENROUTER_API_KEY) {
      console.warn('[ai] Gemini busy — falling back to OpenRouter')
      return callOpenRouter(system, user)
    }
    throw err
  }
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
