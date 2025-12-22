'use client'

import { Bet } from '@/lib/services/bettingApi'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import Image from 'next/image'

interface BetCardProps {
  bet: Bet
}

export default function BetCard({ bet }: BetCardProps) {
  const getResultBadge = () => {
    if (bet.result === 'WIN') {
      return <span className="text-green-600 dark:text-green-400 font-semibold">✅ WIN</span>
    }
    if (bet.result === 'LOSS') {
      return <span className="text-red-600 dark:text-red-400 font-semibold">❌ LOSS</span>
    }
    return <span className="text-yellow-600 dark:text-yellow-400 font-semibold">⏳ Pending</span>
  }

  const formatDate = (date?: Date) => {
    if (!date) return null
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  return (
    <Card
      className={cn(
        'hover:shadow-lg transition-shadow',
        bet.isFastDraft && 'border-orange-500 dark:border-orange-400 border-2'
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            {bet.isBestBet && (
              <span className="text-orange-500 dark:text-orange-400 font-bold">🔥</span>
            )}
            <span className="font-semibold text-sm">{bet.betType || 'Single'}</span>
            {bet.isFastDraft && (
              <span className="text-xs bg-orange-500 text-white px-2 py-1 rounded-full">
                ⚡ FastDraft
              </span>
            )}
          </div>
          <div>{getResultBadge()}</div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {bet.player && (
          <div className="flex items-center gap-3">
            <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800">
              <Image
                src={bet.player.headshotPic || '/default-player.jpg'}
                alt={bet.player.name}
                fill
                className="object-cover"
                sizes="48px"
              />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-base">{bet.player.name}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {bet.player.position} - {bet.player.team}
              </p>
            </div>
            {bet.player.teamDetails?.logo && (
              <div className="relative w-8 h-8">
                <Image
                  src={bet.player.teamDetails.logo}
                  alt={bet.player.teamDetails.name}
                  fill
                  className="object-contain"
                  sizes="32px"
                />
              </div>
            )}
          </div>
        )}

        <div className="space-y-2">
          {bet.category && (
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {bet.category}
            </div>
          )}
          {bet.line && (
            <div className="text-base font-semibold">{bet.line}</div>
          )}
          {(bet.odds || bet.totalWager) && (
            <div className="flex gap-4 text-sm text-gray-600 dark:text-gray-400">
              {bet.odds && <span>Odds: {bet.odds}</span>}
              {bet.totalWager && <span>Wager: ${bet.totalWager}</span>}
            </div>
          )}
        </div>

        {bet.analysis && (
          <div className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg">
            <p>{bet.analysis}</p>
          </div>
        )}

        <div className="flex gap-3 text-xs text-gray-500 dark:text-gray-400 pt-2 border-t">
          {bet.week && <span>{bet.week}</span>}
          {bet.date && <span>{formatDate(bet.date)}</span>}
        </div>
      </CardContent>
    </Card>
  )
}
