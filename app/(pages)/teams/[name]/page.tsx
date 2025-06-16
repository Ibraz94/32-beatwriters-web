'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, MapPin, Users, Calendar, Shield, Lock, User, DollarSign, Activity, Globe, Facebook, Instagram } from 'lucide-react'
import { getTeamByName, NFLTeam, nflTeams } from '../data/teams'
import { useAuth } from '../../articles/hooks/useAuth'

// Premium access component for teams
const PremiumAccessRequired = ({ team }: { team: NFLTeam }) => {
  return (
    <div className="border-2 border-red-200 rounded-xl p-8 text-center">
      <div className="w-16 h-16 bg-red-800 rounded-full flex items-center justify-center mx-auto mb-4">
        <Lock className="w-8 h-8 text-white" />
      </div>

      <h3 className="text-2xl font-bold text-red-800 mb-4">Premium Team Analysis</h3>

      <p className="mb-6 max-w-md mx-auto">
        This team features exclusive premium content including salary cap analysis, trade rumors, injury reports, and advanced coaching insights.
      </p>

      <div className="rounded-lg p-4 mb-6 border border-red-200">
        <h4 className="font-semibold  mb-2">Premium Team Features:</h4>
        <ul className="text-sm space-y-1">
          <li>• Detailed salary cap situation and projections</li>
          <li>• Insider trade rumors and front office analysis</li>
          <li>• Comprehensive injury reports and player health</li>
          <li>• Advanced coaching strategies and game planning</li>
          <li>• Draft strategy and organizational priorities</li>
        </ul>
      </div>

      <div className="space-y-3">
        <Link
          href="/premium"
          className="w-full bg-red-800 text-white py-3 px-6 rounded-lg font-semibold hover:scale-102 transition-all block"
        >
          Upgrade to Premium
        </Link>

        <Link
          href="/login"
          className="w-full border py-3 px-6 rounded-lg font-semibold hover:scale-102 transition-all block"
        >
          Already Premium? Sign In
        </Link>
      </div>

      <p className="text-xs mt-4">
        Starting at $10/month
      </p>
    </div>
  )
}

