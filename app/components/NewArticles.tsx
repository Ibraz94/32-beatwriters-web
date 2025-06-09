'use client'

import Link from "next/link";
import Image from "next/image";
import { useGetArticlesQuery, Article, getImageUrl } from "@/lib/services/articlesApi";




export default function NewArticles() {
    const { data: articles, isLoading, error } = useGetArticlesQuery({ page: 1, limit: 5 });

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error: {(error as any).data as string}</div>;

    return (
        <section className="container mx-auto">
            <div className="mt-12">
                <h3 className="text-2xl font-bold mb-6">New Articles</h3>
                <div className="grid md:grid-cols-2 gap-6 p-2">
                    {articles?.articles
                        .filter((a: Article) => a.id !== articles.articles[0].id)
                        .slice(0, 4)
                        .map((relatedArticle: Article) => (
                            <Link
                                key={relatedArticle.id}
                                href={`/articles/${relatedArticle.id}`}
                                className="rounded-lg shadow-md border overflow-hidden hover:shadow-lg transition-shadow"
                            >
                                <div className="flex">
                                    {relatedArticle.featuredImage ? (
                                        <div className="relative h-32 w-42 rounded-lg overflow-hidden">
                                            <Image src={getImageUrl(relatedArticle.featuredImage) || ''} alt={relatedArticle.title} width={100} height={100} className="w-full h-full object-cover" />
                                        </div>
                                    ) : (
                                        <div className="relative h-32 w-42 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                                            <span className="text-gray-500 text-sm">No Image</span>
                                        </div>
                                    )}
                                    <div className="p-4 flex flex-col justify-between">
                                        <h4 className=" text-lg font-bold mb-2 line-clamp-1">{relatedArticle.title}</h4>
                                        <p className="text-sm text-muted-foreground">{relatedArticle.publishedAt}</p>
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