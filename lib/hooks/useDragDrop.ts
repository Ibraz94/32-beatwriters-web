import { useState, useCallback, useRef } from 'react'
import { RookiePlayer, TierHeading } from '@/lib/services/rookieBoardApi'

export type DragItemType = 'player' | 'tier'

interface DragState {
  isDragging: boolean
  draggedItemId: string | number | null
  draggedItemType: DragItemType | null
  dragOverIndex: number | null
}

interface UseDragDropOptions {
  players: RookiePlayer[]
  tiers: TierHeading[]
  onPlayerReorder: (playerId: number, newRank: number) => Promise<void>
  onTierMove: (tierId: string, newPosition: number) => Promise<void>
}

export function useDragDrop({
  players,
  tiers,
  onPlayerReorder,
  onTierMove,
}: UseDragDropOptions) {
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    draggedItemId: null,
    draggedItemType: null,
    dragOverIndex: null,
  })

  const draggedItem = useRef<{ type: DragItemType; id: string | number } | null>(null)
  const touchScrollEnabled = useRef(true)

  // Player drag handlers
  const handlePlayerDragStart = useCallback(
    (e: React.DragEvent, player: RookiePlayer) => {
      e.dataTransfer.effectAllowed = 'move'
      e.dataTransfer.setData('text/plain', `player-${player.id}`)
      
      draggedItem.current = { type: 'player', id: player.id }
      
      setDragState({
        isDragging: true,
        draggedItemId: player.id,
        draggedItemType: 'player',
        dragOverIndex: null,
      })

      // Add visual feedback
      const target = e.currentTarget as HTMLElement
      target.style.opacity = '0.5'
      
      // Disable touch scrolling during drag
      touchScrollEnabled.current = false
    },
    []
  )

  const handlePlayerDragOver = useCallback(
    (e: React.DragEvent, targetPlayer: RookiePlayer) => {
      e.preventDefault()
      e.dataTransfer.dropEffect = 'move'

      // Only allow dropping players on players
      if (draggedItem.current?.type !== 'player') {
        return
      }

      setDragState((prev) => ({
        ...prev,
        dragOverIndex: targetPlayer.rank,
      }))

      // Visual feedback for drop zone
      const target = e.currentTarget as HTMLElement
      target.style.borderTop = '2px solid #E64A30'
    },
    []
  )

  const handlePlayerDragLeave = useCallback((e: React.DragEvent) => {
    const target = e.currentTarget as HTMLElement
    target.style.borderTop = ''
  }, [])

  const handlePlayerDrop = useCallback(
    async (e: React.DragEvent, targetPlayer: RookiePlayer) => {
      e.preventDefault()
      
      const target = e.currentTarget as HTMLElement
      target.style.borderTop = ''

      if (draggedItem.current?.type !== 'player') {
        return
      }

      const draggedPlayerId = draggedItem.current.id as number
      const draggedPlayer = players.find((p) => p.id === draggedPlayerId)

      if (!draggedPlayer || draggedPlayer.id === targetPlayer.id) {
        setDragState({
          isDragging: false,
          draggedItemId: null,
          draggedItemType: null,
          dragOverIndex: null,
        })
        touchScrollEnabled.current = true
        return
      }

      // Call the reorder handler
      await onPlayerReorder(draggedPlayerId, targetPlayer.rank)

      setDragState({
        isDragging: false,
        draggedItemId: null,
        draggedItemType: null,
        dragOverIndex: null,
      })
      
      touchScrollEnabled.current = true
    },
    [players, onPlayerReorder]
  )

  const handlePlayerDragEnd = useCallback((e: React.DragEvent) => {
    const target = e.currentTarget as HTMLElement
    target.style.opacity = ''
    target.style.borderTop = ''

    draggedItem.current = null
    setDragState({
      isDragging: false,
      draggedItemId: null,
      draggedItemType: null,
      dragOverIndex: null,
    })
    
    touchScrollEnabled.current = true
  }, [])

  // Tier drag handlers
  const handleTierDragStart = useCallback(
    (e: React.DragEvent, tier: TierHeading) => {
      e.dataTransfer.effectAllowed = 'move'
      e.dataTransfer.setData('text/plain', `tier-${tier.id}`)
      
      draggedItem.current = { type: 'tier', id: tier.id }
      
      setDragState({
        isDragging: true,
        draggedItemId: tier.id,
        draggedItemType: 'tier',
        dragOverIndex: null,
      })

      // Add visual feedback
      const target = e.currentTarget as HTMLElement
      target.style.opacity = '0.5'
      
      // Disable touch scrolling during drag
      touchScrollEnabled.current = false
    },
    []
  )

  const handleTierDragOver = useCallback(
    (e: React.DragEvent, targetTier: TierHeading) => {
      e.preventDefault()
      e.dataTransfer.dropEffect = 'move'

      // Only allow dropping tiers on tiers
      if (draggedItem.current?.type !== 'tier') {
        return
      }

      setDragState((prev) => ({
        ...prev,
        dragOverIndex: targetTier.position,
      }))

      // Visual feedback for drop zone
      const target = e.currentTarget as HTMLElement
      target.style.borderTop = '3px solid #FFD700'
    },
    []
  )

  const handleTierDragLeave = useCallback((e: React.DragEvent) => {
    const target = e.currentTarget as HTMLElement
    target.style.borderTop = ''
  }, [])

  const handleTierDrop = useCallback(
    async (e: React.DragEvent, targetTier: TierHeading) => {
      e.preventDefault()
      
      const target = e.currentTarget as HTMLElement
      target.style.borderTop = ''

      if (draggedItem.current?.type !== 'tier') {
        return
      }

      const draggedTierId = draggedItem.current.id as string
      const draggedTier = tiers.find((t) => t.id === draggedTierId)

      if (!draggedTier || draggedTier.id === targetTier.id) {
        setDragState({
          isDragging: false,
          draggedItemId: null,
          draggedItemType: null,
          dragOverIndex: null,
        })
        touchScrollEnabled.current = true
        return
      }

      // Call the tier move handler
      await onTierMove(draggedTierId, targetTier.position)

      setDragState({
        isDragging: false,
        draggedItemId: null,
        draggedItemType: null,
        dragOverIndex: null,
      })
      
      touchScrollEnabled.current = true
    },
    [tiers, onTierMove]
  )

  const handleTierDragEnd = useCallback((e: React.DragEvent) => {
    const target = e.currentTarget as HTMLElement
    target.style.opacity = ''
    target.style.borderTop = ''

    draggedItem.current = null
    setDragState({
      isDragging: false,
      draggedItemId: null,
      draggedItemType: null,
      dragOverIndex: null,
    })
    
    touchScrollEnabled.current = true
  }, [])

  return {
    dragState,
    playerHandlers: {
      onDragStart: handlePlayerDragStart,
      onDragOver: handlePlayerDragOver,
      onDragLeave: handlePlayerDragLeave,
      onDrop: handlePlayerDrop,
      onDragEnd: handlePlayerDragEnd,
    },
    tierHandlers: {
      onDragStart: handleTierDragStart,
      onDragOver: handleTierDragOver,
      onDragLeave: handleTierDragLeave,
      onDrop: handleTierDrop,
      onDragEnd: handleTierDragEnd,
    },
  }
}
