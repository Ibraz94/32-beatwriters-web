import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api'

export interface Player {
  id: string
  name: string
  position: string
  team: string
  teamId: string
  jerseyNumber: number
  age: number
  height: string
  weight: string
  experience: number
  college?: string
  stats?: {
    season: string
    games: number
    points: number
    rebounds: number
    assists: number
    steals: number
    blocks: number
    fieldGoalPercentage: number
    threePointPercentage: number
    freeThrowPercentage: number
  }[]
  image?: string
  bio?: string
  createdAt: string
  updatedAt: string
}

interface PlayersResponse {
  players: Player[]
  total: number
  page: number
  limit: number
  totalPages: number
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
    // Get all players with filtering and pagination
    getPlayers: builder.query<PlayersResponse, PlayerFilters>({
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
    
    // Get single player by ID
    getPlayer: builder.query<{ player: Player }, string>({
      query: (id) => `/${id}`,
      providesTags: (result, error, id) => [{ type: 'Player', id }],
    }),
    
    
    // Get player stats
    getPlayerStats: builder.query<{ stats: Player['stats'] }, { playerId: string; season?: string }>({
      query: ({ playerId, season }) => {
        const params = season ? `?season=${season}` : ''
        return `/${playerId}/stats${params}`
      },
      providesTags: (result, error, { playerId }) => [{ type: 'Player', id: `${playerId}-stats` }],
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
  }),
})

export const {
  useGetPlayersQuery,
  useGetPlayerQuery,
  useGetPlayerStatsQuery,
  useGetPlayersByTeamQuery,
  useSearchPlayersQuery,
  useGetFeaturedPlayersQuery,
} = playersApi 