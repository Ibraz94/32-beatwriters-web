import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.32beatwriters.staging.pegasync.com/api'
const IMAGE_BASE_URL = process.env.NEXT_PUBLIC_IMAGE_BASE_URL || 'https://www.playerprofiler.com/wp-content/uploads'

export interface Player {
  id: string
  name: string
  team: string
  position: string
  height: string
  weight: number
  headshotPic: string
  college: string
  draftPick: string
  age: number
  status: string
  ppi: number
  createdAt: string
  updatedAt: string
}

export interface PlayersResponse {
  success: boolean
  data: {
    players: Player[]
    pagination: {
      total: number
      page: number
      pageSize: number
      totalPages: number
    }
  }
}

export interface PositionsResponse {
  success: boolean
  data: {
    positions: string[]
  }
}

interface PlayerFilters {
  team?: string
  position?: string
  search?: string
  page?: number
  limit?: number
  sortBy?: 'name' | 'age' | 'points' | 'rebounds' | 'assists'
  sortOrder?: 'asc' | 'desc'
}

export const playersApi = createApi({
  reducerPath: 'playersApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_BASE_URL}/players`,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as any).auth.token
      if (token) {
        headers.set('authorization', `Bearer ${token}`)
      }
      headers.set('content-type', 'application/json')
      return headers
    },
  }),
  tagTypes: ['Player'],
  endpoints: (builder) => ({
    getPlayers: builder.query<PlayersResponse, { page?: number; limit?: number; search?: string; position?: string; conference?: string }>({
      query: (params) => ({
        url: '/',
        method: 'GET',
        params
      })
    }),
    getPositions: builder.query<PositionsResponse, void>({
      query: () => ({
        url: '/players/positions',
        method: 'GET'
      })
    }),
    getPlayer: builder.query<{ success: boolean; data: Player }, string>({
      query: (id) => ({
        url: `/players/${id}`,
        method: 'GET'
      })
    }),
    // Get all players with filtering and pagination
    getPlayersWithFilters: builder.query<PlayersResponse, PlayerFilters>({
      query: (filters) => {
        const params = new URLSearchParams()
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined) {
            params.append(key, value.toString())
          }
        })
        return `?${params.toString()}`
      },
      providesTags: ['Player'],
    }),
    
    // Get players by team
    getPlayersByTeam: builder.query<{ players: Player[] }, string>({
      query: (teamId) => `/team/${teamId}`,
      providesTags: ['Player'],
    }),
    
    // Search players
    searchPlayers: builder.query<{ players: Player[] }, string>({
      query: (searchTerm) => `/search?q=${encodeURIComponent(searchTerm)}`,
      providesTags: ['Player'],
    }),
    
    // Get featured players
    getFeaturedPlayers: builder.query<{ players: Player[] }, void>({
      query: () => '/featured',
      providesTags: ['Player'],
    }),

    getImageUrl: builder.query<string, string>({
      query: (imagePath) => `/uploads/${imagePath}`,
      providesTags: ['Player'],
    }),
  }),
})

export const {
  useGetPlayersQuery,
  useGetPositionsQuery,
  useGetPlayerQuery,
  useGetPlayersWithFiltersQuery,
  useGetPlayersByTeamQuery,
  useSearchPlayersQuery,
  useGetFeaturedPlayersQuery,
  useGetImageUrlQuery,
} = playersApi 