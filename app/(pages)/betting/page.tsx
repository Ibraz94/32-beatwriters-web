'use client'

import { useState, useMemo } from 'react'
import { useGetBetsByWeekQuery } from '@/lib/services/bettingApi'
import BetCard from '@/app/components/betting/BetCard'
import { Loader2, Filter, Search, Flame, Zap, ExternalLink } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAuth } from '@/lib/hooks/useAuth'
import { usePathname } from 'next/navigation'
import Link from 'next/link'

export default function BettingPage() {
  const pathname = usePathname()
  const { isAuthenticated, isLoading: authLoading, user } = useAuth()
  // Function to get current NFL week (weeks start on Wednesday)
  const getCurrentNFLWeek = () => {
    // Get current date in user's timezone
    const now = new Date()
    const dayOfWeek = now.getDay() // 0 = Sunday, 1 = Monday, ..., 3 = Wednesday
    
    // Adjust date to the start of the current NFL week (Wednesday)
    // If today is Sunday (0), Monday (1), or Tuesday (2), we're still in the previous week
    let adjustedDate = new Date(now)
    if (dayOfWeek < 3) {
      // Go back to the previous Wednesday
      adjustedDate.setDate(now.getDate() - (dayOfWeek + 4))
    } else {
      // Go back to this week's Wednesday
      adjustedDate.setDate(now.getDate() - (dayOfWeek - 3))
    }
    
    const month = adjustedDate.getMonth() + 1 // 1-12
    const day = adjustedDate.getDate()
    const year = adjustedDate.getFullYear()
    
    // 2025-2026 NFL Season
    // Week 1 starts: Wednesday, Sept 3, 2025
    // Week 18 starts: Wednesday, Dec 31, 2025
    
    // January 2026 - determine week based on adjusted date
    if (year === 2026 && month === 1) {
      if (day >= 1 && day < 7) {
        return 'Week 18'
      }
      if (day >= 7 && day < 14) {
        return 'Wild Card'
      }
      if (day >= 14 && day < 21) {
        return 'Divisional'
      }
      if (day >= 21 && day < 28) {
        return 'Conference'
      }
      if (day >= 28) {
        return 'Super Bowl'
      }
    }
    
    // February 2026 - Super Bowl week
    if (year === 2026 && month === 2 && day < 10) {
      return 'Super Bowl'
    }
    
    // January 2025 - previous season playoffs
    if (year === 2025 && month === 1) {
      if (day >= 1 && day < 8) {
        return 'Week 18'
      }
      if (day >= 8 && day < 15) {
        return 'Wild Card'
      }
      if (day >= 15 && day < 22) {
        return 'Divisional'
      }
      if (day >= 22 && day < 29) {
        return 'Conference'
      }
      if (day >= 29) {
        return 'Super Bowl'
      }
    }
    
    // February 2025 - Super Bowl week
    if (year === 2025 && month === 2 && day < 10) {
      return 'Super Bowl'
    }
    
    // September through December 2025 - calculate week for current season
    if (year === 2025 && month >= 9) {
      const seasonStart = new Date(2025, 8, 3) // Wednesday, Sept 3, 2025
      const diffTime = adjustedDate.getTime() - seasonStart.getTime()
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
      const weekNumber = Math.min(Math.floor(diffDays / 7) + 1, 18)
      return `Week ${weekNumber}`
    }
    
    // September through December 2024 - calculate week for previous season
    if (year === 2024 && month >= 9) {
      const seasonStart = new Date(2024, 8, 4) // Wednesday, Sept 4, 2024
      const diffTime = adjustedDate.getTime() - seasonStart.getTime()
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
      const weekNumber = Math.min(Math.floor(diffDays / 7) + 1, 18)
      return `Week ${weekNumber}`
    }
    
    // Off-season (Feb 10 - Aug)
    return 'Week 1'
  }

  const [selectedWeek, setSelectedWeek] = useState(getCurrentNFLWeek())
  const [showBestBets, setShowBestBets] = useState(false)
  const [showFastDraft, setShowFastDraft] = useState(false)
  const [resultFilter, setResultFilter] = useState('all')
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [playerSearch, setPlayerSearch] = useState('')
  const [displayLimit, setDisplayLimit] = useState(10)

  const { data, isLoading, error } = useGetBetsByWeekQuery({
    week: selectedWeek,
  })

  const filteredBets = useMemo(() => {
    if (!data?.data?.bets) {
      return []
    }

    const bets = data.data.bets
    let filtered = [...bets]

    // Player search filter
    if (playerSearch) {
      filtered = filtered.filter((b) => {
        // Check main player field (backward compatibility)
        if (b.player?.name.toLowerCase().includes(playerSearch.toLowerCase())) {
          return true
        }
        // Check betPlayers array
        if (b.betPlayers && b.betPlayers.length > 0) {
          return b.betPlayers.some(bp => 
            bp.player.name.toLowerCase().includes(playerSearch.toLowerCase())
          )
        }
        return false
      })
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

    // Sort: pinned bets first, then by date (most recent first)
    filtered.sort((a, b) => {
      // Pinned bets come first
      if (a.isPinned && !b.isPinned) return -1
      if (!a.isPinned && b.isPinned) return 1
      
      // Then sort by updatedAt (most recently updated pinned bet first)
      if (a.isPinned && b.isPinned) {
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      }
      
      // For non-pinned, sort by date
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })

    return filtered
  }, [data, showBestBets, showFastDraft, resultFilter, playerSearch])

  // Reset display limit when filters change
  useMemo(() => {
    setDisplayLimit(10)
  }, [selectedWeek, showBestBets, showFastDraft, resultFilter, playerSearch])

  const displayedBets = filteredBets.slice(0, displayLimit)
  const hasMoreBets = filteredBets.length > displayLimit

  const handleLoadMore = () => {
    setDisplayLimit(prev => prev + 10)
  }

  // Show authentication required message if not authenticated or has insufficient membership
  if (!authLoading && (!isAuthenticated || (user?.memberships && user.memberships.id !== undefined && user.memberships.id < 2))) {
    return (
      <div className="container mx-auto h-screen px-4 py-8 flex flex-col items-center justify-center">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-3xl font-bold mb-4">Premium Access Required</h1>
          <p className="text-gray-600 mb-8">
            {!isAuthenticated
              ? "Please login to your account to view betting picks. Don't have a subscription? Please subscribe to access premium content."
              : "Please upgrade to a premium subscription to view betting picks."
            }
          </p>

          {!isAuthenticated && (
            <p className="text-gray-600 mb-8">
              <Link href={{
                pathname: '/login',
                query: { redirect: pathname }
              }} className="text-[#E64A30] hover:text-[#E64A30]/90 font-semibold">Login</Link>
            </p>
          )}
          <Link
            href="/subscribe"
            className="bg-[#E64A30] text-white px-6 py-3 rounded-full font-semibold"
          >
            Subscribe
          </Link>
        </div>
      </div>
    )
  }

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
                    {['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7', 'Week 8', 'Week 9', 'Week 10', 'Week 11', 'Week 12', 'Week 13', 'Week 14', 'Week 15', 'Week 16', 'Week 17', 'Week 18', 'Wild Card', 'Divisional', 'Conference', 'Super Bowl'].map((week) => (
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
              {/* All Bets */}
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
                <>
                  <div className="space-y-8">
                    {displayedBets.map((bet) => {
                    const isFastDraftCategory = bet.betType?.includes('FastDraft')

                    return (
                      <div key={bet.id} className="space-y-4">
                        {/* Bet Type Header - Show for every bet */}
                        {bet.betType && (
                          <div className="border-b-2 border-[#E64A30]">
                            {isFastDraftCategory ? (
                              /* FastDraft Header - Logo and Button */
                              <div className="bg-[#d14429]/10 rounded-t-2xl p-2 md:p-2">
                                <div className="flex flex-row items-center justify-between gap-2 md:gap-4">
                                  {/* Logo and Info */}
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                      <p className="text-lg md:text-2xl font-bold text-[#E64A30] dark:text-[#E64A30] mt-4">
                                        {bet.betType}
                                      </p>
                                      {bet.isBestBet && (
                                        <span className="text-[#E64A30] font-bold text-lg md:text-3xl mt-4 cursor-default" title="Best Bet">🔥</span>
                                      )}
                                      {bet.isLongshotBet && (
                                        <span className="text-[#E64A30] font-bold text-lg md:text-3xl mt-4 -ml-2 cursor-default" title="Longshot Bet">🚀</span>
                                      )}
                                    </div>
                                  </div>

                                  {/* Sign Up Button */}
                                  {bet.signupLink && (
                                    <a
                                      href={bet.signupLink}
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
                                {bet.depositInfo && (
                                  <p className="text-[10px] md:text-sm leading-tight text-end mt-1">
                                    {bet.depositInfo}
                                  </p>
                                )}
                              </div>
                            ) : (
                              /* Regular Bet Type Header - Just text */
                              <div className="flex items-center gap-2">
                                <h2 className="text-2xl font-bold text-[#E64A30] dark:text-[#E64A30]">
                                  {bet.betType}
                                </h2>
                                {bet.isBestBet && (
                                  <span className="text-[#E64A30] font-bold text-lg md:text-3xl cursor-help" title="Best Bet">🔥</span>
                                )}
                                {bet.isLongshotBet && (
                                  <span className="text-[#E64A30] font-bold text-lg md:text-3xl cursor-help" title="Longshot Bet">🚀</span>
                                )}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Bet Card */}
                        <BetCard bet={bet} />
                      </div>
                    )
                  })}
                  </div>

                  {/* Load More Button */}
                  {hasMoreBets && (
                    <div className="flex justify-center mt-8">
                      <button
                        onClick={handleLoadMore}
                        className="px-8 py-3 bg-[#E64A30] text-white rounded-full font-semibold hover:bg-[#E64A30]/90 transition-colors"
                      >
                        Load More
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
