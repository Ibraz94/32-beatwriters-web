'use client'

import Link from 'next/link'
import { Clock, Shield, User } from 'lucide-react'
import Image from 'next/image'
import { useGetArticlesQuery, getImageUrl } from '@/lib/services/articlesApi'
import { useState, useEffect } from 'react'

export default function ArticlesPage() {
  const [page, setPage] = useState(1)
  const [allArticles, setAllArticles] = useState<any[]>([])
  const [hasMoreArticles, setHasMoreArticles] = useState(true)
  
  // Simplified query - fetch all published articles with basic pagination
  const { data: articles, isLoading, error, isFetching } = useGetArticlesQuery({
    page: page,
    limit: 12,
    status: 'published',
  })

  // Handle loading more articles
  useEffect(() => {
    if (articles?.articles) {
      if (page === 1) {
        // First load - replace all articles
        setAllArticles(articles.articles)
      } else {
        // Load more - append new articles
        setAllArticles(prev => [...prev, ...articles.articles])
      }
      setHasMoreArticles(articles.articles.length === 12)
    }
  }, [articles, page])
  
  // Loading state (only show skeleton on initial load)
  if (isLoading && page === 1) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Articles</h1>
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
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Articles</h1>
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
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Articles</h1>
          <p className="text-xl mb-4">No articles found</p>
          <p className="text-gray-600">Check back later for new content.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Articles
        </h1>
        <p className="text-xl max-w-4xl mx-auto">
          In-depth analysis, breaking news, and expert insights from the world of professional football
        </p>
      </div>

      {/* Articles Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {allArticles.map((article, index) => (
          <article key={index} className="rounded-xl border shadow-lg overflow-hidden hover:shadow-xl transition-shadow hover:cursor-pointer">
            {/* Article Image */}
            <div className="relative h-48">
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
              
              {/* Premium Badge */}
              {article.isPremium && (
                <div className="absolute top-3 right-3 bg-red-800 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center">
                  <Shield className="w-3 h-3 mr-1" />
                  Premium
                </div>
              )} 
            </div>

            {/* Article Content */}
            <div className="p-6">
              <h2 className="text-lg font-bold mb-3 line-clamp-2 hover:text-red-800 transition">
                <Link href={`/articles/${article.id}`}>
                  {article.title}
                </Link>
              </h2>
              
              {/* <p className="mb-4 line-clamp-3 text-gray-600">
                {article.excerpt}
              </p> */}

              {/* Article Meta */}
              <div className="flex items-center justify-between text-sm mb-4 text-gray-500">
                <div className="flex items-center">
                  {article.publishedAt} 
                </div>
              </div>

              {/* Read More Button */}
              <Link 
                href={`/articles/${article.id}`}
                className={`w-full py-2 px-4 rounded-lg font-semibold text-center block transition-colors hover:scale-102 hover:cursor-pointer ${
                  article.isPremium
                    ? 'bg-red-800 hover:bg-red-900'
                    : 'border-2 border-red-800 text-white bg-red-800'
                }`}
              >
                {article.isPremium ? 'Read Premium Article' : 'Read Article'}
              </Link>
            </div>
          </article>
        ))}
      </div>

      {/* Load More Section */}
      {hasMoreArticles && (
        <div className="text-center mt-12">
          <button 
            onClick={() => {
              if (!isFetching) {
                setPage(page + 1)
              }
            }}
            disabled={isFetching}
            className={`px-8 py-3 rounded-lg font-semibold transition-colors ${
              isFetching 
                ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                : 'bg-red-800 text-white hover:scale-102 hover:cursor-pointer'
            }`}
          >
            {isFetching ? 'Loading...' : 'Load More Articles'}
          </button>
        </div>
      )}
      
      {/* No More Articles Message */}
      {!hasMoreArticles && allArticles.length > 0 && (
        <div className="text-center mt-12">
          <p className="text-gray-600 text-lg">
            You've reached the end of our articles. Check back later for new content!
          </p>
        </div>
      )}
    </div>
  )
}

