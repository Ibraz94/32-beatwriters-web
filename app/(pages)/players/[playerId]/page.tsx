'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, MapPin, Users, Calendar, Hash, GraduationCap, Trophy, Activity, Star, ExternalLink } from 'lucide-react'
import { getPlayerById, getPlayersByTeam, Player } from '../data/players'

export default function PlayerProfile() {
  const params = useParams()
  const [player, setPlayer] = useState<Player | null>(null)
  const [teammates, setTeammates] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.playerId) {
      const foundPlayer = getPlayerById(params.playerId as string)
      setPlayer(foundPlayer || null)
      
      if (foundPlayer) {
        const teamPlayers = getPlayersByTeam(foundPlayer.team.id)
        setTeammates(teamPlayers.filter(p => p.id !== foundPlayer.id).slice(0, 6))
      }
      
      setLoading(false)
    }
  }, [params.playerId])

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

  if (!player) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-3xl font-bold mb-4">Player Not Found</h1>
          <p className="text-gray-600 mb-8">The player you're looking for doesn't exist or has been moved.</p>
          {/* <Link
            href="/players"
            className="text-red-800 px-6 py-3 rounded-lg font-semibold hover:bg-white transition-colors"
          >
            Back to Players
          </Link> */}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        {/* <Link
          href="/players"
          className="inline-flex items-center text-red-800 hover:text-red-900 font-semibold mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Players
        </Link> */}

        {/* Player Header */}
        <div className="rounded-xl border shadow-lg overflow-hidden mb-8">
          {/* Player Banner */}
          <div
            className="relative h-64 md:h-80"
            style={{ backgroundColor: player.team.primaryColor }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent"></div>

            {/* Player Info Overlay */}
            <div className="absolute bottom-6 left-6 text-white">
              <div className="flex items-end gap-6 mb-4">
                <div className="relative">
                  <Image
                    src={player.image}
                    alt={player.name}
                    width={120}
                    height={120}
                    className="rounded-lg border-4 border-white"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src = '/default-player.jpg'
                    }}
                  />
                  <div className="absolute -top-2 -right-2 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                    #{player.number}
                  </div>
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold mb-2">{player.name}</h1>
                  <div className="flex items-center gap-4 text-lg opacity-90">
                    <span className="font-semibold">{player.position}</span>
                    <span>•</span>
                    <span>{player.team.city} {player.team.name}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Team Logo */}
            <div className="absolute top-6 right-6">
              <Image
                src={player.team.logo}
                alt={player.team.name}
                width={60}
                height={60}
                className="rounded-lg bg-white p-2"
              />
            </div>
          </div>

          {/* Player Stats */}
          <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-800">#{player.number}</div>
                <div className="text-sm">Jersey Number</div>
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
                  
                  <div className="flex items-center">
                    <Hash className="w-5 h-5 mr-3 " />
                    <div>
                      <div className="text-sm ">Jersey Number</div>
                      <div className="font-semibold">#{player.number}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <Activity className="w-5 h-5 mr-3 " />
                    <div>
                      <div className="text-sm ">Physical</div>
                      <div className="font-semibold">{player.height} • {player.weight}</div>
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
                      <div className="font-semibold">{player.team.city} {player.team.name}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <Trophy className="w-5 h-5 mr-3 " />
                    <div>
                      <div className="text-sm">Conference</div>
                      <div className="font-semibold">{player.team.conference} • {player.team.division}</div>
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
                    <div>Key player for the {player.team.name}</div>
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
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Team Info */}
            <div className="rounded-xl shadow-md p-6 border">
              <h3 className="text-xl font-bold mb-4">Team Information</h3>
              
              <Link 
                href={`/teams/${player.team.id}`}
                className="flex items-center gap-4 p-4 rounded-lg border hover:bg-gray-50 transition-colors"
              >
                <Image
                  src={player.team.logo}
                  alt={player.team.name}
                  width={48}
                  height={48}
                  className="rounded-lg"
                />
                <div className="flex-1">
                  <div className="font-semibold">{player.team.name}</div>
                  <div className="text-sm">{player.team.city}</div>
                  <div className="text-xs">{player.team.conference} • {player.team.division}</div>
                </div>
                <ExternalLink className="w-4 h-4 text-gray-400" />
              </Link>
            </div>

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
                        src={teammate.image}
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
                        <div className="text-xs text-gray-600">{teammate.position} • #{teammate.number}</div>
                      </div>
                    </Link>
                  ))}
                </div>
                
                <Link
                  href={`/teams/${player.team.id}`}
                  className="block text-center text-red-800 hover:text-red-900 font-semibold text-sm mt-4 transition-colors"
                >
                  View Full Roster →
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 