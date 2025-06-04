'use client'

import Link from 'next/link'
import { Clock, Shield, User } from 'lucide-react'
import { nflArticles } from './data/nfl-articles'

export default function ArticlesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          NFL <span className="text-red-800">Articles</span>
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          In-depth analysis, breaking news, and expert insights from the world of professional football
        </p>
      </div>

      {/* Premium Notice */}
      <div className="bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-lg p-4 mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Shield className="w-5 h-5 text-red-800 mr-2" />
            <span className="text-red-800 font-semibold">Premium Content Available</span>
          </div>
          <Link 
            href="/premium" 
            className="bg-red-800 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-900 transition-colors"
          >
            Upgrade Now
          </Link>
        </div>
        <p className="text-red-700 text-sm mt-2">
          Get exclusive access to premium articles, insider reports, and advanced analysis
        </p>
      </div>

      {/* Articles Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {nflArticles.map((article) => (
          <article key={article.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
            {/* Article Image */}
            <div className="relative h-48 bg-gray-200">
              <div className="absolute inset-0 bg-gray-300 flex items-center justify-center">
                <span className="text-gray-500">NFL Article Image</span>
              </div>
              
              {/* Premium Badge */}
              {article.isPremium && (
                <div className="absolute top-3 right-3 bg-red-800 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center">
                  <Shield className="w-3 h-3 mr-1" />
                  Premium
                </div>
              )}
              
              {/* Category Badge */}
              <div className="absolute top-3 left-3 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs font-semibold">
                {article.category}
              </div>
            </div>

            {/* Article Content */}
            <div className="p-6">
              <h2 className="text-xl font-bold mb-3 line-clamp-2 hover:text-red-800 transition-colors">
                <Link href={`/articles/${article.id}`}>
                  {article.title}
                </Link>
              </h2>
              
              <p className="text-gray-600 mb-4 line-clamp-3">
                {article.excerpt}
              </p>

              {/* Article Meta */}
              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <div className="flex items-center">
                  <User className="w-4 h-4 mr-1" />
                  {article.author}
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {article.readTime}
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {article.tags.slice(0, 3).map((tag) => (
                  <span key={tag} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                    {tag}
                  </span>
                ))}
              </div>

              {/* Read More Button */}
              <Link 
                href={`/articles/${article.id}`}
                className={`w-full py-2 px-4 rounded-lg font-semibold text-center block transition-colors ${
                  article.isPremium
                    ? 'bg-red-800 text-white hover:bg-red-900'
                    : 'bg-gray-900 text-white hover:bg-gray-800'
                }`}
              >
                {article.isPremium ? 'Read Premium Article' : 'Read Article'}
              </Link>
            </div>
          </article>
        ))}
      </div>

      {/* Load More Section */}
      <div className="text-center mt-12">
        <button className="bg-red-800 text-white px-8 py-3 rounded-lg font-semibold hover:bg-red-900 transition-colors">
          Load More Articles
        </button>
      </div>
    </div>
  )
}

