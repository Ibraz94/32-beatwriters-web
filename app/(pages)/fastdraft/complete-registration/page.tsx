'use client'

import { useEffect, useMemo, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { API_CONFIG, buildApiUrl } from '@/lib/config/api'
import { getUserData } from '@/lib/utils/auth'

interface SubscriptionOption {
  id: string
  unit_amount: number
  recurring: {
    interval: 'month' | 'year'
    interval_count: number
  }
  nickname: string
}

function FastDraftCompleteRegistrationPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const success = searchParams.get('success') === 'true'
  const inviteActivationKey = searchParams.get('invite') || ''

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')
  const [debugResponse, setDebugResponse] = useState<any>(null)
  const [subscriptionOptions, setSubscriptionOptions] = useState<{ data: SubscriptionOption[] } | null>(null)

  // Known monthly price fallback (kept in sync with regular subscribe page)
  const monthlyPlanIdFallback = 'price_1RZZFRAToc8YZruPw5uzOh1n'

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const res = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.STRIPE.SUBSCRIPTION_OPTIONS))
        const data = await res.json()
        setSubscriptionOptions(data)
      } catch (e) {
        // Non-fatal; we still allow checkout with fallback ID
        console.error('Failed to fetch subscription options', e)
      }
    }
    fetchOptions()
  }, [])

  const monthlyPlan = useMemo(() => {
    const plan = subscriptionOptions?.data.find(p => p.recurring.interval === 'month')
    return plan
  }, [subscriptionOptions])

  const selectedPriceId = monthlyPlan?.id || monthlyPlanIdFallback

  const handleCompleteRegistration = async () => {
    setLoading(true)
    setError('')
    try {
      const me = getUserData()
      console.log('[FastDraft] Current user from storage:', me)
      const email = me?.email || ''
      const firstName = (me?.firstName || me?.username || 'User').toString()
      const lastName = (me?.lastName || 'User').toString()
      const username = (me?.username || (me?.email ? me.email.split('@')[0] : 'user')).toString()

      const fallbackPassword = 'Fastdraft#12345'
      const payload = {
        // Minimal user fields expected by backend based on regular subscribe flow
        email,
        firstName,
        lastName,
        phoneNumber: (me?.phoneNumber || '000-000-0000').toString(),
        address1: (me?.address1 || 'Not provided').toString(),
        address2: (me?.address2 || '').toString(),
        city: (me?.city || 'Not provided').toString(),
        country: (me?.country || 'US').toString(),
        state: (me?.state || 'Not provided').toString(),
        zipCode: (me?.zipCode || '00000').toString(),
        username,
        // Some backends require password fields for this endpoint (even if user exists)
        password: fallbackPassword,
        confirmPassword: fallbackPassword,
        priceId: selectedPriceId,
        price_id: selectedPriceId, // alternate naming just in case backend expects snake_case
        plan: 'monthly',
        couponCode: 'FASTDRAFT',
        promoCode: 'FASTDRAFT',
        coupon: 'FASTDRAFT',
        context: 'fastdraft',
        useGoogleAuth: false,
        googleUser: null,
        authType: 'regular',
        inviteActivationKey: inviteActivationKey || undefined
      }
      console.log('[FastDraft] Checkout payload:', payload)
      const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.STRIPE.CREATE_CHECKOUT_SESSION), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      let data: any = null
      try {
        data = await response.json()
      } catch (e) {
        console.error('[FastDraft] Failed to parse response JSON')
      }
      console.log('[FastDraft] Checkout response status:', response.status)
      console.log('[FastDraft] Checkout response body:', data)
      setDebugResponse(data)
      if (!response.ok || !data?.url) {
        const msg = data?.message || data?.error || (typeof data === 'string' ? data : 'Failed to create checkout session')
        throw new Error(msg)
      }
      window.location.href = data.url
    } catch (e: any) {
      setError(e?.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="container mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h1 className="text-4xl font-oswald font-bold mb-4">Registration Complete</h1>
        <p className="mb-8">Your FastDraft promotional checkout was successful. Please log in to start using your account.</p>
        <button onClick={() => router.push('/login')} className="bg-red-800 text-white px-6 py-3 rounded-md font-semibold">
          Go to Login
        </button>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-10">
        <h1 className="text-5xl font-oswald font-bold">Complete Registration</h1>
        <p className="mt-3">FastDraft partner promotion – first month free with code FASTDRAFT.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-[#2C204B] text-white p-8 text-center">
          <h2 className="text-3xl font-oswald font-bold mb-2">Monthly Plan</h2>
          {monthlyPlan ? (
            <p className="opacity-90">${(monthlyPlan.unit_amount / 100).toFixed(2)} / month</p>
          ) : (
            <p className="opacity-90">Billed monthly</p>
          )}
          <p className="mt-4 text-sm">Promo code applied: FASTDRAFT (100% off, first month)</p>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 bg-destructive/10 border border-destructive/20 rounded-md p-3 text-destructive">
              {error}
            </div>
          )}
          <button
            onClick={handleCompleteRegistration}
            disabled={loading}
            className="w-full bg-red-800 text-white py-4 rounded-md font-bold cursor-pointer"
          >
            {loading ? 'Processing…' : 'Complete Registration'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function FastDraftCompleteRegistrationPageWrapper() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <FastDraftCompleteRegistrationPage />
    </Suspense>
  )
}
