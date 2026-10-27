'use client'

import { Fragment } from 'react'
import type { ReactNode } from 'react'
import { CvPhoto, CIcon, contactLines, dateRange } from './shared'
import type { CvTemplateProps } from './shared'
import type { CustomSection } from '@/lib/cv/types'
import { effectiveSectionOrder, isSectionHidden } from '@/lib/cv/sections'

const LEVEL_PCT: Record<string, number> = { Native: 100, Fluent: 92, Professional: 82, Conversational: 58, Basic: 34 }

/** Template 5 · Creative — bold gradient header, timeline, tags.
 *  Every body section follows the user's chosen order; Education &
 *  Certifications share one grid (each half respects its own hide flag).
 *  Custom sections use Creative's kv styling. */
export function Creative({ data, photoData, showPhoto = true }: CvTemplateProps) {
  const c = data.contact
  const contacts = contactLines(data)
  const hidden = (key: string) => isSectionHidden(data, key)

  const renderCustom = (sec: CustomSection) => {
    if (sec.items.length === 0) return null
    return (
      <section className="cr-sec">
        <div className="cr-sec-title">{(sec.name || 'Additional').toUpperCase()}</div>
        {sec.items.map((it) => (
          <div className="cr-kv" key={it.id} style={{ marginBottom: 8 }}>
            {it.title && <b>{it.title}</b>}
            {it.subtitle && <span>{it.subtitle}</span>}
            {it.body && <span style={{ whiteSpace: 'pre-line' }}>{it.body}</span>}
          </div>
        ))}
      </section>
    )
  }

  const blocks: Record<string, () => ReactNode> = {
    summary: () =>
      !hidden('summary') && data.summary ? (
        <section className="cr-sec">
          <div className="cr-sec-title">About Me</div>
          <p className="cr-sum">{data.summary}</p>
        </section>
      ) : null,
    experience: () =>
      !hidden('experience') && data.experience.length > 0 ? (
        <section className="cr-sec">
          <div className="cr-sec-title">Experience</div>
          <div className="cr-tl">
            {data.experience.map((e) => (
              <div className="cr-item" key={e.id}>
                <div className="cr-top">
                  <div>
                    <div className="cr-xp-role">{e.role}</div>
                    <div className="cr-xp-org">{[e.company, e.location].filter(Boolean).join(' — ')}</div>
                  </div>
                  <div className="cr-date">{dateRange(e.startDate, e.endDate)}</div>
                </div>
                {e.bullets.filter(Boolean).length > 0 && (
                  <ul>
                    {e.bullets.filter(Boolean).map((b, i) => (
                      <li key={i}>{b}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>
      ) : null,
    skills: () =>
      !hidden('skills') && data.skills.length > 0 ? (
        <section className="cr-sec">
          <div className="cr-sec-title">Skills</div>
          <div className="cr-tags">
            {data.skills.map((s) => (
              <span className="cr-tag" key={s.id}>
                {s.name}
              </span>
            ))}
          </div>
        </section>
      ) : null,
    projects: () =>
      !hidden('projects') && data.projects.length > 0 ? (
        <section className="cr-sec">
          <div className="cr-sec-title">Projects</div>
          {data.projects.map((p) => (
            <div className="cr-kv" key={p.id} style={{ marginBottom: 8 }}>
              <b>{p.name}</b>
              <span>{[p.tech, p.repoUrl, p.liveUrl].filter(Boolean).join(' · ')}</span>
              {p.description && <span style={{ color: 'var(--mut)' }}>{p.description}</span>}
            </div>
          ))}
        </section>
      ) : null,
    education: () => {
      // Fused block: Education + Certifications share one grid here.
      const showEdu = !hidden('education') && data.education.length > 0
      const showCert = !hidden('certifications') && data.certifications.length > 0
      if (!showEdu && !showCert) return null
      const solo = !showEdu || !showCert
      return (
        <section className="cr-sec">
          <div className="cr-sec-title">Education &amp; Certifications</div>
          <div className="cr-grid2" style={solo ? { gridTemplateColumns: '1fr' } : undefined}>
            {showEdu &&
              data.education.slice(0, 1).map((e) => (
                <div className="cr-kv" key={e.id}>
                  <b>{e.degree}</b>
                  <span>{[e.school, dateRange(e.startDate, e.endDate), e.note.split('·')[0]?.trim()].filter(Boolean).join(' · ')}</span>
                </div>
              ))}
            {showCert && (
              <div>
                {data.certifications.slice(0, 2).map((cert) => (
                  <div className="cr-kv" key={cert.id}>
                    <b>{cert.name}</b>
                    <span>{[cert.issuer, cert.year].filter(Boolean).join(' · ')}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )
    },
    languages: () =>
      !hidden('languages') && data.languages.length > 0 ? (
        <section className="cr-sec">
          <div className="cr-sec-title">Languages</div>
          {data.languages.map((l) => (
            <div className="cr-lang" key={l.id}>
              <b>{l.name}</b>
              <div className="cr-bar">
                <i style={{ width: `${LEVEL_PCT[l.level] ?? 60}%` }} />
              </div>
              <em>{l.level}</em>
            </div>
          ))}
        </section>
      ) : null,
  }

  const customById = new Map((data.customSections || []).map((s) => [s.id, s]))
  const order = effectiveSectionOrder(data)

  return (
    <div className="cv-page tpl-creative">
      <header className="cr-band">
        <div className="cr-row">
          {showPhoto && <CvPhoto photoData={photoData} name={c.fullName} className="cr-photo" />}
          <div>
            <h1 className="cr-name">{c.fullName || 'Your Name'}</h1>
            {c.jobTitle && <div className="cr-role">{c.jobTitle}</div>}
          </div>
        </div>
        {contacts.length > 0 && (
          <div className="cr-chips">
            {contacts.map((line, i) => (
              <span className="cr-chip" key={i}>
                {CIcon[line.icon]('')}
                {line.text}
              </span>
            ))}
          </div>
        )}
      </header>

      <div className="cr-body">
        {order.map((key) => {
          const custom = customById.get(key)
          if (custom) return <Fragment key={key}>{hidden(key) ? null : renderCustom(custom)}</Fragment>
          const render = blocks[key]
          return <Fragment key={key}>{render ? render() : null}</Fragment>
        })}
      </div>
    </div>
  )
}
