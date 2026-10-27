import type { CvData } from './types'
import { uid } from './types'

// ─── Sarah Mitchell — demo data (matches the approved template previews) ────

export const SAMPLE_CV: CvData = {
  contact: {
    fullName: 'Sarah Mitchell',
    jobTitle: 'Senior Marketing Manager',
    email: 'sarah.mitchell@email.com',
    phone: '+44 7700 900123',
    location: 'London, United Kingdom',
    website: 'sarahmitchell.co.uk',
    linkedin: 'linkedin.com/in/sarahmitchell',
    links: [
      { id: uid(), kind: 'github', label: '', url: 'github.com/sarahmitchell' },
      { id: uid(), kind: 'x', label: '', url: 'x.com/sarahm_writes' },
    ],
  },
  summary:
    'Results-driven marketing leader with 8+ years of experience building growth engines for consumer brands. Proven record of scaling organic traffic, leading cross-functional teams of up to six, and managing seven-figure campaign budgets. Passionate about data-led brand storytelling.',
  experience: [
    {
      id: uid(),
      role: 'Senior Marketing Manager',
      company: 'BrightWave Media',
      location: 'London',
      startDate: '2021',
      endDate: 'Present',
      bullets: [
        'Lead a team of six marketers across SEO, content and paid channels, owning a £2.4M annual budget.',
        'Grew organic traffic 140% in 18 months, contributing £1.1M in attributed revenue.',
        'Rebuilt the brand content strategy, lifting audience engagement from 2.1% to 5.8%.',
      ],
    },
    {
      id: uid(),
      role: 'Marketing Manager',
      company: 'Nordish Brands',
      location: 'Manchester',
      startDate: '2018',
      endDate: '2021',
      bullets: [
        'Owned end-to-end campaign delivery for three product lines across digital and retail.',
        'Launched 12 product campaigns; two exceeded £500K in first-year sales.',
        'Introduced analytics dashboards adopted company-wide, cutting reporting time by 60%.',
      ],
    },
    {
      id: uid(),
      role: 'Marketing Executive',
      company: 'Halewood & Co',
      location: 'Leeds',
      startDate: '2016',
      endDate: '2018',
      bullets: [
        'Executed email and social campaigns for B2B clients across manufacturing and retail.',
        'Increased marketing-qualified leads by 85% through landing-page A/B testing.',
      ],
    },
  ],
  education: [
    {
      id: uid(),
      degree: 'BA (Hons) Marketing',
      school: 'University of Manchester',
      location: 'Manchester',
      startDate: '2012',
      endDate: '2016',
      note: 'First Class Honours · Dissertation on consumer behaviour in social commerce',
    },
  ],
  projects: [
    {
      id: uid(),
      name: 'GrowthLens — marketing analytics dashboard',
      description: 'Side project: a self-serve dashboard that unifies ad, SEO and email metrics for small brands, with automated weekly insight emails.',
      tech: 'Next.js · Postgres · Recharts',
      repoUrl: 'github.com/sarahmitchell/growthlens',
      liveUrl: 'growthlens.app',
    },
    {
      id: uid(),
      name: 'The Weekly Standout newsletter',
      description: 'Wrote and grew a weekly marketing teardown newsletter from 0 to 4,200 subscribers in 14 months, averaging 46% open rate.',
      tech: 'Copywriting · Ghost · SEO',
      repoUrl: '',
      liveUrl: 'thestandout.weekly',
    },
  ],
  skills: [
    'Digital Strategy', 'SEO & SEM', 'Content Marketing', 'Brand Management', 'Marketing Analytics',
    'Team Leadership', 'Google Analytics', 'HubSpot', 'Paid Social', 'Copywriting',
  ].map((n) => ({ id: uid(), name: n })),
  certifications: [
    { id: uid(), name: 'CIM Level 6 Diploma in Professional Marketing', issuer: 'Chartered Institute of Marketing', year: '2020' },
    { id: uid(), name: 'Google Analytics Individual Qualification', issuer: 'Google', year: '2022' },
  ],
  languages: [
    { id: uid(), name: 'English', level: 'Native' },
    { id: uid(), name: 'Spanish', level: 'Professional' },
    { id: uid(), name: 'French', level: 'Conversational' },
  ],
}
