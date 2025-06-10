'use client'

import { useState } from 'react'
import { Check } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

export default function Subscribe() {
    const [email, setEmail] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSubscribed, setIsSubscribed] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!email) return

        setIsSubmitting(true)

        // Simulate API call
        setTimeout(() => {
            setIsSubscribed(true)
            setIsSubmitting(false)
            setEmail('')
        }, 1000)
    }

    const router = useRouter()

    if (isSubscribed) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome aboard!</h2>
                    <p className="text-gray-600 mb-6">
                        Thank you for subscribing. You'll receive our latest updates and exclusive content in your inbox.
                    </p>
                    <button
                        onClick={() => setIsSubscribed(false)}
                        className="text-red-600 hover:text-red-700 font-medium"
                    >
                        Subscribe another email →
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto max-w-7xl flex items-center justify-center px-4 sm:px-6 lg:px-8 mt-8 sm:mt-12 lg:mt-16 mb-16 sm:mb-20 lg:mb-24">
            <div className="max-w-4xl w-full">

                <div className="text-center mb-8 sm:mb-10 lg:mb-12">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 sm:mb-4 leading-tight">
                    Gain Your Competitive  <span className="text-red-800">Edge</span>
                    </h1>
                    <p className="text-lg sm:text-xl max-w-3xl mx-auto px-2 sm:px-0">
                    Tools and insights specifically designed to give you an advantage over your league-mates
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 items-center">
                    {/* Subscription Form */}
                    <div className="rounded-2xl border shadow-xl p-4 sm:p-6 lg:p-8">
                        <h2 className="text-xl sm:text-2xl text-center font-bold mb-2">Sign up for our Premium Content</h2>
                        <p className="text-xl sm:text-2xl text-center font-bold mb-4 sm:mb-6">used by industry leaders</p>

               
                            <button
                                onClick={() => router.push('/premium')}
                                type="submit"
                                className="w-full bg-red-800 text-white py-3 px-6 rounded-lg font-semibold hover:cursor-pointer hover:scale-102 transition-all text-sm sm:text-base"
                            >
                                Sign Up Now
                            </button>
                

                        <p className="text-xs text-gray-400 mt-4">
                            By sign up, you agree to our Privacy Policy and consent to receive updates from our company.
                        </p>
                    </div>

                    {/* Benefits */}
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
                </div>

                {/* Social Proof */}
                <div className="mt-8 sm:mt-10 lg:mt-12 text-center">
                    <p className="mb-3 sm:mb-4 text-sm sm:text-base">Trusted by NFL Analysts at</p>
                    <div className="flex justify-center items-center space-x-4 sm:space-x-6 lg:space-x-10 opacity-80 flex-wrap gap-y-4">
                        <Image src="/the-athletic.png" alt="The Athletic" width={80} height={67} className="sm:w-[100px] sm:h-[83px] lg:w-[120px] lg:h-[100px]" />
                        <Image src="/espn-logo.png" alt="ESPN" width={80} height={67} className="sm:w-[100px] sm:h-[83px] lg:w-[120px] lg:h-[100px]" />
                        <Image src="/nbc-sports.png" alt="NBC Sports" width={53} height={67} className="sm:w-[67px] sm:h-[83px] lg:w-[80px] lg:h-[100px]" />
                        <Image src="/draftkings.png" alt="DraftKings" width={67} height={67} className="sm:w-[83px] sm:h-[83px] lg:w-[100px] lg:h-[100px]" />
                      
                    </div>
                </div>
            </div>
        </div>
    )
}
