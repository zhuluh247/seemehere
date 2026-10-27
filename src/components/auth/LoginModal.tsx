'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuthStore } from '@/lib/cv/auth-store'
import { Loader2, ShieldCheck } from 'lucide-react'

interface LoginModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** 'signup' opens on the create-account tab */
  initialTab?: 'signin' | 'signup'
  /** current CV draft sent along at signup so nothing is lost */
  draftPayload?: unknown
  /** where to navigate after success (default: /build) */
  redirectTo?: string
}

const cleanUsername = (v: string) => v.toLowerCase().replace(/[^a-z0-9-]/g, '')

export function LoginModal({ open, onOpenChange, initialTab = 'signin', draftPayload, redirectTo }: LoginModalProps) {
  const router = useRouter()
  const signup = useAuthStore((s) => s.signup)
  const login = useAuthStore((s) => s.login)

  const [tab, setTab] = useState<'signin' | 'signup'>(initialTab)
  const [suUser, setSuUser] = useState('')
  const [suPass, setSuPass] = useState('')
  const [siUser, setSiUser] = useState('')
  const [siPass, setSiPass] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const switchTab = (t: string) => {
    setTab(t as 'signin' | 'signup')
    setError('')
  }

  const finish = () => {
    onOpenChange(false)
    setError('')
    if (redirectTo !== 'none') router.push(redirectTo || '/build')
    else router.refresh()
  }

  const doSignup = async () => {
    setError('')
    if (!suUser.trim() || !suPass) return setError('Pick a username and a password (6+ characters)')
    setBusy(true)
    const r = await signup(cleanUsername(suUser), suPass, draftPayload)
    setBusy(false)
    if (!r.ok) return setError(r.error || 'Could not create the account')
    finish()
  }

  const doLogin = async () => {
    setError('')
    if (!siUser.trim() || !siPass) return setError('Enter your username and password')
    setBusy(true)
    const r = await login(cleanUsername(siUser), siPass)
    setBusy(false)
    if (!r.ok) return setError(r.error || 'Sign in failed')
    finish()
  }

  const field = (id: string, label: string, value: string, onChange: (v: string) => void, type = 'text', hint?: string) => (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-xs font-medium text-slate-600">{label}</Label>
      <Input
        id={id}
        type={type}
        value={value}
        autoComplete={type === 'password' ? (tab === 'signup' ? 'new-password' : 'current-password') : 'username'}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && (tab === 'signup' ? doSignup() : doLogin())}
        placeholder={type === 'password' ? '••••••••' : 'e.g. miketyson'}
        className={tab === 'signup' && type === 'text' ? 'lowercase' : ''}
      />
      {hint && <p className="text-[11px] text-slate-400">{hint}</p>}
    </div>
  )

  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) setError('') }}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 text-[11px] font-black text-white">S</span>
            Welcome to SEEMEHERE
          </DialogTitle>
          <DialogDescription>Save your CVs to the cloud and edit your published pages anytime.</DialogDescription>
        </DialogHeader>

        <Tabs value={tab} onValueChange={switchTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">Sign in</TabsTrigger>
            <TabsTrigger value="signup">Create account</TabsTrigger>
          </TabsList>

          <TabsContent value="signin" className="space-y-3 pt-3">
            {field('si-user', 'Username', siUser, setSiUser)}
            {field('si-pass', 'Password', siPass, setSiPass, 'password')}
            {error && <p className="rounded-lg bg-red-50 border border-red-100 px-3 py-2 text-xs font-medium text-red-600">{error}</p>}
            <Button onClick={doLogin} disabled={busy} className="w-full gap-2">
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null} Sign in
            </Button>
            <p className="text-center text-[11px] text-slate-400">No email needed — just your username and password.</p>
          </TabsContent>

          <TabsContent value="signup" className="space-y-3 pt-3">
            {field('su-user', 'Pick a username', suUser, (v) => setSuUser(cleanUsername(v)), 'text', 'This becomes your share link: seemehere…/cv/username')}
            {field('su-pass', 'Create a password', suPass, setSuPass, 'password', 'At least 6 characters.')}
            {error && <p className="rounded-lg bg-red-50 border border-red-100 px-3 py-2 text-xs font-medium text-red-600">{error}</p>}
            <Button onClick={doSignup} disabled={busy} className="w-full gap-2">
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />} Create my account
            </Button>
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2">
              <p className="text-[11px] leading-relaxed text-amber-700">
                <b>Important:</b> there is no email, so we can&apos;t reset a forgotten password. If you lose it, this username is gone forever — pick one you won&apos;t forget.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
