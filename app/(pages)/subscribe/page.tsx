'use client'

import { useState } from 'react'

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

    if (isSubscribed) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center px-4">
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
                        className="text-indigo-600 hover:text-indigo-700 font-medium"
                    >
                        Subscribe another email →
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center px-4">
            <div className="max-w-4xl w-full">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
                        Stay in the <span className="text-red-800">Loop</span>
                    </h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Get exclusive content, early access to new features, and insider updates delivered straight to your inbox.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8 items-center">
                    {/* Subscription Form */}
                    <div className="bg-white rounded-2xl shadow-xl p-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Join our newsletter</h2>
                        <p className="text-gray-600 mb-6">No spam, unsubscribe at any time.</p>
                        
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                    Email address
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter your email"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-1 focus:ring-red-800 focus:border-red-800 transition-colors"
                                    required
                                />
                            </div>
                            
                            <button
                                type="submit"
                                disabled={isSubmitting || !email}
                                className="w-full bg-red-800 text-white py-3 px-6 rounded-lg font-semibold focus:scale-102 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? (
                                    <span className="flex items-center justify-center">
                                        Subscribing...
                                    </span>
                                ) : (
                                    'Subscribe Now'
                                )}
                            </button>
                        </form>

                        <p className="text-xs text-gray-500 mt-4">
                            By subscribing, you agree to our Privacy Policy and consent to receive updates from our company.
                        </p>
                    </div>

                    {/* Benefits */}
                    <div className="space-y-6">
                        <h3 className="text-2xl font-bold text-gray-900">What you'll get:</h3>
                        
                        <div className="space-y-4">
                            <div className="flex items-start space-x-3">
                                <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                 
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-900">Exclusive Content</h4>
                                    <p className="text-gray-600">Access to premium articles, guides, and resources not available elsewhere.</p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-3">
                                <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                    
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-900">Early Access</h4>
                                    <p className="text-gray-600">Be the first to know about new features, products, and announcements.</p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-3">
                                <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">

                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-900">Special Offers</h4>
                                    <p className="text-gray-600">Subscriber-only deals, discounts, and promotional offers.</p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-3">
                                <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-900">Community Access</h4>
                                    <p className="text-gray-600">Join our exclusive community of subscribers and connect with like-minded people.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Social Proof */}
                <div className="mt-12 text-center">
                    <p className="text-gray-600 mb-4">Trusted by NFL Analysts at</p>
                    <div className="flex justify-center items-center space-x-8 opacity-60">
                        <div className="text-2xl font-bold text-gray-400">COMPANY 1</div>
                        <div className="text-2xl font-bold text-gray-400">COMPANY 2</div>
                        <div className="text-2xl font-bold text-gray-400">COMPANY 3</div>
                        <div className="text-2xl font-bold text-gray-400">COMPANY 4</div>
                    </div>
                </div>
            </div>
        </div>
    )
}
