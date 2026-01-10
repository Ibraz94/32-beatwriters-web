import React, { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { GripVertical } from 'lucide-react'
import { RookiePlayer, TierHeading } from '@/lib/services/rookieBoardApi'
import { useGetTeamsQuery, getTeamLogoUrl } from '@/lib/services/teamsApi'
import PlayerActionsMenu from './PlayerActionsMenu'
import NoteModal from './NoteModal'
import TierSelectionModal from './TierSelectionModal'

interface SortablePlayerCardProps {
  player: RookiePlayer
  note?: string
  tiers: TierHeading[]
  onSaveNote: (playerId: number, content: string) => Promise<void>
  onDeleteNote?: (playerId: number) => Promise<void>
  onCreateTier: (name: string, position: number) => Promise<void>
  onAssignToTier: (playerId: number, tierId: string) => void
}

export default function SortablePlayerCard({
  player,
  note,
  tiers,
  onSaveNote,
  onDeleteNote,
  onCreateTier,
  onAssignToTier,
}: SortablePlayerCardProps) {
  const router = useRouter()
  const [showDetails, setShowDetails] = useState(false)
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false)
  const [isTierModalOpen, setIsTierModalOpen] = useState(false)

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `player-${player.id}` })

  const { data: teamsData } = useGetTeamsQuery()
  const playerTeam = teamsData?.teams.find(
    (team) => team.abbreviation === player.team || team.name === player.team
  )
  const teamLogoUrl = playerTeam ? getTeamLogoUrl(playerTeam.logo) : undefined

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className={`bg-white dark:bg-[#262829] rounded-xl border-2 border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing ${isDragging ? 'opacity-50 z-50' : ''
          }`}
      >
        <div className="p-4">
          <div className="flex items-start gap-3">
            {/* Rank and Drag Handle */}
            <div className="flex flex-col items-center gap-1 flex-shrink-0">
              <div className="text-lg font-bold text-[#E64A30] mt-4">
                {player.rank}
              </div>
            </div>

            {/* Player Image */}
            <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden flex-shrink-0">
              {player.headshotPic && (
                <img
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
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  className="font-semibold text-lg text-[#1D212D] dark:text-white hover:text-[#E64A30] transition-colors cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation()
                    router.push(`/players/${player.playerId}`)
                  }}
                  onPointerDown={(e) => e.stopPropagation()}
                >
                  {player.name}
                </button>
                <span className="text-gray-400">•</span>
                <span className="font-medium text-sm text-gray-600 dark:text-gray-400">{player.position}</span>
                {player.team ? (
                  <>
                    <span className="text-gray-400">•</span>
                    <div className="flex items-center gap-1.5">
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
                      <span className="text-sm text-gray-600 dark:text-gray-400">{player.team}</span>
                    </div>
                  </>
                ) : (
                  <>
                    <span className="text-gray-400">•</span>
                    <span className="text-sm text-gray-400">N/A</span>
                  </>
                )}
                {player.adp && (
                  <>
                    <span className="text-gray-400">•</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">ADP: {player.adp.toFixed(1)}</span>
                  </>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-start gap-2 flex-shrink-0">
              <button
                className="text-gray-600 dark:text-gray-400 hover:text-[#E64A30] transition-colors p-1 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation()
                  setShowDetails(!showDetails)
                }}
                onPointerDown={(e) => e.stopPropagation()}
              >
                {showDetails ? '▲' : '▼'}
              </button>
              <div onPointerDown={(e) => e.stopPropagation()}>
                <PlayerActionsMenu
                  onAddNote={() => setIsNoteModalOpen(true)}
                  onAddTier={() => setIsTierModalOpen(true)}
                />
              </div>
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
                <div className='p-3 bg-gray-50 dark:bg-gray-900/20 rounded-lg border border-gray-200 dark:border-yellow-800'>
                  <h4 className="font-semibold text-[#1D212D] dark:text-white mb-1 text-sm">
                    Fantasy Outlook
                  </h4>
                  <div
                    className="text-xs text-gray-700 dark:text-gray-300"
                    dangerouslySetInnerHTML={{ __html: player.fantasyOutlook }}
                  />
                </div>
              )}
              {note && (
                <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <h4 className="font-semibold text-[#1D212D] dark:text-white mb-1 flex items-center gap-1 text-sm">
                    Your Note
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
