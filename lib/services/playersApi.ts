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

export interface SeasonPerformanceMetrics {
  "Season": string
  "Games": string
  "Games Rank": string
  "Air Yards": string
  "Air Yards Per Game": string
  "Air Yards Per Game Rank": string
  "Air Yards Rank": string
  "Air Yards Share": string
  "Air Yards Share Rank": string
  "Average Target Distance": string
  "Average Target Distance Rank": string
  "Best Ball Points Added": string
  "Best Ball Points Added Rank": string
  "Best Ball Points Added Per Game": string
  "Completed Air Yards": string
  "Completed Air Yards Per Game": string
  "Completed Air Yards Per Reception": string
  "Completed Air Yards Per Target": string
  "Completed Air Yards Rank": string
  "Average Cushion": string
  "Average Cushion Rank": string
  "Carries": string
  "Carries Inside 10": string
  "Carries Inside 10 Per Game": string
  "Carries Inside 5": string
  "Carries Inside 5 Per Game": string
  "Carries Per Game": string
  "Carries Per Game Rank": string | null
  "Carries Rank": string | null
  "Catchable Targets": string
  "Catchable Targets Per Game": string
  "Catchable Targets Rank": string
  "Catchable Target Rate": string
  "Catchable Target Rate Rank": string
  "Catch Rate": string
  "Catch Rate Rank": string
  "Contested Catch Conversion Rate": string
  "Contested Catch Conversion Rate Rank": string
  "Contested Catches": string
  "Contested Targets": string
  "Deep Targets": string
  "Deep Targets Per Game": string
  "Deep Targets Rank": string
  "Dominator Rating": string
  "Dominator Rating Rank": string
  "Drops": string
  "Drops Per Game": string
  "Drops Per Game Rank": string
  "Drop Rate": string
  "Drop Rate Rank": string
  "Drops Rank": string
  "End Zone Targets": string
  "End Zone Target Share": string
  "End Zone Target Share Rank": string
  "Expected Points Added": string
  "Expected Points Added Rank": string
  "EPA Per Target": string
  "EPA Per Target Rank": string
  "Expected Fantasy Points Per Game": string
  "Expected Fantasy Points Per Game Rank": string
  "Expected Fantasy Points": string
  "Expected Fantasy Points Rank": string
  "Fantasy Points Per Game Differential": string
  "Expected Receiving Yards": string
  "Expected Receiving Yards Rank": string
  "Expected Receiving Touchdowns": string
  "Expected Receiving Touchdowns Rank": string
  "Expected Yards Per Reception": string
  "Expected Yards Per Reception Rank": string
  "Expected Touchdowns": string
  "Expected Touchdowns Rank": string
  "Total Fantasy Points": string
  "Fantasy Points Rank": string
  "Fantasy Points Per Game": string
  "Fantasy Points Per Game Rank": string
  "Fantasy Points Per Route Run": string
  "Fantasy Points Per Route Run Rank": string
  "Fantasy Points Per Snap": string
  "Fantasy Points Per Snap Rank": string
  "Fantasy Points Per Target": string
  "Fantasy Points Per Target Rank": string
  "Game Script": string
  "Game Script Rank": string
  "Targets Per Snap": string
  "Targets Per Snap Rank": string
  "Pace of Play": string
  "Pace of Play Rank": string
  "Production Premium": string
  "Production Premium Rank": string
  "QB Rating When Targeted": string
  "QB Rating When Targeted Rank": string
  "Receiving TDs": string
  "Receiving Yards": string
  "Receiving Yards Per Game": string
  "Receiving Yards Per Game Rank": string
  "Receiving Yards Rank": string
  "Receptions": string
  "Receptions Per Game": string
  "Receptions Per Game Rank": string
  "Receptions Rank": string
  "Red Zone Carries": string
  "Red Zone Carries Per Game": string
  "Red Zone Carries Per Game Rank": string | null
  "Red Zone Carries Rank": string | null
  "Red Zone Catch Rate": string
  "Red Zone Catch Rate Rank": string
  "Red Zone Receptions": string
  "Red Zone Receptions Rank": string
  "Red Zone Targets": string
  "Red Zone Target Share": string
  "Red Zone Target Share Rank": string
  "Red Zone Targets Rank": string
  "Red Zone Touches": string
  "Red Zone Touches Per Game": string
  "Route Participation": string
  "Route Participation Rank": string
  "Routes Run": string
  "Routes Run Per Game": string
  "Routes Run Rank": string
  "Pass Snaps": string
  "Pass Snaps Rank": string
  "Run Snaps": string
  "Run Snaps Rank": string
  "Red Zone Snaps": string
  "Red Zone Snap Share": string
  "Red Zone Snap Share Rank": string
  "Rushing Touchdowns": string
  "Rushing Yards": string
  "Rush Yards Per Game": string
  "Rushing Yards Rank": string | null
  "Rush Yards Per Game Rank": string | null
  "Slot Rate": string
  "Slot Rate Rank": string
  "Slot YPR": string
  "Slot YPR Rank": string
  "Slot YPT": string
  "Slot YPT Rank": string
  "Slot Catch Rate": string
  "Slot Catch Rate Rank": string
  "Slot Fantasy Points": string
  "Slot Fantasy Points Rank": string
  "Slot Fantasy Points Per Game": string
  "Slot Fantasy Points Per Game Rank": string
  "Slot Fantasy Points Per Target": string
  "Slot Fantasy Points Per Target Rank": string
  "Slot Snaps": string
  "Slot Snaps Rank": string
  "Slot Routes": string
  "Slot Routes Rank": string
  "Slot Targets": string
  "Slot Targets Rank": string
  "Out Wide Snaps": string
  "Out Wide Snaps Rank": string
  "Out Wide Routes": string
  "Out Wide Routes Rank": string
  "Out Wide Targets": string
  "Out Wide Targets Rank": string
  "Snaps": string
  "Snap Share": string
  "Snap Share Rank": string
  "Snaps In Motion": string
  "Snaps In Motion Rank": string
  "Motion Rate": string
  "Motion Rate Rank": string
  "Snap-weighted Game Script": string
  "Snap-weighted Game Script Rank": string
  "Target Premium": string
  "Target Premium Rank": string
  "Targets": string
  "Target Rate": string
  "Target Rate Rank": string
  "Target Share": string
  "Target Share Rank": string
  "Targets Inside 10": string
  "Targets Inside 10 Per Game": string
  "Targets Inside 5": string
  "Targets Inside 5 Per Game": string
  "Targets Per Game": string
  "Targets Per Game Rank": string
  "Targets Rank": string
  "Target Separation": string
  "Target Separation Rank": string
  "Team Pass Plays Per Game": string
  "Team Pass Plays Per Game Rank": string
  "Total Touchdowns": string
  "Total Touchdowns Rank": string
  "Total Touches": string
  "Total Yards": string
  "Total Yards Per Game": string
  "Touchdown Rate": string
  "Touchdown Rate Rank": string
  "True Catch Rate": string
  "True Catch Rate Rank": string
  "Uncatchable Targets": string
  "Uncatchable Targets Per Game": string
  "Unrealized Air Yards": string
  "Unrealized Air Yards Per Target": string
  "Unrealized Air Yards Rank": string
  "VOS": string
  "VOS Rank": string
  "Weekly Volatility": string
  "Weekly Volatility Rank": string
  "Yards After Catch": string
  "Yards After Catch Per Game": string
  "Yards After Catch Per Reception": string
  "Yards After Catch Per Target": string
  "Yards After Catch Rank": string
  "Yards Per Reception": string
  "Yards Per Reception Rank": string
  "Yards Per Route Run": string
  "Yards Per Route Run Rank": string
  "Yards Per Target": string
  "Yards Per Target Rank": string
  "Yards Per Team Pass Attempt": string
  "Yards Per Team Pass Attempt Rank": string
  "Juke Rate": string
  "Juke Rate Rank": string
  "Formation Adjusted Yards Per Route Run": string
  "Formation Adjusted Yards Per Route Run Rank": string
  "Burns": string
  "Burn Rate": string
  "Target Quality Rating": string
  "Target Quality Rating Rank": string
  "Target Accuracy": string
  "Target Accuracy Rank": string
  "Total Route Wins": string
  "Total Route Wins Rank": string
  "Route Win Rate": string
  "Route Win Rate Rank": string
  "Win Rate vs Man": string
  "Win Rate vs Man Rank": string
  "Win Rate vs Zone": string
  "Win Rate vs Zone Rank": string
  "Routes vs Man": string
  "Routes vs Man Rank": string
  "Routes vs Zone": string
  "Routes vs Zone Rank": string
  "Wins vs Man": string
  "Wins vs Man Rank": string
  "Wins vs Zone": string
  "Wins vs Zone Rank": string
  "Average Separation": string
  "Average Separation Rank": string
  "Average Separation vs Man": string
  "Average Separation vs Man Rank": string
  "Average Separation vs Zone": string
  "Average Separation vs Zone Rank": string
  "Target Separation vs Man": string
  "Target Separation vs Man Rank": string
  "Target Separation vs Zone": string
  "Target Separation vs Zone Rank": string
  "Targets vs Man": string
  "Targets vs Man Rank": string
  "Targets vs Zone": string
  "Targets vs Zone Rank": string
  "Target Rate vs Man": string
  "Target Rate vs Man Rank": string
  "Target Rate vs Zone": string
  "Target Rate vs Zone Rank": string
  "Fantasy Points Per Target vs Man": string
  "Fantasy Points Per Target vs Man Rank": string
  "Fantasy Points Per Target vs Zone": string
  "Fantasy Points Per Target vs Zone Rank": string
  "Receptions vs Man": string
  "Receptions vs Man Rank": string
  "Receptions vs Zone": string
  "Receptions vs Zone Rank": string
  "Receiving Yards vs Man": string
  "Receiving Yards vs Man Rank": string
  "Receiving Yards vs Zone": string
  "Receiving Yards vs Zone Rank": string
  "Fantasy Points vs Man": string
  "Fantasy Points vs Man Rank": string
  "Fantasy Points vs Zone": string
  "Fantasy Points vs Zone Rank": string
  "Fantasy Points Per Game vs Man": string
  "Fantasy Points Per Game vs Man Rank": string
  "Fantasy Points Per Game vs Zone": string
  "Fantasy Points Per Game vs Zone Rank": string
}

export interface PerformanceMetrics {
  [year: string]: SeasonPerformanceMetrics
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
    getPlayerPerformance: builder.query<PlayerProfilerResponse, { playerId: string; year?: string }>({
      query: ({ playerId, year }) => {
        const params = new URLSearchParams()
        if (year) {
          params.append('year', year)
        }
        const queryString = params.toString()
        return {
          url: `/${playerId}${queryString ? `?${queryString}` : ''}`,
          method: 'GET'
        }
      }
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
  useGetPlayerPerformanceQuery: useGetPlayerPerformanceProfilerQuery,
} = playerProfilerApi