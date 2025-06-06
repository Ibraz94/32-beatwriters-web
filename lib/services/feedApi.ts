import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api'

export interface Feed {
  id: string
  title: string
  content: string
  category: string
  tags: string[]
  isPremium: boolean
  isPublished: boolean
  order: number
  createdAt: string
  updatedAt: string
}

interface FeedsResponse {
  feeds: Feed[]
  total: number
  page: number
  limit: number
  totalPages: number
}

interface FeedFilters {
  category?: string
  tags?: string[]
  search?: string
  isPublished?: boolean
  page?: number
  limit?: number
  sortBy?: 'order' | 'views' | 'helpful' | 'createdAt'
  sortOrder?: 'asc' | 'desc'
}

export const feedsApi = createApi({
  reducerPath: 'feedsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_BASE_URL}/feeds`,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as any).auth.token
      if (token) {
        headers.set('authorization', `Bearer ${token}`)
      }
      headers.set('content-type', 'application/json')
      return headers
    },
  }),
  tagTypes: ['Feed'],
  endpoints: (builder) => ({
    getFeeds: builder.query<FeedsResponse, FeedFilters>({
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
      providesTags: ['Feed'],
    }),
    
    getFeed: builder.query<{ feed: Feed }, string>({
      query: (id) => `/${id}`,
      providesTags: (result, error, id) => [{ type: 'Feed', id }],
    }),
    
    createFeed: builder.mutation<{ feed: Feed; message: string }, Omit<Feed, 'id' | 'createdAt' | 'updatedAt'>>({
      query: (feedData) => ({
        url: '',
        method: 'POST',
        body: feedData,
      }),
      invalidatesTags: ['Feed'],
    }),
    
    updateFeed: builder.mutation<{ feed: Feed; message: string }, { id: string; data: Partial<Feed> }>({
      query: ({ id, data }) => ({
        url: `/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Feed', id }, 'Feed'],
    }),
    
    deleteFeed: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Feed', id }, 'Feed'],
    }),
    
    getFeedsByCategory: builder.query<{ feeds: Feed[] }, string>({
      query: (category) => `/category/${encodeURIComponent(category)}`,
      providesTags: ['Feed'],
    }),
    
    searchFeeds: builder.query<{ feeds: Feed[] }, string>({
      query: (searchTerm) => `/search?q=${encodeURIComponent(searchTerm)}`,
      providesTags: ['Feed'],
    }),
    
    getFAQCategories: builder.query<{ categories: string[] }, void>({
      query: () => '/categories',
      providesTags: ['Feed'],
    }),
    
    markHelpful: builder.mutation<{ helpful: number; notHelpful: number }, { id: string; isHelpful: boolean }>({
      query: ({ id, isHelpful }) => ({
        url: `/${id}/helpful`,
        method: 'POST',
        body: { isHelpful },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Feed', id }],
    }),
  }),
})

export const {
  useGetFeedsQuery,
  useGetFeedQuery,
  useCreateFeedMutation,
  useUpdateFeedMutation,
  useDeleteFeedMutation,
  useGetFeedsByCategoryQuery,
  useSearchFeedsQuery,
  useMarkHelpfulMutation,
} = feedsApi 