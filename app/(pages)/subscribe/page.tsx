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
        <div className="container mx-auto max-w-7xl flex items-center justify-center px-4 mt-16 mb-24">
            <div className="max-w-4xl w-full">

                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-6xl font-bold mb-4">
                    Gain Your Competitive  <span className="text-red-800">Edge</span>
                    </h1>
                    <p className="text-xl max-w-3xl mx-auto">
                    Tools and insights specifically designed to give you an advantage over your league-mates
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8 items-center">
                    {/* Subscription Form */}
                    <div className="rounded-2xl border shadow-xl p-8">
                        <h2 className="text-2xl text-center font-bold mb-2">Sign up for our Premium Content</h2>
                        <p className="text-2xl text-center font-bold mb-6">used by industry leaders</p>

               
                            <button
                                onClick={() => router.push('/auth/premium')}
                                type="submit"
                                className="w-full bg-red-800 text-white py-3 px-6 rounded-lg font-semibold hover:cursor-pointer hover:scale-102 transition-all"
                            >
                                Sign Up Now
                            </button>
                

                        <p className="text-xs text-gray-400 mt-4">
                            By sign up, you agree to our Privacy Policy and consent to receive updates from our company.
                        </p>
                    </div>

                    {/* Benefits */}
                    <div className="space-y-6">
                        <h3 className="text-2xl font-bold">What you'll get:</h3>

                        <div className="space-y-4">
                            <div className="flex items-start space-x-3">
                                <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                    <Check className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="font-semibold">Exclusive Content</h4>
                                    <p className="text-gray-500">Summaries All Offseason – The Best, Complete Reports in the Industry That's Used By Industry Leaders.</p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-3">
                                <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                    <Check className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="font-semibold">Early Access</h4>
                                    <p className="text-gray-500">Ability to search insight and updates. Access to all our Premium articles.</p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-3">
                                <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                    <Check className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="font-semibold">Special</h4>
                                    <p className="text-gray-500">Exclusive podcast episodes. Playing in our Fantasy Football Leagues. Our Undying Love and Appreciation </p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-3">
                                <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                    <Check className="w-5 h-5" />   
                                </div>
                                <div>
                                    <h4 className="font-semibold">Community Access</h4>
                                    <p className="text-gray-500">Join our exclusive community of subscribers and connect with like-minded people.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Social Proof */}
                <div className="mt-12 text-center">
                    <p className="mb-4">Trusted by NFL Analysts at</p>
                    <div className="flex justify-center items-center space-x-10 opacity-80">
                        <Image src="/the-athletic.png" alt="NFL" width={120} height={100} />
                        <Image src="/espn-logo.png" alt="NFL" width={120} height={100} />
                        <Image src="/nbc-sports.png" alt="NFL" width={80} height={100} />
                        <Image src="/draftkings.png" alt="NFL" width={100} height={100} />
                      
                    </div>
                </div>
            </div>
        </div>
    )
}
