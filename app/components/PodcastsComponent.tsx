'use client'

import Image from "next/image";
import Link from "next/link";
import { Play, Clock, Calendar, Headphones, TrendingUp, ArrowRight, ArrowLeft } from "lucide-react";
import { useGetEpisodesQuery, getImageUrl, PodcastData, ApiResponse } from '@/lib/services/podcastApi';
// Mock data for podcast categories (keeping this as it's UI-only)
const podcastCategories = [
    { name: "Fantasy Focus", count: 24, color: "bg-blue-500" },
    { name: "Game Preview", count: 18, color: "bg-green-500" },
    { name: "Injury Analysis", count: 12, color: "bg-orange-500" },
    { name: "Trade Rumors", count: 8, color: "bg-purple-500" }
];

export default function PodcastsComponent() {
    // Fetch the latest 3 episodes using the regular episodes query
    const {
        data: apiResponse,
        isLoading,
        error
    } = useGetEpisodesQuery({
        page: 1,
        limit: 3,
        sortBy: 'publishedAt',
        sortOrder: 'desc'
    }) as { data: ApiResponse | undefined, isLoading: boolean, error: any };

    const formatTimeAgo = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

        if (diffInHours < 1) return "Just now";
        if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;

        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;

        return date.toLocaleDateString();
    };

    return (
        <section className="podcast-section px-4 py-8 md:py-12 lg:py-16 mt-8 md:mt-12 mb-1 container mx-auto">
            <div className="">
                {/* Header */}
                <div className="text-center mb-8 md:mb-12">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl  font-bold mb-3 md:mb-4">
                        Our Podcast Network
                    </h2>
                    <p className="text-sm sm:text-base md:text-lg max-w-5xl mx-auto px-2">
                        Welcome to the NFL Network Podcast, your go-to source for everything NFL! We dive deep into game analyses, player performances, and the hottest news from around the league. Join us weekly for engaging discussions and expert commentary!
                    </p>
                </div>

                {/* Featured Episodes */}
                <div className="mb-8 md:mb-12">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 md:mb-8 gap-4">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 md:gap-4">
                            <h3 className="text-xl sm:text-2xl md:text-3xl font-bold font-oswald">Latest Episode</h3>
                            <div className="bg-red-800 rounded-md">
                                <Link href="/podcasts">
                                    <button className="text-white px-4 md:px-6 py-2 hover:scale-102 transition-colors text-sm md:text-base">
                                        View All
                                    </button>
                                </Link>
                            </div>
                        </div>

                        {/* Navigation arrows - hidden on mobile */}
                        <div className="hidden md:flex items-center gap-2">
                            <button className="text-white bg-red-600 rounded-full p-2 md:p-3 hover:bg-red-700 transition-colors">
                                <ArrowLeft className="h-4 w-4 md:h-5 md:w-5" />
                            </button>
                            <button className="text-white bg-red-600 rounded-full p-2 md:p-3 hover:bg-red-700 transition-colors">
                                <ArrowRight className="h-4 w-4 md:h-5 md:w-5" />
                            </button>
                        </div>
                    </div>

                    {/* Loading State */}
                    {isLoading && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                            {Array.from({ length: 3 }).map((_, index) => (
                                <div key={index} className="animate-pulse">
                                    <div className="bg-gray-700 rounded-xl aspect-video mb-4"></div>
                                    <div className="space-y-2">
                                        <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                                        <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Error State */}
                    {error && (
                        <div className="text-center py-8 md:py-12">
                            <p className="text-gray-400 mb-4 text-sm md:text-base">Failed to load latest episodes. Please try again later.</p>
                            <button
                                onClick={() => window.location.reload()}
                                className="bg-red-600 text-white px-4 md:px-6 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm md:text-base"
                            >
                                Retry
                            </button>
                        </div>
                    )}

                    {/* Episodes Grid */}
                    {apiResponse?.podcasts && apiResponse.podcasts.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                            {apiResponse.podcasts.map((podcast, index) => (
                                <div key={podcast.id} className="group cursor-pointer">
                                    {/* Podcast Card */}
                                    <div className="relative mb-3 md:mb-4">

                                        {/* Image Container */}
                                        <div className="relative w-full aspect-video overflow-hidden rounded-lg">
                                            <Image
                                                src={getImageUrl(podcast.thumbnail) || "/bw-logo.webp"}
                                                alt={podcast.title}
                                                fill
                                                className="object-cover"
                                            />
                                            
                                            {/* Play Button Overlay */}
                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                <div className="w-12 h-12 md:w-16 md:h-16 bg-white rounded-full flex items-center justify-center shadow-lg">
                                                    <Play className="h-4 w-4 md:h-6 md:w-6 text-gray-800 ml-0.5 md:ml-1" fill="currentColor" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="space-y-1 md:space-y-2">
                                        {/* Author and Date */}
                                        <div className="flex items-center gap-2 text-xs md:text-sm theme-muted">
                                            <span>{podcast.hostedBy}</span>
                                            <span>-</span>
                                            <span>{formatTimeAgo(podcast.podcastTime)}</span>
                                        </div>

                                        {/* Title */}
                                        <Link href={`/podcasts/${podcast.id}`}>
                                            <h4 className="font-bold text-lg sm:text-xl md:text-2xl theme-text transition-colors line-clamp-2">
                                                {podcast.title}
                                            </h4>
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* No Data State */}
                    {apiResponse?.podcasts && apiResponse.podcasts.length === 0 && (
                        <div className="text-center py-8 md:py-12">
                            <p className="text-gray-400 mb-4 text-sm md:text-base">No episodes available at the moment.</p>
                            <Link href="/podcasts">
                                <button className="bg-red-600 text-white px-4 md:px-6 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm md:text-base">
                                    Explore All Podcasts
                                </button>
                            </Link>
                        </div>
                    )}
                </div>
                
                
            </div>
        </section>
    );
}
