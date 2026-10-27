'use client'

import { Fragment } from 'react'
import type { ReactNode } from 'react'
import { CvPhoto, dateRange, showC, contactLines, CIcon } from './shared'
import type { CvTemplateProps } from './shared'
import type { CustomSection } from '@/lib/cv/types'
import { effectiveSectionOrder, isSectionHidden } from '@/lib/cv/sections'

/** Template 12 · Lumina — soft pastel header, rounded section cards, warm feel.
 *  Sections render in the user's chosen order; hidden sections are skipped;
 *  custom sections are rendered with Lumina's own entry styling. */
export function Lumina({ data, photoData, showPhoto = true }: CvTemplateProps) {
  const c = data.contact
  const contacts = contactLines(data)
  const hidden = (key: string) => isSectionHidden(data, key)

  const renderCustom = (sec: CustomSection) => {
    if (sec.items.length === 0) return null
    return (
      <section className="lm-sec">
        <div className="lm-sec-title">{sec.name || 'Additional'}</div>
        {sec.items.map((it) => (
          <div className="lm-item" key={it.id}>
            <div className="lm-top">
              <div>
                <div className="lm-xp-role">{it.title}</div>
                {it.subtitle && <div className="lm-xp-org">{it.subtitle}</div>}
              </div>
            </div>
            {it.body && (
              <p className="lm-sum" style={{ marginTop: 5, whiteSpace: 'pre-line' }}>
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
        <section className="lm-sec">
          <div className="lm-sec-title">About me</div>
          <p className="lm-sum">{data.summary}</p>
        </section>
      ) : null,
    experience: () =>
      !hidden('experience') && data.experience.length > 0 ? (
        <section className="lm-sec">
          <div className="lm-sec-title">Experience</div>
          {data.experience.map((e) => (
            <div className="lm-item" key={e.id}>
              <div className="lm-top">
                <div>
                  <div className="lm-xp-role">{e.role}</div>
                  <div className="lm-xp-org">{showC([e.company, e.location])}</div>
                </div>
                <div className="lm-date">{dateRange(e.startDate, e.endDate)}</div>
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
        <section className="lm-sec">
          <div className="lm-sec-title">Projects</div>
          {data.projects.map((p) => (
            <div className="lm-item" key={p.id}>
              <div className="lm-top">
                <div>
                  <div className="lm-xp-role">{p.name}</div>
                  <div className="lm-xp-org">{showC([p.tech, p.repoUrl])}</div>
                </div>
                {p.liveUrl && <div className="lm-date">{p.liveUrl}</div>}
              </div>
              {p.description && <p className="lm-sum" style={{ marginTop: 4 }}>{p.description}</p>}
            </div>
          ))}
        </section>
      ) : null,
    education: () =>
      !hidden('education') && data.education.length > 0 ? (
        <section className="lm-sec">
          <div className="lm-sec-title">Education</div>
          {data.education.map((e) => (
            <div className="lm-item" key={e.id}>
              <div className="lm-top">
                <div>
                  <div className="lm-xp-role">{e.degree}</div>
                  <div className="lm-xp-org">{showC([e.school, e.location])}</div>
                </div>
                <div className="lm-date">{dateRange(e.startDate, e.endDate)}</div>
              </div>
              {e.note && <p className="lm-sum" style={{ marginTop: 4 }}>{e.note}</p>}
            </div>
          ))}
        </section>
      ) : null,
    certifications: () =>
      !hidden('certifications') && data.certifications.length > 0 ? (
        <section className="lm-sec">
          <div className="lm-sec-title">Certifications</div>
          <div className="lm-pills" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 14px' }}>
            {data.certifications.map((cert) => (
              <div className="lm-kv" key={cert.id}>
                <b>{cert.name}</b>
                <span>{[cert.issuer, cert.year].filter(Boolean).join(' · ')}</span>
              </div>
            ))}
          </div>
        </section>
      ) : null,
    skills: () =>
      !hidden('skills') && data.skills.length > 0 ? (
        <section className="lm-sec">
          <div className="lm-sec-title">Skills</div>
          <div className="lm-pills">
            {data.skills.map((s) => (
              <span className="lm-pill" key={s.id}>
                {s.name}
              </span>
            ))}
          </div>
        </section>
      ) : null,
    languages: () =>
      !hidden('languages') && data.languages.length > 0 ? (
        <section className="lm-sec">
          <div className="lm-sec-title">Languages</div>
          {data.languages.map((l) => (
            <div className="lm-lang" key={l.id}>
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
    <div className="cv-page tpl-lumina">
      <header className="lm-hdr">
        {showPhoto && <CvPhoto photoData={photoData} name={c.fullName} className="lm-photo" />}
        <div style={{ minWidth: 0 }}>
          <div className="lm-name">{c.fullName || 'Your Name'}</div>
          {c.jobTitle && <div className="lm-role">{c.jobTitle}</div>}
          {contacts.length > 0 && (
            <div className="lm-chips">
              {contacts.map((line, i) => (
                <span className="lm-chip" key={i}>
                  {CIcon[line.icon]('')}
                  <span>{line.text}</span>
                </span>
              ))}
            </div>
          )}
        </div>
      </header>

      <div className="lm-body">
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
