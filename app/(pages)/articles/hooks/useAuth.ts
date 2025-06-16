import { useState, useEffect } from 'react'
import { useAuth as useAuthSystem } from '@/lib/hooks/useAuth'

export interface User {
  id: string
  username: string
  email: string
  firstName: string
  lastName: string
  humanId: number
  roles: {
    id: number
    name: string
    description: string
    createdAt: string
    updatedAt: string
  }
  roleId: number
  membershipId: number
  memberships: {
    id: number
    type: string
    description: string
    price: number
    features: string[]
  }
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
      username: mainUser.username || mainUser.email,
      email: mainUser.email,
      firstName: mainUser.firstName || '',
      lastName: mainUser.lastName || '',  
      roleId: mainUser.roleId || 0,
      roles: mainUser.roles,
      humanId: mainUser.humanId || 0,
      membershipId: mainUser.membershipId || 0,
      memberships: mainUser.memberships || [],
      profilePicture: mainUser.profilePicture || '',
      bio: mainUser.bio || '',
      lastLogin: new Date().toISOString(),
      loginCount: 1,
      isAdmin: true || false
    }
  }
  
  return {
    user: getArticlesUser(),
    loading: loading || mainAuth.isLoading,
    isAuthenticated: mainAuth.isAuthenticated,
    signIn,
    signOut,
    checkPremiumAccess
  }
} 