'use client'

import { useState, useEffect } from 'react'
import { X, AlertCircle, CheckCircle, Info } from 'lucide-react'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

interface ToastProps {
  message: string
  type: ToastType
  duration?: number
  onClose: () => void
}

const Toast = ({ message, type, duration = 5000, onClose }: ToastProps) => {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(onClose, 300) // Wait for fade out animation
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  const getIcon = () => {
    const iconClass = `w-5 h-5 ${getIconColor()}`
    switch (type) {
      case 'success':
        return <CheckCircle className={iconClass} />
      case 'error':
        return <AlertCircle className={iconClass} />
      case 'warning':
        return <AlertCircle className={iconClass} />
      case 'info':
        return <Info className={iconClass} />
      default:
        return <Info className={iconClass} />
    }
  }

  const getBgColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 dark:bg-[#1F2937] border-green-200 dark:border-green-600'
      case 'error':
        return 'bg-red-50 dark:bg-[#1F2937] border-red-200 dark:border-red-600'
      case 'warning':
        return 'bg-yellow-50 dark:bg-[#1F2937] border-yellow-200 dark:border-yellow-600'
      case 'info':
        return 'bg-blue-50 dark:bg-[#1F2937] border-blue-200 dark:border-blue-600'
      default:
        return 'bg-blue-50 dark:bg-[#1F2937] border-blue-200 dark:border-blue-600'
    }
  }

  const getTextColor = () => {
    switch (type) {
      case 'success':
        return 'text-green-800 dark:text-green-300'
      case 'error':
        return 'text-red-800 dark:text-red-300'
      case 'warning':
        return 'text-yellow-800 dark:text-yellow-300'
      case 'info':
        return 'text-blue-800 dark:text-blue-300'
      default:
        return 'text-blue-800 dark:text-blue-300'
    }
  }

  const getIconColor = () => {
    switch (type) {
      case 'success':
        return 'text-green-500 dark:text-green-400'
      case 'error':
        return 'text-red-500 dark:text-red-400'
      case 'warning':
        return 'text-yellow-500 dark:text-yellow-400'
      case 'info':
        return 'text-blue-500 dark:text-blue-400'
      default:
        return 'text-blue-500 dark:text-blue-400'
    }
  }

  return (
    <div
      className={`fixed bottom-10 right-4 z-50 max-w-sm w-full transition-all duration-300 ${
        isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'
      }`}
    >
      <div className={`${getBgColor()} border-2 rounded-lg shadow-xl p-4 flex items-start gap-3`}>
        {getIcon()}
        <div className="flex-1">
          <p className={`${getTextColor()} text-sm font-medium`}>{message}</p>
        </div>
        <button
          onClick={() => {
            setIsVisible(false)
            setTimeout(onClose, 300)
          }}
          className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

// Toast context and provider
interface ToastContextType {
  showToast: (message: string, type: ToastType, duration?: number) => void
}

import { createContext, useContext } from 'react'

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

interface ToastProviderProps {
  children: React.ReactNode
}

export const ToastProvider = ({ children }: ToastProviderProps) => {
  const [toasts, setToasts] = useState<Array<{
    id: string
    message: string
    type: ToastType
    duration: number
  }>>([])

  const showToast = (message: string, type: ToastType, duration = 5000) => {
    const id = Math.random().toString(36).substr(2, 9)
    setToasts(prev => [...prev, { id, message, type, duration }])
  }

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-10 right-4 z-50 space-y-2">
        {toasts.map(toast => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            duration={toast.duration}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  )
} 