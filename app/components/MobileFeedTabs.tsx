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
      href: '/feeds/nuggets',
      label: 'Latest',
      isActive: pathname === '/feeds/nuggets'
    },
    {
      href: '/feeds/saved-nuggets',
      label: 'Saved',
      isActive: pathname === '/feeds/saved-nuggets'
    },
    {
      href: '/feeds/players-nuggets',
      label: 'My Players',
      isActive: pathname === '/feeds/players-nuggets'
    },
    {
      href: '/feeds/leagues',
      label: 'Sleeper',
      isActive: pathname.startsWith('/feeds/sleeper')
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
      <div className="flex gap-2 border border-[#C7C8CB] rounded-full p-1 bg-transparent">
        {tabs.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex-1 text-center py-2 px-2 rounded-full text-sm font-medium transition-all duration-200 ${tab.isActive
              ? 'bg-[#E64A30] text-white'
              : 'bg-transparent dark:bg-[#262829] text-gray-700 dark:text-gray-300 hover:bg-[#E64A30] hover:text-white'
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
