'use client'

import Link from "next/link";
import Image from "next/image";
import { Calendar, ArrowRight, TrendingUp } from "lucide-react";
import { useGetArticlesQuery, Article, getImageUrl } from "@/lib/services/articlesApi";

export default function NewArticles() {
    const { data: articles, isLoading, error } = useGetArticlesQuery({ 
        page: 1, 
        limit: 12,
        sortBy: 'publishedAt',
        sortOrder: 'desc'
    });

    if (isLoading) {
        return (
            <section className="container mx-auto px-4 py-16">
                <div className="animate-pulse space-y-6">
                    <div className="h-8 bg-gray-200 rounded w-64 mx-auto"></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="bg-gray-200 rounded-xl h-80"></div>
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    if (error) {
        return (
            <section className="container mx-auto px-4 py-16">
                <div className="text-center">
                    <p className="text-red-600 font-medium">Failed to load articles</p>
                </div>
            </section>
        );
    }

    // Filter to only show free (public) articles and get the latest 3
    const publicArticles = articles?.data.articles
        ?.filter((article: Article) => article.access === 'public')
        ?.slice(0, 3) || [];

    return (
        <section className="px-4 py-16 bg-card">
            {/* Header */}
            <div className="text-center mb-12">
                <h2 className="text-3xl md:text-5xl font-bold mb-4">
                    Latest <span className="text-red-800">Articles</span>
                </h2>
                <p className="text-xl max-w-2xl mx-auto">
                    Free access to breaking news and analysis from our network of NFL beat writers.
                </p>
            </div>

            {/* Articles Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 container mx-auto">
                {publicArticles.map((article: Article, index: number) => (
                    <Link
                        key={article.id}
                        href={`/articles/${article.id}`}
                        className={`group rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-red-200 transition-all duration-300 overflow-hidden ${
                            index === 0 ? 'md:col-span-2 lg:col-span-1' : ''
                        }`}
                    >
                        {/* Article Image */}
                        <div className="relative aspect-[16/10] overflow-hidden">
                            {article.featuredImage ? (
                                <Image 
                                    src={getImageUrl(article.featuredImage) || ''} 
                                    alt={article.title}
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <div className="text-center text-gray-500">
                                        <svg className="w-16 h-16 mx-auto mb-2 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                                        </svg>
                                        <span className="text-sm font-medium">No Image Available</span>
                                    </div>
                                </div>
                            )}
                            
                            {/* Trending Badge (for first article) */}
                            {index === 0 && (
                                <div className="absolute top-4 left-4 bg-red-800 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                                    <TrendingUp className="h-3 w-3" />
                                    Featured
                                </div>
                            )}
                        </div>

                        {/* Article Content */}
                        <div className="p-6">
                            {/* Date */}
                            <div className="flex items-center gap-2 text-sm mb-3">
                                <Calendar className="h-4 w-4" />
                                <time dateTime={article.publishedAt}>
                                    {new Date(article.publishedAt || '').toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric'
                                    })}
                                </time>
                            </div>

                            {/* Title */}
                            <h3 className="font-bold text-xl mb-3 line-clamp-2 leading-tight">
                                {article.title}
                            </h3>


                            {/* Footer */}

                        </div>
                    </Link>
                ))}
            </div>

            {/* Show message if no articles */}
            {publicArticles.length === 0 && (
                <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Articles Available</h3>
                    <p className="text-muted-foreground">Check back soon for new content.</p>
                </div>
            )}

            {/* Call to Action */}
            {publicArticles.length > 0 && (
                <div className="text-center mt-12">
                    <Link href="/articles">
                        <button className="group bg-red-800 hover:scale-102 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2 mx-auto">
                            View All Articles
                            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </Link>
                    
                    <p className="text-sm text-muted-foreground mt-4">
                        View more free articles and subscribe for premium in-depth analysis from all 32 NFL teams
                    </p>
                </div>
            )}
        </section>
    );
}