'use client'

export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { Gem, Shield, Search, X } from 'lucide-react'
import Image from 'next/image'
import { useGetArticlesQuery, getImageUrl } from '@/lib/services/articlesApi'
import { useState, useEffect } from 'react'
import { useAuth } from './hooks/useAuth'
import SearchBar from '@/components/ui/search'

export default function ArticlesPage() {
  const [page, setPage] = useState(1)
  const [allArticles, setAllArticles] = useState<any[]>([])
  const [hasMoreArticles, setHasMoreArticles] = useState(true)
  const [isAccessible, setIsAccessible] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')

  // Get user authentication status and premium access  
  const { checkPremiumAccess, isAuthenticated, user } = useAuth()
  const hasPremiumAccess = checkPremiumAccess()

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
      setPage(1)
    }, 400)
    return () => clearTimeout(timer)
  }, [searchTerm])

  // Fetch articles with search
  const { data: articles, isLoading, error, isFetching } = useGetArticlesQuery({
    page: page,
    limit: 12,
    ...(debouncedSearchTerm && { search: debouncedSearchTerm })
  })

  // Handle loading more articles
  useEffect(() => {
    if (articles?.data.articles) {
      // Debug: Log the entire articles response
      console.log('🔍 Full articles response:', articles)
      console.log('🔍 Articles data:', articles.data.articles)

      if (page === 1) {
        // First load or search - replace all articles
        setAllArticles(articles.data.articles)
      } else {
        // Load more - append new articles only if they're not already present
        setAllArticles(prev => {
          const newArticles = articles.data.articles.filter(newArticle =>
            !prev.some(existingArticle => existingArticle.id === newArticle.id)
          )
          return [...prev, ...newArticles]
        })
      }
      setHasMoreArticles(articles.data.articles.length === 12)
    }
  }, [articles])

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
    const userMembership = user?.memberships.id
    const isAdminByRole = userRole === 1 || userRole === 5
    const isProByMembership = userMembership === 2 || userMembership === 3

    // Administrators can access all articles
    if (isAdminByRole) {
      // console.log('✅ Administrator access granted for article:', articleAccess)
      return true
    }
    if (isProByMembership) {
      return true
    }
    console.log('Article Access', articleAccess);
    if (articleAccess === 'premium' || articleAccess === 'lifetime') {
      return true
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
    // console.log('Article Access inside getButtonConfig', article.access);
    const canAccess = getAccessStatusText(article.access)

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
          <p className="text-xl max-w-4xl mx-auto dark:text-[#C7C8CB] text-[#3A3D48]">
            Loading articles...
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Loading skeleton */}
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="animate-pulse rounded-3xl shadow-md overflow-hidden bg-white dark:bg-[#262829] p-2"
            >
              {/* Image placeholder */}
              <div className="aspect-video bg-gray-200 dark:bg-[#3A3D48] rounded-3xl mb-4"></div>

              {/* Text placeholders */}
              <div className="space-y-3 px-4 pb-4">
                <div className="h-5 bg-gray-200 dark:bg-[#3A3D48] rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 dark:bg-[#3A3D48] rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 dark:bg-[#3A3D48] rounded w-2/3"></div>
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
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <p className="text-xl mb-4 font-semibold text-red-600">
            Failed to load articles
          </p>
          <p className="text-gray-600 dark:text-[#C7C8CB] mb-6">
            Please try again later.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-[var(--color-orange)] text-white px-6 py-2 rounded-full hover:scale-105 transition-transform dark:text-black"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }


  return (
    <div className="container mx-auto px-3 py-8">
      {/* Search Bar */}
      <div className="mb-8 flex w-full">
        <div className="relative w-full">
          {/* <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search articles..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="filter-input w-full pl-10 pr-10 py-3 rounded shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
          /> */}
          <div className="relative">
            {/* ✅ Background Layer */}
            <div
              className="
      hidden md:flex absolute 
left-[-12px] right-[-12px] 
       h-[300%] 
      bg-cover bg-center bg-no-repeat 
      bg-[url('/background-image2.png')] 
      opacity-10 dark:opacity-5
  "
              style={{
                transform: "scaleY(-1)",
                zIndex: -50,
                top: '-110px'
              }}

            ></div>
            <div className='text-center mb-12'>
              <h2 className="text-2xl md:text-5xl mb-4">Our Articles</h2>
            </div>
            <div className='flex justify-center'>
              <SearchBar
                placeholder="Search articles..."
                size="md"
                width="w-full md:w-1/2"
                buttonLabel="Search here"
                onButtonClick={() => alert("Button clicked!")}
                onChange={(value) => setSearchTerm(value)}
                className="flex justify-center items-center"
              />
            </div>
          </div>
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-600 focus:outline-none"
              aria-label="Clear search"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Content Area */}
      {!isLoading && allArticles.length === 0 ? (
        // No articles found
        <div className="text-center">
          <p className="text-xl mb-4">
            {debouncedSearchTerm ? `No articles found for "${debouncedSearchTerm}"` : 'No articles found'}
          </p>
          <p className="text-gray-600">
            {debouncedSearchTerm ? 'Try a different search term.' : 'Check back later for new content.'}
          </p>
        </div>
      ) : (
        <>
          {/* Articles Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {allArticles.map((article, index) => {
              const buttonConfig = getButtonConfig(article)
              // Debug: Log authorName value and all article fields
              console.log(`Article ${index}:`, {
                id: article.id,
                title: article.title,
                authorName: article.authorName,
                authorId: article.authorId,
                allFields: Object.keys(article)
              })
              // const canAccess = canAccessArticle(article.access)

              return (
                <article key={index} className="rounded-3xl shadow-md overflow-hidden hover:shadow-xl transition-shadow hover:cursor-pointer group p-0 bg-white dark:bg-[#262829]">
                  <Link href={buttonConfig.href}>
                    {/* Article Image */}
                    <div className="relative aspect-video">
                      {article.featuredImage ? (
                        <Image
                          src={getImageUrl(article.featuredImage) || ''}
                          alt={article.title}
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
                        {article.access === 'public' ? 'Free' : 'Premium'}
                      </div>

                      {/* Author Name */}
                      {article.authorName && (
                        <div className="absolute bottom-5 right-5 text-white text-sm bg-[#ED7864] bg-opacity-50 px-2 py-1 rounded-full">
                          {article.authorName}
                        </div>
                      )}
                    </div>

                    {/* Article Body */}
                    <div className="relative p-4 h-[250px] overflow-hidden">
                      <h2 className="text-lg font-semibold mb-2 line-clamp-1 text-[#3A3D48] dark:text-[#C7C8CB]">{article.title}</h2>

                      <div className="text-sm line-clamp-3 overflow-hidden relative z-10  text-[#72757C] dark:text-white">
                        <div dangerouslySetInnerHTML={{ __html: article.content }} />
                      </div>

                      {/* <div className="absolute bottom-0 left-0 w-full h-44 bg-gradient-to-t from-[#1A1330] to-transparent z-20 pointer-events-none" /> */}

                      {/* Hover Action Button */}
                      <div className="absolute bottom-5 left-0 rounded-full px-6 py-2 z-30 transition-opacity">
                        <div className="bg-[var(--color-orange)] text-white text-center py-2 rounded-full px-6 hover:scale-105 transition-transform dark:text-black">
                          {buttonConfig.text}
                        </div>
                      </div>
                    </div>
                  </Link>
                </article>
              )
            })}
          </div>

          {/* Load More Section */}
          {hasMoreArticles && (
            <div className="w-full flex justify-center mt-12">
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
          )}

          {/* No More Articles Message */}
          {!hasMoreArticles && allArticles.length > 0 && (
            <div className="w-full flex justify-center mt-12">
              <p className="text-gray-600 text-lg">
                You've reached the end of our articles. Check back later for new content!
              </p>
            </div>
          )}
        </>
      )}
    </div>
  )
}

