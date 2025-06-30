'use client'

import { useState } from 'react'
import Image from "next/image"
import { clipPath } from 'framer-motion/client'

export default function DeliveredToComponent() {
    const [email, setEmail] = useState('')

    const handleSubscribe = (e: React.FormEvent) => {
        e.preventDefault()
        // Handle subscription logic here
        console.log('Subscribing email:', email)
    }

    return (
        <div className="relative min-h-[500px] flex items-center justify-center overflow-hidden bg-[#2C204B] mt-12">


            <div className="bg-red-800 absolute top-0 w-[60%] h-full z-10"
                style={{
                    clipPath: 'polygon(0% 0%, 80% 0%, 100% 100%, 0 100%, 20% 100%)'
                }}>
            </div>


            {/* Left Player Image */}
            <div className="absolute left-0 top-0 h-full w-1/3 z-10">
                <Image
                    src="/deliver-left.png"
                    alt="NFL Player Left"
                    fill
                    className="object-cover object-right"
                />
            </div>

            {/* Right Player Image */}
            <div className="absolute right-0 top-0 h-full w-1/3 z-10">
                <Image
                    src="/deliver-right.png"
                    alt="NFL Player Right"
                    fill
                    className="object-cover object-left"
                />
            </div>

            {/* Central Content */}
            <div className="relative z-20 text-center px-8 py-16">




                <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 leading-tight">
                    DELIVERED TO<br />
                    YOUR INBOX
                </h1>

                <p className="text-lg md:text-xl text-white mb-8 opacity-90">
                    Subscribe to get the latest NFL insight, fantasy advice<br />
                    and insider reports delivered to your inbox
                </p>

                <form onSubmit={handleSubscribe} className="space-y-4">
                    <div className="relative">
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Your Email Address"
                            className="w-full px-6 py-4 rounded-lg bg-red-700/80 border border-red-500/50 text-white placeholder-red-200 focus:outline-none focus:ring-2 focus:ring-white/50 text-lg"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="bg-white text-black font-bold py-4 px-12 rounded-lg text-lg hover:bg-gray-100 transition-colors duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                        Subscribe Now
                    </button>
                </form>
            </div>
        </div>
    )
}