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
  if (typeof window === 'undefined') return null
  return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY)
}

// Get refresh token from localStorage or sessionStorage
export const getRefreshToken = (): string | null => {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(REFRESH_TOKEN_KEY) || sessionStorage.getItem(REFRESH_TOKEN_KEY)
}

// Get user data from localStorage
export const getUserData = (): User | null => {
  if (typeof window === 'undefined') return null
  const userData = localStorage.getItem(USER_KEY)
  return userData ? JSON.parse(userData) : null
}

// Store user data in localStorage
export const setUserData = (user: User) => {
  if (typeof window === 'undefined') return
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

// Clear all auth data from both storages
export const clearAuthData = () => {
  if (typeof window === 'undefined') return
  
  // Clear from localStorage
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
  
  // Clear from sessionStorage
  sessionStorage.removeItem(TOKEN_KEY)
  sessionStorage.removeItem(REFRESH_TOKEN_KEY)
  
  // Clear any other auth-related items that might exist
  try {
    // Clear any additional storage keys that might be used
    const keysToRemove = ['user_data', 'auth_token', 'refresh_token']
    keysToRemove.forEach(key => {
      localStorage.removeItem(key)
      sessionStorage.removeItem(key)
    })
  } catch (error) {
    console.warn('Error clearing additional storage keys:', error)
  }
  
  // Update Redux state
  store.dispatch(logout())
}

// Initialize auth state from localStorage
export const initializeAuth = () => {
  if (typeof window === 'undefined') return
  
  const token = getAuthToken()
  const refreshToken = getRefreshToken()
  const user = getUserData()
  
  if (token && user) {
    store.dispatch(loginSuccess({ user, token, refreshToken: refreshToken || undefined }))
  }
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

// Auto logout when token expires
export const checkTokenExpiration = () => {
  const token = getAuthToken()
  if (token && isTokenExpired(token)) {
    clearAuthData()
  }
}

// Get user display name
export const getUserDisplayName = (user: User | null): string | null => {
  if (!user) return null
  
  if (user.username) return user.username
  if (user.firstName || user.lastName) {
    return `${user.firstName || ''} ${user.lastName || ''}`.trim()
  }
  if (user.email) return user.email.split('@')[0]
  
  return 'User'
}

// Get user avatar URL
export const getUserAvatarUrl = (user: User | null): string | null => {
  if (!user) return null
  return user.profilePicture || null
}

// Check if user has premium access
export const hasPremiumAccess = (memberships?: User['memberships']): boolean => {
  if (!memberships) return false
  return memberships.type === '' || memberships.type === 'pro' || memberships.type === 'lifetime'
}

// Check if user has specific role
export const hasRole = (requiredRole: User['roles']): boolean => {
  const user = getUserData()
  if (!user) return false
  
  // Admin has access to everything
  if (user.roles.id === 1 || user.roles.id === 2 || user.roles.id === 3 || user.roles.id === 4) return true
  
  return user.roles.id === requiredRole.id || user.roles.id === 1 || user.roles.id === 2 || user.roles.id === 3 || user.roles.id === 4
} 