import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

// Base API URL - defaults to localhost for development
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api'

/**
 * Feed interface representing a single feed item
 * Contains all the properties that define a feed in the system
 */
export interface Feed {
  id: string
  title: string
  content: string
  category: string
  tags: string[]
  isPremium: boolean
  isPublished: boolean
  order: number
  createdAt: string
  updatedAt: string
}

/**
 * Response interface for paginated feeds data
 * Used when fetching multiple feeds with pagination information
 */
interface FeedsResponse {
  feeds: Feed[]
  total: number
  page: number
  limit: number
  totalPages: number
}

/**
 * Interface for filtering and querying feeds
 * Allows for flexible feed searching and filtering
 */
interface FeedFilters {
  category?: string
  tags?: string[]
  search?: string
  isPublished?: boolean
  page?: number
  limit?: number
  sortBy?: 'order' | 'views' | 'helpful' | 'createdAt'
  sortOrder?: 'asc' | 'desc'
}

/**
 * RTK Query API for managing feeds
 * Provides CRUD operations and various query endpoints for feed data
 */
export const feedsApi = createApi({
  reducerPath: 'feedsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_BASE_URL}/feeds`,
    prepareHeaders: (headers, { getState }) => {
      // Add authorization token if available
      const token = (getState() as any).auth.token
      if (token) {
        headers.set('authorization', `Bearer ${token}`)
      }
      headers.set('content-type', 'application/json')
      return headers
    },
  }),
  tagTypes: ['Feed'], // Cache invalidation tags
  endpoints: (builder) => ({
    /**
     * Get feeds with optional filtering and pagination
     * Supports category, tags, search, published status, and sorting
     */
    getFeeds: builder.query<FeedsResponse, FeedFilters>({
      query: (filters) => {
        const params = new URLSearchParams()
        // Convert filter object to URL search parameters
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined) {
            if (Array.isArray(value)) {
              // Handle array values (like tags)
              value.forEach(v => params.append(key, v))
            } else {
              params.append(key, value.toString())
            }
          }
        })
        return `?${params.toString()}`
      },
      providesTags: ['Feed'],
    }),
    
    /**
     * Get a single feed by ID
     * Returns detailed feed information
     */
    getFeed: builder.query<{ feed: Feed }, string>({
      query: (id) => `/${id}`,
      providesTags: (result, error, id) => [{ type: 'Feed', id }],
    }),
    
    /**
     * Get all feeds in a specific category
     * Returns feeds filtered by category name
     */       
    getFeedsByCategory: builder.query<{ feeds: Feed[] }, string>({
      query: (category) => `/category/${encodeURIComponent(category)}`,
      providesTags: ['Feed'],
    }),
    
    /**
     * Search feeds by text query
     * Performs full-text search across feed titles and content
     */
    searchFeeds: builder.query<{ feeds: Feed[] }, string>({
      query: (searchTerm) => `/search?q=${encodeURIComponent(searchTerm)}`,
      providesTags: ['Feed'],
    }),
    
    /**
     * Get all available feed categories
     * Returns a list of unique categories for filtering
     */
    getFAQCategories: builder.query<{ categories: string[] }, void>({
      query: () => '/categories',
      providesTags: ['Feed'],
    }),
    
    /**
     * Mark a feed as helpful or not helpful
     * Updates the feed's helpfulness rating and returns new counts
     */
    markHelpful: builder.mutation<{ helpful: number; notHelpful: number }, { id: string; isHelpful: boolean }>({
      query: ({ id, isHelpful }) => ({
        url: `/${id}/helpful`,
        method: 'POST',
        body: { isHelpful },
      }),
      // Invalidate the specific feed cache to refetch updated data
      invalidatesTags: (result, error, { id }) => [{ type: 'Feed', id }],
    }),
  }),
})

// Export generated hooks for use in React components
// These hooks provide automatic data fetching, caching, and re-fetching capabilities
export const {
  useGetFeedsQuery,        // Hook for fetching feeds with filters
  useGetFeedQuery,         // Hook for fetching a single feed
  useGetFeedsByCategoryQuery, // Hook for fetching feeds by category
  useSearchFeedsQuery,     // Hook for searching feeds
  useMarkHelpfulMutation,  // Hook for marking feeds as helpful
} = feedsApi 