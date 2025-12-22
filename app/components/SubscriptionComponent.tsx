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


  const handleSubscribeFastDraft = (priceId: string) => {
    router.push('https://fastdraft.app/?ref=32BW')
  }


  if (!subscriptionOptions) {
    return (
      <div className="container mx-auto max-w-full px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <div className="animate-pulse text-muted-foreground">Loading subscription plans...</div>
        </div>
      </div>
    )
  }

  const monthlyPlan = subscriptionOptions.data.find(plan => plan.recurring.interval === 'month')
  const annualPlan = subscriptionOptions.data.find(plan => plan.recurring.interval === 'year')
  const fastDraftPlan = subscriptionOptions.data.find(plan => plan.recurring.interval === 'month' && plan.recurring.interval_count === 1)
  const currentPlan = selectedPlan === 'monthly' ? monthlyPlan : selectedPlan === 'yearly' ? annualPlan : null

  return (
    <div className="container mx-auto px-4 md:px-6 py-10 relative">
      {/* Background decoration for dark mode */}
      <div className="subscription-gradient absolute inset-0"></div>
      <div className="lg:hidden container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">

        <div className="text-center font-oswald mb-16">
          <h1 className="text-3xl">Our Pricing Plan</h1>
          <p className="mt-5">Signs up for exclusive access to all our reports, tools</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* Subscription Plans Section */}
          <div className="space-y-6">
            {/* Toggle Switch */}
            <div className="flex justify-center mb-6">
              <div className="rounded-full p-1 flex border-1 dark:border-[#72757C]">
                <button
                  onClick={() => setSelectedPlan('monthly')}
                  className={`px-6 py-4 rounded-full text-sm font-medium transition-all duration-300 ${selectedPlan === 'monthly'
                    ? 'bg-[var(--color-orange)] text-white shadow-sm'
                    : 'text-gray hover:text-gray-300'
                    }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setSelectedPlan('fastdraft')}
                  className={`px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 ${selectedPlan === 'fastdraft'
                    ? 'bg-[var(--color-orange)] text-white shadow-sm'
                    : 'text-gray hover:text-gray-300'
                    }`}
                >
                  First Month Free
                </button>
                <button
                  onClick={() => setSelectedPlan('yearly')}
                  className={`px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 ${selectedPlan === 'yearly'
                    ? 'bg-[var(--color-orange)] text-white shadow-sm'
                    : 'text-gray hover:text-gray-300'
                    }`}
                >
                  Yearly
                </button>
              </div>
            </div>

            {/* Subscription Card */}
            {selectedPlan !== 'fastdraft' && currentPlan && (
              <div className="flex flex-col w-full bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden relative text-black dark:bg-[#1A1A1A] dark:border-[#72757C]">
                {/* Gradient background */}
                <div className="absolute top-0 left-0 w-full h-1/2 
    bg-[linear-gradient(135deg,rgba(246,188,178,0.29)_0%,rgba(255,255,255,1)_100%),linear-gradient(to_bottom,rgba(246,188,178,0.29)_0%,rgba(255,255,255,1)_100%)] 
    bg-blend-overlay dark:bg-none">
                </div>
                {/* Background image */}
                <div className="absolute top-0 right-0 pointer-events-none opacity-30">
                  <Image src={selectedPlan === "monthly" ? `/monthly-plan-bg.png` : `/onetime-plan-bg.png`} alt="Plan background" width={300} height={300} loader={({ src }) => src} />
                </div>

                {/* Header */}
                <div className="flex justify-between items-center py-3 px-4 rounded-2xl z-10 relative m-3">
                  <div className="bg-white text-black text-sm sm:text-base px-3 py-1.5 rounded-full border border-gray-100 capitalize dark:text-[#D2D6E2] dark:bg-black dark:border-none">
                    {selectedPlan}
                  </div>
                  <div className="flex items-center">
                    <Image
                      src="/32bw_logo_black.svg"
                      alt="Logo"
                      height={60}
                      width={60}
                      className="object-contain"
                      loader={({ src }) => src}
                    />
                  </div>
                </div>

                {/* Inner content */}
                <div className="relative z-10 flex flex-col h-full p-5 sm:p-6">
                  <div className="text-left">
                    <p className="text-gray-500 text-sm mb-1 dark:text-[#C7C8CB]">Start at</p>
                    <div className="mb-4">
                      <span className="text-4xl font-semibold dark:text-white">
                        ${(currentPlan.unit_amount / 100).toFixed(2)}
                      </span>
                      <span className="text-base text-black dark:text-white"> /{selectedPlan === "monthly" ? "month" : "year"}</span>
                    </div>
                    <p className="text-gray-500 mb-6 text-sm dark:text-[#C7C8CB]">
                      {selectedPlan === "monthly"
                        ? "First month free with sign up"
                        : "Save more with yearly access"}
                    </p>
                  </div>

                  <button
                    onClick={() => handleSubscribe(currentPlan!.id)}
                    className="w-full text-lg py-3 rounded-full border transition-all duration-200 shadow-sm hover:shadow-md dark:text-[#D2D6E2] dark:border-[#72757C]"
                  >
                    Join {selectedPlan === "monthly" ? "Monthly" : "Yearly"}
                  </button>

                  {/* Features */}
                  <div className="mt-8 text-left border-t border-gray-200 pt-5">
                    <h4 className="font-semibold text-gray-800 mb-3 text-base leading-snug dark:text-white">
                      {selectedPlan === "monthly" ? "Free, Forever" : "Everything in Monthly, plus:"}
                    </h4>

                    <ul className="space-y-3 text-gray-600 text-sm dark:text-[#C7C8CB]">
                      {(selectedPlan === "monthly"
                        ? [
                          "Locked in Offseason Coverage From January to September",
                          "Player and Team Summaries – The Best, Complete, Customizable Feed in the Industry",
                          "Fantasy Analysis from Zareh Kantzabedian",
                          "Full Prospect Coverage from TJ Wengert",
                          "Betting Insight from Charlie Dillon",
                          "Access to Prospect and Fantasy Tools",
                          "Full Access to All Our Premium Articles",
                          "Secure Payment By Stripe - No Hidden Fees",


                        ]
                        : [
                          "Locked in Offseason Coverage From January to September",
                          "Player and Team Summaries – The Best, Complete, Customizable Feed in the Industry",
                          "Fantasy Analysis from Zareh Kantzabedian",
                          "Full Prospect Coverage from TJ Wengert",
                          "Betting Insight from Charlie Dillon",
                          "Access to Prospect and Fantasy Tools",
                          "Full Access to All Our Premium Articles",
                          "Secure Payment By Stripe - No Hidden Fees",


                        ]
                      ).map((text, i) => (
                        <li key={i} className="flex items-start gap-2 leading-snug">
                          <Image
                            src="/tick-mark.svg"
                            width={14}
                            height={14}
                            alt="Tick"
                            className="mt-1"
                            loader={({ src }) => src}
                          />
                          <span>{text}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* FastDraft Card (Mobile Only) */}
            {selectedPlan === 'fastdraft' && (
              <div className="flex flex-col w-full lg:hidden bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden relative text-black dark:bg-[#1A1A1A] dark:border-[#72757C]">

                {/* Gradient background */}
                <div className="absolute top-0 left-0 w-full h-1/2 
    bg-[linear-gradient(135deg,rgba(246,188,178,0.29)_0%,rgba(255,255,255,1)_100%),linear-gradient(to_bottom,rgba(246,188,178,0.29)_0%,rgba(255,255,255,1)_100%)] 
    bg-blend-overlay dark:bg-none">
                </div>
                {/* Background image */}
                <div className="absolute top-0 right-0 pointer-events-none opacity-30">
                  <Image src="/onetime-plan-bg.png" alt="Plan background" width={300} height={300} loader={({ src }) => src} />
                </div>

                {/* Header */}
                <div className="flex justify-between items-center bg-[#F6BCB2] py-3 px-4 rounded-2xl z-10 relative m-3 dark:bg-[#262829]">
                  <div className="bg-[var(--color-orange)] text-white text-sm sm:text-base px-3 py-1.5 rounded-full border border-gray-100 dark:border-none">
                    First Month Free
                  </div>
                  <div className="flex items-center">
                    <Image
                      src="/fast-draft-plan.svg"
                      alt="Logo"
                      height={100}
                      width={100}
                      className="object-contain"
                      loader={({ src }) => src}
                    />
                  </div>
                </div>

                {/* Inner content */}
                <div className="relative z-10 flex flex-col h-full p-5 sm:p-6">
                  <div className="text-left">
                    <p className="text-gray-500 text-sm mb-1 dark:text-[#C7C8CB]">Start at</p>
                    <div className="mb-4">
                      <span className="text-4xl font-semibold dark:text-white">$9.99</span>
                      <span className="text-base text-black dark:text-white"> /after free month</span>
                    </div>
                    <p className="text-gray-500 mb-6 text-sm dark:text-[#C7C8CB]">First month free with sign up</p>
                  </div>

                  <button
                    onClick={() => handleSubscribeFastDraft(fastDraftPlan!.id)}
                    className="w-full text-lg py-3 rounded-full border transition-all duration-200 shadow-sm hover:shadow-md dark:text-[#C7C8CB] dark:border-[#72757]"
                  >
                    Join with FastDraft
                  </button>

                  <div className="mt-8 text-left border-t border-gray-200 pt-5">
                    <h4 className="font-semibold text-gray-800 mb-3 text-base leading-snug dark:text-white">
                      Up to $50 deposit match

                      <span className="text-[var(--color-orange)] text-sm"> Use code “32BW”</span>
                    </h4>
                    <ul className="space-y-3 text-gray-600 text-sm">
                      {[
                        "Locked in Offseason Coverage From January to September",
                        "Player and Team Summaries – The Best, Complete, Customizable Feed in the Industry",
                        "Fantasy Analysis from Zareh Kantzabedian",
                        "Full Prospect Coverage from TJ Wengert",
                        "Betting Insight from Charlie Dillon",
                        "Access to Prospect and Fantasy Tools",
                        "Full Access to All Our Premium Articles",
                        "Secure Payment By Stripe - No Hidden Fees",


                      ].map((text, i) => (
                        <li key={i} className="flex items-start gap-2 leading-snug dark:text-[#C7C8CB]">
                          <Image src="/tick-mark.svg" width={14} height={14} alt="Tick" className="mt-1" loader={({ src }) => src} />
                          <span>{text}</span>
                        </li>
                      ))}
                    </ul>
                    <p className="text-[var(--color-orange)] mt-4 text-sm">
                      Account created within 24 hours of FastDraft sign up
                    </p>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      <div className="hidden lg:block mx-auto relative z-10">
        {/* Heading */}
        <div className="text-center font-oswald mb-16">
          <h1 className="text-5xl">Our Pricing Plan</h1>
          <p className="text-sm sm:text-base md:text-lg max-w-5xl mx-auto px-2 text-[var(--color-gray)] dark:text-[#C7C8CB] mt-6">Sign up for exclusive access to all our reports, tools</p>
        </div>


        <div className="gap-6 items-stretch hidden lg:flex">

          {/* CARD 1 - MONTHLY */}
          <div className="flex flex-col w-1/3 bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden relative mx-auto  text-center text-black hover:scale-105 dark:bg-[#1A1A1A] dark:border-none">

            {/* Gradient background */}
            <div className="absolute top-0 left-0 w-full h-1/2 
    bg-[linear-gradient(135deg,rgba(246,188,178,0.29)_0%,rgba(255,255,255,1)_100%),linear-gradient(to_bottom,rgba(246,188,178,0.29)_0%,rgba(255,255,255,1)_100%)] 
    bg-blend-overlay dark:bg-none">
            </div>

            {/* Top-right background image */}
            <div className="absolute top-0 right-0 pointer-events-none opacity-30">
              <Image
                src="/monthly-plan-bg.png"
                alt="Plan background"
                width={300}
                height={300}
                className="object-contain object-right-top"
                loader={({ src }) => src}
              />
            </div>

            {/* Inner content */}
            <div className="relative z-10 flex flex-col h-full p-8">
              {/* Header */}
              <div className="flex justify-between">
                <div className="inline-block bg-white text-gray-800 text-xl px-6 py-2 rounded-full mb-6 border border-gray-100 dark:text-[#D2D6E2] dark:bg-black dark:border-none">
                  Monthly
                </div>

                <div className="flex justify-center items-center mb-8">
                  <Image src="/32bw_logo_black.svg" alt="Logo" className="mr-2" height={40} width={40} loader={({ src }) => src} />
                  <div className="text-left">
                    <h3 className="text-base font-semibold leading-tight dark:text-[#D2D6E2]">32BeatWriters</h3>
                    <p className="text-sm text-gray-500">NFL Insider Network</p>
                  </div>
                </div>
              </div>

              {/* Price Section */}
              <div className="text-left">
                <p className="text-gray-500 text-sm mb-2 pt-2 dark:text-[#C7C8CB]">Start at</p>
                <div className="mb-6">
                  <span className="text-5xl dark:text-white">$9.99</span>
                  <span className="text-xl text-black dark:text-white">/month</span>
                </div>
                <p className="text-gray-500 mb-8 dark:text-[#C7C8CB]">
                  Signs up for exclusive access to all our reports, tools
                </p>
              </div>

              {/* Button */}
              <button
                onClick={() => handleSubscribe(currentPlan!.id)}
                className="w-full text-xl py-4 rounded-full border transition-all duration-200 shadow-sm hover:shadow-md hover:bg-[var(--color-orange)] hover:text-white dark:text-[#D2D6E2] dark:hover:text-white dark:border-1 dark:border-[#72757C] dark:hover:border-none hover:cursor-pointer"
              >
                Join Monthly
              </button>

              {/* Features */}
              <div className="mt-10 text-left border-t border-gray-200 pt-6 dark:border-t-[#72757C]">
                <h4 className="font-semibold text-gray-800 mb-4 text-xl dark:text-white">Monthly Plan</h4>
                <ul className="space-y-3 text-gray-600 text-sm">
                  {[
                    "Locked in Offseason Coverage From January to September",
                    "Player and Team Summaries – The Best, Complete, Customizable Feed in the Industry",
                    "Fantasy Analysis from Zareh Kantzabedian",
                    "Full Prospect Coverage from TJ Wengert",
                    "Betting Insight from Charlie Dillon",
                    "Access to Prospect and Fantasy Tools",
                    "Full Access to All Our Premium Articles",
                    "Secure Payment By Stripe - No Hidden Fees",


                  ].map((text, i) => (
                    <li key={i} className="flex items-center gap-3 text-base dark:text-[#C7C8CB]">
                      <Image src="/tick-mark.svg" width={16} height={16} alt="Tick" loader={({ src }) => src} />
                      <span>{text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* CARD 2 - ONE TIME PLAN */}
          <div className="flex flex-col w-1/3 bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden relative mx-auto  text-center text-black hover:scale-105 dark:bg-[#1A1A1A] dark:border-none">

            {/* Gradient background */}
            <div className="absolute top-0 left-0 w-full h-1/2 
    bg-[linear-gradient(135deg,rgba(246,188,178,0.29)_0%,rgba(255,255,255,1)_100%),linear-gradient(to_bottom,rgba(246,188,178,0.29)_0%,rgba(255,255,255,1)_100%)] 
    bg-blend-overlay dark:bg-none">
            </div>
            {/* Background image */}
            <div className="absolute top-0 right-0 pointer-events-none opacity-30">
              <Image src="/onetime-plan-bg.png" alt="Plan background" width={300} height={300} loader={({ src }) => src} />
            </div>

            {/* Header */}
            <div className="flex justify-between items-center bg-[#F6BCB2] py-4 px-4 rounded-2xl z-10 relative m-4 mt-2 dark:bg-[#262829]">
              <div className="bg-[var(--color-orange)] text-white text-lg px-4 py-2 rounded-full border border-gray-100">
                First Month Free
              </div>
              <div className="flex items-center">
                <Image src="/fast-draft-plan.svg" alt="Logo" height={150} width={150} className="object-contain" loader={({ src }) => src} />
              </div>
            </div>

            {/* Inner content */}
            <div className="relative z-10 flex flex-col h-full p-8 pt-2">
              <div className="text-left">
                <p className="text-gray-500 text-sm mb-2 pt-2 dark:text-[#C7C8CB]">Start at</p>
                <div className="mb-6">
                  <span className="text-5xl dark:text-white">$9.99</span>
                  <span className="text-xl text-black dark:text-white">/after free month</span>
                </div>
                <p className="text-gray-500 mb-8 dark:text-[#C7C8CB]">First month is free with sign up then $9.99 a month after</p>
              </div>
              <button
                onClick={() => handleSubscribeFastDraft(fastDraftPlan!.id)}
                className="w-full text-xl py-4 rounded-full border transition-all duration-200 shadow-sm hover:shadow-md hover:bg-[var(--color-orange)] hover:text-white dark:text-[#D2D6E2] dark:hover:text-white dark:border-1 dark:border-[#72757C] dark:hover:border-none hover:cursor-pointer"
              >
                Join with FastDraft
              </button>

              <div className="mt-10 text-left border-t border-gray-200 pt-6 dark:border-t-[#72757C]">
                <h4 className="font-semibold text-gray-800 mb-4 text-xl text-nowrap dark:text-white">
                  Up to $50 deposit match <span className="text-[var(--color-orange)] ml-0.5 text-lg">Use code “32BW”</span>
                </h4>
                <ul className="space-y-3 text-gray-600 text-sm">
                  {[
                    "Locked in Offseason Coverage From January to September",
                    "Player and Team Summaries – The Best, Complete, Customizable Feed in the Industry",
                    "Fantasy Analysis from Zareh Kantzabedian",
                    "Full Prospect Coverage from TJ Wengert",
                    "Betting Insight from Charlie Dillon",
                    "Access to Prospect and Fantasy Tools",
                    "Full Access to All Our Premium Articles",
                    "Secure Payment By Stripe - No Hidden Fees",


                  ].map((text, i) => (
                    <li key={i} className="flex items-center gap-3 text-base dark:text-[#C7C8CB]">
                      <div className="p-2 rounded-full flex items-center justify-center shrink-0 dark:bg-transparent">
                        <Image src="/tick-mark.svg" width={14} height={14} alt="Tick" loader={({ src }) => src} />
                      </div>
                      <span>{text}</span>
                    </li>
                  ))}
                </ul>
                <p className="text-[var(--color-orange)] mt-5">
                  Account created within 24 hours of FastDraft sign up
                </p>
              </div>
            </div>
          </div>

          {/* CARD 3 - YEARLY */}
          <div className="flex flex-col w-1/3 bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden relative mx-auto  text-center text-black hover:scale-105 dark:bg-[#1A1A1A] dark:border-none">

            {/* Gradient background */}
            <div className="absolute top-0 left-0 w-full h-1/2 
    bg-[linear-gradient(135deg,rgba(246,188,178,0.29)_0%,rgba(255,255,255,1)_100%),linear-gradient(to_bottom,rgba(246,188,178,0.29)_0%,rgba(255,255,255,1)_100%)] 
    bg-blend-overlay dark:bg-none">
            </div>
            {/* Background image */}
            <div className="absolute top-0 right-0 pointer-events-none opacity-30">
              <Image src="/yearly-plan-bg.png" alt="Plan background" width={300} height={300} loader={({ src }) => src} />
            </div>

            {/* Inner content */}
            <div className="relative z-10 flex flex-col h-full p-8">
              <div className="flex justify-between">
                <div className="inline-block bg-white text-gray-800 text-xl px-6 py-2 rounded-full mb-6 border border-gray-100 dark:text-[#D2D6E2] dark:bg-black dark:border-none">
                  Yearly
                </div>
                <div className="flex justify-center items-center mb-8">
                  <Image src="/32bw_logo_black.svg" alt="Logo" className="mr-2" height={40} width={40} loader={({ src }) => src} />
                  <div className="text-left">
                    <h3 className="text-base font-semibold leading-tight dark:text-[#D2D6E2]">32BeatWriters</h3>
                    <p className="text-sm text-gray-500">NFL Insider Network</p>
                  </div>
                </div>
              </div>

              <div className="text-left">
                <p className="text-gray-500 text-sm mb-2 pt-2 dark:text-[#C7C8CB]">Start at</p>
                <div className="mb-6">
                  <span className="text-5xl dark:text-white">$49.99</span>
                  <span className="text-xl text-black dark:text-white">/year</span>
                </div>
                <p className="text-gray-500 mb-8 dark:text-[#C7C8CB]">
                  Signs up for exclusive access to all our reports, tools
                </p>
              </div>

              <button
                onClick={() => handleSubscribe(currentPlan!.id)}
                className="w-full text-xl py-4 rounded-full border transition-all duration-200 shadow-sm hover:shadow-md hover:bg-[var(--color-orange)] hover:text-white dark:text-[#D2D6E2] dark:hover:text-white dark:border-1 dark:border-[#72757C] dark:hover:border-none hover:cursor-pointer"
              >
                Join Yearly
              </button>

              <div className="mt-10 text-left border-t border-gray-200 pt-6 dark:border-t-[#72757C]">
                <h4 className="font-semibold text-gray-800 mb-4 text-xl dark:text-white">Yearly Plan</h4>
                <ul className="space-y-3 text-gray-600 text-sm">
                  {[
                    "Locked in Offseason Coverage From January to September",
                    "Player and Team Summaries – The Best, Complete, Customizable Feed in the Industry",
                    "Fantasy Analysis from Zareh Kantzabedian",
                    "Full Prospect Coverage from TJ Wengert",
                    "Betting Insight from Charlie Dillon",
                    "Access to Prospect and Fantasy Tools",
                    "Full Access to All Our Premium Articles",
                    "Secure Payment By Stripe - No Hidden Fees",


                  ].map((text, i) => (
                    <li key={i} className="flex items-center gap-3 text-base dark:text-[#C7C8CB]">
                      <Image src="/tick-mark.svg" width={16} height={16} alt="Tick" loader={({ src }) => src} />
                      <span>{text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>


      </div>

    </div>
  )
}