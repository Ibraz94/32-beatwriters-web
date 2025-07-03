'use client'

import { useState } from 'react'
import Image from "next/image"


export default function DeliveredToComponent() {
    const [email, setEmail] = useState('')

    const handleSubscribe = (e: React.FormEvent) => {
        e.preventDefault()
        // Handle subscription logic here
        console.log('Subscribing email:', email)
    }

    return (
        <div className="relative pt-18 container mx-auto">
            {/* Left Player Image - hidden on mobile, visible on larger screens */}
            <div className="hidden lg:block absolute left-8 xl:left-16 top-12 z-30">
                <Image
                    src="/deliver-left.png"
                    alt="NFL Player Left"
                    width={358}
                    height={358}
                    className="object-cover object-right w-[300px] lg:w-[358px] xl:w-[458px] h-auto"
                />
            </div>

            {/* Right Player Image - hidden on mobile, visible on larger screens */}
            <div className="hidden lg:block absolute right-8 xl:right-16 top-6 z-30">
                <Image
                    src="/deliver-right.png"
                    alt="NFL Player Right"
                    width={478}
                    height={350}
                    className="object-cover object-left w-[350px] lg:w-[478px] xl:w-[578px] h-auto"
                />
            </div>

            <div className="relative min-h-[400px] md:min-h-[500px] flex items-center justify-center overflow-hidden bg-[#2C204B] mt-8 md:mt-12">

                {/* Background polygons - adjusted for mobile */}
                <div className="bg-red-800 absolute top-0 w-[80%] md:w-[60%] h-full z-10"
                    style={{
                        clipPath: 'polygon(0% 0%, 85% 0%, 100% 100%, 0% 100%, 15% 100%)'
                    }}>
                </div>

                <div className="bg-red-700 absolute top-0 w-[80%] md:w-[60%] h-full z-10"
                    style={{
                        clipPath: 'polygon(10% 0%, 85% 0%, 90% 100%, 15% 100%)'
                    }}>
                </div>

            {/* Central Content */}
            <div className="relative z-20 text-center px-4 md:px-8 py-12 md:py-16">

               <div className=''>
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold text-white mb-2 md:mb-4 leading-tight">DELIVERED TO</h1>
                <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl font-bold text-white mb-4 md:mb-4 leading-tight -mt-2 md:-mt-6">YOUR INBOX</h2>
               </div>

                <p className="text-base sm:text-lg md:text-xl text-white mb-6 md:mb-8 opacity-90 max-w-2xl mx-auto">
                    Subscribe to get the latest NFL insight, fantasy advice<br className="hidden sm:block" />
                    <span className="sm:hidden"> </span>and insider reports delivered to your inbox
                </p>

                <form onSubmit={handleSubscribe} className="space-y-4 max-w-md mx-auto">
                    <div className="relative">
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Your Email Address"
                            className="w-full px-4 md:px-6 py-3 md:py-4 rounded-lg bg-red-800 border border-red-500/50 text-white placeholder-red-200 focus:outline-none focus:ring-2 focus:ring-white/50 text-base md:text-lg"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full md:w-auto bg-white text-black font-bold py-3 md:py-4 px-8 md:px-10 rounded-lg text-base md:text-lg hover:bg-gray-100 transition-colors duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                        Subscribe Now
                    </button>
                </form>
            </div>
            </div>
        </div>
    )
}