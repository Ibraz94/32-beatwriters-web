import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api'

export interface Article {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  featuredImage?: string
  author: {
    id: string
    name: string
    avatar?: string
    bio?: string
  }
  category: string
  tags: string[]
  status: 'draft' | 'published' | 'archived'
  publishedAt?: string
  readTime: number
  views: number
  likes: number
  comments: number
  isPremium: boolean
  seoTitle?: string
  seoDescription?: string
  seoKeywords?: string[]
  createdAt: string
  updatedAt: string
}

interface ArticlesResponse {
  articles: Article[]
  total: number
  page: number
  limit: number
  totalPages: number
}

interface ArticleFilters {
  category?: string
  author?: string
  status?: 'draft' | 'published' | 'archived'
  isPremium?: boolean
  tags?: string[]
  search?: string
  page?: number
  limit?: number
  sortBy?: 'publishedAt' | 'views' | 'likes' | 'title'
  sortOrder?: 'asc' | 'desc'
}

interface CreateArticleRequest {
  title: string
  excerpt: string
  content: string
  featuredImage?: string
  category: string
  tags: string[]
  status: 'draft' | 'published'
  isPremium?: boolean
  seoTitle?: string
  seoDescription?: string
  seoKeywords?: string[]
}

export const articlesApi = createApi({
  reducerPath: 'articlesApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_BASE_URL}/articles`,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as any).auth.token
      if (token) {
        headers.set('authorization', `Bearer ${token}`)
      }
      headers.set('content-type', 'application/json')
      return headers
    },
  }),
  tagTypes: ['Article', 'Category'],
  endpoints: (builder) => ({
    // Get all articles with filtering and pagination
    getArticles: builder.query<ArticlesResponse, ArticleFilters>({
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
      providesTags: ['Article'],
    }),
    
    // Get single article by ID or slug
    getArticle: builder.query<{ article: Article }, string>({
      query: (idOrSlug) => `/${idOrSlug}`,
      providesTags: (result, error, idOrSlug) => [{ type: 'Article', id: idOrSlug }],
    }),
    
    // Create new article
    createArticle: builder.mutation<{ article: Article; message: string }, CreateArticleRequest>({
      query: (articleData) => ({
        url: '',
        method: 'POST',
        body: articleData,
      }),
      invalidatesTags: ['Article'],
    }),
    
    // Update article
    updateArticle: builder.mutation<{ article: Article; message: string }, { id: string; data: Partial<CreateArticleRequest> }>({
      query: ({ id, data }) => ({
        url: `/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Article', id }, 'Article'],
    }),
    
    // Delete article
    deleteArticle: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Article', id }, 'Article'],
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
    
    // Get article categories
    getCategories: builder.query<{ categories: string[] }, void>({
      query: () => '/categories',
      providesTags: ['Category'],
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
  }),
})

export const {
  useGetArticlesQuery,
  useGetArticleQuery,
  useCreateArticleMutation,
  useUpdateArticleMutation,
  useDeleteArticleMutation,
  useGetFeaturedArticlesQuery,
  useGetPopularArticlesQuery,
  useGetRecentArticlesQuery,
  useGetArticlesByCategoryQuery,
  useGetArticlesByAuthorQuery,
  useSearchArticlesQuery,
  useToggleLikeMutation,
  useGetCategoriesQuery,
  useGetPopularTagsQuery,
  useGetRelatedArticlesQuery,
} = articlesApi 