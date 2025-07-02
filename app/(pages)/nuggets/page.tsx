'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Search, X, ChevronLeft, ChevronRight } from 'lucide-react'
import Masonry from 'react-masonry-css'
import { ReadMore } from '@/app/components/ReadMore'
import {
    useGetNuggetsQuery,
    getImageUrl
} from '@/lib/services/nuggetsApi'
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useAuth } from '@/lib/hooks/useAuth'
import { useGetTeamsQuery, getTeamLogoUrl } from '@/lib/services/teamsApi'
import { useRouter } from 'next/navigation'


interface NuggetFilters {
    sortBy?: 'createdAt' | 'playerName'
    sortOrder?: 'asc' | 'desc'
    positions?: string[]
    rookie?: boolean
    position?: string
    team?: string
}

interface ImageModalData {
    src: string
    alt: string
    images?: string[]
    currentIndex?: number
}

export default function NuggetsPage() {
    // Add authentication check
    const { isAuthenticated, isLoading: authLoading } = useAuth()
    const { user, isLoading: premiumLoading } = useAuth()

    const [filters, setFilters] = useState<NuggetFilters>({
        sortBy: 'createdAt',
        sortOrder: 'desc',
        positions: [],
        rookie: false,
        position: '',
        team: ''
    })
    const [selectedDate, setSelectedDate] = useState<string>('')
    const [searchTerm, setSearchTerm] = useState('')
    const [isSearching, setIsSearching] = useState(false)
    const [allNuggets, setAllNuggets] = useState<any[]>([])
    const [hasMoreNuggets, setHasMoreNuggets] = useState(true)
    const [imageModal, setImageModal] = useState<ImageModalData | null>(null)
    const [availablePositions, setAvailablePositions] = useState<string[]>([])
    const [availableTeams, setAvailableTeams] = useState<string[]>([])

    // Main query for nuggets - simplified to just fetch all nuggets
    const {
        data: nuggetsData,
        isLoading: isLoadingNuggets,
        error: nuggetsError,
        isFetching: isFetchingNuggets
    } = useGetNuggetsQuery({
        ...(filters.rookie && { rookie: filters.rookie }),
        ...(filters.position && { position: filters.position })
    }, {
        skip: false
    })

    // Search query - we'll handle this client-side
    const [searchResults, setSearchResults] = useState<any[]>([])

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

    // Handle loading nuggets and extracting filter options
    useEffect(() => {
        if (nuggetsData?.data?.nuggets) {
            setAllNuggets(nuggetsData.data.nuggets)
            setHasMoreNuggets(false) // Since we're loading all at once

            // Extract unique positions
            const positions = [...new Set(nuggetsData.data.nuggets
                .map((nugget: any) => nugget.player.position)
                .filter(Boolean)
            )].sort()

            setAvailablePositions(positions)

            // Extract unique teams
            const teams = [...new Set(nuggetsData.data.nuggets
                .map((nugget: any) => nugget.player.team)
                .filter(Boolean)
            )].sort()

            setAvailableTeams(teams)
        }
    }, [nuggetsData])

    // Client-side search functionality
    const handleSearch = (term: string) => {
        setSearchTerm(term)
        setIsSearching(!!term)

        if (term) {
            const searchTermLower = term.toLowerCase()
            const filtered = allNuggets.filter(nugget =>
                nugget.content.toLowerCase().includes(searchTermLower) ||
                nugget.player.name.toLowerCase().includes(searchTermLower) ||
                nugget.sourceName?.toLowerCase().includes(searchTermLower) ||
                teamsData?.teams.find(team => team.name === nugget.player.team)?.name?.toLowerCase().includes(searchTermLower)
            )
            setSearchResults(filtered)
        } else {
            setSearchResults([])
        }
    }

    // Client-side filtering and sorting
    const getFilteredAndSortedNuggets = (nuggets: any[]) => {
        let filtered = [...nuggets]

        // Apply date filter if selected
        if (selectedDate) {
            const selectedDateObj = new Date(selectedDate)
            filtered = filtered.filter(nugget => {
                const nuggetDate = new Date(nugget.createdAt)
                return nuggetDate.toDateString() === selectedDateObj.toDateString()
            })
        }

        // Apply position filter
        if (filters.positions && filters.positions.length > 0) {
            filtered = filtered.filter(nugget =>
                filters.positions!.includes(nugget.player.position)
            )
        }

        // Apply team filter
        if (filters.team) {
            filtered = filtered.filter(nugget =>
                teamsData?.teams.find(team => team.name === nugget.player.team)?.name?.toLowerCase() === filters.team?.toLowerCase()
            )
        }

        // Apply sorting (always sort by date, newest first)
        return filtered.sort((a, b) => {
            const dateA = new Date(a.createdAt).getTime()
            const dateB = new Date(b.createdAt).getTime()
            return dateB - dateA // Newest first
        })
    }

    // Handle date change
    const handleDateChange = (date: string) => {
        setSelectedDate(date)
    }

    // Clear date filter
    const clearDateFilter = () => {
        setSelectedDate('')
    }

    // Handle position filter change
    const handlePositionFilterChange = (position: string) => {
        setFilters(prev => ({
            ...prev,
            position: position === 'all' ? '' : position
        }))
    }

    // Handle team filter change
    const handleTeamFilterChange = (team: string) => {
        setFilters(prev => ({
            ...prev,
            team: team === 'all' ? '' : team
        }))
    }

    // Handle rookie filter change
    const handleRookieFilterChange = (isRookie: boolean) => {
        setFilters(prev => ({
            ...prev,
            rookie: isRookie
        }))
    }

    // Clear all filters
    const clearFilters = () => {
        setFilters({
            sortBy: 'createdAt',
            sortOrder: 'desc',
            positions: [],
            rookie: false,
            position: '',
            team: ''
        })
        setSelectedDate('')
        setSearchTerm('')
        setIsSearching(false)
        setSearchResults([])
    }

    // Image modal functions
    const openImageModal = (src: string, alt: string, images?: string[], currentIndex?: number) => {
        setImageModal({ src, alt, images, currentIndex })
    }

    const closeImageModal = () => {
        setImageModal(null)
    }

    const navigateImage = (direction: 'prev' | 'next') => {
        if (!imageModal || !imageModal.images || imageModal.currentIndex === undefined) return

        const newIndex = direction === 'prev'
            ? (imageModal.currentIndex - 1 + imageModal.images.length) % imageModal.images.length
            : (imageModal.currentIndex + 1) % imageModal.images.length

        setImageModal({
            ...imageModal,
            src: getImageUrl(imageModal.images[newIndex]) || '',
            currentIndex: newIndex
        })
    }

    const fantasyInsight = (fantasyInsight: string) => {
        if (fantasyInsight) {
            return <div dangerouslySetInnerHTML={{ __html: fantasyInsight }}></div>
        } else if (fantasyInsight === '') {
        } else {
            return null
        }
    }

    // Handle keyboard navigation
    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            if (!imageModal) return

            if (e.key === 'Escape') {
                closeImageModal()
            } else if (e.key === 'ArrowLeft') {
                navigateImage('prev')
            } else if (e.key === 'ArrowRight') {
                navigateImage('next')
            }
        }

        window.addEventListener('keydown', handleKeyPress)
        return () => window.removeEventListener('keydown', handleKeyPress)
    }, [imageModal])

    // Trending Players Component
    const TrendingPlayers = () => {
        // Get top 5 players from recent nuggets
        const trendingPlayers = allNuggets
            .slice(0, 10)
            .reduce((acc: any[], nugget) => {
                const existingPlayer = acc.find(p => p.id === nugget.player.id)
                if (!existingPlayer) {
                    acc.push({
                        ...nugget.player,
                        team: findTeamByKey(nugget.player.team)
                    })
                }
                return acc
            }, [])
            .slice(0, 5)

        return (
            <div className="rounded-lg border border-[#2C204B]">
                <div className='bg-[#2C204B] h-14 flex items-center justify-center'>
                    <h2 className="text-white text-center text-xl">TRENDING PLAYER</h2>
                </div>
                <div className="space-y-3">
                    {trendingPlayers.map((player, index) => (
                        <Link
                            key={player.id}
                            href={`/players/${player.id}`}
                            className="flex items-center justify-between p-3 border-b border-[#2C204B]"
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
                                        alt={player.team.name}
                                        width={24}
                                        height={24}
                                        className="object-contain"
                                    />
                                    <p>{player.team.name}</p>
                                </div>
                            )}
                        </Link>
                    ))}
                </div>
            </div>
        )
    }

    const isLoading = isLoadingNuggets || authLoading || premiumLoading || isLoadingTeams
    const error = nuggetsError
    const displayNuggets = isSearching ? searchResults : getFilteredAndSortedNuggets(allNuggets)

    // Show authentication required message if not authenticated
    if (!authLoading && !isAuthenticated && !user?.memberships) {
        return (
            <div className="container mx-auto h-screen px-4 py-8 flex flex-col items-center justify-center">
                <div className="max-w-6xl mx-auto text-center">
                    <h1 className="text-3xl font-bold mb-4">Premium Access Required</h1>
                    <p className="text-gray-600 mb-8">Please upgrade to a premium subscription to view the feed. Already have a subscription? Please login to your account.</p>

                    <p className="text-gray-600 mb-8">
                        <Link href="/login" className="text-red-600 hover:text-red-800 font-semibold">Login</Link>
                    </p>
                    <Link
                        href="/subscribe"
                        className="bg-red-800 text-white px-6 py-3 rounded-lg font-semibold"
                    >
                        Subscribe
                    </Link>
                </div>
            </div>
        )
    }

    // Loading state
    if (isLoading && allNuggets.length === 0) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center mb-12">
                    <p className="text-xl max-w-4xl mx-auto">Loading feed...</p>
                </div>
                <div className="flex gap-6">
                    <div className="flex-1">
                        <Masonry
                            breakpointCols={{
                                default: 2,
                                1100: 1,
                                700: 1
                            }}
                            className="flex w-auto -ml-6"
                            columnClassName="pl-6 bg-clip-padding"
                        >
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="rounded-xl border shadow-lg overflow-hidden animate-pulse mb-6">
                                    <div className="h-48 bg-gray-200"></div>
                                    <div className="p-6">
                                        <div className="h-6 bg-gray-200 rounded mb-3"></div>
                                        <div className="h-4 bg-gray-200 rounded mb-2"></div>
                                        <div className="h-4 bg-gray-200 rounded mb-4 w-3/4"></div>
                                        <div className="h-4 bg-gray-200 rounded"></div>
                                    </div>
                                </div>
                            ))}
                        </Masonry>
                    </div>
                    <div className="w-80 hidden lg:block">
                        <div className="bg-gray-200 rounded-lg h-96 animate-pulse"></div>
                    </div>
                </div>
            </div>
        )
    }

    // Error state
    if (error) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center">
                    <p className="text-xl text-red-600 mb-4">Failed to load feed</p>
                    <p className="text-gray-600">Please try again later.</p>
                </div>
            </div>
        )
    }

    return (
        <>
            <div className="container mx-auto px-4 py-8">
                {/* Filters in One Line */}
                <div className="mb-6">
                    <div className="flex gap-3 items-center justify-center w-full">
                        {/* Search Bar */}
                        <div className="relative w-full">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search"
                                value={searchTerm}
                                onChange={(e) => handleSearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 px-12 border border-white/20 rounded shadow-sm"
                            />
                        </div>


                        {/* Date Filter */}
                        <div className="relative">
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => handleDateChange(e.target.value)}
                                className="px-10 py-3 border border-white/20 rounded"
                                placeholder="MM/DD/YYYY"
                            />
                        </div>

                        {/* Position Filter Dropdown */}
                        <Select
                            value={filters.position || "all"}
                            onValueChange={handlePositionFilterChange}
                        >
                            <SelectTrigger className="h-10 w-1/3">
                                <SelectValue placeholder="All Positions" />
                            </SelectTrigger>
                            <SelectContent className='border-none'>
                                <SelectGroup>
                                    <SelectItem value="all">All Positions</SelectItem>
                                    {['QB', 'WR', 'RB', 'FB', 'TE'].map(position => (
                                        <SelectItem key={position} value={position}>
                                            {position}
                                        </SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>

                        {/* Team Filter Dropdown */}
                        <Select
                            value={filters.team || "all"}
                            onValueChange={handleTeamFilterChange}
                        >
                            <SelectTrigger className="w-1/2 h-10 text-sm">
                                <SelectValue placeholder="All Teams" />
                            </SelectTrigger>
                            <SelectContent className='border-none'>
                                <SelectGroup>
                                    <SelectItem value="all">All Teams</SelectItem>
                                    {teamsData?.teams.map(team => (
                                        <SelectItem key={team.name} value={team.name}>
                                            {team.name}
                                        </SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>

                        {/* Rookie Filter */}
                        <div className="flex items-center space-x-2 px-6 py-3 border border-white/20 rounded">
                            <input
                                type="checkbox"
                                id="rookie-filter"
                                checked={filters.rookie || false}
                                onChange={(e) => handleRookieFilterChange(e.target.checked)}
                                className="w-4 h-4 hover:cursor-pointer"
                            />
                            <label htmlFor="rookie-filter" className="text-sm font-medium text-gray-700 hover:cursor-pointer">
                                Rookie
                            </label>
                        </div>

                        {/* Clear Filters Button */}
                        <div className="w-1/5">
                            <button
                                onClick={clearFilters}
                                className="px-4 py-2 text-sm font-medium hover:cursor-pointer hover:text-red-800"
                            >
                                Clear Filters
                            </button>
                        </div>
                    </div>
                </div>

                {/* Main Content Area - Two Column Layout */}
                <div className="flex gap-6">
                    {/* Feed Column - Scrollable */}
                    <div className="flex-1">
                        {displayNuggets.length === 0 && !isLoading ? (
                            <div className="text-center py-12">
                                <p className="text-xl text-gray-600 mb-4">
                                    {isSearching ? 'No nuggets found for your search.' : 'No nuggets available.'}
                                </p>
                                {isSearching && (
                                    <button
                                        onClick={() => handleSearch('')}
                                        className="text-red-800 hover:cursor-pointer font-semibold"
                                    >
                                        Clear search
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="max-h-[calc(100vh-300px)] overflow-y-auto pr-4 custom-scrollbar">
                                <div className="space-y-6">
                                    {displayNuggets.map((nugget, index) => {
                                        const playerTeam = findTeamByKey(nugget.player.team)
                                        const router = useRouter()
                                        return (
                                            <div key={`${nugget.id}-${index}`} className="overflow-hidden shadow-md hover:shadow-xl transition-shadow">
                                                <div className='flex mt-8 gap-2 ml-4 mr-4'>
                                                    <div
                                                        className="cursor-pointer border rounded-full py-2 w-12 h-12 flex items-center justify-center"
                                                        onClick={() => router.push(`/players/${nugget.player.id}`, { scroll: false })}
                                                    >
                                                        <Image
                                                            src={getImageUrl(nugget.player.headshotPic) || ''}
                                                            alt={`${nugget.player.name} headshot`}
                                                            width={50}
                                                            height={50}
                                                            className='rounded-full object-cover bg-background overflow-hidden'
                                                        />
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2">
                                                            <Link href={`/players/${nugget.player.id}`}>
                                                                <h1 className='text-xl'>{nugget.player.name}</h1>
                                                            </Link>
                                                            {playerTeam && (
                                                                <div className="flex items-center">
                                                                    <Image
                                                                        src={getTeamLogoUrl(playerTeam.logo) || ''}
                                                                        alt={`${playerTeam.name} logo`}
                                                                        width={32}
                                                                        height={24}
                                                                        className='object-contain '
                                                                    />
                                                                </div>
                                                            )}
                                                        </div>
                                                        {nugget.player.team && (
                                                            <p className="text-sm text-gray-500">
                                                                {nugget.player.position} • {nugget.player.team}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="px-6 py-4 border-t border-white/20 mt-3">
                                                    <ReadMore id={nugget.id} text={nugget.content} amountOfCharacters={400} />
                                                </div>
                                                <div className='px-6 py-2'>
                                                    {nugget.fantasyInsight && (
                                                        <>
                                                            <h1 className='font-semibold mt-4 text-red-800'>Fantasy Insight:</h1>
                                                            {fantasyInsight(nugget.fantasyInsight)}
                                                        </>
                                                    )}
                                                </div>

                                                <div className='px-6 py-4 border-b border-white/20'>
                                                    <div className='flex flex-col mt-1 -mb-8 text-sm'>
                                                        {nugget.sourceUrl && (
                                                            <>
                                                                <div className=''>Source:
                                                                    <Link href={nugget.sourceUrl.startsWith('http://') || nugget.sourceUrl.startsWith('https://')
                                                                        ? nugget.sourceUrl
                                                                        : `https://${nugget.sourceUrl}`} target='_blank' rel='noopener noreferrer' className='text-left hover:text-red-800'> {nugget.sourceName}</Link></div>
                                                            </>
                                                        )}
                                                    </div>
                                                    <h1 className='text-right text-gray-400 mt-2 text-sm'>
                                                        {new Date(nugget.createdAt).toLocaleDateString('en-US', {
                                                            year: 'numeric',
                                                            month: 'short',
                                                            day: 'numeric'
                                                        })}
                                                    </h1>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Trending Players Sidebar */}
                    <div className="w-96 hidden lg:block">
                        <TrendingPlayers />
                    </div>
                </div>
            </div>
        </>
    )
}


