'use client'

import { Bet } from '@/lib/services/bettingApi'
import { Card, CardContent } from '@/components/ui/card'

interface WeeklyStatsProps {
  bets: Bet[]
}

export default function WeeklyStats({ bets }: WeeklyStatsProps) {
  const total = bets.length
  const wins = bets.filter((b) => b.result === 'WIN').length
  const losses = bets.filter((b) => b.result === 'LOSS').length
  const pending = bets.filter((b) => !b.result).length
  const winRate = total > 0 ? ((wins / (wins + losses)) * 100).toFixed(1) : '0.0'
  const totalWagered = bets.reduce((sum, bet) => {
    return sum + (bet.totalWager ? parseFloat(bet.totalWager) : 0)
  }, 0)

  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{total}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Bets</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{wins}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Wins</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {winRate}%
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Win Rate</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              ${totalWagered.toFixed(0)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Wagered</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
