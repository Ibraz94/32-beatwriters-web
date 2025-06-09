import { store } from '../store'
import { loginSuccess, logout, setToken } from '../features/authSlice'
import type { User } from '../features/authSlice'

// Token storage keys
const TOKEN_KEY = 'auth_token'
const REFRESH_TOKEN_KEY = 'refresh_token'
const USER_KEY = 'user_data'

// Store token in localStorage or sessionStorage
export const setAuthTokens = (token: string, refreshToken?: string, persistent: boolean = true) => {
  const storage = persistent ? localStorage : sessionStorage
  storage.setItem(TOKEN_KEY, token)
  if (refreshToken) {
    storage.setItem(REFRESH_TOKEN_KEY, refreshToken)
  }
  
  // Update Redux state
  store.dispatch(setToken({ token, refreshToken }))
}

// Get token from localStorage or sessionStorage
export const getAuthToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY)
}

// Get refresh token from localStorage or sessionStorage
export const getRefreshToken = (): string | null => {
  return localStorage.getItem(REFRESH_TOKEN_KEY) || sessionStorage.getItem(REFRESH_TOKEN_KEY)
}

// Store user data in localStorage
export const setUserData = (user: User) => {
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

// Get user data from localStorage
export const getUserData = (): User | null => {
  const userData = localStorage.getItem(USER_KEY)
  return userData ? JSON.parse(userData) : null
}

// Clear all auth data from both storages
export const clearAuthData = () => {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
  sessionStorage.removeItem(TOKEN_KEY)
  sessionStorage.removeItem(REFRESH_TOKEN_KEY)
  
  // Update Redux state
  store.dispatch(logout())
}

// Initialize auth state from localStorage
export const initializeAuth = () => {
  const token = getAuthToken()
  const refreshToken = getRefreshToken()
  const user = getUserData()
  
  if (token && user) {
    store.dispatch(loginSuccess({ user, token, refreshToken: refreshToken || undefined }))
  }
}

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  const token = getAuthToken()
  const user = getUserData()
  return !!(token && user)
}

// Check if token is expired
export const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    const currentTime = Date.now() / 1000
    return payload.exp < currentTime
  } catch (error) {
    return true
  }
}

// Check if user has specific role
export const hasRole = (requiredRole: User['role']): boolean => {
  const user = getUserData()
  return user?.role === requiredRole
}

// Check if user has premium subscription
export const hasPremiumAccess = ( subscription: User['subscription'] ): boolean => {
  if (!subscription) return false
  return subscription.isActive && (subscription.type === 'premium' || subscription.type === 'pro')
}

// Auto logout when token expires
export const checkTokenExpiration = () => {
  const token = getAuthToken()
  if (token && isTokenExpired(token)) {
    clearAuthData()
  }
}

// Format user display name
export const getUserDisplayName = (user?: User | null): string => {
  if (!user) return 'Guest'
  return user.name || user.email || 'User'
}

// Get user avatar URL with fallback
export const getUserAvatarUrl = (user?: User | null): string => {
  return user?.avatar || '/images/default-avatar.png'
} 