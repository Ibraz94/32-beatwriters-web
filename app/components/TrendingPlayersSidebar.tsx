'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useGetTrendingPlayersQuery, getImageUrl } from '@/lib/services/playersApi'
import { getTeamLogoUrl } from '@/lib/services/teamsApi'

export default function TrendingPlayersSidebar() {
    const { data: trendingPlayersData, isLoading, error } = useGetTrendingPlayersQuery();

    if (isLoading) {
        return (
            <div className="rounded-lg border border-[#2C204B]">
                <div className='bg-[#2C204B] h-14 flex items-center justify-center'>
                    <h2 className="text-white text-center text-xl">TRENDING PLAYERS</h2>
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
        );
    }

    if (error) {
        return (
            <div className="rounded-lg border border-[#2C204B]">
                <div className='bg-[#2C204B] h-14 flex items-center justify-center'>
                    <h2 className="text-white text-center text-xl">TRENDING PLAYERS</h2>
                </div>
                <div className="p-4 text-center text-gray-500">
                    Error loading trending players
                </div>
            </div>
        );
    }

    if (!trendingPlayersData?.data || trendingPlayersData.data.length === 0) {
        return (
            <div className="rounded-lg border border-[#2C204B]">
                <div className='bg-[#2C204B] h-14 flex items-center justify-center'>
                    <h2 className="text-white text-center text-xl">TRENDING PLAYERS</h2>
                </div>
                <div className="p-4 text-center text-gray-500">
                    No trending players available
                </div>
            </div>
        );
    }

    return (
        <div className="rounded-lg border border-[#2C204B]">
            <div className='bg-[#2C204B] h-14 flex items-center justify-center'>
                <h2 className="text-white text-center text-xl">TRENDING PLAYERS</h2>
            </div>
            <div className="space-y-3">
                {trendingPlayersData.data.map((player) => (
                    <Link
                        key={player.id}
                        href={`/players/${player.id}`}
                        className="flex items-center justify-between p-3 border-b border-[#2C204B] hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-full overflow-hidden">
                                <Image
                                    src={getImageUrl(player.headshotPic) || '/default-player.jpg'}
                                    alt={player.name}
                                    width={40}
                                    height={40}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <span className="font-medium">{player.name}</span>
                        </div>
                        {player.teamDetails && (
                            <div className='flex flex-col items-end gap-1 text-sm text-gray-500'>
                                {(() => {
                                    const teamLogoUrl = getTeamLogoUrl(player.teamDetails.logo)
                                    return teamLogoUrl ? (
                                        <Image
                                            src={teamLogoUrl}
                                            alt={player.teamDetails.name || 'Team logo'}
                                            width={24}
                                            height={24}
                                            className="object-contain"
                                        />
                                    ) : null
                                })()}
                                <p>{player.teamDetails.name || 'No team'}</p>
                            </div>
                        )}
                    </Link>
                ))}
            </div>
        </div>
    );
}
