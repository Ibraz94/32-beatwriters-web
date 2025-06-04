import { useState, useEffect } from 'react'

export interface User {
  id: string
  email: string
  name: string
  isPremium: boolean
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    // Mock authentication check - in real app, this would check actual auth state
    // You can modify this to test different scenarios:
    
    // Non-premium user (default):
    const mockUser: User = {
      id: '1',
      email: 'user@example.com', 
      name: 'John Doe',
      isPremium: false // Change to true to simulate premium user
    }
    
    // Simulate loading delay
    setTimeout(() => {
      setUser(mockUser)
      setLoading(false)
    }, 500)
  }, [])
  
  const signIn = async (email: string, password: string) => {
    // Mock sign in - in real app, this would call an API
    const mockUser: User = {
      id: '1',
      email: email,
      name: 'John Doe',
      isPremium: email.includes('premium') // Simple way to test premium users
    }
    setUser(mockUser)
    return mockUser
  }
  
  const signOut = () => {
    setUser(null)
  }
  
  const upgradeToPremium = () => {
    if (user) {
      setUser({ ...user, isPremium: true })
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