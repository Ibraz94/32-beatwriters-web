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
                <div className={`relative text-white min-h-[300px] sm:min-h-[300px] md:min-h-[350px] flex flex-col sm:flex-row items-center justify-start transform transition-all duration-1000 ease-in-out overflow-hidden rounded-lg ${
                    isHighlighted 
                        ? 'bg-gradient-to-r from-[#43278C] to-[#5A3BA8] w-[320px] sm:w-[400px] md:w-[500px] lg:w-[600px] shadow-lg' 
                        : 'bg-[#2C204B] w-[280px] sm:w-[400px] md:w-[500px] lg:w-[600px]'
                }`}>
                    {/* Player Image */}
                    <div className="relative w-full sm:w-1/2 h-[150px] sm:h-full min-h-[200px] sm:min-h-[300px] md:min-h-[400px] transition-all duration-1000 ease-in-out mt-4">
                        <Image
                            src={imageUrl || '/default-player.jpg'}
                            alt={player.name}
                            fill
                            className={`object-cover object-center transition-all duration-1000 ease-in-out ${
                                isHighlighted ? 'brightness-110' : 'brightness-90'
                            }`}
                            onError={(e) => {
                                const target = e.target as HTMLImageElement
                                target.src = '/default-player.jpg'
                            }}
                        />
                    </div>

                    {/* Player Info - Bottom on mobile, Right Side on desktop */}
                    <div className="w-full sm:w-1/2 flex flex-col justify-center items-center sm:items-start space-y-1 sm:space-y-2 p-2 sm:p-3 md:p-4 transition-all duration-1000 ease-in-out">
                        {/* Player Name */}
                        <h3 className={`text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold text-white text-center sm:text-left transition-all duration-1000 ease-in-out ${
                            isHighlighted ? 'transform scale-110' : 'transform scale-100'
                        }`}>
                            {player.name}
                        </h3>

                        {/* Team Logo and Name */}
                        <div className={`flex items-center gap-2 transition-all duration-1000 ease-in-out ${
                            isHighlighted ? 'transform translate-x-0 sm:translate-x-2' : 'transform translate-x-0'
                        }`}>
                            {team?.logo && (
                                <div className="relative w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 transition-all duration-1000 ease-in-out">
                                    <Image
                                        src={team.logo}
                                        alt={`${team.name} logo`}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                            )}
                            <span className="text-sm sm:text-base md:text-lg lg:text-xl font-semibold text-white/90">
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
    
    // Responsive items per view
    const [itemsPerView, setItemsPerView] = useState(1)

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

    // Update items per view based on screen size
    useEffect(() => {
        const updateItemsPerView = () => {
            if (window.innerWidth < 640) { // mobile
                setItemsPerView(1)
            } else if (window.innerWidth < 1024) { // tablet
                setItemsPerView(2)
            } else { // desktop
                setItemsPerView(3)
            }
        }

        updateItemsPerView()
        window.addEventListener('resize', updateItemsPerView)
        return () => window.removeEventListener('resize', updateItemsPerView)
    }, [])

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

    // Get the players to display based on screen size
    const getDisplayedPlayers = () => {
        if (totalItems === 0) return []
        
        const displayedPlayers = []
        
        if (itemsPerView === 1) {
            // Mobile: show only current player
            displayedPlayers.push({ 
                player: players[currentIndex], 
                isHighlighted: true, 
                animationKey: `${currentIndex}-center` 
            })
        } else if (itemsPerView === 2) {
            // Tablet: show current and next
            const nextIndex = (currentIndex + 1) % totalItems
            displayedPlayers.push(
                { player: players[currentIndex], isHighlighted: true, animationKey: `${currentIndex}-center` },
                { player: players[nextIndex], isHighlighted: false, animationKey: `${nextIndex}-right` }
            )
        } else {
            // Desktop: show previous, current, next
            if (totalItems === 1) {
                displayedPlayers.push({ player: players[0], isHighlighted: true, animationKey: '0' })
            } else if (totalItems === 2) {
                displayedPlayers.push(
                    { player: players[currentIndex], isHighlighted: false, animationKey: `${currentIndex}-left` },
                    { player: players[(currentIndex + 1) % totalItems], isHighlighted: true, animationKey: `${(currentIndex + 1) % totalItems}-center` },
                    { player: players[currentIndex], isHighlighted: false, animationKey: `${currentIndex}-right` }
                )
            } else {
                const prevIndex = (currentIndex - 1 + totalItems) % totalItems
                const nextIndex = (currentIndex + 1) % totalItems
                displayedPlayers.push(
                    { player: players[prevIndex], isHighlighted: false, animationKey: `${prevIndex}-left` },
                    { player: players[currentIndex], isHighlighted: true, animationKey: `${currentIndex}-center` },
                    { player: players[nextIndex], isHighlighted: false, animationKey: `${nextIndex}-right` }
                )
            }
        }
        
        return displayedPlayers
    }

    if (isLoading) {
        return (
            <div className="mt-8 md:mt-12 px-4 md:px-0">
                <h1 className="text-center text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-7xl font-bold mb-6 md:mb-10">Trending Players</h1>
                <div className="h-[300px] md:h-[400px] w-full bg-[#2C204B] rounded-2xl flex items-center justify-center">
                    <div className="text-white text-base md:text-xl">Loading trending players...</div>
                </div>
            </div>
        )
    }

    if (hasError || players.length === 0) {
        return (
            <div className="mt-8 md:mt-12 px-4 md:px-0">
                <h1 className="text-center text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-7xl font-bold mb-6 md:mb-10">Trending Players</h1>
                <div className="h-[300px] md:h-[400px] lg:h-[500px] w-full bg-[#2C204B] rounded-2xl flex items-center justify-center">
                    <div className="text-white text-base md:text-xl">
                        {hasError ? 'Unable to load players' : 'No matching players found'}
                    </div>
                </div>
            </div>
        )
    }

    const displayedPlayers = getDisplayedPlayers()

    return (
        <div className="mt-8 md:mt-14 px-4 md:px-0">
            <h1 className="text-center text-4xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-7xl font-bold mb-6 md:mb-10 transition-all duration-1000 ease-in-out">
                Trending Players
            </h1>

            <div className="relative w-full overflow-hidden">
                {/* Carousel Container - Responsive number of players */}
                <div className={`flex items-center justify-center gap-2 md:gap-4 min-h-[300px] md:min-h-[400px] w-full transition-all duration-1000 ease-in-out ${
                    isTransitioning ? 'opacity-90' : 'opacity-100'
                } ${
                    animationDirection === 'right' ? 'transform translate-x-1 md:translate-x-2' : 
                    animationDirection === 'left' ? 'transform -translate-x-1 md:-translate-x-2' : 
                    'transform translate-x-0'
                }`}>
                    {displayedPlayers.map((item, index) => (
                        <div 
                            key={item.animationKey || `${item.player.id}-${index}`} 
                            className={`flex-shrink-0 mt-4 md:mt-10 transition-all duration-800 ease-in-out ${
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
                    <div className="flex justify-center mt-6 md:mt-12 gap-4 md:gap-6">
                        <button
                            onClick={prevSlide}
                            disabled={isTransitioning}
                            className={`border-2 md:border-4 border-white hover:border-red-800 hover:cursor-pointer rounded-full p-2 md:p-3 text-white transition-all duration-500 z-10 ${
                                isTransitioning 
                                    ? 'opacity-50 cursor-not-allowed scale-95' 
                                    : 'opacity-100 cursor-pointer hover:scale-102 hover:shadow-lg'
                            }`}
                            aria-label="Previous player"
                        >
                            <ChevronLeft className="w-5 h-5 md:w-7 md:h-7 hover:text-red-800 transition-colors duration-300" />
                        </button>

                        <button
                            onClick={nextSlide}
                            disabled={isTransitioning}
                            className={`border-2 md:border-4 border-white hover:border-red-800 hover:cursor-pointer rounded-full p-2 md:p-3 text-white transition-all duration-500 z-10 ${
                                isTransitioning 
                                    ? 'opacity-50 cursor-not-allowed scale-95' 
                                    : 'opacity-100 cursor-pointer hover:scale-102 hover:shadow-lg'
                            }`}
                            aria-label="Next player"
                        >
                            <ChevronRight className="w-5 h-5 md:w-7 md:h-7 hover:text-red-800 transition-colors duration-300" />
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