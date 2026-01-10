import { useState } from 'react'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from '@dnd-kit/core'
import { RookiePlayer, TierHeading } from '@/lib/services/rookieBoardApi'

interface DragState {
  activeId: string | null
  activeItem: RookiePlayer | TierHeading | null
  activeType: 'player' | 'tier' | null
}

interface UseSimpleDragDropOptions {
  players: RookiePlayer[]
  tiers: TierHeading[]
  onPlayerReorder: (playerId: number, newRank: number) => Promise<void>
  onTierMove: (tierId: string, newPosition: number) => Promise<void>
}

export function useSimpleDragDrop({
  players,
  tiers,
  onPlayerReorder,
  onTierMove,
}: UseSimpleDragDropOptions) {
  const [dragState, setDragState] = useState<DragState>({
    activeId: null,
    activeItem: null,
    activeType: null,
  })

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    const id = active.id.toString()

    if (id.startsWith('player-')) {
      const playerId = parseInt(id.replace('player-', ''))
      const player = players.find((p) => p.id === playerId)
      setDragState({
        activeId: id,
        activeItem: player || null,
        activeType: 'player',
      })
    } else if (id.startsWith('tier-')) {
      const tierId = id.replace('tier-', '')
      const tier = tiers.find((t) => t.id === tierId)
      setDragState({
        activeId: id,
        activeItem: tier || null,
        activeType: 'tier',
      })
    }
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    setDragState({
      activeId: null,
      activeItem: null,
      activeType: null,
    })

    if (!over || active.id === over.id) return

    const activeId = active.id.toString()
    const overId = over.id.toString()

    // Player reordering
    if (activeId.startsWith('player-') && overId.startsWith('player-')) {
      const activePlayerId = parseInt(activeId.replace('player-', ''))
      const overPlayerId = parseInt(overId.replace('player-', ''))
      
      const overPlayer = players.find((p) => p.id === overPlayerId)
      if (overPlayer) {
        await onPlayerReorder(activePlayerId, overPlayer.rank)
      }
    }

    // Tier reordering
    if (activeId.startsWith('tier-') && overId.startsWith('tier-')) {
      const activeTierId = activeId.replace('tier-', '')
      const overTierId = overId.replace('tier-', '')
      
      const overTier = tiers.find((t) => t.id === overTierId)
      if (overTier) {
        await onTierMove(activeTierId, overTier.position)
      }
    }
  }

  return {
    dragState,
    sensors,
    handleDragStart,
    handleDragEnd,
    DndContext,
    closestCenter,
    DragOverlay,
  }
}
