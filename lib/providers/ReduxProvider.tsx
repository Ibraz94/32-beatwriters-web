'use client'

import { Provider } from 'react-redux'
import { store } from '../store'
import { useEffect, useState } from 'react'
import { initializeAuth } from '../utils/auth'

interface ReduxProviderProps {
  children: React.ReactNode
}

// Component to handle auth initialization
function AuthInitializer() {
  const [isHydrated, setIsHydrated] = useState(false)
  
  useEffect(() => {
    // Ensure we're on the client side before initializing auth
    if (typeof window !== 'undefined') {
      initializeAuth()
      setIsHydrated(true)
    }
  }, [])
  
  // Return null during hydration to prevent mismatches
  if (!isHydrated) return null
  
  return null
}

export function ReduxProvider({ children }: ReduxProviderProps) {
  const [isClient, setIsClient] = useState(false)
  
  useEffect(() => {
    setIsClient(true)
  }, [])
  
  return (
    <Provider store={store}>
      {isClient && <AuthInitializer />}
      {children}
    </Provider>
  )
} 