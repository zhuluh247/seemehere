'use client'

import { Fragment } from 'react'
import type { ReactNode } from 'react'
import { CvPhoto, CIcon, contactLines, dateRange } from './shared'
import type { CvTemplateProps } from './shared'
import type { CustomSection } from '@/lib/cv/types'
import { effectiveSectionOrder, isSectionHidden } from '@/lib/cv/sections'

/** Template 6 · Compact — dense layout, fits the most on one page.
 *  Profile / Experience / Projects / Skills follow the user's chosen order;
 *  the bottom band fuses Education · Certifications · Languages (each column
 *  respects its own hide flag). The header tagline (first sentence of the
 *  summary) disappears when the summary section is hidden.
 *  Custom sections use Compact's kv styling. */
export function Compact({ data, photoData, showPhoto = true }: CvTemplateProps) {
  const c = data.contact
  const contacts = contactLines(data)
  const hidden = (key: string) => isSectionHidden(data, key)
  const summaryVisible = !hidden('summary') && !!data.summary
  const headlineBits = [summaryVisible ? data.summary.split('. ')[0] + '.' : '', ''].filter(Boolean)

  const renderCustom = (sec: CustomSection) => {
    if (sec.items.length === 0) return null
    return (
      <section className="cp-sec">
        <div className="cp-sec-title">
          {(sec.name || 'Additional').toUpperCase()} <b>◆</b>
        </div>
        {sec.items.map((it) => (
          <div className="cp-kv" key={it.id} style={{ marginBottom: 6 }}>
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
      summaryVisible ? (
        <section className="cp-sec">
          <div className="cp-sec-title">
            Profile <b>◆</b>
          </div>
          <p className="cp-sum">{data.summary}</p>
        </section>
      ) : null,
    experience: () =>
      !hidden('experience') && data.experience.length > 0 ? (
        <section className="cp-sec">
          <div className="cp-sec-title">
            Experience <b>◆</b>
          </div>
          {data.experience.map((e) => (
            <div className="cp-xp" key={e.id}>
              <div className="cp-top">
                <div>
                  <span className="cp-xp-role">{e.role}</span>
                  <span className="cp-xp-org">
                    <i>·</i>
                    {[e.company, e.location].filter(Boolean).join(', ')}
                  </span>
                </div>
                <div className="cp-date">{dateRange(e.startDate, e.endDate)}</div>
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
        <section className="cp-sec">
          <div className="cp-sec-title">
            Projects <b>◆</b>
          </div>
          {data.projects.map((p) => (
            <div className="cp-kv" key={p.id} style={{ marginBottom: 6 }}>
              <b>{[p.name, p.tech].filter(Boolean).join(' — ')}</b>
              {p.description && <span>{p.description}</span>}
              {(p.repoUrl || p.liveUrl) && <span style={{ color: 'var(--acc)' }}>{[p.repoUrl, p.liveUrl].filter(Boolean).join(' · ')}</span>}
            </div>
          ))}
        </section>
      ) : null,
    skills: () =>
      !hidden('skills') && data.skills.length > 0 ? (
        <section className="cp-sec">
          <div className="cp-sec-title">
            Skills <b>◆</b>
          </div>
          <div className="cp-skills">
            {data.skills.map((s) => (
              <div className="cp-sk" key={s.id}>
                {s.name}
              </div>
            ))}
          </div>
        </section>
      ) : null,
    education: () => {
      // Fused bottom band: Education · Certifications · Languages columns.
      const showEdu = !hidden('education') && data.education.length > 0
      const showCert = !hidden('certifications') && data.certifications.length > 0
      const showLang = !hidden('languages') && data.languages.length > 0
      if (!showEdu && !showCert && !showLang) return null
      return (
        <div className="cp-bottom">
          {showEdu && (
            <div>
              <div className="cp-bot-title">Education</div>
              {data.education.slice(0, 2).map((e) => (
                <div className="cp-kv" key={e.id}>
                  <b>{[e.degree, e.note].filter(Boolean).join(' — ')}</b>
                  <span>{[e.school, dateRange(e.startDate, e.endDate)].filter(Boolean).join(' · ')}</span>
                </div>
              ))}
            </div>
          )}
          {showCert && (
            <div>
              <div className="cp-bot-title">Certifications</div>
              {data.certifications.slice(0, 2).map((cert) => (
                <div className="cp-kv" key={cert.id}>
                  <b>{cert.name}</b>
                  <span>{[cert.issuer, cert.year].filter(Boolean).join(' · ')}</span>
                </div>
              ))}
            </div>
          )}
          {showLang && (
            <div>
              <div className="cp-bot-title">Languages</div>
              <p className="cp-lang">
                {data.languages.map((l) => (
                  <span key={l.id}>
                    <b>{l.name}</b> — {l.level}
                    <br />
                  </span>
                ))}
              </p>
            </div>
          )}
        </div>
      )
    },
  }

  const customById = new Map((data.customSections || []).map((s) => [s.id, s]))
  const order = effectiveSectionOrder(data)

  return (
    <div className="cv-page tpl-compact">
      <header className="cp-hdr">
        {showPhoto && <CvPhoto photoData={photoData} name={c.fullName} className="cp-photo" />}
        <div className="cp-mid">
          <h1 className="cp-name">{c.fullName || 'Your Name'}</h1>
          {c.jobTitle && <div className="cp-role">{c.jobTitle}</div>}
          {headlineBits[0] && <p className="cp-tag">{headlineBits[0]}</p>}
        </div>
        {contacts.length > 0 && (
          <div className="cp-contact">
            {contacts.map((line, i) => (
              <span key={i} style={{ display: 'contents' }}>
                {CIcon[line.icon]('')}
                <span>{line.text}</span>
              </span>
            ))}
          </div>
        )}
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
