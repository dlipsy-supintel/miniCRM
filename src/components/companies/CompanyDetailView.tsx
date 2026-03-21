'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Globe, Building2, Edit2, Save, X, Trash2, TrendingUp, Phone } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { NotesSection } from '@/components/shared/NotesSection'
import type { Company, Contact, Note } from '@/types/crm'

interface CompanyDetailViewProps {
  company: Company & {
    contacts?: Array<Pick<Contact, 'id' | 'first_name' | 'last_name' | 'email' | 'job_title'>>
    deals?: Array<{ id: string; title: string; value: number | null; currency: string; stage: { id: string; name: string; color: string } | null }>
    notes?: Note[]
  }
}

export function CompanyDetailView({ company: initial }: CompanyDetailViewProps) {
  const router = useRouter()
  const [company, setCompany] = useState(initial)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: initial.name,
    domain: initial.domain ?? '',
    industry: initial.industry ?? '',
    size: initial.size ?? '',
    website: initial.website ?? '',
    phone: initial.phone ?? '',
  })

  async function handleSave() {
    setSaving(true)
    const res = await fetch(`/api/companies/${company.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.name,
        domain: form.domain || null,
        industry: form.industry || null,
        size: form.size || null,
        website: form.website || null,
        phone: form.phone || null,
      }),
    })
    if (res.ok) {
      const json = await res.json()
      setCompany(prev => ({ ...prev, ...json.data }))
      setEditing(false)
      toast.success('Company updated')
    } else {
      toast.error('Failed to save')
    }
    setSaving(false)
  }

  async function handleDelete() {
    if (!confirm('Delete this company? This cannot be undone.')) return
    const res = await fetch(`/api/companies/${company.id}`, { method: 'DELETE' })
    if (res.ok) {
      toast.success('Company deleted')
      router.push('/companies')
    } else {
      toast.error('Failed to delete')
    }
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <Link href="/companies" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft size={14} /> Companies
        </Link>
        <div className="flex items-center gap-2">
          {editing ? (
            <>
              <Button size="sm" variant="outline" onClick={() => setEditing(false)}><X size={13} className="mr-1" />Cancel</Button>
              <Button size="sm" onClick={handleSave} disabled={saving}><Save size={13} className="mr-1" />{saving ? 'Saving…' : 'Save'}</Button>
            </>
          ) : (
            <>
              <Button size="sm" variant="outline" onClick={() => setEditing(true)}><Edit2 size={13} className="mr-1" />Edit</Button>
              <Button size="sm" variant="outline" className="text-destructive hover:text-destructive" onClick={handleDelete}>
                <Trash2 size={13} />
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center shrink-0">
          <Building2 size={22} className="text-muted-foreground" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold">{company.name}</h1>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            {company.industry && <span className="text-sm text-muted-foreground">{company.industry}</span>}
            {company.size && <Badge variant="secondary" className="text-xs">{company.size} employees</Badge>}
            {company.tags.map(t => <Badge key={t} variant="outline" className="text-xs">{t}</Badge>)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-4">
          <div className="rounded-lg border border-border p-4 space-y-4">
            <h3 className="text-sm font-medium">Company Info</h3>
            {editing ? (
              <div className="space-y-3">
                <div className="space-y-1"><Label className="text-xs">Name</Label>
                  <Input className="h-8 text-sm" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
                </div>
                <div className="space-y-1"><Label className="text-xs">Domain</Label>
                  <Input className="h-8 text-sm" placeholder="acme.com" value={form.domain} onChange={e => setForm(p => ({ ...p, domain: e.target.value }))} />
                </div>
                <div className="space-y-1"><Label className="text-xs">Industry</Label>
                  <Input className="h-8 text-sm" value={form.industry} onChange={e => setForm(p => ({ ...p, industry: e.target.value }))} />
                </div>
                <div className="space-y-1"><Label className="text-xs">Size</Label>
                  <Input className="h-8 text-sm" placeholder="e.g. 50-200" value={form.size} onChange={e => setForm(p => ({ ...p, size: e.target.value }))} />
                </div>
                <div className="space-y-1"><Label className="text-xs">Website</Label>
                  <Input className="h-8 text-sm" placeholder="https://…" value={form.website} onChange={e => setForm(p => ({ ...p, website: e.target.value }))} />
                </div>
                <div className="space-y-1"><Label className="text-xs">Phone</Label>
                  <Input className="h-8 text-sm" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
                </div>
              </div>
            ) : (
              <dl className="space-y-3 text-sm">
                {company.website && (
                  <div className="flex items-center gap-2">
                    <Globe size={13} className="text-muted-foreground shrink-0" />
                    <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline truncate">{company.domain ?? company.website}</a>
                  </div>
                )}
                {company.phone && (
                  <div className="flex items-center gap-2">
                    <Phone size={13} className="text-muted-foreground shrink-0" />
                    <a href={`tel:${company.phone}`} className="hover:underline">{company.phone}</a>
                  </div>
                )}
                {!company.website && !company.phone && !company.industry && (
                  <p className="text-muted-foreground text-xs">No details yet — click Edit to add</p>
                )}
              </dl>
            )}
          </div>
        </div>

        <div className="lg:col-span-2">
          <Tabs defaultValue="contacts">
            <TabsList className="mb-4">
              <TabsTrigger value="contacts">Contacts {company.contacts?.length ? `(${company.contacts.length})` : ''}</TabsTrigger>
              <TabsTrigger value="deals">Deals {company.deals?.length ? `(${company.deals.length})` : ''}</TabsTrigger>
              <TabsTrigger value="notes">Notes {company.notes?.length ? `(${company.notes.length})` : ''}</TabsTrigger>
            </TabsList>

            <TabsContent value="contacts">
              {!company.contacts?.length ? (
                <p className="text-sm text-muted-foreground py-4">No contacts at this company yet.</p>
              ) : (
                <div className="space-y-2">
                  {company.contacts.map(c => (
                    <Link key={c.id} href={`/contacts/${c.id}`} className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors group">
                      <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                        <span className="text-xs font-medium text-primary">{c.first_name[0]}{c.last_name?.[0] ?? ''}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium group-hover:text-primary transition-colors">{c.first_name} {c.last_name}</p>
                        {c.job_title && <p className="text-xs text-muted-foreground">{c.job_title}</p>}
                      </div>
                      {c.email && <span className="ml-auto text-xs text-muted-foreground hidden md:block">{c.email}</span>}
                    </Link>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="deals">
              {!company.deals?.length ? (
                <p className="text-sm text-muted-foreground py-4">No deals for this company yet.</p>
              ) : (
                <div className="space-y-2">
                  {company.deals.map(deal => (
                    <Link key={deal.id} href={`/deals/${deal.id}`} className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors group">
                      <div className="flex items-center gap-2">
                        <TrendingUp size={14} className="text-muted-foreground" />
                        <span className="text-sm font-medium group-hover:text-primary transition-colors">{deal.title}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {deal.value && <span className="text-xs text-emerald-400">${deal.value.toLocaleString()}</span>}
                        {deal.stage && (
                          <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ background: deal.stage.color + '22', color: deal.stage.color }}>
                            {deal.stage.name}
                          </span>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="notes">
              <NotesSection initialNotes={company.notes ?? []} companyId={company.id} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
