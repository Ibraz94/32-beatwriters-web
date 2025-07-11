import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { API_CONFIG, buildApiUrl } from '../config/api'
const IMAGE_BASE_URL = process.env.NEXT_PUBLIC_IMAGE_BASE_URL || 'http://localhost:4004'

export interface Teams {
  id: string
  wpId: number
  name: string
  logo: string
  website: string
  teamColor: string
  socialLinks: {
    twitter: string
    instagram: string
    facebook: string
  }
  createdAt: string
  updatedAt: string
  city: string
  abbreviation: string
  conferenceDivision: string
}

interface TeamsResponse {
  teams: Teams[]
  total: number
  page: number
  limit: number
  totalPages: number
} 

interface AllTeamsResponse {
  teams: Teams[]
  total: number
}

// Helper function to construct full image URLs
export const getTeamLogoUrl = (imagePath?: string): string | undefined => {
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
  return `${imagePath}`
}

// Helper function to fetch all teams across all pages
const fetchAllTeams = async (baseUrl: string, headers: Headers): Promise<AllTeamsResponse> => {
  let allTeams: Teams[] = []
  let currentPage = 1
  let totalPages = 1
  let total = 0

  do {
    const response = await fetch(`${baseUrl}?page=${currentPage}&limit=50`, {
      headers: headers
    })
    
    if (!response.ok) {
      throw new Error(`Failed to fetch teams: ${response.statusText}`)
    }
    
    const data: TeamsResponse = await response.json()
    
    allTeams = [...allTeams, ...data.teams]
    totalPages = data.totalPages
    total = data.total
    currentPage++
    
  } while (currentPage <= totalPages)

  return {
    teams: allTeams,
    total: total
  }
}

export const teamsApi = createApi({
  reducerPath: 'teamsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: buildApiUrl(API_CONFIG.ENDPOINTS.TEAMS),
    prepareHeaders: (headers, { getState }) => {
      // Make auth token optional for public team data
      const token = (getState() as any).auth?.token
      if (token) {
        headers.set('authorization', `Bearer ${token}`)
      }
      headers.set('content-type', 'application/json')
      return headers
    },
  }),
  tagTypes: ['Team'],
  endpoints: (builder) => ({
    // Get all teams with pagination handled automatically
    getTeams: builder.query<AllTeamsResponse, void>({
      queryFn: async (arg, api, extraOptions, baseQuery) => {
        try {
          // Get the base URL and headers from baseQuery
          const result = await baseQuery('?page=1&limit=1')
          if (result.error) {
            return { error: result.error }
          }

          // Get base URL and headers for manual fetching
          const state = api.getState() as any
          const token = state.auth?.token
          const headers = new Headers()
          if (token) {
            headers.set('authorization', `Bearer ${token}`)
          }
          headers.set('content-type', 'application/json')

          const baseUrl = buildApiUrl(API_CONFIG.ENDPOINTS.TEAMS)
          const allTeamsData = await fetchAllTeams(baseUrl, headers)
          
          return { data: allTeamsData }
        } catch (error) {
          return { 
            error: { 
              status: 'FETCH_ERROR', 
              error: error instanceof Error ? error.message : 'Unknown error' 
            } 
          }
        }
      },
      providesTags: ['Team'],
    }),

    // Get paginated teams (keeping original functionality if needed)
    getTeamsPaginated: builder.query<TeamsResponse, { page?: number; limit?: number }>({
      query: ({ page = 1, limit = 20 }) => `?page=${page}&limit=${limit}`,
      providesTags: ['Team'],
    }),
    
    // Get single team by ID
    // getTeam: builder.query<{ team: Teams }, string>({
    //   query: (id) => `/${id}`,
    //   providesTags: (result, error, id) => [{ type: 'Team', id }],
    // }),
     
    // Get team stats
    // getTeamStats: builder.query<{ stats: Team['stats'] }, { teamId: string; season?: string }>({
    //   query: ({ teamId, season }) => {
    //     const params = season ? `?season=${season}` : ''
    //     return `/${teamId}/stats${params}`
    //   },
    //   providesTags: (result, error, { teamId }) => [{ type: 'Team', id: `${teamId}-stats` }],
    // }),
    
    // Get teams by conference
    // getTeamsByConference: builder.query<{ teams: Team[] }, 'Eastern' | 'Western'>({
    //   query: (conference) => `/conference/${conference}`,
    //   providesTags: ['Team'],
    // }),
    
    // Get teams by division
    // getTeamsByDivision: builder.query<{ teams: Team[] }, string>({
    //   query: (division) => `/division/${encodeURIComponent(division)}`,
    //   providesTags: ['Team'],
    // }),
    
    // Search teams
    // searchTeams: builder.query<{ teams: Team[] }, string>({
    //   query: (searchTerm) => `/search?q=${encodeURIComponent(searchTerm)}`,
    //   providesTags: ['Team'],
    // }),
    
    // Get team roster
    // getTeamRoster: builder.query<{ players: any[] }, string>({
    //   query: (teamId) => `/${teamId}/roster`,
    //   providesTags: (result, error, teamId) => [{ type: 'Team', id: `${teamId}-roster` }],
    // }),
    
    // Get team schedule
    // getTeamSchedule: builder.query<{ games: any[] }, { teamId: string; season?: string }>({
    //   query: ({ teamId, season }) => {
    //     const params = season ? `?season=${season}` : ''
    //     return `/${teamId}/schedule${params}`
    //   },
    //   providesTags: (result, error, { teamId }) => [{ type: 'Team', id: `${teamId}-schedule` }],
    // }),
    
    // Get standings
    // getStandings: builder.query<{ eastern: Team[]; western: Team[] }, string | void>({
    //   query: (season) => {
    //     const params = season ? `?season=${season}` : ''
    //     return `/standings${params}`
    //   },
    //   providesTags: ['Team'],
    // }),
  }),
})

export const {
  useGetTeamsQuery,
  useGetTeamsPaginatedQuery,
  // useGetTeamQuery,
  // useGetTeamStatsQuery,
  // useGetTeamsByConferenceQuery,
  // useGetTeamsByDivisionQuery,
  // useSearchTeamsQuery,
  // useGetTeamRosterQuery,
  // useGetTeamScheduleQuery,
  // useGetStandingsQuery,
} = teamsApi 