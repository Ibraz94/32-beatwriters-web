import { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { RookiePlayer, TierHeading } from '@/lib/services/rookieBoardApi'
import { useGetTeamsQuery, getTeamLogoUrl } from '@/lib/services/teamsApi'
import PlayerActionsMenu from './PlayerActionsMenu'
import NoteModal from './NoteModal'
import TierSelectionModal from './TierSelectionModal'
import { ChevronDown, ChevronUp, GripVertical } from 'lucide-react'

interface SortablePlayerCardProps {
  player: RookiePlayer
  note?: string
  tiers: TierHeading[]
  isSaving?: boolean
  onSaveNote: (playerId: number, content: string) => Promise<void>
  onDeleteNote?: (playerId: number) => Promise<void>
  onCreateTier: (name: string, position: number) => Promise<void>
  onAssignToTier: (playerId: number, tierId: string) => void
}

export default function SortablePlayerCard({
  player,
  note,
  tiers,
  isSaving = false,
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
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `player-${player.id}` })

  const { data: teamsData } = useGetTeamsQuery()
  const playerTeam = teamsData?.teams.find(
    (team) => team.abbreviation === player.team || team.name === player.team
  )
  const teamLogoUrl = playerTeam ? getTeamLogoUrl(playerTeam.logo) : undefined

  // Check if there's any expandable content
  const hasExpandableContent = !!(player.analysisSection || player.fantasyOutlook || note)

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? 'none' : transition,
  }

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        className={`bg-white dark:bg-[#262829] rounded-xl border-2 border-gray-200 dark:border-gray-700 transition-opacity ${
          isDragging ? 'opacity-50 z-50 scale-105' : isSaving ? 'opacity-40' : ''
        }`}
      >
        <div className="min-h-12 px-2 sm:px-4 py-2 flex items-center gap-2 sm:gap-3">
          {/* Mobile Drag Handle - Only visible on mobile */}
          <button
            ref={setActivatorNodeRef}
            {...listeners}
            className="md:hidden text-gray-400 hover:text-[#E64A30] transition-colors cursor-grab active:cursor-grabbing flex-shrink-0 touch-none"
            aria-label="Drag to reorder"
          >
            <GripVertical size={20} />
          </button>

          {/* Desktop Drag Area - Entire card draggable on desktop */}
          <div 
            {...(typeof window !== 'undefined' && window.innerWidth >= 768 ? listeners : {})}
            className="hidden md:flex items-center gap-3 flex-1 cursor-grab active:cursor-grabbing"
          >
            {/* Rank */}
            <div className="text-xl font-bold text-[#E64A30] flex-shrink-0">
              {player.rank}
            </div>

            {/* Player Image */}
            <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden flex-shrink-0">
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
            <div className="flex items-center gap-4 md:gap-8 flex-1 min-w-0">
              <button
                className="font-semibold text-base md:text-lg text-[#1D212D] dark:text-white hover:text-[#E64A30] transition-colors cursor-pointer truncate"
                onClick={(e) => {
                  e.stopPropagation()
                  router.push(`/players/${player.id}`)
                }}
                onPointerDown={(e) => e.stopPropagation()}
              >
                {player.name}
              </button>
              <span className="font-semibold text-base md:text-lg text-gray-600 dark:text-white flex-shrink-0">{player.position}</span>
              {player.team ? (
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {teamLogoUrl && (
                    <Image
                      src={teamLogoUrl}
                      alt={player.team}
                      width={32}
                      height={32}
                      className="object-contain w-8 h-8"
                      loader={({ src }) => src}
                    />
                  )}
                </div>
              ) : (
                <span className="text-sm text-gray-400 flex-shrink-0">N/A</span>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {hasExpandableContent && (
                <button
                  className="text-gray-600 dark:text-gray-400 hover:text-[#E64A30] transition-colors p-1 cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowDetails(!showDetails)
                  }}
                  onPointerDown={(e) => e.stopPropagation()}
                >
                  {showDetails ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>
              )}
              <div onPointerDown={(e) => e.stopPropagation()}>
                <PlayerActionsMenu
                  onAddNote={() => setIsNoteModalOpen(true)}
                  onAddTier={() => setIsTierModalOpen(true)}
                  hasNote={!!note}
                />
              </div>
            </div>
          </div>

          {/* Mobile Content - Separate from drag area */}
          <div className="md:hidden flex items-center gap-2 flex-1 min-w-0">
            {/* Rank */}
            <div className="text-lg font-bold text-[#E64A30] flex-shrink-0 w-6">
              {player.rank}
            </div>

            {/* Player Image */}
            <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden flex-shrink-0">
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
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <button
                className="font-semibold text-sm text-[#1D212D] dark:text-white hover:text-[#E64A30] transition-colors cursor-pointer truncate"
                onClick={(e) => {
                  e.stopPropagation()
                  router.push(`/players/${player.id}`)
                }}
              >
                {player.name}
              </button>
              <span className="font-semibold text-sm text-gray-600 dark:text-white flex-shrink-0">{player.position}</span>
              {player.team && teamLogoUrl && (
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <Image
                    src={teamLogoUrl}
                    alt={player.team}
                    width={24}
                    height={24}
                    className="object-contain w-6 h-6"
                    loader={({ src }) => src}
                  />
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 flex-shrink-0">
              {hasExpandableContent && (
                <button
                  className="text-gray-600 dark:text-gray-400 hover:text-[#E64A30] transition-colors p-1 cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowDetails(!showDetails)
                  }}
                >
                  {showDetails ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>
              )}
              <PlayerActionsMenu
                onAddNote={() => setIsNoteModalOpen(true)}
                onAddTier={() => setIsTierModalOpen(true)}
                hasNote={!!note}
              />
            </div>
          </div>
        </div>

        {/* Expandable Details */}
        {showDetails && (
          <div className="px-2 sm:px-4 pb-3 sm:pb-4 pt-2 border-t border-gray-200 dark:border-gray-700 space-y-2 sm:space-y-3">
            {player.analysisSection && (
              <div>
                <h4 className="font-semibold text-[#1D212D] dark:text-white mb-1 text-xs sm:text-sm">
                  Analysis
                </h4>
                <p className="text-xs text-gray-700 dark:text-gray-300">
                  {player.analysisSection}
                </p>
              </div>
            )}

            {player.fantasyOutlook && (
              <div className='p-2 sm:p-3 bg-gray-50 dark:bg-gray-900/20 rounded-lg border border-gray-200 dark:border-yellow-800'>
                <h4 className="font-semibold text-[#1D212D] dark:text-white mb-1 text-xs sm:text-sm">
                  Fantasy Outlook
                </h4>
                <div
                  className="text-xs text-gray-700 dark:text-gray-300"
                  dangerouslySetInnerHTML={{ __html: player.fantasyOutlook }}
                />
              </div>
            )}
            {note && (
              <div className="p-2 sm:p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <h4 className="font-semibold text-[#1D212D] dark:text-white mb-1 flex items-center gap-1 text-xs sm:text-sm">
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
