'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Check } from 'lucide-react'
import { API_CONFIG, buildApiUrl } from '../../../lib/config/api'
import GoogleOAuthButton from '@/app/components/GoogleOAuthButton'

interface SubscriptionOption {
  id: string
  object: string
  active: boolean
  currency: string
  recurring: {
    interval: 'month' | 'year'
    interval_count: number
  }
  unit_amount: number
  nickname: string
}

interface Product {
  id: string
  name: string
  description: string | null
}

interface FormData {
  email: string
  firstName: string
  lastName: string
  phoneNumber: string
  address1: string
  city: string
  country: string
  state: string
  zipCode: string
  username: string
  password: string
  confirmPassword: string
}

function PremiumSignupForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [subscriptionOptions, setSubscriptionOptions] = useState<{
    data: SubscriptionOption[]
  } | null>(null)
  const [selectedPriceId, setSelectedPriceId] = useState<string>('')
  const [errors, setErrors] = useState<Partial<Record<keyof FormData | 'general' | 'email' | 'username', string>>>({})
  const router = useRouter()

  // Promo code state variables
  const [promoCode, setPromoCode] = useState('')
  const [promoLoading, setPromoLoading] = useState(false)
  const [promoError, setPromoError] = useState('')
  const [promoSuccessMessage, setPromoSuccessMessage] = useState('')
  const [validatedPromoId, setValidatedPromoId] = useState<string | null>(null)
  const [promoDiscount, setPromoDiscount] = useState<{
    amount_off: number | null
    percent_off: number | null
    currency: string
  } | null>(null)

  const [formData, setFormData] = useState<FormData>({
    email: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    address1: '',
    city: '',
    country: 'US',
    state: '',
    zipCode: '',
    username: '',
    password: '',
    confirmPassword: ''
  })

  // Google OAuth state
  const [useGoogleAuth, setUseGoogleAuth] = useState(false)
  const [googleUser, setGoogleUser] = useState<any>(null)
  const [googleAuthLoading, setGoogleAuthLoading] = useState(false)
  const [googleAuthChecked, setGoogleAuthChecked] = useState(false)
  const searchParams = useSearchParams()
  const inviteActivationKey = searchParams.get('invite') || ''

  // Utility functions for price calculations
  const calculateDiscountedPrice = (basePrice: number, discount: { amount_off: number | null; percent_off: number | null }) => {
    if (discount.amount_off) {
      return Math.max(0, basePrice - (discount.amount_off / 100))
    } else if (discount.percent_off) {
      return basePrice * (1 - discount.percent_off / 100)
    }
    return basePrice
  }

  const formatDiscountText = (basePrice: number, discount: { amount_off: number | null; percent_off: number | null }) => {
    if (discount.amount_off) {
      return `($${(discount.amount_off / 100).toFixed(2)} off)`
    } else if (discount.percent_off) {
      return `(${discount.percent_off}% off)`
    }
    return ''
  }

  // Specific plan IDs to display
  const allowedPlanIds = ['price_1RjqjDAToc8YZruPtwMypo5C', 'plan_SP4eIOlEaiqOH0']
  
  // Monthly plan ID (first one in the array)
  const monthlyPlanId = 'price_1RjqjDAToc8YZruPtwMypo5C'

  useEffect(() => {
    const fetchSubscriptionOptions = async () => {
      try {
        const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.STRIPE.SUBSCRIPTION_OPTIONS))
        const data = await response.json()

        // Filter to only show the specific plans
        const filteredData = {
          ...data,
          data: data.data.filter((price: SubscriptionOption) => allowedPlanIds.includes(price.id))
        }

        setSubscriptionOptions(filteredData)

        // Set default selected price to monthly plan only if no price is already selected
        if (!selectedPriceId) {
          const monthlyPrice = filteredData.data.find((price: SubscriptionOption) =>
            price.id === monthlyPlanId
          )
          if (monthlyPrice) {
            setSelectedPriceId(monthlyPrice.id)
          } else if (filteredData.data.length > 0) {
            // Fallback to first available plan if monthly not found
            setSelectedPriceId(filteredData.data[0].id)
          }
        }
      } catch (error) {
        console.error('Error fetching subscription options:', error)
      }
    }
    fetchSubscriptionOptions()
  }, [])

  const checkGoogleAuth = async (user: any) => {
    console.log('checkGoogleAuth called with user:', user)
    console.log('Current selectedPriceId:', selectedPriceId)
    
    // Ensure we have a selected price ID, default to monthly if not set
    const priceIdToUse = selectedPriceId || monthlyPlanId
    console.log('Using price ID for Google auth:', priceIdToUse)
    
    setGoogleAuthLoading(true)
    try {
      const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.AUTH_GOOGLE_CHECK), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email: user.email,
          googleId: user.id,
          firstName: user.given_name,
          lastName: user.family_name,
          profilePicture: user.picture
        }),
      })
      
      console.log('Google auth check response status:', response.status)
      const data = await response.json()
      console.log('Google auth check response data:', data)
      
      if (data.success && data.userExists === false) {
        // User doesn't exist, can proceed with Google OAuth signup
        console.log('User does not exist, proceeding with Google OAuth signup')
        setGoogleUser(user)
        setUseGoogleAuth(true)
        setGoogleAuthChecked(true)
        
        // Pre-fill form with Google data
        setFormData(prev => ({
          ...prev,
          firstName: user.given_name || '',
          lastName: user.family_name || '',
          email: user.email || '',
          username: user.email?.split('@')[0] || '',
        }))
        
        // Show success message and redirect to Stripe checkout
        console.log('About to call handleGoogleSubscribe')
        setTimeout(() => {
          handleGoogleSubscribe(user)
        }, 1000) // Small delay to show the success message
      } else if (data.success && data.userExists === true) {
        // User exists, show error
        console.log('User already exists')
        setErrors({ general: 'An account with this email already exists. Please use a different email or sign in instead.' })
      } else {
        console.log('Google auth check failed:', data.message)
        setErrors({ general: data.message || 'Failed to verify Google account. Please try again.' })
      }
    } catch (error) {
      console.error('Error checking Google auth:', error)
      setErrors({ general: 'Failed to verify Google account. Please try again.' })
    } finally {
      setGoogleAuthLoading(false)
    }
  }

  // Handle Google OAuth callback
  useEffect(() => {
    const googleAuth = searchParams.get('google_auth')
    const googleUserParam = searchParams.get('google_user')
    const error = searchParams.get('error')
    const message = searchParams.get('message')
    
    // Handle OAuth errors
    if (error) {
      console.error('Google OAuth error:', error, message)
      setErrors({ general: message || 'Google authentication failed. Please try again.' })
      return
    }
    
    if (googleAuth === 'true' && googleUserParam) {
      try {
        const user = JSON.parse(decodeURIComponent(googleUserParam))
        console.log('Google OAuth callback - user data:', user)
        
        // Call the Google auth check API
        checkGoogleAuth(user)
      } catch (error) {
        console.error('Error parsing Google user data:', error)
        setErrors({ general: 'Failed to process Google authentication. Please try again.' })
      }
    }
  }, [searchParams])

  const handleGoogleAuthSuccess = (user: any) => {
    checkGoogleAuth(user)
  }

  const handleGoogleAuthError = (error: string) => {
    console.error('Google OAuth error:', error)
    setErrors({ general: error })
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error when user starts typing
    if (errors[name as keyof FormData]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {}

    // Check for existing email/username errors first
    if (errors.email === 'Email already exists') {
      newErrors.email = 'Email already exists'
    } else if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email format'
    }

    if (errors.username === 'Username already exists') {
      newErrors.username = 'Username already exists'
    } else if (!formData.username) {
      newErrors.username = 'Username is required'
    }

    if (!formData.firstName) newErrors.firstName = 'First name is required'
    if (!formData.lastName) newErrors.lastName = 'Last name is required'
    if (!formData.phoneNumber) newErrors.phoneNumber = 'Phone number is required'
    if (!formData.address1) newErrors.address1 = 'Address is required'
    if (!formData.city) newErrors.city = 'City is required'
    if (!formData.state) newErrors.state = 'State is required'
    if (!formData.zipCode) newErrors.zipCode = 'ZIP code is required'
    // Skip password validation for Google OAuth users
    if (!useGoogleAuth) {
      if (!formData.password) {
        newErrors.password = 'Password is required'
      } else if (formData.password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters'
      }
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password'
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match'
      }
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }


  const handleGoogleSubscribe = async (userData?: any) => {
    const user = userData || googleUser
    
    if (!user) {
      console.log('Missing Google user data')
      return
    }
    
    // Ensure we have a selected price ID, default to monthly if not set
    const priceIdToUse = selectedPriceId || monthlyPlanId
    console.log('Using price ID for Google subscribe:', priceIdToUse)
    
    // Update the selectedPriceId state if it's not set
    if (!selectedPriceId) {
      setSelectedPriceId(priceIdToUse)
    }
    
    console.log('Starting Google OAuth subscription process...')
    setIsLoading(true)
    
    const payload = {
      email: user.email,
      firstName: user.given_name || user.name || '',
      lastName: user.family_name || user.name?.split(' ')[1] || 'User', // Use last part of name or default
      phoneNumber: '000-000-0000', // Default phone number for Google OAuth users
      address1: 'Not provided', // Default address for Google OAuth users
      address2: '',
      city: 'Not provided', // Default city for Google OAuth users
      country: 'US',
      state: 'Not provided', // Default state for Google OAuth users
      zipCode: '00000', // Default ZIP code for Google OAuth users
      username: user.email?.split('@')[0] || '',
      password: '',
      confirmPassword: '',
      priceId: priceIdToUse,
      couponCode: promoCode,
      useGoogleAuth: true,
      googleUser: user,
      authType: 'google',
      googleId: user.id,
      profilePicture: user.picture
    }
    
    console.log('Google OAuth payload being sent to /api/stripe/create-google-checkout-session:', payload)
    console.log('API URL:', buildApiUrl('/api/stripe/create-google-checkout-session'))
    
    try {
      const response = await fetch(buildApiUrl('/api/stripe/create-google-checkout-session'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })
      
      console.log('Stripe API response status:', response.status)
      
      const responseData = await response.json()
      console.log('Stripe API response data:', responseData)
      
      if (!response.ok) {
        console.error('Stripe API error:', response.status, response.statusText, responseData)
        setErrors({ general: `Failed to create checkout session. ${responseData.error || responseData.message || response.statusText}` })
        return
      }
      
      if (responseData.url) {
        console.log('Redirecting to Stripe checkout:', responseData.url)
        // Use window.location.replace for more reliable redirect
        window.location.replace(responseData.url)
      } else {
        console.error('No URL in response:', responseData)
        setErrors({ general: 'Failed to create checkout session. No redirect URL received.' })
      }
    } catch (error) {
      console.error('Error creating checkout session:', error)
      setErrors({ general: 'Failed to create checkout session. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm() || !selectedPriceId) return
    setIsLoading(true)
    
    const payload = {
      ...formData,
      priceId: selectedPriceId,
      couponCode: promoCode, // Send the actual promo code instead of the ID
      useGoogleAuth,
      googleUser: useGoogleAuth ? googleUser : null,
      authType: useGoogleAuth ? 'google' : 'regular',
      inviteActivationKey: inviteActivationKey || undefined
    }
    
    console.log('Payload being sent to /api/stripe/create-checkout-session:', payload)
    console.log('API URL:', buildApiUrl(API_CONFIG.ENDPOINTS.STRIPE.CREATE_CHECKOUT_SESSION))
    
    try {
      const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.STRIPE.CREATE_CHECKOUT_SESSION), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })
      
      console.log('Response status:', response.status)
      console.log('Response headers:', response.headers)
      
      const responseData = await response.json()
      console.log('Response data:', responseData)
      
      const { url } = responseData
      console.log('Extracted URL:', url)
      
      window.location.href = url
    } catch (error) {
      console.error('Error creating checkout session:', error)
      setErrors({ general: 'Failed to create checkout session. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  const handlePromoCodeValidation = async () => {
    if (!promoCode.trim()) {
      setPromoError('Please enter a promo code')
      return
    }

    setPromoLoading(true)
    setPromoError('')
    setPromoSuccessMessage('')

    try {
      const response = await fetch(buildApiUrl('/api/stripe/validate-promo-code'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: promoCode }),
      })

      const data = await response.json()

      if (data.success && data.discount) {
        const discountAmount = data.discount.amount_off
          ? `$${(data.discount.amount_off / 100).toFixed(2)} off`
          : `${data.discount.percent_off}% off`

        setPromoSuccessMessage(`Promo applied: ${discountAmount}`)
        setValidatedPromoId(data.discount.id)
        setPromoDiscount({
          amount_off: data.discount.amount_off,
          percent_off: data.discount.percent_off,
          currency: data.discount.currency
        })
        setPromoError('')
      } else {
        setPromoError(data.message || 'Invalid or expired promo code.')
        setValidatedPromoId(null)
        setPromoDiscount(null)
        setPromoSuccessMessage('')
      }
    } catch (error) {
      console.error('Error validating promo code:', error)
      setPromoError('Failed to validate promo code. Please try again.')
      setValidatedPromoId(null)
      setPromoDiscount(null)
      setPromoSuccessMessage('')
    } finally {
      setPromoLoading(false)
    }
  }

  const checkEmail = async (email: string) => {
    const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.AUTH + '/check-email'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    })
    const data = await response.json()
    return data
  }

  const checkUsername = async (username: string) => {
    const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.AUTH + '/check-username'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username }),
    })
    const data = await response.json()
    return data
  }

  useEffect(() => {
    const checkEmailAndUsername = async () => {
      // Only check if the fields have values and are not empty
      if (formData.email && formData.email.includes('@')) {
        try {
          const emailResponse = await checkEmail(formData.email)
          if (emailResponse.exists) {
            setErrors(prev => ({
              ...prev,
              email: 'Email already exists'
            }))
          } else {
            // Clear email error if it was previously set for existence
            setErrors(prev => {
              const newErrors = { ...prev }
              if (newErrors.email === 'Email already exists') {
                delete newErrors.email
              }
              return newErrors
            })
          }
        } catch (error) {
          console.error('Error checking email:', error)
        }
      }

      if (formData.username && formData.username.length > 0) {
        try {
          const usernameResponse = await checkUsername(formData.username)
          if (usernameResponse.exists) {
            setErrors(prev => ({
              ...prev,
              username: 'Username already exists'
            }))
          } else {
            // Clear username error if it was previously set for existence
            setErrors(prev => {
              const newErrors = { ...prev }
              if (newErrors.username === 'Username already exists') {
                delete newErrors.username
              }
              return newErrors
            })
          }
        } catch (error) {
          console.error('Error checking username:', error)
        }
      }
    }

    // Debounce the API calls to avoid too many requests
    const timeoutId = setTimeout(() => {
      checkEmailAndUsername()
    }, 500) // Wait 500ms after user stops typing

    return () => clearTimeout(timeoutId)
  }, [formData.email, formData.username])

  return (
    <div className="container mx-auto max-w-8xl flex items-center justify-center px-4 sm:px-6 lg:px-8 mt-8 sm:mt-12 lg:mt-12 mb-16 sm:mb-20 lg:mb-24">
      <div>
        <div className="text-center mb-8 sm:mb-10 lg:mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 sm:mb-4 leading-tight font-oswald">
            Gain Your Competitive Edge
          </h1>
          <p className="text-lg sm:text-xl max-w-3xl mx-auto px-2 sm:px-0">
            Tools and insights specifically designed to give you an advantage over your league-mates
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          <div className="space-y-4 sm:space-y-6">
            <h3 className="text-xl sm:text-2xl font-bold">What you'll get:</h3>

            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <Check className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm sm:text-base">Exclusive Content</h4>
                  <p className="text-gray-500 text-sm sm:text-base">Summaries All Offseason - The Best, Complete Reports in the Industry That's Used By Industry Leaders.</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <Check className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm sm:text-base">Feed Access</h4>
                  <p className="text-gray-500 text-sm sm:text-base">A feed of all the most important NFL and player news.  This can replace social media if you want.</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <Check className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm sm:text-base">Early Access</h4>
                  <p className="text-gray-500 text-sm sm:text-base">Ability to search insight and updates. Access to all our Premium articles.</p>
                </div>
              </div>

              {/* <div className="flex items-start space-x-3">
                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <Check className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm sm:text-base">Special</h4>
                  <p className="text-gray-500 text-sm sm:text-base">Exclusive podcast episodes. Playing in our Fantasy Football Leagues. Our Undying Love and Appreciation </p>
                </div>
              </div> */}

              <div className="flex items-start space-x-3">
                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <Check className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm sm:text-base">Community Access</h4>
                  <p className="text-gray-500 text-sm sm:text-base">Join our exclusive Discord community of subscribers and connect with like-minded people.</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <Check className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm sm:text-base">Player Pages</h4>
                  <p className="text-gray-500 text-sm sm:text-base">Complete player breakdown from their news to their stats to their key fantasy metrics.</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="rounded-lg shadow-lg border border-border p-8">
              <form onSubmit={handleSubscribe} className="space-y-6">
                {errors.general && (
                  <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3">
                    <p className="text-sm text-destructive">{errors.general}</p>
                  </div>
                )}
                <div className="space-y-4">
                  <h2 className="text-2xl font-semibold text-foreground font-oswald">Choose Your Plan</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ">
                    {subscriptionOptions?.data.map((price) => {
                      const basePrice = price.unit_amount / 100
                      const discountedPrice = promoDiscount
                        ? calculateDiscountedPrice(basePrice, promoDiscount)
                        : basePrice
                      const discountText = promoDiscount
                        ? formatDiscountText(basePrice, promoDiscount)
                        : ''

                      return (
                        <div
                          key={price.id}
                          className={`border rounded-lg p-4 cursor-pointer transition-all ${selectedPriceId === price.id
                            ? 'border-2 border-gray-400 scale-105 bg-[#2c204b]'
                            : 'border-border hover:border-primary/50 bg-accent '
                            }`}
                          onClick={() => setSelectedPriceId(price.id)}
                        >
                          <div className="flex justify-between items-center gap-2">
                            <div>
                              <h3 className="font-semibold text-white">
                                {price.recurring.interval === 'month' ? 'Monthly' : 'Annual'}
                              </h3>
                              <p className="text-muted-foreground">
                                {price.recurring.interval === 'month' ? 'Billed monthly' : 'Billed annually'}
                              </p>
                            </div>
                            <div className="text-right">
                              {promoDiscount ? (
                                <div>
                                  <p className="text-2xl font-bold text-white">
                                    ${discountedPrice.toFixed(2)}
                                  </p>
                                  <p className="text-sm text-green-400 font-medium">
                                    {discountText}
                                  </p>
                                </div>
                              ) : (
                                <p className="text-2xl font-bold text-white">
                                  ${basePrice.toFixed(2)}
                                </p>
                              )}
                              <p className="text-sm text-muted-foreground">
                                per {price.recurring.interval}
                              </p>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div className='grid grid-cols-1 gap-4'>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Promo Code
                    </label>
                    <div className='flex gap-2'>
                      <input
                        type="text"
                        name="firstName"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                        className={`w-full px-4 py-2 border rounded-md ${promoError ? 'border-destructive' : 'border-input'
                          }`}
                        placeholder="Enter your promo code"
                      />
                      <button
                        type="button"
                        onClick={() => handlePromoCodeValidation()}
                        disabled={promoLoading}
                        className=" bg-red-800 w-full text-white hover:scale-101 py-3 px-4 rounded-md font-medium transition-colors disabled:opacity-50"
                      >
                        {promoLoading ? 'Validating...' : 'Validate Promo Code'}
                      </button>
                    </div>
                    {promoError && (
                      <p className="mt-1 text-sm text-destructive">{promoError}</p>
                    )}
                    {promoSuccessMessage && (
                      <p className="mt-1 text-sm text-green-600">{promoSuccessMessage}</p>
                    )}
                  </div>

                  
                </div>

                {/* Google OAuth Section */}
                {!useGoogleAuth && (
                  <div className="space-y-4">
                    <div className="text-center">
                      <GoogleOAuthButton 
                        text={googleAuthLoading ? "Checking Google Account..." : "Continue with Google"}
                        variant="signup"
                        onSuccess={handleGoogleAuthSuccess}
                        onError={handleGoogleAuthError}
                        className="w-full"
                        disabled={googleAuthLoading}
                      />
                    </div>
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-border" />
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-background text-muted-foreground">Or fill out the form below</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Google User Info Display */}
                {useGoogleAuth && googleUser && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                    <div className="flex items-center space-x-3">
                      <img 
                        src={googleUser.picture} 
                        alt="Google Profile" 
                        className="w-10 h-10 rounded-full"
                      />
                      <div>
                        <p className="font-medium text-green-800">Signed in with Google</p>
                        <p className="text-sm text-green-600">{googleUser.email}</p>
                        {googleAuthChecked && (
                          <div>
                            <p className="text-sm text-green-600 mt-1">
                              ✓ Account verified, redirecting to Stripe checkout...
                            </p>
                            <div className="mt-2 flex items-center">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600 mr-2"></div>
                              <span className="text-sm text-green-600">Please wait...</span>
                            </div>
                            <button 
                              onClick={() => handleGoogleSubscribe(googleUser)}
                              className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                            >
                              Manual Redirect to Stripe
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Personal Information - Hide for Google OAuth users */}
                {!useGoogleAuth && (
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-foreground">Personal Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          First Name *
                        </label>
                        <input
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-2 border rounded-md ${errors.firstName ? 'border-destructive' : 'border-input'
                            }`}
                          required
                        />
                        {errors.firstName && (
                          <p className="mt-1 text-sm text-destructive">{errors.firstName}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Last Name *
                        </label>
                        <input
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-2 border rounded-md ${errors.lastName ? 'border-destructive' : 'border-input'
                            }`}
                          required
                        />
                        {errors.lastName && (
                          <p className="mt-1 text-sm text-destructive">{errors.lastName}</p>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-2 border rounded-md ${errors.email ? 'border-destructive' : 'border-input'
                          }`}
                        required
                      />
                      {errors.email && (
                        <p className="mt-1 text-sm text-destructive">{errors.email}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-2 border rounded-md ${errors.phoneNumber ? 'border-destructive' : 'border-input'
                          }`}
                        required
                      />
                      {errors.phoneNumber && (
                        <p className="mt-1 text-sm text-destructive">{errors.phoneNumber}</p>
                      )}
                    </div>
                  </div>
                )}
                {/* Address Information - Hide for Google OAuth users */}
                {!useGoogleAuth && (
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-foreground">Address Information</h2>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Street Address *
                      </label>
                      <input
                        type="text"
                        name="address1"
                        value={formData.address1}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-2 border rounded-md ${errors.address1 ? 'border-destructive' : 'border-input'
                          }`}
                        required
                      />
                      {errors.address1 && (
                        <p className="mt-1 text-sm text-destructive">{errors.address1}</p>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          City *
                        </label>
                        <input
                          type="text"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-2 border rounded-md ${errors.city ? 'border-destructive' : 'border-input'
                            }`}
                          required
                        />
                        {errors.city && (
                          <p className="mt-1 text-sm text-destructive">{errors.city}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          State/Province *
                        </label>
                        <input
                          type="text"
                          name="state"
                          value={formData.state}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-2 border rounded-md ${errors.state ? 'border-destructive' : 'border-input'
                            }`}
                          required
                        />
                        {errors.state && (
                          <p className="mt-1 text-sm text-destructive">{errors.state}</p>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          ZIP/Postal Code *
                        </label>
                        <input
                          type="text"
                          name="zipCode"
                          value={formData.zipCode}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-2 border rounded-md ${errors.zipCode ? 'border-destructive' : 'border-input'
                            }`}
                          required
                        />
                        {errors.zipCode && (
                          <p className="mt-1 text-sm text-destructive">{errors.zipCode}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Country *
                        </label>
                        <select
                          name="country"
                          value={formData.country}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-input rounded-md"
                          required
                        >
                          <option value="US">United States</option>
                          <option value="CA">Canada</option>
                          <option value="GB">United Kingdom</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}
                {/* Account Information - Hide for Google OAuth users */}
                {!useGoogleAuth && (
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-foreground">Account Information</h2>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Username *
                      </label>
                      <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-2 border rounded-md ${errors.username ? 'border-destructive' : 'border-input'
                          }`}
                        required
                      />
                      {errors.username && (
                        <p className="mt-1 text-sm text-destructive">{errors.username}</p>
                      )}
                    </div>
                    {/* Password fields - only show for non-Google OAuth users */}
                    <>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Password *
                        </label>
                        <input
                          type="password"
                          name="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-2 border rounded-md ${errors.password ? 'border-destructive' : 'border-input'
                            }`}
                          required
                        />
                        {errors.password && (
                          <p className="mt-1 text-sm text-destructive">{errors.password}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Confirm Password *
                        </label>
                        <input
                          type="password"
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-2 border rounded-md ${errors.confirmPassword ? 'border-destructive' : 'border-input'
                            }`}
                          required
                        />
                        {errors.confirmPassword && (
                          <p className="mt-1 text-sm text-destructive">{errors.confirmPassword}</p>
                        )}
                      </div>
                    </>
                  </div>
                )}
                {/* Subscribe Button - Hide for Google OAuth users */}
                {!useGoogleAuth && (
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-red-800 text-white hover:scale-101 py-3 px-4 rounded-md font-medium transition-colors disabled:opacity-50"
                  >
                    {isLoading ? 'Processing...' : 'Subscribe Now'}
                  </button>
                )}
              </form>
            </div>
          </div>
        </div>
      </div >
    </div >
  )
}

export default function PremiumSignup() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PremiumSignupForm />
    </Suspense>
  )
} 