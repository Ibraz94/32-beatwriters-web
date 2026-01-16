import { useState } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  defaultDropAnimationSideEffects,
} from '@dnd-kit/core'
import type { DropAnimation } from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { RookiePlayer, TierHeading } from '@/lib/services/rookieBoardApi'

export type DragItemType = 'player' | 'tier'

interface DragState {
  isDragging: boolean
  draggedItemId: string | number | null
  draggedItemType: DragItemType | null
  activeId: string | number | null
  activeItem: RookiePlayer | TierHeading | null
}

interface UseDndKitDragDropOptions {
  players: RookiePlayer[]
  tiers: TierHeading[]
  onPlayerReorder: (playerId: number, newRank: number) => Promise<void>
  onTierMove: (tierId: string, newPosition: number) => Promise<void>
}

const dropAnimationConfig: DropAnimation = {
  sideEffects: defaultDropAnimationSideEffects({
    styles: {
      active: {
        opacity: '0.4',
      },
    },
  }),
}

export function useDndKitDragDrop({
  players,
  tiers,
  onPlayerReorder,
  onTierMove,
}: UseDndKitDragDropOptions) {
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    draggedItemId: null,
    draggedItemType: null,
    activeId: null,
    activeItem: null,
  })

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // 5px movement required before drag starts
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    const activeId = active.id

    // Determine if it's a player or tier
    const isPlayer = players.some((p) => `player-${p.id}` === activeId)
    const isTier = tiers.some((t) => `tier-${t.id}` === activeId)

    let activeItem: RookiePlayer | TierHeading | null = null

    if (isPlayer) {
      const playerId = parseInt(activeId.toString().replace('player-', ''))
      activeItem = players.find((p) => p.id === playerId) || null
    } else if (isTier) {
      const tierId = activeId.toString().replace('tier-', '')
      activeItem = tiers.find((t) => t.id === tierId) || null
    }

    setDragState({
      isDragging: true,
      draggedItemId: activeId,
      draggedItemType: isPlayer ? 'player' : isTier ? 'tier' : null,
      activeId: activeId,
      activeItem,
    })
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (!over || active.id === over.id) {
      setDragState({
        isDragging: false,
        draggedItemId: null,
        draggedItemType: null,
        activeId: null,
        activeItem: null,
      })
      return
    }

    // Handle player reordering
    if (
      active.id.toString().startsWith('player-') &&
      over.id.toString().startsWith('player-')
    ) {
      const activePlayerId = parseInt(active.id.toString().replace('player-', ''))
      const overPlayerId = parseInt(over.id.toString().replace('player-', ''))

      const activePlayer = players.find((p) => p.id === activePlayerId)
      const overPlayer = players.find((p) => p.id === overPlayerId)

      if (activePlayer && overPlayer) {
        await onPlayerReorder(activePlayerId, overPlayer.rank)
      }
    }

    // Handle tier reordering
    if (
      active.id.toString().startsWith('tier-') &&
      over.id.toString().startsWith('tier-')
    ) {
      const activeTierId = active.id.toString().replace('tier-', '')
      const overTierId = over.id.toString().replace('tier-', '')

      const activeTier = tiers.find((t) => t.id === activeTierId)
      const overTier = tiers.find((t) => t.id === overTierId)

      if (activeTier && overTier) {
        await onTierMove(activeTierId, overTier.position)
      }
    }

    setDragState({
      isDragging: false,
      draggedItemId: null,
      draggedItemType: null,
      activeId: null,
      activeItem: null,
    })
  }

  const handleDragCancel = () => {
    setDragState({
      isDragging: false,
      draggedItemId: null,
      draggedItemType: null,
      activeId: null,
      activeItem: null,
    })
  }

  return {
    dragState,
    sensors,
    handleDragStart,
    handleDragEnd,
    handleDragCancel,
    dropAnimationConfig,
    DndContext,
    SortableContext,
    verticalListSortingStrategy,
    closestCenter,
    DragOverlay,
  }
}
