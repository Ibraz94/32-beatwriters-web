'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useGetPlayersQuery, getImageUrl, Player } from '@/lib/services/playersApi'
import { useGetTeamsQuery, getTeamLogoUrl } from '@/lib/services/teamsApi'

export default function TrendingPlayersSidebar() {
    const targetPlayerNames = [
        'Emeka Egbuka',
        'Kyle Pitts',
        'Kyler Murray',
        'Dont\'e Thornton',
        'TreVeyon Henderson',
    ];

    // Teams query
    const { data: teamsData, isLoading: isLoadingTeams } = useGetTeamsQuery()

    // Helper function to find team by abbreviation or name
    const findTeamByKey = (teamKey: string) => {
        if (!teamsData?.teams || !teamKey) return null

        return teamsData.teams.find(team =>
            team.abbreviation?.toLowerCase() === teamKey.toLowerCase() ||
            team.name?.toLowerCase() === teamKey.toLowerCase() ||
            team.city?.toLowerCase() === teamKey.toLowerCase()
        )
    }

    // Define separate queries for each player
    const query1 = useGetPlayersQuery({
        page: 1,
        limit: 10,
        pageSize: 10,
        search: targetPlayerNames[0], // Search for 'Emeka Egbuka'
    });

    const query2 = useGetPlayersQuery({
        page: 1,
        limit: 10,
        pageSize: 10,
        search: targetPlayerNames[1], // Search for 'Kyle Pitts'
    });

    const query3 = useGetPlayersQuery({
        page: 1,
        limit: 10,
        pageSize: 10,
        search: targetPlayerNames[2], // Search for 'Kyler Murray'
    });

    const query4 = useGetPlayersQuery({
        page: 1,
        limit: 10,
        pageSize: 10,
        search: targetPlayerNames[3], // Search for 'Dont\'e Thornton'
    });

    const query5 = useGetPlayersQuery({
        page: 1,
        limit: 10,
        pageSize: 10,
        search: targetPlayerNames[4], // Search for 'TreVeyon Henderson'
    });

    const playersQuery = [query1, query2, query3, query4, query5];

    const allFoundPlayers: any[] = []
    let isLoading = false
    let hasError = false

    playersQuery.forEach((query, index) => {
        if (query.isLoading) isLoading = true
        if (query.error) hasError = true
        if (query.data?.data?.players) {
            // Find the best match for each search
            const players = query.data.data.players
            const targetName = targetPlayerNames[index]
            const bestMatch = players.find(player =>
                player.name.toLowerCase().trim() === targetName.toLowerCase().trim()
            ) || players[0] // If exact match not found, take the first result

            if (bestMatch && !allFoundPlayers.some(p => p.id === bestMatch.id)) {
                const updatedPlayer = {
                    ...bestMatch,
                    team: findTeamByKey(bestMatch.team || '') || { name: 'No team', logo: null }, // Handle case where team is not available
                };

                allFoundPlayers.push(updatedPlayer);
            }
        }
    })

    if (isLoading || isLoadingTeams) {
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

    if (hasError) {
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

    return (
        <div className="rounded-lg border border-[#2C204B]">
            <div className='bg-[#2C204B] h-14 flex items-center justify-center'>
                <h2 className="text-white text-center text-xl">TRENDING PLAYERS</h2>
            </div>
            <div className="space-y-3">
                {allFoundPlayers.map((player) => (
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
                        {player.team && (
                            <div className='flex flex-col items-end gap-1 text-sm text-gray-500'>
                                <Image
                                    src={getTeamLogoUrl(player.team.logo) || ''}
                                    alt={player.team?.name || 'Team logo'}
                                    width={24}
                                    height={24}
                                    className="object-contain"
                                />
                                <p>{player.team?.name || 'No team'}</p>
                            </div>
                        )}
                    </Link>
                ))}
            </div>
        </div>
    );
}
