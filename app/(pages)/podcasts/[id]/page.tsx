'use client'

import { useGetEpisodeQuery, getImageUrl } from '@/lib/services/podcastApi'
import { Share2 } from 'lucide-react'
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

    const hasYouTube = podcast?.youtubeLink && podcast.youtubeLink.length > 0
    const hasSpotify = podcast?.spotifyLink && podcast.spotifyLink.length > 0
    const hasApple = podcast?.appleLink && podcast.appleLink.length > 0

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
            {/* Image or YouTube Video Section */}
            <div className="mb-8">
                <h1 className="text-3xl lg:text-4xl font-bold mb-4 leading-tight">
                    {podcast.title}
                </h1>

                {hasYouTube ? (
                    <div className="relative w-full aspect-video rounded-lg overflow-hidden shadow-lg mb-6">
                        <iframe
                            src={podcast.youtubeLink.replace('watch?v=', 'embed/')}
                            title={podcast.title}
                            className="absolute top-0 left-0 w-full h-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        />
                    </div>
                ) : (
                    <div className="relative w-full h-64 md:h-80 lg:h-[500px] rounded-lg overflow-hidden shadow-lg mb-6">
                        <Image
                            src={getImageUrl(podcast?.thumbnail) || "/bw-logo.webp"}
                            alt={podcast?.title || "Podcast"}
                            fill
                            className="object-cover"
                            priority
                        />
                    </div>
                )}

                {/* Platform Availability Indicators */}
                <div className="flex flex-wrap gap-4 mb-6">
                    {hasYouTube && (
                        <div className="flex items-center gap-2 text-red-600">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                            </svg>
                            <span className="text-sm font-medium">YouTube</span>
                        </div>
                    )}
                    {hasSpotify && (
                        <div className="flex items-center gap-2 text-green-600">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.6 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z"/>
                            </svg>
                            <span className="text-sm font-medium">Spotify</span>
                        </div>
                    )}
                    {hasApple && (
                        <div className="flex items-center gap-2 text-gray-800">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M17.05 20.28c-.98.95-2.05.88-3.08.41-1.09-.47-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.41C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.19 2.31-.89 3.51-.84 1.54.07 2.7.61 3.44 1.57-3.14 1.88-2.29 5.13.22 6.41-.65 1.29-1.52 2.58-2.25 4.03zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                            </svg>
                            <span className="text-sm font-medium">Apple Podcasts</span>
                        </div>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    {hasYouTube && (
                        <a
                            href={podcast.youtubeLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center flex-1 bg-red-600 text-white py-3 px-4 rounded-lg hover:scale-102 transition-all font-medium"
                        >
                            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                            </svg>
                            Watch on YouTube
                        </a>
                    )}
                    {hasSpotify && (
                        <a
                            href={podcast.spotifyLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center flex-1 bg-green-600 text-white py-3 px-4 rounded-lg hover:scale-102 transition-all font-medium"
                        >
                            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.6 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z"/>
                            </svg>
                            Listen on Spotify
                        </a>
                    )}
                    {hasApple && (
                        <a
                            href={podcast.appleLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center flex-1 bg-gray-800 text-white py-3 px-4 rounded-lg hover:scale-102 transition-all font-medium"
                        >
                            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M17.05 20.28c-.98.95-2.05.88-3.08.41-1.09-.47-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.41C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.19 2.31-.89 3.51-.84 1.54.07 2.7.61 3.44 1.57-3.14 1.88-2.29 5.13.22 6.41-.65 1.29-1.52 2.58-2.25 4.03zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                            </svg>
                            Listen on Apple Podcasts
                        </a>
                    )}
                </div>

                <p className="leading-relaxed whitespace-pre-line mb-4 mt-6">
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
            </div>
        </div>
    )
}
