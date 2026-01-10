'use client'

import React, { useState, useRef, useEffect } from 'react'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical } from 'lucide-react'
import { TierHeading as TierHeadingType } from '@/lib/services/rookieBoardApi'
import TierActionsMenu from './TierActionsMenu'

interface TierHeadingProps {
  tier: TierHeadingType
  onRenameTier?: (tierId: string, newName: string) => Promise<void>
  onDeleteTier?: (tierId: string) => Promise<void>
  isDragging?: boolean
  sortableRef?: (node: HTMLElement | null) => void
  sortableAttributes?: any
  sortableListeners?: any
  sortableTransform?: any
  sortableTransition?: string
  sortableStyle?: React.CSSProperties
}

export default function TierHeading({ 
  tier,
  onRenameTier,
  onDeleteTier,
  isDragging = false,
  sortableRef,
  sortableAttributes,
  sortableListeners,
  sortableTransform,
  sortableTransition,
  sortableStyle,
}: TierHeadingProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedName, setEditedName] = useState(tier.name)
  const [isRenaming, setIsRenaming] = useState(false)
  const [isHovering, setIsHovering] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Focus input when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  const handleStartEdit = () => {
    setIsEditing(true)
    setEditedName(tier.name)
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setEditedName(tier.name)
  }

  const handleSaveEdit = async () => {
    if (!onRenameTier || editedName.trim() === '' || editedName === tier.name) {
      handleCancelEdit()
      return
    }

    setIsRenaming(true)
    try {
      await onRenameTier(tier.id, editedName.trim())
      setIsEditing(false)
    } catch (error) {
      console.error('Failed to rename tier:', error)
      // Keep editing mode open on error
    } finally {
      setIsRenaming(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveEdit()
    } else if (e.key === 'Escape') {
      handleCancelEdit()
    }
  }

  const handleDelete = async () => {
    if (!onDeleteTier) return

    // Show confirmation dialog
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

  // Prevent drag on interactive elements
  const handlePointerDown = (e: React.PointerEvent) => {
    const target = e.target as HTMLElement
    // Prevent drag if clicking on buttons or inputs
    if (
      target.closest('button') ||
      target.closest('input')
    ) {
      e.stopPropagation()
    }
  }

  return (
    <div
      ref={sortableRef as any}
      style={sortableStyle}
      {...sortableAttributes}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onPointerDown={handlePointerDown}
      className={`bg-[#E64A30] dark:bg-[#E64A30]/90 rounded-xl border-2 border-[#E64A30] dark:border-[#E64A30] shadow-sm hover:shadow-md transition-shadow ${
        isDragging ? 'opacity-40' : ''
      }`}
    >
      <div className="p-3" {...sortableListeners} style={{ cursor: 'move' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            <GripVertical 
              className={`w-5 h-5 text-white/70 transition-opacity ${
                isHovering ? 'opacity-100' : 'opacity-70'
              }`}
            />
            
            {isEditing ? (
              <div className="flex items-center gap-2 flex-1" style={{ cursor: 'auto' }} onPointerDown={(e) => e.stopPropagation()}>
                <input
                  ref={inputRef}
                  type="text"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  onKeyDown={handleKeyDown}
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
                className="text-white font-bold text-lg hover:text-yellow-200 transition-colors"
                style={{ cursor: 'text' }}
                onDoubleClick={handleStartEdit}
                onPointerDown={(e) => e.stopPropagation()}
              >
                {tier.name}
              </h3>
            )}
          </div>
          
          {!isEditing && (
            <div onPointerDown={(e) => e.stopPropagation()} style={{ cursor: 'auto' }}>
              <TierActionsMenu
                onRenameTier={handleStartEdit}
                onDeleteTier={handleDelete}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
