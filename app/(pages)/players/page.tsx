"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import Image from "next/image"
import { Search, Filter, Users, MapPin, Hash, GraduationCap } from "lucide-react"
import { getAllPlayers, getAllPositions, Player } from './data/players'

export default function Players() {
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedPosition, setSelectedPosition] = useState("all")
    const [selectedConference, setSelectedConference] = useState("all")
    
    const allPlayers = getAllPlayers()
    const allPositions = getAllPositions()

    // Filter players based on search and filters
    const filteredPlayers = useMemo(() => {
        let filtered = allPlayers

        // Search by name
        if (searchTerm) {
            filtered = filtered.filter(player => 
                player.name.toLowerCase().includes(searchTerm.toLowerCase())
            )
        }

        // Filter by position
        if (selectedPosition !== "all") {
            filtered = filtered.filter(player => 
                player.position === selectedPosition
            )
        }

        // Filter by conference
        if (selectedConference !== "all") {
            filtered = filtered.filter(player => 
                player.team.conference === selectedConference
            )
        }

        return filtered.sort((a, b) => a.name.localeCompare(b.name))
    }, [allPlayers, searchTerm, selectedPosition, selectedConference])

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
                
                {/* Stats */}
                <div className="flex justify-center gap-8 text-sm">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-red-800">{allPlayers.length}</div>
                        <div>Total Players</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-red-800">{allPositions.length}</div>
                        <div>Positions</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-red-800">32</div>
                        <div>Teams</div>
                    </div>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="bg-white rounded-xl shadow-md p-6 mb-8 border">
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
                    <div className="relative">
                        <select
                            value={selectedPosition}
                            onChange={(e) => setSelectedPosition(e.target.value)}
                            className="appearance-none bg-white border border-gray-200 rounded-lg px-4 py-3 pr-8 focus:outline-none focus:ring-2 focus:ring-red-800 focus:border-transparent"
                        >
                            <option value="all">All Positions</option>
                            {allPositions.map(position => (
                                <option key={position} value={position}>{position}</option>
                            ))}
                        </select>
                    </div>

                    {/* Conference Filter */}
                    <div className="relative">
                        <select
                            value={selectedConference}
                            onChange={(e) => setSelectedConference(e.target.value)}
                            className="appearance-none bg-white border border-gray-200 rounded-lg px-4 py-3 pr-8 focus:outline-none focus:ring-2 focus:ring-red-800 focus:border-transparent"
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
                    Showing <span className="font-semibold">{filteredPlayers.length}</span> of <span className="font-semibold">{allPlayers.length}</span> players
                </p>
            </div>

            {/* Players Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredPlayers.map((player) => (
                    <Link 
                        href={`/players/${player.id}`} 
                        key={player.id}
                        className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 hover:scale-102 border overflow-hidden"
                    >
                        {/* Player Image */}
                        <div className="relative h-48 bg-gray-100">
                            <Image 
                                src={player.image} 
                                alt={player.name}
                                fill
                                className="object-cover"
                                onError={(e) => {
                                    const target = e.target as HTMLImageElement
                                    target.src = '/default-player.jpg'
                                }}
                            />
                            <div className="absolute top-2 right-2 bg-white rounded-full p-1">
                                <Image 
                                    src={player.team.logo} 
                                    alt={player.team.name}
                                    width={24}
                                    height={24}
                                    className="rounded-full"
                                />
                            </div>
                        </div>

                        {/* Player Info */}
                        <div className="p-4">
                            <div className="flex items-start justify-between mb-2">
                                <h3 className="font-bold text-lg leading-tight hover:text-red-800 transition-colors">
                                    {player.name}
                                </h3>
                                <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs font-medium">
                                    #{player.number}
                                </span>
                            </div>

                            <div className="space-y-2 text-sm text-gray-600">
                                <div className="flex items-center">
                                    <Users className="w-4 h-4 mr-2" />
                                    <span className="font-medium">{player.position}</span>
                                </div>
                                
                                <div className="flex items-center">
                                    <MapPin className="w-4 h-4 mr-2" />
                                    <span>{player.team.city} {player.team.name}</span>
                                </div>
                                
                                <div className="flex items-center">
                                    <GraduationCap className="w-4 h-4 mr-2" />
                                    <span>{player.college}</span>
                                </div>
                                
                                <div className="flex items-center justify-between pt-2 border-t">
                                    <span className="text-xs">{player.height} • {player.weight}</span>
                                    <span className="text-xs px-2 py-1 bg-gray-100 rounded">
                                        {player.team.conference}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {/* No Results */}
            {filteredPlayers.length === 0 && (
                <div className="text-center py-12">
                    <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-600 mb-2">No players found</h3>
                    <p className="text-gray-500 mb-4">
                        Try adjusting your search criteria or filters
                    </p>
                    <button
                        onClick={() => {
                            setSearchTerm("")
                            setSelectedPosition("all")
                            setSelectedConference("all")
                        }}
                        className="bg-red-800 text-white px-6 py-2 rounded-lg hover:bg-red-900 transition-colors"
                    >
                        Clear Filters
                    </button>
                </div>
            )}
        </section>
    )
}
