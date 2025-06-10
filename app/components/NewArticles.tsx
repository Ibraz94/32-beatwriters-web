'use client'

import Link from "next/link";
import Image from "next/image";
import { useGetArticlesQuery, Article, getImageUrl } from "@/lib/services/articlesApi";




export default function NewArticles() {
    const { data: articles, isLoading, error } = useGetArticlesQuery({ page: 1, limit: 10 });

    if (isLoading) return <div className="text-center text-2xl font-bold max-w-4xl mx-auto mt-12">Loading...</div>;
    if (error) return <div>Error: {(error as any).data as string}</div>;

    return (
        <section className="container mx-auto">
            <div className="mt-12">
                <h3 className="text-2xl font-bold mb-6">Latest <span className="text-red-800">Articles</span> </h3>
                <div className="grid md:grid-cols-2 gap-6 p-2">
                    {articles?.articles
                        .filter((article: Article) => article.access === 'public')
                        .slice(0, 5)
                        .map((relatedArticle: Article) => (
                            <Link
                                key={relatedArticle.id}
                                href={`/articles/${relatedArticle.id}`}
                                className="rounded-lg shadow-md border overflow-hidden hover:shadow-lg transition-shadow flex"
                            >
                                <div className="flex">
                                    {relatedArticle.featuredImage ? (
                                        <div className="relative h-48 w-72 p-2 overflow-hidden">
                                            <Image src={getImageUrl(relatedArticle.featuredImage) || ''} alt={relatedArticle.title} width={300} height={100} className="object-cover rounded-lg h-full" />
                                        </div>
                                    ) : (
                                        <div className="relative h-48 w-56 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                                            <span className="text-gray-500 text-sm">No Image</span>
                                        </div>
                                    )}
                                </div>
                                <div className="p-4 flex flex-col justify-between">
                                    <h4 className="text-xl font-bold mb-2">{relatedArticle.title}</h4>
                                    <div className="flex flex-col">
                                        <p className="text-sm text-gray-600 mb-2">{new Date(relatedArticle.publishedAt || '').toLocaleDateString()}</p>
                                    </div>
                                </div>
                            </Link>
                        ))}
                </div>
                <Link href="/articles" className="text-lg hover:text-red-800 transition-colors flex justify-center mt-10">
                    <button className="bg-red-800 text-white px-8 py-3 rounded-lg font-semibold hover:scale-102 hover:cursor-pointer transition-all">View All Articles</button>
                </Link>
            </div>
        </section>
    )
}