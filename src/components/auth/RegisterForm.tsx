'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardFooter } from '@/components/ui/card'

export function RegisterForm() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    full_name: '',
    org_name: '',
    email: '',
    password: '',
  })

  function update(field: string) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm(prev => ({ ...prev, [field]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const json = await res.json()

    if (!res.ok) {
      setError(json.error?.message ?? 'Registration failed')
      setLoading(false)
      return
    }

    window.location.href = '/dashboard'
  }

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <CardContent className="pt-6 space-y-4">
          {error && (
            <div className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">
              {error}
            </div>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="full_name">Your name</Label>
            <Input id="full_name" value={form.full_name} onChange={update('full_name')} placeholder="Jane Smith" required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="org_name">Workspace name</Label>
            <Input id="org_name" value={form.org_name} onChange={update('org_name')} placeholder="Acme Corp" required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={form.email} onChange={update('email')} placeholder="you@company.com" required autoComplete="email" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" value={form.password} onChange={update('password')} placeholder="••••••••" required minLength={8} autoComplete="new-password" />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Creating workspace…' : 'Create workspace'}
          </Button>
        </CardContent>
        <CardFooter className="justify-center pb-6">
          <p className="text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  )
}
