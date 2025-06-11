'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, MapPin, Users, Hash, GraduationCap, Trophy, Activity, Star, ExternalLink } from 'lucide-react'
import { getImageUrl, useGetPlayerQuery, useGetPlayersQuery } from '@/lib/services/playersApi'
import { Team, useGetTeamQuery } from '@/lib/services/teamsApi'
import { useAuth } from '@/lib/hooks/useAuth'

export default function PlayerProfile() {
  const params = useParams()
  const playerId = params.playerId as string
  
  // Add authentication check
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  
  // Fetch individual player
  const { data: player, isLoading: playerLoading, error: playerError } = useGetPlayerQuery(playerId)
  
  // Debug: Log the actual response structure (remove in production)
  if (process.env.NODE_ENV === 'development') {
    console.log('Player API Response:', player)
    console.log('Player Error:', playerError)
  }
  
  // For now, we'll work with the team name directly from player data
  // In the future, you might want to add a team lookup by name
  const teamName = player?.team
  const teamLoading = false
  
  // Fetch all players for teammates
  const { data: playersResponse, isLoading: playersLoading } = useGetPlayersQuery({
    page: 1,
    limit: 50
  })
  const allPlayers = playersResponse?.data?.players || []
  
  // Get teammates (same team, different player)
  const teammates = allPlayers
    .filter(p => p.team === player?.team && p.id !== player?.id)
    .slice(0, 6)

  const loading = playerLoading || teamLoading || authLoading

  // Show authentication required message if not authenticated
  if (!authLoading && !isAuthenticated) {
    return (
      <div className="container mx-auto h-screen px-4 py-8">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-3xl font-bold mb-4">Authentication Required</h1>
          <p className="text-gray-600 mb-8">Please sign in to view player profiles.</p>
          <Link
            href="/login"
            className="bg-red-800 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-900 transition-colors"
          >
            Sign In
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

  if (playerError || !player) {
    // Check if the error is specifically an authentication error
    const isAuthError = playerError && 'status' in playerError && (playerError.status === 401 || playerError.status === 403)
    
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
                href="/players"
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
            href="/players"
            className="text-red-800 px-6 py-3 rounded-lg font-semibold hover:bg-white transition-colors"
          >
            Back to Players
          </Link>
        </div>
      </div>
    )
  }

  // Get player image URL
  const playerImage = getImageUrl(player.headshotPic) || '/default-player.jpg'

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <Link
          href="/players"
          className="inline-flex items-center text-red-800 hover:text-red-900 font-semibold mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Players
        </Link>

        {/* Player Header */}
        <div className="rounded-xl border shadow-lg overflow-hidden mb-8">
          {/* Player Banner */}
          <div
            className="relative h-64 md:h-80"
            style={{ backgroundColor: '#1f2937' }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent"></div>

            {/* Player Info Overlay */}
            <div className="absolute bottom-6 left-6 text-white">
              <div className="flex items-end gap-6 mb-4">
                <div className="relative">
                  <Image
                    src={playerImage}
                    alt={player.name}
                    width={120}
                    height={120}
                    className="rounded-lg border-4 border-white"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src = '/default-player.jpg'
                    }}
                  />
                  {player.draftPick && (
                    <div className="absolute -top-2 -right-2 bg-red-800 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                      {player.draftPick}
                    </div>
                  )}
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold mb-2">{player.name}</h1>
                  <div className="flex items-center gap-4 text-lg opacity-90">
                    <span className="font-semibold">{player.position}</span>
                    <span>•</span>
                    <span>{teamName}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Team Logo - Placeholder for now */}
            {/* You can add team logos later when you have team data */}
          </div>

          {/* Player Stats */}
          <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-800">{player.age}</div>
                <div className="text-sm">Age</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-800">{player.height}</div>
                <div className="text-sm">Height</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-800">{player.weight}</div>
                <div className="text-sm">Weight</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-800">{player.position}</div>
                <div className="text-sm">Position</div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Player Details */}
            <div className="rounded-xl shadow-md p-6 border">
              <h2 className="text-2xl font-bold mb-6">Player Information</h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center">
                    <Users className="w-5 h-5 mr-3 " />
                    <div>
                      <div className="text-sm ">Position</div>
                      <div className="font-semibold">{player.position}</div>
                    </div>
                  </div>
                  
                  {player.draftPick && (
                    <div className="flex items-center">
                      <Hash className="w-5 h-5 mr-3 " />
                      <div>
                        <div className="text-sm ">Draft Pick</div>
                        <div className="font-semibold">{player.draftPick}</div>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center">
                    <Activity className="w-5 h-5 mr-3 " />
                    <div>
                      <div className="text-sm ">Physical</div>
                      <div className="font-semibold">{player.height} • {player.weight} lbs</div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center">
                    <GraduationCap className="w-5 h-5 mr-3 " />
                    <div>
                      <div className="text-sm">College</div>
                      <div className="font-semibold">{player.college}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <MapPin className="w-5 h-5 mr-3" />
                    <div>
                      <div className="text-sm">Team</div>
                      <div className="font-semibold">{teamName}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Career Highlights */}
            <div className="rounded-xl shadow-md p-6 border">
              <h2 className="text-2xl font-bold mb-6">Career Highlights</h2>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <Star className="w-5 h-5 mr-3 text-yellow-500 mt-1" />
                  <div>
                    <div className="font-semibold">Professional Career</div>
                    <div>Key player for the {teamName}</div>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <GraduationCap className="w-5 h-5 mr-3 text-blue-500 mt-1" />
                  <div>
                    <div className="font-semibold">College Career</div>
                    <div>Played college football at {player.college}</div>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Activity className="w-5 h-5 mr-3 text-green-500 mt-1" />
                  <div>
                    <div className="font-semibold">Position Excellence</div>
                    <div>Specialized {player.position} with proven track record</div>
                  </div>
                </div>

                {player.ppi && (
                  <div className="flex items-start">
                    <Trophy className="w-5 h-5 mr-3 text-red-500 mt-1" />
                    <div>
                      <div className="font-semibold">Player Performance Index</div>
                      <div>PPI Score: {player.ppi}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Team Info */}
            {teamName && (
              <div className="rounded-xl shadow-md p-6 border">
                <h3 className="text-xl font-bold mb-4">Team Information</h3>
                
                <div className="p-4 rounded-lg border bg-gray-50">
                  <div className="font-semibold">{teamName}</div>
                  <div className="text-sm text-gray-600">NFL Team</div>
                </div>
              </div>
            )}

            {/* Teammates */}
            {teammates.length > 0 && (
              <div className="rounded-xl shadow-md p-6 border">
                <h3 className="text-xl font-bold mb-4">Teammates</h3>
                
                <div className="space-y-3">
                  {teammates.map((teammate) => (
                    <Link
                      key={teammate.id}
                      href={`/players/${teammate.id}`}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <Image
                        src={getImageUrl(teammate.headshotPic) || '/default-player.jpg'}
                        alt={teammate.name}
                        width={40}
                        height={40}
                        className="rounded-lg"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = '/default-player.jpg'
                        }}
                      />
                      <div className="flex-1">
                        <div className="font-medium text-sm">{teammate.name}</div>
                        <div className="text-xs text-gray-600">{teammate.position} • Age {teammate.age}</div>
                      </div>
                    </Link>
                  ))}
                </div>
                
                <Link
                  href="/players"
                  className="block text-center text-red-800 hover:text-red-900 font-semibold text-sm mt-4 transition-colors"
                >
                  View All Players →
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 