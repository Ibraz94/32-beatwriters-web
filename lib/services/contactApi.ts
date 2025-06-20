import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.32beatwriters.staging.pegasync.com/api'

export interface ContactMessage {
  id: string
  name: string
  email: string
  subject: "General Question" | "Subscription" | "Podcast" | "Partner with us"
  message: string
}

export interface ContactRequest {
  name: string
  email: string
  subject: "General Question" | "Subscription" | "Podcast" | "Partner with us"
  message: string
}


export const contactApi = createApi({
  reducerPath: 'contactApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_BASE_URL}/contact`,
    prepareHeaders: (headers) => {
      headers.set('content-type', 'application/json')
      return headers
    },
  }),
  tagTypes: ['Contact'],
  endpoints: (builder) => ({
    // Submit contact form
    submitContact: builder.mutation<ContactMessage, ContactRequest>({
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