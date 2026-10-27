'use client'

import { CvPhoto, dateRange, showC } from './shared'
import type { CvTemplateProps } from './shared'

/** Template 4 · Executive — ivory paper, luxury serif, accent rules */
export function Executive({ data, photoData, showPhoto = true }: CvTemplateProps) {
  const c = data.contact
  const contacts = [c.location, c.phone, c.email, c.linkedin].filter(Boolean)

  return (
    <div className="cv-page tpl-executive">
      <header className="ex-hdr">
        {showPhoto && (
          <div className="ex-ring">
            <CvPhoto photoData={photoData} name={c.fullName} className="ex-photo" />
          </div>
        )}
        <h1 className="ex-name">{c.fullName || 'Your Name'}</h1>
        {c.jobTitle && <div className="ex-role">{c.jobTitle}</div>}
        {contacts.length > 0 && (
          <div className="ex-contact">
            {contacts.map((x, i) => (
              <span key={i}>
                {x}
                {i < contacts.length - 1 && <span className="d">◆</span>}
              </span>
            ))}
          </div>
        )}
      </header>
      <div className="ex-goldrule" />

      {data.summary && (
        <section className="ex-sec">
          <p className="ex-sum">{data.summary}</p>
        </section>
      )}

      {data.experience.length > 0 && (
        <section className="ex-sec">
          <div className="ex-sec-title">Professional Experience</div>
          {data.experience.map((e) => (
            <div className="ex-xp" key={e.id}>
              <div className="ex-date">{dateRange(e.startDate, e.endDate)}</div>
              <div>
                <div className="ex-xp-role">{e.role}</div>
                <div className="ex-xp-org">{showC([e.company, e.location])}</div>
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
      )}

      {data.projects.length > 0 && (
        <section className="ex-sec">
          <div className="ex-sec-title">Selected Projects</div>
          {data.projects.map((p) => (
            <div className="ex-xp" key={p.id}>
              <div className="ex-date">{p.liveUrl || ''}</div>
              <div>
                <div className="ex-xp-role">{p.name}</div>
                <div className="ex-xp-org">{showC([p.tech, p.repoUrl])}</div>
                {p.description && <p style={{ fontSize: 11.5, lineHeight: 1.5, color: 'var(--mut)', marginTop: 3 }}>{p.description}</p>}
              </div>
            </div>
          ))}
        </section>
      )}

      {data.education.length > 0 && (
        <section className="ex-sec">
          <div className="ex-sec-title">Education</div>
          {data.education.slice(0, 2).map((e) => (
            <div className="ex-xp" key={e.id}>
              <div className="ex-date">{dateRange(e.startDate, e.endDate)}</div>
              <div>
                <div className="ex-xp-role">{[e.degree, e.note].filter(Boolean).join(' — ')}</div>
                <div className="ex-xp-org">{showC([e.school, e.location])}</div>
              </div>
            </div>
          ))}
        </section>
      )}

      {data.certifications.length > 0 && (
        <section className="ex-sec">
          <div className="ex-sec-title">Credentials</div>
          <div className="ex-2col">
            {data.certifications.slice(0, 2).map((cert) => (
              <div className="ex-kv" key={cert.id}>
                <b>{cert.name}</b>
                <span>{[cert.issuer, cert.year].filter(Boolean).join(' · ')}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {(data.skills.length > 0 || data.languages.length > 0) && (
        <section className="ex-sec">
          <div className="ex-sec-title">Expertise &amp; Languages</div>
          <div className="ex-2col">
            {data.skills.length > 0 && (
              <p className="ex-line" style={{ lineHeight: 1.8 }}>
                {data.skills.slice(0, 9).map((s) => s.name).join(' · ')}
              </p>
            )}
            {data.languages.length > 0 && (
              <p className="ex-line">
                {data.languages.map((l, i) => (
                  <span key={l.id}>
                    <b>{l.name}</b> — {l.level}
                    {i < data.languages.length - 1 && <span className="d">◆</span>}
                  </span>
                ))}
              </p>
            )}
          </div>
        </section>
      )}
    </div>
  )
}
