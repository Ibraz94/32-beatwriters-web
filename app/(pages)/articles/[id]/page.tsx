'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Clock, User, Shield, Lock, Calendar, Eye } from 'lucide-react'
import { articles, getArticleById, Article } from '../data/articles'
import { useAuth } from '../hooks/useAuth'
import Image from 'next/image'

// Premium access component
const PremiumAccessRequired = ({ article }: { article: Article }) => {
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
  const params = useParams()
  const { user, isAuthenticated, loading: authLoading } = useAuth()
  const [article, setArticle] = useState<Article | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      const foundArticle = getArticleById(params.id as string)
      setArticle(foundArticle || null)
      setLoading(false)
    }
  }, [params.id])

  if (loading || authLoading) {
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

  const canAccessPremium = !article.isPremium || (isAuthenticated && user?.isPremium)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <Link 
          href="/articles" 
          className="inline-flex items-center hover:text-red-800 font-semibold mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Articles
        </Link>

        {/* User Status Indicator (for testing) */}
        {/* {isAuthenticated && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
            <p className="text-sm text-blue-800">
              Signed in as: <strong>{user?.email}</strong> 
              {user?.isPremium ? (
                <span className="ml-2 bg-red-800 text-white px-2 py-1 rounded text-xs font-semibold">Premium</span>
              ) : (
                <span className="ml-2 bg-gray-400 text-white px-2 py-1 rounded text-xs">Free</span>
              )}
            </p>
          </div>
        )} */}

        {/* Article Header */}
        <article className="border rounded-xl shadow-lg overflow-hidden">
          {/* Hero Image */}
          <div className="relative h-64 md:h-96">
            <div className="absolute inset-0 flex items-center justify-center">
              <Image src={article.image} alt={article.title} fill className="object-cover" />
            </div>
            
            {/* Premium Badge */}
            {article.isPremium && (
              <div className="absolute top-4 right-4 bg-red-800 text-white px-3 py-2 rounded-full text-sm font-semibold flex items-center">
                <Shield className="w-4 h-4 mr-1" />
                Premium
              </div>
            )}
            
            {/* Category Badge */}
            <div className="absolute top-4 left-4 bg-black bg-opacity-75 text-white px-3 py-2 rounded text-sm font-semibold">
              {article.category}
            </div>
          </div>

          <div className="p-8">
            {/* Article Title */}
            <h1 className="text-3xl md:text-4xl font-bold mb-6 leading-tight">
              {article.title}
            </h1>

            {/* Article Meta */}
            <div className="flex flex-wrap items-center gap-6 mb-8">
              <div className="flex items-center">
                <User className="w-5 h-5 mr-2" />
                <span className="font-semibold">{article.author}</span>
              </div>
              
              <div className="flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                <span>{new Date(article.publishDate).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</span>
              </div>
              
              <div className="flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                <span>{article.readTime}</span>
              </div>
              
              <div className="flex items-center">
                <Eye className="w-5 h-5 mr-2" />
                <span>{Math.floor(Math.random() * 5000) + 1000} views</span>
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-8">
              {article.tags.map((tag: string) => (
                <span 
                  key={tag} 
                  className="border px-3 py-1 rounded-full text-sm font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Article Content or Premium Gate */}
            {canAccessPremium ? (
              <div 
                className="prose prose-lg max-w-none"
                dangerouslySetInnerHTML={{ __html: article.content }}
              />
            ) : (
              <>
                {/* Article Excerpt for Premium Content */}
                <div className="prose prose-lg max-w-none mb-8">
                  <p className="text-xl leading-relaxed">
                    {article.excerpt}
                  </p>
                </div>
                
                <PremiumAccessRequired article={article} />
              </>
            )}
          </div>
        </article>

        {/* Related Articles */}
        <div className="mt-12">
          <h3 className="text-2xl font-bold mb-6">More NFL Articles</h3>
          <div className="grid md:grid-cols-2 gap-6">
            {articles
              .filter(a => a.id !== article.id)
              .slice(0, 4)
              .map((relatedArticle) => (
                <Link 
                  key={relatedArticle.id}
                  href={`/articles/${relatedArticle.id}`}
                  className="rounded-lg shadow-md border overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="relative h-32">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-sm">Article Image</span>
                    </div>
                    {relatedArticle.isPremium && (
                      <div className="absolute top-2 right-2 bg-red-800 text-white px-2 py-1 rounded text-xs font-semibold">
                        Premium
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h4 className="font-bold mb-2 line-clamp-2">{relatedArticle.title}</h4>
                    <p className="text-sm line-clamp-2">{relatedArticle.excerpt}</p>
                    <div className="flex items-center justify-between mt-3 text-xs">
                      <span>{relatedArticle.author}</span>
                      <span>{relatedArticle.readTime}</span>
                    </div>
                  </div>
                </Link>
              ))}
          </div>
        </div>
      </div>
    </div>
  )
}
