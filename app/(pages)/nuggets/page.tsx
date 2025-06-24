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
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">Feed</h1>
                    <p className="text-xl max-w-4xl mx-auto">Loading feed...</p>
                </div>
                <Masonry
                    breakpointCols={{
                        default: 3,
                        1100: 2,
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
        )
    }

    // Error state
    if (error) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">Feed</h1>
                    <p className="text-xl text-red-600 mb-4">Failed to load feed</p>
                    <p className="text-gray-600">Please try again later.</p>
                </div>
            </div>
        )
    }

    return (
        <>
            <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">Feed</h1>
                    <p className="text-xl max-w-4xl mx-auto px-4">
                        Latest nuggets, insights, and updates from across the NFL
                    </p>
                </div>

                {/* Search and Filters */}
                <div className="mb-8 space-y-4 px-4 sm:px-0">
                <div className="relative flex-1 max-w-3xl mx-auto items-center justify-center">
                            <Search className="absolute left-3 top-3 transform translate-y-1/4 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search nuggets..."
                                value={searchTerm}
                                onChange={(e) => handleSearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border-2 border-gray-400 rounded-lg shadow-md"
                            />
                        </div>
                    {/* Search Bar and Filters */}
                    <div className="relative flex flex-col sm:flex-row gap-3 max-w-6xl mx-auto items-center justify-center">
                       {/* Date Filter */}
                        <div className="relative w-full sm:w-48">
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => handleDateChange(e.target.value)}
                                className="w-full pl-4 px-4 py-3 h-12 border-2 text-gray-400 border-gray-400 rounded-lg shadow-md appearance-none"
                                placeholder="Sort by Date"
                            />
                        </div>

                        {/* Position Filter Dropdown */}
                        <Select 
                            key={`position-${filters.position}`}
                            value={filters.position || "all"}
                            onValueChange={handlePositionFilterChange}
                        >
                            <SelectTrigger className="w-full sm:w-48 h-12 pl-4 pr-4 py-6 shadow-md rounded-lg">
                                <SelectValue placeholder="Filter by Position" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectLabel>Select Positions</SelectLabel>
                                    <SelectItem value="all">
                                        All Positions
                                    </SelectItem>
                                    {['QB', 'WR', 'RB', 'FB', 'TE'].map(position => (
                                        <SelectItem
                                            key={position}
                                            value={position}
                                        >
                                            {position}
                                        </SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>

                        {/* Team Filter Dropdown */}
                        <Select 
                            key={`team-${filters.team}`}
                            value={filters.team || "all"}
                            onValueChange={handleTeamFilterChange}
                        >
                            <SelectTrigger className="w-full sm:w-48 h-12 pl-4 pr-4 py-6 shadow-md rounded-lg">
                                <SelectValue placeholder="Filter by Team" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectLabel>Select Team</SelectLabel>
                                    <SelectItem value="all">
                                        All Teams
                                    </SelectItem>
                                    {teamsData?.teams.map(team => (
                                        <SelectItem
                                            key={team.name}
                                            value={team.name}
                                        >
                                            {team.name}
                                        </SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>

                        {/* Rookie Filter */}
                        <div className="flex items-center space-x-2 px-4 py-3 border-2 border-gray-400 rounded-lg shadow-md">
                            <input
                                type="checkbox"
                                id="rookie-filter"
                                checked={filters.rookie || false}
                                onChange={(e) => handleRookieFilterChange(e.target.checked)}
                                className="w-4 h-4 text-red-800 bg-gray-100 border-gray-300 rounded focus:ring-red-500 focus:ring-2"
                            />
                            <label htmlFor="rookie-filter" className="text-sm font-medium text-gray-700 cursor-pointer">
                                Rookie
                            </label>
                        </div>

                        {/* Clear Filters Button */}
                        <div className={`w-full sm:w-auto ${(selectedDate || (filters.positions && filters.positions.length > 0) || filters.rookie || filters.position || filters.team) ? 'block' : 'hidden sm:block'}`}>
                            <button
                                onClick={clearFilters}
                                disabled={!selectedDate && (!filters.positions || filters.positions.length === 0) && !filters.rookie && !filters.position && !filters.team}
                                className={`w-full px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                                    !selectedDate && (!filters.positions || filters.positions.length === 0) && !filters.rookie && !filters.position && !filters.team
                                        ? 'text-gray-400 cursor-not-allowed'
                                        : 'text-red-800 hover:underline hover:cursor-pointer'
                                }`}
                            >
                                Clear Filters
                            </button>
                        </div>
                    </div>
                </div>

                {/* Results Count */}
                {(isSearching && searchTerm) && (
                    <div className="mb-6 text-center">
                        <p className="text-gray-600">
                            {displayNuggets.length} result{displayNuggets.length !== 1 ? 's' : ''} for "{searchTerm}"
                        </p>
                    </div>
                )}

                {/* Nuggets Grid */}
                {displayNuggets.length === 0 && !isLoading ? (
                    <div className="text-center py-12">
                        <p className="text-xl text-gray-600 mb-4">
                            {isSearching ? 'No nuggets found for your search.' : 'No nuggets available.'}
                        </p>
                        {isSearching && (
                            <button
                                onClick={() => handleSearch('')}
                                className="text-red-600 hover:text-red-800 font-semibold"
                            >
                                Clear search
                            </button>
                        )}
                    </div>
                ) : (
                    <>
                        <Masonry
                            breakpointCols={{
                                default: 1,
                                1100: 2,
                                700: 1
                            }}
                            className="flex max-w-3xl mx-auto"
                            columnClassName="pl-0 sm:pl-6 bg-clip-padding"
                        >
                            {displayNuggets.map((nugget, index) => {
                                const playerTeam = findTeamByKey(nugget.player.team)
                                const router = useRouter()
                                return (
                                    <div key={`${nugget.id}-${index}`} className="rounded-xl border-3 overflow-hidden shadow-md hover:shadow-xl transition-shadow mb-6 mx-4 sm:mx-0">
                                        <div className='flex mt-8 gap-2 ml-4 mr-4'>
                                            <div
                                                className="cursor-pointer hover:opacity-80 transition-opacity"
                                                onClick={() => router.push(`/players/${nugget.player.id}`, { scroll: false })}
                                            >
                                                <Image
                                                    src={getImageUrl(nugget.player.headshotPic) || ''}
                                                    alt={`${nugget.player.name} headshot`}
                                                    width={80}
                                                    height={80}
                                                    className='rounded-full object-cover bg-background'
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Link href={`/players/${nugget.player.id}`}>
                                                        <h1 className='text-xl font-bold'>{nugget.player.name}</h1>
                                                    </Link>
                                                    {playerTeam && (
                                                        <div className="flex items-center">
                                                            <Image
                                                                src={getTeamLogoUrl(playerTeam.logo) || ''}
                                                                alt={`${playerTeam.name} logo`}
                                                                width={32}
                                                                height={24}
                                                                className='object-contain'
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                                {nugget.player.team && (
                                                    <p className="text-sm text-gray-600">
                                                        {nugget.player.position} • {nugget.player.team}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="px-6 py-4">
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

                                        <div className='px-6 py-2'>
                                            <div className='flex flex-col mt-1 -mb-8 text-sm'>
                                                
                                                
                                                {nugget.sourceUrl && (
                                                    <>
                                                    <h1 className=''>Source: <span className='text-left'>{nugget.sourceName}</span></h1>
                                                    <Link 
                                                        href={nugget.sourceUrl.startsWith('http://') || nugget.sourceUrl.startsWith('https://') 
                                                            ? nugget.sourceUrl 
                                                            : `https://${nugget.sourceUrl}`} 
                                                        target='_blank'
                                                        rel='noopener noreferrer' 
                                                        className='text-left text-gray-400 hover:text-blue-800'
                                                    >
                                                        {nugget.sourceUrl}
                                                    </Link>
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

                                        {/* Nugget Images */}
                                        {/* <div className='p-6 -mt-8'>
                                            {nugget.images && nugget.images.length > 0 && (
                                                <div className={`grid gap-2 ${
                                                    nugget.images.length === 1 ? 'grid-cols-1' :
                                                    nugget.images.length === 2 ? 'grid-cols-2' :
                                                    nugget.images.length === 3 ? 'grid-cols-3' :
                                                    'grid-cols-2'
                                                }`}>
                                                    {nugget.images.map((image: string, imageIndex: number) => (
                                                        <div 
                                                            key={imageIndex} 
                                                            className={`relative w-full cursor-pointer hover:opacity-80 transition-opacity ${
                                                                nugget.images.length === 1 ? 'h-64' :
                                                                nugget.images.length === 2 ? 'h-48' :
                                                                nugget.images.length === 3 ? 'h-32' :
                                                                'h-40'
                                                            }`}
                                                            onClick={() => openImageModal(
                                                                getImageUrl(image) || '',
                                                                `${nugget.player.name} image ${imageIndex + 1}`,
                                                                nugget.images,
                                                                imageIndex
                                                            )}
                                                        >
                                                            <Image
                                                                src={getImageUrl(image) || ''}
                                                                alt={`${nugget.player.name} image ${imageIndex + 1}`}
                                                                priority={imageIndex === 0}
                                                                fill
                                                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                                                className="object-cover rounded-lg"
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                             )}
                                        </div> */}
                                    </div>
                                )
                            })}
                        </Masonry>
                    </>
                )}
            </div>

            {/* Image Modal */}
            {imageModal && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4"
                    onClick={closeImageModal}
                >
                    <div className="relative max-w-screen-lg max-h-screen-lg w-full h-full flex items-center justify-center">
                        {/* Close Button */}
                        <button
                            onClick={closeImageModal}
                            className="absolute top-4 right-4 z-10 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        {/* Navigation Buttons */}
                        {imageModal.images && imageModal.images.length > 1 && imageModal.currentIndex !== undefined && (
                            <>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        navigateImage('prev')
                                    }}
                                    className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-70 transition-all"
                                >
                                    <ChevronLeft className="w-6 h-6" />
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        navigateImage('next')
                                    }}
                                    className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-70 transition-all"
                                >
                                    <ChevronRight className="w-6 h-6" />
                                </button>
                            </>
                        )}

                        {/* Image Counter */}
                        {imageModal.images && imageModal.images.length > 1 && imageModal.currentIndex !== undefined && (
                            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
                                {imageModal.currentIndex + 1} / {imageModal.images.length}
                            </div>
                        )}

                        {/* Image */}
                        <div
                            className="relative max-w-full max-h-full"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <Image
                                src={imageModal.src}
                                alt={imageModal.alt}
                                width={1200}
                                height={800}
                                className="max-w-full max-h-full object-contain rounded-lg"
                                priority
                            />
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}


