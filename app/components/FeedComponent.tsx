"use client"

import { useState, useEffect } from "react";
import { Clock, TrendingUp, Users, Filter, RefreshCw } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import {
    useGetNuggetsQuery,
    useSearchNuggetsQuery,
    getImageUrl
} from '@/lib/services/nuggetsApi';

interface NuggetFilters {
    playerId?: number
    sourceName?: string
    page?: number
    limit?: number
    sortBy?: 'order' | 'createdAt'
    sortOrder?: 'asc' | 'desc'
}

// Interface for the individual nugget data structure
interface NuggetItem {
    id: string
    title: string
    content: string
    playerId: number
    sourceName: string
    sourceUrl: string
    images: string[]
    createdAt: string
    updatedAt: string
    player: {
        id: number
        playerId: string
        name: string
        team: string
        position: string
        headshotPic: string
    }
}

export default function FeedComponent() {
    const [filters, setFilters] = useState<NuggetFilters>({
        page: 1,
        limit: 5, // Show fewer items in feed component
        sortBy: 'createdAt',
        sortOrder: 'desc'
    });
    const [selectedFilter, setSelectedFilter] = useState("All");
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [isSearching, setIsSearching] = useState(false);

    // Main query for nuggets
    const {
        data: nuggetsData,
        isLoading: isLoadingNuggets,
        error: nuggetsError,
        refetch
    } = useGetNuggetsQuery(filters, {
        skip: isSearching
    });

    // Search query
    const {
        data: searchData,
        isLoading: isLoadingSearch,
        error: searchError
    } = useSearchNuggetsQuery(searchTerm, {
        skip: !isSearching || !searchTerm
    });

    const filters_categories = ["All", "Injury Report", "Practice Report", "Team News", "Roster Moves"];

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await refetch();
        setTimeout(() => setIsRefreshing(false), 1000);
    };

    // Convert nuggets data to feed items format for consistency with existing UI
    const convertNuggetsToFeedItems = (nuggets: any[] | undefined) => {
        if (!nuggets) return [];
        
        return nuggets.map((nugget: NuggetItem, index: number) => ({
            id: nugget.id,
            title: nugget.title,
            summary: nugget.content.length > 200 ? nugget.content.substring(0, 200) + '...' : nugget.content,
            timestamp: formatTimestamp(nugget.createdAt),
            category: getCategoryFromContent(nugget.content),
            team: nugget.player.team || 'NFL',
            trending: index < 2, // Mark first 2 as trending for demo
            author: nugget.sourceName || 'Beat Writer',
            engagement: Math.floor(Math.random() * 500) + 100, // Random engagement for demo
            player: nugget.player,
            images: nugget.images
        }));
    };

    // Helper function to format timestamp
    const formatTimestamp = (dateString: string) => {
        const now = new Date();
        const date = new Date(dateString);
        const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
        
        if (diffInMinutes < 1) return 'Just now';
        if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
        
        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
        
        const diffInDays = Math.floor(diffInHours / 24);
        return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    };

    // Helper function to categorize content
    const getCategoryFromContent = (content: string) => {
        const lowerContent = content.toLowerCase();
        if (lowerContent.includes('injur') || lowerContent.includes('hurt')) return 'Injury Report';
        if (lowerContent.includes('practic')) return 'Practice Report';
        if (lowerContent.includes('sign') || lowerContent.includes('cut') || lowerContent.includes('waiv')) return 'Roster Moves';
        return 'Team News';
    };

    const isLoading = isLoadingNuggets || isLoadingSearch;
    const error = nuggetsError || searchError;
    
    // Get the appropriate data based on search state
    const nuggets = isSearching ? searchData?.nuggets : nuggetsData?.data?.nuggets;
    const feedItems = convertNuggetsToFeedItems(nuggets);
    
    // Filter items based on selected filter
    const filteredItems = selectedFilter === "All" 
        ? feedItems 
        : feedItems.filter(item => item.category === selectedFilter);

    // Loading state
    if (isLoading && feedItems.length === 0) {
        return (
            <section className="container mx-auto px-4 py-8 max-w-4xl">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">
                            Live <span className="text-red-600">Feed</span>
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Loading real-time updates from our 32 beat writers...
                        </p>
                    </div>
                </div>
                <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="bg-background border rounded-xl p-6 animate-pulse">
                            <div className="h-6 bg-gray-200 rounded mb-3"></div>
                            <div className="h-4 bg-gray-200 rounded mb-2 w-3/4"></div>
                            <div className="h-4 bg-gray-200 rounded mb-4 w-1/2"></div>
                        </div>
                    ))}
                </div>
            </section>
        );
    }

    // Error state
    if (error) {
        return (
            <section className="container mx-auto px-4 py-8 max-w-4xl">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">
                            Live <span className="text-red-600">Feed</span>
                        </h1>
                        <p className="text-red-600 mt-1">
                            Failed to load feed. Please try again later.
                        </p>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="container mx-auto px-4 py-8 max-w-4xl">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">
                        Live <span className="text-red-800">Feed</span>
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Real-time updates from our 32 beat writers
                    </p>
                </div>
                
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                        className="flex items-center gap-2 px-4 py-2 bg-muted hover:bg-muted/80 rounded-lg transition-colors disabled:opacity-50"
                    >
                        <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                        <span className="text-sm font-medium">Refresh</span>
                    </button>
                    
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span>Live</span>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2 mb-6">
                {filters_categories.map((filter) => (
                    <button
                        key={filter}
                        onClick={() => setSelectedFilter(filter)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                            selectedFilter === filter
                                ? 'bg-red-600 text-white'
                                : 'bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        {filter}
                    </button>
                ))}
            </div>

            {/* Feed Items */}
            <div className="space-y-4">
                {filteredItems.length === 0 ? (
                    <div className="text-center py-8">
                        <p className="text-muted-foreground">No feed items available for this filter.</p>
                    </div>
                ) : (
                    filteredItems.map((item) => (
                        <div
                            key={item.id}
                            className="group bg-background border rounded-xl p-6 hover:shadow-lg transition-all duration-300 hover:border-red-200"
                        >
                            {/* Header */}
                            <div className="flex items-start justify-between gap-4 mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-2">
                                        {/* Player headshot */}
                                        {item.player?.headshotPic && (
                                            <div className="w-8 h-8 rounded-lg overflow-hidden">
                                                <Image
                                                    src={getImageUrl(item.player.headshotPic) || ''}
                                                    alt={item.player.name}
                                                    width={32}
                                                    height={32}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        )}
                                        <div className="w-8 h-8 bg-red-600 text-white rounded-lg flex items-center justify-center text-xs font-bold">
                                            {item.team}
                                        </div>
                                        <span className="text-xs px-2 py-1 bg-muted rounded-full text-muted-foreground">
                                            {item.category}
                                        </span>
                                    </div>
                                    {item.trending && (
                                        <div className="flex items-center gap-1 text-xs text-orange-600">
                                            <TrendingUp className="h-3 w-3" />
                                            <span>Trending</span>
                                        </div>
                                    )}
                                </div>
                                
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <Clock className="h-3 w-3" />
                                    <span>{item.timestamp}</span>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="mb-4">
                                <h3 className="font-bold text-lg mb-2 group-hover:text-red-600 transition-colors">
                                    {item.title}
                                </h3>
                                <p className="text-muted-foreground leading-relaxed">
                                    {item.summary}
                                </p>
                            </div>

                            {/* Images */}
                            {item.images && item.images.length > 0 && (
                                <div className="mb-4">
                                    <div className={`grid gap-2 ${
                                        item.images.length === 1 ? 'grid-cols-1' :
                                        item.images.length === 2 ? 'grid-cols-2' :
                                        'grid-cols-3'
                                    }`}>
                                        {item.images.slice(0, 3).map((image: string, imageIndex: number) => (
                                            <div 
                                                key={imageIndex} 
                                                className="relative w-full h-24 rounded-lg overflow-hidden"
                                            >
                                                <Image
                                                    src={getImageUrl(image) || ''}
                                                    alt={`${item.title} image ${imageIndex + 1}`}
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Footer */}
                            <div className="flex items-center justify-between pt-3 border-t">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <span>By {item.author}</span>
                                    {item.player && (
                                        <span>• {item.player.name}</span>
                                    )}
                                </div>
                                
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                        <Users className="h-4 w-4" />
                                        <span>{item.engagement}</span>
                                    </div>
                                    
                                    <Link 
                                        href={`/nuggets`}
                                        className="text-sm font-medium text-red-600 hover:text-red-700 transition-colors"
                                    >
                                        View All
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Load More */}
            <div className="text-center mt-8">
                <Link href="/nuggets">
                    <button className="px-6 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors">
                        View All Updates
                    </button>
                </Link>
            </div>

            {/* Bottom Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12 pt-8 border-t">
                <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{nuggetsData?.data?.pagination?.total || 0}</div>
                    <div className="text-sm text-muted-foreground">Total Updates</div>
                </div>
                <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">32</div>
                    <div className="text-sm text-muted-foreground">Active Writers</div>
                </div>
                <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{feedItems.length}</div>
                    <div className="text-sm text-muted-foreground">Recent Updates</div>
                </div>
                <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">Live</div>
                    <div className="text-sm text-muted-foreground">Coverage</div>
                </div>
            </div>
        </section>
    );
}