'use client'

import { useParams, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect, useMemo } from 'react'
import { CircleGauge, Newspaper, Dumbbell, ArrowLeft, Search } from 'lucide-react'
import { getImageUrl, useGetPlayerQuery, useGetPlayersQuery, useGetPlayerProfilerQuery, useGetPlayerPerformanceProfilerQuery } from '@/lib/services/playersApi'
import { useGetNuggetsByPlayerIdQuery, getImageUrl as getNuggetImageUrl, useGetNuggetsQuery, type NuggetFilters } from '@/lib/services/nuggetsApi'
import { useGetTeamsQuery, getTeamLogoUrl } from '@/lib/services/teamsApi'
import { useAuth } from '@/lib/hooks/useAuth'
import { ReadMore } from '@/app/components/ReadMore'
import { ChartConfig, ChartContainer } from "@/components/ui/chart"
import { Bar, BarChart, LabelList, XAxis, Cell } from "recharts"

export default function PlayerProfile() {
  const params = useParams()
  const searchParams = useSearchParams()
  const playerId = params.playerId as string

  // Tab state
  const [activeTab, setActiveTab] = useState('news')
  // Follow state
  const [isFollowing, setIsFollowing] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [allNuggets, setAllNuggets] = useState<any[]>([])
  const [hasMoreNuggets, setHasMoreNuggets] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const ITEMS_PER_PAGE = 15

  const queryParams = useMemo(() => ({
    ...(debouncedSearchTerm && { search: debouncedSearchTerm }),
    playerId: parseInt(playerId),
    sortBy: 'createdAt' as const,
    sortOrder: 'desc' as const
  }), [debouncedSearchTerm, playerId])

  // Main query for nuggets - with all filters
  const {
    data: nuggetsData,
    isLoading: isLoadingNuggets,
    error: nuggetsError,
    isFetching: isFetchingNuggets
  } = useGetNuggetsQuery(queryParams as NuggetFilters)


  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 500)
    return () => clearTimeout(timer)
  }, [searchTerm])

  // Handle loading nuggets
  useEffect(() => {
    if (nuggetsData?.data?.nuggets) {
      const newNuggets = nuggetsData.data.nuggets

      if (currentPage === 1) {
        // First page - replace all nuggets
        setAllNuggets(newNuggets)
      } else {
        // Additional pages - append to existing nuggets
        setAllNuggets(prev => [...prev, ...newNuggets])
      }

      // Check if there are more nuggets to load
      setHasMoreNuggets(newNuggets.length === ITEMS_PER_PAGE)
      setIsLoadingMore(false)
    }
  }, [nuggetsData, currentPage])




  // Year selection state for performance metrics
  const [selectedYear, setSelectedYear] = useState('2024')

  // Get the page number user came from (for back navigation)
  const fromPage = searchParams?.get('page')
  const backToPlayersUrl = fromPage ? `/players?page=${fromPage}` : '/players'

  // Add authentication check
  const { isAuthenticated, isLoading: authLoading, user } = useAuth()

  // First, fetch the player from internal API to get the playerId
  const { data: internalPlayer, isLoading: internalPlayerLoading, error: internalPlayerError } = useGetPlayerQuery(playerId)

  // Then use the playerId from internal API to fetch detailed data from Player Profiler API
  const { data: playerResponse, isLoading: playerLoading, error: playerError } = useGetPlayerProfilerQuery(internalPlayer?.playerId || '')

  // Fetch performance data for selected year
  const { data: performanceResponse, isLoading: performanceLoading } = useGetPlayerPerformanceProfilerQuery(
    { playerId: internalPlayer?.playerId || '', year: selectedYear },
    { skip: !internalPlayer?.playerId }
  )

  // Extract player data from the nested response
  const player = playerResponse?.data?.Player
  const basicPlayer = internalPlayer // Data from internal API
  const performancePlayer = performanceResponse?.data?.Player

  // Debug: Log the actual response structure (remove in production)
  if (process.env.NODE_ENV === 'development') {
    console.log('Internal Player API Response:', internalPlayer)
    console.log('Player Data:', player)
    console.log('Player Error:', playerError)
  }

  const teamName = player?.Core?.Team?.Name || basicPlayer?.team
  const teamLoading = false

  // Fetch nuggets for this specific player
  const { data: nuggetResponse, isLoading: nuggetsLoading } = useGetNuggetsByPlayerIdQuery(playerId)
  const nuggets = nuggetResponse?.data?.nuggets || []
  console.log('Nuggets for player:', nuggets)

  // Teams query for nuggets team logos
  const { data: teamsData } = useGetTeamsQuery()

  // Helper function to find team by abbreviation or name
  const findTeamByKey = (teamKey: string) => {
    if (!teamsData?.teams || !teamKey) return null

    return teamsData.teams.find(team =>
      team.abbreviation?.toLowerCase() === teamKey.toLowerCase() ||
      team.name?.toLowerCase() === teamKey.toLowerCase() ||
      team.city?.toLowerCase() === teamKey.toLowerCase()
    )
  }

  const playerTeam = findTeamByKey(player?.Core?.Team?.Name || '')

  // Fetch all players for teammates - get more players to find teammates
  const { data: playersResponse } = useGetPlayersQuery({
    page: 1,
    limit: 100  // Increased limit to fetch more players
  })
  const allPlayers = playersResponse?.data?.players || []

  // Get teammates (same team, different player)
  const currentTeam = player?.Core?.Team?.Name || basicPlayer?.team
  const teammates = allPlayers
    .filter(p => {
      // More flexible team matching
      const playerTeam = p.team
      return playerTeam === currentTeam && p.id !== basicPlayer?.id
    })

  // Debug logging
  console.log('Current player team:', currentTeam)
  console.log('All players count:', allPlayers.length)
  console.log('Teammates found:', teammates.length)
  console.log('Sample teammates:', teammates.slice(0, 3).map(t => ({ name: t.name, team: t.team })))

  const loading = playerLoading || teamLoading || authLoading || internalPlayerLoading || performanceLoading

  const chartConfig = {
    desktop: {
      label: "Desktop",
      color: "#2563eb",
    },
    mobile: {
      label: "Mobile",
      color: "#2563eb",
    }
  } satisfies ChartConfig

  // Helper function to format numbers to 2 decimal places
  const formatNumber = (value: string | number | undefined) => {
    if (!value || value === 'N/A') return value
    const num = parseFloat(value.toString())
    return isNaN(num) ? value : num.toFixed(2)
  }

  // Tab components
  const tabs = [
    { id: 'news', label: 'News & Updates', icon: Newspaper },
    { id: 'performance', label: 'Performance Metrics', icon: CircleGauge },
    { id: 'workout', label: 'Workout Metrics', icon: Dumbbell },
  ]


  const handleSearch = (term: string) => {
    setSearchTerm(term)
  }

  // Show authentication required message if not authenticated
  if (!authLoading && !isAuthenticated && !user?.memberships) {
    return (
      <div className="container mx-auto h-screen px-4 py-8 flex flex-col items-center justify-center">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-3xl font-bold mb-4">Premium Access Required</h1>
          <p className="text-gray-600 mb-8">Please upgrade to a premium subscription to view player profiles. Already have a subscription? Please login to your account.</p>
          <p className="text-gray-600 mb-8">
            <Link href="/login" className="text-red-600 hover:text-red-800 font-semibold">Login</Link>
          </p>
          <Link
            href="/subscribe"
            className="bg-red-800 text-white px-6 py-3 rounded-lg font-semibold"
          >
            Subscribe
          </Link>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-4"></div>
            <div className="h-64 bg-gray-200 rounded mb-6"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if ((playerError && internalPlayerError) || (!player && !basicPlayer)) {
    // Check if the error is specifically an authentication error
    const isAuthError = (playerError && 'status' in playerError && (playerError.status === 401 || playerError.status === 403)) ||
      (internalPlayerError && 'status' in internalPlayerError && (internalPlayerError.status === 401 || internalPlayerError.status === 403))

    if (isAuthError) {
      return (
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto text-center">
            <h1 className="text-3xl font-bold mb-4">Authentication Required</h1>
            <p className="text-gray-600 mb-8">You need to be signed in to view this player profile.</p>
            <div className="space-x-4">
              <Link
                href="/login"
                className="bg-red-800 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-900 transition-colors"
              >
                Sign In
              </Link>
              <Link
                href={backToPlayersUrl}
                className="text-red-800 border border-red-800 px-6 py-3 rounded-lg font-semibold hover:bg-red-800 hover:text-white transition-colors"
              >
                Back to Players
              </Link>
            </div>
          </div>
        </div>
      )
    }

    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto h-screen text-center">
          <h1 className="text-3xl font-bold mb-4">Player Not Found</h1>
          <p className="text-gray-600 mb-8">The player you're looking for doesn't exist or has been moved.</p>
          <Link
            href={backToPlayersUrl}
            className="text-red-800 px-6 py-3 rounded-lg font-semibold hover:bg-white transition-colors"
          >
            Back to Players
          </Link>
        </div>
      </div>
    )
  }

  // Get player image URL - prefer Player Profiler API image, fallback to internal API
  const playerImage = player?.Core?.Avatar || player?.Core?.['Alt Image'] || getImageUrl(basicPlayer?.headshotPic) || '/default-player.jpg'

  // Get player name - prefer Player Profiler API, fallback to internal API
  const playerName = player?.Core?.['Full Name'] || basicPlayer?.name || 'Unknown Player'

  // Get player position - prefer Player Profiler API, fallback to internal API
  const playerPosition = player?.Core?.Position || basicPlayer?.position || 'N/A'

  // Get player age - prefer Player Profiler API, fallback to internal API
  const playerAge = player?.Core?.Age || basicPlayer?.age || 'N/A'

  const displayNuggets = allNuggets


  // Render tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'workout':
        return (
          <div className="space-y-8">
            {/* Workout Metrics - Only show if Player Profiler data is available */}
            {player?.['Workout Metrics'] ? (
              <div>
                <h2 className="text-3xl mb-8">Workout Metrics</h2>

                <div className="text-white">
                  {/* Primary Metrics Chart */}
                  <div className="grid grid-cols-1 gap-4">
                    {/* Mobile Chart */}
                    <div className="w-full block sm:hidden">
                      <ChartContainer config={chartConfig} className="h-[300px] w-full">
                        <BarChart
                          data={[
                            {
                              name: "40-YARD",
                              fullName: "40-YARD DASH",
                              value: parseFloat(player['Workout Metrics']['40-Yard Dash']) || 0,
                              displayValue: player['Workout Metrics']['40-Yard Dash'] || 'N/A',
                              rank: player['Workout Metrics']['40-Yard Dash Rank'] || 10,
                              hasData: !!player['Workout Metrics']['40-Yard Dash'],
                            },
                            {
                              name: "SPEED",
                              fullName: "SPEED SCORE",
                              value: parseFloat(player['Workout Metrics']['Speed Score']) || 0,
                              displayValue: player['Workout Metrics']['Speed Score'] || 'N/A',
                              rank: player['Workout Metrics']['Speed Score Rank'] || 10,
                              hasData: !!player['Workout Metrics']['Speed Score'],
                            },
                            {
                              name: "BURST",
                              fullName: "BURST SCORE",
                              value: parseFloat(player['Workout Metrics']['Burst Score']) || 0,
                              displayValue: player['Workout Metrics']['Burst Score'] || 'N/A',
                              rank: player['Workout Metrics']['Burst Score Rank'] || 10,
                              hasData: !!player['Workout Metrics']['Burst Score'],
                            },
                            {
                              name: "AGILITY",
                              fullName: "AGILITY SCORE",
                              value: parseFloat(player['Workout Metrics']['Agility Score']) || 0,
                              displayValue: player['Workout Metrics']['Agility Score'] || 'N/A',
                              rank: player['Workout Metrics']['Agility Score Rank'] || 10,
                              hasData: !!player['Workout Metrics']['Agility Score'],
                            },
                            {
                              name: "CATCH",
                              fullName: "CATCH RADIUS",
                              value: parseFloat(player['Workout Metrics']['Catch Radius']) || 0,
                              displayValue: player['Workout Metrics']['Catch Radius'] || 'N/A',
                              rank: player['Workout Metrics']['Catch Radius Rank'] || 10,
                              hasData: !!player['Workout Metrics']['Catch Radius'],
                            },
                          ]}
                          margin={{ top: 15, right: 15, left: 15, bottom: 40 }}
                          barSize={25}
                        >
                          <Bar dataKey="rank" radius={[4, 4, 0, 0]}>
                            {[
                              {
                                name: "40-YARD",
                                hasData: !!player['Workout Metrics']['40-Yard Dash'],
                              },
                              {
                                name: "SPEED",
                                hasData: !!player['Workout Metrics']['Speed Score'],
                              },
                              {
                                name: "BURST",
                                hasData: !!player['Workout Metrics']['Burst Score'],
                              },
                              {
                                name: "AGILITY",
                                hasData: !!player['Workout Metrics']['Agility Score'],
                              },
                              {
                                name: "CATCH",
                                hasData: !!player['Workout Metrics']['Catch Radius'],
                              },
                            ].map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={entry.hasData ? "#9F0712" : "#D1D5DB"}
                              />
                            ))}
                            <LabelList
                              dataKey="displayValue"
                              position="top"
                              offset={8}
                              style={{ fontSize: '11px', fontWeight: 'bold' }}
                            />
                            <LabelList
                              dataKey="rank"
                              position="insideTop"
                              fill="white"
                              style={{ fontSize: '10px' }}
                            />
                          </Bar>
                          <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 10, fontWeight: '600' }}
                            height={40}
                            interval={0}
                          />
                        </BarChart>
                      </ChartContainer>
                    </div>

                    {/* Desktop Chart */}
                    <div className="max-w-3xl hidden sm:block mx-auto">
                      <ChartContainer config={chartConfig} className="h-[450px]">
                        <BarChart
                          data={[
                            {
                              name: "40-YARD DASH",
                              fullName: "40-YARD DASH",
                              value: parseFloat(player['Workout Metrics']['40-Yard Dash']) || 0,
                              displayValue: player['Workout Metrics']['40-Yard Dash'] || 'N/A',
                              rank: player['Workout Metrics']['40-Yard Dash Rank'] || 10,
                              hasData: !!player['Workout Metrics']['40-Yard Dash'],
                            },
                            {
                              name: "SPEED SCORE",
                              fullName: "SPEED SCORE",
                              value: parseFloat(player['Workout Metrics']['Speed Score']) || 0,
                              displayValue: player['Workout Metrics']['Speed Score'] || 'N/A',
                              rank: player['Workout Metrics']['Speed Score Rank'] || 10,
                              hasData: !!player['Workout Metrics']['Speed Score'],
                            },
                            {
                              name: "BURST SCORE",
                              fullName: "BURST SCORE",
                              value: parseFloat(player['Workout Metrics']['Burst Score']) || 0,
                              displayValue: player['Workout Metrics']['Burst Score'] || 'N/A',
                              rank: player['Workout Metrics']['Burst Score Rank'] || 10,
                              hasData: !!player['Workout Metrics']['Burst Score'],
                            },
                            {
                              name: "AGILITY SCORE",
                              fullName: "AGILITY SCORE",
                              value: parseFloat(player['Workout Metrics']['Agility Score']) || 0,
                              displayValue: player['Workout Metrics']['Agility Score'] || 'N/A',
                              rank: player['Workout Metrics']['Agility Score Rank'] || 10,
                              hasData: !!player['Workout Metrics']['Agility Score'],
                            },
                            {
                              name: "CATCH RADIUS",
                              fullName: "CATCH RADIUS",
                              value: parseFloat(player['Workout Metrics']['Catch Radius']) || 0,
                              displayValue: player['Workout Metrics']['Catch Radius'] || 'N/A',
                              rank: player['Workout Metrics']['Catch Radius Rank'] || 10,
                              hasData: !!player['Workout Metrics']['Catch Radius'],
                            },
                          ]}
                          maxBarSize={90}
                        >
                          <Bar dataKey="rank" radius={[4, 4, 0, 0]}>
                            {[
                              {
                                name: "40-YARD DASH",
                                hasData: !!player['Workout Metrics']['40-Yard Dash'],
                              },
                              {
                                name: "SPEED SCORE",
                                hasData: !!player['Workout Metrics']['Speed Score'],
                              },
                              {
                                name: "BURST SCORE",
                                hasData: !!player['Workout Metrics']['Burst Score'],
                              },
                              {
                                name: "AGILITY SCORE",
                                hasData: !!player['Workout Metrics']['Agility Score'],
                              },
                              {
                                name: "CATCH RADIUS",
                                hasData: !!player['Workout Metrics']['Catch Radius'],
                              },
                            ].map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={entry.hasData ? "#9F0712" : "#D1D5DB"}
                              />
                            ))}
                            <LabelList
                              dataKey="displayValue"
                              position="top"
                              offset={10}
                              style={{ fontSize: '20px', fontWeight: 'bold' }}
                            />
                            <LabelList
                              dataKey="rank"
                              position="insideTop"
                              offset={10}
                              style={{ fontSize: '16px', textAlign: 'left', fill: 'white' }}
                            />
                          </Bar>
                          <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            interval={0}
                            textAnchor="middle"
                            fontSize={16}
                            fontWeight={600}
                          />
                        </BarChart>
                      </ChartContainer>
                    </div>
                  </div>

                </div>
                {player?.['College Performance'] && (
                  <div className="grid grid-cols-1 md:grid-cols-3 items-center justify-center gap-2">

                    <div className="border border-gray-400 rounded p-2 flex flex-col justify-around">
                      <div className="flex items-center justify-between text-lg">
                        <h1>{player['College Performance']['College Dominator Rating']}</h1>
                        <h2 className="mr-2">{player['College Performance']['College Dominator Rating Rank']}</h2>
                      </div>
                      <div className="flex items-end">
                        <span className="text-lg font-semibold">College Dominator</span>
                      </div>
                    </div>

                    <div className="border border-gray-400 rounded p-2 flex flex-col justify-around">
                      <div className="flex items-center justify-between text-lg">
                        <h1>{player['College Performance']['College Target Share']}%</h1>
                        <h2 className="mr-2">{player['College Performance']['College Target Share Rank']}</h2>
                      </div>
                      <div className="flex items-end">
                        <span className="text-lg font-semibold">College Target Share</span>
                      </div>
                    </div>



                    <div className="border border-gray-400 rounded p-2 flex flex-col justify-around">
                      <div className="flex items-center justify-between text-lg">
                        <h1>{player['College Performance']['Breakout Age']}</h1>
                        <h2 className="mr-2">{player['College Performance']['Breakout Age Rank']}</h2>
                      </div>
                      <div className="flex items-end">
                        <span className="text-lg font-semibold">Breakout Age</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>



            ) : (
              <div className="rounded-xl p-8 shadow-xl border text-center">
                <Dumbbell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-600 mb-2">Workout Metrics Unavailable</h3>
                <p className="text-gray-500">Detailed workout metrics are not available for this player.</p>
              </div>
            )}
          </div>
        )

      case 'performance':
        // Generate available years (2019 onwards)
        const currentYear = new Date().getFullYear()
        const availableYears = Array.from({ length: currentYear - 2018 }, (_, i) => (currentYear - i).toString())

        // Get performance data for selected year
        const performanceData = performancePlayer?.['Performance Metrics']?.[selectedYear]

        return (
          <div className="space-y-8">
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
                <h2 className="text-3xl font-black mb-4 sm:mb-0">Performance Metrics</h2>

                {/* Year Selector and Games Played */}
                <div className="flex items-center gap-6">
                  {performanceData && (
                    <div className="text-sm">
                      <span className="font-semibold">Games: </span>
                      <span className="text-lg font-bold">{performanceData['Games']}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <label htmlFor="year-select" className="text-sm font-semibold">Season:</label>
                    <select
                      id="year-select"
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(e.target.value)}
                      className="px-4 py-2 select border bg-card rounded text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      {availableYears.map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Performance Metrics Display */}
              {performanceData ? (
                <div className="space-y-8">

                  {/* Opportunity Section */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold">Opportunity</h3>
                    <div className="bg-white dark:bg-gray-800 rounded shadow-md overflow-hidden w-[360px] md:w-[640px] lg:w-full">
                      <div className="overflow-x-auto w-[360px] md:w-[640px] lg:w-full">
                        <table className="w-full">
                          <thead>
                            <tr className="bg-[#0F0724] text-center">
                              <th className="text-xs font-semibold p-3 text-gray-300">TARGETS</th>
                              <th className="text-xs font-semibold p-3 text-gray-300">TARGET SHARE</th>
                              <th className="text-xs font-semibold p-3 text-gray-300">TARGET RATE</th>
                              <th className="text-xs font-semibold p-3 text-gray-300">SNAP SHARE</th>
                              <th className="text-xs font-semibold p-3 text-gray-300">SLOT SNAPS</th>
                              <th className="text-xs font-semibold p-3 text-gray-300">ROUTES RUN</th>
                              <th className="text-xs font-semibold p-3 text-gray-300">ROUTE PARTICIPATION</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="bg-[#2C204B] text-center">
                              <td className="p-3">
                                <div className="text-lg font-bold text-white">{performanceData['Targets']}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">#{performanceData['Targets Rank']}</div>
                              </td>
                              <td className="p-3">
                                <div className="text-lg font-bold text-white">{parseFloat(performanceData['Target Share']).toFixed(2)}%</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">#{performanceData['Target Share Rank']}</div>
                              </td>
                              <td className="p-3">
                                <div className="text-lg font-bold text-white">{parseFloat(performanceData['Target Rate']).toFixed(2)}%</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">#{performanceData['Target Rate Rank']}</div>
                              </td>
                              <td className="p-3">
                                <div className="text-lg font-bold text-white">{parseFloat(performanceData['Snap Share']).toFixed(2)}%</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">#{performanceData['Snap Share Rank']}</div>
                              </td>
                              <td className="p-3">
                                <div className="text-lg font-bold text-white">{performanceData['Slot Snaps']}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">#{performanceData['Slot Snaps Rank']}</div>
                              </td>
                              <td className="p-3">
                                <div className="text-lg font-bold text-white">{performanceData['Routes Run']}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">#{performanceData['Routes Run Rank']}</div>
                              </td>
                              <td className="p-3">
                                <div className="text-lg font-bold text-white">{parseFloat(performanceData['Route Participation']).toFixed(2)}%</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">#{performanceData['Route Participation Rank']}</div>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  {/* Opportunity Section 2 */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold">Opportunity</h3>
                    <div className="bg-white dark:bg-gray-800 rounded shadow-md overflow-hidden w-[360px] md:w-[640px] lg:w-full">
                      <div className="overflow-x-auto w-[360px] md:w-[640px] lg:w-full">
                        <table className="w-full">
                          <thead>
                            <tr className="bg-[#0F0724] text-center">
                              <th className="text-xs font-semibold p-3 text-gray-300">AIR YARDS</th>
                              <th className="text-xs font-semibold p-3 text-gray-300">AIR YARDS SHARE</th>
                              <th className="text-xs font-semibold p-3 text-gray-300">AVERAGE TARGET DISTANCE (ADOT)</th>
                              <th className="text-xs font-semibold p-3 text-gray-300">DEEP TARGETS</th>
                              <th className="text-xs font-semibold p-3 text-gray-300">RED ZONE TARGETS</th>
                              <th className="text-xs font-semibold p-3 text-gray-300">TARGET QUALITY RATING</th>
                              <th className="text-xs font-semibold p-3 text-gray-300">CATCHABLE TARGET RATE</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="bg-[#2C204B] text-center">
                              <td className="p-3">
                                <div className="text-lg font-bold text-white">{performanceData['Air Yards']}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">#{performanceData['Air Yards Rank']}</div>
                              </td>
                              <td className="p-3">
                                <div className="text-lg font-bold text-white">{formatNumber(performanceData['Air Yards Share'])}%</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">#{performanceData['Air Yards Share Rank']}</div>
                              </td>
                              <td className="p-3">
                                <div className="text-lg font-bold text-white">{formatNumber(performanceData['Average Target Distance'])}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">#{performanceData['Average Target Distance Rank']}</div>
                              </td>
                              <td className="p-3">
                                <div className="text-lg font-bold text-white">{performanceData['Deep Targets']}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">#{performanceData['Deep Targets Rank']}</div>
                              </td>
                              <td className="p-3">
                                <div className="text-lg font-bold text-white">{performanceData['Red Zone Targets']}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">#{performanceData['Red Zone Targets Rank']}</div>
                              </td>
                              <td className="p-3">
                                <div className="text-lg font-bold text-white">{formatNumber(performanceData['Target Quality Rating'])}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">#{performanceData['Target Quality Rating Rank']}</div>
                              </td>
                              <td className="p-3">
                                <div className="text-lg font-bold text-white">{formatNumber(performanceData['Catchable Target Rate'])}%</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">#{performanceData['Catchable Target Rate Rank']}</div>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  {/* Productivity Section */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold">Productivity</h3>
                    <div className="bg-white dark:bg-gray-800 rounded shadow-md overflow-hidden w-[360px] md:w-[640px] lg:w-full">
                      <div className="overflow-x-auto w-[360px] md:w-[640px] lg:w-full">
                        <table className="w-full">
                          <thead>
                            <tr className="bg-[#0F0724] text-center">
                              <th className="text-xs font-semibold p-3 text-gray-300">RECEPTIONS</th>
                              <th className="text-xs font-semibold p-3 text-gray-300">RECEIVING YARDS</th>
                              <th className="text-xs font-semibold p-3 text-gray-300">YARDS AFTER CATCH</th>
                              <th className="text-xs font-semibold p-3 text-gray-300">UNREALIZED AIR YARDS</th>
                              <th className="text-xs font-semibold p-3 text-gray-300">TOTAL TDS</th>
                              <th className="text-xs font-semibold p-3 text-gray-300">FANTASY POINTS PER GAME</th>
                              <th className="text-xs font-semibold p-3 text-gray-300">EXPECTED FANTASY POINTS PER GAME</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="bg-[#2C204B] text-center">
                              <td className="p-3 ">
                                <div className="text-lg font-bold text-white">{performanceData['Receptions']}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">#{performanceData['Receptions Rank']}</div>
                              </td>
                              <td className="p-3">
                                <div className="text-lg font-bold text-white">{performanceData['Receiving Yards']}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">#{performanceData['Receiving Yards Rank']}</div>
                              </td>
                              <td className="p-3">
                                <div className="text-lg font-bold text-white">{performanceData['Yards After Catch']}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">#{performanceData['Yards After Catch Rank']}</div>
                              </td>
                              <td className="p-3">
                                <div className="text-lg font-bold text-white">{performanceData['Unrealized Air Yards']}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">#{performanceData['Unrealized Air Yards Rank']}</div>
                              </td>
                              <td className="p-3">
                                <div className="text-lg font-bold text-white">{performanceData['Total Touchdowns']}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">#{performanceData['Total Touchdowns Rank']}</div>
                              </td>
                              <td className="p-3">
                                <div className="text-lg font-bold text-white">{formatNumber(performanceData['Fantasy Points Per Game'])}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">#{performanceData['Fantasy Points Per Game Rank']}</div>
                              </td>
                              <td className="p-3">
                                <div className="text-lg font-bold text-white">{formatNumber(performanceData['Expected Fantasy Points Per Game'])}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">#{performanceData['Expected Fantasy Points Per Game Rank']}</div>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  {/* Efficiency Section 1 */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold">Efficiency</h3>
                    <div className="bg-white dark:bg-gray-800 rounded shadow-md overflow-hidden w-[360px] md:w-[640px] lg:w-full">
                      <div className="overflow-x-auto w-[360px] md:w-[640px] lg:w-full">
                        <table className="w-full">
                          <thead>
                            <tr className="bg-[#0F0724] text-center">
                              <th className="text-xs font-semibold p-3 text-gray-300">TARGET ACCURACY</th>
                              <th className="text-xs font-semibold p-3 text-gray-300">YARDS PER ROUTE RUN</th>
                              <th className="text-xs font-semibold p-3 text-gray-300">FORMATION ADJUSTED YARDS PER ROUTE RUN</th>
                              <th className="text-xs font-semibold p-3 text-gray-300">YARDS PER TARGET</th>
                              <th className="text-xs font-semibold p-3 text-gray-300">YARDS PER RECEPTION</th>
                              <th className="text-xs font-semibold p-3 text-gray-300">YARDS PER TEAM PASS ATTEMPT</th>
                              <th className="text-xs font-semibold p-3 text-gray-300">TRUE CATCH RATE</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="bg-[#2C204B] text-center">
                              <td className="p-3">
                                <div className="text-lg font-bold text-white">{formatNumber(performanceData['Target Accuracy'])}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">#{performanceData['Target Accuracy Rank']}</div>
                              </td>
                              <td className="p-3">
                                <div className="text-lg font-bold text-white">{formatNumber(performanceData['Yards Per Route Run'])}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">#{performanceData['Yards Per Route Run Rank']}</div>
                              </td>
                              <td className="p-3">
                                <div className="text-lg font-bold text-white">{formatNumber(performanceData['Formation Adjusted Yards Per Route Run'])}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">#{performanceData['Formation Adjusted Yards Per Route Run Rank']}</div>
                              </td>
                              <td className="p-3">
                                <div className="text-lg font-bold text-white">{formatNumber(performanceData['Yards Per Target'])}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">#{performanceData['Yards Per Target Rank']}</div>
                              </td>
                              <td className="p-3">
                                <div className="text-lg font-bold text-white">{formatNumber(performanceData['Yards Per Reception'])}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">#{performanceData['Yards Per Reception Rank']}</div>
                              </td>
                              <td className="p-3">
                                <div className="text-lg font-bold text-white">{formatNumber(performanceData['Yards Per Team Pass Attempt'])}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">#{performanceData['Yards Per Team Pass Attempt Rank']}</div>
                              </td>
                              <td className="p-3">
                                <div className="text-lg font-bold text-white">{formatNumber(performanceData['True Catch Rate'])}%</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">#{performanceData['True Catch Rate Rank']}</div>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  {/* Efficiency Section 2 */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold">Efficiency</h3>
                    <div className="bg-white dark:bg-gray-800 rounded shadow-md overflow-hidden w-[360px] md:w-[640px] lg:w-full">
                      <div className="overflow-x-auto w-[360px] md:w-[640px] lg:w-full">
                        <table className="w-full">
                          <thead>
                            <tr className="bg-[#0F0724] text-center">
                              <th className="text-xs font-semibold p-3 text-gray-300">TARGET SEPARATION</th>
                              <th className="text-xs font-semibold p-3 text-gray-300">TARGET PREMIUM</th>
                              <th className="text-xs font-semibold p-3 text-gray-300">DOMINATOR RATING</th>
                              <th className="text-xs font-semibold p-3 text-gray-300">JUKE RATE</th>
                              <th className="text-xs font-semibold p-3 text-gray-300">EXPLOSIVE RATING</th>
                              <th className="text-xs font-semibold p-3 text-gray-300">DROPS</th>
                              <th className="text-xs font-semibold p-3 text-gray-300">CONTESTED CATCH RATE</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="bg-[#2C204B] text-center">
                              <td className="p-3">
                                <div className="text-lg font-bold text-white">{formatNumber(performanceData['Target Separation'])}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">#{performanceData['Target Separation Rank']}</div>
                              </td>
                              <td className="p-3">
                                <div className="text-lg font-bold text-white">{formatNumber(performanceData['Target Premium'])}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">#{performanceData['Target Premium Rank']}</div>
                              </td>
                              <td className="p-3">
                                <div className="text-lg font-bold text-white">{formatNumber(performanceData['Dominator Rating'])}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">#{performanceData['Dominator Rating Rank']}</div>
                              </td>
                              <td className="p-3">
                                <div className="text-lg font-bold text-white">{formatNumber(performanceData['Juke Rate'])}%</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">#{performanceData['Juke Rate Rank']}</div>
                              </td>
                              <td className="p-3">
                                <div className="text-lg font-bold text-white">N/A</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">#N/A</div>
                              </td>
                              <td className="p-3">
                                <div className="text-lg font-bold text-white">{performanceData['Drops']}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">#{performanceData['Drops Rank']}</div>
                              </td>
                              <td className="p-3">
                                <div className="text-lg font-bold text-white">{formatNumber(performanceData['Contested Catch Conversion Rate'])}%</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">#{performanceData['Contested Catch Conversion Rate Rank']}</div>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  {/* Efficiency Section 3 */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold">Efficiency</h3>
                    <div className="bg-white dark:bg-gray-800 rounded shadow-md overflow-hidden w-[360px] md:w-[640px] lg:w-full">
                      <div className="overflow-x-auto w-[360px] md:w-[640px] lg:w-full">
                        <table className="w-full">
                          <thead>
                            <tr className="bg-[#0F0724] text-center">
                              <th className="text-xs font-semibold p-3 text-gray-300">PRODUCTION PREMIUM</th>
                              <th className="text-xs font-semibold p-3 text-gray-300">EXPECTED POINTS ADDED (EPA)</th>
                              <th className="text-xs font-semibold p-3 text-gray-300">QB RATING PER TARGET</th>
                              <th className="text-xs font-semibold p-3 text-gray-300">BEST BALL POINTS ADDED</th>
                              <th className="text-xs font-semibold p-3 text-gray-300">FANTASY POINTS PER ROUTE RUN</th>
                              <th className="text-xs font-semibold p-3 text-gray-300">FANTASY POINTS PER TARGET</th>
                              <th className="text-xs font-semibold p-3 text-gray-300">TOTAL FANTASY POINTS</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="bg-[#2C204B] text-center">
                              <td className="p-3">
                                <div className="text-lg font-bold text-white">{formatNumber(performanceData['Production Premium'])}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">#{performanceData['Production Premium Rank']}</div>
                              </td>
                              <td className="p-3">
                                <div className="text-lg font-bold text-white">{formatNumber(performanceData['Expected Points Added'])}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">#{performanceData['Expected Points Added Rank']}</div>
                              </td>
                              <td className="p-3">
                                <div className="text-lg font-bold text-white">{formatNumber(performanceData['QB Rating When Targeted'])}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">#{performanceData['QB Rating When Targeted Rank']}</div>
                              </td>
                              <td className="p-3">
                                <div className="text-lg font-bold text-white">{formatNumber(performanceData['Best Ball Points Added'])}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">#{performanceData['Best Ball Points Added Rank']}</div>
                              </td>
                              <td className="p-3">
                                <div className="text-lg font-bold text-white">{formatNumber(performanceData['Fantasy Points Per Route Run'])}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">#{performanceData['Fantasy Points Per Route Run Rank']}</div>
                              </td>
                              <td className="p-3">
                                <div className="text-lg font-bold text-white">{formatNumber(performanceData['Fantasy Points Per Target'])}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">#{performanceData['Fantasy Points Per Target Rank']}</div>
                              </td>
                              <td className="p-3">
                                <div className="text-lg font-bold text-white">{formatNumber(performanceData['Total Fantasy Points'])}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">#{performanceData['Fantasy Points Rank']}</div>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  {/* Zone vs Man Section */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold">Zone vs Man</h3>
                    <div className="bg-white dark:bg-gray-800 rounded shadow-md overflow-hidden w-[360px] md:w-[640px] lg:w-full">
                      <div className="overflow-x-auto w-[360px] md:w-[640px] lg:w-full">
                        <table className="w-full">
                          <thead>
                            <tr className="bg-[#0F0724] text-center">
                              <th className="text-xs font-semibold p-3 text-gray-300">TOTAL ROUTE WINS</th>
                              <th className="text-xs font-semibold p-3 text-gray-300">ROUTE WIN RATE</th>
                              <th className="text-xs font-semibold p-3 text-gray-300">ROUTES VS MAN</th>
                              <th className="text-xs font-semibold p-3 text-gray-300">WIN RATE VS MAN</th>
                              <th className="text-xs font-semibold p-3 text-gray-300">TARGET RATE VS MAN</th>
                              <th className="text-xs font-semibold p-3 text-gray-300">TARGET SEPARATION VS MAN</th>
                              <th className="text-xs font-semibold p-3 text-gray-300">FANTASY POINTS PER TARGET VS MAN</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="bg-[#2C204B] text-center">
                              <td className="p-3">
                                <div className="text-lg font-bold text-white">{performanceData['Total Route Wins']}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">#{performanceData['Total Route Wins Rank']}</div>
                              </td>
                              <td className="p-3">
                                <div className="text-lg font-bold text-white">{formatNumber(performanceData['Route Win Rate'])}%</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">#{performanceData['Route Win Rate Rank']}</div>
                              </td>
                              <td className="p-3">
                                <div className="text-lg font-bold text-white">{performanceData['Routes vs Man']}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">#{performanceData['Routes vs Man Rank']}</div>
                              </td>
                              <td className="p-3">
                                <div className="text-lg font-bold text-white">{formatNumber(performanceData['Win Rate vs Man'])}%</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">#{performanceData['Win Rate vs Man Rank']}</div>
                              </td>
                              <td className="p-3">
                                <div className="text-lg font-bold text-white">{formatNumber(performanceData['Target Rate vs Man'])}%</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">#{performanceData['Target Rate vs Man Rank']}</div>
                              </td>
                              <td className="p-3">
                                <div className="text-lg font-bold text-white">{formatNumber(performanceData['Target Separation vs Man'])}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">#{performanceData['Target Separation vs Man Rank']}</div>
                              </td>
                              <td className="p-3">
                                <div className="text-lg font-bold text-white">{formatNumber(performanceData['Fantasy Points Per Target vs Man'])}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">#{performanceData['Fantasy Points Per Target vs Man Rank']}</div>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                </div>
              ) : (
                <div className="text-center py-12">
                  <CircleGauge className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-600 mb-2">No Performance Data Available</h3>
                  <p className="text-gray-500">Performance metrics are not available for {playerName} in {selectedYear}.</p>
                  <p className="text-gray-500 mt-2">Try selecting a different year or check back later for updates.</p>
                </div>
              )}
            </div>
          </div>
        )

      case 'news':
        // Helper function to render fantasy insight HTML
        const renderFantasyInsight = (fantasyInsight: string | null) => {
          if (fantasyInsight) {
            return <div dangerouslySetInnerHTML={{ __html: fantasyInsight }}></div>
          }
          return null
        }

        return (
          <div className="space-y-6">
            {/* Search Bar */}
            <div className="relative w-full mb-6">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search news for this player"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="filter-input w-full pl-10 pr-4 py-3 rounded shadow-sm"
              />
            </div>
            {isLoadingNuggets ? (
              <div className="space-y-6">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="rounded border shadow-lg overflow-hidden animate-pulse h-screen">
                    <div>
                      <div className="flex gap-4 mb-4">
                        <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
                        <div className="flex-1">
                          <div className="h-6 bg-gray-200 rounded mb-2"></div>
                          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded"></div>
                        <div className="h-4 bg-gray-200 rounded"></div>
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : displayNuggets.length > 0 ? (
              <div className="space-y-6">
                {displayNuggets.map((nugget, index) => {
                  const playerTeam = findTeamByKey(nugget.player.team || '')

                  return (
                    <div key={`${nugget.id}-${index}`} className="rounded border border-white/20 overflow-hidden shadow-md hover:shadow-xl transition-shadow">
                      {/* Player Header */}
                      <div className='flex mt-6 gap-4 ml-6 mr-6'>
                        <div
                          className="cursor-pointer hover:opacity-80 transition-opacity"
                        >
                          <Image
                            src={getNuggetImageUrl(nugget.player.headshotPic) || '/default-player.jpg'}
                            alt={`${nugget.player.name} headshot`}
                            width={64}
                            height={64}
                            className='rounded-full object-cover bg-background'
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className='text-xl font-bold'>{nugget.player.name}</h3>
                            {playerTeam && (
                              <div className="flex items-center">
                                <Image
                                  src={getTeamLogoUrl(playerTeam.logo) || ''}
                                  alt={`${playerTeam.name} logo`}
                                  width={28}
                                  height={28}
                                  className='object-contain'
                                />
                              </div>
                            )}
                          </div>
                          {nugget.player.team && (
                            <p className="text-sm text-gray-600">
                              {nugget.player.position} • {nugget.player.team}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Nugget Content */}
                      <div className="px-6 py-4">
                        <ReadMore id={nugget.id.toString()} text={nugget.content} amountOfCharacters={400} />
                      </div>

                      {/* Fantasy Insight */}
                      {nugget.fantasyInsight && (
                        <div className='px-6 py-2  border-gray-100'>
                          <h4 className='font-semibold mb-2 text-red-800'>Fantasy Insight:</h4>
                          <div>
                            {renderFantasyInsight(nugget.fantasyInsight)}
                          </div>
                        </div>
                      )}

                      {/* Source and Date */}
                      <div className='px-6 py-2 border-gray-50'>
                        <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2'>
                          <div className='text-sm'>

                            {nugget.sourceUrl && (
                              <>
                                <div className="font-bold">Source:
                                  <Link href={nugget.sourceUrl.startsWith('http://') || nugget.sourceUrl.startsWith('https://')
                                    ? nugget.sourceUrl
                                    : `https://${nugget.sourceUrl}`}
                                    target='_blank'
                                    rel='noopener noreferrer'
                                    className='hover:text-red-800 text-sm'
                                  > {nugget.sourceName}</Link>
                                </div>
                              </>
                            )}
                          </div>
                          <p className='text-sm text-gray-500'>
                            {new Date(nugget.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="rounded-sm p-8 shadow-xl border border-white/20 text-center">
                <Newspaper className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-600 mb-2">No News Available</h3>
                <p className="text-gray-500 mb-6">{searchTerm ? `No news found for "${searchTerm}".` : `There are currently no news available for ${playerName}. Check back later for updates!`}</p>
              </div>
            )}
          </div>
        )

      default:
        return null
    }
  }


  return (
    <div>
      {/* Hero Section */}
      <div className="relative bg-[#2C204B] text-white overflow-hidden container mx-auto mt-4">
        <div className="hidden md:flex flex-row items-center gap-12"> {/* Hidden on mobile, shown on md and up */}
          {/* Player Image */}
          <div className="relative pl-6">
            <div className="bg-[#413278] absolute h-full w-[450px] top-0 left-0"
              style={{
                clipPath: 'polygon(20% 0%, 100% 0%, 80% 100%, 0% 100%)'
              }}>
            </div>

            <div className="bg-[#2F2140] absolute h-full w-[450px] top-0 left-0"
              style={{
                clipPath: 'polygon(25% 0%, 100% 0%, 75% 100%, 0% 100%)'
              }}>
            </div>

            <div className="absolute top-0 -right-12">
              {playerTeam && (
                <Image
                  src={getTeamLogoUrl(playerTeam.logo) || '/default-player.jpg'}
                  alt={playerName}
                  width={230}
                  height={230}
                  className="object-cover"
                />
              )}
            </div>

            <div className="w-80 overflow-hidden relative">
              <Image
                src={playerImage}
                alt={playerName}
                width={400}
                height={400}
                className="w-full h-full object-cover "
              />
            </div>
          </div>

          {/* Player Info */}
          <div className="flex-1 text-left ml-12">
            <div className="mb-4 w-72">
              <div className="flex items-center gap-4 lg:gap-6 mb-4">
                <h1 className="text-xl lg:text-2xl">
                  {playerName}
                </h1>
                {player?.Core?.ADP && (
                  <div className="bg-yellow-500 text-black px-2 py-1 rounded-full text-xs flex items-center gap-1">
                    <Image src="/underdog.webp" alt="ADP" width={24} height={16} />
                    ADP: {player.Core.ADP}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-4 lg:gap-8">
                <span className="text-md lg:text-lg">
                  {teamName || 'N/A'}
                </span>
                <span className="text-md lg:text-md">
                  {player?.Core['ADP Year']}
                </span>

                <span className="text-md lg:text-md">
                  {player?.Core?.Position}
                </span>
              </div>
              <div className="flex items-center gap-4 lg:gap-8 mt-4">
                <button
                  className={`text-white text-sm border px-4 py-1 rounded-sm transition-colors hover:cursor-pointer ${isFollowing ? 'bg-red-800 border-red-800' : 'border-red-800 hover:bg-red-800'}`}
                  onClick={() => setIsFollowing(f => !f)}
                >
                  {isFollowing ? 'FOLLOWING' : 'FOLLOW'}
                </button>
              </div>
            </div>
          </div>

          <div className="flex-1 flex gap-8 text-left space-y-3">
            <div className="flex flex-col gap-3 w-28">
              <div className="flex flex-col items-start leading-tight">
                <h1 className="text-[#796D97]">
                  HT/WT
                </h1>
                <h1>
                  {player?.Core?.Height} , {player?.Core?.Weight}
                </h1>
              </div>
              <div className="flex flex-col items-start leading-tight">
                <h1 className="text-[#796D97]">
                  Age
                </h1>
                <h1>
                  {player?.Core?.Age}
                </h1>
              </div>
              <div className="flex flex-col items-start leading-tight">
                <h1 className="text-[#796D97]">
                  Draft Info
                </h1>
                <h1>
                  {player?.Core?.['Draft Pick']} ({player?.Core?.['Draft Year']})
                </h1>
              </div>
            </div>

            <div className="h-36 w-px bg-white/20"></div>
            <div className="flex flex-col gap-3">
              <div className="flex flex-col items-start leading-tight">
                <h1 className="text-[#796D97]">
                  BMI
                </h1>
                <h1>
                  {player?.Core?.BMI} ({player?.Core?.['BMI Rank']}th)
                </h1>
              </div>
              <div className="flex flex-col items-start leading-tight">
                <h1 className="text-[#796D97]">
                  Status
                </h1>
                <h1>
                  {player?.Core?.Active ? 'Active' : 'Inactive'}
                </h1>
              </div>
              <div className="flex flex-col items-start leading-tight">
                <h1 className=" text-[#796D97]">
                  College
                </h1>
                <h1>
                  {player?.Core?.College}
                </h1>
              </div>
            </div>
          </div>
        </div>


        <div className="flex flex-col gap-4 md:hidden">
          <div className='flex items-center'>
            <div className="relative w-full max-w-xs mx-auto ">
              {playerTeam && (
                <div className="absolute top-0 right-6">
                  <Image
                    src={getTeamLogoUrl(playerTeam.logo) || '/default-player.jpg'}
                    alt={playerName}
                    width={100}
                    height={100}
                    className="object-cover overflow-hidden"
                  />
                </div>
              )}
              <div className='relative'>
              <Image
                src={playerImage}
                alt={playerName}
                width={300}
                height={300}
                className="w-full h-full object-cover rounded-lg"
              />
              </div>
            </div>

            <div className="w-full mt-4">
              <div className="flex flex-col mb-2">
                <div className="flex gap-1">
                  <h1 className="font-bold mb-1">
                    {playerName}
                  </h1>
                  {player?.Core?.ADP && (
                    <div className="bg-yellow-500 text-black px-2 py-1 rounded-full text-xs flex items-center gap-1 mb-2">
                      <Image src="/underdog.webp" alt="ADP" width={20} height={13} />
                      ADP: {player.Core.ADP}
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-start gap-1 text-sm text-gray-300">
                  <span>{teamName || 'N/A'}</span>
                  <div>
                  <p><span>{player?.Core['ADP Year']}</span> - <span>{player?.Core?.Position}</span></p>
                  </div>
                </div>
              </div>
              <button
                className={`text-white text-sm border px-4 py-1 rounded-sm transition-colors ${isFollowing ? 'bg-red-800 border-red-800' : 'border-red-800 hover:bg-red-800'} mt-2`}
                onClick={() => setIsFollowing(f => !f)}
              >
                {isFollowing ? 'FOLLOWING' : 'FOLLOW'}
              </button>
            </div>
          </div>


          <div className="flex-1 flex gap-8 text-left items-center justify-center space-y-3 mt-4 mb-2">
            <div className="flex flex-col gap-3 w-28">
              <div className="flex flex-col items-start leading-tight">
                <h1 className="text-[#796D97]">
                  HT/WT
                </h1>
                <h1>
                  {player?.Core?.Height} , {player?.Core?.Weight}
                </h1>
              </div>
              <div className="flex flex-col items-start leading-tight">
                <h1 className="text-[#796D97]">
                  Age
                </h1>
                <h1>
                  {player?.Core?.Age}
                </h1>
              </div>
              <div className="flex flex-col items-start leading-tight">
                <h1 className="text-[#796D97]">
                  Draft Info
                </h1>
                <h1>
                  {player?.Core?.['Draft Pick']} ({player?.Core?.['Draft Year']})
                </h1>
              </div>
            </div>

            <div className="h-36 w-px bg-white/20"></div>
            <div className="flex flex-col gap-3">
              <div className="flex flex-col items-start leading-tight">
                <h1 className="text-[#796D97]">
                  BMI
                </h1>
                <h1>
                  {player?.Core?.BMI} ({player?.Core?.['BMI Rank']}th)
                </h1>
              </div>
              <div className="flex flex-col items-start leading-tight">
                <h1 className="text-[#796D97]">
                  Status
                </h1>
                <h1>
                  {player?.Core?.Active ? 'Active' : 'Inactive'}
                </h1>
              </div>
              <div className="flex flex-col items-start leading-tight">
                <h1 className=" text-[#796D97]">
                  College
                </h1>
                <h1>
                  {player?.Core?.College}
                </h1>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 pb-16 pt-16">
        <div className="grid lg:grid-cols-1 gap-8">
          {/* Player Details and Tabs */}
          <div className="lg:col-span-2 space-y-8">
            {/* Tabs Section */}
            <div className="rounded border border-white/20 shadow-xl overflow-hidden">
              {/* Tab Navigation */}
              <div className="border-b border-white/20">
                <nav className="flex space-x-0">
                  {tabs.map((tab) => {
                    const IconComponent = tab.icon
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 text-sm font-semibold transition-all bg-card ${activeTab === tab.id
                          ? 'bg-red-800 text-white border-b-2 border-red-600'
                          : 'text-white hover:text-red-800'
                          }`}
                      >
                        <IconComponent className="w-4 h-4" />
                        <span className="hidden sm:inline">{tab.label}</span>
                      </button>
                    )
                  })}
                </nav>
              </div>

              {/* Tab Content */}
              <div className="p-4">
                {renderTabContent()}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center gap-2 mt-10 mb-4">
        <h1 className="text-sm">Data Powered By PlayerProfiler </h1>
        <Link
          href='https://playerprofiler.com/'
          target="_blank"
        >
          <Image
            src="/pp-logo.png"
            width={30}
            height={30}
            alt="pp=logo"
          />
        </Link>
      </div>
    </div>
  )
} 