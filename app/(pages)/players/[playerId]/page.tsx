'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, MapPin, Users, Hash, GraduationCap, Trophy, Activity, Star, Calendar, Weight, Ruler } from 'lucide-react'
import { getImageUrl, useGetPlayerQuery, useGetPlayersQuery } from '@/lib/services/playersApi'
import { useAuth } from '@/lib/hooks/useAuth'

export default function PlayerProfile() {
  const params = useParams()
  const playerId = params.playerId as string

  // Add authentication check
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const { user, isLoading: premiumLoading } = useAuth()

  // Fetch individual player
  const { data: player, isLoading: playerLoading, error: playerError } = useGetPlayerQuery(playerId)

  // Debug: Log the actual response structure (remove in production)
  if (process.env.NODE_ENV === 'development') {
    console.log('Player API Response:', player)
    console.log('Player Error:', playerError)
  }

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

  const loading = playerLoading || teamLoading || authLoading || premiumLoading

  // Show authentication required message if not authenticated
  if (!authLoading && !isAuthenticated && !user?.subscription) {
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
    <div className="min-h-screen">
      {/* Back Navigation */}
      <div className="container mx-auto px-4 pt-6">
        <Link 
          href="/players"
          className="inline-flex items-center hover:text-red-800 transition-colors mb-6"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          <span className="text-lg font-medium">Back to Players</span>
        </Link>
      </div>

      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-red-900 via-red-800 to-red-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="container mx-auto px-4 py-16 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            {/* Player Image */}
            <div className="relative">
              <div className="w-80 h-80 lg:w-96 lg:h-96 rounded-3xl overflow-hidden border-4 border-white/20 shadow-2xl">
                <Image
                  src={playerImage}
                  alt={player.name}
                  width={400}
                  height={400}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Player Info */}
            <div className="flex-1 text-center lg:text-left">
              <div className="mb-4">
                <h1 className="text-6xl lg:text-8xl font-black mb-4 leading-none">
                  {player.name}
                </h1>
                <div className="flex flex-col lg:flex-row items-center lg:items-center gap-4 lg:gap-8">
                  <span className="text-3xl lg:text-4xl font-bold text-red-200">
                    {player.team || 'N/A'}
                  </span>
                  <div className="hidden lg:block w-1 h-8 bg-white/30"></div>
                  <span className="text-2xl lg:text-3xl font-semibold text-white/90">
                    #{player.position}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="container mx-auto px-4 -mt-16 relative z-20 mb-12">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-r from-red-900 via-red-800 to-red-900 rounded-2xl p-6 shadow-xl border">
            <div className="flex items-center mb-3">
              <Calendar className="w-6 h-6 text-red-600 mr-3" />
              <span className="text-sm font-medium text-white">AGE</span>
            </div>
            <div className="text-4xl text-white">{player.age}</div>
            <div className="text-sm mt-1 text-white">Years Old</div>
          </div>

          <div className="bg-gradient-to-r from-red-900 via-red-800 to-red-900 rounded-2xl p-6 shadow-xl border">
            <div className="flex items-center mb-3">
              <Ruler className="w-6 h-6 text-red-600 mr-3" />
              <span className="text-sm font-medium text-white">HEIGHT</span>
            </div>
            <div className="text-4xl text-white">{player.height}</div>
            <div className="text-sm mt-1 text-white">Tall</div>
          </div>

          <div className="bg-gradient-to-r from-red-900 via-red-800 to-red-900 rounded-2xl p-6 shadow-xl border">
            <div className="flex items-center mb-3">
              <Weight className="w-6 h-6 text-red-600 mr-3" />
              <span className="text-sm font-medium text-white">WEIGHT</span>
            </div>
            <div className="text-4xl text-white">{player.weight}</div>
            <div className="text-sm mt-1 text-white">Pounds</div>
          </div>

          <div className="bg-gradient-to-r from-red-900 via-red-800 to-red-900 rounded-2xl p-6 shadow-xl border">
            <div className="flex items-center mb-3">
              <Users className="w-6 h-6 text-red-600 mr-3" />
              <span className="text-sm font-medium text-white">POSITION</span>
            </div>
            <div className="text-2xl text-white">{player.position}</div>
            <div className="text-sm mt-1 text-white">Role</div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 pb-16">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Player Details */}
          <div className="lg:col-span-2">
            <div className="rounded-3xl p-8 shadow-xl border">
              <h2 className="text-4xl lg:text-5xl font-black mb-8">
                Player Details
              </h2>

              <div className="space-y-8">
                {/* College */}
                <div className="border-l-4 border-red-600 pl-6">
                  <div className="flex items-center mb-2">
                    <GraduationCap className="w-7 h-7 text-red-600 mr-3" />
                    <span className="text-lg font-bold">COLLEGE</span>
                  </div>
                  <div className="text-3xl">{player.college}</div>
                </div>

                {/* Draft Pick */}
                {player.draftPick && (
                  <div className="border-l-4 border-red-600 pl-6">
                    <div className="flex items-center mb-2">
                      <Hash className="w-7 h-7 text-red-600 mr-3" />
                      <span className="text-lg font-bold ">DRAFT PICK</span>
                    </div>
                    <div className="text-3xl">{player.draftPick}</div>
                  </div>
                )}

                {/* Team */}
                <div className="border-l-4 border-red-600 pl-6">
                  <div className="flex items-center mb-2">
                    <MapPin className="w-7 h-7 text-red-600 mr-3" />
                    <span className="text-lg font-bold">CURRENT TEAM</span>
                  </div>
                  <div className="text-3xl">{teamName || 'N/A'}</div>
                </div>

                {/* Performance Index */}
                {player.ppi && (
                  <div className="border-l-4 border-red-600 pl-6">
                    <div className="flex items-center mb-2">
                      <Trophy className="w-7 h-7 text-red-600 mr-3" />
                      <span className="text-lg font-bold">PERFORMANCE INDEX</span>
                    </div>
                    <div className="text-3xl">{player.ppi}</div>
                  </div>
                )}
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
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = '/default-player.jpg'
                        }}
                      />
                      <div className="flex-1">
                        <div className="font-bold">{teammate.name}</div>
                        <div className="text-sm">{teammate.position}</div>
                        <div className="text-xs">Age {teammate.age}</div>
                      </div>
                    </Link>
                  ))}
                </div>

                <Link
                  href="/players"
                  className="block text-center text-red-800 hover:text-red-900 font-bold text-lg mt-6 transition-colors"
                >
                  View All Players →
                </Link>
              </div>
            )}

            {/* Quick Stats Card */}
            {/* <div className="bg-gradient-to-br from-red-600 to-red-800 rounded-3xl p-6 text-white shadow-xl">
              <h3 className="text-2xl font-black mb-6">Quick Stats</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Position</span>
                  <span className="text-xl font-black">{player.position}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Age</span>
                  <span className="text-xl font-black">{player.age}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Team</span>
                  <span className="text-lg font-black">{player.team || 'N/A'}</span>
                </div>
              </div>
            </div> */}
          </div>
        </div>
      </div>
      <div className="flex items-center justify-center gap-2 mt-10">
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