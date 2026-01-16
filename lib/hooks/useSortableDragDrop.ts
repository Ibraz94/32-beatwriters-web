import { useState } from 'react'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { RookiePlayer, TierHeading } from '@/lib/services/rookieBoardApi'

interface DragState {
  activeId: string | null
  activeItem: RookiePlayer | TierHeading | null
  activeType: 'player' | 'tier' | null
}

interface UseSortableDragDropOptions {
  players: RookiePlayer[]
  tiers: TierHeading[]
  onPlayerReorder: (playerId: number, newRank: number) => Promise<void>
  onTierMove: (tierId: string, newPosition: number) => Promise<void>
}

export function useSortableDragDrop({
  players,
  tiers,
  onPlayerReorder,
  onTierMove,
}: UseSortableDragDropOptions) {
  const [dragState, setDragState] = useState<DragState>({
    activeId: null,
    activeItem: null,
    activeType: null,
  })

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3, // Reduced from 8 to 3 for faster response
      },
    })
  )

  // Create sortable IDs (only players)
  const playerIds = players.map((p) => `player-${p.id}`)

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

    // Player reordering only
    if (activeId.startsWith('player-') && overId.startsWith('player-')) {
      const activePlayerId = parseInt(activeId.replace('player-', ''))
      const overPlayerId = parseInt(overId.replace('player-', ''))
      
      const overPlayer = players.find((p) => p.id === overPlayerId)
      if (overPlayer) {
        await onPlayerReorder(activePlayerId, overPlayer.rank)
      }
    }
  }

  return {
    dragState,
    sensors,
    handleDragStart,
    handleDragEnd,
    allIds: playerIds,
    DndContext,
    SortableContext,
    verticalListSortingStrategy,
    closestCenter,
  }
}
