'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Check } from 'lucide-react'
import Image from 'next/image'
import { buildApiUrl, API_CONFIG } from '@/lib/config/api'

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

export default function SubscriptionComponent() {
  const [subscriptionOptions, setSubscriptionOptions] = useState<{
    data: SubscriptionOption[]
  } | null>(null)
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly' | 'fastdraft'>('yearly')
  const router = useRouter()

  useEffect(() => {
    const fetchSubscriptionOptions = async () => {
      try {
        const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.STRIPE.SUBSCRIPTION_OPTIONS))
        const data = await response.json()
        setSubscriptionOptions(data)
      } catch (error) {
        console.error('Error fetching subscription options:', error)
      }
    }
    fetchSubscriptionOptions()
  }, [])

  const handleSubscribe = (priceId: string) => {
    router.push('/subscribe')
  }

  const benefits = [
    "Summaries All Offseason – The Best, Complete Reports in the Industry That's Used By Industry Leaders",
    "Ability to search insight and updates on our News Feed",
    "Access to all our Premium articles", 
    "Exclusive podcast episodes",
    "Playing in our Fantasy Football Leagues",
    "Our Undying Love and Appreciation",
    "Secure Payment By Stripe - No Hidden Fees",
    "Access to all additional features as they roll out for no additional cost"
  ]

  if (!subscriptionOptions) {
    return (
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <div className="animate-pulse text-muted-foreground">Loading subscription plans...</div>
        </div>
      </div>
    )
  }

  const monthlyPlan = subscriptionOptions.data.find(plan => plan.recurring.interval === 'month')
  const annualPlan = subscriptionOptions.data.find(plan => plan.recurring.interval === 'year')
  const currentPlan = selectedPlan === 'monthly' ? monthlyPlan : selectedPlan === 'yearly' ? annualPlan : null

  return (
    <div className="bg-transparent py-16 relative overflow-hidden">
      {/* Background decoration for dark mode */}
      <div className="subscription-gradient absolute inset-0"></div>
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">

      <div className="text-center font-oswald mb-16">
        <h1 className="text-6xl font-bold ">Our Pricing Plan</h1>
        <p className="text-xl mt-6">Signs up for exclusive access to all our reports, tools</p>
      </div>
      
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          
          {/* Benefits Section */}
          <div className="space-y-8">
            <div className="space-y-6">
              <h2 className="text-3xl font-oswald lg:text-5xl font-bold text-foreground leading-tight">
                What you'll get with your subscription:
              </h2>
              
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-start space-x-4">
                  <div className="check-circle w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Check className="check-icon w-4 h-4" />
                  </div>
                  <p className="text-lg leading-relaxed text-foreground">{benefit}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Subscription Plans Section */}
          <div className="space-y-6">
            {/* Toggle Switch */}
            <div className="flex justify-center mb-6">
              <div className="bg-[#2C204B] rounded-full p-1 flex">
                <button
                  onClick={() => setSelectedPlan('monthly')}
                  className={`px-6 py-4 rounded-full text-sm font-medium transition-all duration-300 ${
                    selectedPlan === 'monthly'
                      ? 'bg-[#4F4078] text-white shadow-sm'
                      : 'text-white hover:text-gray-300'
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setSelectedPlan('yearly')}
                  className={`px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 ${
                    selectedPlan === 'yearly'
                      ? 'bg-[#4F4078] text-white shadow-sm'
                      : 'text-white hover:text-gray-300'
                  }`}
                >
                  Yearly (Save Over 15%)
                </button>
                <button
                  onClick={() => setSelectedPlan('fastdraft')}
                  className={`px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 ${
                    selectedPlan === 'fastdraft'
                      ? 'bg-[#4F4078] text-white shadow-sm'
                      : 'text-white hover:text-gray-300'
                  }`}
                >
                  FastDraft
                </button>
              </div>
            </div>

            {/* Subscription Card */}
            {selectedPlan !== 'fastdraft' && currentPlan && (
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden max-w-2xl mx-auto">
                {/* Header Section */}
                <div className={`p-6 text-center ${
                  selectedPlan === 'monthly' 
                    ? 'bg-gradient-to-r from-red-700 to-red-800' 
                    : 'bg-gradient-to-r from-yellow-400 to-yellow-500'
                }`}>
                  <div className="flex items-center justify-center space-x-3 mb-2">
                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
                      <Image 
                        src="/logo-small.webp" 
                        alt="32BW Logo" 
                        width={50} 
                        height={50} 
                        className="object-contain"
                      />
                    </div>
                    <div className="text-left">
                      <h3 className="text-4xl font-bold text-white">32BeatWriters</h3>
                      <p className="text-lg text-white/90">NFL Insider Network</p>
                    </div>
                  </div>
                </div>
                
                {/* Content Section */}
                <div className="bg-[#2C204B] p-8 text-center text-white">
                  <h4 className="text-3xl font-bold mb-2">
                    {selectedPlan === 'monthly' ? 'Monthly Plan' : 'Yearly Plan'} 
                    {selectedPlan === 'yearly' && <span className="text-lg"> (Save Over 15%)</span>}
                  </h4>
                  <p className='mb-6'></p>
                  
                  <div className="mb-8">
                    <span className="text-5xl font-bold">
                      ${(currentPlan.unit_amount / 100).toFixed(2)}
                    </span>
                    <span className="text-xl text-slate-300">
                      /{selectedPlan === 'monthly' ? 'month' : 'year'}
                    </span>
                  </div>
                  
                  <button
                    onClick={() => handleSubscribe(currentPlan.id)}
                    className={`w-full text-white font-bold hover:cursor-pointer py-4 rounded-md transition-all duration-200 text-xl shadow-md hover:shadow-lg transform hover:-translate-y-0.5 ${
                      selectedPlan === 'monthly'
                        ? 'bg-gradient-to-r from-red-700 to-red-800 hover:from-red-600 hover:to-red-700'
                        : 'bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black'
                    }`}
                  >
                    Join {selectedPlan === 'monthly' ? 'Monthly' : 'Yearly'}
                  </button>
                </div>
              </div>
            )}

            {/* FastDraft Card */}
            {selectedPlan === 'fastdraft' && (
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden max-w-2xl mx-auto">
                {/* Header with logo on black background */}
                <div className="bg-black p-6 flex items-center justify-center">
                  <div className="w-full max-w-xs">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 227.08 43.65" className="w-full h-auto">
                      <polygon points="15 25.95 17.47 18.43 26.34 18.43 28.56 11.7 10.56 11.7 5.9 25.95 15 25.95" fill="#ff3401" strokeWidth="0"></polygon>
                      <polygon points="33.82 .46 14.22 .46 11.63 8.4 31.23 8.4 33.82 .46" fill="#ff3401" strokeWidth="0"></polygon>
                      <path d="m51.59.46l.9,25.48h-9.57v-3.99s-7.24,0-7.24,0l-2.44,3.99h-10.57L39.78.46h11.81Zm-12.31,14.87h3.91v-2.36c0-1.01.48-5.42.48-5.42h-.23s-2,4.22-2.64,5.34l-1.52,2.44Z" fill="#ff3401" strokeWidth="0"></path>
                      <path d="m52.79,24.01l3.36-6.85c1.72,1.16,4.97,2.21,7.76,2.21,1.9,0,2.82-.62,2.95-1.7.04-.35-.11-.7-.7-.93-.6-.19-2.03-.5-3.76-.97-1.8-.46-3.05-1.08-4.04-1.9-1.06-.89-1.8-2.48-1.57-4.45.64-5.46,5.51-9.41,13.03-9.41,3.95,0,7.39,1.05,9.2,2.17l-3.38,6.74c-1.41-.89-4.51-1.82-6.91-1.82-1.47,0-2.68.43-2.81,1.47-.05.39.16.66.6.81.94.23,2.04.46,3.88.97,1.91.54,3.3,1.24,4.1,2.05,1.22,1.16,1.64,2.87,1.46,4.41-.62,5.31-4.8,9.6-12.93,9.6-4.26,0-8.27-1.12-10.21-2.4Z" fill="#ff3401" strokeWidth="0"></path>
                      <path d="m84.09,8.4h-6.66l2.59-7.94h22.38l-2.59,7.94h-6.66l-5.77,17.54h-9.06l5.77-17.54Z" fill="#ff3401" strokeWidth="0"></path>
                      <path d="m130.42.46h11.08c6.85,0,9.62,3.52,9.09,8.06-.47,4.03-2.63,6.93-5.96,8.56v.08s1.13,8.79,1.13,8.79h-9.26l-.98-7.2h-1.98l-2.35,7.2h-9.14L130.42.46Zm7.49,12.12c2.17,0,3.38-1.05,3.6-2.98.13-1.08-.52-1.82-2.27-1.82h-2.09l-1.57,4.8h2.32Z" fill="#fff" strokeWidth="0"></path>
                      <path d="m174.41.46l.9,25.48h-9.57v-3.99s-7.24,0-7.24,0l-2.44,3.99h-10.57L162.6.46h11.81Zm-12.31,14.87h3.91v-2.36c0-1.01.48-5.42.48-5.42h-.23s-2,4.22-2.64,5.34l-1.52,2.44Z" fill="#fff" strokeWidth="0"></path>
                      <polygon points="204.31 .46 203.13 .46 184.71 .46 176.39 25.95 185.5 25.95 187.96 18.43 196.83 18.43 199.05 11.7 190.18 11.7 191.3 8.4 200.54 8.4 201.72 8.4 208.77 8.4 203 25.95 212.06 25.95 217.83 8.4 224.49 8.4 227.08 .46 204.31 .46" fill="#fff" strokeWidth="0"></polygon>
                      <path d="m114.27.46h-9.33l-2.6,7.94h10.7c2.71,0,3.43,1.16,3.19,3.21-.43,3.68-2.8,6.43-5.98,6.43h-1.94l2.09-6.35h-9.15l-4.68,14.25h11.31c9.95,0,16.47-6.39,17.51-15.3.74-6.35-3.23-10.19-11.13-10.19Z" fill="#fff" strokeWidth="0"></path>
                      <polygon points="53.61 37.79 55.19 37.79 54.96 34.76 53.61 37.79" fill="#fff" strokeWidth="0"></polygon>
                      <path d="m4.46,30.09L0,43.65h213.24l4.34-13.55H4.46Zm27.82,4.7h-3.73l-.28,1.46h2.95l-.34,1.85h-2.95l-.59,3.21h-2.37l1.55-8.4h6.1l-.34,1.87Zm23.17,6.52l-.13-1.73h-2.51l-.77,1.73h-2.48l4.16-8.4h3.1l1.08,8.4h-2.46Zm29.55,0h-1.99l-2.26-4.81-.89,4.81h-2.29l1.55-8.4h2.26l2.07,4.46.82-4.46h2.29l-1.55,8.4Zm27.71-6.48h-2.14l-1.2,6.48h-2.37l1.2-6.48h-2.14l.35-1.92h6.66l-.35,1.92Zm22.82,6.48l-.13-1.73h-2.51l-.77,1.73h-2.48l4.16-8.4h3.1l1.08,8.4h-2.46Zm29.52-6.76l-.19,1.07h-2.37l.13-.68c.03-.17-.01-.22-.19-.22h-1.36c-.16,0-.23.05-.25.22l-.13.65c-.04.17,0,.2.2.26l2.19.6c1.17.31,1.68.54,1.46,1.69l-.29,1.55c-.2,1.1-.84,1.63-1.98,1.63h-3.37c-1.13,0-1.58-.53-1.37-1.63l.21-1.15h2.37l-.14.77c-.04.17,0,.22.18.22h1.53c.18,0,.24-.05.28-.22l.13-.73c.03-.17-.03-.2-.2-.25l-2.18-.61c-1.17-.32-1.68-.54-1.46-1.69l.26-1.46c.21-1.1.84-1.63,1.98-1.63h3.19c1.13,0,1.59.53,1.37,1.63Zm23.75,4.16l-.48,2.6h-2.37l.48-2.6-1.68-5.79h2.5l.72,3.56,2.03-3.56h2.62l-3.82,5.79Z" fill="#fff" strokeWidth="0"></path>
                      <polygon points="133.68 37.79 135.26 37.79 135.03 34.76 133.68 37.79" fill="#fff" strokeWidth="0"></polygon>
                    </svg>
                  </div>
                </div>
                {/* Content */}
                <div className="bg-[#2C204B] p-8 text-center text-white">
                  <h4 className="text-2xl font-bold mb-1">First month free with sign up</h4>
                  <p className="text-sm mb-4">($9.99 a month after that)</p>
                  <p className="text-2xl font-bold mb-2">Up to $50 deposit match</p>
                  <p className="text-xl mb-8">Use code “32BW”</p>

                  <button
                    onClick={() => window.open('https://fastdraft.app/?ref=32BW', '_blank')}
                    className="w-full bg-black text-white font-bold hover:cursor-pointer py-4 rounded-xl transition-all duration-200 text-xl shadow-md hover:shadow-lg"
                  >
                    Join with FastDraft
                  </button>

                  <p className="text-sm mt-6 opacity-90">Account created within 24 hours of FastDraft sign up</p>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}