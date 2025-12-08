'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useCallback, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Search, X, ChevronLeft, ChevronRight, ChevronDown, Filter, Bookmark, Loader2, UserPlus, Clock, UsersRound, ListCheck } from 'lucide-react'
import Masonry from 'react-masonry-css'
import { ReadMore } from '@/app/components/ReadMore'
import {
    useGetFollowedNuggetsQuery,
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

export default function PlayersNuggetsPage() {
    // Add authentication check
    const { isAuthenticated, isLoading: authLoading, user } = useAuth()
    const router = useRouter()
    const pathname = usePathname();
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

    // Get followed nuggets
    const { data: followedNuggetsData, isLoading: isLoadingFollowedNuggets, error: followedNuggetsError, isFetching: isFetchingFollowedNuggets, refetch: refetchFollowedNuggets } = useGetFollowedNuggetsQuery()

    useEffect(() => {
        refetchFollowedNuggets()
    }, [user?.id, debouncedSearchTerm, filters, selectedDate, currentPage])

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
        setBookmarkLoading(nuggetId)

        try {
            if (isSaved) {
                await unsaveNugget(nuggetId).unwrap()
            } else {
                await saveNugget(nuggetId).unwrap()
            }
        } catch (error) {
            console.error('Error saving/unsaving nugget:', error)
        } finally {
            setBookmarkLoading(null)
        }
    }

    // Handle search
    const handleSearch = (term: string) => {
        setSearchTerm(term)
        setCurrentPage(1)
        setAllNuggets([])
    }

    // Clear date filter
    const clearDateFilter = () => {
        setDate(undefined)
        setSelectedDate('')
        setCurrentPage(1)
        setAllNuggets([])
    }

    // Handle position filter change
    const handlePositionFilterChange = (position: string) => {
        setFilters(prev => ({
            ...prev,
            position: position === 'All' ? '' : position
        }))
        setCurrentPage(1)
        setAllNuggets([])
    }

    // Handle team filter change
    const handleTeamFilterChange = (team: string) => {
        setFilters(prev => ({
            ...prev,
            team: team === 'All' ? '' : team
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
        setSearchTerm('')
        setDebouncedSearchTerm('')
        setDate(undefined)
        setCurrentPage(1)
        setAllNuggets([])
    }

    // Load more nuggets
    const loadMoreNuggets = () => {
        setCurrentPage(prev => prev + 1)
    }

    // Image modal functions
    const openImageModal = (src: string, alt: string, images?: string[], currentIndex?: number) => {
        setImageModal({ src, alt, images, currentIndex })
    }

    const closeImageModal = () => {
        setImageModal(null)
    }

    const navigateImage = (direction: 'prev' | 'next') => {
        if (!imageModal?.images || imageModal.currentIndex === undefined) return

        const newIndex = direction === 'prev'
            ? (imageModal.currentIndex - 1 + imageModal.images.length) % imageModal.images.length
            : (imageModal.currentIndex + 1) % imageModal.images.length

        setImageModal({
            ...imageModal,
            src: imageModal.images[newIndex],
            currentIndex: newIndex
        })
    }

    // Fantasy insight component
    const fantasyInsight = (fantasyInsight: string) => {
        if (fantasyInsight) {
            return <div dangerouslySetInnerHTML={{ __html: fantasyInsight }}></div>
        } else if (fantasyInsight === '') {
        } else {
            return null
        }
    }

    // Keyboard navigation for image modal
    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            if (imageModal) {
                if (e.key === 'Escape') {
                    closeImageModal()
                } else if (e.key === 'ArrowLeft') {
                    navigateImage('prev')
                } else if (e.key === 'ArrowRight') {
                    navigateImage('next')
                }
            }
        }

        document.addEventListener('keydown', handleKeyPress)
        return () => document.removeEventListener('keydown', handleKeyPress)
    }, [imageModal])

    // Trending Players component
    const TrendingPlayers = () => {
        const { data: trendingPlayersData, isLoading, error } = useGetTrendingPlayersQuery();

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

        if (error) {
            return <div className="rounded-lg border border-[#2C204B]">
                <div className='bg-[#2C204B] h-14 flex items-center justify-center'>
                    <h2 className="text-white text-center text-xl">TRENDING PLAYERS</h2>
                </div>
                <div className="p-4 text-center text-gray-500">
                    Error loading trending players
                </div>
            </div>
        }

        if (!trendingPlayersData?.data || trendingPlayersData.data.length === 0) {
            return <div className="rounded-lg border border-[#2C204B]">
                <div className='bg-[#2C204B] h-14 flex items-center justify-center'>
                    <h2 className="text-white text-center text-xl">TRENDING PLAYERS</h2>
                </div>
                <div className="p-4 text-center text-gray-500">
                    No trending players available
                </div>
            </div>
        }

        return (
            <div className="rounded-lg border border-[#2C204B]">
                <div className='bg-[#2C204B] h-14 flex items-center justify-center'>
                    <h2 className="text-white text-center text-xl">TRENDING PLAYERS</h2>
                </div>
                <div className="space-y-3">
                    {trendingPlayersData.data.map((player) => (
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
                                        loader={({ src }) => src}
                                    />
                                </div>
                                <span className="font-medium">{player.name}</span>
                            </div>
                            {player.teamDetails && (
                                <div className='flex flex-col items-end gap-1 text-sm text-gray-500'>
                                    <Image
                                        src={getTeamLogoUrl(player.teamDetails.logo) || ''}
                                        alt={player.teamDetails.name || 'Team logo'}
                                        width={24}
                                        height={24}
                                        className="object-contain"
                                        loader={({ src }) => src}
                                    />
                                    <p>{player.teamDetails.name || 'No team'}</p>
                                </div>
                            )}
                        </Link>
                    ))}
                </div>
            </div>
        );
    };

    // Filter nuggets based on search and filters
    const filteredNuggets = useMemo(() => {
        let filtered = followedNuggetsData?.data?.nuggets || []

        // Search filter
        if (debouncedSearchTerm) {
            filtered = filtered.filter(nugget =>
                nugget.content.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
                nugget.player.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
                nugget.player.team?.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
            )
        }

        // Position filter
        if (filters.position) {
            filtered = filtered.filter(nugget => nugget.player.position === filters.position)
        }

        // Team filter
        if (filters.team) {
            filtered = filtered.filter(nugget => nugget.player.team === filters.team)
        }

        // Date filter
        if (selectedDate) {
            filtered = filtered.filter(nugget => {
                const nuggetDate = new Date(nugget.createdAt).toISOString().split('T')[0]
                return nuggetDate === selectedDate
            })
        }

        // Rookie filter
        if (filters.rookie) {
            filtered = filtered.filter(nugget => nugget.player.rookie === true)
        }

        return filtered
    }, [followedNuggetsData?.data?.nuggets, debouncedSearchTerm, filters.position, filters.team, selectedDate, filters.rookie])

    const displayNuggets = filteredNuggets
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
                            }} className="text-[#E64A30] hover:text-[#E64A30]/90 font-semibold">Login</Link>
                        </p>
                    )}
                    <Link
                        href="/subscribe"
                        className="bg-[#E64A30] text-white px-6 py-3 rounded-full font-semibold"
                    >
                        Subscribe
                    </Link>
                </div>
            </div>
        )
    }

    // Loading state
    const isLoading = isLoadingFollowedNuggets || authLoading || isLoadingTeams
    if (isLoading && displayNuggets.length === 0) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center mb-12">
                    <h1 className="text-3xl font-bold mb-4 dark:text-[#D2D6E2]">My Players Nuggets</h1>
                    <p className="text-xl max-w-4xl mx-auto dark:text-gray-300">
                        Loading nuggets from your followed players...
                    </p>
                </div>

                <div className="flex gap-6">
                    <div className="flex-1">
                        <Masonry
                            breakpointCols={{
                                default: 2,
                                1100: 1,
                                700: 1,
                            }}
                            className="flex w-auto -ml-6"
                            columnClassName="pl-6 bg-clip-padding"
                        >
                            {[...Array(6)].map((_, i) => (
                                <div
                                    key={i}
                                    className="rounded-xl border border-gray-300 dark:border-gray-700 shadow-lg overflow-hidden animate-pulse mb-6 bg-gray-200 dark:bg-[#2B2B2B]"
                                >
                                    <div className="h-48 bg-gray-300 dark:bg-[#3A3A3A]"></div>
                                    <div className="p-6">
                                        <div className="h-6 bg-gray-300 dark:bg-[#3A3A3A] rounded mb-3"></div>
                                        <div className="h-4 bg-gray-300 dark:bg-[#3A3A3A] rounded mb-2"></div>
                                        <div className="h-4 bg-gray-300 dark:bg-[#3A3A3A] rounded mb-4 w-3/4"></div>
                                        <div className="h-4 bg-gray-300 dark:bg-[#3A3A3A] rounded"></div>
                                    </div>
                                </div>
                            ))}
                        </Masonry>
                    </div>

                    <div className="w-80 hidden lg:block">
                        <div className="bg-gray-200 dark:bg-[#2B2B2B] rounded-lg h-96 animate-pulse border border-gray-300 dark:border-gray-700"></div>
                    </div>
                </div>
            </div>
        )
    }

    // Error state
    if (followedNuggetsError) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center">
                    <h1 className="text-3xl font-bold mb-4 dark:text-[#D2D6E2]">My Players Nuggets</h1>
                    <p className="text-xl text-red-600 dark:text-red-500 mb-4">Failed to load nuggets</p>
                    <p className="text-gray-600 dark:text-gray-400">Please try again later.</p>
                </div>
            </div>
        )
    }


    return (
        <>
            <div className="container mx-auto px-3 py-7">
                {/* Mobile Feed Tabs */}
                <MobileFeedTabs />

                <div className='relative'>
                    <div
                        className="
      hidden md:flex absolute 
left-[-12px] right-[-12px] 
       h-[400%] 
      bg-cover bg-center bg-no-repeat 
      bg-[url('/background-image2.png')] 
      opacity-10 dark:opacity-5
  "
                        style={{
                            transform: "scaleY(-1)",
                            zIndex: -50,
                            top: '-100px'
                        }}

                    ></div>
                    {/* Mobile Filter Toggle Button */}
                    <div className="lg:hidden mb-5 flex items-center gap-3 w-full">
                        {/* Search Bar */}
                        <div className="w-full border border-[#C7C8CB] rounded-full px-3 py-1.5 dark:bg-[#262829]">
                            <div className="relative w-full">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    value={searchTerm}
                                    onChange={(e) => handleSearch(e.target.value)}
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

                        {/* Filter Button */}
                        <button
                            onClick={() => setShowMobileFilters(!showMobileFilters)}
                            className="relative flex items-center gap-2 px-4 py-2 border border-[#E64A30] text-[#E64A30] rounded-full dark:border-none dark:bg-[#262829] transition-colors"
                            title="Filters"
                        >
                            <Filter className="w-5 h-5" />
                            <span className="text-sm font-medium">Filters</span>

                            {(filters.position || filters.team || selectedDate || filters.rookie || searchTerm) && (
                                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs px-2 py-1 rounded-full">
                                    {[filters.position, filters.team, selectedDate, filters.rookie, searchTerm].filter(Boolean).length}
                                </span>
                            )}
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
                                        className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 text-white text-sm rounded-2xl hover:cursor-pointer"
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
                                                loader={({ src }) => src}
                                            />
                                            {date ? date.toLocaleDateString() : <span>Select By Date</span>}
                                            <ChevronDown className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0 bg-white dark:bg-[#262829] mt-1" align="start" side="bottom">
                                        <Calendar
                                            mode="single"
                                            selected={date}
                                            onSelect={(selectedCalendarDate: Date | undefined) => {
                                                setDate(selectedCalendarDate);
                                                if (selectedCalendarDate) {
                                                    const year = selectedCalendarDate.getFullYear();
                                                    const month = String(selectedCalendarDate.getMonth() + 1).padStart(2, '0');
                                                    const day = String(selectedCalendarDate.getDate()).padStart(2, '0');
                                                    setSelectedDate(`${year}-${month}-${day}`);
                                                } else {
                                                    setSelectedDate('');
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
                            <div className="border border-[#C7C8CB] rounded-full px-3 py-[2px] bg-white dark:bg-[#262829]">
                                <Select
                                    value={filters.position || 'all'}
                                    onValueChange={handlePositionFilterChange}
                                >
                                    <SelectTrigger className="!border-none !border-0 flex items-center gap-2">
                                        <ListCheck className="w-4 h-4" />
                                        <SelectValue placeholder="All Positions" />
                                    </SelectTrigger>
                                    <SelectContent className="border-none bg-white dark:bg-[#262829]">
                                        <SelectGroup>
                                            <SelectItem value="all">All Positions</SelectItem>
                                            {['QB', 'WR', 'RB', 'FB', 'TE'].map((position) => (
                                                <SelectItem key={position} value={position}>
                                                    {position}
                                                </SelectItem>
                                            ))}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Team Filter */}
                            <div className="flex items-center border border-[#C7C8CB] rounded-full px-3 py-[2px] bg-white dark:!bg-[#262829] transition-colors">
                                <Select
                                    value={filters.team || 'all'}
                                    onValueChange={handleTeamFilterChange}
                                >
                                    <SelectTrigger className="filter-select h-10 w-52 !border-none !border-0 text-sm flex items-center gap-2 !bg-transparent shadow-none focus:!ring-0 focus:outline-none">
                                        <UsersRound className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                                        <SelectValue placeholder="All Teams" />
                                        {/* <ChevronDown className="ml-auto h-4 w-4 text-gray-500" /> */}
                                    </SelectTrigger>
                                    <SelectContent className="border-none bg-white dark:bg-[#262829] text-black dark:text-white rounded-xl shadow-md">
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
                                <button
                                    onClick={clearFilters}
                                    className="whitespace-nowrap flex items-center justify-center gap-2 px-4 py-4 text-sm font-medium rounded-full border border-[#E64A30] text-[#E64A30] bg-white dark:!bg-[#262829] hover:bg-[#fff4f2] dark:hover:bg-[#303234] transition-colors dark:border-none hover:cursor-pointer"
                                >
                                    Clear Filters
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex gap-4 lg:gap-6 flex-col lg:flex-row min-w-0">
                    {/* Nuggets Grid */}
                    <div className="flex-1">
                        {displayNuggets.length === 0 ? (
                            <div className="text-center py-12">
                                <UserPlus className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                <p className="text-xl text-gray-600 mb-4">No nuggets from followed players</p>
                                <p className="text-gray-500 mb-8">
                                    {hasActiveFilters
                                        ? "No nuggets match your current filters. Try adjusting your search criteria."
                                        : "Follow some players to see their nuggets here."
                                    }
                                </p>
                                {!hasActiveFilters && (
                                    <Link
                                        href="/players"
                                        className="bg-red-800 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors"
                                    >
                                        Browse Players
                                    </Link>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-4 pr-4">
                                {displayNuggets.map((nugget, index) => {
                                    const playerTeam = findTeamByKey(nugget.player.team || '');
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
                                                    loader={({ src }) => src}
                                                />
                                            </div>

                                            {/* Player Details + Content */}
                                            <div className="col-span-5 md:col-span-11">
                                                {/* Header Section */}
                                                <div className="flex items-center gap-2 ml-4 mr-4">
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
                                                                        loader={({ src }) => src}
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
                                                            className={`flex items-center gap-2 px-3 py-2 rounded-full transition-colors cursor-pointer ${bookmarkLoading === nugget.id
                                                                ? 'bg-[#E64A30]/70'
                                                                : nugget.isSaved
                                                                    ? 'bg-[#E64A30]'
                                                                    : 'bg-[#E64A30] hover:opacity-90'
                                                                }`}
                                                            title={nugget.isSaved ? 'Remove from saved' : 'Save nugget'}
                                                            disabled={bookmarkLoading === nugget.id}
                                                        >
                                                            <span className="text-sm font-medium text-white">
                                                                {nugget.isSaved ? 'Saved' : 'Save'}
                                                            </span>
                                                            {bookmarkLoading === nugget.id ? (
                                                                <Loader2 className="w-5 h-5 animate-spin text-white" />
                                                            ) : (
                                                                <Bookmark
                                                                    strokeWidth={1}
                                                                    className={`w-5 h-5 ${nugget.isSaved ? 'fill-white text-white' : 'text-white'}`}
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
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    {/* <div className="w-full lg:w-80 xl:w-96 lg:flex-shrink-0">
                        <TrendingPlayers />
                    </div> */}
                </div>

                {/* Image Modal */}
                {imageModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50" onClick={closeImageModal}>
                        <div className="relative max-w-4xl max-h-full p-4" onClick={(e) => e.stopPropagation()}>
                            <button
                                onClick={closeImageModal}
                                className="absolute top-2 right-2 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-75 z-10"
                            >
                                <X className="w-6 h-6" />
                            </button>

                            {imageModal.images && imageModal.images.length > 1 && (
                                <>
                                    <button
                                        onClick={() => navigateImage('prev')}
                                        className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-75 z-10"
                                    >
                                        <ChevronLeft className="w-6 h-6" />
                                    </button>
                                    <button
                                        onClick={() => navigateImage('next')}
                                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-75 z-10"
                                    >
                                        <ChevronRight className="w-6 h-6" />
                                    </button>
                                </>
                            )}

                            <Image
                                src={getImageUrl(imageModal.src) || ''}
                                alt={imageModal.alt}
                                width={800}
                                height={600}
                                className="max-w-full max-h-full object-contain"
                                loader={({ src }) => src}
                            />

                            {imageModal.images && imageModal.images.length > 1 && (
                                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white bg-black bg-opacity-50 px-3 py-1 rounded-full text-sm">
                                    {imageModal.currentIndex !== undefined ? imageModal.currentIndex + 1 : 1} / {imageModal.images.length}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </>
    )
} 