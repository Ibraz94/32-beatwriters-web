import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { API_CONFIG, buildApiUrl } from '../config/api'

// Base API URL - defaults to localhost for development
const IMAGE_BASE_URL = process.env.NEXT_PUBLIC_IMAGE_BASE_URL || 'http://localhost:4004'

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
  isSaved?: boolean
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

export interface NuggetFilters {
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
  team?: string
  search?: string
  startDate?: string
  saved?: boolean
  followedPlayers?: boolean
}

// Helper function to construct full image URLs
export const getImageUrl = (imagePath?: string): string | undefined => {
  if (!imagePath) return undefined
  
  // If the path already includes the full URL, return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath
  }
  
  // Handle paths that start with a slash - append directly to base URL
  if (imagePath.startsWith('/')) {
    return `${IMAGE_BASE_URL}${imagePath}`
  }
  
  // Handle relative paths - add a slash between base URL and path
  return `${IMAGE_BASE_URL}/${imagePath}`
}


export const nuggetsApi = createApi({
  reducerPath: 'nuggetsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: buildApiUrl(API_CONFIG.ENDPOINTS.NUGGETS),
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
  tagTypes: ['Nugget', 'SavedNugget'], // Cache invalidation tags
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
        
        // Debug logging for startDate
        if (filters.startDate) {
          console.log('🔍 Nuggets API - startDate received:', filters.startDate)
          console.log('🔍 Nuggets API - Full filters:', filters)
          console.log('🔍 Nuggets API - Final URL params:', params.toString())
        }
        
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

    /**
     * Save a nugget to user's saved list
     * Requires authentication
     */
    saveNugget: builder.mutation<{ success: boolean; message: string }, number>({
      query: (nuggetId) => ({
        url: `/${nuggetId}/save`,
        method: 'POST',
      }),
      invalidatesTags: ['Nugget', 'SavedNugget'],
    }),

    /**
     * Remove a nugget from user's saved list
     * Requires authentication
     */
    unsaveNugget: builder.mutation<{ success: boolean; message: string }, number>({
      query: (nuggetId) => ({
        url: `/${nuggetId}/save`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Nugget', 'SavedNugget'],
    }),

    /**
     * Get user's saved nuggets
     * Returns a list of nuggets saved by the authenticated user
     */
    getSavedNuggets: builder.query<{ success: boolean; data: { nuggets: Nugget[]; pagination: any } }, void>({
      query: () => '/saved/list',
      providesTags: ['SavedNugget'],
    }),

    /**
     * Get nuggets from user's followed players
     * Returns a list of nuggets from players the user follows
     */
    getFollowedNuggets: builder.query<{ success: boolean; data: { nuggets: Nugget[]; pagination: any } }, void>({
      query: () => '/followed/list',
      providesTags: ['Nugget'],
    }),

    /**
     * Get latest nuggets
     * Returns the 3 most recent nuggets
     */
    getLatestNuggets: builder.query<{ success: boolean; data: Nugget[] }, void>({
      query: () => '/latest',
      providesTags: ['Nugget'],
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
  useSaveNuggetMutation,     // Hook for saving nuggets
  useUnsaveNuggetMutation,   // Hook for unsaving nuggets
  useGetSavedNuggetsQuery,   // Hook for getting saved nuggets
  useGetFollowedNuggetsQuery, // Hook for getting followed nuggets
  useGetLatestNuggetsQuery,   // Hook for getting latest nuggets
} = nuggetsApi 