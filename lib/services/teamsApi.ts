import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api'

export interface Team {
  id: string
  name: string
  shortName: string
  city: string
  conference: 'Eastern' | 'Western'
  division: string
  logo: string
  primaryColor: string
  secondaryColor: string
  founded: number
  arena: string
  capacity: number
  coach: string
  generalManager?: string
  owner?: string
  website?: string
  stats?: {
    season: string
    wins: number
    losses: number
    winPercentage: number
    pointsPerGame: number
    pointsAllowedPerGame: number
    reboundsPerGame: number
    assistsPerGame: number
    stealsPerGame: number
    blocksPerGame: number
  }[]
  roster?: string[] // Player IDs
  createdAt: string
  updatedAt: string
}

interface TeamsResponse {
  teams: Team[]
  total: number
  page: number
  limit: number
  totalPages: number
}

interface TeamFilters {
  conference?: 'Eastern' | 'Western'
  division?: string
  search?: string
  page?: number
  limit?: number
  sortBy?: 'name' | 'wins' | 'losses' | 'winPercentage'
  sortOrder?: 'asc' | 'desc'
}

export const teamsApi = createApi({
  reducerPath: 'teamsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_BASE_URL}/teams`,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as any).auth.token
      if (token) {
        headers.set('authorization', `Bearer ${token}`)
      }
      headers.set('content-type', 'application/json')
      return headers
    },
  }),
  tagTypes: ['Team'],
  endpoints: (builder) => ({
    // Get all teams with filtering and pagination
    getTeams: builder.query<TeamsResponse, TeamFilters>({
      query: (filters) => {
        const params = new URLSearchParams()
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined) {
            params.append(key, value.toString())
          }
        })
        return `?${params.toString()}`
      },
      providesTags: ['Team'],
    }),
    
    // Get single team by ID
    getTeam: builder.query<{ team: Team }, string>({
      query: (id) => `/${id}`,
      providesTags: (result, error, id) => [{ type: 'Team', id }],
    }),
    
    // Create new team (admin only)
    createTeam: builder.mutation<{ team: Team; message: string }, Omit<Team, 'id' | 'createdAt' | 'updatedAt'>>({
      query: (teamData) => ({
        url: '',
        method: 'POST',
        body: teamData,
      }),
      invalidatesTags: ['Team'],
    }),
    
    // Update team (admin only)
    updateTeam: builder.mutation<{ team: Team; message: string }, { id: string; data: Partial<Team> }>({
      query: ({ id, data }) => ({
        url: `/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Team', id }, 'Team'],
    }),
    
    // Delete team (admin only)
    deleteTeam: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Team', id }, 'Team'],
    }),
    
    // Get team stats
    getTeamStats: builder.query<{ stats: Team['stats'] }, { teamId: string; season?: string }>({
      query: ({ teamId, season }) => {
        const params = season ? `?season=${season}` : ''
        return `/${teamId}/stats${params}`
      },
      providesTags: (result, error, { teamId }) => [{ type: 'Team', id: `${teamId}-stats` }],
    }),
    
    // Get teams by conference
    getTeamsByConference: builder.query<{ teams: Team[] }, 'Eastern' | 'Western'>({
      query: (conference) => `/conference/${conference}`,
      providesTags: ['Team'],
    }),
    
    // Get teams by division
    getTeamsByDivision: builder.query<{ teams: Team[] }, string>({
      query: (division) => `/division/${encodeURIComponent(division)}`,
      providesTags: ['Team'],
    }),
    
    // Search teams
    searchTeams: builder.query<{ teams: Team[] }, string>({
      query: (searchTerm) => `/search?q=${encodeURIComponent(searchTerm)}`,
      providesTags: ['Team'],
    }),
    
    // Get team roster
    getTeamRoster: builder.query<{ players: any[] }, string>({
      query: (teamId) => `/${teamId}/roster`,
      providesTags: (result, error, teamId) => [{ type: 'Team', id: `${teamId}-roster` }],
    }),
    
    // Get team schedule
    getTeamSchedule: builder.query<{ games: any[] }, { teamId: string; season?: string }>({
      query: ({ teamId, season }) => {
        const params = season ? `?season=${season}` : ''
        return `/${teamId}/schedule${params}`
      },
      providesTags: (result, error, { teamId }) => [{ type: 'Team', id: `${teamId}-schedule` }],
    }),
    
    // Get standings
    getStandings: builder.query<{ eastern: Team[]; western: Team[] }, string | void>({
      query: (season) => {
        const params = season ? `?season=${season}` : ''
        return `/standings${params}`
      },
      providesTags: ['Team'],
    }),
  }),
})

export const {
  useGetTeamsQuery,
  useGetTeamQuery,
  useCreateTeamMutation,
  useUpdateTeamMutation,
  useDeleteTeamMutation,
  useGetTeamStatsQuery,
  useGetTeamsByConferenceQuery,
  useGetTeamsByDivisionQuery,
  useSearchTeamsQuery,
  useGetTeamRosterQuery,
  useGetTeamScheduleQuery,
  useGetStandingsQuery,
} = teamsApi 