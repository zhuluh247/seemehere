'use client'

import { Fragment } from 'react'
import type { ReactNode } from 'react'
import { CvPhoto, dateRange, showC, initialsOf } from './shared'
import type { CvTemplateProps } from './shared'
import type { CustomSection } from '@/lib/cv/types'
import { effectiveSectionOrder, isSectionHidden } from '@/lib/cv/sections'

/** Template 8 · Vertex — slim accent rail, monogram badge, numbered sections.
 *  Sections render in the user's chosen order; hidden sections are skipped;
 *  custom sections are rendered with Vertex's own entry styling. */
export function Vertex({ data, photoData, showPhoto = true }: CvTemplateProps) {
  const c = data.contact
  const hidden = (key: string) => isSectionHidden(data, key)

  const contactBits = [c.email, c.phone, c.location, c.website, c.linkedin, ...(c.links || []).map((l) => l.url)].filter(Boolean)

  // Section numbers are computed by call ORDER at render time; the mutable
  // counter lives inside a factory so React's immutability lint is satisfied.
  const makeNumberer = () => {
    let secNo = 0
    return (label: string) => {
      secNo += 1
      return (
        <div className="vx-sec-title">
          <span className="vx-num">{String(secNo).padStart(2, '0')}</span> {label}
        </div>
      )
    }
  }
  const numbered = makeNumberer()

  const renderCustom = (sec: CustomSection) => {
    if (sec.items.length === 0) return null
    return (
      <section className="vx-sec">
        {numbered(sec.name || 'Additional')}
        {sec.items.map((it) => (
          <div className="vx-item" key={it.id}>
            <div className="vx-date">{it.subtitle || ''}</div>
            <div>
              <div className="vx-xp-role">{it.title}</div>
              {it.body && (
                <p className="vx-sum" style={{ marginTop: 5, fontSize: 12, whiteSpace: 'pre-line' }}>
                  {it.body}
                </p>
              )}
            </div>
          </div>
        ))}
      </section>
    )
  }

  const blocks: Record<string, () => ReactNode> = {
    summary: () =>
      !hidden('summary') && data.summary.trim() ? (
        <section className="vx-sec">
          {numbered('Profile')}
          <p className="vx-sum">{data.summary}</p>
        </section>
      ) : null,
    experience: () =>
      !hidden('experience') && data.experience.length > 0 ? (
        <section className="vx-sec">
          {numbered('Experience')}
          {data.experience.map((e) => (
            <div className="vx-item" key={e.id}>
              <div className="vx-date">{dateRange(e.startDate, e.endDate)}</div>
              <div>
                <div className="vx-xp-role">{e.role}</div>
                <div className="vx-xp-org">{showC([e.company, e.location])}</div>
                {e.bullets.filter(Boolean).length > 0 && (
                  <ul>
                    {e.bullets.filter(Boolean).map((b, i) => (
                      <li key={i}>{b}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ))}
        </section>
      ) : null,
    projects: () =>
      !hidden('projects') && data.projects.length > 0 ? (
        <section className="vx-sec">
          {numbered('Projects')}
          {data.projects.map((p) => (
            <div className="vx-item" key={p.id}>
              <div className="vx-date">{[p.tech, p.liveUrl].filter(Boolean)[0] || ''}</div>
              <div>
                <div className="vx-xp-role">{p.name}</div>
                {p.description && <p className="vx-sum" style={{ marginTop: 4, fontSize: 12 }}>{p.description}</p>}
              </div>
            </div>
          ))}
        </section>
      ) : null,
    education: () =>
      !hidden('education') && data.education.length > 0 ? (
        <section className="vx-sec">
          {numbered('Education')}
          {data.education.map((e) => (
            <div className="vx-item" key={e.id}>
              <div className="vx-date">{dateRange(e.startDate, e.endDate)}</div>
              <div>
                <div className="vx-xp-role">{e.degree}</div>
                <div className="vx-xp-org">{showC([e.school, e.location])}</div>
                {e.note && <p className="vx-sum" style={{ marginTop: 4, fontSize: 12 }}>{e.note}</p>}
              </div>
            </div>
          ))}
        </section>
      ) : null,
    certifications: () =>
      !hidden('certifications') && data.certifications.length > 0 ? (
        <section className="vx-sec">
          {numbered('Certifications')}
          {data.certifications.map((cert) => (
            <div className="vx-kv" key={cert.id}>
              <b>{cert.name}</b>
              <span>{[cert.issuer, cert.year].filter(Boolean).join(' · ')}</span>
            </div>
          ))}
        </section>
      ) : null,
    skills: () =>
      !hidden('skills') && data.skills.length > 0 ? (
        <section className="vx-sec">
          {numbered('Skills')}
          <div className="vx-pills">
            {data.skills.map((s) => (
              <span className="vx-pill" key={s.id}>
                {s.name}
              </span>
            ))}
          </div>
        </section>
      ) : null,
    languages: () =>
      !hidden('languages') && data.languages.length > 0 ? (
        <section className="vx-sec">
          {numbered('Languages')}
          {data.languages.map((l) => (
            <div className="vx-lang" key={l.id}>
              <b>{l.name}</b>
              <i>{l.level}</i>
            </div>
          ))}
        </section>
      ) : null,
  }

  const customById = new Map((data.customSections || []).map((s) => [s.id, s]))
  const order = effectiveSectionOrder(data)

  return (
    <div className="cv-page tpl-vertex">
      <div className="vx-rail" />
      <div className="vx-main">
        <header className="vx-head">
          <div className="vx-id">
            {!showPhoto && <div className="vx-logo">{initialsOf(c.fullName)}</div>}
            <div style={{ minWidth: 0 }}>
              <div className="vx-name">{c.fullName || 'Your Name'}</div>
              {c.jobTitle && <div className="vx-role">{c.jobTitle}</div>}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10, flexShrink: 0 }}>
            {showPhoto && <CvPhoto photoData={photoData} name={c.fullName} className="vx-photo" />}
            {contactBits.length > 0 && (
              <div className="vx-contact">
                {contactBits.map((bit, i) => (
                  <span key={i}>{bit}</span>
                ))}
              </div>
            )}
          </div>
        </header>

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
