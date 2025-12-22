'use client'

import { useState, useMemo } from 'react'
import { useGetBetsByWeekQuery } from '@/lib/services/bettingApi'
import WeekSelector from '@/app/components/betting/WeekSelector'
import FastDraftSection from '@/app/components/betting/FastDraftSection'
import BetCard from '@/app/components/betting/BetCard'
import BetsFilter from '@/app/components/betting/BetsFilter'
import WeeklyStats from '@/app/components/betting/WeeklyStats'
import { Loader2 } from 'lucide-react'

export default function BettingPage() {
  const [selectedWeek, setSelectedWeek] = useState('Week 15')
  const [showBestBets, setShowBestBets] = useState(false)
  const [showFastDraft, setShowFastDraft] = useState(false)
  const [resultFilter, setResultFilter] = useState('all')

  const { data, isLoading, error } = useGetBetsByWeekQuery({
    week: selectedWeek,
  })

  const { fastDraftBets, regularBets, filteredRegularBets } = useMemo(() => {
    if (!data?.data?.bets) {
      return { fastDraftBets: [], regularBets: [], filteredRegularBets: [] }
    }

    const allBets = data.data.bets
    const fastDraft = allBets.filter((b) => b.isPinned || b.isFastDraft)
    const regular = allBets.filter((b) => !b.isPinned && !b.isFastDraft)

    let filtered = regular

    if (showBestBets) {
      filtered = filtered.filter((b) => b.isBestBet)
    }

    if (showFastDraft) {
      filtered = filtered.filter((b) => b.isFastDraft)
    }

    if (resultFilter !== 'all') {
      if (resultFilter === 'pending') {
        filtered = filtered.filter((b) => !b.result)
      } else {
        filtered = filtered.filter((b) => b.result === resultFilter)
      }
    }

    return { fastDraftBets: fastDraft, regularBets: regular, filteredRegularBets: filtered }
  }, [data, showBestBets, showFastDraft, resultFilter])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <h1 className="text-4xl font-bold text-center mb-2">Weekly Betting Picks</h1>
        <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
          Expert NFL betting picks with detailed analysis
        </p>

        <WeekSelector selectedWeek={selectedWeek} onChange={setSelectedWeek} />

        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
            <span className="ml-3 text-lg">Loading picks...</span>
          </div>
        )}

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
            <p className="text-red-600 dark:text-red-400 font-semibold mb-2">
              Unable to load betting picks
            </p>
            <p className="text-sm text-red-500 dark:text-red-300">
              Please try again later or contact support if the problem persists.
            </p>
          </div>
        )}

        {!isLoading && !error && data && (
          <>
            <WeeklyStats bets={[...fastDraftBets, ...regularBets]} />

            <FastDraftSection bets={fastDraftBets} />

            <section>
              <h2 className="text-2xl font-bold mb-4">Our Picks</h2>

              <BetsFilter
                showBestBets={showBestBets}
                onBestBetsChange={setShowBestBets}
                resultFilter={resultFilter}
                onResultFilterChange={setResultFilter}
                showFastDraft={showFastDraft}
                onFastDraftChange={setShowFastDraft}
              />

              {filteredRegularBets.length === 0 ? (
                <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-12 text-center">
                  <p className="text-gray-600 dark:text-gray-400 text-lg">
                    No picks available for this week yet.
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                    Check back soon for our expert analysis and picks!
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredRegularBets.map((bet) => (
                    <BetCard key={bet.id} bet={bet} />
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  )
}
