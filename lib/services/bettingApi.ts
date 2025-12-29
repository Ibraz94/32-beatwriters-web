import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { API_CONFIG, buildApiUrl } from '../config/api'

export interface BetPlayer {
  id: number
  name: string
  team: string
  position: string
  headshotPic: string
  teamDetails?: {
    name: string
    logo: string
    abbreviation: string
    teamColor: string
  }
}

export interface Bet {
  id: string
  betType?: string
  category?: string
  line?: string
  odds?: string
  totalWager?: string
  analysis?: string
  isBestBet: boolean
  isFastDraft: boolean
  isPinned: boolean
  signupLink?: string
  depositInfo?: string
  week?: string
  date?: Date
  result?: 'WIN' | 'LOSS' | null
  createdAt: Date
  updatedAt: Date
  player?: BetPlayer  // Keep for backward compatibility
  betPlayers?: Array<{
    playerId: number
    category?: string
    line?: string
    player: BetPlayer
  }>
}

export interface BetsResponse {
  success: boolean
  data: {
    bets: Bet[]
    pagination: {
      total: number
      page: number
      limit: number
      totalPages: number
    }
  }
}

export interface BetTypesResponse {
  success: boolean
  data: {
    betTypes: string[]
  }
}

export interface CategoriesResponse {
  success: boolean
  data: {
    categories: string[]
  }
}

export interface SingleBetResponse {
  success: boolean
  data: Bet
}

interface BetFilters {
  page?: number
  limit?: number
  week?: string
  result?: 'WIN' | 'LOSS' | null
  isBestBet?: boolean
  isFastDraft?: boolean
  category?: string
  betType?: string
}

export const bettingApi = createApi({
  reducerPath: 'bettingApi',
  baseQuery: fetchBaseQuery({
   baseUrl: buildApiUrl(API_CONFIG.ENDPOINTS.BETTING),
  }),
  tagTypes: ['Bet'],
  endpoints: (builder) => ({
    getBets: builder.query<BetsResponse, BetFilters>({
      query: (filters) => {
        const params = new URLSearchParams()
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            params.append(key, value.toString())
          }
        })
        return `/bets?${params.toString()}`
      },
      providesTags: ['Bet'],
    }),

    getBetsByWeek: builder.query<BetsResponse, { week: string; filters?: Omit<BetFilters, 'week'> }>({
      query: ({ week, filters = {} }) => {
        const params = new URLSearchParams()
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            params.append(key, value.toString())
          }
        })
        const queryString = params.toString()
        return `/bets/week/${encodeURIComponent(week)}${queryString ? `?${queryString}` : ''}`
      },
      providesTags: ['Bet'],
    }),

    getBet: builder.query<SingleBetResponse, string>({
      query: (id) => `/bets/${id}`,
      providesTags: ['Bet'],
    }),

    getBetTypes: builder.query<BetTypesResponse, void>({
      query: () => '/bet-types',
    }),

    getCategories: builder.query<CategoriesResponse, void>({
      query: () => '/categories',
    }),
  }),
})

export const {
  useGetBetsQuery,
  useGetBetsByWeekQuery,
  useGetBetQuery,
  useGetBetTypesQuery,
  useGetCategoriesQuery,
} = bettingApi
