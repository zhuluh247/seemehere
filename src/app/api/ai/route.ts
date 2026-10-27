import { NextRequest, NextResponse } from 'next/server'
import { activeProvider, runAi, runAiJson, HttpError } from '@/lib/ai/provider'
import { rateLimited, clientIp } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

// ─── Rate limits (per IP): 30 AI calls / minute AND 100 / hour ──────────────

function aiRateLimited(ip: string): boolean {
  return rateLimited(`ai-min:${ip}`, 30, 60_000) || rateLimited(`ai-hour:${ip}`, 100, 60 * 60 * 1000)
}

type Task = 'polish' | 'summary' | 'skills' | 'score' | 'ats-match' | 'parse-cv'

const CV_JSON_NOTE = `The CV is provided as JSON with fields: contact {fullName, jobTitle, email, phone, location, website, linkedin}, summary, experience[] {role, company, location, startDate, endDate, bullets[]}, education[], skills[], certifications[], languages[].`

export async function POST(req: NextRequest) {
  if (activeProvider() === 'none') {
    return NextResponse.json({ error: 'AI is not configured on this deployment' }, { status: 501 })
  }

  const ip = clientIp(req)
  if (aiRateLimited(ip)) return NextResponse.json({ error: 'Slow down a moment and try again' }, { status: 429 })

  let body: { task?: Task; payload?: Record<string, unknown> }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const task = body.task
  const p = body.payload || {}

  try {
    switch (task) {
      case 'polish': {
        const bullet = String(p.bullet || '').slice(0, 500)
        if (!bullet.trim()) return NextResponse.json({ error: 'Nothing to polish' }, { status: 400 })
        const polished = await runAi(
          'You are an expert CV writer. Rewrite resume bullet points to be impactful: strong action verbs first, quantified results where plausible, concise (max 30 words), no first-person pronouns, no fabrications of specific numbers that were not implied by the original. Return ONLY the rewritten bullet text, nothing else.',
          `Role: ${String(p.role || 'Professional')}${p.company ? ` at ${String(p.company)}` : ''}\nBullet: ${bullet}`,
        )
        return NextResponse.json({ result: { polished: polished.trim().replace(/^[-•*]\s*/, '') } })
      }

      case 'summary': {
        const json = await runAiJson<{ summary: string }>(
          'You are an expert CV writer. Write a professional summary (3 sentences, max 60 words) for the candidate based on their CV JSON. Confident, concrete, no clichés like "hard-working team player", no first person. Highlight seniority, domain and one quantifiable strength if present.',
          `${CV_JSON_NOTE}\n\nCV: ${JSON.stringify(p.cv || {}).slice(0, 8000)}`,
        )
        return NextResponse.json({ result: { summary: String(json.summary || '').slice(0, 900) } })
      }

      case 'skills': {
        const json = await runAiJson<{ skills: string[] }>(
          'You are a CV advisor. Suggest 8 concise, relevant professional skills for the given role and seniority. Each skill 1–4 words. Mix of technical and soft skills. Lowercase except proper nouns.',
          `Role: ${String(p.role || 'Professional')}\nExisting skills: ${JSON.stringify((p.existing as string[]) || []).slice(0, 600)}`,
        )
        const skills = (json.skills || []).map((s) => String(s).slice(0, 40)).filter(Boolean).slice(0, 8)
        return NextResponse.json({ result: { skills } })
      }

      case 'score': {
        const json = await runAiJson<{ score: number; strengths: string[]; improvements: string[] }>(
          'You are a rigorous CV reviewer. Score the CV 0–100 for a general job seeker. Rules: 40–55 = weak/incomplete, 56–70 = okay, 71–84 = good, 85+ = excellent. Give 3–5 strengths and 3–5 specific, actionable improvements (mention sections/fields by name). Be honest but encouraging.',
          `${CV_JSON_NOTE}\n\nCV: ${JSON.stringify(p.cv || {}).slice(0, 10000)}`,
        )
        return NextResponse.json({
          result: {
            score: Math.max(0, Math.min(100, Math.round(Number(json.score) || 0))),
            strengths: (json.strengths || []).slice(0, 5).map(String),
            improvements: (json.improvements || []).slice(0, 5).map(String),
          },
        })
      }

      case 'ats-match': {
        const jobText = String(p.jobText || '').slice(0, 15000)
        if (jobText.trim().length < 40) return NextResponse.json({ error: 'Paste a longer job description' }, { status: 400 })
        const json = await runAiJson<{ score: number; matched: string[]; missing: string[]; tips: string[] }>(
          'You are an ATS (Applicant Tracking System) expert. Compare the CV against the job description. Extract the job\'s key hard skills, tools and requirements as keywords. score = 0–100 keyword & requirement coverage. matched = keywords present in the CV. missing = important keywords absent from the CV (max 10, each 1–4 words). tips = 2–4 concrete suggestions of where in the CV to naturally work in the missing keywords. Never invent experience the candidate does not have.',
          `${CV_JSON_NOTE}\n\nCV: ${JSON.stringify(p.cv || {}).slice(0, 10000)}\n\nJOB DESCRIPTION:\n${jobText}`,
        )
        return NextResponse.json({
          result: {
            score: Math.max(0, Math.min(100, Math.round(Number(json.score) || 0))),
            matched: (json.matched || []).slice(0, 15).map(String),
            missing: (json.missing || []).slice(0, 10).map(String),
            tips: (json.tips || []).slice(0, 4).map(String),
          },
        })
      }

      case 'parse-cv': {
        const text = String(p.text || '').slice(0, 15000)
        if (text.trim().length < 40) return NextResponse.json({ error: 'There is not enough text in that CV to import' }, { status: 400 })
        const json = await runAiJson<Record<string, unknown>>(
          `You are a CV data extraction engine. Extract the candidate's CV from the raw text below into STRICT JSON with exactly this shape:
{"contact":{"fullName":"","jobTitle":"","email":"","phone":"","location":"","website":"","linkedin":"","links":[]},"summary":"","experience":[{"id":"1","role":"","company":"","location":"","startDate":"","endDate":"","bullets":[""]}],"education":[{"id":"1","degree":"","school":"","location":"","startDate":"","endDate":"","note":""}],"projects":[{"id":"1","name":"","description":"","tech":"","repoUrl":"","liveUrl":""}],"skills":[{"id":"1","name":""}],"certifications":[{"id":"1","name":"","issuer":"","year":""}],"languages":[{"id":"1","name":"","level":"Fluent"}]}
Rules: use "" for anything not present; keep every id a short string; bullets = the achievement lines (no dashes); dates stay free-text like "Mar 2021" or "2021"; language level must be one of Native/Fluent/Professional/Conversational/Basic; never invent experience. linkedin/website = bare domains like linkedin.com/in/name when present.`,
          text,
        )
        return NextResponse.json({ result: json })
      }

      default:
        return NextResponse.json({ error: 'Unknown task' }, { status: 400 })
    }
  } catch (err) {
    if (err instanceof HttpError) return NextResponse.json({ error: err.message }, { status: err.status })
    console.error('[ai]', err)
    return NextResponse.json({ error: 'AI request failed — try again' }, { status: 502 })
  }
}
