'use client'

import { useGetEpisodesQuery, getImageUrl, PodcastData, ApiResponse } from '@/lib/services/podcastApi'
import Image from 'next/image'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { renderRichTextContent } from '@/lib/utils/contentParser'

const PodcastCard = ({ podcast }: { podcast: PodcastData }) => {
  return (
    <div className="rounded-md space-y-2 shadow-md player-card  overflow-hidden hover:shadow-lg transition-shadow group hover:scale-101 p-5 font-oswald">
      {/* Podcast Thumbnail */}
      <Link href={`/podcasts/${podcast.id}`}>
      <div className="relative h-72 w-full ">
        <Image 
          src={getImageUrl(podcast.thumbnail) || "/bw-logo.webp"} 
          alt={podcast.title}
          fill
          className="object-cover w-full h-full rounded-md"
        />
        {/* Duration Badge */}
        <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-sm px-2 py-1 rounded">
          {podcast.duration}
        </div>
      </div>
      {/* Podcast Info */}
      <div className="mt-4">
        
          <h3 className="font-bold text-2xl mb-2 line-clamp-2">
            {podcast.title}
          </h3>

        {/* <div className="text-lg mb-3 line-clamp-2 ">
        {renderRichTextContent(podcast.description, true)}
        </div> */}
         
        <div className="flex justify-between items-center">
        <p className="text-lg  mb-2">
          Hosted by: {podcast.hostedBy}
        </p>
          <p className="text-lg">
            {new Date(podcast.podcastTime).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            })}
          </p>
        </div>
      </div>
      </Link>
    </div>
  )
}

