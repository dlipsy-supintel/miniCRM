'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { Activity } from '@/types/crm'

export function ActivityDialog({ open, onOpenChange, onCreated, dealId, contactId }: {
  open: boolean
  onOpenChange: (v: boolean) => void
  onCreated: (a: Activity) => void
  dealId?: string
  contactId?: string
}) {
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState<{ type: string; subject: string; due_at: string }>({ type: 'task', subject: '', due_at: '' })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, deal_id: dealId ?? null, contact_id: contactId ?? null }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error?.message ?? 'Failed')
      toast.success('Activity logged')
      onCreated(json.data)
      setForm({ type: 'task', subject: '', due_at: '' })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Log Activity</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label>Type</Label>
            <Select value={form.type} onValueChange={v => setForm(p => ({ ...p, type: v ?? 'task' }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="call">Call</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="meeting">Meeting</SelectItem>
                <SelectItem value="task">Task</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Subject *</Label>
            <Input value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))} required />
          </div>
          <div className="space-y-1.5">
            <Label>Due date</Label>
            <Input type="datetime-local" value={form.due_at} onChange={e => setForm(p => ({ ...p, due_at: e.target.value }))} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? 'Saving…' : 'Log activity'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
