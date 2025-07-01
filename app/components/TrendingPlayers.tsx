"use client"

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useGetPlayersQuery, getImageUrl, Player } from '@/lib/services/playersApi'
import { nflTeams, getTeamByName } from '@/app/(pages)/teams/data/teams'

interface PlayerCardProps {
    player: Player
    isHighlighted?: boolean
    animationKey?: string
}

function PlayerCard({ player, isHighlighted = false, animationKey }: PlayerCardProps) {
    const imageUrl = getImageUrl(player.headshotPic)
    const team = getTeamByName(player.team)

    return (
        <div className={`transition-all ease-in-out duration-1000 transform ${
            isHighlighted 
                ? 'scale-105 z-20 shadow-2xl' 
                : 'scale-95 z-10 opacity-75'
        }`}>
            <Link href={`/players/${player.id}`}>
                <div className={`relative text-white min-h-[350px] flex items-center justify-start transform transition-all duration-1000 ease-in-out overflow-hidden ${
                    isHighlighted 
                        ? 'bg-gradient-to-r from-[#43278C] to-[#5A3BA8] w-[600px] shadow-lg' 
                        : 'bg-[#2C204B] w-[600px]'
                }`}>
                    {/* Player Image */}
                    <div className="relative w-full h-full min-h-[400px] transition-all duration-1000 ease-in-out">
                        <Image
                            src={imageUrl || '/default-player.jpg'}
                            alt={player.name}
                            fill
                            className={`object-cover object-center w-full transition-all duration-1000 ease-in-out ${
                                isHighlighted ? 'brightness-110' : 'brightness-90'
                            }`}
                            onError={(e) => {
                                const target = e.target as HTMLImageElement
                                target.src = '/default-player.jpg'
                            }}
                        />
                    </div>

                    {/* Player Info - Right Side */}
                    <div className="w-full flex flex-col justify-center items-start space-y-4 transition-all duration-1000 ease-in-out">
                        {/* Player Name */}
                        <h3 className={`text-4xl font-bold text-white transition-all duration-1000 ease-in-out ${
                            isHighlighted ? 'transform scale-110' : 'transform scale-100'
                        }`}>
                            {player.name}
                        </h3>

                        {/* Team Logo and Name */}
                        <div className={`flex gap-2 transition-all duration-1000 ease-in-out ${
                            isHighlighted ? 'transform translate-x-2' : 'transform translate-x-0'
                        }`}>
                            {team?.logo && (
                                <div className="relative w-12 h-12 transition-all duration-1000 ease-in-out">
                                    <Image
                                        src={team.logo}
                                        alt={`${team.name} logo`}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                            )}
                            <span className="text-xl font-semibold text-white/90">
                                {team?.name || player.team}
                            </span>
                        </div>
                    </div>
                </div>
            </Link>
        </div>
    )
}

