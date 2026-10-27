'use client'

import { Fragment } from 'react'
import type { ReactNode } from 'react'
import { CvPhoto, dateRange, showC, contactLines, CIcon } from './shared'
import type { CvTemplateProps } from './shared'
import type { CustomSection } from '@/lib/cv/types'
import { effectiveSectionOrder, isSectionHidden } from '@/lib/cv/sections'

/** Template 7 · Aurora — vivid gradient banner, diamond markers, airy body.
 *  Sections render in the user's chosen order; hidden sections are skipped;
 *  custom sections are rendered with Aurora's own entry styling. */
export function Aurora({ data, photoData, showPhoto = true }: CvTemplateProps) {
  const c = data.contact
  const contacts = contactLines(data)
  const hidden = (key: string) => isSectionHidden(data, key)

  const renderCustom = (sec: CustomSection) => {
    if (sec.items.length === 0) return null
    return (
      <section className="au-sec">
        <div className="au-sec-title">{sec.name || 'Additional'}</div>
        {sec.items.map((it) => (
          <div className="au-item" key={it.id}>
            <div className="au-top">
              <div>
                <div className="au-xp-role">{it.title}</div>
                {it.subtitle && <div className="au-xp-org">{it.subtitle}</div>}
              </div>
            </div>
            {it.body && (
              <p className="au-sum" style={{ marginTop: 5, whiteSpace: 'pre-line' }}>
                {it.body}
              </p>
            )}
          </div>
        ))}
      </section>
    )
  }

  const blocks: Record<string, () => ReactNode> = {
    summary: () =>
      !hidden('summary') && data.summary.trim() ? (
        <section className="au-sec">
          <div className="au-sec-title">Summary</div>
          <p className="au-sum">{data.summary}</p>
        </section>
      ) : null,
    experience: () =>
      !hidden('experience') && data.experience.length > 0 ? (
        <section className="au-sec">
          <div className="au-sec-title">Experience</div>
          {data.experience.map((e) => (
            <div className="au-item" key={e.id}>
              <div className="au-top">
                <div>
                  <div className="au-xp-role">{e.role}</div>
                  <div className="au-xp-org">{showC([e.company, e.location])}</div>
                </div>
                <div className="au-date">{dateRange(e.startDate, e.endDate)}</div>
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
        </section>
      ) : null,
    projects: () =>
      !hidden('projects') && data.projects.length > 0 ? (
        <section className="au-sec">
          <div className="au-sec-title">Projects</div>
          {data.projects.map((p) => (
            <div className="au-item" key={p.id}>
              <div className="au-top">
                <div>
                  <div className="au-xp-role">{p.name}</div>
                  <div className="au-xp-org">{showC([p.tech, p.repoUrl])}</div>
                </div>
                {p.liveUrl && <div className="au-date">{p.liveUrl}</div>}
              </div>
              {p.description && <p className="au-sum" style={{ marginTop: 5 }}>{p.description}</p>}
            </div>
          ))}
        </section>
      ) : null,
    education: () =>
      !hidden('education') && data.education.length > 0 ? (
        <section className="au-sec">
          <div className="au-sec-title">Education</div>
          {data.education.map((e) => (
            <div className="au-item" key={e.id}>
              <div className="au-top">
                <div>
                  <div className="au-xp-role">{e.degree}</div>
                  <div className="au-xp-org">{showC([e.school, e.location])}</div>
                </div>
                <div className="au-date">{dateRange(e.startDate, e.endDate)}</div>
              </div>
              {e.note && <p className="au-sum" style={{ marginTop: 5 }}>{e.note}</p>}
            </div>
          ))}
        </section>
      ) : null,
    certifications: () =>
      !hidden('certifications') && data.certifications.length > 0 ? (
        <section className="au-sec">
          <div className="au-sec-title">Certifications</div>
          <div className="au-grid2">
            {data.certifications.map((cert) => (
              <div className="au-kv" key={cert.id}>
                <b>{cert.name}</b>
                <span>{[cert.issuer, cert.year].filter(Boolean).join(' · ')}</span>
              </div>
            ))}
          </div>
        </section>
      ) : null,
    skills: () =>
      !hidden('skills') && data.skills.length > 0 ? (
        <section className="au-sec">
          <div className="au-sec-title">Skills</div>
          <div className="au-grid2">
            {data.skills.map((s) => (
              <div className="au-skill" key={s.id}>
                <span>{s.name}</span>
              </div>
            ))}
          </div>
        </section>
      ) : null,
    languages: () =>
      !hidden('languages') && data.languages.length > 0 ? (
        <section className="au-sec">
          <div className="au-sec-title">Languages</div>
          {data.languages.map((l) => (
            <div className="au-lang" key={l.id}>
              <b>{l.name}</b>
              <em>{l.level}</em>
            </div>
          ))}
        </section>
      ) : null,
  }

  const customById = new Map((data.customSections || []).map((s) => [s.id, s]))
  const order = effectiveSectionOrder(data)

  return (
    <div className="cv-page tpl-aurora">
      <header className="au-band">
        <div className="au-row">
          <div style={{ minWidth: 0 }}>
            <div className="au-name">{c.fullName || 'Your Name'}</div>
            {c.jobTitle && <div className="au-role">{c.jobTitle}</div>}
          </div>
          {showPhoto && <CvPhoto photoData={photoData} name={c.fullName} className="au-photo" />}
        </div>
        {contacts.length > 0 && (
          <div className="au-chips">
            {contacts.map((line, i) => (
              <span className="au-chip" key={i}>
                {CIcon[line.icon]('')}
                <span>{line.text}</span>
              </span>
            ))}
          </div>
        )}
      </header>

      <div className="au-body">
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
