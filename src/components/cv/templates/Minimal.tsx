'use client'

import { CvPhoto, dateRange, contactLines } from './shared'
import type { CvTemplateProps } from './shared'

/** Template 3 · Minimal — Swiss whitespace, hairlines, quiet accent */
export function Minimal({ data, photoData, showPhoto = true }: CvTemplateProps) {
  const c = data.contact
  // Use contactLines() so website + custom links are included
  const contacts = contactLines(data).map((l) => l.text)

  return (
    <div className="cv-page tpl-minimal">
      <header className="mn-hdr">
        <div>
          <h1 className="mn-name">
            {(c.fullName || 'Your Name').split(' ').map((w, i, arr) => (
              <span key={i}>
                {i === arr.length - 1 && arr.length > 1 ? <b>{w}</b> : w}
                {i < arr.length - 1 ? ' ' : ''}
              </span>
            ))}
          </h1>
          {c.jobTitle && <div className="mn-role">{c.jobTitle}</div>}
        </div>
        {showPhoto && <CvPhoto photoData={photoData} name={c.fullName} className="mn-photo" />}
      </header>
      <div className="mn-rule" />
      <div className="mn-hr" />

      {data.summary && (
        <section className="mn-sec">
          <div className="mn-sec-title">About</div>
          <p className="mn-sum">{data.summary}</p>
        </section>
      )}

      {contacts.length > 0 && (
        <section className="mn-sec">
          <div className="mn-sec-title">Contact</div>
          <div className="mn-pills">
            {contacts.map((x, i) => (
              <span className="mn-pill" key={i}>
                {x}
              </span>
            ))}
          </div>
        </section>
      )}

      {data.experience.length > 0 && (
        <section className="mn-sec">
          <div className="mn-sec-title">Experience</div>
          {data.experience.map((e) => (
            <div className="mn-xp" key={e.id}>
              <div className="mn-date">{dateRange(e.startDate, e.endDate) || '—'}</div>
              <div>
                <div className="mn-xp-role">{e.role}</div>
                <div className="mn-xp-org">{[e.company, e.location].filter(Boolean).join(' — ')}</div>
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

      {data.skills.length > 0 && (
        <section className="mn-sec">
          <div className="mn-sec-title">Skills</div>
          <div className="mn-pills">
            {data.skills.map((s) => (
              <span className="mn-pill" key={s.id}>
                {s.name}
              </span>
            ))}
          </div>
        </section>
      )}

      {data.projects.length > 0 && (
        <section className="mn-sec">
          <div className="mn-sec-title">Projects</div>
          {data.projects.map((p) => (
            <div className="mn-xp" key={p.id}>
              <div className="mn-date">{p.liveUrl || p.repoUrl || '—'}</div>
              <div>
                <div className="mn-xp-role">{p.name}</div>
                {p.tech && <div className="mn-xp-org">{p.tech}</div>}
                {p.description && <p style={{ fontSize: 11, lineHeight: 1.45, color: 'var(--mut)', marginTop: 2 }}>{p.description}</p>}
              </div>
            </div>
          ))}
        </section>
      )}

      {(data.education.length > 0 || data.certifications.length > 0 || data.languages.length > 0) && (
        <section className="mn-sec">
          <div className="mn-sec-title">Education · Certifications · Languages</div>
          <div className="mn-3col">
            {data.education.slice(0, 1).map((e) => (
              <div className="mn-kv" key={e.id}>
                <b>{e.degree}</b>
                <span>
                  {e.school}
                  {e.startDate || e.endDate ? ` · ${dateRange(e.startDate, e.endDate)}` : ''}
                </span>
                {e.note && <span>{e.note}</span>}
              </div>
            ))}
            <div>
              {data.certifications.slice(0, 2).map((cert) => (
                <div className="mn-kv" key={cert.id}>
                  <b>{cert.name}</b>
                  <span>{[cert.issuer, cert.year].filter(Boolean).join(' · ')}</span>
                </div>
              ))}
            </div>
            <div>
              {data.languages.map((l) => (
                <div className="mn-kv" key={l.id}>
                  <b>{l.name}</b>
                  <span>{l.level}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
