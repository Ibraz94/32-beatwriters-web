import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.32beatwriters.staging.pegasync.com/api'
const IMAGE_BASE_URL = process.env.NEXT_PUBLIC_IMAGE_BASE_URL || 'https://api.32beatwriters.staging.pegasync.com'

export interface PodcastData {
  id: number
  title: string
  description: string
  thumbnail: string
  duration: string
  hostedBy: string
  spotifyLink: string
  podcastTime: string
  createdAt: string
  updatedAt: string
  status: string
}

export interface ApiResponse {
  podcasts: PodcastData[]
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

interface PodcastResponse {
  episodes: PodcastData[]
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

// Helper function to construct full image URLs
export const getImageUrl = (imagePath?: string): string | undefined => {
  if (!imagePath) return undefined
  
  // If the path already includes the full URL, return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath
  }
  
  // Handle paths that already start with /uploads
  if (imagePath.startsWith('/uploads/podcasts')) {
    return `${IMAGE_BASE_URL}${imagePath}`
  }
  
  // Handle paths that don't start with /uploads
  if (imagePath.startsWith('/')) {
    return `${IMAGE_BASE_URL}/uploads/podcasts${imagePath}`
  }
  
  // Handle relative paths
  return `${IMAGE_BASE_URL}/uploads/podcasts/${imagePath}`
}

export const podcastApi = createApi({
  reducerPath: 'podcastApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_BASE_URL}/podcasts`,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as any).auth.token
      if (token) {
        headers.set('authorization', `Bearer ${token}`)
      }
      headers.set('content-type', 'application/json')
      return headers
    },
  }),
  tagTypes: ['Podcasts'],
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
      providesTags: ['Podcasts'],
    }),
    
    getEpisode: builder.query<{ podcast: PodcastData }, number>({
      query: (id) => `/${id}`,
      providesTags: (result, error, id) => [{ type: 'Podcasts', id }],
    }),
    
    getFeaturedEpisodes: builder.query<{ episodes: PodcastData[] }, { limit?: number }>({
      query: ({ limit = 5 }) => `/featured?limit=${limit}`,
      providesTags: ['Podcasts'],
    }),
    
    getRecentEpisodes: builder.query<{ episodes: PodcastData[] }, { limit?: number }>({
      query: ({ limit = 10 }) => `/recent?limit=${limit}`,
      providesTags: ['Podcasts'],
    }),
    
    getPopularEpisodes: builder.query<{ episodes: PodcastData[] }, { limit?: number; timeframe?: 'week' | 'month' | 'all' }>({
      query: ({ limit = 10, timeframe = 'week' }) => `/popular?limit=${limit}&timeframe=${timeframe}`,
      providesTags: ['Podcasts'],
    }),
    
    searchEpisodes: builder.query<{ episodes: PodcastData[] }, string>({
      query: (searchTerm) => `/search?q=${encodeURIComponent(searchTerm)}`,
      providesTags: ['Podcasts'],
    }),

    getImageUrl:builder.mutation<{ url: string; filename: string }, FormData>({
      query: (formData) => ({
        url: '/upload-image',
        method: 'POST',
        body: formData,
      }),
    }),
    
    toggleLike: builder.mutation<{ liked: boolean; likes: number }, number>({
      query: (episodeId) => ({
        url: `/${episodeId}/like`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, episodeId) => [{ type: 'Podcasts', id: episodeId }],
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
  useGetImageUrlMutation,
} = podcastApi 










