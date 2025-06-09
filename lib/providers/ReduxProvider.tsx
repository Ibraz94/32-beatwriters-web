'use client'

import { Provider } from 'react-redux'
import { store } from '../store'
import { useEffect } from 'react'
import { initializeAuth } from '../utils/auth'

interface ReduxProviderProps {
  children: React.ReactNode
}

// Component to handle auth initialization
function AuthInitializer() {
  useEffect(() => {
    // Initialize auth state from localStorage on app startup
    initializeAuth()
  }, [])
  
  return null
}

export function ReduxProvider({ children }: ReduxProviderProps) {
  return (
    <Provider store={store}>
      <AuthInitializer />
      {children}
    </Provider>
  )
} 