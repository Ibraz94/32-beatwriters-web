import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface User {
  id: string
  humanId: number
  username: string
  email: string
  firstName?: string
  lastName?: string
  address1?: string
  address2?: string
  city?: string
  state?: string
  zipCode?: string
  country?: string
  phoneNumber?: string
  profilePicture?: string
  bio?: string
  lastLogin?: string
  loginCount?: number
  activationKey?: string
  roleId: number
  membershipId: number
  createdAt: string
  updatedAt: string
  stripeCustomerId: string
  stripeSubscriptionId: string
  subscriptionStatus: string
  subscriptionEndDate: string
  roles: {
    id: number
    name: string
    description: string
    createdAt: string
    updatedAt: string
  }
  memberships: {
    id: number
    type: '' | 'pro' | 'lifetime' 
    description: string
    price: number
    features: string[]
    createdAt: string
    updatedAt: string
    stripePriceId: string
    stripeProductId: string
  }
  role: 'Administrator' | 'Editor' | 'Author' | 'Subscriber'
  membership: 'free' | 'premium' | 'pro'
  isAdmin: boolean
}

interface AuthState {
  user: User | null
  token: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

const initialState: AuthState = {
  user: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.isLoading = true
      state.error = null
    },
    loginSuccess: (state, action: PayloadAction<{ user: User; token: string; refreshToken?: string }>) => {
      state.isLoading = false
      state.user = action.payload.user
      state.token = action.payload.token
      state.refreshToken = action.payload.refreshToken || null
      state.isAuthenticated = true
      state.error = null
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false
      state.error = action.payload
      state.isAuthenticated = false
    },
    logout: (state) => {
      state.user = null
      state.token = null
      state.refreshToken = null
      state.isAuthenticated = false
      state.isLoading = false
      state.error = null
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload }
      }
    },
    updateSubscription: (state, action: PayloadAction<User['memberships']>) => {
      if (state.user) {
        state.user.memberships = action.payload
      }
    },
    clearError: (state) => {
      state.error = null
    },
    setToken: (state, action: PayloadAction<{ token: string; refreshToken?: string }>) => {
      state.token = action.payload.token
      if (action.payload.refreshToken) {
        state.refreshToken = action.payload.refreshToken
      }
    },
  },
})

export const {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
  updateUser,
  updateSubscription,
  clearError,
  setToken,
} = authSlice.actions

export default authSlice.reducer

// Selectors
export const selectAuth = (state: { auth: AuthState }) => state.auth
export const selectUser = (state: { auth: AuthState }) => state.auth.user
export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.isAuthenticated
export const selectIsLoading = (state: { auth: AuthState }) => state.auth.isLoading
export const selectAuthError = (state: { auth: AuthState }) => state.auth.error
export const selectToken = (state: { auth: AuthState }) => state.auth.token 