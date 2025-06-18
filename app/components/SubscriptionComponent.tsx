'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Check, Star } from 'lucide-react'
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
  const router = useRouter()

  useEffect(() => {
    const fetchSubscriptionOptions = async () => {
      try {
        const response = await fetch('https://api.32beatwriters.staging.pegasync.com/api/stripe/subscription-options')
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
    "Our Undying Love and Appreciation"
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

  return (
    <div className="bg-background py-16 relative overflow-hidden border-t border-border">
      {/* Background decoration for dark mode */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-muted/20 to-background"></div>
      
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Benefits Section */}
          <div className="space-y-8">
            <div className="space-y-6">
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground leading-tight">
                What you'll get with your subscription:
              </h2>
              
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-start space-x-4">
                  <div className="w-6 h-6 rounded-full bg-green-500 dark:bg-green-400 flex items-center justify-center flex-shrink-0 mt-1">
                    <Check className="w-4 h-4 text-white dark:text-black" />
                  </div>
                  <p className="text-lg leading-relaxed text-foreground">{benefit}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Subscription Plans Section */}
          <div className="space-y-6">
            {/* Monthly Plan */}
            {monthlyPlan && (
              <div className="bg-card border border-border rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group hover:-translate-y-1">
                <div className="bg-gradient-to-t from-red-800 to-red-900 p-6 text-center relative">
                  <div className="mb-4">
                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto">
                      <Image 
                        src="/logo-small.webp" 
                        alt="32BW Logo" 
                        width={50} 
                        height={50} 
                        className="object-contain"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="p-8 text-center">
                  <h3 className="text-2xl font-bold text-card-foreground mb-2">Monthly Plan</h3>
                  <p className="text-muted-foreground mb-6">
                    Perfect for trying out our premium content
                  </p>
                  
                  <div className="mb-8">
                    <span className="text-5xl font-bold text-card-foreground">
                      ${(monthlyPlan.unit_amount / 100).toFixed(2)}
                    </span>
                    <span className="text-xl text-muted-foreground">/month</span>
                  </div>
                  
                  <button
                    onClick={() => handleSubscribe(monthlyPlan.id)}
                    className="w-full bg-red-800 hover:bg-red-700 text-white font-semibold py-4 px-8 rounded-xl transition-colors duration-200 text-lg shadow-md hover:shadow-lg"
                  >
                    Join Monthly
                  </button>
                </div>
              </div>
            )}

            {/* Annual Plan */}
            {annualPlan && (
              <div className="bg-card border-2 border-yellow-400 dark:border-yellow-500 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group hover:-translate-y-1 relative">

                
                <div className="bg-gradient-to-t from-yellow-500 to-yellow-600 p-6 text-center relative">
                  <div className="mb-4">
                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto">
                      <Image 
                        src="/logo-small.webp" 
                        alt="32BW Logo" 
                        width={50} 
                        height={50} 
                        className="object-contain"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="p-8 text-center">
                  <h3 className="text-2xl font-bold text-card-foreground mb-2">Annual Plan</h3>
                  <p className="text-muted-foreground mb-6">
                    Best value for serious fantasy players
                  </p>
                  
                  <div className="mb-4">
                    <span className="text-5xl font-bold text-card-foreground">
                      ${(annualPlan.unit_amount / 100).toFixed(2)}
                    </span>
                    <span className="text-xl text-muted-foreground">/year</span>
                  </div>
                  
                  <div className="mb-8 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <span className="text-lg text-green-900 dark:text-green-900 font-semibold">
                      💰 Save ${((monthlyPlan?.unit_amount || 0) * 12 - annualPlan.unit_amount) / 100} per year!
                    </span>
                    <p className="text-sm text-green-900 dark:text-green-900 mt-1">
                      That's {Math.round((((monthlyPlan?.unit_amount || 0) * 12 - annualPlan.unit_amount) / ((monthlyPlan?.unit_amount || 0) * 12)) * 100)}% off monthly pricing
                    </p>
                  </div>
                  
                  <button
                    onClick={() => handleSubscribe(annualPlan.id)}
                    className="w-full bg-yellow-600 hover:bg-yellow-600 text-black font-semibold py-4 px-8 rounded-xl transition-colors duration-200 text-lg shadow-md hover:shadow-lg"
                  >
                    Join Annual
                  </button>
                </div>
              </div>
            )}

            {/* Additional Info */}
            <div className="mt-8 p-6 bg-muted/50 rounded-xl border border-border">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">
                  🔒 Secure payment powered by Stripe
                </p>
                <p className="text-sm text-muted-foreground">
                  No hidden fees • Full access immediately
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}