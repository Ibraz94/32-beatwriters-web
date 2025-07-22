"use client"

import { useState, useEffect, Suspense } from "react"
import Link from "next/link"
import Image from "next/image"
import { Users, Search, X, Loader2 } from "lucide-react"
import { useGetPlayersQuery, getImageUrl, Player, useFollowPlayerMutation, useUnfollowPlayerMutation } from '@/lib/services/playersApi'
import { useGetTeamsQuery, getTeamLogoUrl } from '@/lib/services/teamsApi'
import { useSearchParams, useRouter } from "next/navigation"
import { useAuth } from '@/lib/hooks/useAuth'
import { useToast } from '@/app/components/Toast'

// PlayerCard component to handle individual player rendering with hooks
function PlayerCard({ player, currentPage, teamsData, isFollowing, onToggleFollow, isAuthenticated, isLoading }: {
  player: Player;
  currentPage: number;
  teamsData: any;
  isFollowing: boolean;
  onToggleFollow: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}) {
    const imageUrl = getImageUrl(player.headshotPic)
    
    // Helper function to find team by abbreviation or name
    const findTeamByKey = (teamKey: string) => {
        if (!teamsData?.teams || !teamKey) return null
        
        return teamsData.teams.find((team: any) => 
            team.abbreviation?.toLowerCase() === teamKey.toLowerCase() ||
            team.name?.toLowerCase() === teamKey.toLowerCase() ||
            team.city?.toLowerCase() === teamKey.toLowerCase()
        )
    }

    const playerTeam = findTeamByKey(player.team || '')
    
    return (
        <Link 
            href={`/players/${player.id}?page=${currentPage}`} 
            className="player-card rounded hover:shadow-lg transition-all duration-200 hover:scale-101 overflow-hidden p-1"
        >
            {/* Player Image */}
            <div className="relative h-48 bg-linear-to-t from-[#876AD1] to-[#45366B]">
                <Image 
                    src={imageUrl || '/default-player.jpg'}
                    alt={player.name}
                    fill
                    className="object-cover"
                    onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.src = '/default-player.jpg'
                    }}
                />
            </div>

            {/* Player Info */}
            <div className="p-2">
                <div className="flex justify-between">
                    <h3 className="text-2xl leading-tight font-oswald">
                        {player.name}
                    </h3>
                    <button
                      className={`text-foreground font-oswald text-xs border px-5 rounded-sm transition-colors hover:cursor-pointer flex items-center gap-1 ${
                        isFollowing 
                          ? 'bg-red-800 border-red-800' 
                          : 'border-red-800 hover:bg-red-800'
                      }`}
                      onClick={e => {
                        e.preventDefault(); // Prevent Link navigation
                        onToggleFollow();
                      }}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-3 h-3 animate-spin" />
                          <span>...</span>
                        </>
                      ) : (
                        isFollowing ? 'FOLLOWING' : 'FOLLOW'
                      )}
                    </button>
                </div>

                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                        {playerTeam && (
                                <Image
                                    src={getTeamLogoUrl(playerTeam.logo) || ''}
                                    alt={`${playerTeam.name} logo`}
                                    width={24}
                                    height={18}
                                    className='object-contain'
                                />
                            )}
                            <h1 className="text-sm font-oswald">{player.team || 'Free Agent'}  {player.position}</h1>
  
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    )
}

