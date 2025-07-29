'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Clock, User, Shield, Lock, Calendar, Eye } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import Image from 'next/image'
import { useGetArticleQuery, getImageUrl, Article, useGetArticlesQuery } from '@/lib/services/articlesApi'
import { renderRichTextContent } from '@/lib/utils/contentParser'
import ArticleCTA from '../../../components/ArticlesCTA'

type Props = {
    content: string
}

// Premium access component
const PremiumAccessRequired = ({ content }: Props) => {
    return (
        <div className="border-2 rounded-xl p-8 text-center">
            <div className="w-16 h-16 bg-red-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-white" />
            </div>

            <h3 className="text-2xl font-bold text-red-800 mb-4">Premium Content</h3>

            <p className="mb-6 max-w-md mx-auto">
                This article is exclusive to our premium subscribers. Upgrade your account to access in-depth analysis, insider reports, and expert insights.
            </p>

            <div className="rounded-lg p-4 mb-6 border border-red-200">
                <h4 className="font-semibold mb-2">What you'll get with Premium:</h4>
                <ul className="text-sm space-y-1">
                    <li>• Exclusive NFL analysis and insider reports</li>
                    <li>• Advanced statistics and performance metrics</li>
                    <li>• Early access to draft predictions and rankings</li>
                    <li>• Premium fantasy football content</li>
                </ul>
            </div>

            <div className="space-y-3">
                <Link
                    href="/premium"
                    className="w-full bg-red-800 text-white py-3 px-6 rounded-lg font-semibold hover:scale-102 transition-colors block"
                >
                    Upgrade to Premium
                </Link>

                <Link
                    href="/login"
                    className="w-full border border-red-800 text-red-800 py-3 px-6 rounded-lg font-semibold hover:scale-102 transition-colors block"
                >
                    Already Premium? Sign In
                </Link>
            </div>

            <p className="text-xs mt-4">
                Starting at $10/month
            </p>
        </div>
    )
}

interface ArticlePageClientProps {
    id: string
}

export default function ArticlePageClient({ id }: ArticlePageClientProps) {
    const { user, isAuthenticated, loading: authLoading } = useAuth()

    // Use the dedicated hook to fetch a single article by slug
    const { data: article, isLoading: articleLoading, error } = useGetArticleQuery(id)
    // Fetch recent articles
    const { data: recentArticlesData, isLoading: recentLoading } = useGetArticlesQuery({
        limit: 6,
        status: 'published',
        sortBy: 'publishedAt',
        sortOrder: 'desc'
    })

    // Add debugging to see the response structure
    useEffect(() => {
    }, [article, articleLoading, error])

    // Add debugging for recent articles
    useEffect(() => {
        console.log('Recent Articles Data:', recentArticlesData?.data?.articles)
    }, [recentArticlesData])

    if (articleLoading || authLoading || recentLoading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-6xl mx-auto">
                    <div className="animate-pulse">
                        <div className="h-8 bg-gray-200 rounded mb-4"></div>
                        <div className="h-64 bg-gray-200 rounded mb-6"></div>
                        <div className="space-y-3">
                            <div className="h-4 bg-gray-200 rounded"></div>
                            <div className="h-4 bg-gray-200 rounded"></div>
                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    if (error || !article) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-6xl mx-auto text-center">
                    <h1 className="text-3xl font-bold mb-4">Article Not Found</h1>
                    <p className="text-gray-600 mb-8">The article you're looking for doesn't exist or has been moved.</p>
                    <Link
                        href="/articles"
                        className="text-red-800 px-6 py-3 rounded-lg font-semibold hover:bg-white transition-colors"
                    >
                        Back to Articles
                    </Link>
                </div>
            </div>
        )
    }

    // Check if user has access to premium content
    const hasAccess = isAuthenticated && Array.isArray(user?.memberships) && user.memberships.some(membership =>
        membership.status === 'active' && membership.plan?.access === 'pro'
    )

    // If article is premium and user doesn't have access, show premium access required
    if (article.access === 'pro' && !hasAccess) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-6xl mx-auto">
                    <PremiumAccessRequired content={article.content} />
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-6xl mx-auto article-container">
                {/* Article Header */}
                <div key={article.id}>
                    <div className="flex justify-center ">
                        <Image src={getImageUrl(article.featuredImage) || ''}
                            alt={article.title} width={1000} height={1000} className="rounded mb-12 shadow-lg max-w-4xl" sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />
                    </div>
                    <h1 className="text-4xl font-bold mb-10">{article.title}</h1>

                    {/* Display ArticleCTA only if user is not authenticated */}
                    {!isAuthenticated && <ArticleCTA />}

                    <div className="prose max-w-none prose" />
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

                {/* Recent Articles */}
                <div className="mt-12">
                    <h3 className="text-2xl font-bold mb-6">Recent Articles</h3>
                    <div className="grid md:grid-cols-3 gap-6">
                        {recentArticlesData?.data?.articles
                            .filter((recentArticle: Article) => {
                                console.log('Article being filtered:', recentArticle)
                                return recentArticle.id !== article?.id
                            })
                            .sort((a: Article, b: Article) => new Date(b.publishedAt || '').getTime() - new Date(a.publishedAt || '').getTime())
                            .slice(0, 3)
                            .map((recentArticle: Article) => {
                                console.log('Rendering article:', recentArticle)
                                return (
                                    <Link
                                        key={recentArticle.id}
                                        href={`/articles/${recentArticle.id}`}
                                        className="rounded-lg shadow-md border overflow-hidden hover:shadow-lg transition-shadow"
                                    >
                                        <div className="relative h-42">
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <Image
                                                    src={getImageUrl(recentArticle.featuredImage) || ''}
                                                    alt={recentArticle.title || 'Article image'}
                                                    width={1000}
                                                    height={1000}
                                                    className="object-cover w-full h-full"
                                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                                />
                                            </div>
                                            {recentArticle.access === 'pro' && (
                                                <div className="absolute top-2 right-2 bg-red-800 text-white px-2 py-1 rounded text-xs font-semibold">
                                                    Premium
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-4">
                                            <h4 className="font-bold mb-2 line-clamp-2 min-h-[3rem]">
                                                {recentArticle.title || 'Untitled Article'}
                                            </h4>
                                            <p className="text-sm text-gray-600 line-clamp-3">
                                                {recentArticle.content?.substring(0, 100)}...
                                            </p>
                                            <div className="flex items-center justify-between mt-4 text-xs text-gray-500">
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" />
                                                    {new Date(recentArticle.publishedAt || '').toLocaleDateString()}
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                )
                            })}
                    </div>
                </div>
            </div>
        </div>
    )
} 