'use client'

import { CvPhoto, CIcon, contactLines, dateRange } from './shared'
import type { CvTemplateProps } from './shared'

/** Template 6 · Compact — dense layout, fits the most on one page */
export function Compact({ data, photoData, showPhoto = true }: CvTemplateProps) {
  const c = data.contact
  const contacts = contactLines(data)
  const headlineBits = [data.summary ? data.summary.split('. ')[0] + '.' : '', ''].filter(Boolean)

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

      {data.summary && (
        <section className="cp-sec">
          <div className="cp-sec-title">
            Profile <b>◆</b>
          </div>
          <p className="cp-sum">{data.summary}</p>
        </section>
      )}

      {data.experience.length > 0 && (
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
      )}

      {data.projects.length > 0 && (
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
      )}

      {data.skills.length > 0 && (
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
      )}

      {(data.education.length > 0 || data.certifications.length > 0 || data.languages.length > 0) && (
        <div className="cp-bottom">
          {data.education.length > 0 && (
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
          {data.certifications.length > 0 && (
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
          {data.languages.length > 0 && (
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
      )}
    </div>
  )
}
