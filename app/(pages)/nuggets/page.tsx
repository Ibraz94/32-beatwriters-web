'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Search, X, ChevronLeft, ChevronRight } from 'lucide-react'
import Masonry from 'react-masonry-css'
import { ReadMore } from '@/app/components/ReadMore'
import {
    useGetNuggetsQuery,
    useSearchNuggetsQuery,
    useMarkHelpfulMutation,
    getImageUrl
} from '@/lib/services/nuggetsApi'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { SelectGroup, SelectLabel } from '@radix-ui/react-select'

interface NuggetFilters {
    sortBy?: 'createdAt' | 'playerName'
    sortOrder?: 'asc' | 'desc'
}

interface ImageModalData {
    src: string
    alt: string
    images?: string[]
    currentIndex?: number
}

export default function NuggetsPage() {
    const [filters, setFilters] = useState<NuggetFilters>({
        sortBy: 'createdAt',
        sortOrder: 'desc'
    })
    const [searchTerm, setSearchTerm] = useState('')
    const [isSearching, setIsSearching] = useState(false)
    const [allNuggets, setAllNuggets] = useState<any[]>([])
    const [hasMoreNuggets, setHasMoreNuggets] = useState(true)
    const [imageModal, setImageModal] = useState<ImageModalData | null>(null)

    // Main query for nuggets - simplified to just fetch all nuggets
    const {
        data: nuggetsData,
        isLoading: isLoadingNuggets,
        error: nuggetsError,
        isFetching: isFetchingNuggets
    } = useGetNuggetsQuery({}, {
        skip: false
    })

    // Search query - we'll handle this client-side
    const [searchResults, setSearchResults] = useState<any[]>([])

    // Handle loading nuggets
    useEffect(() => {
        if (nuggetsData?.data?.nuggets) {
            setAllNuggets(nuggetsData.data.nuggets)
            setHasMoreNuggets(false) // Since we're loading all at once
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
                nugget.sourceName?.toLowerCase().includes(searchTermLower)
            )
            setSearchResults(filtered)
        } else {
            setSearchResults([])
        }
    }

    // Client-side sorting
    const getSortedNuggets = (nuggets: any[]) => {
        return [...nuggets].sort((a, b) => {
            if (filters.sortBy === 'playerName') {
                const comparison = a.player.name.localeCompare(b.player.name)
                return filters.sortOrder === 'asc' ? comparison : -comparison
            } else {
                const dateA = new Date(a.createdAt).getTime()
                const dateB = new Date(b.createdAt).getTime()
                return filters.sortOrder === 'asc' ? dateA - dateB : dateB - dateA
            }
        })
    }

    // Handle sort change
    const handleSortChange = (value: string) => {
        const [sortBy, sortOrder] = value.split('-') as ['createdAt' | 'playerName', 'asc' | 'desc']
        setFilters({ sortBy, sortOrder })
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
            return <p dangerouslySetInnerHTML={{ __html: fantasyInsight }}></p>
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

    const isLoading = isLoadingNuggets
    const error = nuggetsError
    const displayNuggets = isSearching ? searchResults : getSortedNuggets(allNuggets)

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
                    {/* Search Bar */}
                    <div className="relative flex flex-col sm:flex-row gap-4 max-w-4xl mx-auto">
                        <Search className="absolute left-3 top-3 transform translate-y-1/4 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search nuggets..."
                            value={searchTerm}
                            onChange={(e) => handleSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border-3 border-gray-400 rounded-lg shadow-md"
                        />
                        <Select
                            onValueChange={handleSortChange}
                        >
                            <SelectTrigger className="w-full lg:w-1/3 h-12 pl-4 pr-4 py-6 shadow-md rounded-lg" value={`${filters.sortBy}-${filters.sortOrder}`}>
                                <SelectValue placeholder="Sort by Date" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="createdAt-desc">Newest First</SelectItem>
                                <SelectItem value="createdAt-asc">Oldest First</SelectItem>
                                <SelectItem value="playerName-asc">Player Name (A-Z)</SelectItem>
                                <SelectItem value="playerName-desc">Player Name (Z-A)</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select
                            onValueChange={handleSortChange}
                        >
                            <SelectTrigger className="w-full lg:w-1/3 h-12 pl-4 pr-4 py-6 shadow-md rounded-lg" value={`${filters.sortBy}-${filters.sortOrder}`}>
                                <SelectValue placeholder="Sort by Team" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="createdAt-desc">AFC North</SelectItem>
                                <SelectItem value="createdAt-asc">AFC East</SelectItem>
                                <SelectItem value="playerName-asc">AFC South</SelectItem>
                                <SelectItem value="playerName-desc">AFC West</SelectItem>
                                <SelectItem value="playerName-desc">NFC North</SelectItem>
                                <SelectItem value="playerName-desc">NFC East</SelectItem>
                                <SelectItem value="playerName-desc">NFC South</SelectItem>
                                <SelectItem value="playerName-desc">NFC West</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select
                            onValueChange={handleSortChange}
                        >
                            <SelectTrigger className="w-full lg:w-1/3 h-12 pl-4 pr-4 py-6 shadow-md rounded-lg" value={`${filters.sortBy}-${filters.sortOrder}`}
                            >
                                <SelectValue placeholder="Sort by Position" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectLabel>Position</SelectLabel>
                                    <SelectItem value="createdAt-desc">QB</SelectItem>
                                    <SelectItem value="createdAt-asc">RB</SelectItem>
                                    <SelectItem value="playerName-asc">WR</SelectItem>
                                    <SelectItem value="playerName-desc">TE</SelectItem>
                                    <SelectItem value="playerName-desc">K</SelectItem>
                                    <SelectItem value="playerName-desc">DEF</SelectItem>
                                    <SelectItem value="playerName-desc">DL</SelectItem>
                                    <SelectItem value="playerName-desc">LB</SelectItem>
                                    <SelectItem value="playerName-desc">DB</SelectItem>
                                    <SelectItem value="playerName-desc">S</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>

                    </div>
                </div>

                {/* Results Count */}
                {isSearching && searchTerm && (
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
                            {displayNuggets.map((nugget, index) => (
                                <div key={`${nugget.id}-${index}`} className="rounded-xl border-3 overflow-hidden shadow-md hover:shadow-xl transition-shadow mb-6 mx-4 sm:mx-0">
                                    <div className='flex mt-8 gap-2 ml-4 mr-4'>
                                        <div
                                            className="cursor-pointer hover:opacity-80 transition-opacity"
                                            onClick={() => openImageModal(
                                                getImageUrl(nugget.player.headshotPic) || '',
                                                `${nugget.player.name} headshot`
                                            )}
                                        >
                                            <Image
                                                src={getImageUrl(nugget.player.headshotPic) || ''}
                                                alt={nugget.title}
                                                width={80}
                                                height={80}
                                                className='rounded-full object-cover bg-background'
                                            />
                                        </div>
                                        <div className='flex items-center justify-between w-full p-2'>
                                            <h1 className='text-xl font-bold'>{nugget.player.name}</h1>

                                        </div>
                                    </div>
                                    <p className="px-6 py-4">
                                        <ReadMore id={nugget.id} text={nugget.content} amountOfCharacters={400} />
                                    </p>
                                    <p className='px-6 py-4'>
                                        {nugget.fantasyInsight && (
                                        <>
                                            <h1 className='text-lg font-semibold mt-4'>Fantasy Insight:</h1>
                                            {fantasyInsight(nugget.fantasyInsight)}
                                        </>
                                    )}
                                    </p>

                                    <div className='flex justify-between px-6 py-1 -mb-10'>
                                        <div className='flex flex-col mt-1 text-sm'>
                                            <h1 className=''>Source:</h1>
                                            <h1 className='text-left'>{nugget.sourceName}</h1>
                                            <h1 className='text-left text-gray-400'>{nugget.sourceUrl}</h1>
                                        </div>
                                        <h1 className='text-right text-gray-400 mt-6 text-sm'>{new Date(nugget.createdAt).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric'
                                        })}</h1>
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

                                    {/* Nugget Content */}
                                    <div className="p-6">
                                        {/* Actions */}
                                        {/* <div className="flex items-center justify-between">
                        {nugget.sourceUrl && (
                          <Link
                            href={nugget.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center text-red-600 hover:text-red-800 font-semibold text-sm transition-colors"
                          >
                            <ExternalLink className="w-4 h-4 mr-1" />
                            Read Source
                          </Link>
                        )}
                      </div> */}
                                    </div>
                                </div>
                            ))}
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