function PlayersContent() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const { isAuthenticated, isLoading: authLoading } = useAuth()
    const { showToast } = useToast()
    
    // Initialize state from URL parameters
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedPosition, setSelectedPosition] = useState("all")
    const [selectedConference, setSelectedConference] = useState("all")
    const [page, setPage] = useState(() => {
        const pageFromUrl = searchParams?.get('page')
        return pageFromUrl ? parseInt(pageFromUrl, 10) : 1
    })

    // Track follow state for each player (fallback for local state management)
    const [followedPlayers, setFollowedPlayers] = useState<{ [id: string]: boolean }>({})
    const [loadingFollow, setLoadingFollow] = useState<{ [id: string]: boolean }>({})

    // Follow/Unfollow mutations
    const [followPlayer] = useFollowPlayerMutation()
    const [unfollowPlayer] = useUnfollowPlayerMutation()

    const toggleFollow = async (playerId: string) => {
        // Check if user is authenticated
        if (!isAuthenticated) {
            showToast('Please log in to follow players.', 'warning')
            return
        }

        // Set loading state
        setLoadingFollow(prev => ({ ...prev, [playerId]: true }))

        try {
            const isCurrentlyFollowed = followedPlayers[playerId] || false
            if (isCurrentlyFollowed) {
                await unfollowPlayer(playerId).unwrap()
                showToast('Player unfollowed successfully!', 'success')
            } else {
                await followPlayer(playerId).unwrap()
                showToast('Player followed successfully!', 'success')
            }
            // Update local state for immediate UI feedback
            setFollowedPlayers(prev => ({
                ...prev,
                [playerId]: !prev[playerId]
            }))
        } catch (error: any) {
            console.error('Error toggling follow status:', error)
            
            // Handle authentication error specifically
            if (error?.status === 401 || error?.data?.message?.includes('Authentication required')) {
                showToast('Please log in to follow players.', 'warning')
            } else {
                showToast('Failed to update follow status. Please try again.', 'error')
            }
        } finally {
            // Clear loading state
            setLoadingFollow(prev => ({ ...prev, [playerId]: false }))
        }
    }

    // Teams query
    const { data: teamsData, isLoading: isLoadingTeams } = useGetTeamsQuery()

    const updateURL = (newPage?: number, newSearch?: string, newPosition?: string, newConference?: string) => {
        const params = new URLSearchParams()
        
        const currentPage = newPage ?? page
        const currentSearch = newSearch ?? searchTerm
        const currentPosition = newPosition ?? selectedPosition
        const currentConference = newConference ?? selectedConference
        
        if (currentPage > 1) params.set('page', currentPage.toString())
        if (currentSearch) params.set('search', currentSearch)
        if (currentPosition !== "all") params.set('position', currentPosition)
        if (currentConference !== "all") params.set('conference', currentConference)
        
        const newURL = params.toString() ? `?${params.toString()}` : '/players'
        router.replace(newURL, { scroll: false })
    }

    // Initialize from URL parameters on mount
    useEffect(() => {
        const urlPage = searchParams?.get('page')
        const urlSearch = searchParams?.get('search')
        const urlPosition = searchParams?.get('position')
        const urlConference = searchParams?.get('conference')
        
        if (urlPage) setPage(parseInt(urlPage, 10))
        if (urlSearch) setSearchTerm(urlSearch)
        if (urlPosition) setSelectedPosition(urlPosition)
        if (urlConference) setSelectedConference(urlConference)
    }, [searchParams])

    // Handle search term changes with debouncing
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (searchTerm !== (searchParams?.get('search') || '')) {
                setPage(1) // Reset to first page when searching
                updateURL(1, searchTerm, selectedPosition, selectedConference)
            }
        }, 500) // 500ms debounce

        return () => clearTimeout(timeoutId)
    }, [searchTerm])

    // Handle filter changes (position and conference)
    useEffect(() => {
        const currentPosition = searchParams?.get('position') || 'all'
        const currentConference = searchParams?.get('conference') || 'all'
        
        if (selectedPosition !== currentPosition || selectedConference !== currentConference) {
            setPage(1) // Reset to first page when filters change
            updateURL(1, searchTerm, selectedPosition, selectedConference)
        }
    }, [selectedPosition, selectedConference])

    // Fetch players and positions from API
    const { 
        data: playersResponse, 
        isLoading: playersLoading, 
        error: playersError 
    } = useGetPlayersQuery({
        page,
        limit: 12,
        pageSize: 12,
        search: searchTerm || undefined,
        position: selectedPosition !== "all" ? selectedPosition : undefined,
        conference: selectedConference !== "all" ? selectedConference : undefined
    })

    console.log('Full API Response:', playersResponse)



    // Handle page changes
    const handlePageChange = (newPage: number) => {
        setPage(newPage)
        updateURL(newPage, searchTerm, selectedPosition, selectedConference)
        // Scroll to top when page changes
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const clearAllFilters = () => {
        setSearchTerm("")
        setSelectedPosition("all")
        setSelectedConference("all")
        const newPage = 1
        setPage(newPage)
        updateURL(newPage, "", "all", "all")
    }

    // Loading state
    if (playersLoading || isLoadingTeams) {
        return (
            <section className="container mx-auto max-w-7xl px-4 py-8">
                <div className="text-center mb-8">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">
                        All Players
                    </h1>
                    <p className="text-xl max-w-4xl mx-auto mb-6">
                        Loading players...
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {Array.from({ length: 12 }).map((_, index) => (
                        <div key={index} className="animate-pulse">
                            <div className="bg-gray-300 rounded-lg h-48 mb-4"></div>
                            <div className="h-4 bg-gray-300 rounded mb-2"></div>
                            <div className="h-3 bg-gray-300 rounded mb-2"></div>
                            <div className="h-3 bg-gray-300 rounded w-3/4"></div>
                        </div>
                    ))}
                </div>
            </section>
        )
    }

    // Error state
    if (playersError) {
        return (
            <section className="container mx-auto max-w-7xl px-4 py-8">
                <div className="text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">
                        All Players
                    </h1>
                    <p className="text-xl text-red-600 mb-4">Failed to load players</p>
                    <p className="text-gray-600">Please try again later.</p>
                </div>
            </section>
        )
    }

    const players = playersResponse?.data?.players || []
    const totalPlayers = playersResponse?.data?.pagination?.total || 0
    const totalPages = playersResponse?.data?.pagination?.totalPages || 0

    console.log('Processed Players:', players)
    console.log('Is Array?', Array.isArray(players))

    return (
        <section className="container mx-auto max-w-7xl px-4 py-8">
            {/* Header */}
            <div className="text-center mb-8">
                <h1 className="text-4xl md:text-5xl font-bold mb-4 font-oswald">
                    All Players
                </h1>
            </div>

            {/* Search Bar */}
            <div className="mb-8 flex w-full">
                <div className="relative w-full">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search players..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="filter-input w-full pl-10 pr-10 py-3 rounded shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
                    />
                    {searchTerm && (
                        <button
                            type="button"
                            onClick={() => setSearchTerm("")}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-600 focus:outline-none"
                            aria-label="Clear search"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    )}
                </div>
            </div>

            <div>
                {/* Active Filters Display */}
                {(searchTerm || selectedPosition !== "all" || selectedConference !== "all") && (
                    <div className="mt-4 flex flex-wrap gap-2">
                        <span className="text-sm text-gray-600">Active filters:</span>
                        {searchTerm && (
                            <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm">
                                Search: "{searchTerm}"
                            </span>
                        )}
                        {selectedPosition !== "all" && (
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                                Position: {selectedPosition}
                            </span>
                        )}
                        {selectedConference !== "all" && (
                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                                Conference: {selectedConference}
                            </span>
                        )}
                        <button
                            onClick={clearAllFilters}
                            className="text-red-800 underline text-sm ml-2"
                        >
                            Clear all
                        </button>
                    </div>
                )}
            </div>

            {/* Players Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {players.map((player) => (
                    <PlayerCard
                      key={player.id}
                      player={player}
                      currentPage={page}
                      teamsData={teamsData}
                      isFollowing={player.isFollowed || !!followedPlayers[player.id]}
                      onToggleFollow={() => toggleFollow(player.id.toString())}
                      isAuthenticated={isAuthenticated}
                      isLoading={!!loadingFollow[player.id]}
                    />
                ))}
            </div>

            {/* No Results */}
            {players.length === 0 && (
                <div className="text-center py-12">
                    <Users className="w-16 h-16 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No players found</h3>
                    <p className="mb-4">
                        Try adjusting your search criteria or filters
                    </p>
                    <button
                        onClick={clearAllFilters}
                        className="bg-red-800 text-white px-6 py-2 rounded-lg hover:bg-red-900 transition-colors"
                    >
                        Clear Filters
                    </button>
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="mt-8 flex justify-center">
                    <div className="flex gap-2">
                        <button
                            onClick={() => handlePageChange(Math.max(1, page - 1))}
                            disabled={page === 1}
                            className="px-4 py-2 rounded-sm border disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transition-all"
                        >
                            Previous
                        </button>
                        
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            const pageNum = Math.max(1, Math.min(totalPages - 4, page - 2)) + i
                            return (
                                <button
                                    key={pageNum}
                                    onClick={() => handlePageChange(pageNum)}
                                    className={`px-4 py-2 rounded-sm border transition-colors ${
                                        pageNum === page
                                            ? 'bg-red-800 text-white border-red-800'
                                            : 'hover:scale-105 transition-all'
                                    }`}
                                >
                                    {pageNum}
                                </button>
                            )
                        })}
                        
                        <button
                            onClick={() => handlePageChange(Math.min(totalPages, page + 1))}
                            disabled={page === totalPages}
                            className="px-4 py-2 rounded-sm border disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transition-all"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}

            <div className="flex items-center justify-center gap-2 mt-10 -mb-6">
            <h1 className="text-sm font-light">Data Powered By <span className="font-bold">PlayerProfiler</span> </h1>
            <Link
            href='https://playerprofiler.com/'
            target="_blank"
            >
            <Image
            src="/pp-logo.png"
            width={30}
            height={30}
            alt="pp=logo"
            />
            </Link>
            </div>
        </section>
    )
}

export default function Players() {
    return (
        <Suspense fallback={
            <section className="container mx-auto max-w-7xl px-4 py-8">
                <div className="text-center mb-8">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">
                        All <span className="text-red-800">Players</span>
                    </h1>
                    <p className="text-xl max-w-4xl mx-auto mb-6">
                        Loading players...
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {Array.from({ length: 12 }).map((_, index) => (
                        <div key={index} className="animate-pulse">
                            <div className="bg-gray-300 rounded-lg h-48 mb-4"></div>
                            <div className="h-4 bg-gray-300 rounded mb-2"></div>
                            <div className="h-3 bg-gray-300 rounded mb-2"></div>
                            <div className="h-3 bg-gray-300 rounded w-3/4"></div>
                        </div>
                    ))}
                </div>
            </section>
        }>
            <PlayersContent />
        </Suspense>
    )
}
