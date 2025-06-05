import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api'

export interface PodcastEpisode {
  id: string
  title: string
  slug: string
  description: string
  audioUrl: string
  duration: number
  episodeNumber: number
  seasonNumber?: number
  publishedAt: string
  thumbnail?: string
  transcript?: string
  hosts: {
    id: string
    name: string
    avatar?: string
  }[]
  guests?: {
    id: string
    name: string
    bio?: string
    avatar?: string
  }[]
  tags: string[]
  category: string
  isExplicit: boolean
  isPremium: boolean
  downloads: number
  likes: number
  comments: number
  seoTitle?: string
  seoDescription?: string
  createdAt: string
  updatedAt: string
}

interface PodcastResponse {
  episodes: PodcastEpisode[]
  total: number
  page: number
  limit: number
  totalPages: number
}

interface PodcastFilters {
  category?: string
  host?: string
  guest?: string
  season?: number
  isPremium?: boolean
  isExplicit?: boolean
  tags?: string[]
  search?: string
  page?: number
  limit?: number
  sortBy?: 'publishedAt' | 'downloads' | 'likes' | 'title'
  sortOrder?: 'asc' | 'desc'
}

export const podcastApi = createApi({
  reducerPath: 'podcastApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_BASE_URL}/podcast`,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as any).auth.token
      if (token) {
        headers.set('authorization', `Bearer ${token}`)
      }
      headers.set('content-type', 'application/json')
      return headers
    },
  }),
  tagTypes: ['Podcast'],
  endpoints: (builder) => ({
    getEpisodes: builder.query<PodcastResponse, PodcastFilters>({
      query: (filters) => {
        const params = new URLSearchParams()
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined) {
            if (Array.isArray(value)) {
              value.forEach(v => params.append(key, v))
            } else {
              params.append(key, value.toString())
            }
          }
        })
        return `?${params.toString()}`
      },
      providesTags: ['Podcast'],
    }),
    
    getEpisode: builder.query<{ episode: PodcastEpisode }, string>({
      query: (idOrSlug) => `/${idOrSlug}`,
      providesTags: (result, error, idOrSlug) => [{ type: 'Podcast', id: idOrSlug }],
    }),
    
    getFeaturedEpisodes: builder.query<{ episodes: PodcastEpisode[] }, { limit?: number }>({
      query: ({ limit = 5 }) => `/featured?limit=${limit}`,
      providesTags: ['Podcast'],
    }),
    
    getRecentEpisodes: builder.query<{ episodes: PodcastEpisode[] }, { limit?: number }>({
      query: ({ limit = 10 }) => `/recent?limit=${limit}`,
      providesTags: ['Podcast'],
    }),
    
    getPopularEpisodes: builder.query<{ episodes: PodcastEpisode[] }, { limit?: number; timeframe?: 'week' | 'month' | 'all' }>({
      query: ({ limit = 10, timeframe = 'week' }) => `/popular?limit=${limit}&timeframe=${timeframe}`,
      providesTags: ['Podcast'],
    }),
    
    searchEpisodes: builder.query<{ episodes: PodcastEpisode[] }, string>({
      query: (searchTerm) => `/search?q=${encodeURIComponent(searchTerm)}`,
      providesTags: ['Podcast'],
    }),
    
    toggleLike: builder.mutation<{ liked: boolean; likes: number }, string>({
      query: (episodeId) => ({
        url: `/${episodeId}/like`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, episodeId) => [{ type: 'Podcast', id: episodeId }],
    }),
  }),
})

export const {
  useGetEpisodesQuery,
  useGetEpisodeQuery,
  useGetFeaturedEpisodesQuery,
  useGetRecentEpisodesQuery,
  useGetPopularEpisodesQuery,
  useSearchEpisodesQuery,
  useToggleLikeMutation,
} = podcastApi 