'use client'

import Image from "next/image";
import Link from "next/link";
import { Play, Clock, Calendar, Headphones, TrendingUp, ArrowRight } from "lucide-react";
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
        <section className="container mx-auto px-4 py-16">
            {/* Header */}
            <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                    NFL <span className="text-red-800">Podcasts</span>
                </h2>
                <p className="text-lg max-w-2xl mx-auto">
                    In-depth analysis, insider reports, and expert commentary from our network of beat writers across all 32 teams.
                </p>
            </div>

            {/* Featured Episodes */}
            <div className="mb-12">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold">Latest Episodes</h3>
                    <Link href="/podcasts" className="text-red-600 hover:text-red-700 font-medium flex items-center gap-1">
                        View All <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>

                {/* Loading State */}
                {isLoading && (
                    <div className="space-y-6">
                        {Array.from({ length: 3 }).map((_, index) => (
                            <div key={index} className="animate-pulse border border-border rounded-xl p-6">
                                <div className="flex flex-col lg:flex-row gap-6">
                                    <div className="lg:w-32 lg:h-32 w-full h-48 bg-gray-300 rounded-xl"></div>
                                    <div className="flex-1 space-y-4">
                                        <div className="h-4 bg-gray-300 rounded w-1/4"></div>
                                        <div className="h-6 bg-gray-300 rounded w-3/4"></div>
                                        <div className="h-4 bg-gray-300 rounded"></div>
                                        <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="text-center py-12">
                        <p className="text-gray-600 mb-4">Failed to load latest episodes. Please try again later.</p>
                        <button 
                            onClick={() => window.location.reload()} 
                            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
                        >
                            Retry
                        </button>
                    </div>
                )}

                {/* Episodes List */}
                {apiResponse?.podcasts && apiResponse.podcasts.length > 0 && (
                    <div className="space-y-6">
                        {apiResponse.podcasts.map((podcast, index) => (
                            <div key={podcast.id} className={`group border-2 border-border shadow-md rounded-xl p-6 hover:shadow-lg hover:border-red-200 transition-all duration-300 ${index === 0 ? '' : ''}`}>
                                <div className="flex flex-col lg:flex-row gap-6">
                                    {/* Podcast Image */}
                                    <div className="relative lg:w-32 lg:h-32 w-full h-48 flex-shrink-0">
                                        <Image
                                            src={getImageUrl(podcast.thumbnail) || "/bw-logo.webp"}
                                            alt={podcast.title}
                                            fill
                                            className="object-cover rounded-xl"
                                        />
                                        <div className="absolute inset-0 bg-black/40 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                                                <Play className="h-6 w-6 text-red-600 ml-1" />
                                            </div>
                                        </div>
                                        {index === 0 && (
                                            <div className="absolute top-2 left-2 px-2 py-1 bg-orange-500 text-white text-xs font-bold rounded-full flex items-center gap-1">
                                                <TrendingUp className="h-3 w-3" />
                                                Latest
                                            </div>
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1">
                                        <div className="flex flex-wrap items-center gap-2 mb-2">
                                            <span className="text-xs px-2 py-1 border-2 border-gray-100 rounded-full font-medium">
                                                {podcast.hostedBy}
                                            </span>
                                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                <Calendar className="h-3 w-3" />
                                                {formatTimeAgo(podcast.podcastTime)}
                                            </div>
                                        </div>

                                        <Link href={`/podcasts/${podcast.id}`}>
                                            <h4 className="font-bold text-xl mb-2 group-hover:text-red-800 transition-colors cursor-pointer">
                                                {podcast.title}
                                            </h4>
                                        </Link>

                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                <div className="flex items-center gap-1">
                                                    <Clock className="h-4 w-4" />
                                                    {podcast.duration}
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Play className="h-4 w-4" />
                                                    New Episode
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <Link href={`/podcasts/${podcast.id}`}>
                                                    <button className="px-4 py-2 bg-red-800 text-white rounded-lg hover:scale-102 transition-colors flex items-center gap-2">
                                                        <Play className="h-4 w-4" />
                                                        Play Now
                                                    </button>
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* No Data State */}
                {apiResponse?.podcasts && apiResponse.podcasts.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-gray-600 mb-4">No episodes available at the moment.</p>
                        <Link href="/podcasts">
                            <button className="bg-red-800 text-white px-6 py-2 rounded-lg hover:scale-102 transition-colors">
                                Explore All Podcasts
                            </button>
                        </Link>
                    </div>
                )}
            </div>

            {/* Call to Action */}
            <div className="text-center border-2 p-8 rounded-2xl shadow-md">
                <h3 className="text-2xl font-bold mb-2">Never Miss an Episode</h3>
                <p className="mb-6 max-w-md mx-auto">
                    Subscribe to get the latest NFL insights, fantasy advice, and insider reports delivered to your favorite podcast app.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link href="/podcasts">
                        <button className="bg-red-800 hover:scale-102 px-6 py-3 rounded-lg font-semibold text-white transition-colors">
                            Browse All Episodes
                        </button>
                    </Link>
                    <Link href="/subscribe">
                        <button className="border border-gray-600 hover:border-gray-500 px-6 py-3 rounded-lg font-semibold transition-colors hover:text-red-800 hover:scale-102">
                            Subscribe Now
                        </button>
                    </Link>
                </div>
            </div>
        </section>
    );
}
