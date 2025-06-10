'use client'

import { useGetEpisodeQuery, getImageUrl } from '@/lib/services/podcastApi'
import Image from 'next/image'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useState, useEffect } from 'react'

export default function PodcastDetailPage() {
    const params = useParams()
    const [podcastId, setPodcastId] = useState<number>(parseInt(params.id as string))

    useEffect(() => {
        setPodcastId(parseInt(params.id as string))
    }, [params.id])

    const {
        data: podcastResponse,
        isLoading,
        error
    } = useGetEpisodeQuery(podcastId) as { data: any, isLoading: boolean, error: any }

    const podcast = podcastResponse


    // Loading state
    if (isLoading) {
        return (
            <div className="container mx-auto max-w-4xl mt-6 mb-28 px-4">
                <div className="animate-pulse">
                    {/* Header skeleton */}
                    <div className="mb-8">
                        <div className="h-8 bg-gray-300 rounded mb-4 w-3/4"></div>
                        <div className="h-4 bg-gray-300 rounded mb-2"></div>
                        <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                    </div>

                    {/* Image skeleton */}
                    <div className="bg-gray-300 rounded-lg h-96 mb-8"></div>

                    {/* Content skeleton */}
                    <div className="space-y-4">
                        <div className="h-6 bg-gray-300 rounded w-1/3"></div>
                        <div className="h-4 bg-gray-300 rounded"></div>
                        <div className="h-4 bg-gray-300 rounded"></div>
                        <div className="h-4 bg-gray-300 rounded w-2/3"></div>
                    </div>
                </div>
            </div>
        )
    }

    // Error state
    if (error || !podcast) {
        return (
            <div className="container mx-auto max-w-4xl mt-6 mb-28 px-4">
                <div className="text-center py-12">
                    <h1 className="text-2xl font-bold text-gray-800 mb-4">
                        {error && 'status' in error && error.status === 404
                            ? 'Podcast Not Found'
                            : 'Error Loading Podcast'
                        }
                    </h1>
                    <p className="text-gray-600 mb-6">
                        {error && 'status' in error && error.status === 404
                            ? 'The podcast episode you\'re looking for doesn\'t exist or has been removed.'
                            : 'There was an error loading the podcast. Please try again later.'
                        }
                    </p>
                    <div className="space-x-4">
                        <Link
                            href="/podcasts"
                            className="bg-red-800 text-white px-6 py-2 rounded-lg hover:scale-102 transition-all inline-block"
                        >
                            Browse All Podcasts
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto max-w-5xl mt-12 mb-12 px-4">
            {/* Image Section - Now displayed horizontally at the top */}
            <div className="mb-8">
                <h1 className="text-3xl lg:text-4xl font-bold mb-4 leading-tight">
                    {podcast.title}
                </h1>
                <p className="leading-relaxed whitespace-pre-line mb-4">
                    {podcast.description}
                </p>
                <div className="flex items-center justify-center lg:justify-start gap-4 text-sm mb-4">
                    <h1 className="font-medium">Hosted by: {podcast.hostedBy}</h1>
                    <h1>Duration: {podcast.duration}</h1>
                    <div className="flex items-center">
                        {new Date(podcast.podcastTime).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })}
                    </div>
                </div>
                <div className="relative w-full h-64 md:h-80 lg:h-[500px] rounded-lg overflow-hidden shadow-lg mb-6">
                    <Image
                        src={getImageUrl(podcast?.thumbnail) || "/bw-logo.webp"}
                        alt={podcast?.title || "Podcast"}
                        fill
                        className="object-cover"
                        priority
                    />
                </div>

                {/* Action Buttons - Now horizontal */}
                <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                    <a
                        href={podcast.spotifyLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center flex-1 bg-green-600 text-white py-3 px-4 rounded-lg hover:scale-102 transition-all font-medium"
                    >
                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.6 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z" />
                        </svg>
                        Listen on Spotify
                    </a>
                    <button
                        onClick={() => {
                            if (navigator.share) {
                                navigator.share({
                                    title: podcast.title,
                                    text: podcast.description,
                                    url: window.location.href,
                                })
                            } else {
                                navigator.clipboard.writeText(window.location.href)
                                alert('Link copied to clipboard!')
                            }
                        }}
                        className="bg-red-800 text-white px-4 py-2 rounded-lg hover:scale-102 transition-all text-sm font-medium hover:cursor-pointer"
                    >
                        Share
                    </button>
                    <button
                        onClick={() => {
                            navigator.clipboard.writeText(window.location.href)
                            alert('Link copied to clipboard!')
                        }}
                        className="px-4 py-2 border-2 border-gray-300 rounded-lg hover:scale-102 transition-all text-sm font-medium hover:cursor-pointer"
                    >
                        Copy Link
                    </button>
                </div>
            </div>
        </div>
    )
}
