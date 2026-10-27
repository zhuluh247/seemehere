'use client'

import { CvPhoto, dateRange, showC } from './shared'
import type { CvTemplateProps } from './shared'

/** Template 1 · Classic — traditional serif, ATS-safe, framed photo */
export function Classic({ data, photoData, showPhoto = true }: CvTemplateProps) {
  const c = data.contact
  const contactBits = [c.location, c.phone, c.email, c.linkedin].filter(Boolean)

  return (
    <div className="cv-page tpl-classic">
      <header className="cl-hdr">
        <div>
          <h1 className="cl-name">{c.fullName || 'Your Name'}</h1>
          {c.jobTitle && <p className="cl-role">{c.jobTitle}</p>}
          <p className="cl-contact">
            {contactBits.map((bit, i) => (
              <span key={i}>
                <span className="cl-bit">{bit}</span>
                {i < contactBits.length - 1 && <span className="cl-sep">·</span>}{' '}
              </span>
            ))}
          </p>
        </div>
        {showPhoto && <CvPhoto photoData={photoData} name={c.fullName} className="cl-photo" />}
      </header>
      <div className="cl-dbl" />

      {data.experience.length > 0 && (
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
      )}

      {data.education.length > 0 && (
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
      )}

      {data.certifications.length > 0 && (
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
      )}

      {data.skills.length > 0 && (
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
      )}

      {data.languages.length > 0 && (
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
      )}
    </div>
  )
}
