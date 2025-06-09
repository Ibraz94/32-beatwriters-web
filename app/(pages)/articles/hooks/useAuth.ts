import { useState, useEffect } from 'react'
import { useAuth as useAuthSystem } from '@/lib/hooks/useAuth'

export interface User {
  id: string
  username: string
  email: string
  firstName: string
  lastName: string
  role: string
  roleId: number
  memebership: string
  profilePicture: string
  bio: string
  lastLogin: string
  loginCount: number
  isAdmin: boolean
}

export const useAuth = () => {
  // Use the main auth system directly
  const mainAuth = useAuthSystem()
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    // The main auth system handles initialization, so we just wait for it
    const timer = setTimeout(() => {
      setLoading(false)
    }, 100)
    
    return () => clearTimeout(timer)
  }, [mainAuth.user])
  
  const signIn = async (email: string, password: string): Promise<User> => {
    const result = await mainAuth.login(email, password)
    if (result.success && result.user) {
      return result.user as unknown as User
    }
    throw new Error('Login failed')
  }
  
  const signOut = () => {
    mainAuth.logout()
  }
  
  const upgradeToPremium = () => {
    if (mainAuth.user) {
      mainAuth.updateProfile({
        subscription: {
          type: 'premium',
          plan: 'Premium Annual',
          status: 'active',
          amount: '$99.99',
          nextBilling: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
          isActive: true,
          expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() // 1 year from now
        }
      })
    }
  }

  // Check if user has premium access
  const checkPremiumAccess = () => {
    return mainAuth.checkPremiumAccess()
  }

  // Convert main auth user to articles user format if needed
  const getArticlesUser = (): User | null => {
    if (!mainAuth.user) return null
    
    const mainUser = mainAuth.user
    return {
      id: mainUser.id,
      username: mainUser.name || mainUser.email,
      email: mainUser.email,
      firstName: mainUser.name?.split(' ')[0] || '',
      lastName: mainUser.name?.split(' ').slice(1).join(' ') || '',
      role: mainUser.role || 'user',
      roleId: mainUser.role === 'admin' ? 1 : mainUser.role === 'premium' ? 2 : 3,
      memebership: mainUser.subscription?.type || 'free',
      profilePicture: mainUser.avatar || '',
      bio: '',
      lastLogin: new Date().toISOString(),
      loginCount: 1,
      isAdmin: mainUser.role === 'admin'
    }
  }
  
  return {
    user: getArticlesUser(),
    loading: loading || mainAuth.isLoading,
    isAuthenticated: mainAuth.isAuthenticated,
    signIn,
    signOut,
    upgradeToPremium,
    checkPremiumAccess
  }
} 