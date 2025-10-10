'use client'

import { useState, useEffect, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Search, X, ChevronDown, Filter, Bookmark, Loader2, Clock, Calendar1, Calendar1Icon, CheckLine, ListCheck, UsersRound } from 'lucide-react'
import Masonry from 'react-masonry-css'
import { ReadMore } from '@/app/components/ReadMore'

import {
    useGetNuggetsQuery,
    getImageUrl,
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
import { useGetTrendingPlayersQuery } from '@/lib/services/playersApi'
import NewPlayerNuggetsSection from '@/app/components/NewPlayerNuggetsSection' // Import the new component
import SearchBar from '@/components/ui/search'
import { useTheme } from 'next-themes'


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
    const { theme } = useTheme();

    const calendarIcon =
        theme === 'dark' ? '/calendar-nuggets-dark.svg' : '/calendar-nuggets.svg'

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
        const { data: trendingPlayersData, isLoading, error } = useGetTrendingPlayersQuery();

        // 🔹 Loading State
        if (isLoading) {
            return (
                <div className="bg-[var(--trending-background-color)] rounded-2xl py-4 px-2 dark:bg-[var(--dark-theme-color)]">
                    <div className="h-14 flex items-center justify-center">
                        <h2 className="text-black font-semibold text-center text-2xl tracking-wider dark:text-white">
                            Trending Players
                        </h2>
                    </div>
                    <div className="space-y-3 p-3">
                        {[...Array(5)].map((_, i) => (
                            <div
                                key={i}
                                className="flex items-center justify-between p-3 bg-[var(--light-trending-background-color)] rounded-2xl dark:bg-[#1A1A1A] animate-pulse"
                            >
                                <div className="flex items-center space-x-3">
                                    <div className="w-12 h-12 rounded-full bg-gray-300 dark:bg-gray-700"></div>
                                    <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-24"></div>
                                </div>
                                <div className="w-8 h-8 bg-gray-300 dark:bg-gray-700 rounded"></div>
                            </div>
                        ))}
                    </div>
                </div>
            );
        }

        // 🔹 Error State
        if (error) {
            return <div className="text-center text-red-500 py-4">Error fetching trending players data</div>;
        }

        // 🔹 Empty State
        if (!trendingPlayersData?.data || trendingPlayersData.data.length === 0) {
            return (
                <div className="bg-[var(--trending-background-color)] rounded-2xl py-4 px-2 dark:bg-[var(--dark-theme-color)]">
                    <div className="h-14 flex items-center justify-center">
                        <h2 className="text-black font-semibold text-center text-2xl tracking-wider dark:text-white">
                            Trending Players
                        </h2>
                    </div>
                    <div className="p-5 text-center text-gray-500 dark:text-gray-400">
                        No trending players available
                    </div>
                </div>
            );
        }

        // 🔹 Main Component
        return (
            <div className="bg-[var(--trending-background-color)] rounded-2xl py-4 px-2 dark:bg-[var(--dark-theme-color)]">
                {/* Header */}
                <div className="h-14 flex items-center justify-center">
                    <h2 className="text-black font-semibold text-center text-2xl tracking-wider dark:text-white">
                        Trending Players
                    </h2>
                </div>

                {/* Players List */}
                <div className="space-y-3">
                    {trendingPlayersData.data.map((player) => (
                        <Link
                            key={player.id}
                            href={`/players/${player.id}`}
                            className="flex items-center justify-between p-3 bg-[var(--light-trending-background-color)] hover:bg-gray-50 transition-colors mx-3 rounded-2xl dark:bg-[#1A1A1A] dark:hover:bg-gray-600"
                        >
                            <div className="flex items-center space-x-3">
                                {/* Player Image */}
                                <div className="w-12 h-12 rounded-full overflow-hidden border border-red-400 p-0.5">
                                    <Image
                                        src={getImageUrl(player.headshotPic) || "/default-player.jpg"}
                                        alt={player.name}
                                        width={45}
                                        height={45}
                                        className="w-full h-full object-cover"
                                    />
                                </div>

                                {/* Player Info */}
                                <div className="flex flex-col justify-center">
                                    <span className="font-medium leading-tight dark:text-white">{player.name}</span>
                                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 space-x-1">
                                        <span>{player.position}</span>
                                        <span>•</span>
                                        <span>{player.teamDetails?.name || "No team"}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Team Logo */}
                            {player.teamDetails && (
                                <div className="flex flex-col items-end gap-1 text-sm text-gray-500">
                                    {(() => {
                                        const teamLogoUrl = getTeamLogoUrl(player.teamDetails.logo);
                                        return teamLogoUrl ? (
                                            <Image
                                                src={teamLogoUrl}
                                                alt={player.teamDetails.name || "Team logo"}
                                                width={34}
                                                height={34}
                                                className="object-contain"
                                            />
                                        ) : null;
                                    })()}
                                </div>
                            )}
                        </Link>
                    ))}
                </div>

                {/* Mobile "View All" Button */}
                <div className="text-center">
                    <button className="lg:hidden text-[var(--color-orange)] mt-5 underline underline-offset-6 font-semibold">
                        View all
                    </button>
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

                {/* Search Bar + Filter Button in One Line */}
                <div className="flex items-center md:hidden gap-3 w-full md:w-auto mb-5">
                    {/* Search Bar */}
                    <div className="w-full md:w-[550px] border border-[#C7C8CB] rounded-full px-3 py-1.5 dark:bg-[#262829]">
                        <div className="relative w-full">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search..."
                                className="w-full pl-10 pr-24 py-2 rounded-full placeholder:text-gray-400 focus:outline-none text-base"
                            />
                            <button
                                type="button"
                                className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 text-white text-sm rounded-2xl"
                                style={{ backgroundColor: '#E64A30' }}
                            >
                                Search
                            </button>
                        </div>
                    </div>

                    {/* Mobile Filter Toggle Button */}
                    <button
                        onClick={() => setShowMobileFilters(!showMobileFilters)}
                        className="flex items-center gap-2 px-4 py-2 border border-[#E64A30] text-[#E64A30] rounded-full dark:border-none dark:bg-[#262829] lg:hidden transition-colors"
                        title="Filters"
                    >
                        <Filter className="w-5 h-5" />
                        <span className="text-sm font-medium">Filters</span>
                    </button>
                </div>

                {/* Filters in One Line */}
                <div className={`mb-6 ${showMobileFilters ? 'block' : 'hidden'} lg:block`}>
                    <div className="flex flex-col lg:flex-row items-center justify-center gap-3 w-full">

                        {/* Search Bar */}
                        <div className="hidden md:flex w-full md:w-[550px] border border-[#C7C8CB] rounded-full px-3 py-1.5 dark:bg-[#262829]">
                            <div className="relative w-full">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    className="w-full pl-10 pr-24 py-2 rounded-full placeholder:text-gray-400 focus:outline-none text-base"
                                />
                                <button
                                    type="button"
                                    className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 text-white text-sm rounded-2xl"
                                    style={{ backgroundColor: '#E64A30' }}
                                >
                                    Search
                                </button>
                            </div>
                        </div>

                        {/* Date Filter */}
                        <div className="flex gap-2 items-center border border-[#C7C8CB] rounded-full px-3 py-1.5 bg-white dark:!bg-[#262829]">
                            <Popover open={open} onOpenChange={setOpen}>
                                <PopoverTrigger asChild className="flex-1">
                                    <Button
                                        variant="outline"
                                        className="filter-button justify-between text-left font-normal h-10 !border-none !border-0 shadow-none flex items-center gap-2 !bg-transparent"
                                    >
                                        <Image
                                            src={calendarIcon}
                                            alt="Calendar icon"
                                            width={18}
                                            height={18}
                                        />
                                        {date ? date.toLocaleDateString() : <span>Select By Date</span>}
                                        <ChevronDown className="h-4 w-4 text-gray-500" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0 bg-[#1D212D]" align="start" side="bottom">
                                    <Calendar
                                        mode="single"
                                        selected={date}
                                        onSelect={(selectedCalendarDate: Date | undefined) => {
                                            setDate(selectedCalendarDate);
                                            if (selectedCalendarDate) {
                                                const year = selectedCalendarDate.getFullYear();
                                                const month = String(selectedCalendarDate.getMonth() + 1).padStart(2, '0');
                                                const day = String(selectedCalendarDate.getDate()).padStart(2, '0');
                                                const dateString = `${year}-${month}-${day}`;
                                                setSelectedDate(dateString);
                                                setCurrentPage(1);
                                                setAllNuggets([]);
                                            } else {
                                                setSelectedDate('');
                                                setCurrentPage(1);
                                                setAllNuggets([]);
                                            }
                                            setOpen(false);
                                        }}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>

                            {date && (
                                <Button
                                    variant="outline"
                                    onClick={clearDateFilter}
                                    className="filter-button h-10 px-3 border-none !bg-transparent"
                                    title="Clear date filter"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            )}
                        </div>

                        {/* Position Filter */}
                        <div className="border border-[#C7C8CB] rounded-full px-3 py-1.5  bg-white dark:bg-[#262829]">
                            <Select
                                value={filters.position || "all"}
                                onValueChange={handlePositionFilterChange}
                            >
                                <SelectTrigger className="h-10 w-40 !border-none !border-0 flex items-center gap-2">
                                    <ListCheck className='w-4 h-4' />
                                    <SelectValue placeholder="All Positions" />
                                </SelectTrigger>
                                <SelectContent className="border-none">
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
                        </div>

                        {/* Team Filter */}
                        <div className="flex items-center border border-[#C7C8CB] rounded-full px-3 py-1.5 bg-white dark:!bg-[#262829] transition-colors">
                            <Select
                                value={filters.team || "all"}
                                onValueChange={handleTeamFilterChange}
                            >
                                <SelectTrigger className="filter-select h-10 w-52 !border-none !border-0 text-sm flex items-center gap-2 !bg-transparent shadow-none focus:ring-0 focus:outline-none">
                                    <UsersRound className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                                    <SelectValue placeholder="All Teams" />
                                    <ChevronDown className="ml-auto h-4 w-4 text-gray-500" />
                                </SelectTrigger>

                                <SelectContent className="border-none bg-white dark:bg-[#1D212D] text-black dark:text-white rounded-xl shadow-md">
                                    <SelectGroup>
                                        <SelectItem value="all">All Teams</SelectItem>
                                        {teamsData?.teams.map((team) => (
                                            <SelectItem key={team.name} value={team.name}>
                                                {team.name}
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Rookie Checkbox */}
                        <div className="border border-[#C7C8CB] rounded-full flex items-center gap-2 px-8 py-4 dark:bg-[#262829]">
                            <input
                                type="checkbox"
                                id="rookie-filter"
                                checked={filters.rookie || false}
                                onChange={(e) => handleRookieFilterChange(e.target.checked)}
                                className="w-4 h-4 cursor-pointer"
                            />
                            <label htmlFor="rookie-filter" className="text-sm font-medium cursor-pointer">
                                Rookie
                            </label>
                        </div>

                        {/* Clear Filters Button */}
                        <div className="w-full lg:w-auto text-center">
                            <button onClick={clearFilters} className="whitespace-nowrap flex items-center justify-center gap-2 px-4 py-4 text-sm font-medium rounded-full border border-[#E64A30] text-[#E64A30] bg-white dark:!bg-[#262829] hover:bg-[#fff4f2] dark:hover:bg-[#303234] transition-colors dark:border-none">
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
                            <div>
                                <div className="space-y-2">
                                    {displayNuggets.map((nugget, index) => {
                                        const playerTeam = findTeamByKey(nugget.player.team)
                                        return (
                                            <div
                                                key={`${nugget.id}-${index}`}
                                                className="overflow-hidden grid grid-cols-6 md:grid-cols-12 border-b pb-4 border-[var(--color-gray)]"
                                            >
                                                {/* Player Image */}
                                                <div
                                                    className="cursor-pointer border rounded-full p-0 w-15 h-15 flex items-center justify-center relative col-span-1"
                                                    onClick={() => router.push(`/players/${nugget.player.id}`, { scroll: false })}
                                                >
                                                    <Image
                                                        src={getImageUrl(nugget.player.headshotPic) || ''}
                                                        alt={`${nugget.player.name} headshot`}
                                                        fill
                                                        className="rounded-full object-cover bg-background overflow-hidden"
                                                    />
                                                </div>

                                                {/* Player Details + Content */}
                                                <div className="col-span-5 md:col-span-11">
                                                    {/* Header Section */}
                                                    <div className="flex items-center gap-2 ml-4 mr-4 col-1">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2">
                                                                <Link href={`/players/${nugget.player.id}`}>
                                                                    <h1 className="text-xl">{nugget.player.name}</h1>
                                                                </Link>
                                                                {playerTeam && (
                                                                    <div className="flex items-center">
                                                                        <Image
                                                                            src={getTeamLogoUrl(playerTeam.logo) || ''}
                                                                            alt={`${playerTeam.name} logo`}
                                                                            width={32}
                                                                            height={24}
                                                                            className="object-contain"
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
                                                                className={`flex items-center gap-2 px-3 py-2 rounded-full transition-colors cursor-pointer 
                                                                    ${bookmarkLoading === nugget.id
                                                                        ? 'bg-[#E64A30]/70'
                                                                        : nugget.isSaved
                                                                            ? 'bg-[#E64A30]'
                                                                            : 'bg-[#E64A30] hover:opacity-90'
                                                                    }`}
                                                                title={nugget.isSaved ? 'Remove from saved' : 'Save nugget'}
                                                                disabled={bookmarkLoading === nugget.id}
                                                            >
                                                                <span className="text-sm font- text-white">
                                                                    {nugget.isSaved ? 'Saved' : 'Save'}
                                                                </span>

                                                                {bookmarkLoading === nugget.id ? (
                                                                    <Loader2 className="w-5 h-5 animate-spin text-white" />
                                                                ) : (
                                                                    <Bookmark
                                                                        strokeWidth={1}
                                                                        className={`w-5 h-5 ${nugget.isSaved ? 'fill-white text-white' : 'text-white'
                                                                            }`}
                                                                    />
                                                                )}
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {/* Content Section */}
                                                    <div className="mt-3 ml-4 dark:text-[#D2D6E2]">
                                                        <ReadMore id={nugget.id.toString()} text={nugget.content} amountOfCharacters={400} />
                                                    </div>

                                                    {/* Fantasy Insight Section */}
                                                    {nugget.fantasyInsight && (
                                                        <div className="px-4 mt-2 dark:text-[#D2D6E2]">
                                                            <h1 className="font-semibold mt-0 text-red-800">Fantasy Insight:</h1>
                                                            {fantasyInsight(nugget.fantasyInsight)}
                                                        </div>
                                                    )}

                                                    {/* Source + Date Section */}
                                                    <div className="bg-[var(--gray-background-color)] rounded-full pr-3 pl-2 py-2 flex items-center justify-between mr-5 ml-5 mt-2 dark:bg-[var(--dark-theme-color)]">
                                                        {/* Source */}
                                                        {nugget.sourceUrl && (
                                                            <div className="flex items-center gap-1 bg-[var(--light-orange-background-color)] rounded-full px-3 py-1.5 w-fit dark:text-black">
                                                                <span className="font-semibold text-sm">Source:</span>
                                                                <Link
                                                                    href={
                                                                        nugget.sourceUrl.startsWith('http://') || nugget.sourceUrl.startsWith('https://')
                                                                            ? nugget.sourceUrl
                                                                            : `https://${nugget.sourceUrl}`
                                                                    }
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="text-left hover:text-red-800 text-sm"
                                                                >
                                                                    {nugget.sourceName}
                                                                </Link>
                                                            </div>
                                                        )}

                                                        {/* Date */}
                                                        <div className="flex flex-row gap-2 text-gray-400">
                                                            <Clock size={18} />
                                                            <h1 className="text-gray-400 text-sm">
                                                                {new Date(nugget.createdAt).toLocaleDateString('en-US', {
                                                                    year: 'numeric',
                                                                    month: 'short',
                                                                    day: 'numeric',
                                                                })}
                                                            </h1>
                                                        </div>
                                                    </div>
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
                                            className="bg-[#E64A30] text-white px-8 py-3 rounded-full font-semibold hover:bg-[#d14429] disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 mx-auto cursor-pointer"
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


