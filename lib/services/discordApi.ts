import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { buildApiUrl } from '../config/api'

export interface DiscordLoginUrlResponse {
  url: string
}

export interface DiscordStatusResponse {
  connected: boolean
  discordId?: string
  discordUsername?: string
}

export interface DiscordLinkResponse {
  success: boolean
  message: string
  discordUsername?: string
}

export const discordApi = createApi({
  reducerPath: 'discordApi',
  baseQuery: fetchBaseQuery({
    baseUrl: buildApiUrl(''),
    prepareHeaders: (headers, { getState }) => {
      // Get token from auth state
      const token = (getState() as any)?.auth?.token
      if (token) {
        headers.set('authorization', `Bearer ${token}`)
      }
      return headers
    },
  }),
  tagTypes: ['Discord'],
  endpoints: (builder) => ({
    getDiscordLoginUrl: builder.query<DiscordLoginUrlResponse, void>({
      query: () => '/api/discord/login-url',
      providesTags: ['Discord'],
    }),
    
    getDiscordStatus: builder.query<DiscordStatusResponse, void>({
      query: () => '/api/discord/status',
      providesTags: ['Discord'],
    }),
    
    linkDiscordAccount: builder.mutation<DiscordLinkResponse, { code: string }>({
      query: ({ code }) => ({
        url: `/api/discord/link?code=${code}`,
        method: 'GET',
      }),
      invalidatesTags: ['Discord'],
    }),
  }),
})

export const {
  useGetDiscordLoginUrlQuery,
  useGetDiscordStatusQuery,
  useLinkDiscordAccountMutation,
} = discordApi 