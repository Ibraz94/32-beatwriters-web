'use client'

import Link from 'next/link'
import { Clock, Shield, User } from 'lucide-react'
import { articles } from './data/articles'
import Image from 'next/image'

export default function ArticlesPage() {
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

      {/* Premium Notice */}
      {/* <div className="bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-lg p-4 mb-8">
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
      </div> */}

      {/* Articles Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {articles.map((article) => (
          <article key={article.id} className="rounded-xl border shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
            {/* Article Image */}
            <div className="relative h-48">
              <div className="absolute inset-0 flex items-center justify-center">
                <Image src={article.image} alt={article.title} fill className="object-cover" />
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
              <h2 className="text-lg font-bold mb-3 line-clamp-2 hover:text-red-800 transition-colors text-nowrap">
                <Link href={`/articles/${article.id}`}>
                  {article.title}
                </Link>
              </h2>
              
              <p className="mb-4 line-clamp-3">
                {article.excerpt}
              </p>

              {/* Article Meta */}
              <div className="flex items-center justify-between text-sm mb-4">
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
                  <span key={tag} className="border px-2 py-1 rounded text-xs">
                    {tag}
                  </span>
                ))}
              </div>

              {/* Read More Button */}
              <Link 
                href={`/articles/${article.id}`}
                className={`w-full py-2 px-4 rounded-lg font-semibold text-center block transition-colors hover:scale-102 hover:cursor-pointer ${
                  article.isPremium
                    ? 'bg-red-800 text-white'
                    : 'border-2'
                }`}
              >
                {article.isPremium ? 'Read Article' : 'Read Article'}
              </Link>
            </div>
          </article>
        ))}
      </div>

      {/* Load More Section */}
      <div className="text-center mt-12">
        <button className="bg-red-800 text-white px-8 py-3 rounded-lg font-semibold hover:scale-102 hover:cursor-pointer transition-colors">
          Load More Articles
        </button>
      </div>
    </div>
  )
}

