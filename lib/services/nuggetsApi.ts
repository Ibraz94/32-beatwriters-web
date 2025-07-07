import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

// Base API URL - defaults to localhost for development
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.32beatwriters.com/api/'
const IMAGE_BASE_URL = process.env.NEXT_PUBLIC_IMAGE_BASE_URL || 'https://api.32beatwriters.staging.pegasync.com' || 'https://www.playerprofiler.com/wp-content/uploads'

/**
 * Nugget interface representing a single nugget item
 * Contains all the properties that define a nugget in the system
 */
export interface Nugget {
  id: number
  content: string
  fantasyInsight: string
  playerId: number
  sourceName: string
  sourceUrl: string | null
  images?: string[]
  createdAt: string
  updatedAt: string
  player: {
    id: number
    playerId: string
    name: string
    team: string | null
    position: string
    headshotPic: string
    rookie: boolean
  }
}


interface PaginatedNuggets {
  data: {
    nuggets: Nugget[]
    pagination: {
      total: number
      page: number
      limit: number
      totalPages: number
    }
  }
}

interface NuggetFilters {
  playerId?: number
  sourceName?: string
  sourceUrl?: string
  images?: string[]
  page?: number
  limit?: number
  sortBy?: 'order' | 'createdAt'
  sortOrder?: 'asc' | 'desc'
  rookie?: boolean
  position?: string
}

// Helper function to construct full image URLs
export const getImageUrl = (imagePath?: string): string | undefined => {
  if (!imagePath) return undefined
  
  // If the path already includes the full URL, return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath
  }
  
  // Handle paths that already start with /uploads
  if (imagePath.startsWith('/uploads/')) {
    return `${IMAGE_BASE_URL}${imagePath}`
  }
  
  // Handle paths that don't start with /uploads
  if (imagePath.startsWith('/')) {
    return `${IMAGE_BASE_URL}/uploads${imagePath}`
  }
  
  // Handle relative paths
  return `${IMAGE_BASE_URL}/uploads/${imagePath}`
}


export const nuggetsApi = createApi({
  reducerPath: 'nuggetsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_BASE_URL}nuggets`,
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
  tagTypes: ['Nugget'], // Cache invalidation tags
  endpoints: (builder) => ({
    /**
     * Get nuggets with optional filtering and pagination
     * Supports category, tags, search, published status, and sorting
     */
    getNuggets: builder.query<PaginatedNuggets, NuggetFilters>({
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
      providesTags: ['Nugget'],
    }),
    
    /**
     * Get nuggets by player ID
     * Returns nuggets for a specific player
     */
    getNuggetsByPlayerId: builder.query<PaginatedNuggets, string>({
      query: (playerId) => `?playerId=${playerId}`,
      providesTags: (result, error, playerId) => [{ type: 'Nugget', id: playerId }],
    }),
    
    /**
     * Get all nuggets in a specific category
     * Returns nuggets filtered by category name
     */       
    getNuggetsByCategory: builder.query<{ nuggets: Nugget[] }, string>({
      query: (category) => `/category/${encodeURIComponent(category)}`,
      providesTags: ['Nugget'],
    }),
    
    /**
     * Search nuggets by text query
     * Performs full-text search across nugget content
     */
    searchNuggets: builder.query<{ nuggets: Nugget[] }, string>({
      query: (searchTerm) => `/search?q=${encodeURIComponent(searchTerm)}`,
      providesTags: ['Nugget'],
    }),
    
    /**
     * Get all available feed categories
     * Returns a list of unique categories for filtering
     */
    getNuggetCategories: builder.query<{ categories: string[] }, void>({
      query: () => '/categories',
      providesTags: ['Nugget'],
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
      invalidatesTags: (result, error, { id }) => [{ type: 'Nugget', id }],
    }),
  }),
})

// Export generated hooks for use in React components
// These hooks provide automatic data fetching, caching, and re-fetching capabilities
export const {
  useGetNuggetsQuery,        // Hook for fetching nuggets with filters
  useGetNuggetsByPlayerIdQuery, // Hook for fetching nuggets by player ID
  useGetNuggetsByCategoryQuery, // Hook for fetching nuggets by category
  useSearchNuggetsQuery,     // Hook for searching nuggets
  useMarkHelpfulMutation,  // Hook for marking nuggets as helpful
} = nuggetsApi 