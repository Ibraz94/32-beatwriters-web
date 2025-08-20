'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ReadMore } from '@/app/components/ReadMore'
import { useGetNewPlayerNuggetsQuery, getImageUrl, Nugget } from '@/lib/services/nuggetsApi'
import { useGetTeamsQuery, getTeamLogoUrl } from '@/lib/services/teamsApi'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

export default function NewPlayerNuggetsSection() {
  const router = useRouter()

  const {
    data: newPlayerNuggetsData,
    isLoading: isLoadingNewNuggets,
    error: newNuggetsError
  } = useGetNewPlayerNuggetsQuery()

  // Teams query (for team logos)
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

  if (isLoadingNewNuggets || isLoadingTeams) {
    return (
      <div className="rounded-lg border border-[#2C204B] mt-8">
        <div className='bg-[#2C204B] h-14 flex items-center justify-center'>
          <h2 className="text-white text-center text-xl">NEW PLAYER NUGGETS</h2>
        </div>
        <div className="p-4 text-center text-white">
          <Loader2 className="w-6 h-6 animate-spin mx-auto" />
          <p>Loading new player nuggets...</p>
        </div>
      </div>
    )
  }

  if (newNuggetsError) {
    console.error('Error fetching new player nuggets:', newNuggetsError)
    return (
      <div className="rounded-lg border border-[#2C204B] mt-8">
        <div className='bg-[#2C204B] h-14 flex items-center justify-center'>
          <h2 className="text-white text-center text-xl">NEW PLAYER NUGGETS</h2>
        </div>
        <div className="p-4 text-center text-red-500">
          Failed to load new player nuggets.
        </div>
      </div>
    )
  }

  const newPlayerNuggets = newPlayerNuggetsData?.data?.nuggets?.slice(0, 3) || []
  if (newPlayerNuggets.length === 0) {
    return null // Don't render the section if there are no new nuggets
  }

  return (
    <div className="rounded-lg border border-[#2C204B] mt-8">
      <div className='bg-[#2C204B] h-14 flex items-center justify-center'>
        <h2 className="text-white text-center text-xl">NEW PLAYERS</h2>
      </div>
      <div className="space-y-3">
        {newPlayerNuggets.map((nugget: Nugget) => {
          const playerTeam = findTeamByKey(nugget.player.team)
          return (
            <Link
              key={nugget.id}
              href={`/players/${nugget.player.id}`}
              className="flex items-center justify-between p-3 border-b border-[#2C204B]"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full overflow-hidden">
                  <Image
                    src={getImageUrl(nugget.player.headshotPic) || '/default-player.jpg'}
                    alt={nugget.player.name}
                    width={40}
                    height={40}
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="font-medium">{nugget.player.name}</span>
                {nugget.isNew && <span className="ml-2 px-2 py-1 bg-green-500 text-white text-xs font-bold rounded-full">NEW</span>}
              </div>
              {playerTeam && (
                <div className='flex flex-col items-end gap-1 text-sm text-gray-500'>
                  <Image
                    src={getTeamLogoUrl(playerTeam.logo) || ''}
                    alt={playerTeam.name || 'Team logo'}
                    width={24}
                    height={24}
                    className="object-contain"
                  />
                  <p>{playerTeam.name || 'No team'}</p>
                </div>
              )}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
