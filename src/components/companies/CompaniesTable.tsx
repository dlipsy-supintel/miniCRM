'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Plus, Search, Globe, Building2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { CompanyDialog } from './CompanyDialog'
import type { Company } from '@/types/crm'

export function CompaniesTable({ initialData }: { initialData: Company[] }) {
  const [companies, setCompanies] = useState(initialData)
  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)

  const filtered = companies.filter(c => c.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search companies…" className="pl-8 h-8 text-sm" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Button size="sm" onClick={() => setDialogOpen(true)}>
          <Plus size={14} className="mr-1.5" />Add Company
        </Button>
      </div>
      <div className="rounded-lg border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Company</th>
              <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground hidden md:table-cell">Industry</th>
              <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground hidden lg:table-cell">Website</th>
              <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground hidden xl:table-cell">Tags</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.length === 0 && (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-muted-foreground text-sm">No companies yet</td></tr>
            )}
            {filtered.map(company => (
              <tr key={company.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3">
                  <Link href={`/companies/${company.id}`} className="flex items-center gap-3 group">
                    <div className="w-7 h-7 rounded-md bg-muted flex items-center justify-center shrink-0">
                      <Building2 size={14} className="text-muted-foreground" />
                    </div>
                    <span className="font-medium group-hover:text-primary transition-colors">{company.name}</span>
                  </Link>
                </td>
                <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{company.industry ?? '—'}</td>
                <td className="px-4 py-3 hidden lg:table-cell">
                  {company.website ? (
                    <a href={company.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary">
                      <Globe size={11} />{company.domain ?? company.website}
                    </a>
                  ) : '—'}
                </td>
                <td className="px-4 py-3 hidden xl:table-cell">
                  <div className="flex flex-wrap gap-1">
                    {company.tags.slice(0, 3).map(tag => (
                      <Badge key={tag} variant="secondary" className="text-xs py-0">{tag}</Badge>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <CompanyDialog open={dialogOpen} onOpenChange={setDialogOpen} onCreated={c => { setCompanies(p => [c, ...p]); setDialogOpen(false) }} />
    </div>
  )
}
