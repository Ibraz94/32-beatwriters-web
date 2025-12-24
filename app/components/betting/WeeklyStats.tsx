'use client'

import { Bet } from '@/lib/services/bettingApi'

interface WeeklyStatsProps {
  bets: Bet[]
}

export default function WeeklyStats({ bets }: WeeklyStatsProps) {
  const total = bets.length
  const wins = bets.filter((b) => b.result === 'WIN').length
  const losses = bets.filter((b) => b.result === 'LOSS').length
  const pending = bets.filter((b) => !b.result).length
  const winRate = total > 0 && (wins + losses) > 0 ? ((wins / (wins + losses)) * 100).toFixed(1) : '0.0'
  const totalWagered = bets.reduce((sum, bet) => {
    return sum + (bet.totalWager ? parseFloat(bet.totalWager) : 0)
  }, 0)

  return (
    <div className="bg-[var(--trending-background-color)] rounded-2xl py-4 px-2 dark:bg-[var(--dark-theme-color)]">
      {/* Header */}
      <div className="h-14 flex items-center justify-center">
        <h2 className="text-black font-semibold text-center text-2xl tracking-wider dark:text-white">
          Weekly Stats
        </h2>
      </div>

      {/* Stats Grid */}
      <div className="space-y-3 p-3">
        {/* Total Bets */}
        <div className="flex items-center justify-between p-3 bg-[var(--light-trending-background-color)] rounded-2xl dark:bg-[#1A1A1A]">
          <span className="text-sm text-gray-600 dark:text-gray-400">Total Bets</span>
          <span className="text-2xl font-bold text-gray-900 dark:text-white">{total}</span>
        </div>

        {/* Wins */}
        <div className="flex items-center justify-between p-3 bg-[var(--light-trending-background-color)] rounded-2xl dark:bg-[#1A1A1A]">
          <span className="text-sm text-gray-600 dark:text-gray-400">Wins</span>
          <span className="text-2xl font-bold text-green-600 dark:text-green-400">{wins}</span>
        </div>

        {/* Losses */}
        <div className="flex items-center justify-between p-3 bg-[var(--light-trending-background-color)] rounded-2xl dark:bg-[#1A1A1A]">
          <span className="text-sm text-gray-600 dark:text-gray-400">Losses</span>
          <span className="text-2xl font-bold text-red-600 dark:text-red-400">{losses}</span>
        </div>

        {/* Pending */}
        <div className="flex items-center justify-between p-3 bg-[var(--light-trending-background-color)] rounded-2xl dark:bg-[#1A1A1A]">
          <span className="text-sm text-gray-600 dark:text-gray-400">Pending</span>
          <span className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{pending}</span>
        </div>

        {/* Win Rate */}
        <div className="flex items-center justify-between p-3 bg-[var(--light-trending-background-color)] rounded-2xl dark:bg-[#1A1A1A]">
          <span className="text-sm text-gray-600 dark:text-gray-400">Win Rate</span>
          <span className="text-2xl font-bold text-gray-900 dark:text-white">{winRate}%</span>
        </div>

        {/* Total Wagered */}
        <div className="flex items-center justify-between p-3 bg-[var(--light-trending-background-color)] rounded-2xl dark:bg-[#1A1A1A]">
          <span className="text-sm text-gray-600 dark:text-gray-400">Total Wagered</span>
          <span className="text-2xl font-bold text-gray-900 dark:text-white">${totalWagered.toFixed(0)}</span>
        </div>
      </div>
    </div>
  )
}
