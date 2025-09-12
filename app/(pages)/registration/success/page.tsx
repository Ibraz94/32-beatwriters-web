'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { buildApiUrl, API_CONFIG } from '../../../../lib/config/api'

export default function RegistrationSuccess() {
  const [sessionDetails, setSessionDetails] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    const sessionId = new URLSearchParams(window.location.search).get('session_id')
    if (sessionId) {
      // Fetch session details from your backend
      fetch(buildApiUrl(API_CONFIG.ENDPOINTS.STRIPE.SESSION) + `/${sessionId}`)
        .then(response => response.json())
        .then(data => setSessionDetails(data))
        .catch(error => console.error('Error fetching session details:', error))
    }
  }, [])

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
          <div className="text-left">
            <p><strong>Session ID:</strong> {sessionDetails.id}</p>
            <p><strong>Amount:</strong> ${sessionDetails.amount_total / 100}</p>
            <p><strong>Status:</strong> {sessionDetails.status}</p>
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