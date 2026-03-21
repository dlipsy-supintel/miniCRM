'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Plus, Search, Mail, Phone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ContactDialog } from './ContactDialog'
import type { Contact } from '@/types/crm'

interface ContactsTableProps {
  initialData: Contact[]
}

export function ContactsTable({ initialData }: ContactsTableProps) {
  const [contacts, setContacts] = useState(initialData)
  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)

  const filtered = contacts.filter(c =>
    `${c.first_name} ${c.last_name ?? ''} ${c.email ?? ''}`.toLowerCase().includes(search.toLowerCase())
  )

  function handleCreated(contact: Contact) {
    setContacts(prev => [contact, ...prev])
    setDialogOpen(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search contacts…"
            className="pl-8 h-8 text-sm"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <Button size="sm" onClick={() => setDialogOpen(true)}>
          <Plus size={14} className="mr-1.5" />
          Add Contact
        </Button>
      </div>

      <div className="rounded-lg border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Name</th>
              <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground hidden md:table-cell">Company</th>
              <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground hidden lg:table-cell">Contact</th>
              <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground hidden xl:table-cell">Tags</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground text-sm">
                  {search ? 'No contacts found' : 'No contacts yet — add your first one'}
                </td>
              </tr>
            )}
            {filtered.map(contact => (
              <tr key={contact.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3">
                  <Link href={`/contacts/${contact.id}`} className="flex items-center gap-3 group">
                    <Avatar className="w-7 h-7 shrink-0">
                      <AvatarFallback className="text-xs bg-primary/20 text-primary">
                        {contact.first_name[0]}{contact.last_name?.[0] ?? ''}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-foreground group-hover:text-primary transition-colors">
                        {contact.first_name} {contact.last_name}
                      </p>
                      {contact.job_title && (
                        <p className="text-xs text-muted-foreground">{contact.job_title}</p>
                      )}
                    </div>
                  </Link>
                </td>
                <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                  {contact.company?.name ?? '—'}
                </td>
                <td className="px-4 py-3 hidden lg:table-cell">
                  <div className="space-y-0.5">
                    {contact.email && (
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Mail size={11} /> {contact.email}
                      </div>
                    )}
                    {contact.phone && (
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Phone size={11} /> {contact.phone}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 hidden xl:table-cell">
                  <div className="flex flex-wrap gap-1">
                    {contact.tags.slice(0, 3).map(tag => (
                      <Badge key={tag} variant="secondary" className="text-xs py-0">{tag}</Badge>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ContactDialog open={dialogOpen} onOpenChange={setDialogOpen} onCreated={handleCreated} />
    </div>
  )
}
