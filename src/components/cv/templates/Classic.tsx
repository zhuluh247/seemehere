'use client'

import { Fragment } from 'react'
import type { ReactNode } from 'react'
import { CvPhoto, dateRange, showC, contactLines } from './shared'
import type { CvTemplateProps } from './shared'
import type { CustomSection } from '@/lib/cv/types'
import { effectiveSectionOrder, isSectionHidden } from '@/lib/cv/sections'

/** Template 1 · Classic — traditional serif, ATS-safe, framed photo.
 *  Sections render in the user's chosen order; hidden sections are skipped;
 *  custom sections are rendered with Classic's own entry styling. */
export function Classic({ data, photoData, showPhoto = true }: CvTemplateProps) {
  const c = data.contact
  // Use the shared contactLines() helper so website + custom links (GitHub,
  // X, Instagram, …) are all included — not just email/phone/location/linkedin.
  const contacts = contactLines(data)
  const hidden = (key: string) => isSectionHidden(data, key)

  const renderCustom = (sec: CustomSection) => {
    if (sec.items.length === 0) return null
    return (
      <section className="cl-sec">
        <div className="cl-sec-title">{sec.name || 'Additional'}</div>
        {sec.items.map((it) => (
          <div className="cl-entry" key={it.id}>
            <div className="cl-top">
              <div>
                <div className="cl-role2">{it.title}</div>
                {it.subtitle && <div className="cl-org">{it.subtitle}</div>}
              </div>
            </div>
            {it.body && (
              <p className="cl-note" style={{ whiteSpace: 'pre-line' }}>
                {it.body}
              </p>
            )}
          </div>
        ))}
      </section>
    )
  }

  // One builder per core section — returns null when empty or hidden.
  const blocks: Record<string, () => ReactNode> = {
    summary: () =>
      !hidden('summary') && data.summary.trim() ? (
        <section className="cl-sec">
          <div className="cl-sec-title">Summary</div>
          <p className="cl-inline">{data.summary}</p>
        </section>
      ) : null,
    experience: () =>
      !hidden('experience') && data.experience.length > 0 ? (
        <section className="cl-sec">
          <div className="cl-sec-title">Professional Experience</div>
          {data.experience.map((e) => (
            <div className="cl-entry" key={e.id}>
              <div className="cl-top">
                <div>
                  <div className="cl-role2">{e.role}</div>
                  <div className="cl-org">{showC([e.company, e.location])}</div>
                </div>
                <div className="cl-date">{dateRange(e.startDate, e.endDate)}</div>
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
        <section className="cl-sec">
          <div className="cl-sec-title">Projects</div>
          {data.projects.map((p) => (
            <div className="cl-entry" key={p.id}>
              <div className="cl-top">
                <div>
                  <div className="cl-role2">{p.name}</div>
                  <div className="cl-org">{showC([p.tech, p.repoUrl])}</div>
                </div>
                {p.liveUrl && <div className="cl-date">{p.liveUrl}</div>}
              </div>
              {p.description && <p className="cl-note">{p.description}</p>}
            </div>
          ))}
        </section>
      ) : null,
    education: () =>
      !hidden('education') && data.education.length > 0 ? (
        <section className="cl-sec">
          <div className="cl-sec-title">Education</div>
          {data.education.map((e) => (
            <div className="cl-entry" key={e.id}>
              <div className="cl-top">
                <div>
                  <div className="cl-role2">{e.degree}</div>
                  <div className="cl-org">{showC([e.school, e.location])}</div>
                </div>
                <div className="cl-date">{dateRange(e.startDate, e.endDate)}</div>
              </div>
              {e.note && <p className="cl-note">{e.note}</p>}
            </div>
          ))}
        </section>
      ) : null,
    certifications: () =>
      !hidden('certifications') && data.certifications.length > 0 ? (
        <section className="cl-sec">
          <div className="cl-sec-title">Certifications</div>
          <p className="cl-inline">
            {data.certifications.map((cert, i) => (
              <span key={cert.id}>
                <b>{cert.name}</b>
                {cert.year ? ` — ${cert.year}` : ''}
                {i < data.certifications.length - 1 && <span className="dot">·</span>}
              </span>
            ))}
          </p>
        </section>
      ) : null,
    skills: () =>
      !hidden('skills') && data.skills.length > 0 ? (
        <section className="cl-sec">
          <div className="cl-sec-title">Skills</div>
          <p className="cl-inline">
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
        <section className="cl-sec">
          <div className="cl-sec-title">Languages</div>
          <p className="cl-inline">
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
    <div className="cv-page tpl-classic">
      <header className="cl-hdr">
        <div>
          <h1 className="cl-name">{c.fullName || 'Your Name'}</h1>
          {c.jobTitle && <p className="cl-role">{c.jobTitle}</p>}
          <p className="cl-contact">
            {contacts.map((line, i) => (
              <span key={i}>
                <span className="cl-bit">{line.text}</span>
                {i < contacts.length - 1 && <span className="cl-sep">·</span>}{' '}
              </span>
            ))}
          </p>
        </div>
        {showPhoto && <CvPhoto photoData={photoData} name={c.fullName} className="cl-photo" />}
      </header>
      <div className="cl-dbl" />

      {order.map((key) => {
        const custom = customById.get(key)
        if (custom) return <Fragment key={key}>{hidden(key) ? null : renderCustom(custom)}</Fragment>
        const render = blocks[key]
        return <Fragment key={key}>{render ? render() : null}</Fragment>
      })}
    </div>
  )
}
