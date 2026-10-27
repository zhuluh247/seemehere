import type { Metadata } from 'next'
import { Toaster } from '@/components/ui/toaster'
import './globals.css'

export const metadata: Metadata = {
  title: 'SEEMEHERE — Free CV Builder | Your CV. One link. Seen everywhere.',
  description:
    'Build a beautiful, ATS-proof CV free in 10 guided steps. 6 templates, every color editable, AI writing help, PDF/PNG/Word export and a personal share link at cv/yourname. No signup, no watermark, £0 forever.',
  keywords: ['free CV builder', 'resume builder', 'ATS resume', 'CV templates', 'AI CV', 'SEEMEHERE'],
  applicationName: 'SEEMEHERE',
  robots: { index: true, follow: true },
}

export const viewport = {
  themeColor: '#4F46E5',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* CV template fonts (app UI uses system/Geist stack) */}
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Source+Serif+4:ital,opsz,wght@0,8..60,400;0,8..60,600;0,8..60,700;1,8..60,400;1,8..60,600&family=Playfair+Display:ital,wght@0,500;0,600;0,700;1,500&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,700;9..40,800;9..40,900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  )
}
