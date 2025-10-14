'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ReadMore } from '@/app/components/ReadMore'
import {
  useGetLatestNuggetsQuery,
  getImageUrl
} from '@/lib/services/nuggetsApi'
import { useGetTeamsQuery, getTeamLogoUrl } from '@/lib/services/teamsApi'
import { useRouter } from 'next/navigation'
import TrendingPlayersSidebar from '@/app/components/TrendingPlayersSidebar'
import { Button } from '@/components/ui/button'
import SearchBar from '@/components/ui/search'
import { Clock } from 'lucide-react'

export default function LatestNuggets() {
  const router = useRouter()

  // Fetch latest nuggets
  const {
    data: latestNuggetsData,
    isLoading: isLoadingNuggets,
    error: nuggetsError
  } = useGetLatestNuggetsQuery()

  // Teams query
  const { data: teamsData, isLoading: isLoadingTeams } = useGetTeamsQuery()

  // Helper function to find team by abbreviation or name
  const findTeamByKey = (teamKey: string | null) => {
    if (!teamsData?.teams || !teamKey) return null

    return teamsData.teams.find(team =>
      team.abbreviation?.toLowerCase() === teamKey.toLowerCase() ||
      team.name?.toLowerCase() === teamKey.toLowerCase() ||
      team.city?.toLowerCase() === teamKey.toLowerCase()
    )
  }



  const fantasyInsight = (fantasyInsight: string) => {
    if (fantasyInsight) {
      return <div dangerouslySetInnerHTML={{ __html: fantasyInsight }}></div>
    } else if (fantasyInsight === '') {
    } else {
      return null
    }
  }

  // Loading state
  if (isLoadingNuggets || isLoadingTeams) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <p className="text-xl max-w-4xl mx-auto">Loading latest nuggets...</p>
        </div>
        <div className="flex gap-6">
          <div className="flex-1">
            <div className="space-y-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="rounded-xl border shadow-lg overflow-hidden animate-pulse">
                  <div className="h-48 bg-gray-200"></div>
                  <div className="p-6">
                    <div className="h-6 bg-gray-200 rounded mb-3"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded mb-4 w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="w-80 hidden lg:block">
            <div className="bg-gray-200 rounded-lg h-96 animate-pulse"></div>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (nuggetsError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">Latest Nuggets</h2>
          <p className="text-xl text-red-600 mb-4">Failed to load latest nuggets</p>
          <p className="text-gray-600">Please try again later.</p>
        </div>
      </div>
    )
  }

  const latestNuggets = latestNuggetsData?.data || []

  return (
    <div className="container mx-auto py-8">


      <div className="relative">
        {/* ✅ Background Layer */}
        <div
          className="
    hidden md:flex absolute inset-0 
    bg-cover bg-center bg-no-repeat 
    bg-[url('/background-image2.png')] 
    opacity-10 dark:opacity-5
  "
          style={{
            transform: "scaleY(-1)",
            top: "-110px",
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: -50,
            height: "300%",
          }}
        ></div>
        {/* ✅ Page Content */}
        <div className="relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-2xl leading-8 mb-4 md:text-5xl md:leading-14">
              Stay Ahead of the Game with<br /> Real-Time NFL Updates.
            </h2>
          </div>

          <div className="flex justify-center">
            <SearchBar
              placeholder="Search any news that suits you"
              size="md"
              width="w-full md:w-1/2"
              buttonLabel="Search here"
              onButtonClick={() => alert('Button clicked!')}
              onChange={(val) => console.log(val)}
              className="flex justify-center items-center"
            />
          </div>
        </div>
      </div>

      {/* Main Content Area - Two Column Layout */}
      <div className="flex gap-4 lg:gap-6 flex-col lg:flex-row min-w-0 mt-10 px-4">
        {/* Feed Column */}
        <div className="flex-1 relative">
          <div className="text-left mb-12 ml-4">
            <h2 className="text-2xl md:text-5xl mb-4">Latest Nuggets</h2>
            <p className="text-sm md:text-xl max-w-4xl text-(--primary-gray-color)">Stay updated with the most recent insights and analysis</p>
          </div>
          {latestNuggets.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-xl text-gray-600 mb-4">No nuggets available.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {latestNuggets.map((nugget, index) => {
                const playerTeam = findTeamByKey(nugget.player.team)
                return (
                  <div key={`${nugget.id}-${index}`} className="overflow-hidden grid grid-cols-6 md:grid-cols-12 border-b pb-4 border-[var(--color-gray)]">
                    <div
                      className="cursor-pointer border rounded-full p-0 w-15 h-15 flex items-center justify-center relative col-span-1"
                      onClick={() => router.push(`/players/${nugget.player.id}`, { scroll: false })}
                    >
                      <Image
                        src={getImageUrl(nugget.player.headshotPic) || ''}
                        alt={`${nugget.player.name} headshot`}
                        fill
                        className='rounded-full object-cover bg-background overflow-hidden'
                      />
                    </div>

                    <div className='col-span-5 md:col-span-11'>
                      <div className='flex items-center gap-2 ml-4 mr-4 col-1'>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Link href={`/players/${nugget.player.id}`}>
                              <h1 className='text-xl'>{nugget.player.name}</h1>
                            </Link>
                            {playerTeam && (
                              <div className="flex items-center">
                                <Image
                                  src={getTeamLogoUrl(playerTeam.logo) || ''}
                                  alt={`${playerTeam.name} logo`}
                                  width={32}
                                  height={24}
                                  className='object-contain '
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
                      </div>
                      <div className="mt-3 ml-4 dark:text-[#D2D6E2]">
                        <ReadMore id={nugget.id.toString()} text={nugget.content} amountOfCharacters={400} />
                      </div>
                      <div>
                        {nugget.fantasyInsight && (
                          <div className='px-4 mt-2 dark:text-[#D2D6E2]'>
                            <h1 className='font-semibold mt-0 text-red-800'>Fantasy Insight:</h1>
                            {fantasyInsight(nugget.fantasyInsight)}
                          </div>
                        )}
                      </div>

                      <div className="bg-[var(--gray-background-color)] rounded-full pr-3 pl-2 py-2 flex items-center justify-between mr-5 ml-5 mt-2 dark:bg-[var(--dark-theme-color)]">
                        {/* Left: Source */}
                        {nugget.sourceUrl && (
                          <div className="flex items-center gap-1 bg-[var(--light-orange-background-color)] rounded-full px-3 py-1.5 w-fit dark:text-black">
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
                            {/* {nugget.urlIcon && (
                              <img src={(nugget.urlIcon) || ''} alt='icon' className='h-6 w-6' />
                            )} */}
                          </div>
                        )}

                        {/* Right: Date */}
                        <div className='flex flex-row gap-2 text-gray-400'>
                          <span><Clock size={18} /></span>
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

              {/* View All Nuggets Button */}
              {latestNuggets.length > 0 && (
                <div className="py-8 flex justify-center lg:hidden lg:ml-[440px] md:ml-[175px] w-full text-white">
                  <Button variant="orange">
                    <Link
                      href="/subscribe"
                    // className="bg-red-800 text-white px-8 py-3 rounded font-semibold hover:bg-red-700 transition-colors inline-flex items-center gap-2"
                    >
                      Subscribe to See All the Latest News
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* View All Nuggets Button */}
          {latestNuggets.length > 0 && (
            <div className="hidden md:flex justify-end w-full py-8 text-white">
              <Button
                variant="orange"
                className="dark:hover:bg-[#FF8C5E] whitespace-nowrap"
              >
                <Link href="/subscribe">
                  Subscribe to See All the Latest News
                </Link>
              </Button>
            </div>

          )}
        </div>

        {/* Trending Players Sidebar */}
        <div className="w-full lg:w-80 xl:w-96 lg:flex-shrink-0">
          <TrendingPlayersSidebar />
        </div>
      </div>

    </div>
  )
}