export default function AllPodcastsPage() {
  const [filters, setFilters] = useState({
    page: 1,
    limit: 12,
    sortBy: 'publishedAt' as 'publishedAt' | 'downloads' | 'likes' | 'title',
    sortOrder: 'desc' as 'asc' | 'desc',
    search: '',
    category: '',
    isPremium: undefined as boolean | undefined,
    isExplicit: undefined as boolean | undefined,
  })

  const [searchTerm, setSearchTerm] = useState('')

  const { 
    data: apiResponse, 
    isLoading, 
    error 
  } = useGetEpisodesQuery(filters) as { data: ApiResponse | undefined, isLoading: boolean, error: any }

  // Handle search with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {  
      setFilters(prev => ({
        ...prev,
        search: searchTerm,
        page: 1 // Reset to first page when searching
      }))
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [searchTerm])

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page when filtering
    }))
  }

  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({
      ...prev,
      page: newPage
    }))
  }

  const categories = ['NFL Analysis', 'Fantasy Football', 'Draft Coverage', 'Trade Analysis', 'Player Interviews']

  return (
    <div className="container mx-auto mt-6 mb-28 p-3">
      {/* Header */}
      <div className="mb-8">

      </div>

      {/* Results */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
          {Array.from({ length: 12 }).map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="bg-gray-300 rounded-lg h-48 mb-4"></div>
              <div className="h-4 bg-gray-300 rounded mb-2"></div>
              <div className="h-3 bg-gray-300 rounded mb-2"></div>
              <div className="h-3 bg-gray-300 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">Failed to load episodes. Please try again later.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-red-800 text-white px-6 py-2 rounded-lg hover:bg-red-900 transition-colors"
          >
            Retry
          </button>
        </div>
      ) : apiResponse?.podcasts && apiResponse.podcasts.length > 0 ? (
        <>
          {/* Results Count */}
          <div className="mb-6">
            Showing {apiResponse.podcasts.length} of {apiResponse.pagination.total} podcasts
            {filters.search && ` for "${filters.search}"`}
          </div>

          {/* Episodes Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6 mb-8">
            {apiResponse.podcasts.map((podcast) => (
              <PodcastCard key={podcast.id} podcast={podcast} />
            ))}
          </div>

          {/* Pagination */}
          {apiResponse.pagination.totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2">
              <button
                onClick={() => handlePageChange(filters.page - 1)}
                disabled={filters.page <= 1}
                className="px-4 py-2 rounded-lg border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
              >
                Previous
              </button>
              
              {Array.from({ length: Math.min(5, apiResponse.pagination.totalPages) }, (_, i) => {
                const pageNum = Math.max(1, Math.min(apiResponse.pagination.totalPages - 4, filters.page - 2)) + i
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`px-4 py-2 rounded-lg border transition-colors ${
                      pageNum === filters.page
                        ? 'bg-red-800 text-white border-red-800'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                )
              })}
              
              <button
                onClick={() => handlePageChange(filters.page + 1)}
                disabled={filters.page >= apiResponse.pagination.totalPages}
                className="px-4 py-2 rounded-lg border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">
            {filters.search || filters.category 
              ? 'No episodes found matching your criteria.' 
              : 'No episodes available at the moment.'
            }
          </p>
          {(filters.search || filters.category) && (
            <button
              onClick={() => {
                setFilters(prev => ({
                  ...prev,
                  search: '',
                  category: '',
                  page: 1
                }))
                setSearchTerm('')
              }}
              className="bg-red-800 text-white px-6 py-2 rounded-lg hover:bg-red-900 transition-colors"
            >
              Clear Filters
            </button>
          )}
        </div>
      )}
    </div>
  )
} 





{/* Filters */}
{/* <div className="rounded-lg shadow-sm border p-6 mb-8">
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4"> */}
  {/* Search */}
  {/* <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
    <input
      type="text"
      placeholder="Search episodes..."
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
    />
  </div> */}

  {/* Category */}
  {/* <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
    <select
      value={filters.category}
      onChange={(e) => handleFilterChange('category', e.target.value)}
      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
    >
      <option value="">All Categories</option>
      {categories.map(category => (
        <option key={category} value={category}>{category}</option>
      ))}
    </select>
  </div> */}

  {/* Sort By */}
  {/* <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
    <select
      value={filters.sortBy}
      onChange={(e) => handleFilterChange('sortBy', e.target.value)}
      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
    >
      <option value="publishedAt">Published Date</option>
      <option value="downloads">Downloads</option>
      <option value="likes">Likes</option>
      <option value="title">Title</option>
    </select>
  </div> */}

  {/* Sort Order */}
  {/* <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">Order</label>
    <select
      value={filters.sortOrder}
      onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
    >
      <option value="desc">Newest First</option>
      <option value="asc">Oldest First</option>
    </select>
  </div>
</div> */}

{/* Filter Toggles */}
{/* <div className="flex flex-wrap gap-4"> */}
  {/* <button
    onClick={() => handleFilterChange('isPremium', filters.isPremium === true ? undefined : true)}
    className={`px-4 py-2 rounded-lg border transition-colors ${
      filters.isPremium === true 
        ? 'bg-yellow-100 border-yellow-300 text-yellow-800' 
        : ' border-gray-300 hover:bg-gray-50'
    }`}
  >
    Premium Only
  </button> */}
  
  {/* <button
    onClick={() => handleFilterChange('isPremium', filters.isPremium === false ? undefined : false)}
    className={`px-4 py-2 rounded-lg border transition-colors ${
      filters.isPremium === false 
        ? ' border-green-300 text-green-800' 
        : ' border-gray-300 hover:bg-gray-50'
    }`}
  >
    Free Only
  </button> */}

  {/* <button
    onClick={() => handleFilterChange('isExplicit', filters.isExplicit === false ? undefined : false)}
    className={`px-4 py-2 rounded-lg border transition-colors ${
      filters.isExplicit === false 
        ? 'bg-blue-100 border-blue-300 text-blue-800' 
        : ' border-gray-300 hover:bg-gray-50'
    }`}
  >
    Clean Content
  </button> */}

  {/* Clear Filters */}
  {/* <button
    onClick={() => {
      setFilters(prev => ({
        ...prev,
        search: '',
        category: '',
        isPremium: undefined,
        isExplicit: undefined,
        page: 1
      }))
      setSearchTerm('')
    }}
    className="px-4 py-2 rounded-lg border border-red-300 text-red-600 hover:bg-red-50 transition-colors"
  >
    Clear All
  </button> */}
{/* </div>
</div> */}