export default function TrendingPlayers() {
    const [currentIndex, setCurrentIndex] = useState(0)
    const [isTransitioning, setIsTransitioning] = useState(false)
    const [animationDirection, setAnimationDirection] = useState<'left' | 'right' | null>(null)
    const itemsPerView = 3 // Always show 3 players

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
    const totalItems = players.length

    const nextSlide = () => {
        if (isTransitioning || totalItems <= 1) return
        
        setIsTransitioning(true)
        setAnimationDirection('right')
        
        setTimeout(() => {
            setCurrentIndex((prev) => (prev + 1) % totalItems)
            setTimeout(() => {
                setIsTransitioning(false)
                setAnimationDirection(null)
            }, 500)
        }, 250)
    }

    const prevSlide = () => {
        if (isTransitioning || totalItems <= 1) return
        
        setIsTransitioning(true)
        setAnimationDirection('left')
        
        setTimeout(() => {
            setCurrentIndex((prev) => (prev - 1 + totalItems) % totalItems)
            setTimeout(() => {
                setIsTransitioning(false)
                setAnimationDirection(null)
            }, 500)
        }, 250)
    }

    // Auto-advance carousel with slow motion
    useEffect(() => {
        if (totalItems <= 1) return

        const interval = setInterval(() => {
            if (!isTransitioning) {
                nextSlide()
            }
        }, 6000) // Increased interval to account for animation time
        
        return () => clearInterval(interval)
    }, [totalItems, isTransitioning])

    // Get the 3 players to display (previous, current, next)
    const getDisplayedPlayers = () => {
        if (totalItems === 0) return []
        if (totalItems === 1) return [{ player: players[0], isHighlighted: true, animationKey: '0' }]
        if (totalItems === 2) {
            return [
                { player: players[currentIndex], isHighlighted: false, animationKey: `${currentIndex}-left` },
                { player: players[(currentIndex + 1) % totalItems], isHighlighted: true, animationKey: `${(currentIndex + 1) % totalItems}-center` },
                { player: players[currentIndex], isHighlighted: false, animationKey: `${currentIndex}-right` }
            ]
        }

        const prevIndex = (currentIndex - 1 + totalItems) % totalItems
        const nextIndex = (currentIndex + 1) % totalItems

        return [
            { player: players[prevIndex], isHighlighted: false, animationKey: `${prevIndex}-left` },
            { player: players[currentIndex], isHighlighted: true, animationKey: `${currentIndex}-center` },
            { player: players[nextIndex], isHighlighted: false, animationKey: `${nextIndex}-right` }
        ]
    }

    if (isLoading) {
        return (
            <div className="mt-12">
                <h1 className="text-center text-7xl font-bold mb-10">Trending Players</h1>
                <div className="h-[400px] w-full bg-[#2C204B] rounded-2xl flex items-center justify-center">
                    <div className="text-white text-xl">Loading trending players...</div>
                </div>
            </div>
        )
    }

    if (hasError || players.length === 0) {
        return (
            <div className="mt-12">
                <h1 className="text-center text-7xl font-bold mb-10">Trending Players</h1>
                <div className="h-[500px] w-full bg-[#2C204B] rounded-2xl flex items-center justify-center">
                    <div className="text-white text-xl">
                        {hasError ? 'Unable to load players' : 'No matching players found'}
                    </div>
                </div>
            </div>
        )
    }

    const displayedPlayers = getDisplayedPlayers()

    return (
        <div className="mt-14">
            <h1 className="text-center text-7xl font-bold mb-10 transition-all duration-1000 ease-in-out">
                Trending Players
            </h1>

            <div className="relative w-full overflow-hidden">
                {/* Carousel Container - Always show 3 players */}
                <div className={`flex items-center justify-center gap-2 min-h-[400px] w-full transition-all duration-1000 ease-in-out ${
                    isTransitioning ? 'opacity-90' : 'opacity-100'
                } ${
                    animationDirection === 'right' ? 'transform translate-x-2' : 
                    animationDirection === 'left' ? 'transform -translate-x-2' : 
                    'transform translate-x-0'
                }`}>
                    {displayedPlayers.map((item, index) => (
                        <div 
                            key={item.animationKey || `${item.player.id}-${index}`} 
                            className={`flex-shrink-0 mt-10 transition-all duration-800 ease-in-out ${
                                isTransitioning 
                                    ? 'transform scale-98 opacity-80' 
                                    : 'transform scale-100 opacity-100'
                            }`}
                        >
                            <PlayerCard
                                player={item.player}
                                isHighlighted={item.isHighlighted}
                                animationKey={item.animationKey}
                            />
                        </div>
                    ))}
                </div>

                {/* Navigation Arrows */}
                {totalItems > 1 && (
                    <div className="flex justify-center mt-12 gap-6">
                        <button
                            onClick={prevSlide}
                            disabled={isTransitioning}
                            className={`border-4 border-white hover:border-red-800 hover:cursor-pointer rounded-full p-3 text-white transition-all duration-500 z-10 ${
                                isTransitioning 
                                    ? 'opacity-50 cursor-not-allowed scale-95' 
                                    : 'opacity-100 cursor-pointer hover:scale-102 hover:shadow-lg'
                            }`}
                            aria-label="Previous player"
                        >
                            <ChevronLeft className="w-7 h-7 hover:text-red-800 transition-colors duration-300" />
                        </button>

                        <button
                            onClick={nextSlide}
                            disabled={isTransitioning}
                            className={`border-4 border-white hover:border-red-800 hover:cursor-pointer rounded-full p-3 text-white transition-all duration-500 z-10 ${
                                isTransitioning 
                                    ? 'opacity-50 cursor-not-allowed scale-95' 
                                    : 'opacity-100 cursor-pointer hover:scale-102 hover:shadow-lg'
                            }`}
                            aria-label="Next player"
                        >
                            <ChevronRight className="w-7 h-7 hover:text-red-800 transition-colors duration-300" />
                        </button>
                    </div>
                )}

                {/* Dot indicators */}
                {/* {totalItems > 1 && (
          <div className="flex justify-center mt-6 gap-3">
            {players.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-3 h-3 rounded-full transition-all duration-200 ${
                  index === currentIndex 
                    ? 'bg-red-600 scale-125' 
                    : 'bg-white/40 hover:bg-white/60'
                }`}
                aria-label={`Go to player ${index + 1}`}
              />
            ))}
          </div>
        )} */}
            </div>
        </div>
    )
}