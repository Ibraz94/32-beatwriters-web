'use client'

import { useParams, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { Trophy, Activity, Timer, Target, ArrowLeft } from 'lucide-react'
import { getImageUrl, useGetPlayerQuery, useGetPlayersQuery, useGetPlayerProfilerQuery } from '@/lib/services/playersApi'
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

  // Extract player data from the nested response
  const player = playerResponse?.data?.Player
  const basicPlayer = internalPlayer // Data from internal API

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

  // Fetch all players for teammates
  const { data: playersResponse } = useGetPlayersQuery({
    page: 1,
    limit: 12
  })
  const allPlayers = playersResponse?.data?.players || []

  // Get teammates (same team, different player)
  const teammates = allPlayers
    .filter(p => p.team === (player?.Core?.Team?.Name || basicPlayer?.team) && p.id !== basicPlayer?.id)
    .slice(0, 6)

  const loading = playerLoading || teamLoading || authLoading || premiumLoading || internalPlayerLoading

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
                    <div className="w-full hidden sm:block">
                      <ChartContainer config={chartConfig} className="h-[450px] w-full">
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
                          margin={{ top: 30, right: 10, left: 10, bottom: 50 }}
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
        return (
          <div className="space-y-8">
            {/* Performance Metrics - Only show if Player Profiler data is available */}
            {player?.['College Performance'] ? (
              <div className="rounded-xl p-8  border">
                <h2 className="text-2xl font-black mb-8">Performance Metrics</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="border-2 bg-card rounded-xl p-4">
                    <div className="flex items-center mb-2">
                        <h1>Opportunity</h1>
                    </div>
                    <div className="text-2xl font-bold">{player['College Performance']['Breakout Age']}</div>
                    <div className="text-sm">Rank: {player['College Performance']['Breakout Age Rank']}</div>
                  </div>

                  <div className="border-2 bg-card rounded-xl p-4">
                    <div className="flex items-center mb-2">
                      <Target className="w-5 h-5 text-red-600 mr-2" />
                      <span className="font-semibold">Dominator Rating</span>
                    </div>
                    <div className="text-2xl font-bold">{player['College Performance']['College Dominator Rating']}</div>
                    <div className="text-sm">Rank: {player['College Performance']['College Dominator Rating Rank'] || 'N/A'}</div>
                  </div>

                  {player['College Performance']['College YPC'] && (
                    <div className="border-2 bg-card rounded-xl p-4">
                      <div className="flex items-center mb-2">
                        <Activity className="w-5 h-5 text-red-600 mr-2" />
                        <span className="font-semibold">Yards Per Carry</span>
                      </div>
                      <div className="text-2xl font-bold">{player['College Performance']['College YPC']}</div>
                      <div className="text-sm">Rank: {player['College Performance']['College YPC Rank'] || 'N/A'}</div>
                    </div>
                  )}

                  <div className="border-2 bg-card rounded-xl p-4">
                    <div className="flex items-center mb-2">
                      <Trophy className="w-5 h-5 text-red-600 mr-2" />
                      <span className="font-semibold">Breakout Rating</span>
                    </div>
                    <div className="text-2xl font-bold">{player['College Performance']['Breakout Rating']}</div>
                    <div className="text-sm">Rank: {player['College Performance']['Breakout Rating Rank'] || 'N/A'}</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-xl p-8 shadow-xl border text-center">
                <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-600 mb-2">Performance Metrics Unavailable</h3>
                <p className="text-gray-500">Detailed performance metrics are not available for this player.</p>
              </div>
            )}
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
                      <div className='px-6 py-4 border-t border-gray-100'>
                        <h4 className='font-semibold mb-2 text-red-800'>Fantasy Insight:</h4>
                        <div className="text-gray-700">
                          {renderFantasyInsight(nugget.fantasyInsight)}
                        </div>
                      </div>
                    )}

                    {/* Source and Date */}
                    <div className='px-6 py-4 border-t border-gray-50'>
                      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2'>
                        <div className='text-sm'>
                          <p className='text-gray-600'>
                            <span className="font-medium">Source:</span> {nugget.sourceName}
                          </p>
                          {nugget.sourceUrl && (
                            <Link 
                              href={nugget.sourceUrl.startsWith('http://') || nugget.sourceUrl.startsWith('https://') 
                                ? nugget.sourceUrl 
                                : `https://${nugget.sourceUrl}`} 
                              target='_blank'
                              rel='noopener noreferrer' 
                              className='text-blue-600 hover:text-blue-800 text-sm'
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
                <h1 className="text-3xl lg:text-5xl font-black mb-4 leading-none">
                  {playerName}
                </h1>
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


          {/* Teammates Sidebar */}
          <div className="space-y-8">
            {teammates.length > 0 && (
              <div className="rounded-3xl p-6 shadow-xl border">
                <h3 className="text-2xl font-black mb-6">Teammates</h3>

                <div className="space-y-4">
                  {teammates.slice(0, 4).map((teammate) => (
                    <Link
                      key={teammate.id}
                      href={`/players/${teammate.id}`}
                      className="flex items-center gap-4 p-4 rounded-xl transition-colors border border-gray-100"
                    >
                      <Image
                        src={getImageUrl(teammate.headshotPic) || '/default-player.jpg'}
                        alt={teammate.name}
                        width={50}
                        height={50}
                        className="rounded-xl"
                      />
                      <div className="flex-1">
                        <div className="font-bold">{teammate.name}</div>
                        <div className="text-sm">{teammate.position}</div>
                      </div>
                    </Link>
                  ))}
                </div>

                <Link
                  href={backToPlayersUrl}
                  className="block text-center text-red-800 hover:text-red-900 font-bold text-lg mt-6 transition-colors"
                >
                  View All Players →
                </Link>
              </div>
            )}
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