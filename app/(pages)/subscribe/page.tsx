'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Check } from 'lucide-react'

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

export default function PremiumSignup() {
  const [isLoading, setIsLoading] = useState(false)
  const [subscriptionOptions, setSubscriptionOptions] = useState<{
    data: SubscriptionOption[]
  } | null>(null)
  const [selectedPriceId, setSelectedPriceId] = useState<string>('')
  const [errors, setErrors] = useState<Partial<Record<keyof FormData | 'general' | 'email' | 'username', string>>>({})
  const router = useRouter()
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

  // Specific plan IDs to display
  const allowedPlanIds = ['price_1RiJQQAToc8YZruPj77d8vzO', 'plan_SP4eIOlEaiqOH0']

  useEffect(() => {
    const fetchSubscriptionOptions = async () => {
      try {
        const response = await fetch('https://api.32beatwriters.com/api/stripe/subscription-options')
        const data = await response.json()
        
        // Filter to only show the specific plans
        const filteredData = {
          ...data,
          data: data.data.filter((price: SubscriptionOption) => allowedPlanIds.includes(price.id))
        }
        
        setSubscriptionOptions(filteredData)
        
        // Set default selected price to monthly plan
        const monthlyPrice = filteredData.data.find((price: SubscriptionOption) => 
          price.id === 'price_1RiJQQAToc8YZruPj77d8vzO'
        )
        if (monthlyPrice) {
          setSelectedPriceId(monthlyPrice.id)
        } else if (filteredData.data.length > 0) {
          // Fallback to first available plan if monthly not found
          setSelectedPriceId(filteredData.data[0].id)
        }
      } catch (error) {
        console.error('Error fetching subscription options:', error)
      }
    }
    fetchSubscriptionOptions()
  }, [])

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
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }


  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm() || !selectedPriceId) return
    setIsLoading(true)
    try {
      const response = await fetch('https://api.32beatwriters.com/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          priceId: selectedPriceId
        }),
      })
      const { url } = await response.json()
      window.location.href = url
    } catch (error) {
      console.error('Error creating checkout session:', error)
      setErrors({ general: 'Failed to create checkout session. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  const checkEmail = async (email: string) => {
          const response = await fetch('https://api.32beatwriters.com/api/users/check-email', {
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
          const response = await fetch('https://api.32beatwriters.com/api/users/check-username', {
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
            Gain Your Competitive Edge
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
                  <p className="text-gray-500 text-sm sm:text-base">Summaries All Offseason – The Best, Complete Reports in the Industry That's Used By Industry Leaders.</p>
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

              <div className="flex items-start space-x-3">
                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <Check className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm sm:text-base">Special</h4>
                  <p className="text-gray-500 text-sm sm:text-base">Exclusive podcast episodes. Playing in our Fantasy Football Leagues. Our Undying Love and Appreciation </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <Check className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm sm:text-base">Community Access</h4>
                  <p className="text-gray-500 text-sm sm:text-base">Join our exclusive community of subscribers and connect with like-minded people.</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="bg-card rounded-lg shadow-lg border border-border p-8">
              <form onSubmit={handleSubscribe} className="space-y-6">
                {errors.general && (
                  <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3">
                    <p className="text-sm text-destructive">{errors.general}</p>
                  </div>
                )}
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-foreground">Choose Your Plan</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {subscriptionOptions?.data.map((price) => (
                      <div
                        key={price.id}
                        className={`border rounded-lg p-4 cursor-pointer transition-all ${selectedPriceId === price.id
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                          }`}
                        onClick={() => setSelectedPriceId(price.id)}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="font-semibold text-foreground">
                              {price.recurring.interval === 'month' ? 'Monthly' : 'Annual'}
                            </h3>
                            <p className="text-muted-foreground">
                              {price.recurring.interval === 'month' ? 'Billed monthly' : 'Billed annually'}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-foreground">
                              ${(price.unit_amount / 100).toFixed(2)}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              per {price.recurring.interval}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
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
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-red-800 text-white hover:scale-101 py-3 px-4 rounded-md font-medium transition-colors disabled:opacity-50"
                >
                  {isLoading ? 'Processing...' : 'Subscribe Now'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 