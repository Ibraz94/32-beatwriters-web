'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { buildApiUrl } from '../../../../lib/config/api'

export default function PaymentSuccess() {
  const [sessionDetails, setSessionDetails] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const sessionId = new URLSearchParams(window.location.search).get('session_id')
    if (sessionId) {
      // Fetch session details from your backend
      fetch(buildApiUrl(`/api/stripe/session/${sessionId}`))
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
          }
          return response.json()
        })
        .then(data => {
          if (data.success) {
            setSessionDetails(data.data)
          } else {
            setError(data.error || 'Failed to fetch session details')
          }
        })
        .catch(error => {
          console.error('Error fetching session details:', error)
          setError('Failed to fetch session details')
        })
        .finally(() => {
          setLoading(false)
        })
    } else {
      setLoading(false)
      setError('No session ID found')
    }
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Processing...</h2>
          <p className="text-gray-600">Please wait while we verify your payment.</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="mt-4 bg-red-800 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
          >
            Return to Home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
        <p className="text-gray-600 mb-6">
          Thank you for your payment. Your subscription has been activated.
        </p>
        {sessionDetails && (
          <div className="text-left bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-2">Payment Details</h3>
            <p className="text-sm text-gray-600 mb-1"><strong>Session ID:</strong> {sessionDetails.id}</p>
            <p className="text-sm text-gray-600 mb-1"><strong>Amount:</strong> ${sessionDetails.amount_total ? (sessionDetails.amount_total / 100).toFixed(2) : 'N/A'}</p>
            <p className="text-sm text-gray-600 mb-1"><strong>Status:</strong> {sessionDetails.payment_status || sessionDetails.status}</p>
            <p className="text-sm text-gray-600"><strong>Customer Email:</strong> {sessionDetails.customer_details?.email || 'N/A'}</p>
          </div>
        )}
        <button
          onClick={() => router.push('/')}
          className="mt-4 bg-red-800 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
        >
          Return to Home
        </button>
      </div>
    </div>
  )
} 