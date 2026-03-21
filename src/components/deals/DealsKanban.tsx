'use client'

import { useState, useCallback } from 'react'
import {
  DndContext, DragOverlay, closestCorners,
  type DragEndEvent, type DragStartEvent,
  PointerSensor, useSensor, useSensors
} from '@dnd-kit/core'
import { KanbanColumn } from './KanbanColumn'
import { DealCard } from './DealCard'
import { DealDialog } from './DealDialog'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import type { Deal, PipelineStage } from '@/types/crm'

interface DealsKanbanProps {
  initialStages: PipelineStage[]
  initialDeals: Deal[]
}

export function DealsKanban({ initialStages, initialDeals }: DealsKanbanProps) {
  const [deals, setDeals] = useState(initialDeals)
  const [stages] = useState(initialStages)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }))

  const activeDeal = activeId ? deals.find(d => d.id === activeId) : null

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string)
  }

  async function handleDragEnd(event: DragEndEvent) {
    setActiveId(null)
    const { active, over } = event
    if (!over) return

    const dealId = active.id as string
    const newStageId = over.id as string

    const deal = deals.find(d => d.id === dealId)
    if (!deal || deal.stage_id === newStageId) return

    // Optimistic update
    const oldStageId = deal.stage_id
    const newStage = stages.find(s => s.id === newStageId)
    setDeals(prev => prev.map(d =>
      d.id === dealId ? { ...d, stage_id: newStageId, stage: newStage } : d
    ))

    try {
      const res = await fetch(`/api/deals/${dealId}/stage`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage_id: newStageId }),
      })
      if (!res.ok) throw new Error('Failed to move deal')
    } catch {
      // Rollback
      setDeals(prev => prev.map(d =>
        d.id === dealId ? { ...d, stage_id: oldStageId, stage: stages.find(s => s.id === oldStageId) } : d
      ))
      toast.error('Failed to move deal')
    }
  }

  const handleCreated = useCallback((deal: Deal) => {
    setDeals(prev => [deal, ...prev])
    setDialogOpen(false)
  }, [])

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="flex justify-end mb-3 shrink-0">
        <Button size="sm" onClick={() => setDialogOpen(true)}>
          <Plus size={14} className="mr-1.5" />Add Deal
        </Button>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 min-h-0 overflow-x-auto pb-4">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-4 h-full min-w-max">
            {stages.map(stage => (
              <KanbanColumn
                key={stage.id}
                stage={stage}
                deals={deals.filter(d => d.stage_id === stage.id)}
              />
            ))}
          </div>
          <DragOverlay>
            {activeDeal && <DealCard deal={activeDeal} isDragging />}
          </DragOverlay>
        </DndContext>
      </div>

      <DealDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        stages={stages}
        onCreated={handleCreated}
      />
    </div>
  )
}
