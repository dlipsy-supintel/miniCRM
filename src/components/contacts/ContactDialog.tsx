'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { Contact } from '@/types/crm'

interface ContactDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated: (contact: Contact) => void
}

export function ContactDialog({ open, onOpenChange, onCreated }: ContactDialogProps) {
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '', phone: '', job_title: '' })

  function update(field: string) {
    return (e: React.ChangeEvent<HTMLInputElement>) => setForm(p => ({ ...p, [field]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error?.message ?? 'Failed to create contact')
      toast.success('Contact created')
      onCreated(json.data)
      setForm({ first_name: '', last_name: '', email: '', phone: '', job_title: '' })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>New Contact</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="first_name">First name *</Label>
              <Input id="first_name" value={form.first_name} onChange={update('first_name')} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="last_name">Last name</Label>
              <Input id="last_name" value={form.last_name} onChange={update('last_name')} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={form.email} onChange={update('email')} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" value={form.phone} onChange={update('phone')} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="job_title">Job title</Label>
            <Input id="job_title" value={form.job_title} onChange={update('job_title')} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? 'Saving…' : 'Create contact'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
