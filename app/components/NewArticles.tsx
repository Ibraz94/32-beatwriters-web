'use client'

import Link from "next/link";
import Image from "next/image";
import { useGetArticlesQuery, Article, getImageUrl } from "@/lib/services/articlesApi";




export default function NewArticles() {
    const { data: articles, isLoading, error } = useGetArticlesQuery({ page: 1, limit: 10 });

    if (isLoading) return <div className="text-center text-2xl font-bold max-w-4xl mx-auto mt-12">Loading...</div>;
    if (error) return <div>Error: {(error as any).data as string}</div>;

    return (
        <section className="container mx-auto px-4">
            <div className="mt-8 md:mt-12">
                <h3 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-center md:text-left">Latest <span className="text-red-800">Articles</span> </h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                    {articles?.articles
                        .filter((article: Article) => article.access === 'public')
                        .slice(0, 5)
                        .map((relatedArticle: Article) => (
                            <Link
                                key={relatedArticle.id}
                                href={`/articles/${relatedArticle.id}`}
                                className="rounded-lg shadow-md border overflow-hidden hover:shadow-lg transition-shadow flex flex-col sm:flex-row"
                            >
                                <div className="flex-shrink-0">
                                    {relatedArticle.featuredImage ? (
                                        <div className="relative p-2 h-48 sm:h-32 md:h-40 lg:h-48 w-full sm:w-48 md:w-56 lg:w-72 overflow-hidden">
                                            <Image 
                                                src={getImageUrl(relatedArticle.featuredImage) || ''} 
                                                alt={relatedArticle.title} 
                                                width={300} 
                                                height={200} 
                                                className="object-cover w-full h-full rounded-lg lg:rounded-lg" 
                                            />
                                        </div>
                                    ) : (
                                        <div className="relative h-48 sm:h-32 md:h-40 lg:h-48 w-full sm:w-48 md:w-56 bg-gray-100 flex items-center justify-center">
                                            <span className="text-gray-500 text-sm">No Image</span>
                                        </div>
                                    )}
                                </div>
                                <div className="p-3 md:p-4 flex flex-col justify-between flex-grow">
                                    <h4 className="text-base md:text-lg lg:text-xl font-bold mb-2 line-clamp-2">{relatedArticle.title}</h4>
                                    <div className="flex flex-col">
                                        <p className="text-xs md:text-sm text-gray-600 mb-2">{new Date(relatedArticle.publishedAt || '').toLocaleDateString()}</p>
                                    </div>
                                </div>
                            </Link>
                        ))}
                </div>
                <div className="flex justify-center mt-6 md:mt-10">
                    <Link href="/articles" className="text-lg hover:text-red-800 transition-colors">
                        <button className="bg-red-800 text-white px-6 md:px-8 py-2 md:py-3 rounded-lg font-semibold hover:scale-102 hover:cursor-pointer transition-all text-sm md:text-base">
                            View All Articles
                        </button>
                    </Link>
                </div>
            </div>
        </section>
    )
}