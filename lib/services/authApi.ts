import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { User } from '../features/authSlice'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api'

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

interface ResetPasswordRequest {
  token: string
  password: string
  confirmPassword: string
}

interface UpdateProfileRequest {
  name?: string
  email?: string
  avatar?: string
}

interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_BASE_URL}/auth`,
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
    
    register: builder.mutation<AuthResponse, RegisterRequest>({
      query: (userData) => ({
        url: '/register',
        method: 'POST',
        body: userData,
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
    forgotPassword: builder.mutation<{ message: string }, ForgotPasswordRequest>({
      query: (data) => ({
        url: '/forgot-password',
        method: 'POST',
        body: data,
      }),
    }),
    
    resetPassword: builder.mutation<{ message: string }, ResetPasswordRequest>({
      query: (data) => ({
        url: '/reset-password',
        method: 'POST',
        body: data,
      }),
    }),
    
    changePassword: builder.mutation<{ message: string }, ChangePasswordRequest>({
      query: (data) => ({
        url: '/change-password',
        method: 'PUT',
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
    
    deleteAccount: builder.mutation<{ message: string }, { password: string }>({
      query: (data) => ({
        url: '/delete-account',
        method: 'DELETE',
        body: data,
      }),
      invalidatesTags: ['User', 'Auth'],
    }),
    
    // Account verification
    verifyEmail: builder.mutation<{ message: string }, { token: string }>({
      query: ({ token }) => ({
        url: '/verify-email',
        method: 'POST',
        body: { token },
      }),
      invalidatesTags: ['User'],
    }),
    
    resendVerification: builder.mutation<{ message: string }, void>({
      query: () => ({
        url: '/resend-verification',
        method: 'POST',
      }),
    }),
  }),
})

export const {
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useRefreshTokenMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useChangePasswordMutation,
  useGetProfileQuery,
  useUpdateProfileMutation,
  useDeleteAccountMutation,
  useVerifyEmailMutation,
  useResendVerificationMutation,
} = authApi 