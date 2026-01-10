import { createApi, fetchBaseQuery, retry } from '@reduxjs/toolkit/query/react'
import { buildApiUrl, API_CONFIG } from '../config/api'

// Rookie Player interface
export interface RookiePlayer {
  id: number
  playerId: string
  name: string
  team: string
  position: string
  headshotPic: string
  rank: number
  height: string
  weight: number
  college: string
  draftPick: string
  age: number
  fantasyOutlook: string
  adp: number
  playerPageUrl: string
  analysisSection?: string
  note?: string  // Note is now embedded in the player object from rankings array
}

// Tier heading interface
export interface TierHeading {
  id: string
  name: string
  position: number
}

// User ranking data interface
export interface UserRankingData {
  rankings: RookiePlayer[]  // Rankings array with embedded notes
  tiers: TierHeading[]
  hasCustomRankings?: boolean
}

// API response interfaces
export interface RookieBoardResponse {
  success: boolean
  data: {
    rankings: RookiePlayer[]  // Rankings array with embedded notes
    tiers: TierHeading[]
    hasCustomRankings?: boolean
  }
}

// Create base query with error handling
const baseQueryWithErrorHandling = fetchBaseQuery({
  baseUrl: buildApiUrl('/api/rookie-board'),
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as any).auth?.token
    if (token) {
      headers.set('authorization', `Bearer ${token}`)
    }
    headers.set('content-type', 'application/json')
    return headers
  },
})

// Add retry logic for failed requests (max 3 attempts with exponential backoff)
const baseQueryWithRetry = retry(baseQueryWithErrorHandling, { maxRetries: 3 })

export const rookieBoardApi = createApi({
  reducerPath: 'rookieBoardApi',
  baseQuery: baseQueryWithRetry,
  tagTypes: ['RookieBoard'],
  endpoints: (builder) => ({
    // Get user's personalized rankings (or official if none exist)
    getUserRankings: builder.query<RookieBoardResponse, string>({
      query: (userId) => ({
        url: `/user/${userId}`,
        method: 'GET',
      }),
      providesTags: ['RookieBoard'],
    }),

    // Reorder user's rankings
    reorderUserRanking: builder.mutation<
      RookieBoardResponse,
      { userId: string; playerId: number; newRank: number }
    >({
      query: ({ userId, playerId, newRank }) => ({
        url: `/user/${userId}/reorder`,
        method: 'PUT',
        body: { playerId, newRank },
      }),
      invalidatesTags: ['RookieBoard'],
    }),

    // Move tier heading
    moveTier: builder.mutation<
      RookieBoardResponse,
      { userId: string; tierId: string; newPosition: number }
    >({
      query: ({ userId, tierId, newPosition }) => ({
        url: `/user/${userId}/tiers/${tierId}/move`,
        method: 'PUT',
        body: { newPosition },
      }),
      invalidatesTags: ['RookieBoard'],
    }),

    // Save or update note
    saveNote: builder.mutation<
      RookieBoardResponse,
      { userId: string; playerId: number; content: string }
    >({
      query: ({ userId, playerId, content }) => ({
        url: `/user/${userId}/notes/${playerId}`,
        method: 'PUT',
        body: { content },
      }),
      invalidatesTags: ['RookieBoard'],
    }),

    // Delete note
    deleteNote: builder.mutation<
      RookieBoardResponse,
      { userId: string; playerId: number }
    >({
      query: ({ userId, playerId }) => ({
        url: `/user/${userId}/notes/${playerId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['RookieBoard'],
    }),

    // Create tier heading
    createTier: builder.mutation<
      RookieBoardResponse,
      { userId: string; name: string; position: number }
    >({
      query: ({ userId, name, position }) => ({
        url: `/user/${userId}/tiers`,
        method: 'POST',
        body: { name, position },
      }),
      invalidatesTags: ['RookieBoard'],
    }),

    // Update tier heading
    updateTier: builder.mutation<
      RookieBoardResponse,
      { userId: string; tierId: string; name?: string; position?: number }
    >({
      query: ({ userId, tierId, name, position }) => ({
        url: `/user/${userId}/tiers/${tierId}`,
        method: 'PUT',
        body: { name, position },
      }),
      invalidatesTags: ['RookieBoard'],
    }),

    // Delete tier heading
    deleteTier: builder.mutation<
      RookieBoardResponse,
      { userId: string; tierId: string }
    >({
      query: ({ userId, tierId }) => ({
        url: `/user/${userId}/tiers/${tierId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['RookieBoard'],
    }),
  }),
})

export const {
  useGetUserRankingsQuery,
  useReorderUserRankingMutation,
  useMoveTierMutation,
  useSaveNoteMutation,
  useDeleteNoteMutation,
  useCreateTierMutation,
  useUpdateTierMutation,
  useDeleteTierMutation,
} = rookieBoardApi
