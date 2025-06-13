'use client'

import { useState } from 'react'
import { Check, CreditCard, User, MapPin, Shield, Star } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

interface FormData {
  // Personal Information
  firstName: string
  lastName: string
  email: string
  phone: string
  dateOfBirth: string
  
  // Address Information
  address: string
  city: string
  state: string
  zipCode: string
  country: string
  
  // Subscription Information
  plan: 'monthly' |  'annual'
  
  // Payment Information
  cardNumber: string
  expiryDate: string
  cvv: string
  cardholderName: string
  
  // Preferences
  newsletter: boolean
  smsUpdates: boolean
  exclusiveOffers: boolean
}

export default function PremiumSignup() {
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const router = useRouter()

  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
    plan: 'monthly',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
    newsletter: true,
    smsUpdates: false,
    exclusiveOffers: true
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.firstName && formData.lastName && formData.email && formData.phone)
      case 2:
        return !!(formData.address && formData.city && formData.state && formData.zipCode)
      case 3:
        return !!(formData.plan)
      case 4:
        return !!(formData.cardNumber && formData.expiryDate && formData.cvv && formData.cardholderName)
      default:
        return true
    }
  }

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 5))
    }
  }

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateStep(4)) return

    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      setIsSuccess(true)
      setIsSubmitting(false)
    }, 2000)
  }

  const planPrices = {
    monthly: { price: 10.00, billing: 'per month', savings: '' },
    annual: { price: 7.00, billing: 'per year', savings: 'Save 30%' }
  }

