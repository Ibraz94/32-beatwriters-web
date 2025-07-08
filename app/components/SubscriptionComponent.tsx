'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Check } from 'lucide-react'
import Image from 'next/image'

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
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly')
  const router = useRouter()

  useEffect(() => {
    const fetchSubscriptionOptions = async () => {
      try {
        const response = await fetch('https://api.32beatwriters.com/api/stripe/subscription-options')
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
    "Ability to search insight and updates",
    "Access to all our Premium articles", 
    "Exclusive podcast episodes",
    "Playing in our Fantasy Football Leagues",
    "Our Undying Love and Appreciation",
    "Secure Payment By Stripe - No Hidden Fees"
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
  const currentPlan = selectedPlan === 'monthly' ? monthlyPlan : annualPlan

  return (
    <div className="bg-background py-16 relative overflow-hidden border-t border-border mb-10">
      {/* Background decoration for dark mode */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-muted/20 to-background"></div>
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">

      <div className="text-center text-white mb-16">
        <h1 className="text-6xl font-bold">Our Pricing Plan</h1>
        <p className="text-xl mt-6">Signs up for exclusive access to all our reports, tools</p>
      </div>
      
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          
          {/* Benefits Section */}
          <div className="space-y-8">
            <div className="space-y-6">
              <h2 className="text-3xl lg:text-5xl font-bold text-foreground leading-tight">
                What you'll get with your subscription:
              </h2>
              
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-start space-x-4">
                  <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center flex-shrink-0 mt-1">
                    <Check className="w-4 h-4 text-white dark:text-black" />
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
                  Yearly (save 20%)
                </button>
              </div>
            </div>

            {/* Subscription Card */}
            {currentPlan && (
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
                    {selectedPlan === 'yearly' && <span className="text-lg"> (save 20%)</span>}
                  </h4>
                  <p className="text-slate-300 mb-8">
                    Perfect for trying out our premium content
                  </p>
                  
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

          </div>
        </div>
      </div>
    </div>
  )
}