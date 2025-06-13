'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

interface SubscriptionOption {
  id: string
  interval: 'month' | 'year'
  amount: number
  currency: string
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
    product: Product
    prices: SubscriptionOption[]
  } | null>(null)
  const [selectedPriceId, setSelectedPriceId] = useState<string>('')
  const [errors, setErrors] = useState<Partial<Record<keyof FormData | 'general', string>>>({})
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

  useEffect(() => {
    const fetchSubscriptionOptions = async () => {
      try {
        const response = await fetch('http://localhost:4004/api/stripe/subscription-options')
        const data = await response.json()
        setSubscriptionOptions(data)
        // Set default selected price to monthly
        const monthlyPrice = data.prices.find((price: SubscriptionOption) => price.interval === 'month')
        if (monthlyPrice) {
          setSelectedPriceId(monthlyPrice.id)
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
    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email format'
    }
    if (!formData.firstName) newErrors.firstName = 'First name is required'
    if (!formData.lastName) newErrors.lastName = 'Last name is required'
    if (!formData.phoneNumber) newErrors.phoneNumber = 'Phone number is required'
    if (!formData.address1) newErrors.address1 = 'Address is required'
    if (!formData.city) newErrors.city = 'City is required'
    if (!formData.state) newErrors.state = 'State is required'
    if (!formData.zipCode) newErrors.zipCode = 'ZIP code is required'
    if (!formData.username) newErrors.username = 'Username is required'
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
      const response = await fetch('http://localhost:4004/api/stripe/create-checkout-session', {
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

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Upgrade to Premium</h1>
          <p className="text-muted-foreground">Get access to all premium features and content</p>
        </div>
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
                {subscriptionOptions?.prices.map((price) => (
                  <div
                    key={price.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${
                      selectedPriceId === price.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => setSelectedPriceId(price.id)}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-semibold text-foreground">
                          {price.interval === 'month' ? 'Monthly' : 'Annual'}
                        </h3>
                        <p className="text-muted-foreground">
                          {price.interval === 'month' ? 'Billed monthly' : 'Billed annually'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-foreground">
                          ${price.amount}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          per {price.interval}
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
                    className={`w-full px-4 py-2 border rounded-md ${
                      errors.firstName ? 'border-destructive' : 'border-input'
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
                    className={`w-full px-4 py-2 border rounded-md ${
                      errors.lastName ? 'border-destructive' : 'border-input'
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
                  className={`w-full px-4 py-2 border rounded-md ${
                    errors.email ? 'border-destructive' : 'border-input'
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
                  className={`w-full px-4 py-2 border rounded-md ${
                    errors.phoneNumber ? 'border-destructive' : 'border-input'
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
                  className={`w-full px-4 py-2 border rounded-md ${
                    errors.address1 ? 'border-destructive' : 'border-input'
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
                    className={`w-full px-4 py-2 border rounded-md ${
                      errors.city ? 'border-destructive' : 'border-input'
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
                    className={`w-full px-4 py-2 border rounded-md ${
                      errors.state ? 'border-destructive' : 'border-input'
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
                    className={`w-full px-4 py-2 border rounded-md ${
                      errors.zipCode ? 'border-destructive' : 'border-input'
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
                  className={`w-full px-4 py-2 border rounded-md ${
                    errors.username ? 'border-destructive' : 'border-input'
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
                  className={`w-full px-4 py-2 border rounded-md ${
                    errors.password ? 'border-destructive' : 'border-input'
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
                  className={`w-full px-4 py-2 border rounded-md ${
                    errors.confirmPassword ? 'border-destructive' : 'border-input'
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
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 py-3 px-4 rounded-md font-medium transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Processing...' : 'Subscribe Now'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
} 