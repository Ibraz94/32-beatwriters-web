'use client'

import { Bet } from '@/lib/services/bettingApi'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import { Check, Clock, X } from 'lucide-react'

interface BetCardProps {
  bet: Bet
}

export default function BetCard({ bet }: BetCardProps) {
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
        'flex flex-row items-start gap-3 md:gap-4 border-b dark:border-gray-700 pb-4 rounded-t-lg p-2 relative',
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




      {/* Player Image (Left Side) */}
      {bet.player && (
        <div className="flex-shrink-0">
          <div className="relative w-12 h-12 md:w-16 md:h-16 rounded-2xl md:rounded-3xl overflow-hidden">
            <Image
              src={bet.player.headshotPic || '/default-player.jpg'}
              alt={bet.player.name}
              fill
              className="object-cover"
              loader={({ src }) => src}
            />
          </div>
        </div>
      )}

      {/* Player Details */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            {/* Team Logo & Player Name & All Bet Details */}
            {bet.player && (
              <div>
                {/* First Line: Team Logo, Player Name, Best Bet */}
                <div className="flex items-center gap-2 mb-1 md:mb-0">
                  {/* Team Logo */}
                  {bet.player.teamDetails?.logo && (
                    <div className="relative w-6 h-6 md:w-8 md:h-8 flex-shrink-0">
                      <Image
                        src={bet.player.teamDetails.logo}
                        alt={bet.player.teamDetails.name}
                        fill
                        className="object-contain"
                        loader={({ src }) => src}
                      />
                    </div>
                  )}

                  {/* Player Name */}
                  <h2 className="text-lg sm:text-xl md:text-2xl font-bold">
                    {bet.player.name}
                  </h2>

                  {/* Best Bet Indicator - Always reserve space */}
                  <span className="text-[#E64A30] font-bold text-lg md:text-xl flex-shrink-0 w-6 md:w-7 inline-block text-center">
                    {bet.isBestBet ? '🔥' : ''}
                  </span>

                  {/* Bet Details - Desktop inline */}
                  <div className="hidden md:flex md:flex-wrap md:items-center md:gap-x-2 text-xs md:text-sm">
                    {/* Line */}
                    {bet.line && (
                      <>
                        <span className="font-semibold text-2xl text-foreground">{bet.line}</span>
                      </>
                    )}

                    {/* Category */}
                    {bet.category && (
                      <>
                        <span className="font-semibold text-2xl text-foreground">{bet.category}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Second Line: Bet Details - Mobile only */}
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs md:hidden text-muted-foreground mt-1">
                  {/* Line */}
                  {bet.line && (
                    <>
                      <span className="font-semibold text-foreground">{bet.line}</span>
                    </>
                  )}

                  {/* Category */}
                  {bet.category && (
                    <>
                      <span className="font-semibold text-foreground">{bet.category}</span>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Analysis */}
        {bet.analysis && (
          <div className="mt-4 p-4 bg-gray-50 dark:bg-[#262829] rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-semibold mb-2 text-[#E64A30]">Analysis</h3>
            <p className="text-sm dark:text-[#D2D6E2] leading-relaxed">
              {bet.analysis}
            </p>
          </div>
        )}

        {/* Footer - Week and Date */}
        <div className="mt-3 flex items-center gap-3 text-xs md:text-sm text-muted-foreground">
          {/* {bet.week && (
            <>
              <span className="font-semibold">{bet.week}</span>
              <span>•</span>
            </>
          )} */}
          {bet.date && (
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3 md:w-4 md:h-4" />
              <span>{formatDate(bet.date)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
