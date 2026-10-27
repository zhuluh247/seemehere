'use client'

import { Fragment } from 'react'
import type { ReactNode } from 'react'
import { CvPhoto, dateRange, showC, contactLines, CIcon } from './shared'
import type { CvTemplateProps } from './shared'
import type { CustomSection } from '@/lib/cv/types'
import { effectiveSectionOrder, isSectionHidden } from '@/lib/cv/sections'

/** Template 10 · Atlas — dark header card with accent edge, corporate polish.
 *  Sections render in the user's chosen order; hidden sections are skipped;
 *  custom sections are rendered with Atlas's own entry styling. */
export function Atlas({ data, photoData, showPhoto = true }: CvTemplateProps) {
  const c = data.contact
  const contacts = contactLines(data)
  const hidden = (key: string) => isSectionHidden(data, key)

  const renderCustom = (sec: CustomSection) => {
    if (sec.items.length === 0) return null
    return (
      <section className="at-sec">
        <div className="at-sec-title">{sec.name || 'Additional'}</div>
        {sec.items.map((it) => (
          <div className="at-item" key={it.id}>
            <div className="at-top">
              <div>
                <div className="at-xp-role">{it.title}</div>
                {it.subtitle && <div className="at-xp-org">{it.subtitle}</div>}
              </div>
            </div>
            {it.body && (
              <p className="at-sum" style={{ marginTop: 5, whiteSpace: 'pre-line' }}>
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
        <section className="at-sec">
          <div className="at-sec-title">Summary</div>
          <p className="at-sum">{data.summary}</p>
        </section>
      ) : null,
    experience: () =>
      !hidden('experience') && data.experience.length > 0 ? (
        <section className="at-sec">
          <div className="at-sec-title">Professional Experience</div>
          {data.experience.map((e) => (
            <div className="at-item" key={e.id}>
              <div className="at-top">
                <div>
                  <div className="at-xp-role">{e.role}</div>
                  <div className="at-xp-org">{showC([e.company, e.location])}</div>
                </div>
                <div className="at-date">{dateRange(e.startDate, e.endDate)}</div>
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
        <section className="at-sec">
          <div className="at-sec-title">Projects</div>
          {data.projects.map((p) => (
            <div className="at-item" key={p.id}>
              <div className="at-top">
                <div>
                  <div className="at-xp-role">{p.name}</div>
                  <div className="at-xp-org">{showC([p.tech, p.repoUrl])}</div>
                </div>
                {p.liveUrl && <div className="at-date">{p.liveUrl}</div>}
              </div>
              {p.description && <p className="at-sum" style={{ marginTop: 4 }}>{p.description}</p>}
            </div>
          ))}
        </section>
      ) : null,
    education: () =>
      !hidden('education') && data.education.length > 0 ? (
        <section className="at-sec">
          <div className="at-sec-title">Education</div>
          {data.education.map((e) => (
            <div className="at-item" key={e.id}>
              <div className="at-top">
                <div>
                  <div className="at-xp-role">{e.degree}</div>
                  <div className="at-xp-org">{showC([e.school, e.location])}</div>
                </div>
                <div className="at-date">{dateRange(e.startDate, e.endDate)}</div>
              </div>
              {e.note && <p className="at-sum" style={{ marginTop: 4 }}>{e.note}</p>}
            </div>
          ))}
        </section>
      ) : null,
    certifications: () =>
      !hidden('certifications') && data.certifications.length > 0 ? (
        <section className="at-sec">
          <div className="at-sec-title">Certifications</div>
          <div className="at-2col">
            {data.certifications.map((cert) => (
              <div className="at-kv" key={cert.id}>
                <b>{cert.name}</b>
                <span>{[cert.issuer, cert.year].filter(Boolean).join(' · ')}</span>
              </div>
            ))}
          </div>
        </section>
      ) : null,
    skills: () =>
      !hidden('skills') && data.skills.length > 0 ? (
        <section className="at-sec">
          <div className="at-sec-title">Core Skills</div>
          <div className="at-tags">
            {data.skills.map((s) => (
              <span className="at-tagchip" key={s.id}>
                {s.name}
              </span>
            ))}
          </div>
        </section>
      ) : null,
    languages: () =>
      !hidden('languages') && data.languages.length > 0 ? (
        <section className="at-sec">
          <div className="at-sec-title">Languages</div>
          {data.languages.map((l) => (
            <div className="at-lang" key={l.id}>
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
    <div className="cv-page tpl-atlas">
      <header className="at-hdr">
        <div style={{ minWidth: 0 }}>
          <div className="at-name">{c.fullName || 'Your Name'}</div>
          {c.jobTitle && <div className="at-role">{c.jobTitle}</div>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, flexShrink: 0 }}>
          {contacts.length > 0 && (
            <div className="at-contact">
              {contacts.map((line, i) => (
                <div className="at-c" key={i}>
                  {CIcon[line.icon]('')}
                  <span>{line.text}</span>
                </div>
              ))}
            </div>
          )}
          {showPhoto && <CvPhoto photoData={photoData} name={c.fullName} className="at-photo" />}
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
