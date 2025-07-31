import { Metadata } from 'next'
import { getImageUrl } from '@/lib/services/articlesApi'
import PodcastPageClient from './PodcastPageClient'
import { buildApiUrl, API_CONFIG } from '@/lib/config/api'

// Generate metadata for the podcast page
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    try {
        const { id } = await params
        // Fetch podcast data
        const response = await fetch(`${buildApiUrl(API_CONFIG.ENDPOINTS.PODCASTS)}/${id}`)
        const podcastData = await response.json()

        if (!podcastData) {
            return {
                title: 'Podcast Not Found',
                description: 'The requested podcast could not be found.'
            }
        }

        const podcast = podcastData

        return {
            title: podcast.title,
            description: podcast.description?.substring(0, 160) || 'Read this podcast on 32BeatWriters',
            openGraph: {
                title: podcast.title,
                description: 'Read this podcast on 32BeatWriters',
                images: [
                    {
                        url: getImageUrl(podcast.thumbnail) || '/logo-small.webp',
                        width: 1200,
                        height: 630,
                        alt: podcast.title,
                    },
                ],
                type: 'article',
                url: `${buildApiUrl(API_CONFIG.ENDPOINTS.PODCASTS)}/${id}`,
            },
            twitter: {
                card: 'summary_large_image',
                title: podcast.title,
                description: podcast.description?.substring(0, 160) || 'Read this podcast on 32BeatWriters',
                images: [getImageUrl(podcast.thumbnail) || '/logo-small.webp'],
            },
        }
    } catch (error) {
        console.error('Error generating metadata:', error)
        return {
            title: 'Podcast',
            description: 'Read this podcast on 32BeatWriters'
        }
    }
}

export default async function PodcastPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    return <PodcastPageClient id={id} />
}
