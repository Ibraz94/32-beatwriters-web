"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Search, Filter, Users, MapPin, Hash, GraduationCap } from "lucide-react"
import { useGetPlayersQuery, useGetImageUrlQuery, Player, PlayersResponse } from '@/lib/services/playersApi'

export default function Players() {
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedPosition, setSelectedPosition] = useState("all")
    const [selectedConference, setSelectedConference] = useState("all")
    const [page, setPage] = useState(1)
    
    // Fetch players and positions from API
    const { 
        data: playersResponse, 
        isLoading: playersLoading, 
        error: playersError 
    } = useGetPlayersQuery({
        page,
        limit: 12,
        search: searchTerm || undefined,
        position: selectedPosition !== "all" ? selectedPosition : undefined,
        conference: selectedConference !== "all" ? selectedConference : undefined
    })

    console.log('Full API Response:', playersResponse)

    // Handle search with debounce
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            setPage(1) // Reset to first page when searching
        }, 500)

        return () => clearTimeout(timeoutId)
    }, [searchTerm])

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

                    {/* Position Filter */}
                    

                    {/* Conference Filter */}
                    <div className="relative">
                        <select
                            value={selectedConference}
                            onChange={(e) => {
                                setSelectedConference(e.target.value)
                                setPage(1)
                            }}
                            className="appearance-none border border-gray-200 rounded-lg px-4 py-3 pr-8 focus:outline-none focus:ring-2 focus:ring-red-800 focus:border-transparent"
                        >
                            <option value="all">All Conferences</option>
                            <option value="AFC">AFC</option>
                            <option value="NFC">NFC</option>
                        </select>
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
                            onClick={() => {
                                setSearchTerm("")
                                setSelectedPosition("all")
                                setSelectedConference("all")
                                setPage(1)
                            }}
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
                </p>
            </div>

            {/* Players Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {players.map((player) => (
                    <Link 
                        href={`/players/${player.id}`} 
                        key={player.id}
                        className="rounded-xl shadow-md hover:shadow-lg transition-all duration-200 hover:scale-102 border overflow-hidden"
                    >
                        {/* Player Image */}
                        {/* <div className="relative h-48">
                            <Image 
                                src={useGetImageUrlQuery(player.headshotPic).data || '/default-player.jpg'}
                                alt={player.name}
                                fill
                                className="object-cover"
                                onError={(e) => {
                                    const target = e.target as HTMLImageElement
                                    target.src = '/default-player.jpg'
                                }}
                            />
                        </div> */}

                        {/* Player Info */}
                        <div className="p-4">
                            <div className="flex items-start justify-between mb-2">
                                <h3 className="font-bold text-lg leading-tight hover:text-red-800 transition-colors">
                                    {player.name}
                                </h3>
                                <span className="px-2 py-1 rounded text-xs font-medium">
                                    #{player.draftPick}
                                </span>
                            </div>

                            <div className="space-y-2 text-sm">
                                <div className="flex items-center">
                                    <Users className="w-4 h-4 mr-2" />
                                    <span className="font-medium">{player.position}</span>
                                </div>
                                
                                <div className="flex items-center">
                                    <MapPin className="w-4 h-4 mr-2" />
                                    <span>{player.team}</span>
                                </div>
                                
                                <div className="flex items-center">
                                    <GraduationCap className="w-4 h-4 mr-2" />
                                    <span>{player.college}</span>
                                </div>
                                
                                <div className="flex items-center justify-between pt-2 border-t">
                                    <span className="text-xs">{player.height} • {player.weight}</span>
                                    <span className="text-xs px-2 py-1 rounded">
                                        {player.team}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </Link>
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
                        onClick={() => {
                            setSearchTerm("")
                            setSelectedPosition("all")
                            setSelectedConference("all")
                            setPage(1)
                        }}
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
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="px-4 py-2 rounded-lg border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                        >
                            Previous
                        </button>
                        
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            const pageNum = Math.max(1, Math.min(totalPages - 4, page - 2)) + i
                            return (
                                <button
                                    key={pageNum}
                                    onClick={() => setPage(pageNum)}
                                    className={`px-4 py-2 rounded-lg border transition-colors ${
                                        pageNum === page
                                            ? 'bg-red-800 text-white border-red-800'
                                            : 'hover:bg-gray-50'
                                    }`}
                                >
                                    {pageNum}
                                </button>
                            )
                        })}
                        
                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="px-4 py-2 rounded-lg border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </section>
    )
}
