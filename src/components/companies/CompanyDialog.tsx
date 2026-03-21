'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { Company } from '@/types/crm'

export function CompanyDialog({ open, onOpenChange, onCreated }: { open: boolean; onOpenChange: (v: boolean) => void; onCreated: (c: Company) => void }) {
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ name: '', domain: '', industry: '', website: '' })
  const update = (f: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(p => ({ ...p, [f]: e.target.value }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/companies', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error?.message ?? 'Failed')
      toast.success('Company created')
      onCreated(json.data)
      setForm({ name: '', domain: '', industry: '', website: '' })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>New Company</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5"><Label>Name *</Label><Input value={form.name} onChange={update('name')} required /></div>
          <div className="space-y-1.5"><Label>Domain</Label><Input value={form.domain} onChange={update('domain')} placeholder="acme.com" /></div>
          <div className="space-y-1.5"><Label>Industry</Label><Input value={form.industry} onChange={update('industry')} /></div>
          <div className="space-y-1.5"><Label>Website</Label><Input value={form.website} onChange={update('website')} /></div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? 'Saving…' : 'Create company'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
