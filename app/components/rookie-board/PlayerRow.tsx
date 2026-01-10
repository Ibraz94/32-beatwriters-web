import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical } from 'lucide-react'
import { RookiePlayer, TierHeading } from '@/lib/services/rookieBoardApi'
import { useGetTeamsQuery, getTeamLogoUrl } from '@/lib/services/teamsApi'
import PlayerActionsMenu from './PlayerActionsMenu'
import NoteModal from './NoteModal'
import TierSelectionModal from './TierSelectionModal'

interface PlayerRowProps {
  player: RookiePlayer
  note?: string
  tiers: TierHeading[]
  onSaveNote: (playerId: number, content: string) => Promise<void>
  onDeleteNote?: (playerId: number) => Promise<void>
  onCreateTier: (name: string, position: number) => Promise<void>
  onAssignToTier: (playerId: number, tierId: string) => void
  isDragging?: boolean
  sortableRef?: (node: HTMLElement | null) => void
  sortableAttributes?: any
  sortableListeners?: any
  sortableTransform?: any
  sortableTransition?: string
  sortableStyle?: React.CSSProperties
}

export default function PlayerRow({
  player,
  note,
  tiers,
  onSaveNote,
  onDeleteNote,
  onCreateTier,
  onAssignToTier,
  isDragging = false,
  sortableRef,
  sortableAttributes,
  sortableListeners,
  sortableTransform,
  sortableTransition,
  sortableStyle,
}: PlayerRowProps) {
  const router = useRouter()
  const [showDetails, setShowDetails] = useState(false)
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false)
  const [isTierModalOpen, setIsTierModalOpen] = useState(false)
  const [isHovering, setIsHovering] = useState(false)

  // Fetch teams data for logos
  const { data: teamsData } = useGetTeamsQuery()
  const playerTeam = teamsData?.teams.find(
    (team) => team.abbreviation === player.team || team.name === player.team
  )
  const teamLogoUrl = playerTeam ? getTeamLogoUrl(playerTeam.logo) : undefined

  const handlePlayerClick = (e: React.MouseEvent) => {
    // Only navigate if clicking on the player name, not the whole row
    if ((e.target as HTMLElement).closest('.player-name-link')) {
      router.push(`/players/${player.playerId}`)
    }
  }

  const handleAddNote = () => {
    setIsNoteModalOpen(true)
  }

  const handleAddTier = () => {
    setIsTierModalOpen(true)
  }

  const handleAssignToTier = (tierId: string) => {
    onAssignToTier(player.id, tierId)
  }

  // Prevent drag on interactive elements
  const handlePointerDown = (e: React.PointerEvent) => {
    const target = e.target as HTMLElement
    // Prevent drag if clicking on buttons, links, or inputs
    if (
      target.closest('button') ||
      target.closest('a') ||
      target.closest('input') ||
      target.closest('.player-name-link')
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
      className={`bg-white dark:bg-[#262829] rounded-xl border-2 border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow ${
        isDragging ? 'opacity-40' : ''
      }`}
    >
      <div className="p-4" {...sortableListeners} style={{ cursor: 'move' }}>
        <div className="flex items-start gap-3">
          {/* Rank and Drag Handle */}
          <div className="flex flex-col items-center gap-1 flex-shrink-0">
            <GripVertical 
              className={`w-5 h-5 text-gray-400 transition-opacity ${
                isHovering ? 'opacity-100' : 'opacity-70'
              }`}
            />
            <div className="text-lg font-bold text-[#E64A30] dark:text-[#E64A30]">
              {player.rank}
            </div>
          </div>

          {/* Player Image */}
          <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden flex-shrink-0">
            {player.headshotPic && (
              <img 
                src={player.headshotPic} 
                alt={player.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.style.display = 'none'
                }}
              />
            )}
          </div>

          {/* Player Info */}
          <div className="flex-1 min-w-0" style={{ cursor: 'auto' }}>
            <button
              className="player-name-link font-semibold text-lg text-[#1D212D] dark:text-white hover:text-[#E64A30] dark:hover:text-[#E64A30] transition-colors text-left underline decoration-transparent hover:decoration-[#E64A30] underline-offset-2 cursor-pointer block truncate"
              onClick={handlePlayerClick}
              onPointerDown={(e) => e.stopPropagation()}
            >
              {player.name}
            </button>
            <div className="flex items-center gap-2 mt-1 text-sm text-gray-600 dark:text-gray-400">
              <span className="font-medium">{player.position}</span>
              {player.team && (
                <>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    {teamLogoUrl && (
                      <Image
                        src={teamLogoUrl}
                        alt={player.team}
                        width={16}
                        height={16}
                        className="object-contain"
                        loader={({ src }) => src}
                      />
                    )}
                    <span>{player.team}</span>
                  </div>
                </>
              )}
              {!player.team && (
                <>
                  <span>•</span>
                  <span className="text-gray-400 dark:text-gray-500">N/A</span>
                </>
              )}
              {player.adp && (
                <>
                  <span>•</span>
                  <span>ADP: {player.adp.toFixed(1)}</span>
                </>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-start gap-2 flex-shrink-0" style={{ cursor: 'auto' }}>
            <button 
              className="text-gray-600 dark:text-gray-400 hover:text-[#E64A30] dark:hover:text-[#E64A30] transition-colors p-1 cursor-pointer"
              onClick={() => setShowDetails(!showDetails)}
              onPointerDown={(e) => e.stopPropagation()}
            >
              {showDetails ? '▲' : '▼'}
            </button>
            <div onPointerDown={(e) => e.stopPropagation()}>
              <PlayerActionsMenu
                onAddNote={handleAddNote}
                onAddTier={handleAddTier}
              />
            </div>
          </div>
        </div>

        {/* Expandable Details */}
        {showDetails && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
            {/* Analysis Section */}
            {player.analysisSection && (
              <div>
                <h4 className="font-semibold text-[#1D212D] dark:text-white mb-1 text-sm">
                  Analysis
                </h4>
                <p className="text-xs text-gray-700 dark:text-gray-300">
                  {player.analysisSection}
                </p>
              </div>
            )}
            
            {/* Fantasy Outlook */}
            {player.fantasyOutlook && (
              <div>
                <h4 className="font-semibold text-[#1D212D] dark:text-white mb-1 text-sm">
                  Fantasy Outlook
                </h4>
                <div 
                  className="text-xs text-gray-700 dark:text-gray-300"
                  dangerouslySetInnerHTML={{ __html: player.fantasyOutlook }}
                />
              </div>
            )}
            
            {/* Player Details */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-gray-600 dark:text-gray-400">Height:</span>
                <span className="ml-1 text-[#1D212D] dark:text-white font-medium">
                  {player.height}
                </span>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Weight:</span>
                <span className="ml-1 text-[#1D212D] dark:text-white font-medium">
                  {player.weight} lbs
                </span>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">College:</span>
                <span className="ml-1 text-[#1D212D] dark:text-white font-medium">
                  {player.college}
                </span>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Draft:</span>
                <span className="ml-1 text-[#1D212D] dark:text-white font-medium">
                  {player.draftPick}
                </span>
              </div>
            </div>
            
            {/* User Note */}
            {note && (
              <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <h4 className="font-semibold text-[#1D212D] dark:text-white mb-1 flex items-center gap-1 text-sm">
                  <span>📝</span> Your Note
                </h4>
                <p className="text-xs text-gray-700 dark:text-gray-300">
                  {note}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Note Modal */}
      <NoteModal
        isOpen={isNoteModalOpen}
        onClose={() => setIsNoteModalOpen(false)}
        player={player}
        existingNote={note}
        onSave={onSaveNote}
        onDelete={onDeleteNote}
      />

      {/* Tier Selection Modal */}
      <TierSelectionModal
        isOpen={isTierModalOpen}
        onClose={() => setIsTierModalOpen(false)}
        player={player}
        tiers={tiers}
        onCreateTier={onCreateTier}
        onAssignToTier={handleAssignToTier}
      />
    </div>
  )
}
