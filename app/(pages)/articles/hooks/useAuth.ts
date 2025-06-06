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
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  
  useEffect(() => {
    // Mock authentication check - in real app, this would check actual auth state
    // You can modify this to test different scenarios:
    
    // Non-premium user (default):
    
    // Simulate loading delay
    setTimeout(() => {
      setUser(user)
      setLoading(false)
    }, 500)
  }, [])
  
  const signIn = async (email: string, password: string): Promise<User> => {

    const { login } = useAuthSystem()
    const result = await login(email, password)
    if (result.success && result.user) {
      setUser(result.user as unknown as User)
      return result.user as unknown as User
    }
    throw new Error('Login failed')
  }
  
  const signOut = () => {
    setUser(null)
  }
  
  const upgradeToPremium = () => {
    if (user) {
      setUser({ ...user, memebership: 'premium' })
    }
  }
  
  return {
    user,
    loading,
    isAuthenticated: !!user,
    signIn,
    signOut,
    upgradeToPremium
  }
} 