import React from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { RookiePlayer, TierHeading } from '@/lib/services/rookieBoardApi'
import PlayerRow from './PlayerRow'

interface SortablePlayerRowProps {
  player: RookiePlayer
  note?: string
  tiers: TierHeading[]
  onSaveNote: (playerId: number, content: string) => Promise<void>
  onCreateTier: (name: string, position: number) => Promise<void>
  onAssignToTier: (playerId: number, tierId: string) => void
  isDragging?: boolean
}

export default function SortablePlayerRow(props: SortablePlayerRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: `player-${props.player.id}`,
    transition: {
      duration: 200,
      easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
    },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <PlayerRow 
      {...props} 
      isDragging={isDragging}
      sortableRef={setNodeRef}
      sortableAttributes={attributes}
      sortableListeners={listeners}
      sortableTransform={transform}
      sortableTransition={transition}
      sortableStyle={style}
    />
  )
}
