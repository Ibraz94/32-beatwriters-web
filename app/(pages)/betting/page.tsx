'use client'

import { useState, useMemo } from 'react'
import { useGetBetsByWeekQuery } from '@/lib/services/bettingApi'
import BetCard from '@/app/components/betting/BetCard'
import { Loader2, Filter, Search, Flame, Zap, ExternalLink } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import Image from 'next/image'

export default function BettingPage() {
  const [selectedWeek, setSelectedWeek] = useState('Week 15')
  const [showBestBets, setShowBestBets] = useState(false)
  const [showFastDraft, setShowFastDraft] = useState(false)
  const [resultFilter, setResultFilter] = useState('all')
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [playerSearch, setPlayerSearch] = useState('')

  const { data, isLoading, error } = useGetBetsByWeekQuery({
    week: selectedWeek,
  })

  const { filteredBets, betsByCategory } = useMemo(() => {
    if (!data?.data?.bets) {
      return { filteredBets: [], betsByCategory: {} }
    }

    const bets = data.data.bets
    let filtered = [...bets]

    // Player search filter
    if (playerSearch) {
      filtered = filtered.filter((b) =>
        b.player?.name.toLowerCase().includes(playerSearch.toLowerCase())
      )
    }

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

    // Group bets by category
    const grouped: Record<string, typeof filtered> = {}
    filtered.forEach((bet) => {
      const category = bet.betType || 'Single'
      if (!grouped[category]) {
        grouped[category] = []
      }
      grouped[category].push(bet)
    })

    return { filteredBets: filtered, betsByCategory: grouped }
  }, [data, showBestBets, showFastDraft, resultFilter, playerSearch])

  // Define category order - FastDraft categories first
  const categoryOrder = [
    'FastDraft Pick Six Frenzy',
    'FastDraft SuperSlam',
    'Single',
    'Parlay',
    'Degen Parlay'
  ]

  return (
    <div className="container mx-auto px-3 py-7">
      <div className="relative">
        {/* Header */}
        <div className="mb-6 flex flex-col items-center justify-center">
          <h1 className="text-4xl lg:text-5xl mb-4">Betting Picks</h1>
          <p className="text-lg lg:text-xl text-muted-foreground mb-4">Expert NFL betting analysis and picks</p>
        </div>

        {/* Player Search + Filter Button (Mobile Only) */}
        <div className="flex items-center md:hidden gap-3 w-full mb-5">
          {/* Player Search */}
          <div className="flex-1 h-12 border border-[#C7C8CB] rounded-full px-4 bg-white dark:bg-[#262829]">
            <div className="relative w-full h-full">
              <Search className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search player..."
                value={playerSearch}
                onChange={(e) => setPlayerSearch(e.target.value)}
                className="w-full h-full pl-8 pr-4 bg-transparent placeholder:text-gray-400 focus:outline-none text-base"
              />
            </div>
          </div>

          {/* Mobile Filter Toggle Button */}
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="flex items-center gap-2 px-4 py-2 h-12 border border-[#E64A30] text-[#E64A30] rounded-full dark:border-none dark:bg-[#262829] transition-colors whitespace-nowrap"
          >
            <Filter className="w-5 h-5" />
            <span className="text-sm font-medium">Filters</span>
          </button>
        </div>

        {/* Filters Container */}
        <div className={`mb-6 ${showMobileFilters ? 'block' : 'hidden'} md:block`}>
          <div className="flex flex-col md:flex-row items-center justify-center gap-3">
            {/* Player Search (Desktop) */}
            <div className="hidden md:flex flex-1 w-full max-w-md h-12 border border-[#C7C8CB] rounded-full px-4 bg-white dark:bg-[#262829]">
              <div className="relative w-full h-full">
                <Search className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search player..."
                  value={playerSearch}
                  onChange={(e) => setPlayerSearch(e.target.value)}
                  className="w-full h-full pl-8 pr-4 bg-transparent placeholder:text-gray-400 focus:outline-none text-base"
                />
              </div>
            </div>

            {/* Filter Row (Week, Result, Best Bets, FastDraft, Clear) */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-center gap-3 w-full md:w-auto md:flex-wrap">
              {/* Week Selector */}
              <div className="w-full md:w-auto border border-[#C7C8CB] h-12 rounded-full px-3 bg-white dark:bg-[#262829]">
                <Select value={selectedWeek} onValueChange={setSelectedWeek}>
                  <SelectTrigger className="h-full w-full md:w-32 !border-none !border-0 flex items-center gap-2">
                    <SelectValue placeholder="Select week" />
                  </SelectTrigger>
                  <SelectContent className="border-none bg-white dark:bg-[#262829]">
                    {['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7', 'Week 8', 'Week 9', 'Week 10', 'Week 11', 'Week 12', 'Week 13', 'Week 14', 'Week 15', 'Week 16', 'Week 17', 'Week 18'].map((week) => (
                      <SelectItem key={week} value={week}>
                        {week}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Result Filter */}
              <div className="w-full md:w-auto border border-[#C7C8CB] h-12 rounded-full px-3 bg-white dark:bg-[#262829]">
                <Select value={resultFilter} onValueChange={setResultFilter}>
                  <SelectTrigger className="h-full w-full md:w-40 !border-none !border-0 flex items-center gap-2">
                    <SelectValue placeholder="All Results" />
                  </SelectTrigger>
                  <SelectContent className="border-none bg-white dark:bg-[#262829]">
                    <SelectItem value="all">All Results</SelectItem>
                    <SelectItem value="WIN">Won</SelectItem>
                    <SelectItem value="LOSS">Lost</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Best Bets Checkbox */}
              <div className="w-full md:w-auto border border-[#C7C8CB] h-12 rounded-full flex items-center justify-center gap-2 px-4 bg-white dark:bg-[#262829]">
                <input
                  type="checkbox"
                  id="best-bets-filter"
                  checked={showBestBets}
                  onChange={(e) => setShowBestBets(e.target.checked)}
                  className="w-4 h-4 cursor-pointer"
                />
                <label htmlFor="best-bets-filter" className="text-sm font-medium cursor-pointer flex items-center gap-1 whitespace-nowrap">
                  <Flame className="w-4 h-4 text-[#E64A30]" />
                  Best Bets
                </label>
              </div>

              {/* FastDraft Checkbox */}
              <div className="w-full md:w-auto border border-[#C7C8CB] h-12 rounded-full flex items-center justify-center gap-2 px-4 bg-white dark:bg-[#262829]">
                <input
                  type="checkbox"
                  id="fastdraft-filter"
                  checked={showFastDraft}
                  onChange={(e) => setShowFastDraft(e.target.checked)}
                  className="w-4 h-4 cursor-pointer"
                />
                <label htmlFor="fastdraft-filter" className="text-sm font-medium cursor-pointer flex items-center gap-1 whitespace-nowrap">
                  <Zap className="w-4 h-4 text-[#E64A30]" />
                  FastDraft
                </label>
              </div>

              {/* Clear Filters Button */}
              {(showBestBets || showFastDraft || resultFilter !== 'all' || playerSearch) && (
                <button
                  onClick={() => {
                    setShowBestBets(false)
                    setShowFastDraft(false)
                    setResultFilter('all')
                    setPlayerSearch('')
                  }}
                  className="w-full md:w-auto h-12 whitespace-nowrap flex items-center justify-center gap-2 px-4 text-sm font-medium rounded-full border border-[#E64A30] text-[#E64A30] bg-white dark:!bg-[#262829] hover:bg-[#fff4f2] dark:hover:bg-[#303234] transition-colors dark:border-none hover:cursor-pointer"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-[#E64A30]" />
            <span className="ml-3 text-lg">Loading picks...</span>
          </div>
        )}

        {/* Error State */}
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

        {/* Main Content */}
        {!isLoading && !error && data && (
          <div className="flex gap-4 lg:gap-6 flex-col lg:flex-row min-w-0 mx-auto">
            {/* Main Content Column */}
            <div className="flex-1">
              {/* All Bets Grouped by Category */}
              {filteredBets.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-xl text-gray-600 dark:text-gray-400 mb-4">
                    No picks available for this week yet.
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-500">
                    Check back soon for our expert analysis and picks!
                  </p>
                </div>
              ) : (
                <div className="space-y-8">
                  {categoryOrder.map((category) => {
                    const categoryBets = betsByCategory[category]
                    if (!categoryBets || categoryBets.length === 0) return null

                    // Check if this is a FastDraft category
                    const isFastDraftCategory = category.includes('FastDraft')
                    // Get FastDraft info from first bet in category
                    const firstBet = categoryBets[0]

                    return (
                      <div key={category} className="space-y-4">
                        {/* Category Header */}
                        <div className="border-b-2 border-[#E64A30]">
                          {isFastDraftCategory && firstBet ? (
                            /* FastDraft Header - Logo and Button */
                            <div className="bg-[#d14429]/10 rounded-t-2xl p-2 md:p-2">
                              <div className="flex flex-row items-center justify-between gap-2 md:gap-4">
                                {/* Logo and Info */}
                                <div className="flex-1 min-w-0">
                                  {firstBet.betType && (
                                    <p className="text-lg md:text-2xl font-bold text-[#E64A30] dark:text-[#E64A30] mt-4">
                                      {firstBet.betType}
                                    </p>
                                  )}
                                  {/* <Image
                                    src="/fast-draft-plan.svg"
                                    alt="FastDraft Logo"
                                    width={150}
                                    height={150}
                                    className="inline-block md:w-[250px] md:h-[50px] mb-1"
                                    loader={({ src }) => src}
                                  /> */}
                                </div>

                                {/* Sign Up Button */}
                                {firstBet.signupLink && (
                                  <a
                                    href={firstBet.signupLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-shrink-0 inline-flex items-center justify-center gap-1 md:gap-2 text-white bg-[#E64A30]/60 px-3 py-2 md:px-6 md:py-3 rounded-full font-semibold hover:bg-[#E64A30]/90 transition-colors text-xs md:text-base whitespace-nowrap"
                                  >
                                    <span className="hidden md:inline">Sign Up for FastDraft</span>
                                    <span className="md:hidden">Sign Up</span>
                                    <ExternalLink className="h-3 w-3 md:h-4 md:w-4" />
                                  </a>
                                )}


                              </div>
                              {firstBet.depositInfo && (
                                <p className="text-[10px] md:text-sm leading-tight text-end mt-1">
                                  {firstBet.depositInfo}
                                </p>
                              )}
                            </div>
                          ) : (
                            /* Regular Category Header - Just text */
                            <h2 className="text-2xl font-bold text-[#E64A30] dark:text-[#E64A30]">
                              {category}
                            </h2>
                          )}
                        </div>

                        {/* Bets in this category */}
                        <div className="space-y-4">
                          {categoryBets.map((bet) => (
                            <BetCard
                              key={bet.id}
                              bet={bet}
                            />
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
