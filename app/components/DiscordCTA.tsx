'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { useAppSelector } from '@/lib/hooks'
import { selectUser, selectIsAuthenticated } from '@/lib/features/authSlice'
import Image from 'next/image'

const DiscordCTA = () => {
  const router = useRouter()
  const user = useAppSelector(selectUser)
  const isAuthenticated = useAppSelector(selectIsAuthenticated)

  // Check if user is subscribed (has a paid membership)
  const isSubscribed = user?.memberships?.type === 'pro' || user?.memberships?.type === 'lifetime'

  const handleCTAClick = () => {
    if (!isAuthenticated) {
      // Not logged in - navigate to login page
      router.push('/login')
    } else if (!isSubscribed) {
      // Logged in but not subscribed - navigate to subscribe page
      router.push('/subscribe')
    } else {
      // Logged in and subscribed - navigate to profile page
      router.push('/account')
    }
  }

  const getButtonText = () => {
    if (!isAuthenticated) {
      return 'Login to Join Discord'
    } else if (!isSubscribed) {
      return 'Subscribe to Join Discord'
    } else {
      return 'Connect Discord'
    }
  }

  return (
    <section className="container mx-auto px-4 py-8 md:py-12 mt-6">
      <div className="bg-[var(--gray-background-color)] dark:bg-[#1A1A1A] rounded-2xl overflow-hidden relative">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5 dark:opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#5865F2] rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#5865F2] rounded-full translate-y-1/2 -translate-x-1/2"></div>
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between p-8 md:p-12 gap-6">
          {/* Left Content */}
          <div className="flex items-center gap-6 flex-1">
            {/* Discord Icon with Blue Background */}
            <div className="flex-shrink-0 bg-[#5865F2] p-4 rounded-2xl shadow-lg">
              <Image
                src="/discord-icon.svg"
                alt="Discord"
                width={80}
                height={80}
                className="w-12 h-12 md:w-16 md:h-16 brightness-0 invert"
                loader={({ src }) => src}
              />
            </div>

            {/* Text Content */}
            <div className="text-foreground">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-2 font-oswald">
                Join Our Community
              </h2>
              <p className="text-base md:text-lg text-gray-700 dark:text-gray-300">
                Access to Our Subscriber Only Discord Server
              </p>
              {!isAuthenticated && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  Connect with fellow fantasy football enthusiasts
                </p>
              )}
              {isAuthenticated && !isSubscribed && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  Subscribe to unlock exclusive Discord access
                </p>
              )}
              {isAuthenticated && isSubscribed && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  Connect your Discord account to join the community
                </p>
              )}
            </div>
          </div>

          {/* Right CTA Button */}
          <div className="flex-shrink-0">
            <button
              onClick={handleCTAClick}
              className="bg-[var(--color-orange)] text-white px-8 py-4 rounded-full font-bold text-lg hover:opacity-90 transition-all duration-300 hover:scale-101 shadow-lg whitespace-nowrap cursor-pointer"
            >
              {getButtonText()}
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

export default DiscordCTA
