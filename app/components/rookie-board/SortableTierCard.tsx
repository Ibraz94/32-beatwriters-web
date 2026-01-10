import { useState, useRef, useEffect } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { TierHeading as TierHeadingType } from '@/lib/services/rookieBoardApi'
import TierActionsMenu from './TierActionsMenu'

interface SortableTierCardProps {
  tier: TierHeadingType
  onRenameTier?: (tierId: string, newName: string) => Promise<void>
  onDeleteTier?: (tierId: string) => Promise<void>
}

export default function SortableTierCard({
  tier,
  onRenameTier,
  onDeleteTier,
}: SortableTierCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedName, setEditedName] = useState(tier.name)
  const [isRenaming, setIsRenaming] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `tier-${tier.id}` })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
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

  return (
    <div 
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`bg-[#E64A30] dark:bg-[#E64A30]/90 rounded-xl border-2 border-[#E64A30] shadow-sm cursor-grab active:cursor-grabbing ${isDragging ? 'opacity-50 z-50' : ''}`}
    >
      <div className="p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
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
                  onPointerDown={(e) => e.stopPropagation()}
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
                onDoubleClick={(e) => {
                  e.stopPropagation()
                  setIsEditing(true)
                }}
                onPointerDown={(e) => e.stopPropagation()}
              >
                {tier.name}
              </h3>
            )}
          </div>
          
          {!isEditing && (
            <div onPointerDown={(e) => e.stopPropagation()}>
              <TierActionsMenu
                onRenameTier={() => setIsEditing(true)}
                onDeleteTier={handleDelete}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
