'use client'

import { useState } from 'react'
import Image from "next/image"
import { API_CONFIG, buildApiUrl } from '../../lib/config/api'
import { useAnalytics } from '../../lib/hooks/useAnalytics'

export default function DeliveredToComponent() {
    const [email, setEmail] = useState('')
    const [message, setMessage] = useState('')
    const [loading, setLoading] = useState(false)
    const { trackNewsletterSignup } = useAnalytics()

    const handleSubscribe = async (e: React.FormEvent) => {
        e.preventDefault()
        setMessage('')
        setLoading(true)

        try {
            const response = await fetch(`${buildApiUrl('/api/subscribers/subscribe')}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            })

            if (response.ok) {
                const data = await response.json()
                setMessage(`${data.message} Thank you for subscribing!`)
                setEmail('')
                trackNewsletterSignup('delivered-to-section')
            } else {
                const data = await response.json()
                setMessage(data.message || 'Something went wrong. Please try again.')
            }
        } catch (error) {
            console.error(error)
            setMessage('Something went wrong. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="
  bg-[linear-gradient(to_bottom,white_50%,var(--gray-background-color)_50%)]
  dark:bg-[linear-gradient(to_bottom,black_50%,#1A1A1A_50%)]
">            <div className="container mx-auto px-4 md:px-6 py-10">
                <div className="w-full grid grid-cols-1 md:grid-cols-12 md:rounded-3xl overflow-hidden bg-white shadow-lg dark:shadow-none dark:border-none dark:bg-transparent">

                    {/* Left Image Section (Full width on small, half on large) */}
                    <div className="col-span-12 md:col-span-6 hidden md:inline-block lg:flex">
                        <Image
                            src="/newsletter.png"
                            alt="Newsletter"
                            width={800}
                            height={500}
                            className="w-full h-64 sm:h-80 md:h-full object-cover object-left"
                        />
                    </div>

                    {/* Right Content Section */}
                    <div className="col-span-12 md:col-span-6 flex flex-col justify-center px-6 md:px-12 py-10 bg-white dark:bg-[#262829] space-y-6">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                                Stay tuned!
                            </h1>
                            <p className="text-gray-600 dark:text-white text-sm md:text-base max-w-lg">
                                Get the latest articles and business updates that you need to know,
                                and receive special recommendations weekly.
                            </p>
                        </div>

                        {message ? (
                            <div className="text-green-600 font-semibold bg-green-50 border border-green-200 px-4 py-3 rounded-lg w-full max-w-md">
                                {message}
                            </div>
                        ) : (
                            <form
                                onSubmit={handleSubscribe}
                                className="flex w-full max-w-md border border-gray-300 rounded-xl overflow-hidden"
                            >
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Your Email"
                                    className="flex-1 px-4 py-3 outline-none text-gray-700 dark:text-white"
                                    required
                                />
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="bg-[var(--color-orange)] text-white px-6 py-3 transition-colors duration-200 hover:bg-orange-500"
                                >
                                    {loading ? '...' : 'Subscribe'}
                                </button>
                            </form>
                        )}
                    </div>

                    <div className="col-span-12 md:col-span-6 lg:hidden md:hidden">
                        <Image
                            src="/newsletter.png"
                            alt="Newsletter"
                            width={800}
                            height={500}
                            className="w-full h-64 sm:h-80 md:h-full object-cover object-left rounded-b-4xl"
                        />
                    </div>

                </div>
            </div>
        </div>
    )
}