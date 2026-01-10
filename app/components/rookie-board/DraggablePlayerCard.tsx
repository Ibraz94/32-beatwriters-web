import React, { useState } from 'react'
import { useDraggable, useDroppable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { ChevronDown } from 'lucide-react'
import { RookiePlayer, TierHeading } from '@/lib/services/rookieBoardApi'
import { useGetTeamsQuery, getTeamLogoUrl } from '@/lib/services/teamsApi'
import PlayerActionsMenu from './PlayerActionsMenu'
import NoteModal from './NoteModal'
import TierSelectionModal from './TierSelectionModal'

interface DraggablePlayerCardProps {
  player: RookiePlayer
  note?: string
  tiers: TierHeading[]
  onSaveNote: (playerId: number, content: string) => Promise<void>
  onDeleteNote?: (playerId: number) => Promise<void>
  onCreateTier: (name: string, position: number) => Promise<void>
  onAssignToTier: (playerId: number, tierId: string) => void
  isActive?: boolean
}

export default function DraggablePlayerCard({
  player,
  note,
  tiers,
  onSaveNote,
  onDeleteNote,
  onCreateTier,
  onAssignToTier,
  isActive = false,
}: DraggablePlayerCardProps) {
  const router = useRouter()
  const [showDetails, setShowDetails] = useState(false)
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false)
  const [isTierModalOpen, setIsTierModalOpen] = useState(false)

  const { attributes, listeners, setNodeRef: setDragRef, transform, isDragging } = useDraggable({
    id: `player-${player.id}`,
  })

  const { setNodeRef: setDropRef, isOver } = useDroppable({
    id: `player-${player.id}`,
  })

  const { data: teamsData } = useGetTeamsQuery()
  const playerTeam = teamsData?.teams.find(
    (team) => team.abbreviation === player.team || team.name === player.team
  )
  const teamLogoUrl = playerTeam ? getTeamLogoUrl(playerTeam.logo) : undefined

  const style = {
    transform: CSS.Translate.toString(transform),
  }

  const handlePlayerClick = () => {
    router.push(`/players/${player.playerId}`)
  }

  const setRefs = (element: HTMLDivElement | null) => {
    setDragRef(element)
    setDropRef(element)
  }

  return (
    <>
      <div
        ref={setRefs}
        style={style}
        className={`bg-white dark:bg-[#262829] rounded-xl border-2 transition-all ${
          isDragging ? 'opacity-30 border-[#E64A30]' : isOver ? 'border-[#E64A30] shadow-lg' : 'border-gray-200 dark:border-gray-700'
        } shadow-sm hover:shadow-md`}
      >
        <div className="p-4">
          <div className="flex items-start gap-3">
            {/* Drag Handle */}
            <div 
              {...listeners} 
              {...attributes}
              className="flex flex-col items-center gap-1 flex-shrink-0 cursor-grab active:cursor-grabbing touch-none"
            >
              <div className="text-lg font-bold text-[#E64A30]">
                {player.rank}
              </div>
            </div>

            {/* Player Image */}
            <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden flex-shrink-0">
              {player.headshotPic && (
                <Image 
                  src={player.headshotPic} 
                  alt={player.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none'
                  }}
                />
              )}
            </div>

            {/* Player Info */}
            <div className="flex-1 min-w-0">
              <button
                className="font-semibold text-lg text-[#1D212D] dark:text-white hover:text-[#E64A30] transition-colors text-left block truncate"
                onClick={handlePlayerClick}
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
                    <span className="text-gray-400">N/A</span>
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
            <div className="flex items-start gap-2 flex-shrink-0">
              <button 
                className="text-gray-600 dark:text-gray-400 hover:text-[#E64A30] transition-colors p-1"
                onClick={() => setShowDetails(!showDetails)}
              >
                {showDetails ? '▲' : '▼'}
              </button>
              <PlayerActionsMenu
                onAddNote={() => setIsNoteModalOpen(true)}
                onAddTier={() => setIsTierModalOpen(true)}
              />
            </div>
          </div>

          {/* Expandable Details */}
          {showDetails && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
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
      </div>

      <NoteModal
        isOpen={isNoteModalOpen}
        onClose={() => setIsNoteModalOpen(false)}
        player={player}
        existingNote={note}
        onSave={onSaveNote}
        onDelete={onDeleteNote}
      />

      <TierSelectionModal
        isOpen={isTierModalOpen}
        onClose={() => setIsTierModalOpen(false)}
        player={player}
        tiers={tiers}
        onCreateTier={onCreateTier}
        onAssignToTier={(tierId) => onAssignToTier(player.id, tierId)}
      />
    </>
  )
}
