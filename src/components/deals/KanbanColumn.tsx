'use client'

import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { DealCard } from './DealCard'
import { cn } from '@/lib/utils'
import type { Deal, PipelineStage } from '@/types/crm'

interface KanbanColumnProps {
  stage: PipelineStage
  deals: Deal[]
}

export function KanbanColumn({ stage, deals }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: stage.id })

  const totalValue = deals.reduce((sum, d) => sum + (d.value ?? 0), 0)

  return (
    <div className="flex flex-col w-72 shrink-0">
      {/* Column Header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: stage.color }} />
          <span className="text-sm font-medium text-foreground">{stage.name}</span>
          <span className="text-xs text-muted-foreground bg-muted rounded-full px-1.5 py-0.5">
            {deals.length}
          </span>
        </div>
        {totalValue > 0 && (
          <span className="text-xs text-muted-foreground">
            ${totalValue.toLocaleString()}
          </span>
        )}
      </div>

      {/* Drop zone */}
      <div
        ref={setNodeRef}
        className={cn(
          'flex-1 min-h-[200px] rounded-lg p-2 space-y-2 transition-colors',
          'bg-muted/30 border border-border/50',
          isOver && 'bg-primary/5 border-primary/30'
        )}
      >
        <SortableContext items={deals.map(d => d.id)} strategy={verticalListSortingStrategy}>
          {deals.map(deal => (
            <DealCard key={deal.id} deal={deal} />
          ))}
        </SortableContext>
        {deals.length === 0 && (
          <div className="flex items-center justify-center h-20 text-xs text-muted-foreground/50">
            Drop here
          </div>
        )}
      </div>
    </div>
  )
}
