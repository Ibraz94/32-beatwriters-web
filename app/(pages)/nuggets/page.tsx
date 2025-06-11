'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Search, Calendar, ExternalLink, ThumbsUp, ThumbsDown } from 'lucide-react'
import Masonry from 'react-masonry-css'
import { ReadMore } from '@/app/components/ReadMore'
import {
    useGetNuggetsQuery,
    useSearchNuggetsQuery,
    useMarkHelpfulMutation,
    getImageUrl
} from '@/lib/services/nuggetsApi'

interface NuggetFilters {
    playerId?: number
    sourceName?: string
    page?: number
    limit?: number
    sortBy?: 'order' | 'createdAt'
    sortOrder?: 'asc' | 'desc'
}


export default function NuggetsPage() {
    const [filters, setFilters] = useState<NuggetFilters>({
        page: 1,
        limit: 12,
        sortBy: 'createdAt',
        sortOrder: 'desc'
    })
    const [searchTerm, setSearchTerm] = useState('')
    const [isSearching, setIsSearching] = useState(false)
    const [allNuggets, setAllNuggets] = useState<any[]>([])
    const [hasMoreNuggets, setHasMoreNuggets] = useState(true)


    // Main query for nuggets
    const {
        data: nuggetsData,
        isLoading: isLoadingNuggets,
        error: nuggetsError,
        isFetching: isFetchingNuggets
    } = useGetNuggetsQuery(filters, {
        skip: isSearching
    })

    // Search query
    const {
        data: searchData,
        isLoading: isLoadingSearch,
        error: searchError
    } = useSearchNuggetsQuery(searchTerm, {
        skip: !isSearching || !searchTerm
    })

    // Mutation for marking helpful
    const [markHelpful] = useMarkHelpfulMutation()

    // Handle loading more nuggets
    useEffect(() => {
        if (nuggetsData?.data?.nuggets && !isSearching) {
            if (filters.page === 1) {
                setAllNuggets(nuggetsData.data.nuggets)
            } else {
                setAllNuggets(prev => [...prev, ...nuggetsData.data.nuggets])
            }
            setHasMoreNuggets(nuggetsData.data.nuggets.length === filters.limit)
        }
    }, [nuggetsData, filters.page, isSearching])

    // Handle search results
    useEffect(() => {
        if (searchData?.nuggets && isSearching) {
            setAllNuggets(searchData.nuggets)
            setHasMoreNuggets(false) // Search doesn't support pagination
        }
    }, [searchData, isSearching])

    // Search functionality
    const handleSearch = (term: string) => {
        setSearchTerm(term)
        setIsSearching(!!term)
        if (term) {
            setAllNuggets([])
        } else {
            // Reset to filtered view
            setFilters(prev => ({ ...prev, page: 1 }))
        }
    }

    // Load more nuggets
    const loadMore = () => {
        if (!isSearching && hasMoreNuggets && !isFetchingNuggets) {
            setFilters(prev => ({ ...prev, page: prev.page! + 1 }))
        }
    }

    // Handle sort change
    const handleSortChange = (sortBy: 'order' | 'createdAt', sortOrder: 'asc' | 'desc') => {
        setFilters(prev => ({ ...prev, sortBy, sortOrder, page: 1 }))
        setAllNuggets([])
    }


    const isLoading = isLoadingNuggets || isLoadingSearch
    const error = nuggetsError || searchError
    const displayNuggets = isSearching ? searchData?.nuggets || [] : allNuggets

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
        <div className="container mx-auto max-w-7xl px-4 py-8">
            {/* Header */}
            <div className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-bold mb-4">Feed</h1>
                <p className="text-xl max-w-4xl mx-auto">
                    Latest nuggets, insights, and updates from across the NFL
                </p>
            </div>

            {/* Search and Filters */}
            <div className="mb-8 space-y-4">
                {/* Search Bar */}
                <div className="relative flex gap-4 max-w-2xl mx-auto">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search nuggets..."
                        value={searchTerm}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                    <select
                        value={`${filters.sortBy}-${filters.sortOrder}`}
                        onChange={(e) => {
                            const [sortBy, sortOrder] = e.target.value.split('-') as ['order' | 'createdAt', 'asc' | 'desc']
                            handleSortChange(sortBy, sortOrder)
                        }}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    >
                        <option value="createdAt-desc">Newest First</option>
                        <option value="createdAt-asc">Oldest First</option>
                        <option value="order-asc">Order (Ascending)</option>
                        <option value="order-desc">Order (Descending)</option>
                    </select>
                </div>

                {/* Sort Options */}
                <div className="flex flex-wrap justify-center gap-4">

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
                            default: 3,
                            1100: 2,
                            700: 1
                        }}
                        className="flex w-auto -ml-6"
                        columnClassName="pl-6 bg-clip-padding"
                    >
                        {displayNuggets.map((nugget, index) => (
                            <div key={`${nugget.id}-${index}`} className="rounded-xl border shadow-lg overflow-hidden hover:shadow-xl transition-shadow mb-6">
                                <div className='flex mt-8 gap-2 ml-4'>
                                    <Image
                                        src={getImageUrl(nugget.player.headshotPic) || ''}
                                        alt={nugget.title}
                                        width={70}
                                        height={80}
                                        className='rounded-xl object-cover bg-white'
                                    />
                                    <div className='flex items-center justify-between w-full p-2'>
                                        <h1 className='text-xl font-bold'>{nugget.player.name}</h1>
                                        <h1 className='text-lg mr-4'>{new Date(nugget.createdAt).toLocaleDateString()}</h1>
                                    </div>
                                </div>

                                <h3 className="text-xl font-bold p-6">
                                    {nugget.title}
                                </h3>
                                <p className="p-6 -mt-10">
                                    <ReadMore id={nugget.id} text={nugget.content} amountOfCharacters={400} />
                                </p>

                                {/* Nugget Images */}
                                <div className='p-6 -mt-8'>
                                    {nugget.images && nugget.images.length > 0 && (
                                        <div className={`grid gap-2 ${
                                            nugget.images.length === 1 ? 'grid-cols-1' :
                                            nugget.images.length === 2 ? 'grid-cols-2' :
                                            nugget.images.length === 3 ? 'grid-cols-3' :
                                            'grid-cols-2'
                                        }`}>
                                            {nugget.images.map((image: string, imageIndex: number) => (
                                                <div key={imageIndex} className={`relative w-full ${
                                                    nugget.images.length === 1 ? 'h-64' :
                                                    nugget.images.length === 2 ? 'h-48' :
                                                    nugget.images.length === 3 ? 'h-32' :
                                                    'h-40'
                                                }`}>
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
                                </div>

                                {/* Nugget Content */}
                                <div className="p-6">


                                    {/* Metadata */}
                                    {/* <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {formatDate(nugget.createdAt)}
                    </div>
                    {nugget.playerId && (
                      <div className="text-red-600 font-semibold">
                        Player {nugget.playerId}
                      </div>
                    )}
                  </div> */}

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

                    {/* Load More Button */}
                    {!isSearching && hasMoreNuggets && (
                        <div className="text-center mt-12">
                            <button
                                onClick={loadMore}
                                disabled={isFetchingNuggets}
                                className="px-8 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
                            >
                                {isFetchingNuggets ? 'Loading...' : 'Load More'}
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    )
}

