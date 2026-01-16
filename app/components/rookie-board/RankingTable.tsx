import React from 'react'
import { RookiePlayer, TierHeading as TierHeadingType } from '@/lib/services/rookieBoardApi'
import SortablePlayerCard from './SortablePlayerCard'
import SortableTierCard from './SortableTierCard'

interface RankingTableProps {
  players: RookiePlayer[]
  tiers: TierHeadingType[]
  dragState?: {
    activeId: string | null
    activeItem: RookiePlayer | TierHeadingType | null
    activeType: 'player' | 'tier' | null
  }
  savingPlayerIds?: Set<number>
  onSaveNote: (playerId: number, content: string) => Promise<void>
  onDeleteNote?: (playerId: number) => Promise<void>
  onCreateTier: (name: string, position: number) => Promise<void>
  onAssignToTier: (playerId: number, tierId: string) => void
  onRenameTier?: (tierId: string, newName: string) => Promise<void>
  onDeleteTier?: (tierId: string) => Promise<void>
}

export default function RankingTable({ 
  players, 
  tiers, 
  dragState,
  savingPlayerIds = new Set(),
  onSaveNote,
  onDeleteNote,
  onCreateTier,
  onAssignToTier,
  onRenameTier,
  onDeleteTier,
}: RankingTableProps) {
  // Combine players and tiers into a single sorted list
  const renderItems = () => {
    const items: React.ReactElement[] = []
    const sortedTiers = [...tiers].sort((a, b) => a.position - b.position)
    
    let tierIndex = 0
    
    players.forEach((player) => {
      // Insert any tiers that should appear before this player
      while (
        tierIndex < sortedTiers.length && 
        sortedTiers[tierIndex].position <= player.rank
      ) {
        const tier = sortedTiers[tierIndex]
        
        items.push(
          <SortableTierCard
            key={`tier-${tier.id}`}
            tier={tier}
            onRenameTier={onRenameTier}
            onDeleteTier={onDeleteTier}
          />
        )
        tierIndex++
      }
      
      // Insert the player card
      items.push(
        <SortablePlayerCard
          key={`player-${player.id}`}
          player={player}
          note={player.note}  // Note is now embedded in player object
          tiers={tiers}
          isSaving={savingPlayerIds.has(player.id)}
          onSaveNote={onSaveNote}
          onDeleteNote={onDeleteNote}
          onCreateTier={onCreateTier}
          onAssignToTier={onAssignToTier}
        />
      )
    })
    
    // Insert any remaining tiers after all players
    while (tierIndex < sortedTiers.length) {
      const tier = sortedTiers[tierIndex]
      
      items.push(
        <SortableTierCard
          key={`tier-${tier.id}`}
          tier={tier}
          onRenameTier={onRenameTier}
          onDeleteTier={onDeleteTier}
        />
      )
      tierIndex++
    }
    
    return items
  }

  return (
    <div className="space-y-3 p-4">
      {players.length === 0 ? (
        <div className="p-12 text-center text-gray-600 dark:text-[#C7C8CB]">
          No players available
        </div>
      ) : (
        renderItems()
      )}
    </div>
  )
}
