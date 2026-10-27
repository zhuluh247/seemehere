import type { Metadata } from 'next'
import { AdminDashboard } from '@/components/admin/AdminDashboard'

export const metadata: Metadata = {
  title: 'Admin — SEEMEHERE',
  robots: { index: false, follow: false }, // never list the dashboard
}

export default function AdminPage() {
  return <AdminDashboard />
}
