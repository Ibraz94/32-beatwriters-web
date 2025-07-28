import { Metadata } from 'next'
import { getImageUrl } from '@/lib/services/articlesApi'
import ArticlePageClient from './ArticlePageClient'
import { buildApiUrl, API_CONFIG } from '@/lib/config/api'

// Generate metadata for the article page
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  try {
    const { id } = await params
    // Fetch article data
    const response = await fetch(`${buildApiUrl(API_CONFIG.ENDPOINTS.ARTICLES)}/${id}`)
    const articleData = await response.json()

    console.log(articleData)

    if (!articleData) {
      return {
        title: 'Article Not Found',
        description: 'The requested article could not be found.'
      }
    }

    const article = articleData

    return {
      title: article.title,
      description: 'Read this article on 32BeatWriters',
      openGraph: {
        title: article.title,
        description: 'Read this article on 32BeatWriters',
        images: [
          {
            url: getImageUrl(article.featuredImage) || '/logo-small.webp',
            width: 1200,
            height: 630,
            alt: article.title,
          },
        ],
        type: 'article',
        url: `${buildApiUrl(API_CONFIG.ENDPOINTS.ARTICLES)}/${id}`,
      },
      twitter: {
        card: 'summary_large_image',
        title: article.title,
        description: article.content?.substring(0, 160) || 'Read this article on 32BeatWriters',
        images: [getImageUrl(article.featuredImage) || '/logo-small.webp'],
      },
    }
  } catch (error) {
    console.error('Error generating metadata:', error)
    return {
      title: 'Article',
      description: 'Read this article on 32BeatWriters'
    }
  }
}

export default async function ArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <ArticlePageClient id={id} />
}
