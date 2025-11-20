'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useGetTrendingPlayersQuery, getImageUrl } from '@/lib/services/playersApi'
import { getTeamLogoUrl } from '@/lib/services/teamsApi'

export default function TrendingPlayersSidebar() {
    const { data: trendingPlayersData, isLoading, error } = useGetTrendingPlayersQuery();

    if (isLoading) {
        return (
            <div className="rounded-lg overflow-hidden border-none">
                <div className="bg-[#F9D2CC] dark:bg-[#262829] h-14 flex items-center justify-center">
                    <h2 className="text-black dark:text-white text-center text-xl">TRENDING PLAYERS</h2>
                </div>
                <div className="space-y-3 p-3 bg-[#FFE6E2] dark:bg-[#1A1A1A]">
                    {[...Array(5)].map((_, i) => (
                        <div
                            key={i}
                            className="flex items-center justify-between p-3 border-b border-[#2C204B]/20 dark:border-[#C7C8CB]/20 animate-pulse"
                        >
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 rounded-full bg-[#F9D2CC] dark:bg-[#262829]"></div>
                                <div className="h-4 bg-[#F9D2CC] dark:bg-[#262829] rounded w-20"></div>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                                <div className="w-6 h-6 bg-[#F9D2CC] dark:bg-[#262829] rounded"></div>
                                <div className="h-3 bg-[#F9D2CC] dark:bg-[#262829] rounded w-12"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="rounded-lg overflow-hidden border-none">
                <div className="bg-[#F9D2CC] dark:bg-[#262829] h-14 flex items-center justify-center">
                    <h2 className="text-black dark:text-white text-center text-xl">TRENDING PLAYERS</h2>
                </div>
                <div className="p-4 text-center text-gray-500 dark:text-white bg-[#FFE6E2] dark:bg-[#1A1A1A]">
                    Error loading trending players
                </div>
            </div>
        );
    }


    if (!trendingPlayersData?.data || trendingPlayersData.data.length === 0) {
        return (
            <div className="rounded-lg overflow-hidden border-none">
                <div className="bg-[#F9D2CC] dark:bg-[#262829] h-14 flex items-center justify-center">
                    <h2 className="text-black text-center text-xl dark:text-white">TRENDING PLAYERS</h2>
                </div>
                <div className="p-4 text-center text-gray-500 bg-[#FFE6E2] dark:bg-[#1A1A1A] dark:text-white">
                    No trending players available
                </div>
            </div>
        );
    }


    return (
        <div className="bg-[var(--trending-background-color)] rounded-2xl py-4 px-2 dark:bg-[var(--dark-theme-color)]">
            <div className='h-14 flex items-center justify-center'>
                <h2 className="text-black font-semibold text-center text-2xl tracking-wider dark:text-white">Trending Players</h2>
            </div>
            <div className="space-y-3">
                {trendingPlayersData.data.map((player) => (
                    <Link
                        key={player.id}
                        href={`/players/${player.id}`}
                        className="flex items-center justify-between p-3 bg-[var(--light-trending-background-color)] hover:bg-gray-50 transition-colors mx-3 rounded-2xl dark:bg-[#1A1A1A] dark:hover:bg-gray-600"
                    >
                        <div className="flex items-center space-x-3">
                            {/* Player image */}
                            <div className="w-12 h-12 rounded-full overflow-hidden border border-red-400 p-0.5">
                                <Image
                                    src={getImageUrl(player.headshotPic) || '/default-player.jpg'}
                                    alt={player.name}
                                    width={45}
                                    height={45}
                                    className="w-full h-full object-cover"
                                />
                            </div>

                            {/* Player info */}
                            <div className="flex flex-col justify-center">
                                <span className="font-medium leading-tight">{player.name}</span>
                                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 space-x-1">
                                    <span>{player.position}</span>
                                    <span>•</span>
                                    <span>{player.teamDetails.name || 'No team'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Team logo */}
                        {player.teamDetails && (
                            <div className="flex flex-col items-end gap-1 text-sm text-gray-500">
                                {(() => {
                                    const teamLogoUrl = getTeamLogoUrl(player.teamDetails.logo)
                                    return teamLogoUrl ? (
                                        <Image
                                            src={teamLogoUrl}
                                            alt={player.teamDetails.name || 'Team logo'}
                                            width={34}
                                            height={34}
                                            className="object-contain"
                                        />
                                    ) : null
                                })()}
                            </div>
                        )}
                    </Link>
                ))}
            </div>

            <div className="text-center">
                <button className="lg:hidden text-[var(--color-orange)] mt-5 underline underline-offset-6 font-semibold">
                    View all
                </button>
            </div>
        </div>
    );
}
