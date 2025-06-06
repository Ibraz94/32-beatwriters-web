import { useCallback, useEffect } from 'react'
import { useAppSelector, useAppDispatch } from '../hooks'
import { 
  loginStart, 
  loginSuccess, 
  loginFailure, 
  logout as logoutAction,
  updateUser,
  selectAuth,
  selectUser,
  selectIsAuthenticated,
  selectIsLoading,
  selectAuthError
} from '../features/authSlice'
import { 
  useLoginMutation,
  useLogoutMutation,
  useRefreshTokenMutation,
  useGetProfileQuery
} from '../services/authApi'
import { 
  setAuthTokens, 
  clearAuthData, 
  setUserData, 
  initializeAuth,
  checkTokenExpiration,
  getUserDisplayName,
  getUserAvatarUrl,
  hasPremiumAccess,
  hasRole
} from '../utils/auth'
import type { User } from '../features/authSlice'

export const useAuth = () => {
  const dispatch = useAppDispatch()
  const auth = useAppSelector(selectAuth)
  const user = useAppSelector(selectUser)
  const isAuthenticated = useAppSelector(selectIsAuthenticated)
  const isLoading = useAppSelector(selectIsLoading)
  const error = useAppSelector(selectAuthError)

  const [loginMutation] = useLoginMutation()
  const [logoutMutation] = useLogoutMutation()
  const [refreshTokenMutation] = useRefreshTokenMutation()

  // Initialize auth state on mount
  useEffect(() => {
    initializeAuth()
  }, [])

  // Check token expiration periodically
  useEffect(() => {
    const interval = setInterval(() => {
      checkTokenExpiration()
    }, 60000) // Check every minute

    return () => clearInterval(interval)
  }, [])

  // Login function
  const login = useCallback(async (email: string, password: string) => {
    try {
      dispatch(loginStart())
      
      const result = await loginMutation({ email, password }).unwrap()
      
      // Store tokens and user data
      setAuthTokens(result.token, result.refreshToken)
      setUserData(result.user)
      
      // Update Redux state
      dispatch(loginSuccess({
        user: result.user,
        token: result.token,
        refreshToken: result.refreshToken
      }))

      return { success: true, user: result.user }
    } catch (error: any) {
      const errorMessage = error?.data?.message || 'Login failed'
      dispatch(loginFailure(errorMessage))
      return { success: false, error: errorMessage }
    }
  }, [dispatch, loginMutation])

  // Logout function
  const logout = useCallback(async () => {
    try {
      // Call API logout endpoint
      await logoutMutation().unwrap()
    } catch (error) {
      // Continue with logout even if API call fails
      console.warn('Logout API call failed:', error)
    } finally {
      // Clear local data and Redux state
      clearAuthData()
    }
  }, [logoutMutation])

  // Refresh token function
  const refreshToken = useCallback(async () => {
    if (!auth.refreshToken) return false

    try {
      const result = await refreshTokenMutation({ 
        refreshToken: auth.refreshToken 
      }).unwrap()
      
      setAuthTokens(result.token, result.refreshToken)
      
      return true
    } catch (error) {
      // If refresh fails, logout user
      clearAuthData()
      return false
    }
  }, [auth.refreshToken, refreshTokenMutation])

  // Update user profile
  const updateProfile = useCallback((userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData }
      setUserData(updatedUser)
      dispatch(updateUser(userData))
    }
  }, [user, dispatch])

  // Check if user has specific role
  const checkRole = useCallback((role: User['role']) => {
    return hasRole(role)
  }, [])

  // Check if user has premium access
  const checkPremiumAccess = useCallback(() => {
    return hasPremiumAccess(user?.subscription)
  }, [user])

  // Get user display name
  const getDisplayName = useCallback(() => {
    return getUserDisplayName(user)
  }, [user])

  // Get user avatar URL
  const getAvatarUrl = useCallback(() => {
    return getUserAvatarUrl(user)
  }, [user])

  return {
    // State
    user,
    isAuthenticated,
    isLoading,
    error,
    token: auth.token,
    
    // Actions
    login,
    logout,
    refreshToken,
    updateProfile,
    
    // Utilities
    checkRole,
    checkPremiumAccess,
    getDisplayName,
    getAvatarUrl,
    
    // Direct access to auth state
    auth
  }
}

// Hook for protecting routes
export const useAuthGuard = (redirectTo?: string) => {
  const { isAuthenticated, isLoading } = useAuth()
  
  useEffect(() => {
    if (!isLoading && !isAuthenticated && redirectTo) {
      window.location.href = redirectTo
    }
  }, [isAuthenticated, isLoading, redirectTo])
  
  return { isAuthenticated, isLoading }
}

// Hook for role-based access
export const useRoleGuard = (requiredRole: User['role'], redirectTo?: string) => {
  const { checkRole, isAuthenticated, isLoading } = useAuth()
  const hasRequiredRole = checkRole(requiredRole)
  
  useEffect(() => {
    if (!isLoading && isAuthenticated && !hasRequiredRole && redirectTo) {
      window.location.href = redirectTo
    }
  }, [isAuthenticated, isLoading, hasRequiredRole, redirectTo])
  
  return { hasRequiredRole, isAuthenticated, isLoading }
}

// Hook for premium content access
export const usePremiumGuard = (redirectTo?: string) => {
  const { checkPremiumAccess, isAuthenticated, isLoading } = useAuth()
  const hasPremium = checkPremiumAccess()
  
  useEffect(() => {
    if (!isLoading && isAuthenticated && !hasPremium && redirectTo) {
      window.location.href = redirectTo
    }
  }, [isAuthenticated, isLoading, hasPremium, redirectTo])
  
  return { hasPremium, isAuthenticated, isLoading }
} 