export default function TeamPage() {
  const params = useParams()
  const { user, isAuthenticated, loading: authLoading } = useAuth()
  const [team, setTeam] = useState<NFLTeam | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.name) {
      const foundTeam = getTeamByName(params.name as string)
      setTeam(foundTeam || null)
      setLoading(false)
    }
  }, [params.name])

  if (loading || authLoading) {
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

  if (!team) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-3xl font-bold mb-4">Team Not Found</h1>
          <p className="text-gray-600 mb-8">The team you're looking for doesn't exist or has been moved.</p>
          <Link
            href="/teams"
            className="bg-red-800 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-900 transition-colors"
          >
            Back to Teams
          </Link>
        </div>
      </div>
    )
  }

  const canAccessPremium = !team.isPremium || (isAuthenticated && user?.roles.id === 1)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <Link
          href="/teams"
          className="inline-flex items-center text-red-800 hover:text-red-900 font-semibold mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Teams
        </Link>

        {/* User Status Indicator (for testing) */}
        {isAuthenticated && (
          <div className="border rounded-lg p-3 mb-6">
            <p className="text-sm text-blue-800">
              Signed in as: <strong>{user?.email}</strong>
              {user?.roles.id === 1 || user?.roles.id === 2 || user?.roles.id === 3 || user?.roles.id === 4 ? (
                <span className="ml-2 bg-red-800 text-white px-2 py-1 rounded text-xs font-semibold">Premium</span>
              ) : (
                <span className="ml-2 px-2 py-1 border rounded text-xs">Free</span>
              )}
            </p>
          </div>
        )}

        {/* Team Header */}
        <div className="rounded-xl border shadow-lg overflow-hidden mb-8">
          {/* Team Banner */}
          <div
            className="relative h-48 md:h-64"
            style={{ backgroundColor: team.primaryColor }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent"></div>

            {/* Premium Badge */}
            {team.isPremium && (
              <div className="absolute top-4 right-4 bg-red-800 text-white px-3 py-2 rounded-full text-sm font-semibold flex items-center">
                <Shield className="w-4 h-4 mr-1" />
                Premium Team
              </div>
            )}

            {/* Team Info Overlay */}
            <div className="absolute bottom-6 left-6 text-white">
              <div className="flex items-center gap-4 mb-4">
                <Image
                  src={team.logo}
                  alt={team.name}
                  width={100}
                  height={100}
                  className="rounded-lg bg-white p-2"
                />
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold">{team.name}</h1>
                  <p className="text-xl opacity-90">{team.city} • {team.conference}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Team Stats */}
          <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-800">{team.record2023}</div>
                <div className="text-sm">2023 Record</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-800">{team.championships}</div>
                <div className="text-sm">Championships</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-800">{team.playoffAppearances}</div>
                <div className="text-sm">Playoff Apps</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-800">{team.founded}</div>
                <div className="text-sm">Founded</div>
              </div>
            </div>

            {/* Team Info */}
            <div className="grid md:grid-cols-1 gap-8">
              <div>
                <div className="flex items-center justify-center gap-12">
                  <div className="flex items-center">
                    <MapPin className="w-5 h-5 mr-2" />
                    <span><strong>Stadium:</strong> {team.stadium}</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="w-5 h-5 mr-2" />
                    <span><strong>Division:</strong> {team.division}</span>
                  </div>
                  <div className="flex items-center">
                    <User className="w-5 h-5 mr-2" />
                    <span><strong>Head Coach:</strong> {team.headCoach}</span>
                  </div>
                  <div className="flex items-center">
                    <Activity className="w-5 h-5 mr-2" />
                    <span><strong>General Manager:</strong> {team.generalManager}</span>
                  </div>
                </div>
              </div>

              <div>
                <div className="space-y-2 grid grid-cols-1">
                  {team.socialMedia.map((media, index) => (
                    <div key={index} className='flex items-center justify-around gap-10'>
                      <a href={media.website} className=""><Globe strokeWidth={1} /></a>
                      <a href={media.facebook} className=""><Facebook strokeWidth={1} /></a>
                      <a href={media.instagram} className=""><Instagram strokeWidth={1} /></a>
                      <a href={media.twitter} className=""><Image src="/twitter.svg" alt="Twitter" width={25} height={25} /></a>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Team Analysis */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="rounded-xl border shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold mb-6">Team Analysis</h2>

              <div className="prose prose-lg max-w-none">
                <p className="text-xl leading-relaxed mb-6">
                  {team.description}
                </p>

                <div
                  dangerouslySetInnerHTML={{ __html: team.detailedAnalysis }}
                />
              </div>
            </div>

            {/* Premium Insights */}
            {team.isPremium && (
              <div className="rounded-xl border shadow-lg p-8">
                <h2 className="text-2xl font-bold mb-6 flex items-center">
                  <Shield className="w-6 h-6 text-red-800 mr-2" />
                  Premium Insights
                </h2>

                {canAccessPremium ? (
                  team.premiumInsights && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold mb-2 flex items-center">
                          <DollarSign className="w-5 h-5 text-green-600 mr-2" />
                          Salary Cap Situation
                        </h3>
                        <p className="text-gray-700">{team.premiumInsights.salary_cap_situation}</p>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold mb-2 flex items-center">
                          <Activity className="w-5 h-5 text-blue-600 mr-2" />
                          Draft Strategy
                        </h3>
                        <p className="text-gray-700">{team.premiumInsights.draft_strategy}</p>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold mb-2 flex items-center">
                          <Users className="w-5 h-5 text-purple-600 mr-2" />
                          Trade Rumors
                        </h3>
                        <p className="text-gray-700">{team.premiumInsights.trade_rumors}</p>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold mb-2 flex items-center">
                          <Activity className="w-5 h-5 text-red-600 mr-2" />
                          Injury Report
                        </h3>
                        <p className="text-gray-700">{team.premiumInsights.injury_report}</p>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold mb-2 flex items-center">
                          <User className="w-5 h-5 text-orange-600 mr-2" />
                          Coaching Analysis
                        </h3>
                        <p className="text-gray-700">{team.premiumInsights.coaching_analysis}</p>
                      </div>
                    </div>
                  )
                ) : (
                  <PremiumAccessRequired team={team} />
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recent News */}
            <div className="rounded-xl border shadow-lg p-6">
              <h3 className="text-xl font-bold mb-4">Recent News</h3>
              <div className="space-y-4">
                {team.recentNews.map((news, index) => (
                  <div key={index} className="border-b border-gray-200 pb-4 last:border-b-0">
                    <h4 className="font-semibold  mb-2">{news.title}</h4>
                    <p className="text-sm  mb-2">{news.summary}</p>
                    <div className="flex items-center text-xs">
                      <Calendar className="w-3 h-3 mr-1" />
                      {new Date(news.date).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Division Standings */}
            {/* <div className="rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold mb-4">Division Teams</h3>
              <div className="space-y-3">
                {nflTeams
                  .filter(t => t.division === team.division && t.id !== team.id)
                  .map((divisionTeam) => (
                    <Link
                      key={divisionTeam.id}
                      href={`/teams/${divisionTeam.id}`}
                      className="flex items-center gap-3 p-2 rounded hover:bg-gray-50 transition-colors"
                    >
                      <Image
                        src={divisionTeam.logo}
                        alt={divisionTeam.name}
                        width={32}
                        height={32}
                        className="rounded"
                      />
                      <div className="flex-1">
                        <div className="font-semibold text-sm">{divisionTeam.name}</div>
                        <div className="text-xs">{divisionTeam.record2023}</div>
                      </div>
                      {divisionTeam.isPremium && (
                        <Shield className="w-4 h-4 text-red-800" />
                      )}
                    </Link>
                  ))}
              </div>
            </div> */}

            <div className='rounded-xl border shadow-lg p-6'>
              <h3 className="text-xl font-bold mb-2">Players</h3>
              <div className="grid grid-cols-4 gap-2">
                {team.keyPlayers.map((player, index) => {
                  const playerId = player.name.toLowerCase().replace(/\s+/g, '-') + '-' + team.id;
                  return (
                  <Link href={`/players/${playerId}`} key={index} className="flex flex-col justify-between items-center p-1 border rounded col-span-2">
                    <Image
                      src={player.image}
                      alt={player.name}
                      width={300}
                      height={100}
                      className="rounded-md"
                    />

                    <div>
                      <h4 className="text-lg font-semibold mt-2">{player.name}</h4>
                    </div>
                  </Link>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
