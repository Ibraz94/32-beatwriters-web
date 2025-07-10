import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { API_CONFIG, buildApiUrl } from '../config/api'

export interface Tool {
  id: string
  name: string
  slug: string
  description: string
  category: string
  type: 'calculator' | 'generator' | 'analyzer' | 'converter'
  isPremium: boolean
  isActive: boolean
  usage: number
  rating: number
  reviews: number
  icon?: string
  thumbnail?: string
  features: string[]
  instructions?: string
  createdAt: string
  updatedAt: string
}

interface ToolsResponse {
  tools: Tool[]
  total: number
  page: number
  limit: number
  totalPages: number
}

interface ToolFilters {
  category?: string
  type?: 'calculator' | 'generator' | 'analyzer' | 'converter'
  isPremium?: boolean
  isActive?: boolean
  search?: string
  page?: number
  limit?: number
  sortBy?: 'name' | 'usage' | 'rating' | 'createdAt'
  sortOrder?: 'asc' | 'desc'
}

// Specific tool calculation interfaces
interface FantasyPointsCalculation {
  playerId: string
  stats: {
    points?: number
    rebounds?: number
    assists?: number
    steals?: number
    blocks?: number
    turnovers?: number
    fieldGoalsMade?: number
    fieldGoalsAttempted?: number
    freeThrowsMade?: number
    freeThrowsAttempted?: number
    threePointersMade?: number
  }
  scoring: 'standard' | 'ppr' | 'custom'
}

interface SalaryCapCalculation {
  teamId: string
  players: {
    playerId: string
    salary: number
    years: number
  }[]
  capSpace: number
}

export const toolsApi = createApi({
  reducerPath: 'toolsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: buildApiUrl(API_CONFIG.ENDPOINTS.TOOLS),
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as any).auth.token
      if (token) {
        headers.set('authorization', `Bearer ${token}`)
      }
      headers.set('content-type', 'application/json')
      return headers
    },
  }),
  tagTypes: ['Tool'],
  endpoints: (builder) => ({
    getTools: builder.query<ToolsResponse, ToolFilters>({
      query: (filters) => {
        const params = new URLSearchParams()
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined) {
            params.append(key, value.toString())
          }
        })
        return `?${params.toString()}`
      },
      providesTags: ['Tool'],
    }),
    
    getTool: builder.query<{ tool: Tool }, string>({
      query: (idOrSlug) => `/${idOrSlug}`,
      providesTags: (result, error, idOrSlug) => [{ type: 'Tool', id: idOrSlug }],
    }),
    
    getPopularTools: builder.query<{ tools: Tool[] }, { limit?: number }>({
      query: ({ limit = 10 }) => `/popular?limit=${limit}`,
      providesTags: ['Tool'],
    }),
    
    getFeaturedTools: builder.query<{ tools: Tool[] }, { limit?: number }>({
      query: ({ limit = 5 }) => `/featured?limit=${limit}`,
      providesTags: ['Tool'],
    }),
    
    getToolsByCategory: builder.query<{ tools: Tool[] }, string>({
      query: (category) => `/category/${encodeURIComponent(category)}`,
      providesTags: ['Tool'],
    }),
    
    searchTools: builder.query<{ tools: Tool[] }, string>({
      query: (searchTerm) => `/search?q=${encodeURIComponent(searchTerm)}`,
      providesTags: ['Tool'],
    }),
    
    getToolCategories: builder.query<{ categories: string[] }, void>({
      query: () => '/categories',
      providesTags: ['Tool'],
    }),
    
    // Tool usage tracking
    trackToolUsage: builder.mutation<{ success: boolean }, string>({
      query: (toolId) => ({
        url: `/${toolId}/use`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, toolId) => [{ type: 'Tool', id: toolId }],
    }),
    
    // Rate tool
    rateTool: builder.mutation<{ rating: number; reviews: number }, { toolId: string; rating: number; review?: string }>({
      query: ({ toolId, rating, review }) => ({
        url: `/${toolId}/rate`,
        method: 'POST',
        body: { rating, review },
      }),
      invalidatesTags: (result, error, { toolId }) => [{ type: 'Tool', id: toolId }],
    }),
    
    // Fantasy points calculator
    calculateFantasyPoints: builder.mutation<{ points: number; breakdown: any }, FantasyPointsCalculation>({
      query: (data) => ({
        url: '/fantasy-points/calculate',
        method: 'POST',
        body: data,
      }),
    }),
    
    // Salary cap calculator
    calculateSalaryCap: builder.mutation<{ totalSalary: number; capSpace: number; available: boolean }, SalaryCapCalculation>({
      query: (data) => ({
        url: '/salary-cap/calculate',
        method: 'POST',
        body: data,
      }),
    }),
    
    // Draft analyzer
    analyzeDraft: builder.mutation<{ analysis: any; recommendations: string[] }, { picks: any[]; strategy: string }>({
      query: (data) => ({
        url: '/draft/analyze',
        method: 'POST',
        body: data,
      }),
    }),
    
    // Trade analyzer
    analyzeTrade: builder.mutation<{ analysis: any; recommendation: string }, { playerA: string[]; playerB: string[] }>({
      query: (data) => ({
        url: '/trade/analyze',
        method: 'POST',
        body: data,
      }),
    }),
  }),
})

export const {
  useGetToolsQuery,
  useGetToolQuery,
  useGetPopularToolsQuery,
  useGetFeaturedToolsQuery,
  useGetToolsByCategoryQuery,
  useSearchToolsQuery,
  useGetToolCategoriesQuery,
  useTrackToolUsageMutation,
  useRateToolMutation,
  useCalculateFantasyPointsMutation,
  useCalculateSalaryCapMutation,
  useAnalyzeDraftMutation,
  useAnalyzeTradeMutation,
} = toolsApi 