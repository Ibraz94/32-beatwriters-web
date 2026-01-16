import { useState, useRef, useEffect } from 'react'
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

    try {
      await onDeleteTier(tier.id)
    } catch (error) {
      console.error('Failed to delete tier:', error)
    }
  }

  return (
    <div className="bg-[#E64A30] dark:bg-[#E64A30]/90 rounded-xl border-2 border-[#E64A30] shadow-sm">
      <div className="min-h-12 px-2 sm:px-4 py-2 flex items-center justify-between gap-2 sm:gap-3">
        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
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
                className="flex-1 px-2 sm:px-3 py-1 text-xs sm:text-sm font-semibold bg-white dark:bg-gray-800 text-[#1D212D] dark:text-white rounded border-2 border-white focus:outline-none focus:border-yellow-300"
                placeholder="Tier name..."
              />
              {isRenaming && (
                <span className="text-white text-xs sm:text-sm whitespace-nowrap">Saving...</span>
              )}
            </div>
          ) : (
            <h3 
              className="text-white font-bold text-base sm:text-lg hover:text-yellow-200 transition-colors cursor-text truncate"
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
          <div onPointerDown={(e) => e.stopPropagation()} className="flex-shrink-0">
            <TierActionsMenu
              onRenameTier={() => setIsEditing(true)}
              onDeleteTier={handleDelete}
            />
          </div>
        )}
      </div>
    </div>
  )
}
