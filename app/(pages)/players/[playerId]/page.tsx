'use client'

import { useParams, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { Trophy, Activity, Timer, Target, ArrowLeft } from 'lucide-react'
import { getImageUrl, useGetPlayerQuery, useGetPlayersQuery, useGetPlayerProfilerQuery, useGetPlayerPerformanceProfilerQuery } from '@/lib/services/playersApi'
import { useGetNuggetsByPlayerIdQuery, getImageUrl as getNuggetImageUrl } from '@/lib/services/nuggetsApi'
import { useAuth } from '@/lib/hooks/useAuth'
import { ReadMore } from '@/app/components/ReadMore'
import { ChartConfig, ChartContainer } from "@/components/ui/chart"
import { Bar, BarChart, LabelList, XAxis, Cell, YAxis } from "recharts"

export default function PlayerProfile() {
  const params = useParams()
  const searchParams = useSearchParams()
  const playerId = params.playerId as string

  // Tab state
  const [activeTab, setActiveTab] = useState('workout')
  
  // Year selection state for performance metrics
  const [selectedYear, setSelectedYear] = useState('2023')

  // Get the page number user came from (for back navigation)
  const fromPage = searchParams?.get('page')
  const backToPlayersUrl = fromPage ? `/players?page=${fromPage}` : '/players'

  // Add authentication check
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const { user, isLoading: premiumLoading } = useAuth()

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
      const playerTeam = p.team || p.teamName || p.Team?.Name
      return playerTeam === currentTeam && p.id !== basicPlayer?.id
    })

  // Debug logging
  console.log('Current player team:', currentTeam)
  console.log('All players count:', allPlayers.length)
  console.log('Teammates found:', teammates.length)
  console.log('Sample teammates:', teammates.slice(0, 3).map(t => ({ name: t.name, team: t.team })))

  const loading = playerLoading || teamLoading || authLoading || premiumLoading || internalPlayerLoading || performanceLoading

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
    { id: 'workout', label: 'Workout Metrics', icon: Timer },
    { id: 'performance', label: 'Performance Metrics', icon: Trophy },
    { id: 'news', label: 'News & Updates', icon: Activity }
  ]

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

  // Render tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'workout':
        return (
          <div className="space-y-8">
            {/* Workout Metrics - Only show if Player Profiler data is available */}
            {player?.['Workout Metrics'] ? (
              <div className="p-8 border rounded-xl">
                <h2 className="text-3xl font-black mb-8">Workout Metrics</h2>

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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">

                  <div className="border-2 bg-card rounded p-2 flex flex-col justify-around">
                    <div className="flex items-center justify-between text-lg">
                        <h1>{player['College Performance']['College Dominator Rating']}</h1>
                        <h2 className="mr-2">{player['College Performance']['College Dominator Rating Rank']}</h2>
                    </div>
                    <div className="flex items-end">
                      <span className="text-lg font-semibold">College Dominator</span>
                    </div>
                  </div>

                  <div className="border-2 bg-card rounded p-2 flex flex-col justify-around">
                    <div className="flex items-center justify-between text-lg">
                        <h1>{player['College Performance']['College Target Share']}%</h1>
                        <h2 className="mr-2">{player['College Performance']['College Target Share Rank']}</h2>
                    </div>
                    <div className="flex items-end">
                      <span className="text-lg font-semibold">College Target Share</span>
                    </div>
                  </div>



                  <div className="border-2 bg-card rounded p-2 flex flex-col justify-around">
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
                <Timer className="w-16 h-16 text-gray-400 mx-auto mb-4" />
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
            <div className="rounded-xl p-8 border">
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
                      className="px-4 py-2 border rounded-lg bg-card text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-500"
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
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Opportunity</h3>
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="bg-gray-50 dark:bg-gray-700">
                              <th className="text-xs font-semibold p-3 text-left text-gray-700 dark:text-gray-300">TARGETS</th>
                              <th className="text-xs font-semibold p-3 text-left text-gray-700 dark:text-gray-300">TARGET SHARE</th>
                              <th className="text-xs font-semibold p-3 text-left text-gray-700 dark:text-gray-300">TARGET RATE</th>
                              <th className="text-xs font-semibold p-3 text-left text-gray-700 dark:text-gray-300">SNAP SHARE</th>
                              <th className="text-xs font-semibold p-3 text-left text-gray-700 dark:text-gray-300">SLOT SNAPS</th>
                              <th className="text-xs font-semibold p-3 text-left text-gray-700 dark:text-gray-300">ROUTES RUN</th>
                              <th className="text-xs font-semibold p-3 text-left text-gray-700 dark:text-gray-300">ROUTE PARTICIPATION</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="bg-white dark:bg-gray-800">
                              <td className="p-3 border-r border-gray-200 dark:border-gray-600">
                                <div className="text-lg font-bold text-gray-900 dark:text-white">{performanceData['Targets']}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">#{performanceData['Targets Rank']}</div>
                              </td>
                              <td className="p-3 border-r border-gray-200 dark:border-gray-600">
                                <div className="text-lg font-bold text-gray-900 dark:text-white">{parseFloat(performanceData['Target Share']).toFixed(2)}%</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">#{performanceData['Target Share Rank']}</div>
                              </td>
                              <td className="p-3 border-r border-gray-200 dark:border-gray-600">
                                <div className="text-lg font-bold text-gray-900 dark:text-white">{parseFloat(performanceData['Target Rate']).toFixed(2)}%</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">#{performanceData['Target Rate Rank']}</div>
                              </td>
                              <td className="p-3 border-r border-gray-200 dark:border-gray-600">
                                <div className="text-lg font-bold text-gray-900 dark:text-white">{parseFloat(performanceData['Snap Share']).toFixed(2)}%</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">#{performanceData['Snap Share Rank']}</div>
                              </td>
                              <td className="p-3 border-r border-gray-200 dark:border-gray-600">
                                <div className="text-lg font-bold text-gray-900 dark:text-white">{performanceData['Slot Snaps']}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">#{performanceData['Slot Snaps Rank']}</div>
                              </td>
                              <td className="p-3 border-r border-gray-200 dark:border-gray-600">
                                <div className="text-lg font-bold text-gray-900 dark:text-white">{performanceData['Routes Run']}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">#{performanceData['Routes Run Rank']}</div>
                              </td>
                              <td className="p-3">
                                <div className="text-lg font-bold text-gray-900 dark:text-white">{parseFloat(performanceData['Route Participation']).toFixed(2)}%</div>
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
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Opportunity</h3>
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="bg-gray-50 dark:bg-gray-700">
                              <th className="text-xs font-semibold p-3 text-left text-gray-700 dark:text-gray-300">AIR YARDS</th>
                              <th className="text-xs font-semibold p-3 text-left text-gray-700 dark:text-gray-300">AIR YARDS SHARE</th>
                              <th className="text-xs font-semibold p-3 text-left text-gray-700 dark:text-gray-300">AVERAGE TARGET DISTANCE (ADOT)</th>
                              <th className="text-xs font-semibold p-3 text-left text-gray-700 dark:text-gray-300">DEEP TARGETS</th>
                              <th className="text-xs font-semibold p-3 text-left text-gray-700 dark:text-gray-300">RED ZONE TARGETS</th>
                              <th className="text-xs font-semibold p-3 text-left text-gray-700 dark:text-gray-300">TARGET QUALITY RATING</th>
                              <th className="text-xs font-semibold p-3 text-left text-gray-700 dark:text-gray-300">CATCHABLE TARGET RATE</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="bg-white dark:bg-gray-800">
                              <td className="p-3 border-r border-gray-200 dark:border-gray-600">
                                <div className="text-lg font-bold text-gray-900 dark:text-white">{performanceData['Air Yards']}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">#{performanceData['Air Yards Rank']}</div>
                              </td>
                              <td className="p-3 border-r border-gray-200 dark:border-gray-600">
                                <div className="text-lg font-bold text-gray-900 dark:text-white">{formatNumber(performanceData['Air Yards Share'])}%</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">#{performanceData['Air Yards Share Rank']}</div>
                              </td>
                              <td className="p-3 border-r border-gray-200 dark:border-gray-600">
                                <div className="text-lg font-bold text-gray-900 dark:text-white">{formatNumber(performanceData['Average Target Distance'])}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">#{performanceData['Average Target Distance Rank']}</div>
                              </td>
                              <td className="p-3 border-r border-gray-200 dark:border-gray-600">
                                <div className="text-lg font-bold text-gray-900 dark:text-white">{performanceData['Deep Targets']}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">#{performanceData['Deep Targets Rank']}</div>
                              </td>
                              <td className="p-3 border-r border-gray-200 dark:border-gray-600">
                                <div className="text-lg font-bold text-gray-900 dark:text-white">{performanceData['Red Zone Targets']}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">#{performanceData['Red Zone Targets Rank']}</div>
                              </td>
                              <td className="p-3 border-r border-gray-200 dark:border-gray-600">
                                <div className="text-lg font-bold text-gray-900 dark:text-white">{formatNumber(performanceData['Target Quality Rating'])}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">#{performanceData['Target Quality Rating Rank']}</div>
                              </td>
                              <td className="p-3">
                                <div className="text-lg font-bold text-gray-900 dark:text-white">{formatNumber(performanceData['Catchable Target Rate'])}%</div>
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
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Productivity</h3>
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="bg-gray-50 dark:bg-gray-700">
                              <th className="text-xs font-semibold p-3 text-left text-gray-700 dark:text-gray-300">RECEPTIONS</th>
                              <th className="text-xs font-semibold p-3 text-left text-gray-700 dark:text-gray-300">RECEIVING YARDS</th>
                              <th className="text-xs font-semibold p-3 text-left text-gray-700 dark:text-gray-300">YARDS AFTER CATCH</th>
                              <th className="text-xs font-semibold p-3 text-left text-gray-700 dark:text-gray-300">UNREALIZED AIR YARDS</th>
                              <th className="text-xs font-semibold p-3 text-left text-gray-700 dark:text-gray-300">TOTAL TDS</th>
                              <th className="text-xs font-semibold p-3 text-left text-gray-700 dark:text-gray-300">FANTASY POINTS PER GAME</th>
                              <th className="text-xs font-semibold p-3 text-left text-gray-700 dark:text-gray-300">EXPECTED FANTASY POINTS PER GAME</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="bg-white dark:bg-gray-800">
                              <td className="p-3 border-r border-gray-200 dark:border-gray-600">
                                <div className="text-lg font-bold text-gray-900 dark:text-white">{performanceData['Receptions']}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">#{performanceData['Receptions Rank']}</div>
                              </td>
                              <td className="p-3 border-r border-gray-200 dark:border-gray-600">
                                <div className="text-lg font-bold text-gray-900 dark:text-white">{performanceData['Receiving Yards']}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">#{performanceData['Receiving Yards Rank']}</div>
                              </td>
                              <td className="p-3 border-r border-gray-200 dark:border-gray-600">
                                <div className="text-lg font-bold text-gray-900 dark:text-white">{performanceData['Yards After Catch']}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">#{performanceData['Yards After Catch Rank']}</div>
                              </td>
                              <td className="p-3 border-r border-gray-200 dark:border-gray-600">
                                <div className="text-lg font-bold text-gray-900 dark:text-white">{performanceData['Unrealized Air Yards']}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">#{performanceData['Unrealized Air Yards Rank']}</div>
                              </td>
                              <td className="p-3 border-r border-gray-200 dark:border-gray-600">
                                <div className="text-lg font-bold text-gray-900 dark:text-white">{performanceData['Total Touchdowns']}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">#{performanceData['Total Touchdowns Rank']}</div>
                              </td>
                              <td className="p-3 border-r border-gray-200 dark:border-gray-600">
                                <div className="text-lg font-bold text-gray-900 dark:text-white">{formatNumber(performanceData['Fantasy Points Per Game'])}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">#{performanceData['Fantasy Points Per Game Rank']}</div>
                              </td>
                              <td className="p-3">
                                <div className="text-lg font-bold text-gray-900 dark:text-white">{formatNumber(performanceData['Expected Fantasy Points Per Game'])}</div>
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
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Efficiency</h3>
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="bg-gray-50 dark:bg-gray-700">
                              <th className="text-xs font-semibold p-3 text-left text-gray-700 dark:text-gray-300">TARGET ACCURACY</th>
                              <th className="text-xs font-semibold p-3 text-left text-gray-700 dark:text-gray-300">YARDS PER ROUTE RUN</th>
                              <th className="text-xs font-semibold p-3 text-left text-gray-700 dark:text-gray-300">FORMATION ADJUSTED YARDS PER ROUTE RUN</th>
                              <th className="text-xs font-semibold p-3 text-left text-gray-700 dark:text-gray-300">YARDS PER TARGET</th>
                              <th className="text-xs font-semibold p-3 text-left text-gray-700 dark:text-gray-300">YARDS PER RECEPTION</th>
                              <th className="text-xs font-semibold p-3 text-left text-gray-700 dark:text-gray-300">YARDS PER TEAM PASS ATTEMPT</th>
                              <th className="text-xs font-semibold p-3 text-left text-gray-700 dark:text-gray-300">TRUE CATCH RATE</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="bg-white dark:bg-gray-800">
                              <td className="p-3 border-r border-gray-200 dark:border-gray-600">
                                <div className="text-lg font-bold text-gray-900 dark:text-white">{formatNumber(performanceData['Target Accuracy'])}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">#{performanceData['Target Accuracy Rank']}</div>
                              </td>
                              <td className="p-3 border-r border-gray-200 dark:border-gray-600">
                                <div className="text-lg font-bold text-gray-900 dark:text-white">{formatNumber(performanceData['Yards Per Route Run'])}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">#{performanceData['Yards Per Route Run Rank']}</div>
                              </td>
                              <td className="p-3 border-r border-gray-200 dark:border-gray-600">
                                <div className="text-lg font-bold text-gray-900 dark:text-white">{formatNumber(performanceData['Formation Adjusted Yards Per Route Run'])}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">#{performanceData['Formation Adjusted Yards Per Route Run Rank']}</div>
                              </td>
                              <td className="p-3 border-r border-gray-200 dark:border-gray-600">
                                <div className="text-lg font-bold text-gray-900 dark:text-white">{formatNumber(performanceData['Yards Per Target'])}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">#{performanceData['Yards Per Target Rank']}</div>
                              </td>
                              <td className="p-3 border-r border-gray-200 dark:border-gray-600">
                                <div className="text-lg font-bold text-gray-900 dark:text-white">{formatNumber(performanceData['Yards Per Reception'])}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">#{performanceData['Yards Per Reception Rank']}</div>
                              </td>
                              <td className="p-3 border-r border-gray-200 dark:border-gray-600">
                                <div className="text-lg font-bold text-gray-900 dark:text-white">{formatNumber(performanceData['Yards Per Team Pass Attempt'])}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">#{performanceData['Yards Per Team Pass Attempt Rank']}</div>
                              </td>
                              <td className="p-3">
                                <div className="text-lg font-bold text-gray-900 dark:text-white">{formatNumber(performanceData['True Catch Rate'])}%</div>
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
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Efficiency</h3>
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="bg-gray-50 dark:bg-gray-700">
                              <th className="text-xs font-semibold p-3 text-left text-gray-700 dark:text-gray-300">TARGET SEPARATION</th>
                              <th className="text-xs font-semibold p-3 text-left text-gray-700 dark:text-gray-300">TARGET PREMIUM</th>
                              <th className="text-xs font-semibold p-3 text-left text-gray-700 dark:text-gray-300">DOMINATOR RATING</th>
                              <th className="text-xs font-semibold p-3 text-left text-gray-700 dark:text-gray-300">JUKE RATE</th>
                              <th className="text-xs font-semibold p-3 text-left text-gray-700 dark:text-gray-300">EXPLOSIVE RATING</th>
                              <th className="text-xs font-semibold p-3 text-left text-gray-700 dark:text-gray-300">DROPS</th>
                              <th className="text-xs font-semibold p-3 text-left text-gray-700 dark:text-gray-300">CONTESTED CATCH RATE</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="bg-white dark:bg-gray-800">
                              <td className="p-3 border-r border-gray-200 dark:border-gray-600">
                                <div className="text-lg font-bold text-gray-900 dark:text-white">{formatNumber(performanceData['Target Separation'])}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">#{performanceData['Target Separation Rank']}</div>
                              </td>
                              <td className="p-3 border-r border-gray-200 dark:border-gray-600">
                                <div className="text-lg font-bold text-gray-900 dark:text-white">{formatNumber(performanceData['Target Premium'])}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">#{performanceData['Target Premium Rank']}</div>
                              </td>
                              <td className="p-3 border-r border-gray-200 dark:border-gray-600">
                                <div className="text-lg font-bold text-gray-900 dark:text-white">{formatNumber(performanceData['Dominator Rating'])}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">#{performanceData['Dominator Rating Rank']}</div>
                              </td>
                              <td className="p-3 border-r border-gray-200 dark:border-gray-600">
                                <div className="text-lg font-bold text-gray-900 dark:text-white">{formatNumber(performanceData['Juke Rate'])}%</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">#{performanceData['Juke Rate Rank']}</div>
                              </td>
                              <td className="p-3 border-r border-gray-200 dark:border-gray-600">
                                <div className="text-lg font-bold text-gray-900 dark:text-white">N/A</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">#N/A</div>
                              </td>
                              <td className="p-3 border-r border-gray-200 dark:border-gray-600">
                                <div className="text-lg font-bold text-gray-900 dark:text-white">{performanceData['Drops']}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">#{performanceData['Drops Rank']}</div>
                              </td>
                              <td className="p-3">
                                <div className="text-lg font-bold text-gray-900 dark:text-white">{formatNumber(performanceData['Contested Catch Conversion Rate'])}%</div>
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
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Efficiency</h3>
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="bg-gray-50 dark:bg-gray-700">
                              <th className="text-xs font-semibold p-3 text-left text-gray-700 dark:text-gray-300">PRODUCTION PREMIUM</th>
                              <th className="text-xs font-semibold p-3 text-left text-gray-700 dark:text-gray-300">EXPECTED POINTS ADDED (EPA)</th>
                              <th className="text-xs font-semibold p-3 text-left text-gray-700 dark:text-gray-300">QB RATING PER TARGET</th>
                              <th className="text-xs font-semibold p-3 text-left text-gray-700 dark:text-gray-300">BEST BALL POINTS ADDED</th>
                              <th className="text-xs font-semibold p-3 text-left text-gray-700 dark:text-gray-300">FANTASY POINTS PER ROUTE RUN</th>
                              <th className="text-xs font-semibold p-3 text-left text-gray-700 dark:text-gray-300">FANTASY POINTS PER TARGET</th>
                              <th className="text-xs font-semibold p-3 text-left text-gray-700 dark:text-gray-300">TOTAL FANTASY POINTS</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="bg-white dark:bg-gray-800">
                              <td className="p-3 border-r border-gray-200 dark:border-gray-600">
                                <div className="text-lg font-bold text-gray-900 dark:text-white">{formatNumber(performanceData['Production Premium'])}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">#{performanceData['Production Premium Rank']}</div>
                              </td>
                              <td className="p-3 border-r border-gray-200 dark:border-gray-600">
                                <div className="text-lg font-bold text-gray-900 dark:text-white">{formatNumber(performanceData['Expected Points Added'])}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">#{performanceData['Expected Points Added Rank']}</div>
                              </td>
                              <td className="p-3 border-r border-gray-200 dark:border-gray-600">
                                <div className="text-lg font-bold text-gray-900 dark:text-white">{formatNumber(performanceData['QB Rating When Targeted'])}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">#{performanceData['QB Rating When Targeted Rank']}</div>
                              </td>
                              <td className="p-3 border-r border-gray-200 dark:border-gray-600">
                                <div className="text-lg font-bold text-gray-900 dark:text-white">{formatNumber(performanceData['Best Ball Points Added'])}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">#{performanceData['Best Ball Points Added Rank']}</div>
                              </td>
                              <td className="p-3 border-r border-gray-200 dark:border-gray-600">
                                <div className="text-lg font-bold text-gray-900 dark:text-white">{formatNumber(performanceData['Fantasy Points Per Route Run'])}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">#{performanceData['Fantasy Points Per Route Run Rank']}</div>
                              </td>
                              <td className="p-3 border-r border-gray-200 dark:border-gray-600">
                                <div className="text-lg font-bold text-gray-900 dark:text-white">{formatNumber(performanceData['Fantasy Points Per Target'])}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">#{performanceData['Fantasy Points Per Target Rank']}</div>
                              </td>
                              <td className="p-3">
                                <div className="text-lg font-bold text-gray-900 dark:text-white">{formatNumber(performanceData['Total Fantasy Points'])}</div>
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
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Zone vs Man</h3>
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="bg-gray-50 dark:bg-gray-700">
                              <th className="text-xs font-semibold p-3 text-left text-gray-700 dark:text-gray-300">TOTAL ROUTE WINS</th>
                              <th className="text-xs font-semibold p-3 text-left text-gray-700 dark:text-gray-300">ROUTE WIN RATE</th>
                              <th className="text-xs font-semibold p-3 text-left text-gray-700 dark:text-gray-300">ROUTES VS MAN</th>
                              <th className="text-xs font-semibold p-3 text-left text-gray-700 dark:text-gray-300">WIN RATE VS MAN</th>
                              <th className="text-xs font-semibold p-3 text-left text-gray-700 dark:text-gray-300">TARGET RATE VS MAN</th>
                              <th className="text-xs font-semibold p-3 text-left text-gray-700 dark:text-gray-300">TARGET SEPARATION VS MAN</th>
                              <th className="text-xs font-semibold p-3 text-left text-gray-700 dark:text-gray-300">FANTASY POINTS PER TARGET VS MAN</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="bg-white dark:bg-gray-800">
                              <td className="p-3 border-r border-gray-200 dark:border-gray-600">
                                <div className="text-lg font-bold text-gray-900 dark:text-white">{performanceData['Total Route Wins']}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">#{performanceData['Total Route Wins Rank']}</div>
                              </td>
                              <td className="p-3 border-r border-gray-200 dark:border-gray-600">
                                <div className="text-lg font-bold text-gray-900 dark:text-white">{formatNumber(performanceData['Route Win Rate'])}%</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">#{performanceData['Route Win Rate Rank']}</div>
                              </td>
                              <td className="p-3 border-r border-gray-200 dark:border-gray-600">
                                <div className="text-lg font-bold text-gray-900 dark:text-white">{performanceData['Routes vs Man']}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">#{performanceData['Routes vs Man Rank']}</div>
                              </td>
                              <td className="p-3 border-r border-gray-200 dark:border-gray-600">
                                <div className="text-lg font-bold text-gray-900 dark:text-white">{formatNumber(performanceData['Win Rate vs Man'])}%</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">#{performanceData['Win Rate vs Man Rank']}</div>
                              </td>
                              <td className="p-3 border-r border-gray-200 dark:border-gray-600">
                                <div className="text-lg font-bold text-gray-900 dark:text-white">{formatNumber(performanceData['Target Rate vs Man'])}%</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">#{performanceData['Target Rate vs Man Rank']}</div>
                              </td>
                              <td className="p-3 border-r border-gray-200 dark:border-gray-600">
                                <div className="text-lg font-bold text-gray-900 dark:text-white">{formatNumber(performanceData['Target Separation vs Man'])}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">#{performanceData['Target Separation vs Man Rank']}</div>
                              </td>
                              <td className="p-3">
                                <div className="text-lg font-bold text-gray-900 dark:text-white">{formatNumber(performanceData['Fantasy Points Per Target vs Man'])}</div>
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
                  <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
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
          <div className="space-y-8">
            <h2 className="text-3xl font-black mb-8">News & Updates</h2>
            
            {nuggetsLoading ? (
              <div className="space-y-6">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="rounded-xl border shadow-lg overflow-hidden animate-pulse">
                    <div className="p-6">
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
            ) : nuggets.length > 0 ? (
              <div className="space-y-6 container mx-auto max-w-3xl">
                {nuggets.map((nugget, index) => (
                  <div key={`${nugget.id}-${index}`} className="rounded-xl border-2 overflow-hidden shadow-md hover:shadow-xl transition-shadow">
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
                        <h3 className='text-xl font-bold'>{nugget.player.name}</h3>
                      </div>
                    </div>

                    {/* Nugget Content */}
                    <div className="px-6 py-4">
                      <ReadMore id={nugget.id.toString()} text={nugget.content} amountOfCharacters={400} />
                    </div>

                    {/* Fantasy Insight */}
                    {nugget.fantasyInsight && (
                      <div className='px-6 py-4  border-gray-100'>
                        <h4 className='font-semibold mb-2 text-red-800'>Fantasy Insight:</h4>
                        <div>
                          {renderFantasyInsight(nugget.fantasyInsight)}
                        </div>
                      </div>
                    )}

                    {/* Source and Date */}
                    <div className='px-6 py-4 border-gray-50'>
                      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2'>
                        <div className='text-sm'>
                          <p>
                            <span className="font-bold">Source:</span> {nugget.sourceName}
                          </p>
                          {nugget.sourceUrl && (
                            <Link 
                              href={nugget.sourceUrl.startsWith('http://') || nugget.sourceUrl.startsWith('https://') 
                                ? nugget.sourceUrl 
                                : `https://${nugget.sourceUrl}`} 
                              target='_blank'
                              rel='noopener noreferrer' 
                              className='hover:text-blue-800 text-sm'
                            >
                              {nugget.sourceUrl}
                            </Link>
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
                ))}
              </div>
            ) : (
              <div className="rounded-xl p-8 shadow-xl border text-center">
                <Activity className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-600 mb-2">No News Available</h3>
                <p className="text-gray-500 mb-6">There are currently no news available for {playerName}. Check back later for updates!</p>
              </div>
            )}
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen">
      {/* Back Navigation */}
      <div className="container mx-auto px-4 pt-6">
        <Link
          href={backToPlayersUrl}
          className="inline-flex items-center hover:text-red-800 transition-colors mb-6"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          <span className="text-lg font-medium">
            Back to Players
          </span>
        </Link>
      </div>

      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-red-900 via-red-800 to-red-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="container mx-auto px-4 py-16 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            {/* Player Image */}
            <div className="relative pl-6 pb-4">
              <div className="w-80 h-80 lg:w-80 lg:h-60 rounded border-2 border-white/90 overflow-hidden">
                <Image
                  src={playerImage}
                  alt={playerName}
                  width={400}
                  height={400}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Player Info */}
            <div className="flex-1 text-center lg:text-left">
              <div className="mb-4">
                <div className="flex flex-col lg:flex-row items-center lg:items-baseline gap-4 lg:gap-6 mb-4">
                  <h1 className="text-3xl lg:text-5xl font-black leading-none">
                    {playerName}
                  </h1>
                  {player?.Core?.ADP && (
                    <div className="bg-yellow-500 text-black px-3 py-1 rounded-full text-sm font-bold">
                      ADP: {player.Core.ADP} ({player.Core['ADP Year']})
                    </div>
                  )}
                </div>
                <div className="flex flex-col lg:flex-row items-center lg:items-center gap-4 lg:gap-8">
                  <span className="text-xl lg:text-2xl">
                    {teamName || 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="container mx-auto px-4 -mt-16 relative z-20 mb-12">
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
          <div className="bg-card rounded p-6 shadow-xl border-2">
            <div className="flex items-center mb-3">
              <span className="text-sm font-medium">Height</span>
            </div>
            <div className="text-2xl">{basicPlayer?.height}</div>
          </div>

          <div className="bg-card rounded p-6 shadow-xl border-2">
            <div className="flex items-center mb-3">

              <span className="text-sm font-medium">Weight</span>
            </div>
            <div className="text-2xl">{player?.Core?.Weight || basicPlayer?.weight || 'N/A'}</div>
          </div>

          <div className="bg-card rounded p-6 shadow-xl border-2">
            <div className="flex items-center mb-3">

              <span className="text-sm font-medium">Arm Length</span>
            </div>
            <div className="text-2xl">{player?.Core['Arm Length']} <span className="text-sm">({player?.Core['Arm Length Rank']})</span></div>

          </div>

          <div className="bg-card rounded p-6 shadow-xl border-2">
            <div className="flex items-center mb-3">

              <span className="text-sm font-medium">Draft Pick</span>
            </div>
            <div className="text-2xl">{player?.Core?.['Draft Pick']} <span className="text-sm">({player?.Core?.['Draft Year']})</span>

            </div>
          </div>
          <div className="bg-card rounded p-6 shadow-xl border-2">
            <div className="flex items-center mb-3">

              <span className="text-sm font-medium">College</span>
            </div>
            <div className="text-2xl">{basicPlayer?.college}</div>
          </div>
          <div className="bg-card rounded p-6 shadow-xl border-2">
            <div className="flex items-center mb-3">

              <span className="text-sm font-medium">Age</span>
            </div>
            <div className="text-2xl">{basicPlayer?.age}</div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 pb-16">
        <div className="grid lg:grid-cols-1 gap-8">
          {/* Player Details and Tabs */}
          <div className="lg:col-span-2 space-y-8">
            {/* Tabs Section */}
            <div className="rounded shadow-xl border overflow-hidden">
              {/* Tab Navigation */}
              <div className="border-b">
                <nav className="flex space-x-0">
                  {tabs.map((tab) => {
                    const IconComponent = tab.icon
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 text-sm font-semibold transition-all bg-card ${activeTab === tab.id
                          ? 'bg-red-800 text-white border-b-2 border-red-600'
                          : 'text-gray-600 hover:text-red-800'
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
              <div className="p-8">
                {renderTabContent()}
              </div>
            </div>
          </div>


        
        {/* Teammates Section - After Tabs */}
        {teammates.length > 0 && (
          <div className="mt-12">
            <h3 className="text-3xl font-black mb-8 text-center">Teammates</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {teammates.map((teammate) => (
                <Link
                  key={teammate.id}
                  href={`/players/${teammate.id}`}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  <div className="aspect-square bg-gradient-to-br from-red-50 to-red-100 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center p-4">
                    <Image
                      src={getImageUrl(teammate.headshotPic) || '/default-player.jpg'}
                      alt={teammate.name}
                      width={120}
                      height={120}
                      className="rounded-full object-cover border-4 border-white shadow-lg"
                    />
                  </div>
                  <div className="p-4 text-center">
                    <h4 className="font-bold text-lg text-gray-900 dark:text-white mb-1">{teammate.name}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{teammate.position}</p>
                    <div className="inline-block bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 text-xs px-2 py-1 rounded-full">
                      {teammate.team || teamName}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            
            <div className="text-center mt-8">
              <Link
                href={backToPlayersUrl}
                className="inline-flex items-center gap-2 bg-red-800 hover:bg-red-900 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                View All Players
                <ArrowLeft className="w-4 h-4 rotate-180" />
              </Link>
            </div>
          </div>
        )}
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