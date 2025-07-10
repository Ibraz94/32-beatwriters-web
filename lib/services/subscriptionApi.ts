import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { API_CONFIG, buildApiUrl } from '../config/api'

export interface SubscriptionPlan {
  id: string
  name: string
  description: string
  price: number
  billingPeriod: 'monthly' | 'annually'
  features: string[]
  isPopular: boolean
  isActive: boolean
  stripePriceId?: string
  createdAt: string
  updatedAt: string
}

export interface Subscription {
  id: string
  userId: string
  planId: string
  plan: SubscriptionPlan
  status: 'active' | 'inactive' | 'canceled' | 'past_due' | 'trialing'
  currentPeriodStart: string
  currentPeriodEnd: string
  cancelAtPeriodEnd: boolean
  trialEnd?: string
  stripeSubscriptionId?: string
  stripeCustomerId?: string
  createdAt: string
  updatedAt: string
}

interface CreateSubscriptionRequest {
  planId: string
  paymentMethodId?: string
  couponCode?: string
}

interface UpdateSubscriptionRequest {
  planId?: string
  cancelAtPeriodEnd?: boolean
}

export const subscriptionApi = createApi({
  reducerPath: 'subscriptionApi',
  baseQuery: fetchBaseQuery({
    baseUrl: buildApiUrl(API_CONFIG.ENDPOINTS.SUBSCRIPTION),
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as any).auth.token
      if (token) {
        headers.set('authorization', `Bearer ${token}`)
      }
      headers.set('content-type', 'application/json')
      return headers
    },
  }),
  tagTypes: ['Subscription', 'Plan'],
  endpoints: (builder) => ({
    // Get all available plans
    getPlans: builder.query<{ plans: SubscriptionPlan[] }, void>({
      query: () => '/plans',
      providesTags: ['Plan'],
    }),
    
    // Get specific plan
    getPlan: builder.query<{ plan: SubscriptionPlan }, string>({
      query: (planId) => `/plans/${planId}`,
      providesTags: (result, error, planId) => [{ type: 'Plan', id: planId }],
    }),
    
    // Get current user's subscription
    getCurrentSubscription: builder.query<{ subscription: Subscription | null }, void>({
      query: () => '/current',
      providesTags: ['Subscription'],
    }),
    
    // Create new subscription
    createSubscription: builder.mutation<{ subscription: Subscription; clientSecret?: string }, CreateSubscriptionRequest>({
      query: (data) => ({
        url: '/create',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Subscription'],
    }),
    
    // Update subscription
    updateSubscription: builder.mutation<{ subscription: Subscription; message: string }, UpdateSubscriptionRequest>({
      query: (data) => ({
        url: '/update',
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Subscription'],
    }),
    
    // Cancel subscription
    cancelSubscription: builder.mutation<{ message: string }, { immediately?: boolean }>({
      query: ({ immediately = false }) => ({
        url: '/cancel',
        method: 'POST',
        body: { immediately },
      }),
      invalidatesTags: ['Subscription'],
    }),
    
    // Resume subscription
    resumeSubscription: builder.mutation<{ subscription: Subscription; message: string }, void>({
      query: () => ({
        url: '/resume',
        method: 'POST',
      }),
      invalidatesTags: ['Subscription'],
    }),
    
    // Get subscription history
    getSubscriptionHistory: builder.query<{ subscriptions: Subscription[] }, void>({
      query: () => '/history',
      providesTags: ['Subscription'],
    }),
    
    // Get billing information
    getBillingInfo: builder.query<{ billingInfo: any }, void>({
      query: () => '/billing',
      providesTags: ['Subscription'],
    }),
    
    // Update billing information
    updateBillingInfo: builder.mutation<{ message: string }, { paymentMethodId: string }>({
      query: (data) => ({
        url: '/billing',
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Subscription'],
    }),
    
    // Get invoices
    getInvoices: builder.query<{ invoices: any[] }, { limit?: number }>({
      query: ({ limit = 10 }) => `/invoices?limit=${limit}`,
      providesTags: ['Subscription'],
    }),
    
    // Download invoice
    downloadInvoice: builder.mutation<{ invoiceUrl: string }, string>({
      query: (invoiceId) => ({
        url: `/invoices/${invoiceId}/download`,
        method: 'POST',
      }),
    }),
    
    // Apply coupon
    applyCoupon: builder.mutation<{ discount: any; message: string }, { couponCode: string }>({
      query: (data) => ({
        url: '/coupon/apply',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Subscription'],
    }),
    
    // Remove coupon
    removeCoupon: builder.mutation<{ message: string }, void>({
      query: () => ({
        url: '/coupon/remove',
        method: 'DELETE',
      }),
      invalidatesTags: ['Subscription'],
    }),
    
    // Preview plan change
    previewPlanChange: builder.query<{ preview: any }, string>({
      query: (planId) => `/preview-change/${planId}`,
    }),
    
    // Get usage stats (for metered billing if applicable)
    getUsageStats: builder.query<{ usage: any }, { period?: string }>({
      query: ({ period = 'current' }) => `/usage?period=${period}`,
      providesTags: ['Subscription'],
    }),
    
    // Create customer portal session
    createPortalSession: builder.mutation<{ portalUrl: string }, { returnUrl?: string }>({
      query: ({ returnUrl }) => ({
        url: '/portal',
        method: 'POST',
        body: { returnUrl },
      }),
    }),
  }),
})

export const {
  useGetPlansQuery,
  useGetPlanQuery,
  useGetCurrentSubscriptionQuery,
  useCreateSubscriptionMutation,
  useUpdateSubscriptionMutation,
  useCancelSubscriptionMutation,
  useResumeSubscriptionMutation,
  useGetSubscriptionHistoryQuery,
  useGetBillingInfoQuery,
  useUpdateBillingInfoMutation,
  useGetInvoicesQuery,
  useDownloadInvoiceMutation,
  useApplyCouponMutation,
  useRemoveCouponMutation,
  usePreviewPlanChangeQuery,
  useGetUsageStatsQuery,
  useCreatePortalSessionMutation,
} = subscriptionApi 