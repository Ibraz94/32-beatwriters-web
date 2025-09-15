import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { User } from '../features/authSlice'
import { API_CONFIG, buildApiUrl } from '../config/api'

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
  message: string
  user: User
  token: string
  refreshToken?: string
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

interface GoogleLoginRequest {
  email: string
  googleId: string
  firstName?: string
  lastName?: string
  profilePicture?: string
}

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({
    baseUrl: buildApiUrl(API_CONFIG.ENDPOINTS.AUTH),
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
    login: builder.mutation<AuthResponse, { emailOrUsername: string; password: string }>({ 
      query: ({ emailOrUsername, password }) => {
        // Detect if input is email or username
        const isEmail = /\S+@\S+\.\S+/.test(emailOrUsername)
        
        const body = isEmail 
          ? { email: emailOrUsername, password }
          : { username: emailOrUsername, password }
        
        return {
        url: '/login',
        method: 'POST',
          body,
        }
      },
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
        url: '/password',
        method: 'PATCH',
        body: data,
      }),
    }),

    // Google OAuth login
    googleLogin: builder.mutation<AuthResponse, GoogleLoginRequest>({
      query: (data) => ({
        url: buildApiUrl('/api/auth/google/login'),
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['User', 'Auth'],
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
  useGoogleLoginMutation,
} = authApi 