'use client'

import Image from 'next/image'
import Link from 'next/link'
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

  const { data: teamsData, isLoading: isLoadingTeams } = useGetTeamsQuery()

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
          <h2 className="text-white text-center text-xl">NEWLY MENTIONED PLAYERS</h2>
        </div>
        <div className="space-y-3 p-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center justify-between p-3 border-b border-[#2C204B] animate-pulse">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-gray-200"></div>
                <div className="h-4 bg-gray-200 rounded w-20"></div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <div className="w-6 h-6 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded w-12"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (newNuggetsError) {
    console.error('Error fetching new player nuggets:', newNuggetsError)
    return (
      <div className="rounded-lg border border-[#2C204B] mt-8">
        <div className='bg-[#2C204B] h-14 flex items-center justify-center'>
          <h2 className="text-white text-center text-xl">NEWLY MENTIONED PLAYERS</h2>
        </div>
        <div className="p-4 text-center text-red-500">
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
    <div className="rounded-lg border border-[#2C204B] mt-8">
      <div className='bg-[#2C204B] h-14 flex items-center justify-center'>
        <h2 className="text-white text-center text-xl">NEWLY MENTIONED PLAYERS</h2>
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
              </div>
              {playerTeam && (
                <div className='flex flex-col items-end gap-1 text-sm text-gray-500'>
                  <div className='flex gap-2'>
                    <Image
                      src={getTeamLogoUrl(playerTeam.logo) || ''}
                      alt={playerTeam.name || 'Team logo'}
                      width={24}
                      height={24}
                      className="object-contain"
                    />
                  </div>
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
