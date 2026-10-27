'use client'

// Client-side AI helper — calls /api/ai, degrades gracefully when AI is off

export class AiUnavailableError extends Error {}

export async function callAi<T>(task: string, payload: Record<string, unknown>): Promise<T> {
  let res: Response
  try {
    res = await fetch('/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ task, payload }),
    })
  } catch {
    throw new AiUnavailableError('AI service unreachable')
  }
  if (res.status === 501) throw new AiUnavailableError('AI is not enabled on this deployment')
  if (!res.ok) {
    const j = (await res.json().catch(() => ({}))) as { error?: string }
    throw new Error(j.error || 'AI request failed')
  }
  const j = (await res.json()) as { result: T }
  return j.result
}
