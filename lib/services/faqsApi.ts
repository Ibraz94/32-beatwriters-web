import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api'

export interface FAQ {
  id: string
  question: string
  answer: string
  category: string
  tags: string[]
  isPublished: boolean
  order: number
  views: number
  helpful: number
  notHelpful: number
  createdAt: string
  updatedAt: string
}

interface FAQsResponse {
  faqs: FAQ[]
  total: number
  page: number
  limit: number
  totalPages: number
}

interface FAQFilters {
  category?: string
  tags?: string[]
  search?: string
  isPublished?: boolean
  page?: number
  limit?: number
  sortBy?: 'order' | 'views' | 'helpful' | 'createdAt'
  sortOrder?: 'asc' | 'desc'
}

export const faqsApi = createApi({
  reducerPath: 'faqsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_BASE_URL}/faqs`,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as any).auth.token
      if (token) {
        headers.set('authorization', `Bearer ${token}`)
      }
      headers.set('content-type', 'application/json')
      return headers
    },
  }),
  tagTypes: ['FAQ'],
  endpoints: (builder) => ({
    getFAQs: builder.query<FAQsResponse, FAQFilters>({
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
      providesTags: ['FAQ'],
    }),
    
    getFAQ: builder.query<{ faq: FAQ }, string>({
      query: (id) => `/${id}`,
      providesTags: (result, error, id) => [{ type: 'FAQ', id }],
    }),
    
    createFAQ: builder.mutation<{ faq: FAQ; message: string }, Omit<FAQ, 'id' | 'views' | 'helpful' | 'notHelpful' | 'createdAt' | 'updatedAt'>>({
      query: (faqData) => ({
        url: '',
        method: 'POST',
        body: faqData,
      }),
      invalidatesTags: ['FAQ'],
    }),
    
    updateFAQ: builder.mutation<{ faq: FAQ; message: string }, { id: string; data: Partial<FAQ> }>({
      query: ({ id, data }) => ({
        url: `/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'FAQ', id }, 'FAQ'],
    }),
    
    deleteFAQ: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'FAQ', id }, 'FAQ'],
    }),
    
    getFAQsByCategory: builder.query<{ faqs: FAQ[] }, string>({
      query: (category) => `/category/${encodeURIComponent(category)}`,
      providesTags: ['FAQ'],
    }),
    
    searchFAQs: builder.query<{ faqs: FAQ[] }, string>({
      query: (searchTerm) => `/search?q=${encodeURIComponent(searchTerm)}`,
      providesTags: ['FAQ'],
    }),
    
    getFAQCategories: builder.query<{ categories: string[] }, void>({
      query: () => '/categories',
      providesTags: ['FAQ'],
    }),
    
    markHelpful: builder.mutation<{ helpful: number; notHelpful: number }, { id: string; isHelpful: boolean }>({
      query: ({ id, isHelpful }) => ({
        url: `/${id}/helpful`,
        method: 'POST',
        body: { isHelpful },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'FAQ', id }],
    }),
  }),
})

export const {
  useGetFAQsQuery,
  useGetFAQQuery,
  useCreateFAQMutation,
  useUpdateFAQMutation,
  useDeleteFAQMutation,
  useGetFAQsByCategoryQuery,
  useSearchFAQsQuery,
  useGetFAQCategoriesQuery,
  useMarkHelpfulMutation,
} = faqsApi 