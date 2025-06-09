"use client"

import Image from "next/image";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useState } from "react";





export default function Footer() {
    const { theme } = useTheme();

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

    return (
        <footer className="">
            <div className="container mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 py-10 px-4 border-t border-gray-200">

                <div className="flex flex-col gap-4">
                <div className="flex flex-row gap-2 items-center">
                <Image src={theme === "dark" ? "/32bw_logo_white.png" : "/logo-small.webp"} alt="logo" width={45} height={45} />
                <h1 className="text-2xl lg:text-[32px] text-foreground">32BeatWriters</h1>
                </div>
                <p className="flex flex-initial text-muted-foreground text-sm lg:text-base">32BeatWriters is your source for all the news you need to win your fantasy football league.  We source all our info directly from the beat writers.</p>
                    <div className="flex flex-row gap-6">
                    <a 
                    href="https://x.com/32beatwriters"
                    className="w-6 h-6 opacity-70 hover:scale-108 transition-all"><img src="/twitter.svg" alt="Twitter"/></a>
                    <a 
                    href="https://tiktok.com/@32beatwriters"
                    className="w-6 h-6 opacity-70 hover:scale-108 transition-all"><img src="/tiktok.svg"  alt="Tiktok"/></a>
                    <a 
                    href="https://reddit.com/r/32beatwriters"
                    className="w-6 h-6 opacity-70 hover:scale-108 transition-all"><img src="/reddit.svg" alt="Reddit"/></a>
                    <a 
                    href="https://youtube.com/@32beatwriters"
                    className="w-6 h-6 opacity-70 hover:scale-108 transition-all"><img src="/youtube.svg" alt="Youtube"/></a> 
                    </div>
                </div>

                <div className="flex flex-col gap-3">
                    <h1 className="text-xl lg:text-2xl font-bold text-foreground">Q U I C K L I N K S</h1>
                    <Link href="/" className="text-muted-foreground hover:text-red-900 hover:scale-101 transition-all text-sm lg:text-base">Home</Link>
                    <Link href="/faqs" className="text-muted-foreground hover:text-red-900 hover:scale-101 transition-all text-sm lg:text-base">FAQ's</Link>  
                    
                    <Link href="/privacy-policy" className="text-muted-foreground hover:text-red-900 hover:scale-101 transition-all text-sm lg:text-base">Privacy Policy</Link>
                    <Link href="/terms-and-conditions" className="text-muted-foreground hover:text-red-900 hover:scale-101 transition-all text-sm lg:text-base">Terms & Conditions</Link>
                </div>

                <div className="flex flex-col gap-3 ml-6">
                    <h1 className="text-xl lg:text-2xl font-bold text-foreground">T E A M U S</h1>
                    <Link href="/about" className="text-muted-foreground hover:text-red-900 hover:scale-101 transition-all text-sm lg:text-base">About Us</Link>
                    <Link href="/contact-us" className="text-muted-foreground hover:text-red-900 hover:scale-101 transition-all text-sm lg:text-base">Contact Us</Link>
                </div>

                <div className="flex flex-col gap-3">
                <h1 className="text-xl lg:text-2xl font-bold text-foreground">N E W S L E T T E R</h1>
                <p className="text-muted-foreground text-sm lg:text-base">Stay in the Game — Right from Your Inbox</p>
                <form onSubmit={handleSubmit} className="space-y-4">    
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
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
                        <p className="text-xs text-gray-500 -mt-2">
                            By subscribing, you agree to our Privacy Policy and consent to receive updates from our company.
                        </p>
                </div>

            </div>
            <h1 className="text-center text-muted-foreground pb-4 text-sm lg:text-base px-4">Copyright © 2025 32BeatWriters. All rights reserved.</h1>
        </footer>
    );
}
