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
    isActive?: boolean
}

function PlayerCard({ player, isActive }: PlayerCardProps) {
    const imageUrl = getImageUrl(player.headshotPic)
    const team = getTeamByName(player.team)

    return (
        <div className="transition-all duration-300 hover:scale-105">
            <Link href={`/players/${player.id}`}>
                <div className={`rounded-lg p-6 h-[245px] md:h-[245px] relative overflow-hidden group ${
                    isActive 
                        ? 'bg-[#43278C]' 
                        : 'bg-[#2C204B]'
                }`}>

                    <div className="absolute bottom-[-40%] left-0 w-56 h-56 bg-[#9F0712] rounded-full"></div>
                    
                    {/* Player Image - positioned at bottom left */}
                    <div className="absolute bottom-0 left-0 w-56 h-56">
                        <div className="w-full h-full overflow-hidden">
                            <Image
                                src={imageUrl || '/default-player.jpg'}
                                alt={player.name}
                                width={192}
                                height={192}
                                className="object-cover w-full h-full"
                                onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.src = '/default-player.jpg';
                                }}
                            />
                        </div>
                    </div>

                    {/* Player Info - positioned on the right side */}
                    <div className="absolute top-[30%] right-6 text-right text-white">
                        {/* Player Name */}
                        <h3 className="text-xl md:text-3xl font-bold mb-2 tracking-wide relative px-2">
                            <span className='absolute top-3 left-0 w-full h-3 bg-[#9F0712] z-10'></span>
                            <span className='relative z-20'>{player.name}</span>
                        </h3>

                        {/* Team Info */}
                        <div className="flex items-center justify-end gap-2">
                            {team?.logo && (
                                <Image
                                    src={team.logo}
                                    alt={team.name}
                                    width={24}
                                    height={24}
                                    className="object-contain"
                                />
                            )}
                            <span className="text-sm md:text-[18px] font-medium">{player.team}</span>
                        </div>
                    </div>
                </div>
            </Link>
        </div>
    )
}

export default function TrendingPlayers() {
    const [api, setApi] = useState<CarouselApi>()
    const [current, setCurrent] = useState(0)
    
    // Track current slide for determining active (center) player
    useEffect(() => {
        if (!api) return

        setCurrent(api.selectedScrollSnap())

        api.on("select", () => {
            setCurrent(api.selectedScrollSnap())
        })
    }, [api])
    
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
    /* useEffect(() => {
        if (!api || players.length === 0) return

        const interval = setInterval(() => {
            api.scrollNext()
        }, 2000) // 2 seconds

        return () => clearInterval(interval)
    }, [api, players.length]) */

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
                        {players.map((player, index) => (
                            <CarouselItem 
                                key={player.id} 
                                className="pl-2 md:pl-4 basis-full sm:basis-1/2 lg:basis-1/3"
                            >
                                <PlayerCard 
                                    player={player} 
                                    isActive={index === current} 
                                />
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                </Carousel>
                
                {/* Navigation Buttons - Bottom Center */}
                <div className="flex items-center justify-center gap-4 mt-6">
                    <button
                        onClick={() => api?.scrollPrev()}
                        className="border-2 border-gray-600 hover:bg-gray-700 text-white rounded-full p-3 transition-colors"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                        onClick={() => api?.scrollNext()}
                        className="border-2 border-red-600 hover:bg-red-700 text-white rounded-full p-3 transition-colors"
                    >
                        <ChevronRight className="w-6 h-6 text-red-600" />
                    </button>
                </div>
            </div>
        </div>
    )
}