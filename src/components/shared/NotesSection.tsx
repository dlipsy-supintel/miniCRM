'use client'

import { useState } from 'react'
import { StickyNote, Send } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import type { Note } from '@/types/crm'

interface NotesSectionProps {
  initialNotes: Note[]
  contactId?: string
  dealId?: string
  companyId?: string
}

export function NotesSection({ initialNotes, contactId, dealId, companyId }: NotesSectionProps) {
  const [notes, setNotes] = useState<Note[]>(initialNotes)
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!content.trim()) return
    setSubmitting(true)
    const res = await fetch('/api/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, contact_id: contactId, deal_id: dealId, company_id: companyId }),
    })
    if (res.ok) {
      const json = await res.json()
      setNotes(prev => [json.data, ...prev])
      setContent('')
    }
    setSubmitting(false)
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Textarea
          placeholder="Add a note…"
          value={content}
          onChange={e => setContent(e.target.value)}
          className="min-h-[72px] text-sm resize-none"
          onKeyDown={e => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSubmit(e as unknown as React.FormEvent)
          }}
        />
        <Button type="submit" size="sm" className="shrink-0 self-end" disabled={submitting || !content.trim()}>
          <Send size={14} />
        </Button>
      </form>

      {notes.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-6 text-muted-foreground text-sm">
          <StickyNote size={18} className="opacity-40" />
          No notes yet
        </div>
      ) : (
        <div className="space-y-3">
          {notes.map(note => (
            <div key={note.id} className="flex gap-3">
              <Avatar className="w-7 h-7 shrink-0 mt-0.5">
                <AvatarFallback className="text-xs bg-primary/20 text-primary">
                  {note.author?.full_name?.[0] ?? '?'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-foreground">{note.author?.full_name ?? 'Unknown'}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(note.created_at), { addSuffix: true })}
                  </span>
                </div>
                <p className="text-sm text-foreground/90 whitespace-pre-wrap">{note.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
