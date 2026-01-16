'use client'

import { Bet } from '@/lib/services/bettingApi'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import { Check, Clock, X } from 'lucide-react'

interface BetCardProps {
  bet: Bet
}

export default function BetCard({ bet }: BetCardProps) {
  // Extract betPlayers with their individual line and category
  const betPlayersData = bet.betPlayers && bet.betPlayers.length > 0
    ? bet.betPlayers
    : bet.player ? [{ playerId: bet.player.id, player: bet.player, line: bet.line, category: bet.category }] : []

  const formatDate = (date?: Date) => {
    if (!date) return null
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  return (
    <div
      className={cn(
        'flex flex-col gap-3 border-b dark:border-gray-700 pb-4 rounded-t-lg p-2 relative',
        bet.isFastDraft && 'bg-none'
      )}
    >
      {/* WIN/LOSS Badge (Top Right) */}
      {bet.result && (
        <div className="absolute top-2 right-2">
          {bet.result === 'WIN' ? (
            <div className="bg-green-700 text-white p-1 rounded-md">
              <Check className="w-4 h-4 md:w-5 md:h-5" strokeWidth={3}/>
            </div>
          ) : (
            <div className="bg-red-700 text-white p-1 rounded-md">
              <X className="w-4 h-4 md:w-5 md:h-5"  strokeWidth={3}/>
            </div>
          )}
        </div>
      )}

      {/* Odds and Wager Badges - Stack vertically on mobile, horizontal on desktop */}
      <div className="absolute top-2 right-12 md:right-28 flex flex-col md:flex-row gap-1 md:gap-2 items-end md:items-center">
        {bet.odds && (
          <span className="bg-[#E64A30] text-white px-2 py-0.5 md:px-3 md:py-2 rounded-lg md:rounded-xl text-[10px] md:text-sm font-semibold whitespace-nowrap">
            <span className='font-normal'>ODDS:</span> {bet.odds}
          </span>
        )}
        {bet.totalWager && (
          <span className="bg-[#E64A30] text-white px-2 py-0.5 md:px-3 md:py-2 rounded-lg md:rounded-xl text-[10px] md:text-sm font-semibold whitespace-nowrap">
            <span className='font-normal'>WAGER:</span> {bet.totalWager}
          </span>
        )}
      </div>

      {/* Each Player Row - Image, Team Logo, Name, Line, Category on one line */}
      {betPlayersData.length > 0 && (
        <div className="flex flex-col gap-2">
          {betPlayersData.map((betPlayer) => (
            <div key={betPlayer.player.id} className="flex items-center gap-2 md:gap-3">
              {/* Player Image */}
              <div className="relative w-12 h-12 md:w-16 md:h-16 rounded-2xl md:rounded-3xl overflow-hidden flex-shrink-0">
                <Image
                  src={betPlayer.player.headshotPic || '/default-player.jpg'}
                  alt={betPlayer.player.name}
                  fill
                  className="object-cover"
                  loader={({ src }) => src}
                />
              </div>

              {/* Team Logo - Always reserve space */}
              <div className="relative w-6 h-6 md:w-8 md:h-8 flex-shrink-0">
                {betPlayer.player.teamDetails?.logo ? (
                  <Image
                    src={betPlayer.player.teamDetails.logo}
                    alt={betPlayer.player.teamDetails.name}
                    fill
                    className="object-contain"
                    loader={({ src }) => src}
                  />
                ) : (
                  <div className="w-full h-full" />
                )}
              </div>

              {/* Player Name, Line, Category - Each player's individual values */}
              <div className="flex flex-col md:flex-row md:flex-wrap md:items-center gap-x-2 flex-1 min-w-0">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold">
                  {betPlayer.player.name}
                </h2>
                {/* Line and Category - Below name on mobile, inline on desktop */}
                <div className="flex flex-wrap items-center gap-x-2">
                  {/* Line - Individual player's line */}
                  {betPlayer.line && (
                    <span className="text-base md:text-2xl md:font-semibold text-foreground">{betPlayer.line}</span>
                  )}
                  {/* Category - Individual player's category */}
                  {betPlayer.category && (
                    <span className="text-base md:text-2xl md:font-semibold text-foreground">{betPlayer.category}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Analysis */}
      {bet.analysis && (
        <div className="p-4 bg-gray-50 dark:bg-[#262829] rounded-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-semibold mb-2 text-[#E64A30]">Analysis</h3>
          <div className="text-sm dark:text-[#D2D6E2] leading-relaxed prose prose-sm max-w-none dark:prose-invert [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-2 [&_li]:my-1 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:my-2"
            dangerouslySetInnerHTML={{ __html: bet.analysis }}
          />
        </div>
      )}

      {/* Footer - Week and Date */}
      <div className="flex items-center gap-3 text-xs md:text-sm">
        {bet.week && (
          <span className="bg-[#E64A30] text-white px-2 py-0.5 md:px-3 md:py-1 rounded-lg md:rounded-xl text-[10px] md:text-sm font-semibold whitespace-nowrap">
            <span className='font-normal'></span> {bet.week}
          </span>
        )}
        {bet.date && (
          <div className="flex items-center gap-1 text-muted-foreground">
            <Clock className="w-3 h-3 md:w-4 md:h-4" />
            <span>{formatDate(bet.date)}</span>
          </div>
        )}
      </div>
    </div>
  )
}
