'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { DollarSign, User, Calendar } from 'lucide-react'
import { format } from 'date-fns'
import type { Deal } from '@/types/crm'

interface DealCardProps {
  deal: Deal
  isDragging?: boolean
}

export function DealCard({ deal, isDragging }: DealCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging: isSortableDragging } = useSortable({ id: deal.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        'bg-card rounded-md border border-border p-3 cursor-grab active:cursor-grabbing',
        'hover:border-primary/30 hover:shadow-sm transition-all',
        (isDragging || isSortableDragging) && 'opacity-50 shadow-lg ring-1 ring-primary'
      )}
    >
      <Link
        href={`/deals/${deal.id}`}
        className="block"
        onClick={e => e.stopPropagation()}
        onPointerDown={e => e.stopPropagation()}
      >
        <p className="text-sm font-medium text-foreground line-clamp-2">{deal.title}</p>

        {deal.value && (
          <div className="flex items-center gap-1 mt-2 text-xs text-emerald-400 font-medium">
            <DollarSign size={11} />
            {deal.value.toLocaleString()} {deal.currency}
          </div>
        )}

        <div className="mt-2 space-y-1">
          {deal.contact && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <User size={10} />
              {deal.contact.first_name} {deal.contact.last_name}
            </div>
          )}
          {deal.expected_close && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Calendar size={10} />
              {format(new Date(deal.expected_close), 'MMM d, yyyy')}
            </div>
          )}
        </div>
      </Link>
    </div>
  )
}
