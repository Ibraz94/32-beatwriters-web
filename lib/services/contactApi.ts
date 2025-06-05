import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api'

export interface ContactMessage {
  id: string
  name: string
  email: string
  subject: string
  message: string
  type: 'general' | 'support' | 'business' | 'feedback' | 'bug_report'
  status: 'new' | 'in_progress' | 'resolved' | 'closed'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  userId?: string
  assignedTo?: string
  response?: string
  respondedAt?: string
  createdAt: string
  updatedAt: string
}

interface ContactRequest {
  name: string
  email: string
  subject: string
  message: string
  type: 'general' | 'support' | 'business' | 'feedback' | 'bug_report'
  phone?: string
  company?: string
}

interface ContactResponse {
  messages: ContactMessage[]
  total: number
  page: number
  limit: number
  totalPages: number
}

interface ContactFilters {
  type?: 'general' | 'support' | 'business' | 'feedback' | 'bug_report'
  status?: 'new' | 'in_progress' | 'resolved' | 'closed'
  priority?: 'low' | 'medium' | 'high' | 'urgent'
  search?: string
  page?: number
  limit?: number
  sortBy?: 'createdAt' | 'updatedAt' | 'priority'
  sortOrder?: 'asc' | 'desc'
}

export const contactApi = createApi({
  reducerPath: 'contactApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_BASE_URL}/contact`,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as any).auth.token
      if (token) {
        headers.set('authorization', `Bearer ${token}`)
      }
      headers.set('content-type', 'application/json')
      return headers
    },
  }),
  tagTypes: ['Contact'],
  endpoints: (builder) => ({
    // Submit contact form
    submitContact: builder.mutation<{ message: string; id: string }, ContactRequest>({
      query: (data) => ({
        url: '/submit',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Contact'],
    }),
    
    // Get all contact messages (admin only)
    getContactMessages: builder.query<ContactResponse, ContactFilters>({
      query: (filters) => {
        const params = new URLSearchParams()
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined) {
            params.append(key, value.toString())
          }
        })
        return `?${params.toString()}`
      },
      providesTags: ['Contact'],
    }),
    
    // Get single contact message (admin only)
    getContactMessage: builder.query<{ message: ContactMessage }, string>({
      query: (id) => `/${id}`,
      providesTags: (result, error, id) => [{ type: 'Contact', id }],
    }),
    
    // Update contact message status (admin only)
    updateContactStatus: builder.mutation<{ message: ContactMessage }, { id: string; status: ContactMessage['status']; priority?: ContactMessage['priority'] }>({
      query: ({ id, status, priority }) => ({
        url: `/${id}/status`,
        method: 'PUT',
        body: { status, priority },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Contact', id }, 'Contact'],
    }),
    
    // Respond to contact message (admin only)
    respondToContact: builder.mutation<{ message: ContactMessage }, { id: string; response: string }>({
      query: ({ id, response }) => ({
        url: `/${id}/respond`,
        method: 'POST',
        body: { response },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Contact', id }, 'Contact'],
    }),
    
    // Delete contact message (admin only)
    deleteContactMessage: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Contact', id }, 'Contact'],
    }),
    
    // Get user's contact messages
    getUserContactMessages: builder.query<{ messages: ContactMessage[] }, void>({
      query: () => '/my-messages',
      providesTags: ['Contact'],
    }),
    
    // Get contact statistics (admin only)
    getContactStats: builder.query<{ stats: any }, { period?: 'week' | 'month' | 'year' }>({
      query: ({ period = 'month' }) => `/stats?period=${period}`,
      providesTags: ['Contact'],
    }),
    
    // Subscribe to newsletter
    subscribeNewsletter: builder.mutation<{ message: string }, { email: string; interests?: string[] }>({
      query: (data) => ({
        url: '/newsletter/subscribe',
        method: 'POST',
        body: data,
      }),
    }),
    
    // Unsubscribe from newsletter
    unsubscribeNewsletter: builder.mutation<{ message: string }, { email: string; token?: string }>({
      query: (data) => ({
        url: '/newsletter/unsubscribe',
        method: 'POST',
        body: data,
      }),
    }),
    
    // Get newsletter preferences
    getNewsletterPreferences: builder.query<{ preferences: any }, void>({
      query: () => '/newsletter/preferences',
    }),
    
    // Update newsletter preferences
    updateNewsletterPreferences: builder.mutation<{ message: string }, { interests: string[]; frequency: 'daily' | 'weekly' | 'monthly' }>({
      query: (data) => ({
        url: '/newsletter/preferences',
        method: 'PUT',
        body: data,
      }),
    }),
  }),
})

export const {
  useSubmitContactMutation,
  useGetContactMessagesQuery,
  useGetContactMessageQuery,
  useUpdateContactStatusMutation,
  useRespondToContactMutation,
  useDeleteContactMessageMutation,
  useGetUserContactMessagesQuery,
  useGetContactStatsQuery,
  useSubscribeNewsletterMutation,
  useUnsubscribeNewsletterMutation,
  useGetNewsletterPreferencesQuery,
  useUpdateNewsletterPreferencesMutation,
} = contactApi 