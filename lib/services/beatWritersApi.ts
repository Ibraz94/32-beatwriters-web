import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api'

export interface BeatWriter {
  id: string
  name: string
  slug: string
  email: string
  bio: string
  avatar?: string
  coverImage?: string
  specialties: string[]
  teams: string[] // Team IDs they cover
  yearsExperience: number
  socialLinks: {
    twitter?: string
    instagram?: string
    linkedin?: string
    website?: string
  }
  stats: {
    totalArticles: number
    totalViews: number
    totalLikes: number
    averageRating: number
    followers: number
  }
  isVerified: boolean
  isActive: boolean
  joinedAt: string
  lastActiveAt: string
  createdAt: string
  updatedAt: string
}

interface BeatWritersResponse {
  writers: BeatWriter[]
  total: number
  page: number
  limit: number
  totalPages: number
}

interface BeatWriterFilters {
  specialty?: string
  team?: string
  isVerified?: boolean
  isActive?: boolean
  search?: string
  page?: number
  limit?: number
  sortBy?: 'name' | 'followers' | 'totalArticles' | 'averageRating' | 'joinedAt'
  sortOrder?: 'asc' | 'desc'
}

interface CreateBeatWriterRequest {
  name: string
  email: string
  bio: string
  avatar?: string
  specialties: string[]
  teams: string[]
  yearsExperience: number
  socialLinks?: BeatWriter['socialLinks']
}

export const beatWritersApi = createApi({
  reducerPath: 'beatWritersApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_BASE_URL}/beat-writers`,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as any).auth.token
      if (token) {
        headers.set('authorization', `Bearer ${token}`)
      }
      headers.set('content-type', 'application/json')
      return headers
    },
  }),
  tagTypes: ['BeatWriter'],
  endpoints: (builder) => ({
    // Get all beat writers with filtering and pagination
    getBeatWriters: builder.query<BeatWritersResponse, BeatWriterFilters>({
      query: (filters) => {
        const params = new URLSearchParams()
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined) {
            params.append(key, value.toString())
          }
        })
        return `?${params.toString()}`
      },
      providesTags: ['BeatWriter'],
    }),
    
    // Get single beat writer by ID or slug
    getBeatWriter: builder.query<{ writer: BeatWriter }, string>({
      query: (idOrSlug) => `/${idOrSlug}`,
      providesTags: (result, error, idOrSlug) => [{ type: 'BeatWriter', id: idOrSlug }],
    }),
    
    // Get featured beat writers
    getFeaturedBeatWriters: builder.query<{ writers: BeatWriter[] }, { limit?: number }>({
      query: ({ limit = 5 }) => `/featured?limit=${limit}`,
      providesTags: ['BeatWriter'],
    }),
    
    // Get top-rated beat writers
    getTopRatedBeatWriters: builder.query<{ writers: BeatWriter[] }, { limit?: number }>({
      query: ({ limit = 10 }) => `/top-rated?limit=${limit}`,
      providesTags: ['BeatWriter'],
    }),
    
    // Get beat writers by team
    getBeatWritersByTeam: builder.query<{ writers: BeatWriter[] }, string>({
      query: (teamId) => `/team/${teamId}`,
      providesTags: ['BeatWriter'],
    }),
    
    // Get beat writers by specialty
    getBeatWritersBySpecialty: builder.query<{ writers: BeatWriter[] }, string>({
      query: (specialty) => `/specialty/${encodeURIComponent(specialty)}`,
      providesTags: ['BeatWriter'],
    }),
    
    // Search beat writers
    searchBeatWriters: builder.query<{ writers: BeatWriter[] }, string>({
      query: (searchTerm) => `/search?q=${encodeURIComponent(searchTerm)}`,
      providesTags: ['BeatWriter'],
    }),
    
    // Follow/Unfollow beat writer
    toggleFollow: builder.mutation<{ following: boolean; followers: number }, string>({
      query: (writerId) => ({
        url: `/${writerId}/follow`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, writerId) => [{ type: 'BeatWriter', id: writerId }],
    }),
    
    // Get writer's articles
    getWriterArticles: builder.query<{ articles: any[] }, { writerId: string; page?: number; limit?: number }>({
      query: ({ writerId, page = 1, limit = 10 }) => `/${writerId}/articles?page=${page}&limit=${limit}`,
      providesTags: (result, error, { writerId }) => [{ type: 'BeatWriter', id: `${writerId}-articles` }],
    }),
    
    // Get writer's stats
    getWriterStats: builder.query<{ stats: BeatWriter['stats'] }, { writerId: string; period?: 'week' | 'month' | 'year' | 'all' }>({
      query: ({ writerId, period = 'all' }) => `/${writerId}/stats?period=${period}`,
      providesTags: (result, error, { writerId }) => [{ type: 'BeatWriter', id: `${writerId}-stats` }],
    }),
    
    // Rate beat writer
    rateBeatWriter: builder.mutation<{ rating: number; message: string }, { writerId: string; rating: number; review?: string }>({
      query: ({ writerId, rating, review }) => ({
        url: `/${writerId}/rate`,
        method: 'POST',
        body: { rating, review },
      }),
      invalidatesTags: (result, error, { writerId }) => [{ type: 'BeatWriter', id: writerId }],
    }),
    
    // Get writer specialties
    getWriterSpecialties: builder.query<{ specialties: string[] }, void>({
      query: () => '/specialties',
      providesTags: ['BeatWriter'],
    }),
    
    // Update writer verification status (admin only)
    updateVerificationStatus: builder.mutation<{ writer: BeatWriter; message: string }, { writerId: string; isVerified: boolean }>({
      query: ({ writerId, isVerified }) => ({
        url: `/${writerId}/verify`,
        method: 'PUT',
        body: { isVerified },
      }),
      invalidatesTags: (result, error, { writerId }) => [{ type: 'BeatWriter', id: writerId }, 'BeatWriter'],
    }),
  }),
})

export const {
  useGetBeatWritersQuery,
  useGetBeatWriterQuery,
  useGetFeaturedBeatWritersQuery,
  useGetTopRatedBeatWritersQuery,
  useGetBeatWritersByTeamQuery,
  useGetBeatWritersBySpecialtyQuery,
  useSearchBeatWritersQuery,
  useToggleFollowMutation,
  useGetWriterArticlesQuery,
  useGetWriterStatsQuery,
  useRateBeatWriterMutation,
  useGetWriterSpecialtiesQuery,
  useUpdateVerificationStatusMutation,
} = beatWritersApi 