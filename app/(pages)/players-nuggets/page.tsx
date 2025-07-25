'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Search, X, ChevronLeft, ChevronRight, ChevronDown, Filter, Bookmark, Loader2, UserPlus } from 'lucide-react'
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
    const { data: followedNuggetsData, isLoading: isLoadingFollowedNuggets, error: followedNuggetsError, isFetching: isFetchingFollowedNuggets } = useGetFollowedNuggetsQuery()

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
        const trendingPlayers = allNuggets
            .reduce((acc: any[], nugget) => {
                if (!acc.find(p => p.id === nugget.player.id)) {
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
                    <h2 className="text-white text-center text-xl">TRENDING PLAYERS</h2>
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

    // Show authentication required message if not authenticated
    if (!authLoading && !isAuthenticated) {
        return (
            <div className="container mx-auto h-screen px-4 py-8 flex flex-col items-center justify-center">
                <div className="max-w-6xl mx-auto text-center">
                    <h1 className="text-3xl font-bold mb-4">Authentication Required</h1>
                    <p className="text-gray-600 mb-8">Please login to view nuggets from your followed players.</p>
                    <Link
                       href={{
        pathname: '/login',
        query: { redirect: pathname }  // Pass the current path as a query parameter
      }}
                        className="bg-red-800 text-white px-6 py-3 rounded-lg font-semibold"
                    >
                        Login
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
                    <h1 className="text-3xl font-bold mb-4">My Players Nuggets</h1>
                    <p className="text-xl max-w-4xl mx-auto">Loading nuggets from your followed players...</p>
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
    if (followedNuggetsError) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center">
                    <p className="text-xl text-red-600 mb-4">Failed to load nuggets</p>
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
                                                const year = selectedCalendarDate.getFullYear()
                                                const month = String(selectedCalendarDate.getMonth() + 1).padStart(2, '0')
                                                const day = String(selectedCalendarDate.getDate()).padStart(2, '0')
                                                const dateString = `${year}-${month}-${day}`
                                                setSelectedDate(dateString)
                                                setCurrentPage(1)
                                                setAllNuggets([])
                                            } else {
                                                setSelectedDate('')
                                                setCurrentPage(1)
                                                setAllNuggets([])
                                            }
                                        }}
                                    />
                                </PopoverContent>
                            </Popover>
                            {selectedDate && (
                                <button
                                    onClick={clearDateFilter}
                                    className="px-3 py-2 text-gray-500 hover:text-gray-700"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>

                        {/* Position Filter */}
                        <Select value={filters.position || 'All'} onValueChange={handlePositionFilterChange}>
                            <SelectTrigger className="filter-button w-full lg:w-42 h-12">
                                <SelectValue placeholder="Position" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="All">All Positions</SelectItem>
                                <SelectItem value="QB">QB</SelectItem>
                                <SelectItem value="RB">RB</SelectItem>
                                <SelectItem value="WR">WR</SelectItem>
                                <SelectItem value="TE">TE</SelectItem>
                                <SelectItem value="K">K</SelectItem>
                                <SelectItem value="DEF">DEF</SelectItem>
                            </SelectContent>
                        </Select>

                        {/* Team Filter */}
                        <Select value={filters.team || 'All'} onValueChange={handleTeamFilterChange}>
                            <SelectTrigger className="filter-button w-full lg:w-42 h-12">
                                <SelectValue placeholder="Team" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="All">All Teams</SelectItem>
                                {teamsData?.teams?.map((team) => (
                                    <SelectItem key={team.id} value={team.name}>
                                        {team.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {/* Rookie Filter */}
                        <Select value={filters.rookie ? 'true' : 'false'} onValueChange={(value) => handleRookieFilterChange(value === 'true')}>
                            <SelectTrigger className="filter-button w-full lg:w-42 h-12">
                                <SelectValue placeholder="Rookie Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="false">All Players</SelectItem>
                                <SelectItem value="true">Rookies Only</SelectItem>
                            </SelectContent>
                        </Select>

                        {/* Clear Filters Button */}
                        {hasActiveFilters && (
                            <button
                                onClick={clearFilters}
                                className="px-4 py-2 text-red-600 hover:text-red-800 font-medium"
                            >
                                Clear All
                            </button>
                        )}
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex gap-6">
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
                            <>
                                <Masonry
                                    breakpointCols={{
                                        default: 2,
                                        1100: 1,
                                        700: 1
                                    }}
                                    className="flex w-auto -ml-6"
                                    columnClassName="pl-6 bg-clip-padding"
                                >
                                    {displayNuggets.map((nugget, index) => {
                                        const playerTeam = findTeamByKey(nugget.player.team || '')
                                        return (
                                            <div key={`${nugget.id}-${index}`} className="rounded-xl border shadow-lg overflow-hidden mb-6">
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
                                                                    className={`w-5 h-5 ${
                                                                        nugget.isSaved 
                                                                            ? 'fill-red-800 text-red-800' 
                                                                            : 'text-gray-500 hover:text-red-800'
                                                                    }`} 
                                                                />
                                                            )}
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="px-6 py-4 border-t border-white/20 mt-3">
                                                    <ReadMore id={nugget.id.toString()} text={nugget.content} amountOfCharacters={400} />
                                                </div>
                                                <div className='px-6 py-2'>
                                                    {nugget.fantasyInsight && (
                                                        <>
                                                            <h1 className='font-semibold mt-4 text-red-800'>Fantasy Insight:</h1>
                                                            <div className='mt-2 text-sm text-gray-600'>
                                                                {fantasyInsight(nugget.fantasyInsight)}
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                                <div className='px-6 py-2'>
                                                    {nugget.images && nugget.images.length > 0 && (
                                                        <div className="grid grid-cols-2 gap-2 mt-4">
                                                            {nugget.images.slice(0, 4).map((image, imgIndex) => (
                                                                <div
                                                                    key={imgIndex}
                                                                    className="relative cursor-pointer group"
                                                                    onClick={() => openImageModal(image, `${nugget.player.name} - Image ${imgIndex + 1}`, nugget.images, imgIndex)}
                                                                >
                                                                    <Image
                                                                        src={getImageUrl(image) || ''}
                                                                        alt={`${nugget.player.name} - Image ${imgIndex + 1}`}
                                                                        width={200}
                                                                        height={150}
                                                                        className="w-full h-32 object-cover rounded-lg transition-transform group-hover:scale-105"
                                                                    />
                                                                    {imgIndex === 3 && nugget.images && nugget.images.length > 4 && (
                                                                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                                                                            <span className="text-white font-bold">+{nugget.images.length - 4}</span>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className='px-6 py-4 border-t border-white/20'>
                                                    <div className='flex justify-between items-center text-sm text-gray-500'>
                                                        <span>{nugget.sourceName}</span>
                                                        <span>{new Date(nugget.createdAt).toLocaleDateString()}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </Masonry>
                            </>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="w-80 hidden lg:block">
                        <TrendingPlayers />
                    </div>
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