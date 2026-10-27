'use client'

import { Fragment } from 'react'
import type { ReactNode } from 'react'
import { CvPhoto, dateRange, showC, contactLines } from './shared'
import type { CvTemplateProps } from './shared'
import type { CustomSection } from '@/lib/cv/types'
import { effectiveSectionOrder, isSectionHidden } from '@/lib/cv/sections'

/** Template 9 · Editorial — magazine serif masthead, hairline rules, refined type.
 *  Sections render in the user's chosen order; hidden sections are skipped;
 *  custom sections are rendered with Editorial's own entry styling. */
export function Editorial({ data, photoData, showPhoto = true }: CvTemplateProps) {
  const c = data.contact
  const contacts = contactLines(data)
  const hidden = (key: string) => isSectionHidden(data, key)

  const renderCustom = (sec: CustomSection) => {
    if (sec.items.length === 0) return null
    return (
      <section className="ed-sec">
        <div className="ed-sec-title">{sec.name || 'Additional'}</div>
        {sec.items.map((it) => (
          <div className="ed-item" key={it.id}>
            <div className="ed-date">{it.subtitle || ''}</div>
            <div>
              <div className="ed-xp-role">{it.title}</div>
              {it.body && (
                <p className="ed-sum" style={{ marginTop: 5, whiteSpace: 'pre-line' }}>
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
        <section className="ed-sec">
          <div className="ed-sec-title">Profile</div>
          <p className="ed-sum">{data.summary}</p>
        </section>
      ) : null,
    experience: () =>
      !hidden('experience') && data.experience.length > 0 ? (
        <section className="ed-sec">
          <div className="ed-sec-title">Experience</div>
          {data.experience.map((e) => (
            <div className="ed-item" key={e.id}>
              <div className="ed-date">{dateRange(e.startDate, e.endDate)}</div>
              <div>
                <div className="ed-xp-role">{e.role}</div>
                <div className="ed-xp-org">{showC([e.company, e.location])}</div>
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
        <section className="ed-sec">
          <div className="ed-sec-title">Selected Work</div>
          {data.projects.map((p) => (
            <div className="ed-item" key={p.id}>
              <div className="ed-date">{p.tech || ''}</div>
              <div>
                <div className="ed-xp-role">{p.name}</div>
                {p.description && <p className="ed-sum" style={{ marginTop: 4 }}>{p.description}</p>}
              </div>
            </div>
          ))}
        </section>
      ) : null,
    education: () =>
      !hidden('education') && data.education.length > 0 ? (
        <section className="ed-sec">
          <div className="ed-sec-title">Education</div>
          {data.education.map((e) => (
            <div className="ed-item" key={e.id}>
              <div className="ed-date">{dateRange(e.startDate, e.endDate)}</div>
              <div>
                <div className="ed-xp-role">{e.degree}</div>
                <div className="ed-xp-org">{showC([e.school, e.location])}</div>
                {e.note && <p className="ed-sum" style={{ marginTop: 4 }}>{e.note}</p>}
              </div>
            </div>
          ))}
        </section>
      ) : null,
    certifications: () =>
      !hidden('certifications') && data.certifications.length > 0 ? (
        <section className="ed-sec">
          <div className="ed-sec-title">Certifications</div>
          <div className="ed-2col">
            {data.certifications.map((cert) => (
              <div className="ed-kv" key={cert.id}>
                <b>{cert.name}</b>
                <span>{[cert.issuer, cert.year].filter(Boolean).join(' · ')}</span>
              </div>
            ))}
          </div>
        </section>
      ) : null,
    skills: () =>
      !hidden('skills') && data.skills.length > 0 ? (
        <section className="ed-sec">
          <div className="ed-sec-title">Competencies</div>
          <p className="ed-inline">
            {data.skills.map((s, i) => (
              <span key={s.id}>
                {s.name}
                {i < data.skills.length - 1 && <span className="dot">·</span>}
              </span>
            ))}
          </p>
        </section>
      ) : null,
    languages: () =>
      !hidden('languages') && data.languages.length > 0 ? (
        <section className="ed-sec">
          <div className="ed-sec-title">Languages</div>
          <p className="ed-inline">
            {data.languages.map((l, i) => (
              <span key={l.id}>
                <b>{l.name}</b> — {l.level}
                {i < data.languages.length - 1 && <span className="dot">·</span>}
              </span>
            ))}
          </p>
        </section>
      ) : null,
  }

  const customById = new Map((data.customSections || []).map((s) => [s.id, s]))
  const order = effectiveSectionOrder(data)

  return (
    <div className="cv-page tpl-editorial">
      <header className="ed-hdr">
        <div style={{ minWidth: 0 }}>
          <h1 className="ed-name">{c.fullName || 'Your Name'}</h1>
          {c.jobTitle && <div className="ed-role">{c.jobTitle}</div>}
          <p className="ed-contact">
            {contacts.map((line, i) => (
              <span key={i}>
                {line.text}
                {i < contacts.length - 1 && <span className="d">◆</span>}
              </span>
            ))}
          </p>
        </div>
        {showPhoto && <CvPhoto photoData={photoData} name={c.fullName} className="ed-photo" />}
      </header>

      {order.map((key) => {
        const custom = customById.get(key)
        if (custom) return <Fragment key={key}>{hidden(key) ? null : renderCustom(custom)}</Fragment>
        const render = blocks[key]
        return <Fragment key={key}>{render ? render() : null}</Fragment>
      })}
    </div>
  )
}
