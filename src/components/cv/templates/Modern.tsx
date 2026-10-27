'use client'

import { Fragment } from 'react'
import type { ReactNode } from 'react'
import { CvPhoto, CIcon, contactLines, dateRange } from './shared'
import type { CvTemplateProps } from './shared'
import type { CustomSection } from '@/lib/cv/types'
import { effectiveSectionOrder, isSectionHidden } from '@/lib/cv/sections'

const LEVEL_DOTS: Record<string, number> = { Native: 5, Fluent: 5, Professional: 4, Conversational: 3, Basic: 2 }

/** Template 2 · Modern — deep sidebar, timeline experience.
 *  Sidebar sections (Skills, Languages) are fixed in place but can be hidden.
 *  Main-column sections follow the user's chosen order; custom sections are
 *  rendered in the main column with Modern's timeline styling. */
export function Modern({ data, theme, photoData, showPhoto = true }: CvTemplateProps) {
  const c = data.contact
  const contacts = contactLines(data)
  const hidden = (key: string) => isSectionHidden(data, key)

  const renderCustom = (sec: CustomSection) => {
    if (sec.items.length === 0) return null
    return (
      <section className="md-sec2">
        <div className="md-sec2-title">{sec.name || 'Additional'}</div>
        {sec.items.map((it) => (
          <div className="md-xp" key={it.id}>
            {it.title && <div className="md-xp-role">{it.title}</div>}
            {it.subtitle && <div className="md-xp-org">{it.subtitle}</div>}
            {it.body && (
              <p style={{ fontSize: 11.5, lineHeight: 1.55, color: 'var(--mut)', marginTop: 3, whiteSpace: 'pre-line' }}>{it.body}</p>
            )}
          </div>
        ))}
      </section>
    )
  }

  // Main-column blocks. 'education' is a fused block (Education + Certifications)
  // — each half respects its own hidden flag; the block moves with 'education'.
  const blocks: Record<string, () => ReactNode> = {
    summary: () =>
      !hidden('summary') && data.summary ? (
        <section className="md-sec2">
          <div className="md-sec2-title">Profile</div>
          <p className="md-sum">{data.summary}</p>
        </section>
      ) : null,
    experience: () =>
      !hidden('experience') && data.experience.length > 0 ? (
        <section className="md-sec2">
          <div className="md-sec2-title">Experience</div>
          {data.experience.map((e) => (
            <div className="md-xp" key={e.id}>
              <div className="md-xp-top">
                <div>
                  <div className="md-xp-role">{e.role}</div>
                  <div className="md-xp-org">{[e.company, e.location].filter(Boolean).join(' — ')}</div>
                </div>
                <div className="md-xp-date">{dateRange(e.startDate, e.endDate)}</div>
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
        <section className="md-sec2">
          <div className="md-sec2-title">Projects</div>
          {data.projects.map((p) => (
            <div className="md-xp" key={p.id}>
              <div className="md-xp-top">
                <div className="md-xp-role">{p.name}</div>
                {p.repoUrl && <div className="md-xp-date">{p.repoUrl}</div>}
              </div>
              {p.tech && <div className="md-xp-org">{p.tech}</div>}
              {p.description && <p style={{ fontSize: 11.5, lineHeight: 1.5, color: 'var(--mut)', marginTop: 3 }}>{p.description}</p>}
              {p.liveUrl && <div style={{ fontSize: 11, color: 'var(--acc)', fontWeight: 600, marginTop: 2 }}>{p.liveUrl}</div>}
            </div>
          ))}
        </section>
      ) : null,
    education: () => {
      const showEdu = !hidden('education') && data.education.length > 0
      const showCert = !hidden('certifications') && data.certifications.length > 0
      if (!showEdu && !showCert) return null
      const solo = !showEdu || !showCert
      return (
        <section className="md-sec2">
          <div className="md-sec2-title">Education</div>
          <div className="md-grid2">
            {showEdu &&
              data.education.slice(0, 1).map((e) => (
                <div className="md-xp" key={e.id} style={{ marginBottom: 0, gridColumn: solo ? '1 / -1' : undefined }}>
                  <div className="md-xp-role">{e.degree}</div>
                  <div className="md-xp-org">{e.school}</div>
                  <div className="md-xp-date" style={{ marginTop: 6, display: 'inline-block' }}>
                    {[dateRange(e.startDate, e.endDate), e.note.split('·')[0]?.trim()].filter(Boolean).join(' · ')}
                  </div>
                </div>
              ))}
            {showCert && (
              <div className="md-xp" style={{ marginBottom: 0, gridColumn: solo ? '1 / -1' : undefined }}>
                <div className="md-xp-role" style={{ fontSize: 12.5 }}>Certifications</div>
                <div className="md-xp-org" style={{ fontWeight: 400, lineHeight: 1.55 }}>
                  {data.certifications.map((cert) => (
                    <span key={cert.id}>
                      {cert.name} {cert.year && `· ${cert.year}`}
                      <br />
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )
    },
  }

  const customById = new Map((data.customSections || []).map((s) => [s.id, s]))
  const order = effectiveSectionOrder(data)

  return (
    <div className="cv-page tpl-modern">
      <aside className="md-side">
        {showPhoto && <CvPhoto photoData={photoData} name={c.fullName} className="md-photo ini" />}
        <div className="md-name">{c.fullName || 'Your Name'}</div>
        {c.jobTitle && <div className="md-role">{c.jobTitle}</div>}

        {contacts.length > 0 && (
          <div className="md-sec">
            <div className="md-sec-title">Contact</div>
            {contacts.map((line, i) => (
              <div className="md-c" key={i}>
                {CIcon[line.icon]('')}
                <span>{line.text}</span>
              </div>
            ))}
          </div>
        )}

        {/* Sidebar zone — fixed position, but respects hide toggles */}
        {!hidden('skills') && data.skills.length > 0 && (
          <div className="md-sec">
            <div className="md-sec-title">Skills</div>
            {data.skills.map((s) => (
              <div className="md-sk" key={s.id}>
                <span>{s.name}</span>
              </div>
            ))}
          </div>
        )}

        {!hidden('languages') && data.languages.length > 0 && (
          <div className="md-sec">
            <div className="md-sec-title">Languages</div>
            {data.languages.map((l) => (
              <div className="md-lang" key={l.id}>
                <div className="md-lang-row">
                  <b>{l.name}</b>
                  <em>{l.level}</em>
                </div>
                <div className="md-dots">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <i key={i} className={i < (LEVEL_DOTS[l.level] ?? 3) ? 'on' : ''} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </aside>

      <main className="md-main">
        <h1 className="md-name2">{c.fullName || 'Your Name'}</h1>
        {c.jobTitle && <div className="md-role2">{c.jobTitle}</div>}
        <div className="md-rule" />

        {order.map((key) => {
          const custom = customById.get(key)
          if (custom) return <Fragment key={key}>{hidden(key) ? null : renderCustom(custom)}</Fragment>
          const render = blocks[key]
          return <Fragment key={key}>{render ? render() : null}</Fragment>
        })}
      </main>
    </div>
  )
}
