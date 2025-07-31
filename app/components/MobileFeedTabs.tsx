'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface FeedTab {
  href: string
  label: string
  isActive: boolean
}

export default function MobileFeedTabs() {
  const pathname = usePathname()
  
  const tabs: FeedTab[] = [
    {
      href: '/nuggets',
      label: 'Latest',
      isActive: pathname === '/nuggets'
    },
    {
      href: '/saved-nuggets',
      label: 'Saved',
      isActive: pathname === '/saved-nuggets'
    },
    {
      href: '/players-nuggets',
      label: 'My Players',
      isActive: pathname === '/players-nuggets'
    }
  ]

  // iOS scroll fix for tab navigation
  const handleTabClick = () => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    if (isIOS) {
      setTimeout(() => {
        window.scrollTo(0, 0);
      }, 100);
    }
  };

  return (
    <div className="lg:hidden mb-6">
      <div className="flex bg-[#2C204B] rounded-lg p-1">
        {tabs.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex-1 text-center py-3 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
              tab.isActive
                ? 'bg-red-800 text-white shadow-sm'
                : 'text-gray-300 hover:text-white hover:bg-[#3a2d5a]'
            }`}
            onClick={handleTabClick}
          >
            {tab.label}
          </Link>
        ))}
      </div>
    </div>
  )
} 