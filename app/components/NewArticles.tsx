'use client'

import Link from "next/link";
import Image from "next/image";
import { Calendar, ArrowRight, TrendingUp, Lock } from "lucide-react";
import { useGetArticlesQuery, Article, getImageUrl } from "@/lib/services/articlesApi";
import { useAuth } from "@/lib/hooks/useAuth";

export default function NewArticles() {
    const { isAuthenticated, checkPremiumAccess, user } = useAuth();
    const hasPremiumAccess = checkPremiumAccess();

    // Fetch all articles (public, pro, and lifetime) to show in the grid
    const { data: articles, isLoading, error } = useGetArticlesQuery({
        page: 1,
        limit: 20, // Fetch more articles to ensure we have enough to show (1 featured + 10+ sidebar)
        sortBy: 'publishedAt',
        sortOrder: 'desc'
    });

    // Helper function to check if user can access an article (same as articles page)
    const canAccessArticle = (articleAccess: string) => {
        if (articleAccess === 'public') return true;

        // Check if user is admin using case-insensitive comparison
        const userRole = user?.roles.id;
        const isAdminByRole = userRole === 1 || userRole === 2 || userRole === 3 || userRole === 4;

        // Administrators can access all articles
        if (isAdminByRole) {
            return true;
        }

        if (articleAccess === 'pro' || articleAccess === 'lifetime') {
            return hasPremiumAccess;
        }
        return false;
    };

    // Helper function to get the correct href based on access
    const getArticleHref = (article: Article) => {
        const canAccess = canAccessArticle(article.access);

        if (canAccess) {
            return `/articles/${article.id}`;
        } else {
            return isAuthenticated ? '/subscribe' : '/login';
        }
    };

    // Helper function to format date
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

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
    };

    if (error) {
        return (
            <section className="container mx-auto px-4 py-16">
                <div className="text-center">
                    <p className="text-red-600 font-medium">Failed to load articles</p>
                </div>
            </section>
        );
    }

    const displayArticles = articles?.data.articles || [];
    const featuredArticle = displayArticles[0];
    const sidebarArticles = displayArticles.slice(1, 11); // Show 10 articles in sidebar

    return (
        <section className="mt-16">
            <div className="bg-[#2C204B] rounded-lg">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Left Sidebar - Latest Articles */}
                    <div className="lg:w-1/2 p-8">
                        <h2 className="text-3xl lg:text-4xl font-bold text-white mb-8">
                            Latest Articles
                        </h2>

                        <div className="space-y-6 max-h-[650px] overflow-y-auto pr-2 custom-scrollbar">
                            {sidebarArticles.map((article: Article) => (
                                <Link
                                    key={article.id}
                                    href={getArticleHref(article)}
                                    className="flex gap-4 hover:opacity-90 transition-opacity duration-300 group"
                                >
                                    {/* Article Image */}
                                    <div className="relative h-52 w-96 flex-shrink-0 overflow-hidden rounded-lg">
                                        {article.featuredImage ? (
                                            <Image
                                                src={getImageUrl(article.featuredImage) || ''}
                                                alt={article.title}
                                                fill
                                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gray-600 flex items-center justify-center">
                                                <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                        )}

                                        {/* Premium Badge */}
                                        {(article.access === 'pro' || article.access === 'lifetime') && (
                                            <div className="absolute top-1 right-1 bg-amber-500 text-white px-1.5 py-0.5 rounded text-xs font-bold flex items-center gap-1">
                                                <Lock className="h-2 w-2" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Article Content */}
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-white text-3xl mb-2 line-clamp-2 leading-tight">
                                            {article.title}
                                        </h3>
                                        <div className="text-gray-300 text-xl line-clamp-3 mb-2">
                                            {(() => {
                                                try {
                                                    // Check if content starts with '{' and try to parse it as JSON
                                                    if (article.content.trim().startsWith('{')) {
                                                        const contentObj = JSON.parse(article.content);
                                                        return <div dangerouslySetInnerHTML={{ __html: contentObj.content || article.content }} />;
                                                    }
                                                    // If not JSON or parsing fails, return original content
                                                    return <div dangerouslySetInnerHTML={{ __html: article.content }} />;
                                                } catch (error) {
                                                    // If JSON parsing fails, return original content
                                                    console.error('Error parsing content:', error);
                                                    return <div dangerouslySetInnerHTML={{ __html: article.content }} />;
                                                }
                                            })()}
                                        </div>

                                        {/* Premium Content Notice */}
                                        {(article.access === 'pro' || article.access === 'lifetime') && (
                                            <div className="flex items-center gap-1 text-xs">
                                                <Lock className="h-3 w-3 text-amber-400" />
                                                <span className="text-amber-400 font-medium">
                                                    {!isAuthenticated
                                                        ? 'Login required'
                                                        : !hasPremiumAccess
                                                            ? 'Premium required'
                                                            : 'Premium content'
                                                    }
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Right Side - Featured Article */}
                    <div className="lg:w-1/2">
                        {featuredArticle && (
                            <Link href={getArticleHref(featuredArticle)} className="block group">
                                <div className="relative h-96 lg:h-[800px] overflow-hidden">
                                    {/* Background Image */}
                                    {featuredArticle.featuredImage ? (
                                        <Image
                                            src={getImageUrl(featuredArticle.featuredImage) || ''}
                                            alt={featuredArticle.title}
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-orange-400 to-red-600"></div>
                                    )}

                                    {/* Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>

                                    {/* Content Overlay */}
                                    <div className="absolute inset-0 p-6 lg:p-8 flex flex-col justify-end">
                                        {/* Trending Badge */}
                                        <div className="mb-4">
                                            <span className="inline-flex items-center gap-2 bg-red-800 opacity-60 text-white px-4 py-2 rounded-full text-sm font-bold">
                                                <TrendingUp className="h-4 w-4" />
                                                Trending
                                            </span>
                                        </div>

                                        {/* Date */}
                                        <p className="text-2xl mb-4">
                                            {featuredArticle.publishedAt ? formatDate(featuredArticle.publishedAt) : 'Date not available'}
                                        </p>

                                        {/* Title */}
                                        <h2 className="text-3xl lg:text-5xl font-bold text-white leading-tight mb-4">
                                            {featuredArticle.title}
                                        </h2>

                                        {/* Premium Badge for Featured */}
                                        {(featuredArticle.access === 'pro' || featuredArticle.access === 'lifetime') && (
                                            <div className="flex items-center gap-2 text-sm">
                                                <Lock className="h-4 w-4 text-amber-400" />
                                                <span className="text-amber-400 font-medium">
                                                    {!isAuthenticated
                                                        ? 'Login required to read'
                                                        : !hasPremiumAccess
                                                            ? 'Premium subscription required'
                                                            : 'Premium content'
                                                    }
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            {/* Show message if no articles */}
            {displayArticles.length === 0 && (
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
            {displayArticles.length > 0 && (
                <div className="text-center mt-12">
                    <Link href="/articles">
                        <button className="group bg-red-800 hover:scale-102 text-white px-12 py-4 rounded-md font-semibold transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2 mx-auto">
                            View All Articles
                            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </Link>
                </div>
            )}
        </section>
    );
}