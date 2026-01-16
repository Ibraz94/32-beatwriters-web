'use client'

import React from 'react'
import { MoreVertical, StickyNote, Tag } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface PlayerActionsMenuProps {
  onAddNote: () => void
  onAddTier: () => void
  hasNote?: boolean
}

export default function PlayerActionsMenu({
  onAddNote,
  onAddTier,
  hasNote = false,
}: PlayerActionsMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="text-gray-600 dark:text-gray-400 hover:text-[#E64A30] dark:hover:text-[#E64A30] transition-colors p-1"
          onClick={(e) => e.stopPropagation()}
        >
          <MoreVertical className="w-5 h-5" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation()
            onAddNote()
          }}
          className="cursor-pointer"
        >
          <StickyNote className="mr-2 h-4 w-4" />
          <span>{hasNote ? 'Edit Note' : 'Add Note'}</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation()
            onAddTier()
          }}
          className="cursor-pointer"
        >
          <Tag className="mr-2 h-4 w-4" />
          <span>Add Tier</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
