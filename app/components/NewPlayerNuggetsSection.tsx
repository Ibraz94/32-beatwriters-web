'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useGetNewPlayerNuggetsQuery, getImageUrl, Nugget } from '@/lib/services/nuggetsApi'
import { useGetTeamsQuery, getTeamLogoUrl } from '@/lib/services/teamsApi'

export default function NewPlayerNuggetsSection() {
  const {
    data: newPlayerNuggetsData,
    isLoading: isLoadingNewNuggets,
    error: newNuggetsError
  } = useGetNewPlayerNuggetsQuery()

  const { data: teamsData, isLoading: isLoadingTeams } = useGetTeamsQuery()

  const findTeamByKey = (teamKey: string | null) => {
    if (!teamsData?.teams || !teamKey) return null
    return teamsData.teams.find(team =>
      team.abbreviation?.toLowerCase() === teamKey.toLowerCase() ||
      team.name?.toLowerCase() === teamKey.toLowerCase() ||
      team.city?.toLowerCase() === teamKey.toLowerCase()
    )
  }

  // Loading state
  if (isLoadingNewNuggets || isLoadingTeams) {
    return (
      <div className="bg-[var(--trending-background-color)] rounded-2xl py-4 px-2 dark:bg-[var(--dark-theme-color)] mt-8">
        <div className="h-14 flex items-center justify-center">
          <h2 className="text-black font-semibold text-center text-2xl tracking-wider dark:text-white">
            Newly Mentioned Players
          </h2>
        </div>
        <div className="space-y-3 p-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-[var(--light-trending-background-color)] rounded-2xl animate-pulse mx-3 dark:bg-[#1A1A1A]">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-gray-300"></div>
                <div className="h-4 bg-gray-300 rounded w-20"></div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <div className="w-6 h-6 bg-gray-300 rounded"></div>
                <div className="h-3 bg-gray-300 rounded w-12"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Error state
  if (newNuggetsError) {
    return (
      <div className="bg-[var(--trending-background-color)] rounded-2xl py-4 px-2 dark:bg-[var(--dark-theme-color)] mt-8">
        <div className="h-14 flex items-center justify-center">
          <h2 className="text-black font-semibold text-center text-2xl tracking-wider dark:text-white">
            Newly Mentioned Players
          </h2>
        </div>
        <div className="p-4 text-center text-red-600">
          Failed to load new player nuggets.
        </div>
      </div>
    )
  }

  const newPlayerNuggets = newPlayerNuggetsData?.data?.nuggets || []
  if (newPlayerNuggets.length === 0) {
    return null
  }

  return (
    <div className="bg-[var(--trending-background-color)] rounded-2xl py-4 px-2 dark:bg-[var(--dark-theme-color)] mt-8">
      <div className="h-14 flex items-center justify-center">
        <h2 className="text-black font-semibold text-center text-2xl tracking-wider dark:text-white">
          Newly Mentioned Players
        </h2>
      </div>

      <div className="space-y-3">
        {newPlayerNuggets.map((nugget: Nugget) => {
          const playerTeam = findTeamByKey(nugget.player.team)

          return (
            <Link
              key={nugget.id}
              href={`/players/${nugget.player.id}`}
              className="flex items-center justify-between p-3 bg-[var(--light-trending-background-color)] hover:bg-gray-50 transition-colors mx-3 rounded-2xl dark:bg-[#1A1A1A] dark:hover:bg-gray-600"
            >
              <div className="flex items-center space-x-3">
                {/* Player image */}
                <div className="w-12 h-12 rounded-full overflow-hidden border border-red-400 p-0.5">
                  <Image
                    src={getImageUrl(nugget.player.headshotPic) || '/default-player.jpg'}
                    alt={nugget.player.name}
                    width={45}
                    height={45}
                    className="w-full h-full object-cover"
                    loader={({ src }) => src}
                  />
                </div>

                {/* Player info */}
                <div className="flex flex-col justify-center">
                  <span className="font-medium leading-tight">{nugget.player.name}</span>
                  {playerTeam && (
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 space-x-1">
                      <span>{playerTeam.name}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Team logo */}
              {playerTeam && (
                <div className="flex flex-col items-end gap-1 text-sm text-gray-500">
                  {(() => {
                    const teamLogoUrl = getTeamLogoUrl(playerTeam.logo)
                    return teamLogoUrl ? (
                      <Image
                        src={teamLogoUrl}
                        alt={playerTeam.name || 'Team logo'}
                        width={34}
                        height={34}
                        className="object-contain"
                        loader={({ src }) => src}
                      />
                    ) : null
                  })()}
                </div>
              )}
            </Link>
          )
        })}
      </div>

      <div className="text-center">
        <button className="lg:hidden text-[var(--color-orange)] mt-5 underline underline-offset-6 font-semibold">
          View all
        </button>
      </div>
    </div>
  )
}
