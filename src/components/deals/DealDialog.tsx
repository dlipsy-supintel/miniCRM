'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { Deal, PipelineStage } from '@/types/crm'

interface DealDialogProps {
  open: boolean
  onOpenChange: (v: boolean) => void
  stages: PipelineStage[]
  onCreated: (deal: Deal) => void
}

export function DealDialog({ open, onOpenChange, stages, onCreated }: DealDialogProps) {
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    title: '',
    value: '',
    stage_id: stages[0]?.id ?? '',
    expected_close: '',
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/deals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          value: form.value ? Number(form.value) : null,
          stage_id: form.stage_id || stages[0]?.id,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error?.message ?? 'Failed')
      toast.success('Deal created')
      onCreated(json.data)
      setForm({ title: '', value: '', stage_id: stages[0]?.id ?? '', expected_close: '' })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>New Deal</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label>Title *</Label>
            <Input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Value ($)</Label>
              <Input type="number" min="0" step="0.01" value={form.value} onChange={e => setForm(p => ({ ...p, value: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Stage</Label>
              <Select value={form.stage_id} onValueChange={v => setForm(p => ({ ...p, stage_id: v ?? stages[0]?.id ?? '' }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {stages.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Expected close</Label>
            <Input type="date" value={form.expected_close} onChange={e => setForm(p => ({ ...p, expected_close: e.target.value }))} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? 'Saving…' : 'Create deal'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
