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
    const { user, isAuthenticated, loading: authLoading, checkPremiumAccess } = useAuth()
    const hasPremiumAccess = checkPremiumAccess()

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
        if (error) {
            console.error('Article fetch error:', error)
        }
    }, [article, articleLoading, error])

    // Add debugging for recent articles
    useEffect(() => {
        if (recentArticlesData?.data?.articles) {
            console.log('Recent Articles Data:', recentArticlesData.data.articles)
        }
    }, [recentArticlesData])

    // Helper function to check if user can access an article
    const canAccessArticle = (articleAccess: string) => {
        if (!articleAccess || articleAccess === 'public') return true

        // Safely check user role and membership
        const userRole = user?.roles?.id
        const userMembership = user?.memberships?.id
        
        // Handle both array and object structures for memberships
        let isProByMembership = false
        if (Array.isArray(user?.memberships)) {
            isProByMembership = user.memberships.some(membership => 
                membership?.id === 2 || membership?.id === 3
            )
        } else if (userMembership) {
            isProByMembership = userMembership === 2 || userMembership === 3
        }

        const isAdminByRole = userRole === 1 || userRole === 5

        // Administrators can access all articles
        if (isAdminByRole) {
            console.log('✅ Administrator access granted for article:', articleAccess)
            return true
        }
        
        if (isProByMembership) {
            return true
        }

        if (articleAccess.includes('pro') || articleAccess.includes('lifetime')) {
            return hasPremiumAccess
        }
        return false
    }

    const canAccess = canAccessArticle(article?.access ?? 'pro')

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

    // Check if user has access to premium content - safely handle different data structures
    const hasAccess = isAuthenticated && (() => {
        if (Array.isArray(user?.memberships)) {
            return user.memberships.some(membership =>
                membership?.status === 'active' && membership?.plan?.access === 'pro'
            )
        }
        return false
    })()

    // If article is premium and user doesn't have access, show premium access required
    if (!canAccess && !hasAccess) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-6xl mx-auto">
                    <PremiumAccessRequired content={article.content || ''} />
                </div>
            </div>
        )
    }

    // Safe content rendering with error handling
    const renderArticleContent = () => {
        try {
            if (!article.content) {
                return <div>Content not available</div>
            }

            // Check if content starts with '{' and try to parse it as JSON
            if (article.content.trim().startsWith('{')) {
                try {
                    const contentObj = JSON.parse(article.content)
                    return <div dangerouslySetInnerHTML={{ __html: contentObj.content || article.content }} />
                } catch (parseError) {
                    console.warn('Failed to parse JSON content, falling back to raw content:', parseError)
                    return <div dangerouslySetInnerHTML={{ __html: article.content }} />
                }
            }
            
            // If not JSON, return original content
            return <div dangerouslySetInnerHTML={{ __html: article.content }} />
        } catch (error) {
            console.error('Error rendering article content:', error)
            return <div>Error loading content. Please refresh the page.</div>
        }
    }

    // Safe image rendering
    const renderArticleImage = () => {
        try {
            if (!article.featuredImage) {
                return null
            }
            
            const imageUrl = getImageUrl(article.featuredImage)
            if (!imageUrl) {
                return null
            }

            return (
                <Image 
                    src={imageUrl}
                    alt={article.title || 'Article image'} 
                    width={1000} 
                    height={1000} 
                    className="rounded mb-12 shadow-lg max-w-4xl" 
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    onError={(e) => {
                        console.warn('Failed to load article image:', e)
                        // Hide the image on error
                        const target = e.target as HTMLImageElement
                        if (target) target.style.display = 'none'
                    }}
                />
            )
        } catch (error) {
            console.error('Error rendering article image:', error)
            return null
        }
    }

    // Add error boundary test (remove in production)
    if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
        // Test error boundary - uncomment to test
        // if (Math.random() < 0.1) throw new Error('Test error for error boundary')
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-6xl mx-auto article-container">
                {/* Article Header */}
                <div key={article.id}>
                    <div className="flex justify-center">
                        {renderArticleImage()}
                    </div>
                    <h1 className="text-4xl font-bold mb-10">{article.title || 'Untitled Article'}</h1>

                    {/* Display ArticleCTA only if user is not authenticated */}
                    {!isAuthenticated && article.access === 'public' && <ArticleCTA />}

                    <div className="prose max-w-none prose">
                        {renderArticleContent()}
                    </div>
                </div>

                {/* Recent Articles */}
                <div className="mt-12">
                    <h3 className="text-2xl font-bold mb-6">Recent Articles</h3>
                    <div className="grid md:grid-cols-3 gap-6">
                        {recentArticlesData?.data?.articles
                            ?.filter((recentArticle: Article) => {
                                return recentArticle?.id && recentArticle.id !== article?.id
                            })
                            ?.sort((a: Article, b: Article) => {
                                const dateA = new Date(a.publishedAt || '').getTime()
                                const dateB = new Date(b.publishedAt || '').getTime()
                                return dateB - dateA
                            })
                            ?.slice(0, 3)
                            ?.map((recentArticle: Article) => {
                                if (!recentArticle?.id) return null
                                
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
                                                    onError={(e) => {
                                                        const target = e.target as HTMLImageElement
                                                        if (target) target.style.display = 'none'
                                                    }}
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
                                                {recentArticle.content?.substring(0, 100) || 'No content available'}...
                                            </p>
                                            <div className="flex items-center justify-between mt-4 text-xs text-gray-500">
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" />
                                                    {recentArticle.publishedAt ? 
                                                        new Date(recentArticle.publishedAt).toLocaleDateString() : 
                                                        'Date not available'
                                                    }
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