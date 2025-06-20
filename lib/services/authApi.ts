import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { User } from '../features/authSlice'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.32beatwriters.staging.pegasync.com/api/users'

interface LoginRequest {
  email: string
  password: string
}

interface RegisterRequest {
  name: string
  email: string
  password: string
  confirmPassword: string
}

interface AuthResponse {
  user: User
  token: string
  refreshToken?: string
  message: string
}

interface ForgotPasswordRequest {
  email: string
}

interface OtpVerificationRequest {
  email: string
  otp: string
}

interface ResetPasswordRequest {
  email: string
  otp: string
  newPassword: string
  confirmPassword: string
}

interface UpdateProfileRequest {
  name?: string
  email?: string
  avatar?: string
}

interface UpdatePasswordRequest {
  currentPassword: string
  newPassword: string
}

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_BASE_URL}`,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as any).auth.token
      if (token) {
        headers.set('authorization', `Bearer ${token}`)
      }
      headers.set('content-type', 'application/json')
      return headers
    },
  }),
  tagTypes: ['User', 'Auth'],
  endpoints: (builder) => ({
    // Authentication endpoints
    login: builder.mutation<AuthResponse, LoginRequest>({ 
      query: (credentials) => ({
        url: '/login',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['User', 'Auth'],
    }),
    
    logout: builder.mutation<{ message: string }, void>({
      query: () => ({
        url: '/logout',
        method: 'POST',
      }),
      invalidatesTags: ['User', 'Auth'],
    }),
    
    refreshToken: builder.mutation<{ token: string; refreshToken?: string }, { refreshToken: string }>({
      query: ({ refreshToken }) => ({
        url: '/refresh-token',
        method: 'POST',
        body: { refreshToken },
      }),
    }),
    
    // Password management
    requestOtp: builder.mutation<{ message: string }, ForgotPasswordRequest>({
      query: (data) => ({
        url: '/forgot-password/request-otp',
        method: 'POST',
        body: data,
      }),
    }),
    
    verifyOtp: builder.mutation<{ message: string }, OtpVerificationRequest>({
      query: (data) => ({
        url: '/forgot-password/verify-otp',
        method: 'POST',
        body: data,
      }),
    }),
    
    resetPassword: builder.mutation<{ message: string }, ResetPasswordRequest>({
      query: (data) => ({
        url: '/forgot-password/reset',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),
    
    // User profile management
    getProfile: builder.query<{ user: User }, void>({
      query: () => '/profile',
      providesTags: ['User'],
    }),
    
    updateProfile: builder.mutation<{ user: User; message: string }, UpdateProfileRequest>({
      query: (data) => ({
        url: '/profile',
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),

    updatePassword: builder.mutation<{ message: string }, UpdatePasswordRequest>({
      query: (data) => ({
        url: '/profile/password',
        method: 'PUT',
        body: data,
      }),
    }),
  })
})


export const {
  useLoginMutation,
  useLogoutMutation,
  useRefreshTokenMutation,
  useRequestOtpMutation,
  useVerifyOtpMutation,
  useResetPasswordMutation,
  useGetProfileQuery,
  useUpdateProfileMutation,
  useUpdatePasswordMutation,
} = authApi 