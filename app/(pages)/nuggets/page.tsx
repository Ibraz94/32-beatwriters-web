'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Search, X, ChevronLeft, ChevronRight, ChevronDown, Filter, Bookmark, Loader2 } from 'lucide-react'
import Masonry from 'react-masonry-css'
import { ReadMore } from '@/app/components/ReadMore'

import {
    useGetNuggetsQuery,
    getImageUrl,
    useSearchNuggetsQuery,
    useSaveNuggetMutation,
    useUnsaveNuggetMutation
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
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { useAuth } from '@/lib/hooks/useAuth'
import { useGetTeamsQuery, getTeamLogoUrl } from '@/lib/services/teamsApi'
import { useRouter, usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import MobileFeedTabs from '@/app/components/MobileFeedTabs'
import { useGetPlayersQuery, Player } from '@/lib/services/playersApi'
import TrendingPlayers from '@/app/components/TrendingPlayers' // Import the TrendingPlayers component
import NewPlayerNuggetsSection from '@/app/components/NewPlayerNuggetsSection' // Import the new component


interface NuggetFilters {
    sortBy?: 'createdAt' | 'playerName'
    sortOrder?: 'asc' | 'desc'
    positions?: string[]
    rookie?: boolean
    position?: string
    team?: string
    search?: string
    startDate?: string
    page?: number
    limit?: number
}

interface ImageModalData {
    src: string
    alt: string
    images?: string[]
    currentIndex?: number
}

export default function NuggetsPage() {
    const pathname = usePathname();
    const router = useRouter()
    const { isAuthenticated, isLoading: authLoading, user } = useAuth()
    const [open, setOpen] = useState(false)
    const [date, setDate] = useState<Date | undefined>(undefined)

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
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
    const [allNuggets, setAllNuggets] = useState<any[]>([])
    const [hasMoreNuggets, setHasMoreNuggets] = useState(true)
    const [imageModal, setImageModal] = useState<ImageModalData | null>(null)
    const [currentPage, setCurrentPage] = useState(1)
    const [isLoadingMore, setIsLoadingMore] = useState(false)
    const [showMobileFilters, setShowMobileFilters] = useState(false)
    const [bookmarkLoading, setBookmarkLoading] = useState<number | null>(null)
    const ITEMS_PER_PAGE = 15

    // Debounce search term
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm)
        }, 500)

        return () => clearTimeout(timer)
    }, [searchTerm])

    // Synchronize date states
    useEffect(() => {
        if (!selectedDate && date) {
            setDate(undefined)
        } else if (selectedDate && !date) {
            setDate(new Date(selectedDate))
        }
    }, [selectedDate, date])

    // Build query parameters
    const queryParams = useMemo(() => {
        const params = {
            ...(debouncedSearchTerm && { search: debouncedSearchTerm }),
            ...(filters.position && { position: filters.position }),
            ...(filters.team && { team: filters.team }),
            ...(selectedDate && { startDate: selectedDate }),
            ...(filters.rookie && { rookie: filters.rookie }),
            page: currentPage,
            limit: ITEMS_PER_PAGE,
            sortBy: 'createdAt' as const,
            sortOrder: 'desc' as const
        }

        // Debug logging for startDate
        if (selectedDate) {
            console.log('🔍 startDate being sent:', selectedDate)
            console.log('🔍 Full query params:', params)
        }

        return params
    }, [debouncedSearchTerm, filters.position, filters.team, selectedDate, filters.rookie, currentPage])

    // Main query for nuggets - with all filters
    const {
        data: nuggetsData,
        isLoading: isLoadingNuggets,
        error: nuggetsError,
        isFetching: isFetchingNuggets
    } = useGetNuggetsQuery(queryParams)

    // Teams query
    const { data: teamsData, isLoading: isLoadingTeams } = useGetTeamsQuery()

    // Save/Unsave mutations
    const [saveNugget] = useSaveNuggetMutation()
    const [unsaveNugget] = useUnsaveNuggetMutation()

    // Helper function to find team by abbreviation or name
    const findTeamByKey = (teamKey: string) => {
        if (!teamsData?.teams || !teamKey) return null

        return teamsData.teams.find(team =>
            team.abbreviation?.toLowerCase() === teamKey.toLowerCase() ||
            team.name?.toLowerCase() === teamKey.toLowerCase() ||
            team.city?.toLowerCase() === teamKey.toLowerCase()
        )
    }

    // Handle save/unsave nugget
    const handleBookmarkClick = async (nuggetId: number, isSaved: boolean) => {
        // Set loading state for this specific nugget
        setBookmarkLoading(nuggetId)

        try {
            if (isSaved) {
                await unsaveNugget(nuggetId).unwrap()
            } else {
                await saveNugget(nuggetId).unwrap()
            }

            // Update local state to reflect the change immediately
            setAllNuggets(prevNuggets =>
                prevNuggets.map(nugget =>
                    nugget.id === nuggetId
                        ? { ...nugget, isSaved: !isSaved }
                        : nugget
                )
            )
        } catch (error) {
            console.error('Error saving/unsaving nugget:', error)
        } finally {
            // Clear loading state
            setBookmarkLoading(null)
        }
    }

    // Handle loading nuggets
    useEffect(() => {
        if (nuggetsData?.data?.nuggets) {
            const newNuggets = nuggetsData.data.nuggets
            if (currentPage === 1) {
                setAllNuggets(newNuggets)
            } else {
                setAllNuggets(prev => {
                    const existingIds = new Set(prev.map(n => n.id))
                    const filteredNew = newNuggets.filter(n => !existingIds.has(n.id))
                    return [...prev, ...filteredNew]
                })
            }
            setHasMoreNuggets(newNuggets.length === ITEMS_PER_PAGE)
            console.log('Data loaded, setting isLoadingMore to false')
            setIsLoadingMore(false)
        }
    }, [nuggetsData, currentPage])

    // Debug RTK Query states
    useEffect(() => {
        if (currentPage > 1) {
            console.log('RTK Query states - isFetching:', isFetchingNuggets, 'isLoading:', isLoadingNuggets, 'local isLoadingMore:', isLoadingMore)
        }
    }, [isFetchingNuggets, isLoadingNuggets, isLoadingMore, currentPage])

    // Reset loading state on error
    useEffect(() => {
        if (nuggetsError) {
            console.log('Error occurred, setting isLoadingMore to false')
            setIsLoadingMore(false)
        }
    }, [nuggetsError])

    // After the useEffect that loads nuggets, add:
    useEffect(() => {
        if (!isLoadingNuggets && allNuggets.length === 0) {
            setCurrentPage(1)
        }
    }, [isLoadingNuggets, allNuggets])

    // Search functionality
    const handleSearch = (term: string) => {
        setSearchTerm(term)
        setCurrentPage(1) // Reset to first page when searching
        setAllNuggets([]) // Clear current results
    }

    // Clear date filter
    const clearDateFilter = () => {
        setSelectedDate('')
        setDate(undefined)
        setCurrentPage(1)
        setAllNuggets([])
    }

    // Handle position filter change
    const handlePositionFilterChange = (position: string) => {
        setFilters(prev => ({
            ...prev,
            position: position === 'all' ? '' : position
        }))
        setCurrentPage(1)
        setAllNuggets([])
    }

    // Handle team filter change
    const handleTeamFilterChange = (team: string) => {
        setFilters(prev => ({
            ...prev,
            team: team === 'all' ? '' : team
        }))
        setCurrentPage(1)
        setAllNuggets([])
    }

    // Handle rookie filter change
    const handleRookieFilterChange = (isRookie: boolean) => {
        setFilters(prev => ({
            ...prev,
            rookie: isRookie
        }))
        setCurrentPage(1)
        setAllNuggets([])
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
        setDate(undefined)
        setSearchTerm('')
        setDebouncedSearchTerm('')
        setCurrentPage(1)
        setHasMoreNuggets(true)
    }

    // Load more nuggets
    const loadMoreNuggets = () => {
        if (!isLoadingMore && hasMoreNuggets) {
            console.log('Setting isLoadingMore to true')
            setIsLoadingMore(true)
            setCurrentPage(prev => prev + 1)
        }
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
        const targetPlayerNames = [
            'Emeka Egbuka',
            'Kyle Pitts',
            'Kyler Murray',
            'Dont\'e Thornton',
            'TreVeyon Henderson',
        ];

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



        if (isLoading) {
            return <div className="rounded-lg border border-[#2C204B]">
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
        }

        if (hasError) {
            return <div>Error fetching player data</div>;
        }

        console.log('All Info of user', user);

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
    };

    // Combined loading states
    const isLoading = isLoadingNuggets || authLoading || isLoadingTeams
    const error = nuggetsError
    const displayNuggets = allNuggets
    const hasActiveFilters = debouncedSearchTerm || filters.position || filters.team || selectedDate || filters.rookie

    // Show authentication required message if not authenticated or has insufficient membership
    if (!authLoading && (!isAuthenticated || (user?.memberships && user.memberships.id !== undefined && user.memberships.id < 2))) {
        return (
            <div className="container mx-auto h-screen px-4 py-8 flex flex-col items-center justify-center">
                <div className="max-w-6xl mx-auto text-center">
                    <h1 className="text-3xl font-bold mb-4">Premium Access Required</h1>
                    <p className="text-gray-600 mb-8">
                        {!isAuthenticated
                            ? "Please login to your account to view the feed. Don't have a subscription? Please subscribe to access premium content."
                            : "Please upgrade to a premium subscription to view the feed."
                        }
                    </p>

                    {!isAuthenticated && (
                        <p className="text-gray-600 mb-8">
                            <Link href={{
                                pathname: '/login',
                                query: { redirect: pathname }
                            }} className="text-red-600 hover:text-red-800 font-semibold">Login</Link>
                        </p>
                    )}
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
                {/* Mobile Feed Tabs */}
                <MobileFeedTabs />

                {/* Mobile Filter Toggle Button */}
                <div className="lg:hidden mb-4">
                    <button
                        onClick={() => setShowMobileFilters(!showMobileFilters)}
                        className="flex items-center gap-2 px-4 py-2 bg-red-800 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                        <Filter className="w-4 h-4" />
                        <span>Filters</span>
                        {(filters.position || filters.team || selectedDate || filters.rookie || searchTerm) && (
                            <span className="bg-red-600 text-white text-xs px-2 py-1 rounded-full">
                                {[filters.position, filters.team, selectedDate, filters.rookie, searchTerm].filter(Boolean).length}
                            </span>
                        )}
                    </button>
                </div>

                {/* Filters in One Line */}
                <div className={`mb-6 ${showMobileFilters ? 'block' : 'hidden'} lg:block`}>
                    <div className="flex gap-3 items-center justify-center w-full flex-col lg:flex-row">
                        {/* Search Bar */}
                        <div className="relative w-full">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search"
                                value={searchTerm}
                                onChange={(e) => handleSearch(e.target.value)}
                                className="filter-input w-full pl-10 pr-4 py-3 px-12 rounded shadow-sm"
                            />
                        </div>


                        {/* Date Filter */}
                        <div className="flex gap-2 w-full lg:w-auto">
                            <Popover open={open} onOpenChange={setOpen}>
                                <PopoverTrigger asChild className='h-10 flex-1 lg:w-42'>
                                    <Button
                                        variant="outline"
                                        className="filter-button justify-between text-left font-normal h-12"
                                    >
                                        {date ? date.toLocaleDateString() : <span>Select By Date</span>}
                                        <ChevronDown className="ml-2 h-4 w-4 text-gray-500" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start" side='bottom'>
                                    <Calendar
                                        mode="single"
                                        selected={date}
                                        onSelect={(selectedCalendarDate: Date | undefined) => {
                                            setDate(selectedCalendarDate)
                                            if (selectedCalendarDate) {
                                                // Format date as YYYY-MM-DD, handling timezone correctly
                                                const year = selectedCalendarDate.getFullYear()
                                                const month = String(selectedCalendarDate.getMonth() + 1).padStart(2, '0')
                                                const day = String(selectedCalendarDate.getDate()).padStart(2, '0')
                                                const dateString = `${year}-${month}-${day}`

                                                console.log('📅 Original date:', selectedCalendarDate)
                                                console.log('📅 Formatted date string:', dateString)

                                                setSelectedDate(dateString)
                                                setCurrentPage(1)
                                                setAllNuggets([])
                                            } else {
                                                setSelectedDate('')
                                                setCurrentPage(1)
                                                setAllNuggets([])
                                            }
                                            setOpen(false)
                                        }}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                            {date && (
                                <Button
                                    variant="outline"
                                    onClick={clearDateFilter}
                                    className="filter-button h-12 px-3"
                                    title="Clear date filter"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            )}
                        </div>


                        {/* Position Filter Dropdown */}
                        <Select
                            value={filters.position || "all"}
                            onValueChange={handlePositionFilterChange}
                        >
                            <SelectTrigger className="filter-select h-10 w-full lg:w-1/3">
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
                            <SelectTrigger className="filter-select w-full lg:w-1/2 h-10 text-sm">
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
                        <div className="filter-checkbox-container flex items-center space-x-2 px-6 py-3 rounded">
                            <input
                                type="checkbox"
                                id="rookie-filter"
                                checked={filters.rookie || false}
                                onChange={(e) => handleRookieFilterChange(e.target.checked)}
                                className="w-4 h-4 hover:cursor-pointer"
                            />
                            <label htmlFor="rookie-filter" className="text-sm font-medium hover:cursor-pointer">
                                Rookie
                            </label>
                        </div>

                        {/* Clear Filters Button */}
                        <div className="w-full lg:w-1/5 text-center">
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
                <div className="flex gap-4 lg:gap-6 flex-col lg:flex-row min-w-0">
                    {/* Feed Column - Scrollable */}
                    <div className="flex-1">
                        {displayNuggets.length === 0 && !isLoading ? (
                            <div className="text-center py-12">
                                <p className="text-xl text-gray-600 mb-4">
                                    {hasActiveFilters ? 'No nuggets found for your filters.' : 'No nuggets available.'}
                                </p>
                                {hasActiveFilters && (
                                    <button
                                        onClick={clearFilters}
                                        className="text-red-800 hover:cursor-pointer font-semibold"
                                    >
                                        Clear filters
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="max-h-[calc(100vh-300px)] overflow-y-auto pr-4 custom-scrollbar">
                                <div className="space-y-2">
                                    {displayNuggets.map((nugget, index) => {
                                        const playerTeam = findTeamByKey(nugget.player.team)
                                        // const router = useRouter()
                                        return (
                                            <div key={`${nugget.id}-${index}`} className="overflow-hidden shadow-md hover:shadow-xl transition-shadow">
                                                <div className='flex mt-2 gap-2 ml-4 mr-4'>
                                                    <div
                                                        className="cursor-pointer border rounded-full py-2 w-15 h-15 flex items-center justify-center relative"
                                                        onClick={() => router.push(`/players/${nugget.player.id}`, { scroll: false })}
                                                    >
                                                        <Image
                                                            src={getImageUrl(nugget.player.headshotPic) || ''}
                                                            alt={`${nugget.player.name} headshot`}
                                                            fill
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
                                                    {/* Bookmark Button */}
                                                    <div className="flex items-center">
                                                        <button
                                                            onClick={() => handleBookmarkClick(nugget.id, nugget.isSaved || false)}
                                                            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                                                            title={nugget.isSaved ? 'Remove from saved' : 'Save nugget'}
                                                            disabled={bookmarkLoading === nugget.id}
                                                        >
                                                            {bookmarkLoading === nugget.id ? (
                                                                <Loader2 className="w-5 h-5 animate-spin text-red-800" />
                                                            ) : (
                                                                <Bookmark
                                                                    className={`w-5 h-5 ${nugget.isSaved
                                                                            ? 'fill-red-800 text-red-800'
                                                                            : 'text-gray-500 hover:text-red-800'
                                                                        }`}
                                                                />
                                                            )}
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="px-6 border-white/20 mt-2">
                                                    <ReadMore id={nugget.id} text={nugget.content} amountOfCharacters={400} />
                                                </div>
                                                <div className='px-6'>
                                                    {nugget.fantasyInsight && (
                                                        <>
                                                            <h1 className='font-semibold mt-2 text-red-800'>Fantasy Insight:</h1>
                                                            {fantasyInsight(nugget.fantasyInsight)}
                                                        </>
                                                    )}
                                                </div>

                                                    <div className='px-6 border-b border-white/20'>
                                                    <div className='flex flex-col mt-1 text-sm'>
                                                        {nugget.sourceUrl && (
                                                            <div className='mt-2 -mb-7'>
                                                                    <div className='flex items-center gap-2'>
                                                                        <span>Source:</span>
                                                                        <Link href={nugget.sourceUrl.startsWith('http://') || nugget.sourceUrl.startsWith('https://')
                                                                            ? nugget.sourceUrl
                                                                            : `https://${nugget.sourceUrl}`} target='_blank' rel='noopener noreferrer' className='text-left hover:text-red-800'> {nugget.sourceName}</Link>
                                                                        {nugget.urlIcon && (
                                                                            <img src={(nugget.urlIcon) || ''} alt='icon' className='h-6 w-6' />
                                                                        )}
                                                                    </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                        
                                                    <h1 className='text-right text-gray-400 mt-2 mb-2 text-sm'>
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
                                {/* Load More Button */}
                                {hasMoreNuggets && displayNuggets.length > 0 && (
                                    <div className="text-center py-6">
                                        <button
                                            onClick={() => {
                                                console.log('Load More button clicked, isLoadingMore:', isLoadingMore, 'isFetchingNuggets:', isFetchingNuggets)
                                                loadMoreNuggets()
                                            }}
                                            disabled={isLoadingMore || isFetchingNuggets}
                                            className="bg-red-800 text-white px-8 py-3 rounded font-semibold hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 mx-auto cursor-pointer"
                                        >
                                            {(isLoadingMore || isFetchingNuggets) && (
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                            )}
                                            {(isLoadingMore || isFetchingNuggets) ? 'Loading...' : 'Load More'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}


                    </div>

                    {/* Trending Players Sidebar */}
                    <div className="w-full lg:w-80 xl:w-96 lg:flex-shrink-0">
                        <TrendingPlayers />
                        <NewPlayerNuggetsSection />
                    </div>
                </div>
            </div>
        </>
    )
}


