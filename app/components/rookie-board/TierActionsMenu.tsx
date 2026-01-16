'use client'

import { MoreVertical, Edit, Trash2 } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface TierActionsMenuProps {
  onRenameTier: () => void
  onDeleteTier: () => void
}

export default function TierActionsMenu({
  onRenameTier,
  onDeleteTier,
}: TierActionsMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="text-white hover:text-gray-200 transition-colors p-1"
          onClick={(e) => e.stopPropagation()}
        >
          <MoreVertical className="w-5 h-5" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation()
            onRenameTier()
          }}
          className="cursor-pointer"
        >
          <Edit className="mr-2 h-4 w-4" />
          <span>Rename Tier</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation()
            onDeleteTier()
          }}
          className="cursor-pointer text-red-600 dark:text-red-400"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          <span>Delete Tier</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
