import React, { useState, useRef, useEffect } from 'react'
import { useDraggable, useDroppable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical } from 'lucide-react'
import { TierHeading as TierHeadingType } from '@/lib/services/rookieBoardApi'
import TierActionsMenu from './TierActionsMenu'

interface DraggableTierCardProps {
  tier: TierHeadingType
  onRenameTier?: (tierId: string, newName: string) => Promise<void>
  onDeleteTier?: (tierId: string) => Promise<void>
  isActive?: boolean
}

export default function DraggableTierCard({
  tier,
  onRenameTier,
  onDeleteTier,
  isActive = false,
}: DraggableTierCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedName, setEditedName] = useState(tier.name)
  const [isRenaming, setIsRenaming] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const { attributes, listeners, setNodeRef: setDragRef, transform, isDragging } = useDraggable({
    id: `tier-${tier.id}`,
  })

  const { setNodeRef: setDropRef, isOver } = useDroppable({
    id: `tier-${tier.id}`,
  })

  const style = {
    transform: CSS.Translate.toString(transform),
  }

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  const handleSaveEdit = async () => {
    if (!onRenameTier || editedName.trim() === '' || editedName === tier.name) {
      setIsEditing(false)
      setEditedName(tier.name)
      return
    }

    setIsRenaming(true)
    try {
      await onRenameTier(tier.id, editedName.trim())
      setIsEditing(false)
    } catch (error) {
      console.error('Failed to rename tier:', error)
    } finally {
      setIsRenaming(false)
    }
  }

  const handleDelete = async () => {
    if (!onDeleteTier) return

    const confirmed = window.confirm(
      `Are you sure you want to delete the tier "${tier.name}"? Players will remain in place.`
    )

    if (confirmed) {
      try {
        await onDeleteTier(tier.id)
      } catch (error) {
        console.error('Failed to delete tier:', error)
      }
    }
  }

  const setRefs = (element: HTMLDivElement | null) => {
    setDragRef(element)
    setDropRef(element)
  }

  return (
    <div
      ref={setRefs}
      style={style}
      className={`bg-[#E64A30] dark:bg-[#E64A30]/90 rounded-xl border-2 transition-all ${
        isDragging ? 'opacity-30 border-yellow-400' : isOver ? 'border-yellow-400 shadow-lg' : 'border-[#E64A30]'
      } shadow-sm hover:shadow-md`}
    >
      <div className="p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            <div 
              {...listeners} 
              {...attributes}
              className="cursor-grab active:cursor-grabbing touch-none"
            >
              <GripVertical className="w-5 h-5 text-white/70" />
            </div>
            
            {isEditing ? (
              <div className="flex items-center gap-2 flex-1">
                <input
                  ref={inputRef}
                  type="text"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveEdit()
                    if (e.key === 'Escape') {
                      setIsEditing(false)
                      setEditedName(tier.name)
                    }
                  }}
                  onBlur={handleSaveEdit}
                  disabled={isRenaming}
                  className="flex-1 px-3 py-1 text-sm font-semibold bg-white dark:bg-gray-800 text-[#1D212D] dark:text-white rounded border-2 border-white focus:outline-none focus:border-yellow-300"
                  placeholder="Tier name..."
                />
                {isRenaming && (
                  <span className="text-white text-sm">Saving...</span>
                )}
              </div>
            ) : (
              <h3 
                className="text-white font-bold text-lg hover:text-yellow-200 transition-colors cursor-text"
                onDoubleClick={() => setIsEditing(true)}
              >
                {tier.name}
              </h3>
            )}
          </div>
          
          {!isEditing && (
            <TierActionsMenu
              onRenameTier={() => setIsEditing(true)}
              onDeleteTier={handleDelete}
            />
          )}
        </div>
      </div>
    </div>
  )
}
