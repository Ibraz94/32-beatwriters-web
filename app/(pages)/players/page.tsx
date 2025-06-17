"use client"

import { useState, useEffect, Suspense } from "react"
import Link from "next/link"
import Image from "next/image"
import { Search, Users, MapPin, GraduationCap } from "lucide-react"
import { useGetPlayersQuery, getImageUrl, Player } from '@/lib/services/playersApi'
import { useSearchParams, useRouter } from "next/navigation"

// PlayerCard component to handle individual player rendering with hooks
function PlayerCard({ player, currentPage }: { player: Player; currentPage: number }) {
    const imageUrl = getImageUrl(player.headshotPic)
    
    return (
        <Link 
            href={`/players/${player.id}?page=${currentPage}`} 
            className="rounded-xl shadow-md hover:shadow-lg transition-all duration-200 hover:scale-102 border overflow-hidden"
        >
            {/* Player Image */}
            <div className="relative h-48">
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
            <div className="p-4">
                <div className="flex items-start justify-center mb-2">
                    <h3 className="font-bold text-xl leading-tight hover:text-red-800 transition-colors">
                        {player.name}
                    </h3>
                </div>

                <div className="space-y-2 text-sm">
                    <div className="flex flex-col items-start justify-center">
                        <h1 className="font-bold text-sm">Position: <span className="text-sm font-normal">{player.position}</span></h1>
                        <h1 className="font-bold text-sm">Draft Pick: <span className="text-sm font-normal">{player.draftPick}</span></h1>
                        <h1 className="font-bold text-sm">College: <span className="text-sm font-normal">{player.college}</span></h1>
                        <h1 className="font-bold text-sm">Team: <span className="text-sm font-normal">{player.team || 'N/A'}</span></h1>
                    </div>
                    
                    <div className="flex flex-col items-center justify-center">
                       
                        
                    </div>
                </div>
            </div>
        </Link>
    )
}

function PlayersContent() {
    const searchParams = useSearchParams()
    const router = useRouter()
    
    // Initialize state from URL parameters
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedPosition, setSelectedPosition] = useState("all")
    const [selectedConference, setSelectedConference] = useState("all")
    const [page, setPage] = useState(() => {
        const pageFromUrl = searchParams?.get('page')
        return pageFromUrl ? parseInt(pageFromUrl, 10) : 1
    })

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
    if (playersLoading) {
        return (
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
        )
    }

    // Error state
    if (playersError) {
        return (
            <section className="container mx-auto max-w-7xl px-4 py-8">
                <div className="text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">
                        All <span className="text-red-800">Players</span>
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
                <h1 className="text-4xl md:text-5xl font-bold mb-4">
                    All <span className="text-red-800">Players</span>
                </h1>
                <p className="text-xl max-w-4xl mx-auto mb-6">
                    Comprehensive player profiles featuring detailed stats, team information, and career highlights. 
                    Explore every key player across all NFL teams.
                </p>
            </div>

            {/* Search and Filters */}
            <div className="rounded-xl shadow-md p-6 mb-8 border">
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search players by name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-800 focus:border-transparent"
                        />
                    </div>
                </div>

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

            {/* Results Count */}
            <div className="mb-6">
                <p className="text-gray-600">
                    Showing <span className="font-semibold">{players.length}</span> of <span className="font-semibold">{totalPlayers}</span> players
                    {page > 1 && <span> (Page {page} of {totalPages})</span>}
                </p>
            </div>

            {/* Players Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {players.map((player) => (
                    <PlayerCard key={player.id} player={player} currentPage={page} />
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
                            className="px-4 py-2 rounded-lg border disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transition-all"
                        >
                            Previous
                        </button>
                        
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            const pageNum = Math.max(1, Math.min(totalPages - 4, page - 2)) + i
                            return (
                                <button
                                    key={pageNum}
                                    onClick={() => handlePageChange(pageNum)}
                                    className={`px-4 py-2 rounded-lg border transition-colors ${
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
                            className="px-4 py-2 rounded-lg border disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transition-all"
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
