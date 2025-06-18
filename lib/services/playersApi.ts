import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

const PLAYER_PROFILER_API_BASE_URL = 'https://api.playerprofiler.com/v1/player'
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.32beatwriters.staging.pegasync.com/api'
const IMAGE_BASE_URL = process.env.NEXT_PUBLIC_IMAGE_BASE_URL || 'https://www.playerprofiler.com/wp-content/uploads'

// Original Player interface for internal API
export interface Player {
  id: number | string
  playerId: string
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

// Player Profiler API response interfaces
export interface PlayerProfilerCore {
  Permalink: string
  Avatar: string
  'Alt Image': string
  'Full Name': string
  'First Name': string
  'Full Name Alias': string
  'Last Name': string
  'Depth Chart Position': string
  Active: string
  Team: {
    Name: string
    Team_ID: string
    Permalink: string
  }
  'Best Comparable Player': {
    Player_ID: string
    'Full Name': string
    Avatar: string
    Permalink: string
  }
  Height: string
  'Height (Inches)': number
  Weight: string
  'Weight Raw': number
  BMI: string
  'BMI Rank': string
  'Hand Size': string
  'Hand Size Rank': string
  'Arm Length': string
  'Arm Length Rank': string
  College: string
  'Draft Year': string
  'Draft Pick': string
  'Birth Date': string
  Age: number
  Notes: string
  'Highlight Clip': string
  'Position Type': string
  'Quality Score': string
  'Quality Score Rank': string
  'Special Status': string
  Position: string
  'General Position': string
  'Popularity Index': number
  ADP: string
  'ADP Year': number
}

export interface WorkoutMetrics {
  '40-Yard Dash': string
  '40-Yard Dash Rank': string
  '3-Cone Drill': string
  '3-Cone Drill Rank': string
  '20-Yard Shuttle': string
  'Agility Score': string
  'Agility Score Rank': number | null
  'Catch Radius': string
  'Catch Radius Rank': number
  'Vertical Jump': string
  'Vertical Jump Rank': string
  'Broad Jump': string
  'Broad Jump Rank': string
  'Burst Score': string
  'Burst Score Rank': number
  'SPARQ-x': string
  'SPARQ-x Rank': number
  'Athleticism Score': string
  'Athleticism Score Rank': string
  'Pro Day 40': string | null
  'Speed Score': string
  'Speed Score Rank': number
  'Bench Press': string
  'Bench Press Rank': number
}

export interface CollegePerformance {
  'Breakout Year': string
  'Breakout Age': number
  'Breakout Age Rank': number
  'College Dominator Rating': string
  'College Dominator Rating Rank': string
  'College YPC': number
  'College YPC Rank': number
  'College Target Share': number
  'College Target Share Rank': number
  'College Teammate Score': number
  'College Teammate Score Rank': number
  'College Level of Competition': number
  'College Level of Competition Rank': number
  'Receiver Rating': number
  'Receiver Rating Rank': number
  'Breakout Rating': number
  'Breakout Rating Rank': number
}

export interface PerformanceMetrics {
  'Targets': number
  'Targets Rank': number
  'Target Shares': number
  'Target Shares Rank': number
}

export interface PlayerProfilerData {
  updated_at: {
    $date: {
      $numberLong: string
    }
  }
  created_at: {
    $date: {
      $numberLong: string
    }
  }
  'College Performance': CollegePerformance
  Core: PlayerProfilerCore
  'External IDs': Array<{
    name: string
    id: string
  }>
  'High School Metrics': Record<string, any>
  Player_ID: string
  'Workout Metrics': WorkoutMetrics
  search_term: string
  status: string
  ADP: Record<string, Record<string, string>>
  team_key: string
  'Performance Metrics': PerformanceMetrics
}

export interface PlayerProfilerResponse {
  data: {
    Player: PlayerProfilerData
  }
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

export const playersApi = createApi({
  reducerPath: 'playersApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_BASE_URL}/players`,
    prepareHeaders: (headers, { getState }) => {
      // Make auth token optional for public player data
      const token = (getState() as any).auth?.token
      if (token) {
        headers.set('authorization', `Bearer ${token}`)
      }
      headers.set('content-type', 'application/json')
      return headers
    },
  }),
  tagTypes: ['Player'],
  endpoints: (builder) => ({
    getPlayers: builder.query<PlayersResponse, { page?: number; limit?: number; pageSize?: number; search?: string; position?: string; conference?: string }>({
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
    getPlayer: builder.query<Player, string>({
      query: (id) => ({
        url: `/${id}`,
        method: 'GET',
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
  }),
})

export const playerProfilerApi = createApi({
  reducerPath: 'playerProfilerApi',
  baseQuery: fetchBaseQuery({
    baseUrl: PLAYER_PROFILER_API_BASE_URL,
  }),
  endpoints: (builder) => ({
    getPlayer: builder.query<PlayerProfilerResponse, string>({
      query: (playerId) => ({
        url: `/${playerId}`,
        method: 'GET'
      })
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
} = playersApi

export const {
  useGetPlayerQuery: useGetPlayerProfilerQuery,
} = playerProfilerApi