'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Clock, User, Shield, Lock, Calendar, Eye } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import Image from 'next/image'
import { useGetArticleQuery, getImageUrl, Article } from '@/lib/services/articlesApi'


type Props = {
  content: string
}

// Premium access component
const PremiumAccessRequired = ({content}: Props) => {
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

export default function ArticlePage() {
  const { id } = useParams()
  const { user, isAuthenticated, loading: authLoading } = useAuth()
  
  // Use the dedicated hook to fetch a single article by slug
  const { data: article, isLoading: articleLoading, error } = useGetArticleQuery(id as string)

  const parsed = article?.content ? JSON.parse(article.content) : null;

  // Add debugging to see the response structure
  useEffect(() => {
  }, [article, articleLoading, error])

  if (articleLoading || authLoading) {
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

  if (error) {
    console.error('Article Error:', error)
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-3xl font-bold mb-4">Error Loading Article</h1>
          <p className="mb-8">There was an error loading the article. Please try again later.</p>
          <Link 
            href="/articles" 
            className="bg-red-800 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-900 transition-colors"
          >
            Back to Articles
          </Link> 
        </div>
      </div>
    )
  }

  if (!article) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-3xl font-bold mb-4">Article Not Found</h1>
          <p className="mb-8">The article you're looking for doesn't exist or has been moved.</p>
          <Link 
            href="/articles" 
            className="bg-red-800 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-900 transition-colors"
          >
            Back to Articles
          </Link> 
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Article Header */}
        <div key={article.id}>
        <h1 className="text-4xl font-bold mb-10">{article.title}</h1>
          <Image src={getImageUrl(article.featuredImage) || ''} 
          alt={article.title} width={1000} height={1000} className="rounded-lg mb-12 shadow-lg" sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />
          
          <div className="prose max-w-none prose" dangerouslySetInnerHTML={{__html: parsed.content}} />
        </div>

        {/* Related Articles */}
        <div className="mt-12">
          <h3 className="text-2xl font-bold mb-6">More NFL Articles</h3>
          <div className="grid md:grid-cols-2 gap-6">
          
                <Link 
                  key={article.id}
                  href={`/articles/${article.id}`}
                  className="rounded-lg shadow-md border overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="relative h-32">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Image src={getImageUrl(article.featuredImage) || ''} 
                      alt={article.title} width={1000} height={1000} className="object-cover" sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />
                    </div>
                    {article.access === 'pro' && (
                      <div className="absolute top-2 right-2 bg-red-800 text-white px-2 py-1 rounded text-xs font-semibold">
                        Premium
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h4 className="font-bold mb-2 line-clamp-2">{article.title}</h4>
                    <div className="flex items-center justify-between mt-3 text-xs">
                      <span>{article.authorId.name}</span>
                      <span>{article.publishedAt}</span>
                    </div>
                  </div>
                </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
