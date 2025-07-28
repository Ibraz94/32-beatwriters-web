import { Metadata } from 'next'
import { getImageUrl } from '@/lib/services/articlesApi'
import PlayerPageClient from './PlayerPageClient'
import { buildApiUrl, API_CONFIG } from '@/lib/config/api'

// Generate metadata for the article page
export async function generateMetadata({ params }: { params: Promise<{ playerId: number }> }): Promise<Metadata> {
  try {
    const { playerId } = await params

    console.log(`${buildApiUrl(API_CONFIG.ENDPOINTS.PLAYERS)}/${playerId}`)
    // Fetch article data
    const response = await fetch(`${buildApiUrl(API_CONFIG.ENDPOINTS.PLAYERS)}/${playerId}`)
    const playerData = await response.json()

    console.log("playerData:", playerData)

    if (!playerData) {
      return {
        title: 'Player Not Found',
        description: 'The requested player could not be found.'
      }
    }

    const player = playerData

    return {
      title: player.name,
      description: player.team?.substring(0, 160) || 'Read about player on 32BeatWriters',
      openGraph: {
        title: player.name,
        description: player.team?.substring(0, 160) || 'Read about player on 32BeatWriters',
        images: [
          {
            url: getImageUrl(player.headshotPic) || '/logo-small.webp',
            width: 1200,
            height: 630,
            alt: player.name,
          },
        ],
        type: 'article',
        url: `${buildApiUrl(API_CONFIG.ENDPOINTS.PLAYERS)}/${playerId}`,
      },
      twitter: {
        card: 'summary_large_image',
        title: player.name,
        description: player.team?.substring(0, 160) || 'Read about player on 32BeatWriters',
        images: [getImageUrl(player.headshotPic) || '/logo-small.webp'],
      },
    }
  } catch (error) {
    console.error('Error generating metadata:', error)
    return {
      title: 'Player',
      description: 'Read about player on 32BeatWriters'
    }
  }
}

export default async function PlayerPage({ params }: { params: Promise<{ playerId: string }> }) {
  const { playerId } = await params
  return <PlayerPageClient id={playerId} />
}