//   if (isSuccess) {
//     return (
//       <div className="flex mt-52 mb-78 items-center justify-center px-4">
//         <div className="max-w-md w-full rounded-2xl border-2 p-8 text-center">
//           <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
//             <Check className="w-8 h-8 text-green-600" />
//           </div>
//           <h2 className="text-2xl font-bold mb-2">Welcome to Premium!</h2>
//           <p className="mb-6">
//             Your subscription is now active. You'll receive a confirmation email shortly with your premium access details.
//           </p>
//           <button
//             onClick={() => router.push('/')}
//             className="w-full bg-red-800 text-white py-3 px-6 rounded-lg font-semibold hover:bg-red-900 transition-colors"
//           >
//             Get Started
//           </button>
//         </div>
//       </div>
//     )
//   }

  return (
    <div className="py-4 sm:py-6 px-4 pt-12 sm:pt-16">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 leading-tight">
            Get Our Premium <span className="text-red-800">Membership</span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl max-w-2xl mx-auto px-2">
            Unlock exclusive content, advanced insights, and premium features designed for serious fantasy football enthusiasts.
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-6 sm:mb-8 sm:block hidden">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            {[1, 2, 3, 4, 5].map((step) => (
              <div key={step} className="flex items-center flex-1">
                <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-semibold ${
                  currentStep >= step ? 'bg-red-800 text-white' : 'bg-gray-300 text-gray-600'
                }`}>
                  {step}
                </div>
                {step < 5 && (
                  <div className={`flex-1 h-1 sm:w-[168px] w-[55px] mx-auto sm:mx-2 ${
                    currentStep > step ? 'bg-red-800' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="hidden sm:flex justify-between text-xs">
            <span>Personal</span>
            <span>Address</span>
            <span>Plan</span>
            <span>Review</span>
            <span>Payment</span>
          </div>
        </div>

        {/* Form */}
        <div className="rounded-lg sm:rounded-2xl border shadow-sm p-4 sm:p-6 md:p-8">
          <form onSubmit={handleSubmit}>
            {/* Step 1: Personal Information */}
            {currentStep === 1 && (
              <div className="space-y-4 sm:space-y-6">
                <div className="flex items-center mb-4 sm:mb-6">
                  <User className="w-5 h-5 sm:w-6 sm:h-6 text-red-800 mr-2 sm:mr-3" />
                  <h2 className="text-xl sm:text-2xl font-bold">Personal Information</h2>
                </div>
                
                <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      First Name *
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg text-sm sm:text-base"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg text-sm sm:text-base"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg text-sm sm:text-base"
                    required
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg text-sm sm:text-base"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleInputChange}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg text-sm sm:text-base"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Address Information */}
            {currentStep === 2 && (
              <div className="space-y-4 sm:space-y-6">
                <div className="flex items-center mb-4 sm:mb-6">
                  <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-red-800 mr-2 sm:mr-3" />
                  <h2 className="text-xl sm:text-2xl font-bold">Address Information</h2>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Street Address *
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg text-sm sm:text-base"
                    required
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg text-sm sm:text-base"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      State/Province *
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg text-sm sm:text-base"
                      required
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      ZIP/Postal Code *
                    </label>
                    <input
                      type="text"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleInputChange}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg text-sm sm:text-base"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Country
                    </label>
                    <select
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg text-sm sm:text-base"
                    >
                      <option value="United States">United States</option>
                      <option value="Canada">Canada</option>
                      <option value="United Kingdom">United Kingdom</option>
                      <option value="Australia">Australia</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Subscription Plan */}
            {currentStep === 3 && (
              <div className="space-y-4 sm:space-y-6">
                <div className="flex items-center mb-4 sm:mb-6">
                  <Star className="w-5 h-5 sm:w-6 sm:h-6 text-red-800 mr-2 sm:mr-3" />
                  <h2 className="text-xl sm:text-2xl font-bold">Choose Your Plan</h2>
                </div>

                <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
                  {Object.entries(planPrices).map(([planKey, planInfo]) => (
                    <div
                      key={planKey}
                      className={`border-2 rounded-lg sm:rounded-xl p-4 sm:p-6 cursor-pointer transition-all ${
                        formData.plan === planKey 
                          ? 'scale-102 shadow-xl border-red-800'   
                          : 'scale-100 hover:border-red-300'
                      }`}
                      onClick={() => setFormData(prev => ({ ...prev, plan: planKey as any }))}
                    >
                      <div className="text-center">
                        <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold capitalize mb-2">{planKey}</h3>
                        <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-red-800 mb-1">
                          ${planInfo.price}
                        </div>
                        <div className="text-base sm:text-lg md:text-xl mb-3 sm:mb-4">{planInfo.billing}</div>
                        {planInfo.savings && (
                          <div className="text-green-800 text-xs sm:text-sm font-bold px-2 py-1 rounded-full bg-green-100">
                            {planInfo.savings}
                          </div>
                        )}
                      </div>
                      <div className="mt-4">
                        <input
                          type="radio"
                          name="plan"
                          value={planKey}
                          checked={formData.plan === planKey}
                          onChange={handleInputChange}
                          className="sr-only"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="rounded-lg bg-gray-50 p-4 sm:p-6">
                  <h3 className="font-bold mb-3 sm:mb-4 text-sm sm:text-base">All plans include:</h3>
                  <div className="grid sm:grid-cols-2 gap-2 sm:gap-3">
                    {[
                      'Exclusive premium content',
                      'Advanced analytics & insights',
                      'Early access to articles',
                      'Premium podcast episodes',
                      'Fantasy football league access',
                      'Member-only community',
                      'Priority customer support',
                    ].map((feature, index) => (
                      <div key={index} className="flex items-center">
                        <Check className="w-4 h-4 text-green-600 mr-2" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

               {/* Step 4: Review & Preferences */}
               {currentStep === 4 && (
              <div className="space-y-4 sm:space-y-6">
                <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Review & Preferences</h2>

                {/* Order Summary */}
                <div className="rounded-lg bg-gray-50 p-4 sm:p-6">
                  <h3 className="font-bold mb-3 sm:mb-4 text-sm sm:text-base">Order Summary</h3>
                  <div className="flex justify-between items-center mb-2">
                    <span>Plan: {formData.plan.charAt(0).toUpperCase() + formData.plan.slice(1)}</span>
                    <span className="font-bold">${planPrices.monthly.price}</span>
                  </div>
                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between items-center font-bold">
                      <span>Total</span>
                      <span>${planPrices.annual.price}</span>
                    </div>
                  </div>
                </div>

                {/* Communication Preferences */}
                <div className="space-y-3 sm:space-y-4">
                  <h3 className="font-bold text-sm sm:text-base">Communication Preferences</h3>
                  
                  <div className="space-y-3 sm:space-y-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="newsletter"
                        checked={formData.newsletter}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-red-800 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm">Receive our weekly newsletter with exclusive insights</span>
                    </label>
                    
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="smsUpdates"
                        checked={formData.smsUpdates}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-red-800 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm">Receive SMS updates for breaking news and urgent alerts</span>
                    </label>
                    
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="exclusiveOffers"
                        checked={formData.exclusiveOffers}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-red-800 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm">Receive exclusive offers and promotions</span>
                    </label>
                  </div>
                </div>

                {/* Terms and Conditions */}
                <div className="text-xs space-y-2">
                  <p>
                    By completing this purchase, you agree to our Terms of Service and Privacy Policy.
                    Your subscription will automatically renew at the end of each billing period.
                  </p>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-4 sm:mt-6 pt-4 sm:pt-6 border-t">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="px-4 sm:px-6 py-2 sm:py-3 border border-gray-300 bg-red-800 text-white rounded-lg font-semibold cursor-pointer hover:scale-103 transition-all text-sm sm:text-base"
                >
                  Previous
                </button>
              )}
              
              {currentStep < 4 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  disabled={!validateStep(currentStep)}
                  className="ml-auto px-4 sm:px-6 py-2 sm:py-3 bg-red-800 text-white rounded-lg font-semibold cursor-pointer hover:scale-103 disabled:bg-gray-400 disabled:text-white disabled:cursor-not-allowed transition-all text-sm sm:text-base"
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="ml-auto px-6 sm:px-8 py-2 sm:py-3 bg-red-800 text-white rounded-lg font-semibold cursor-pointer hover:bg-red-900 disabled:bg-gray-400 disabled:text-white disabled:cursor-not-allowed transition-all text-sm sm:text-base"
                >
                  {/* {isSubmitting ? 'Processing...' : 'Complete Purchase'} */}
                  Complete Purchase
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Trust Signals */}
        <div className="mt-6 sm:mt-8 text-center">
          <p className="text-gray-600 mb-3 sm:mb-4 text-sm sm:text-base px-4">Trusted by thousands of fantasy football enthusiasts</p>
          <div className="flex justify-center items-center space-x-3 sm:space-x-6 md:space-x-8 opacity-60 flex-wrap gap-2 sm:gap-0">
            <div className="text-xs sm:text-sm text-gray-500">🔒 SSL Secured</div>
            <div className="text-xs sm:text-sm text-gray-500">💳 Secure Payment</div>
            <div className="text-xs sm:text-sm text-gray-500">⚡️ Instant Access</div>
            <div className="text-xs sm:text-sm text-gray-500">📱 Mobile Friendly</div>
          </div>
        </div>
      </div>
    </div>
  )
}
