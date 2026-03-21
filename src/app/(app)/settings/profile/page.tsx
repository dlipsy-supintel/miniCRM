'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'
import { Loader2, Mail, CheckCircle } from 'lucide-react'

export default function ProfilePage() {
  const [pageLoading, setPageLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [savingName, setSavingName] = useState(false)

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [changingPassword, setChangingPassword] = useState(false)

  const [sendingReset, setSendingReset] = useState(false)
  const [resetSent, setResetSent] = useState(false)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setEmail(user.email ?? '')
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single()
      setName(profile?.full_name ?? '')
      setPageLoading(false)
    }
    load()
  }, [])

  async function handleSaveName(e: React.FormEvent) {
    e.preventDefault()
    setSavingName(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setSavingName(false); return }
    const { error } = await supabase.from('profiles').update({ full_name: name }).eq('id', user.id)
    if (error) toast.error(error.message)
    else toast.success('Profile updated')
    setSavingName(false)
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }
    setChangingPassword(true)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Password changed successfully')
      setNewPassword('')
      setConfirmPassword('')
    }
    setChangingPassword(false)
  }

  async function handleSendReset() {
    if (!email) return
    setSendingReset(true)
    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/settings/profile`,
    })
    if (error) {
      toast.error(error.message)
    } else {
      setResetSent(true)
      toast.success('Reset link sent — check your email')
    }
    setSendingReset(false)
  }

  if (pageLoading) {
    return (
      <div className="max-w-md">
        <h1 className="text-2xl font-semibold mb-6">Profile</h1>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 size={14} className="animate-spin" />Loading…
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-md space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Profile</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your account settings.</p>
      </div>

      {/* Account info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Account info</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveName} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Email</Label>
              <Input value={email} disabled className="text-sm bg-muted/50 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">Contact your admin to change your email address.</p>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Full name</Label>
              <Input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Your name"
                className="text-sm"
                required
              />
            </div>
            <Button type="submit" size="sm" disabled={savingName}>
              {savingName
                ? <><Loader2 size={12} className="mr-1.5 animate-spin" />Saving…</>
                : 'Save changes'
              }
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Change password */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Change password</CardTitle>
          <CardDescription className="text-xs">
            Set a new password for your account. Must be at least 8 characters.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs">New password</Label>
              <Input
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="Min. 8 characters"
                className="text-sm"
                required
                minLength={8}
                autoComplete="new-password"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Confirm new password</Label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Repeat new password"
                className="text-sm"
                required
                autoComplete="new-password"
              />
              {confirmPassword && newPassword !== confirmPassword && (
                <p className="text-xs text-destructive">Passwords do not match</p>
              )}
            </div>
            <Button
              type="submit"
              size="sm"
              disabled={changingPassword || !newPassword || !confirmPassword || newPassword !== confirmPassword}
            >
              {changingPassword
                ? <><Loader2 size={12} className="mr-1.5 animate-spin" />Updating…</>
                : 'Update password'
              }
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Send reset link */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Password reset link</CardTitle>
          <CardDescription className="text-xs">
            Send a one-time reset link to your email. Useful if you need to change your password from another device or share access securely.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {resetSent ? (
            <div className="flex items-center gap-2 text-sm text-emerald-400">
              <CheckCircle size={14} />
              Reset link sent to {email}
            </div>
          ) : (
            <Button size="sm" variant="outline" disabled={sendingReset} onClick={handleSendReset}>
              {sendingReset
                ? <><Loader2 size={12} className="mr-1.5 animate-spin" />Sending…</>
                : <><Mail size={12} className="mr-1.5" />Send reset link to {email}</>
              }
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
