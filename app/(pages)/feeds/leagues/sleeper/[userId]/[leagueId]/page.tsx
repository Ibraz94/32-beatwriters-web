'use client'

import { useState, useEffect, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, Loader2, Clock, Bookmark, Search, ChevronDown, Filter, X, ListCheck, UsersRound } from 'lucide-react'
import { ReadMore } from '@/app/components/ReadMore'
import {
  useSleeperLeague,
  useSleeperRosters,
  useSleeperLeagueUsers,
  useSleeperPlayers,
} from '@/lib/hooks/useSleeper'
import {
  useGetNuggetsQuery,
  getImageUrl,
  useSaveNuggetMutation,
  useUnsaveNuggetMutation,
} from '@/lib/services/nuggetsApi'
import { useGetTeamsQuery, getTeamLogoUrl } from '@/lib/services/teamsApi'
import { useAuth } from '@/lib/hooks/useAuth'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import { useTheme } from 'next-themes'

interface NuggetFilters {
  sortBy?: 'createdAt' | 'playerName'
  sortOrder?: 'asc' | 'desc'
  positions?: string[]
  rookie?: boolean
  position?: string
  team?: string
  search?: string
  startDate?: string
  page?: number
  limit?: number
}

export default function SleeperLeagueNuggetsPage() {
  const params = useParams()
  const router = useRouter()
  const { isAuthenticated, isLoading: authLoading, user } = useAuth()
  const { theme } = useTheme()
  
  const userId = params.userId as string
  const leagueId = params.leagueId as string

  const [filters, setFilters] = useState<NuggetFilters>({
    sortBy: 'createdAt',
    sortOrder: 'desc',
    positions: [],
    rookie: false,
    position: '',
    team: '',
  })
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [date, setDate] = useState<Date | undefined>(undefined)
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [allNuggets, setAllNuggets] = useState<any[]>([])
  const [hasMoreNuggets, setHasMoreNuggets] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [bookmarkLoading, setBookmarkLoading] = useState<number | null>(null)
  const [open, setOpen] = useState(false)
  const ITEMS_PER_PAGE = 15

  const calendarIcon = theme === 'dark' ? '/calendar-nuggets-dark.svg' : '/calendar-nuggets.svg'

  // Fetch Sleeper data
  const { data: league, isLoading: isLoadingLeague } = useSleeperLeague(leagueId)
  const { data: rosters, isLoading: isLoadingRosters } = useSleeperRosters(leagueId)
  const { data: leagueUsers, isLoading: isLoadingUsers } = useSleeperLeagueUsers(leagueId)
  const { data: allPlayers, isLoading: isLoadingPlayers } = useSleeperPlayers()

  // Get the user's roster (their team only)
  const myRoster = useMemo(() => {
    if (!rosters || !userId) return null
    return rosters.find((r) => r.owner_id === userId)
  }, [rosters, userId])

  // Get the user's team name
  const myTeamName = useMemo(() => {
    if (!leagueUsers || !userId) return null
    const user = leagueUsers.find((u) => u.user_id === userId)
    return user?.metadata?.team_name || user?.display_name || 'My Team'
  }, [leagueUsers, userId])

  // Get player IDs from the user's roster only (not all teams)
  const leaguePlayerIds = useMemo(() => {
    if (!myRoster) return []
    const playerIds = new Set<string>()
    
    // Add all players from user's roster (starters + bench)
    myRoster.players?.forEach((playerId) => playerIds.add(playerId))
    
    return Array.from(playerIds)
  }, [myRoster])

  // Map Sleeper player IDs to player names for search
  const playerNamesMap = useMemo(() => {
    if (!allPlayers || !leaguePlayerIds.length) return new Map()
    const map = new Map<string, string>()
    leaguePlayerIds.forEach((playerId) => {
      const player = allPlayers[playerId]
      if (player?.full_name) {
        map.set(playerId, player.full_name)
      }
    })
    return map
  }, [allPlayers, leaguePlayerIds])

  // Get array of player names for easier filtering
  const leaguePlayerNames = useMemo(() => {
    return Array.from(playerNamesMap.values()).filter(Boolean)
  }, [playerNamesMap])

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 500)
    return () => clearTimeout(timer)
  }, [searchTerm])

  // Synchronize date states
  useEffect(() => {
    if (!selectedDate && date) {
      setDate(undefined)
    } else if (selectedDate && !date) {
      setDate(new Date(selectedDate))
    }
  }, [selectedDate, date])

  // Build query parameters
  const queryParams = useMemo(() => {
    const params = {
      ...(debouncedSearchTerm && { search: debouncedSearchTerm }),
      ...(filters.position && { position: filters.position }),
      ...(filters.team && { team: filters.team }),
      ...(selectedDate && { startDate: selectedDate }),
      ...(filters.rookie && { rookie: filters.rookie }),
      page: currentPage,
      limit: 50, // Fetch more to account for filtering
      sortBy: 'createdAt' as const,
      sortOrder: 'desc' as const,
    }

    return params
  }, [debouncedSearchTerm, filters, selectedDate, currentPage])

  // Fetch nuggets
  const {
    data: nuggetsData,
    isLoading: isLoadingNuggets,
    error: nuggetsError,
    isFetching: isFetchingNuggets,
  } = useGetNuggetsQuery(queryParams, {
    skip: !leaguePlayerNames.length, // Don't fetch until we have player names
  })

  // Teams query
  const { data: teamsData, isLoading: isLoadingTeams } = useGetTeamsQuery()

  // Save/Unsave mutations
  const [saveNugget] = useSaveNuggetMutation()
  const [unsaveNugget] = useUnsaveNuggetMutation()

  // Filter nuggets to only show players in this league
  // NOTE: This is client-side filtering because the nuggets API doesn't support
  // fetching by multiple player IDs. For better performance, the backend should
  // be enhanced to accept an array of player IDs or names.
  const filteredNuggets = useMemo(() => {
    if (!nuggetsData?.data?.nuggets || !leaguePlayerNames.length) return []
    
    // Create a Set of lowercase player names for faster lookup
    const leaguePlayerNamesSet = new Set(
      leaguePlayerNames.map(name => name.toLowerCase())
    )
    
    const filtered = nuggetsData.data.nuggets.filter((nugget) => {
      const playerName = nugget?.player?.name
      if (!playerName) return false
      
      return leaguePlayerNamesSet.has(playerName.toLowerCase())
    })
    
    // Limit to ITEMS_PER_PAGE for proper pagination
    return filtered.slice(0, ITEMS_PER_PAGE)
  }, [nuggetsData, leaguePlayerNames])

  // Handle loading nuggets
  useEffect(() => {
    if (filteredNuggets.length > 0) {
      if (currentPage === 1) {
        setAllNuggets(filteredNuggets)
      } else {
        setAllNuggets((prev) => {
          const existingIds = new Set(prev.map((n) => n.id))
          const newNuggets = filteredNuggets.filter((n) => !existingIds.has(n.id))
          return [...prev, ...newNuggets]
        })
      }
      setHasMoreNuggets(filteredNuggets.length === ITEMS_PER_PAGE)
      setIsLoadingMore(false)
    }
  }, [filteredNuggets, currentPage])

  // Helper function to find team by abbreviation or name
  const findTeamByKey = (teamKey: string) => {
    if (!teamsData?.teams || !teamKey) return null
    return teamsData.teams.find(
      (team) =>
        team.abbreviation?.toLowerCase() === teamKey.toLowerCase() ||
        team.name?.toLowerCase() === teamKey.toLowerCase() ||
        team.city?.toLowerCase() === teamKey.toLowerCase()
    )
  }

  // Handle save/unsave nugget
  const handleBookmarkClick = async (nuggetId: number, isSaved: boolean) => {
    setBookmarkLoading(nuggetId)
    try {
      if (isSaved) {
        await unsaveNugget(nuggetId).unwrap()
      } else {
        await saveNugget(nuggetId).unwrap()
      }
      setAllNuggets((prevNuggets) =>
        prevNuggets.map((nugget) =>
          nugget.id === nuggetId ? { ...nugget, isSaved: !isSaved } : nugget
        )
      )
    } catch (error) {
      console.error('Error saving/unsaving nugget:', error)
    } finally {
      setBookmarkLoading(null)
    }
  }

  // Clear date filter
  const clearDateFilter = () => {
    setSelectedDate('')
    setDate(undefined)
    setCurrentPage(1)
    setAllNuggets([])
  }

  // Handle position filter change
  const handlePositionFilterChange = (position: string) => {
    setFilters((prev) => ({
      ...prev,
      position: position === 'all' ? '' : position,
    }))
    setCurrentPage(1)
    setAllNuggets([])
  }

  // Handle team filter change
  const handleTeamFilterChange = (team: string) => {
    setFilters((prev) => ({
      ...prev,
      team: team === 'all' ? '' : team,
    }))
    setCurrentPage(1)
    setAllNuggets([])
  }

  // Handle rookie filter change
  const handleRookieFilterChange = (isRookie: boolean) => {
    setFilters((prev) => ({
      ...prev,
      rookie: isRookie,
    }))
    setCurrentPage(1)
    setAllNuggets([])
  }

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      sortBy: 'createdAt',
      sortOrder: 'desc',
      positions: [],
      rookie: false,
      position: '',
      team: '',
    })
    setSelectedDate('')
    setDate(undefined)
    setSearchTerm('')
    setDebouncedSearchTerm('')
    setCurrentPage(1)
    setHasMoreNuggets(true)
  }

  // Load more nuggets
  const loadMoreNuggets = () => {
    if (!isLoadingMore && hasMoreNuggets) {
      setIsLoadingMore(true)
      setCurrentPage((prev) => prev + 1)
    }
  }

  const fantasyInsight = (fantasyInsight: string) => {
    if (fantasyInsight) {
      return <div dangerouslySetInnerHTML={{ __html: fantasyInsight }}></div>
    }
    return null
  }

  const isLoading = isLoadingLeague || isLoadingRosters || isLoadingPlayers || isLoadingUsers || authLoading || isLoadingTeams
  const hasActiveFilters = debouncedSearchTerm || filters.position || filters.team || selectedDate || filters.rookie

  // Show authentication required message
  if (!authLoading && (!isAuthenticated || (user?.memberships && user.memberships.id !== undefined && user.memberships.id < 2))) {
    return (
      <div className="container mx-auto h-screen px-4 py-8 flex flex-col items-center justify-center">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-3xl font-bold mb-4">Premium Access Required</h1>
          <p className="text-gray-600 mb-8">
            {!isAuthenticated
              ? "Please login to view the feed."
              : "Please upgrade to a premium subscription to view the feed."}
          </p>
          {!isAuthenticated && (
            <Link href="/login" className="text-[#E64A30] hover:text-[#E64A30]/90 font-semibold">
              Login
            </Link>
          )}
          <Link href="/subscribe" className="bg-[#E64A30] text-white px-6 py-3 rounded-full font-semibold ml-4">
            Subscribe
          </Link>
        </div>
      </div>
    )
  }

  // Loading state
  if (isLoading && allNuggets.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-[#E64A30]" />
          <p className="text-gray-600 dark:text-gray-400">Loading league nuggets...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-3 py-7">
      {/* <div
        className="hidden md:flex absolute left-[-12px] right-[-12px] h-[400%] bg-cover bg-center bg-no-repeat bg-[url('/background-image2.png')] opacity-10 dark:opacity-5"
        style={{
          transform: 'scaleY(-1)',
          zIndex: -50,
          top: '-100px',
        }}
      /> */}

      {/* Search Bar + Filter Button */}
      <div className="flex items-center md:hidden gap-3 w-full md:w-auto mb-5">
        <div className="w-full md:w-[550px] border border-[#C7C8CB] rounded-full px-3 py-1.5 dark:bg-[#262829]">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-24 py-2 rounded-full placeholder:text-gray-400 focus:outline-none text-base"
            />
          </div>
        </div>
        <button
          onClick={() => setShowMobileFilters(!showMobileFilters)}
          className="flex items-center gap-2 px-4 py-2 border border-[#E64A30] text-[#E64A30] rounded-full dark:border-none dark:bg-[#262829] lg:hidden transition-colors"
        >
          <Filter className="w-5 h-5" />
          <span className="text-sm font-medium">Filters</span>
        </button>
      </div>

      {/* Filters */}
      <div className={`mb-6 ${showMobileFilters ? 'block' : 'hidden'} lg:block`}>
        <div className="flex flex-col lg:flex-row items-center justify-center gap-3 w-full">
          {/* Search Bar */}
          <div className="hidden md:flex w-full md:w-[550px] border border-[#C7C8CB] rounded-full px-3 py-1.5 dark:bg-[#262829]">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-full placeholder:text-gray-400 focus:outline-none text-base"
              />
            </div>
          </div>

          {/* Date Filter */}
          <div className="flex gap-2 items-center border border-[#C7C8CB] rounded-full px-3 py-1.5 bg-white dark:!bg-[#262829]">
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild className="flex-1">
                <Button variant="outline" className="filter-button justify-between text-left font-normal h-10 !border-none !border-0 shadow-none flex items-center gap-2 !bg-transparent">
                  <Image src={calendarIcon} alt="Calendar icon" width={18} height={18} />
                  {date ? date.toLocaleDateString() : <span>Select By Date</span>}
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-[#1D212D]" align="start" side="bottom">
                <CalendarComponent
                  mode="single"
                  selected={date}
                  onSelect={(selectedCalendarDate: Date | undefined) => {
                    setDate(selectedCalendarDate)
                    if (selectedCalendarDate) {
                      const year = selectedCalendarDate.getFullYear()
                      const month = String(selectedCalendarDate.getMonth() + 1).padStart(2, '0')
                      const day = String(selectedCalendarDate.getDate()).padStart(2, '0')
                      const dateString = `${year}-${month}-${day}`
                      setSelectedDate(dateString)
                      setCurrentPage(1)
                      setAllNuggets([])
                    } else {
                      setSelectedDate('')
                      setCurrentPage(1)
                      setAllNuggets([])
                    }
                    setOpen(false)
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            {date && (
              <Button variant="outline" onClick={clearDateFilter} className="filter-button h-10 px-3 border-none !bg-transparent" title="Clear date filter">
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Position Filter */}
          <div className="border border-[#C7C8CB] rounded-full px-3 py-1.5 bg-white dark:bg-[#262829]">
            <Select value={filters.position || 'all'} onValueChange={handlePositionFilterChange}>
              <SelectTrigger className="h-10 w-40 !border-none !border-0 flex items-center gap-2">
                <ListCheck className="w-4 h-4" />
                <SelectValue placeholder="All Positions" />
              </SelectTrigger>
              <SelectContent className="border-none">
                <SelectGroup>
                  <SelectItem value="all">All Positions</SelectItem>
                  {['QB', 'WR', 'RB', 'FB', 'TE'].map((position) => (
                    <SelectItem key={position} value={position}>
                      {position}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          {/* Team Filter */}
          <div className="flex items-center border border-[#C7C8CB] rounded-full px-3 py-1.5 bg-white dark:!bg-[#262829] transition-colors">
            <Select value={filters.team || 'all'} onValueChange={handleTeamFilterChange}>
              <SelectTrigger className="filter-select h-10 w-52 !border-none !border-0 text-sm flex items-center gap-2 !bg-transparent shadow-none focus:ring-0 focus:outline-none">
                <UsersRound className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                <SelectValue placeholder="All Teams" />
                <ChevronDown className="ml-auto h-4 w-4 text-gray-500" />
              </SelectTrigger>
              <SelectContent className="border-none bg-white dark:bg-[#1D212D] text-black dark:text-white rounded-xl shadow-md">
                <SelectGroup>
                  <SelectItem value="all">All Teams</SelectItem>
                  {teamsData?.teams.map((team) => (
                    <SelectItem key={team.name} value={team.name}>
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          {/* Rookie Checkbox */}
          <div className="border border-[#C7C8CB] rounded-full flex items-center gap-2 px-8 py-4 dark:bg-[#262829]">
            <input
              type="checkbox"
              id="rookie-filter"
              checked={filters.rookie || false}
              onChange={(e) => handleRookieFilterChange(e.target.checked)}
              className="w-4 h-4 cursor-pointer"
            />
            <label htmlFor="rookie-filter" className="text-sm font-medium cursor-pointer">
              Rookie
            </label>
          </div>

          {/* Clear Filters Button */}
          <div className="w-full lg:w-auto text-center">
            <button
              onClick={clearFilters}
              className="whitespace-nowrap flex items-center justify-center gap-2 px-4 py-4 text-sm font-medium rounded-full border border-[#E64A30] text-[#E64A30] bg-white dark:!bg-[#262829] hover:bg-[#fff4f2] dark:hover:bg-[#303234] transition-colors dark:border-none"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Nuggets Feed */}
      <div className="flex-1">
        {allNuggets.length === 0 && !isLoadingNuggets ? (
          <div className="text-center py-12 min-h-screen">
            <p className="text-xl text-gray-600 mb-4">
              {hasActiveFilters ? 'No nuggets found for your filters.' : 'No nuggets available for players in this league.'}
            </p>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="text-red-800 hover:cursor-pointer font-semibold">
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div>
            <div className="space-y-2 min-h-screen">
              {allNuggets.map((nugget, index) => {
                const playerTeam = findTeamByKey(nugget.player.team)
                return (
                  <div
                    key={`${nugget.id}-${index}`}
                    className="overflow-hidden grid grid-cols-6 md:grid-cols-12 border-b pb-4 border-[var(--color-gray)]"
                  >
                    {/* Player Image */}
                    <div
                      className="cursor-pointer border rounded-full p-0 w-15 h-15 flex items-center justify-center relative col-span-1"
                      onClick={() => router.push(`/players/${nugget.player.id}`, { scroll: false })}
                    >
                      <Image
                        src={getImageUrl(nugget.player.headshotPic) || ''}
                        alt={`${nugget.player.name} headshot`}
                        fill
                        className="rounded-full object-cover bg-background overflow-hidden"
                      />
                    </div>

                    {/* Player Details + Content */}
                    <div className="col-span-5 md:col-span-11 ">
                      {/* Header Section */}
                      <div className="flex items-center gap-2 ml-4 mr-4 col-1">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Link href={`/players/${nugget.player.id}`}>
                              <h1 className="text-xl">{nugget.player.name}</h1>
                            </Link>
                            {playerTeam && (
                              <div className="flex items-center">
                                <Image
                                  src={getTeamLogoUrl(playerTeam.logo) || ''}
                                  alt={`${playerTeam.name} logo`}
                                  width={32}
                                  height={24}
                                  className="object-contain"
                                />
                              </div>
                            )}
                          </div>
                          {nugget.player.team && (
                            <p className="text-sm text-gray-500">
                              {nugget.player.position} • {nugget.player.team}
                            </p>
                          )}
                        </div>

                        {/* Bookmark Button */}
                        <div className="flex items-center">
                          <button
                            onClick={() => handleBookmarkClick(nugget.id, nugget.isSaved || false)}
                            className={`flex items-center gap-2 px-3 py-2 rounded-full transition-colors cursor-pointer ${
                              bookmarkLoading === nugget.id
                                ? 'bg-[#E64A30]/70'
                                : nugget.isSaved
                                ? 'bg-[#E64A30]'
                                : 'bg-[#E64A30] hover:opacity-90'
                            }`}
                            title={nugget.isSaved ? 'Remove from saved' : 'Save nugget'}
                            disabled={bookmarkLoading === nugget.id}
                          >
                            <span className="text-sm font- text-white">{nugget.isSaved ? 'Saved' : 'Save'}</span>
                            {bookmarkLoading === nugget.id ? (
                              <Loader2 className="w-5 h-5 animate-spin text-white" />
                            ) : (
                              <Bookmark strokeWidth={1} className={`w-5 h-5 ${nugget.isSaved ? 'fill-white text-white' : 'text-white'}`} />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Content Section */}
                      <div className="mt-3 ml-4 dark:text-[#D2D6E2]">
                        <ReadMore id={nugget.id.toString()} text={nugget.content} amountOfCharacters={400} />
                      </div>

                      {/* Fantasy Insight Section */}
                      {nugget.fantasyInsight && (
                        <div className="px-4 mt-2 dark:text-[#D2D6E2]">
                          <h1 className="font-semibold mt-0 text-red-800">Fantasy Insight:</h1>
                          {fantasyInsight(nugget.fantasyInsight)}
                        </div>
                      )}

                      {/* Source + Date + Team Section */}
                      <div className="bg-[var(--gray-background-color)] rounded-full pr-3 pl-2 py-2 flex flex-wrap items-center gap-2 mr-5 ml-5 mt-2 dark:bg-[var(--dark-theme-color)]">
                        {/* Source */}
                        {nugget.sourceUrl && (
                          <div className="flex items-center gap-1 bg-[var(--light-orange-background-color)] rounded-full px-3 py-1.5 dark:text-black">
                            <span className="font-semibold text-sm">Source:</span>
                            <Link
                              href={
                                nugget.sourceUrl.startsWith('http://') || nugget.sourceUrl.startsWith('https://')
                                  ? nugget.sourceUrl
                                  : `https://${nugget.sourceUrl}`
                              }
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-left hover:text-red-800 text-sm"
                            >
                              {nugget.sourceName}
                            </Link>
                          </div>
                        )}

                        {/* Sleeper Team Name */}
                        {myTeamName && (
                          <div className="flex items-center gap-1 bg-[#E64A30]/10 dark:bg-[#E64A30]/20 rounded-full px-3 py-1.5">
                            <span className="font-semibold text-sm text-[#E64A30]">Sleeper Team Name:</span>
                            <span className="text-sm font-medium text-[#E64A30]">
                              {myTeamName}
                            </span>
                          </div>
                        )}

                        {/* Date */}
                        <div className="flex flex-row gap-2 text-gray-400 ml-auto">
                          <Clock size={18} />
                          <h1 className="text-gray-400 text-sm">
                            {new Date(nugget.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </h1>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Load More Button */}
            {hasMoreNuggets && allNuggets.length > 0 && (
              <div className="text-center py-6">
                <button
                  onClick={loadMoreNuggets}
                  disabled={isLoadingMore || isFetchingNuggets}
                  className="bg-[#E64A30] text-white px-8 py-3 rounded-full font-semibold hover:bg-[#d14429] disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 mx-auto cursor-pointer"
                >
                  {isLoadingMore || isFetchingNuggets ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    'Load More'
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
