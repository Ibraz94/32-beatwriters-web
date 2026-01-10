import React from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { TierHeading as TierHeadingType } from '@/lib/services/rookieBoardApi'
import TierHeading from './TierHeading'

interface SortableTierHeadingProps {
  tier: TierHeadingType
  onRenameTier?: (tierId: string, newName: string) => Promise<void>
  onDeleteTier?: (tierId: string) => Promise<void>
  isDragging?: boolean
}

export default function SortableTierHeading(props: SortableTierHeadingProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: `tier-${props.tier.id}`,
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
    <TierHeading 
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
