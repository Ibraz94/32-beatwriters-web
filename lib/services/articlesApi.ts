import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { API_CONFIG, buildApiUrl } from '../config/api'
const IMAGE_BASE_URL = process.env.NEXT_PUBLIC_IMAGE_BASE_URL || 'http://localhost:4004'

// Helper function to construct full image URLs
export const getImageUrl = (imagePath?: string): string | undefined => {
  if (!imagePath) return undefined
  
  // If the path already includes the full URL, return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath
  }
  
  // Handle paths that start with a slash - append directly to base URL
  if (imagePath.startsWith('/')) {
    return `${IMAGE_BASE_URL}/${imagePath}`
  } 
  
  // Handle relative paths - add a slash between base URL and path
  return `${imagePath}`
}

export interface Article {
  id: string
  title: string
  slug: string
  content: string
  status: 'draft' | 'published' | 'archived'
  featuredImage?: string
  authorId: {
    id: string
    name: string
    avatar?: string
    bio?: string
  }
  authorName?: string
  playerTags: string[]
  teamTags: string[]
  beatWriterTags: string[]
  publishedAt?: string
  modifiedAt?: string
  createdAt: string
  updatedAt: string
  access: 'public' | 'pro' | 'lifetime' | 'pro,lifetime'
}

interface ArticlesResponse {
  data: {
  articles: Article[]
  total: number
    page: number
    limit: number
    totalPages: number
  }
}

interface ArticleFilters {
  category?: string
  author?: string
  status?: 'draft' | 'published' | 'archived' | 'futurearticle'
  access?: 'public' | 'pro' | 'lifetime'
  tags?: string[]
  search?: string
  page?: number
  limit?: number
  sortBy?: 'publishedAt' | 'views' | 'likes' | 'title'
  sortOrder?: 'asc' | 'desc'
}


export const articlesApi = createApi({
  reducerPath: 'articlesApi',
  baseQuery: async (args, api, extraOptions) => {
    try {
      const result = await fetchBaseQuery({
        baseUrl: buildApiUrl(API_CONFIG.ENDPOINTS.ARTICLES),
        prepareHeaders: (headers, { getState }) => {
          const token = (getState() as any).auth.token
          if (token) {
            headers.set('authorization', `Bearer ${token}`)
          }
          headers.set('content-type', 'application/json')
          return headers
        },
      })(args, api, extraOptions)

      // Log the response for debugging
      console.log('API Response:', {
        url: args.url,
        method: args.method || 'GET',
        status: result.data ? 'success' : 'error',
        data: result.data,
        error: result.error,
      })

      if (result.error) {
        // Handle specific error cases
        if (result.error.status === 404) {
          return { error: { status: 404, data: 'Article not found' } }
        }
        if (result.error.status === 500) {
          return { error: { status: 500, data: 'Server error' } }
        }
        if (result.error.status === 401) {
          return { error: { status: 401, data: 'Unauthorized' } }
        }
        if (result.error.status === 403) {
          return { error: { status: 403, data: 'Forbidden' } }
        }
      }

      return result
    } catch (error) {
      console.error('API Error:', error)
      return { error: { status: 'CUSTOM_ERROR', data: 'Failed to fetch article' } }
    }
  },
 
  tagTypes: ['Article', 'Category'],
  endpoints: (builder) => ({
    // Get all articles with filtering and pagination
    getArticles: builder.query<ArticlesResponse, ArticleFilters>({
      query: (filters) => {
        try {
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
        } catch (error) {
          console.error('Error building query params:', error)
          return ''
        }
      },
      providesTags: ['Article'],
      // Add error handling for the query
      async onQueryStarted(_, { queryFulfilled }) {
        try {
          await queryFulfilled
        } catch (error) {
          console.error('Articles query failed:', error)
        }
      },
    }),
    
    // Get single article by slug
    getArticle: builder.query<Article, string>({
      query: (slug) => {
        if (!slug) {
          throw new Error('Article slug is required')
        }
        return `/${slug}`
      },
      providesTags: (result, error, slug) => [{ type: 'Article', id: slug }],
      // Add error handling for the query
      async onQueryStarted(_, { queryFulfilled }) {
        try {
          await queryFulfilled
        } catch (error) {
          console.error('Article query failed:', error)
        }
      },
    }),
    
    // Get featured articles
    getFeaturedArticles: builder.query<{ articles: Article[] }, { limit?: number }>({
      query: ({ limit = 5 }) => `/featured?limit=${limit}`,
      providesTags: ['Article'],
    }),
    
    // Get popular articles
    getPopularArticles: builder.query<{ articles: Article[] }, { limit?: number; timeframe?: 'week' | 'month' | 'all' }>({
      query: ({ limit = 10, timeframe = 'week' }) => `/popular?limit=${limit}&timeframe=${timeframe}`,
      providesTags: ['Article'],
    }),
    
    // Get recent articles
    getRecentArticles: builder.query<{ articles: Article[] }, { limit?: number }>({
      query: ({ limit = 10 }) => `/recent?limit=${limit}`,
      providesTags: ['Article'],
    }),
    
    // Get articles by category
    getArticlesByCategory: builder.query<ArticlesResponse, { category: string; page?: number; limit?: number }>({
      query: ({ category, page = 1, limit = 10 }) => `/category/${encodeURIComponent(category)}?page=${page}&limit=${limit}`,
      providesTags: ['Article'],
    }),
    
    // Get articles by author
    getArticlesByAuthor: builder.query<ArticlesResponse, { authorId: string; page?: number; limit?: number }>({
      query: ({ authorId, page = 1, limit = 10 }) => `/author/${authorId}?page=${page}&limit=${limit}`,
      providesTags: ['Article'],
    }),
    
    // Search articles
    searchArticles: builder.query<{ articles: Article[] }, string>({
      query: (searchTerm) => `/search?q=${encodeURIComponent(searchTerm)}`,
      providesTags: ['Article'],
    }),
    
    // Like/Unlike article
    toggleLike: builder.mutation<{ liked: boolean; likes: number }, string>({
      query: (articleId) => ({
        url: `/${articleId}/like`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, articleId) => [{ type: 'Article', id: articleId }],
    }),
    
    // Get popular tags
    getPopularTags: builder.query<{ tags: { name: string; count: number }[] }, { limit?: number }>({
      query: ({ limit = 20 }) => `/tags/popular?limit=${limit}`,
      providesTags: ['Article'],
    }),
    
    // Get related articles
    getRelatedArticles: builder.query<{ articles: Article[] }, { articleId: string; limit?: number }>({
      query: ({ articleId, limit = 5 }) => `/${articleId}/related?limit=${limit}`,
      providesTags: ['Article'],
    }),
    
    // Upload image for articles
    uploadImage: builder.mutation<{ url: string; filename: string }, FormData>({
      query: (formData) => ({
        url: '/upload-image',
        method: 'POST',
        body: formData,
      }),
    }),
  }),
})


export const {
  useGetArticlesQuery,
  useGetArticleQuery,
  useGetFeaturedArticlesQuery,
  useGetPopularArticlesQuery,
  useGetRecentArticlesQuery,
  useGetArticlesByCategoryQuery,
  useGetArticlesByAuthorQuery,
  useSearchArticlesQuery,
  useToggleLikeMutation,
  useGetPopularTagsQuery,
  useGetRelatedArticlesQuery,
  useUploadImageMutation,
} = articlesApi 