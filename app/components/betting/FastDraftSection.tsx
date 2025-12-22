'use client'

import { Bet } from '@/lib/services/bettingApi'
import { Button } from '@/components/ui/button'
import BetCard from './BetCard'
import { ExternalLink } from 'lucide-react'

interface FastDraftSectionProps {
  bets: Bet[]
}

export default function FastDraftSection({ bets }: FastDraftSectionProps) {
  if (bets.length === 0) return null

  const firstBet = bets[0]

  return (
    <section className="mb-8">
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 dark:from-orange-600 dark:to-orange-700 rounded-xl p-6 mb-6">
        <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
          🚀 FastDraft Picks
        </h2>
        
        {firstBet?.signupLink && (
          <div className="bg-white dark:bg-gray-900 rounded-lg p-4 space-y-3">
            <a
              href={firstBet.signupLink}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <Button
                variant="orange"
                size="lg"
                className="w-full sm:w-auto"
              >
                Sign Up for FastDraft
                <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
            </a>
            {firstBet.depositInfo && (
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {firstBet.depositInfo}
              </p>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {bets.map((bet) => (
          <BetCard key={bet.id} bet={bet} />
        ))}
      </div>
    </section>
  )
}
