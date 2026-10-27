'use client'

import { Fragment } from 'react'
import type { ReactNode } from 'react'
import { CvPhoto, dateRange, showC, contactLines } from './shared'
import type { CvTemplateProps } from './shared'
import type { CustomSection } from '@/lib/cv/types'
import { effectiveSectionOrder, isSectionHidden } from '@/lib/cv/sections'

/** Template 11 · Slate — Swiss stark: heavy uppercase masthead, hairline grid.
 *  Sections render in the user's chosen order; hidden sections are skipped;
 *  custom sections are rendered with Slate's own entry styling. */
export function Slate({ data, photoData, showPhoto = true }: CvTemplateProps) {
  const c = data.contact
  const contacts = contactLines(data)
  const hidden = (key: string) => isSectionHidden(data, key)

  const renderCustom = (sec: CustomSection) => {
    if (sec.items.length === 0) return null
    return (
      <section className="sl-sec">
        <div className="sl-sec-title">{sec.name || 'Additional'}</div>
        {sec.items.map((it) => (
          <div className="sl-item" key={it.id}>
            <div className="sl-date">{it.subtitle || ''}</div>
            <div>
              <div className="sl-xp-role">{it.title}</div>
              {it.body && (
                <p className="sl-sum" style={{ marginTop: 5, whiteSpace: 'pre-line' }}>
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
        <section className="sl-sec">
          <div className="sl-sec-title">Profile</div>
          <p className="sl-sum">{data.summary}</p>
        </section>
      ) : null,
    experience: () =>
      !hidden('experience') && data.experience.length > 0 ? (
        <section className="sl-sec">
          <div className="sl-sec-title">Experience</div>
          {data.experience.map((e) => (
            <div className="sl-item" key={e.id}>
              <div className="sl-date">{dateRange(e.startDate, e.endDate)}</div>
              <div>
                <div className="sl-xp-role">{e.role}</div>
                <div className="sl-xp-org">{showC([e.company, e.location])}</div>
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
        <section className="sl-sec">
          <div className="sl-sec-title">Projects</div>
          {data.projects.map((p) => (
            <div className="sl-item" key={p.id}>
              <div className="sl-date">{p.tech || ''}</div>
              <div>
                <div className="sl-xp-role">{p.name}</div>
                {p.description && <p className="sl-sum" style={{ marginTop: 4, fontSize: 12 }}>{p.description}</p>}
              </div>
            </div>
          ))}
        </section>
      ) : null,
    education: () =>
      !hidden('education') && data.education.length > 0 ? (
        <section className="sl-sec">
          <div className="sl-sec-title">Education</div>
          {data.education.map((e) => (
            <div className="sl-item" key={e.id}>
              <div className="sl-date">{dateRange(e.startDate, e.endDate)}</div>
              <div>
                <div className="sl-xp-role">{e.degree}</div>
                <div className="sl-xp-org">{showC([e.school, e.location])}</div>
                {e.note && <p className="sl-sum" style={{ marginTop: 4, fontSize: 12 }}>{e.note}</p>}
              </div>
            </div>
          ))}
        </section>
      ) : null,
    certifications: () =>
      !hidden('certifications') && data.certifications.length > 0 ? (
        <section className="sl-sec">
          <div className="sl-sec-title">Certifications</div>
          <div className="sl-3col">
            {data.certifications.map((cert) => (
              <div className="sl-kv" key={cert.id}>
                <b>{cert.name}</b>
                <span>{[cert.issuer, cert.year].filter(Boolean).join(' · ')}</span>
              </div>
            ))}
          </div>
        </section>
      ) : null,
    skills: () =>
      !hidden('skills') && data.skills.length > 0 ? (
        <section className="sl-sec">
          <div className="sl-sec-title">Skills</div>
          <div className="sl-3col">
            {data.skills.map((s) => (
              <div className="sl-skill" key={s.id}>
                <span>{s.name}</span>
              </div>
            ))}
          </div>
        </section>
      ) : null,
    languages: () =>
      !hidden('languages') && data.languages.length > 0 ? (
        <section className="sl-sec">
          <div className="sl-sec-title">Languages</div>
          {data.languages.map((l) => (
            <div className="sl-lang" key={l.id}>
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
    <div className="cv-page tpl-slate">
      <header className="sl-hdr">
        <div style={{ minWidth: 0 }}>
          <h1 className="sl-name">{c.fullName || 'Your Name'}</h1>
          {c.jobTitle && <div className="sl-role">{c.jobTitle}</div>}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10, flexShrink: 0 }}>
          {showPhoto && <CvPhoto photoData={photoData} name={c.fullName} className="sl-photo" />}
          {contacts.length > 0 && (
            <div className="sl-contact">
              {contacts.map((line, i) => (
                <div key={i}>{line.text}</div>
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
  )
}
