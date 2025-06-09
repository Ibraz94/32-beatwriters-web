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
    
  }),
})

export const {
  useSubmitContactMutation,
  useSubscribeNewsletterMutation,
  useUnsubscribeNewsletterMutation,
} = contactApi 