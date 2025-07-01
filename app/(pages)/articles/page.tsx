'use client'

import Link from 'next/link'
import { Gem, Shield } from 'lucide-react'
import Image from 'next/image'
import { useGetArticlesQuery, getImageUrl } from '@/lib/services/articlesApi'
import { useState, useEffect } from 'react'
import { useAuth } from './hooks/useAuth'

export default function ArticlesPage() {
  const [page, setPage] = useState(1)
  const [allArticles, setAllArticles] = useState<any[]>([])
  const [hasMoreArticles, setHasMoreArticles] = useState(true)
  const [isAccessible, setIsAccessible] = useState(false)

  // Get user authentication status and premium access  
  const { checkPremiumAccess, isAuthenticated, user } = useAuth()
  const hasPremiumAccess = checkPremiumAccess()

  // Simplified query - fetch all published articles with basic pagination
  const { data: articles, isLoading, error, isFetching } = useGetArticlesQuery({
    page: page,
    limit: 12,
    status: 'published',
  })

  // Handle loading more articles
  useEffect(() => {
    if (articles?.data.articles) {
      if (page === 1) {
        // First load - replace all articles
        setAllArticles(articles.data.articles)
      } else {
        // Load more - append new articles
        setAllArticles(prev => [...prev, ...articles.data.articles])
      }
      setHasMoreArticles(articles.data.articles.length === 12)
    }
  }, [articles, page])

  useEffect(() => {
    if (articles?.data.articles) {
      setIsAccessible(articles.data.articles.some(article => article.access === 'public' || article.access === 'pro' || article.access === 'lifetime'))
    }
  }, [articles])

  // Helper function to check if user can access an article
  const canAccessArticle = (articleAccess: string) => {
    if (articleAccess === 'public') return true

    // Check if user is admin using case-insensitive comparison
    const userRole = user?.roles.id
    const isAdminByRole = userRole === 1 || userRole === 2 || userRole === 3 || userRole === 4

    // Administrators can access all articles
    if (isAdminByRole) {
      console.log('✅ Administrator access granted for article:', articleAccess)
      return true
    }

    if (articleAccess === 'premium' || articleAccess === 'lifetime') {
      return hasPremiumAccess
    }
    return false
  }

  // Helper function to get access status text
  const getAccessStatusText = (articleAccess: string) => {
    if (articleAccess === 'public') return 'Free Article'
    if (articleAccess === 'premium') return 'Premium Article'
    if (articleAccess === 'lifetime') return 'Lifetime Article'
    return 'Article'
  }

  // Helper function to get button configuration
  const getButtonConfig = (article: any) => {
    const canAccess = canAccessArticle(article.access)

    if (canAccess) {
      return {
        text: 'Read Article',
        href: `/articles/${article.id}`,
        className: 'w-full py-3 px-4 rounded-lg font-semibold text-center block transition-colors hover:scale-102 hover:cursor-pointer bg-red-800 text-white',
        isClickable: true
      }
    } else {
      return {
        text: isAuthenticated ? 'Upgrade to Premium' : 'Login for Premium',
        href: isAuthenticated ? '/subscribe' : '/login',
        className: 'w-full py-3 px-4 rounded-lg font-semibold text-center block transition-colors hover:scale-102 hover:cursor-pointer bg-red-800 text-white',
        isClickable: true
      }
    }
  }

  // Loading state (only show skeleton on initial load)
  if (isLoading && page === 1) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <p className="text-xl max-w-4xl mx-auto">Loading articles...</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Loading skeleton */}
          {[...Array(6)].map((_, i) => (
            <div key={i} className="rounded-xl border shadow-lg overflow-hidden animate-pulse">
              <div className="h-48 bg-gray-200"></div>
              <div className="p-6">
                <div className="h-6 bg-gray-200 rounded mb-3"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded mb-4 w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-xl text-red-600 mb-4">Failed to load articles</p>
          <p className="text-gray-600">Error details: {JSON.stringify(error)}</p>
          <p className="text-gray-600">Please try again later.</p>
        </div>
      </div>
    )
  }

  // No articles found
  if (!isLoading && allArticles.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-xl mb-4">No articles found</p>
          <p className="text-gray-600">Check back later for new content.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Articles Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {allArticles.map((article, index) => {
          const buttonConfig = getButtonConfig(article)
          const canAccess = canAccessArticle(article.access)

          return (
            <article key={index} className="rounded-md shadow-md overflow-hidden hover:shadow-xl transition-shadow hover:cursor-pointer bg-[#2C204B] p-4">
              {/* Article Image */}
              <Link href={buttonConfig.href}>
                <div className="relative h-72">
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                    {article.featuredImage ? (
                      <Image
                        src={getImageUrl(article.featuredImage) || ''}
                        alt={article.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover"
                        priority
                      />
                    ) : (
                      <span className="text-gray-500 text-sm">No Image</span>
                    )}
                  </div>

                  {/* Access Badge */}
                  {article.access !== 'public' && (
                    <div className="absolute top-3 right-3 bg-red-800 text-white px-2 py-1 rounded-full font-semibold flex items-center">
                      {article.access === 'pro' || article.access === 'lifetime' ? (
                        <>
                          <Gem className="w-4 h-4 mr-1" />
                          Premium
                        </>
                      ) : (
                        <>
                          <Gem className="w-4 h-4 mr-1" />
                          Premium
                        </>
                      )}
                    </div>
                  )}

                  {/* Overlay for locked content */}
                  {!canAccess && (
                    <div className="flex items-center justify-center">
                      <Image src={getImageUrl(article.featuredImage) || ''}
                        alt="Locked" width={100} height={100} className="object-cover" />
                    </div>
                  )}
                </div>

                {/* Article Content */}
                <div className="mt-6">
                  <h2 className="text-2xl text-left font-bold mb-3 line-clamp-1 text-white">
                    {canAccess ? (
                      <div>
                        {article.title}
                      </div>
                    ) : (
                      <span className="cursor-default">{article.title}</span>
                    )}
                  </h2>

                  {/* Access Status */}
                  <div className="text-gray-300 text-sm sm:text-base md:text-lg lg:text-xl line-clamp-2 md:line-clamp-2 mb-1 md:mb-4">
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

                {/* Action Button */}
                <div

                  className={buttonConfig.className}
                >
                  {buttonConfig.text}
                </div>
              </div>
            </Link>
            </article>
      )
        })}
    </div>

      {/* Load More Section */ }
  {
    hasMoreArticles && (
      <div className="text-center mt-12">
        <button
          onClick={() => {
            if (!isFetching) {
              setPage(page + 1)
            }
          }}
          disabled={isFetching}
          className={`px-8 py-3 rounded-lg font-semibold transition-colors ${isFetching
              ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
              : 'bg-red-800 text-white hover:scale-102 hover:cursor-pointer'
            }`}
        >
          {isFetching ? 'Loading...' : 'Load More Articles'}
        </button>
      </div>
    )
  }

  {/* No More Articles Message */ }
  {
    !hasMoreArticles && allArticles.length > 0 && (
      <div className="text-center mt-12">
        <p className="text-gray-600 text-lg">
          You've reached the end of our articles. Check back later for new content!
        </p>
      </div>
    )
  }
    </div >
  )
}

