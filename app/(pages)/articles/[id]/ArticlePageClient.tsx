'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Clock, User, Shield, Lock, Calendar, Eye, Gem } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import Image from 'next/image'
import { useGetArticleQuery, getImageUrl, Article, useGetArticlesQuery } from '@/lib/services/articlesApi'
import ArticleCTA from '../../../components/ArticlesCTA'

export function getTimeAgo(isoString: string): string {
    const publishedDate = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - publishedDate.getTime();

    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min${diffMins === 1 ? "" : "s"} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
    return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
}

export function formatDate(isoString: string): string {
    const date = new Date(isoString);
    const options: Intl.DateTimeFormatOptions = {
        year: "numeric",
        month: "long",
        day: "numeric",
    };
    return date.toLocaleDateString("en-US", options);
}

export default function ArticlePageClient({ id }: { id: string }) {
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

    // Safe content rendering with error handling
    const renderArticleContent = () => {
        try {
            if (!article.content) {
                return <div>Content not available</div>
            }

            let contentToRender = article.content

            // Check if content starts with '{' and try to parse it as JSON
            if (article.content.trim().startsWith('{')) {
                try {
                    const contentObj = JSON.parse(article.content)
                    contentToRender = contentObj.content || article.content
                } catch (parseError) {
                    console.warn('Failed to parse JSON content, falling back to raw content:', parseError)
                    contentToRender = article.content
                }
            }

            if (article.access !== 'public' && (!isAuthenticated || (!canAccess && !hasAccess))) {
                const previewLength = Math.floor(contentToRender.length * 0.2)
                const previewContent = contentToRender.substring(0, previewLength)

                let endIndex = previewLength
                const sentenceEnd = previewContent.lastIndexOf('.')
                const wordEnd = previewContent.lastIndexOf(' ')

                if (sentenceEnd > previewLength * 0.8) {
                    endIndex = sentenceEnd + 1
                } else if (wordEnd > previewLength * 0.8) {
                    endIndex = wordEnd
                }

                const finalPreview = contentToRender.substring(0, endIndex)

                return (

                    <div>
                        <div className="content-preview ">
                            <div dangerouslySetInnerHTML={{ __html: finalPreview }} />
                        </div>
                        <div className="mb-12">
                            <div className="p-10 text-center rounded-2xl shadow-lg border">
                                <h3 className="text-3xl font-extrabold text-[#E64A30] mb-3">
                                    Unlock Premium Content
                                </h3>
                                <p className="mb-6 max-w-lg mx-auto">
                                    Get expert insights, insider reports, and advanced stats designed
                                    to keep you ahead of the competition.
                                </p>

                                <div className="rounded-xl p-6 mb-6 border shadow-sm">
                                    <h4 className="font-semibold mb-3 text-gray-800 dark:text-gray-600">
                                        Premium Includes:
                                    </h4>
                                    <ul className="text-sm space-y-2 text-gray-600 dark:text-white text-left max-w-sm mx-auto">
                                        <li className="flex items-start gap-2">
                                            <span className="text-[#E64A30]">✔</span> Exclusive NFL analysis & insider reports
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-[#E64A30]">✔</span> Advanced stats & performance metrics
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-[#E64A30]">✔</span> Early draft predictions & rankings
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-[#E64A30]">✔</span> Premium fantasy football content
                                        </li>
                                    </ul>
                                </div>

                                <div className="space-y-3 max-w-sm mx-auto">
                                    <Link
                                        href="/subscribe"
                                        className="w-full bg-[#E64A30] border hover:bg-[#ED7864] text-white py-3 px-6 rounded-xl font-semibold block shadow-lg"
                                    >
                                        Upgrade to Premium
                                    </Link>
                                    <Link
                                        href="/login"
                                        className="w-full border border-[#E64A30] text-[#E64A30] py-3 px-6 rounded-xl font-semibold block"
                                    >
                                        Already Premium? Sign In
                                    </Link>
                                </div>

                                <p className="text-xs mt-4 text-gray-500">Starting at $10/month</p>
                            </div>
                        </div>

                    </div>
                )
            }

            // If user has access, return full content
            if (contentToRender) {
                // Split content into paragraphs to allow column layout
                const paragraphs = contentToRender
                    .split(/<\/p>/i)
                    .filter(Boolean)
                    .map((p, index) => (
                        <div key={index} dangerouslySetInnerHTML={{ __html: p + "</p>" }} />
                    ));

                return (
                    <div
                        className="columns-1 md:columns-2 gap-8 [&>*]:break-inside-avoid"
                    >
                        {paragraphs}
                    </div>
                );
            }
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
                    height={500}
                    className="mb-12 shadow-lg w-full lg:h-[500px] rounded-2xl h-[200px]"
                    // sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
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
            <div className="max-w-6xl mx-auto ">
                {/* Article Header */}
                <div key={article.id}>
                    <div className="flex">
                        {renderArticleImage()}
                    </div>
                    <h1 className="text-4xl font-bold mb-10 text-[#1D212D] dark:text-[#D2D6E2]">{article.title || 'Untitled Article'}</h1>

                    <div className="flex flex-wrap mb-5 gap-2">
                        {/* Category */}
                        <div className="flex items-center gap-2 bg-[#F6BCB2] rounded-full text-black px-5 py-1.5">
                            <span className="font-medium">NFL</span>
                        </div>

                        {/* Published Time */}
                        <div className="flex items-center gap-2 bg-[#F6BCB2] rounded-full text-black px-4 py-1.5">
                            <Calendar size={16} className="text-black" />
                            <span className="text-sm">{getTimeAgo(article.publishedAt!)}</span>
                        </div>

                        {/* Published Date */}
                        <div className="flex items-center gap-2 bg-[#F6BCB2] rounded-full text-black px-4 py-1.5">
                            <Clock size={16} className="text-black" />
                            <span className="text-sm">{formatDate(article.publishedAt!)}</span>
                        </div>
                    </div>


                    {/* Display ArticleCTA only if user is not authenticated */}
                    {!isAuthenticated && article.access === 'public' && <ArticleCTA />}
                    <div className="prose max-w-none prose-sm sm:prose-base md:prose-lg lg:prose-xl dark:prose-invert mx-auto">
                        <div className="columns-1 gap-8 [&>*]:break-inside-avoid">
                            {renderArticleContent()}
                        </div>
                    </div>

                </div>
                {/* Recent Articles */}
                <div className="mt-12">
                    <h3 className="text-4xl mb-6 text-center">Recent Articles</h3>
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
                                    <div key={recentArticle.id} className='rounded-3xl shadow-md overflow-hidden hover:shadow-xl transition-shadow hover:cursor-pointer group p-0 bg-white dark:bg-[#262829]'>
                                        <Link href={`/articles/${recentArticle.id}`}>

                                            {/* Article Image */}
                                            <div className="relative aspect-video">
                                                {recentArticle.featuredImage ? (
                                                    <Image
                                                        src={getImageUrl(recentArticle.featuredImage) || ''}
                                                        alt={recentArticle.title}
                                                        fill
                                                        className="object-cover p-2 rounded-3xl"
                                                        priority
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-500 text-sm">No Image</div>
                                                )}


                                                {/* Access Badge */}
                                                <div className="absolute top-3 left-3 bg-white text-[var(--color-orange)] px-2 py-1 rounded-full font-semibold text-xs flex items-center shadow-md dark:bg-black">
                                                    <Gem className="w-4 h-4 mr-1" />
                                                    {recentArticle.access === 'public' ? 'Free' : 'Premium'}
                                                </div>



                                                {/* Author Name */}
                                                {recentArticle.authorName && (
                                                    <div className="absolute bottom-5 right-5 text-white text-sm bg-[#ED7864] bg-opacity-50 px-2 py-1 rounded-full">
                                                        {recentArticle.authorName}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Article Body */}
                                            <div className="relative p-4 h-[250px] overflow-hidden">
                                                <h2 className="text-lg font-semibold mb-2 line-clamp-1 text-[#3A3D48] dark:text-[#C7C8CB]">{recentArticle.title}</h2>

                                                <div className="text-sm line-clamp-3 overflow-hidden relative z-10  text-[#72757C] dark:text-white">
                                                    <div dangerouslySetInnerHTML={{ __html: recentArticle.content }} />
                                                </div>

                                                {/* <div className="absolute bottom-0 left-0 w-full h-44 bg-gradient-to-t from-[#1A1330] to-transparent z-20 pointer-events-none" /> */}

                                                {/* Hover Action Button */}
                                                <div className="absolute bottom-5 left-0 rounded-full px-6 py-2 z-30 transition-opacity">
                                                    <div className="bg-[var(--color-orange)] text-white text-center py-2 rounded-full px-6 hover:scale-105 transition-transform dark:text-black">
                                                        Read Article
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    </div>
                                )
                            })}
                    </div>
                </div>
            </div>
        </div>
    )
} 