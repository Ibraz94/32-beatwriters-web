"use client"

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useGetPlayersQuery, getImageUrl, Player } from '@/lib/services/playersApi'
import { getTeamByName } from '@/app/(pages)/teams/data/teams'
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
    type CarouselApi
} from "@/components/ui/carousel"

interface PlayerCardProps {
    player: Player
}

function PlayerCard({ player }: PlayerCardProps) {
    const imageUrl = getImageUrl(player.headshotPic)
    const team = getTeamByName(player.team)

    return (
        <div className="transition-all duration-300 hover:scale-105">
            <Link href={`/players/${player.id}`}>
                <div className="bg-[#2C204B] rounded p-6 h-[350px] md:h-[400px] flex flex-col items-center justify-center relative overflow-hidden group">
                    {/* Background Team Logo - Subtle */}
                    {team?.logo && (
                        <div className="absolute inset-0 flex items-center justify-center opacity-5 group-hover:opacity-10 transition-opacity duration-300">
                            <Image
                                src={team.logo}
                                alt={team.name}
                                width={200}
                                height={200}
                                className="object-contain"
                            />
                        </div>
                    )}
                    
                    {/* Player Image */}
                    <div className="relative z-10 mb-4">
                        <div className="w-32 h-32 md:w-40 md:h-40 overflow-hidden border-4 border-white/20 group-hover:border-red-500/50 transition-all duration-300">
                            <Image
                                src={imageUrl || ''}
                                alt={player.name}
                                width={160}
                                height={160}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.src = '/default-player.jpg';
                                }}
                            />
                        </div>
                    </div>
                    
                    {/* Player Name */}
                    <h3 className="text-white text-xl md:text-2xl font-bold text-center mb-2 z-10 relative">
                        {player.name}
                    </h3>
                    
                    {/* Player Details */}
                    <div className="text-center z-10 relative">
                        <p className="text-gray-300 text-sm md:text-base mb-1">
                            {player.position} • {player.team}
                        </p>
                    </div>
                    
                    {/* Team Logo - Small */}
                    {team?.logo && (
                        <div className="absolute top-4 right-4 z-10">
                            <div className="w-8 h-8 md:w-10 md:h-10 bg-white/10 backdrop-blur-sm flex items-center justify-center">
                                <Image
                                    src={team.logo}
                                    alt={team.name}
                                    width={24}
                                    height={24}
                                    className="object-contain"
                                />
                            </div>
                        </div>
                    )}
                    
                    {/* Hover Effect Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-red-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-5"></div>
                </div>
            </Link>
        </div>
    )
}

export default function TrendingPlayers() {
    const [api, setApi] = useState<CarouselApi>()
    
    // Specified players to display
    const targetPlayerNames = [
        'Emeka Egbuka',
        'Kyle Pitts',
        'Kyler Murray',
        'Dont\'e Thornton',
        'TreVeyon Henderson'
    ]

    // Search for each player individually
    const query1 = useGetPlayersQuery({
        page: 1,
        limit: 10,
        pageSize: 10,
        search: 'Emeka Egbuka'
    })
    
    const query2 = useGetPlayersQuery({
        page: 1,
        limit: 10,
        pageSize: 10,
        search: 'Kyle Pitts'
    })
    
    const query3 = useGetPlayersQuery({
        page: 1,
        limit: 10,
        pageSize: 10,
        search: 'Kyler Murray'
    })
    
    const query4 = useGetPlayersQuery({
        page: 1,
        limit: 10,
        pageSize: 10,
        search: 'Dont\'e Thornton'
    })
    
    const query5 = useGetPlayersQuery({
        page: 1,
        limit: 10,
        pageSize: 10,
        search: 'TreVeyon Henderson'
    })

    const playerQueries = [query1, query2, query3, query4, query5]

    // Combine all found players
    const allFoundPlayers: Player[] = []
    let isLoading = false
    let hasError = false

    playerQueries.forEach((query, index) => {
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
                allFoundPlayers.push(bestMatch)
            }
        }
    })

    const players = allFoundPlayers

    // Auto-play functionality with 2-second interval
    useEffect(() => {
        if (!api || players.length === 0) return

        const interval = setInterval(() => {
            api.scrollNext()
        }, 2000) // 2 seconds

        return () => clearInterval(interval)
    }, [api, players.length])

    if (isLoading) {
        return (
            <div className="mt-8 md:mt-12 px-4 md:px-0 container mx-auto">
                <h1 className="text-center text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-7xl font-bold mb-6 md:mb-10">Trending Players</h1>
                <div className="h-[350px] md:h-[400px] w-full bg-[#2C204B] rounded-2xl flex items-center justify-center">
                    <div className="text-white text-base md:text-xl">Loading trending players...</div>
                </div>
            </div>
        )
    }

    if (hasError || players.length === 0) {
        return (
            <div className="mt-8 md:mt-12 px-4 md:px-0 container mx-auto">
                <h1 className="text-center text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-7xl font-bold mb-6 md:mb-10">Trending Players</h1>
                <div className="h-[350px] md:h-[400px] w-full bg-[#2C204B] rounded-2xl flex items-center justify-center">
                    <div className="text-white text-base md:text-xl">
                        {hasError ? 'Unable to load players' : 'No matching players found'}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="px-4 md:px-0 container mx-auto mt-8">
            <h1 className="text-center text-4xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-8">
                Trending Players
            </h1>

            <div className="relative mx-auto">
                <Carousel
                    setApi={setApi}
                    opts={{
                        loop: true,
                        align: "center",
                        slidesToScroll: 1
                    }}
                    className="w-full"
                >
                    <CarouselContent className="-ml-2 md:-ml-4">
                        {players.map((player) => (
                            <CarouselItem 
                                key={player.id} 
                                className="pl-2 md:pl-4 basis-full sm:basis-1/2 lg:basis-1/3"
                            >
                                <PlayerCard player={player} />
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                    
                    {/* Custom Navigation Buttons */}
                    <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 border-2 border-white bg-transparent hover:bg-white hover:text-black text-white h-12 w-12" />
                    <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 border-2 border-white bg-transparent hover:bg-white hover:text-black text-white h-12 w-12" />
                </Carousel>
            </div>
        </div>
    )
}