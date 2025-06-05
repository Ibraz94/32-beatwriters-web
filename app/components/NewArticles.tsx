import Link from "next/link";
import { articles } from "@/app/(pages)/articles/data/articles";
import Image from "next/image";



export default function NewArticles() {
    return (
        <section className="container mx-auto">
            <div className="mt-12">
                <h3 className="text-2xl font-bold mb-6">New Articles</h3>
                <div className="grid md:grid-cols-2 gap-6">
                    {articles
                        .filter(a => a.id !== articles[0].id)
                        .slice(0, 4)
                        .map((relatedArticle) => (
                            <Link
                                key={relatedArticle.id}
                                href={`/articles/${relatedArticle.id}`}
                                className="rounded-lg shadow-md border overflow-hidden hover:shadow-lg transition-shadow"
                            >
                                <div className="p-4 flex">
                                    <div className="relative h-32 w-42 rounded-lg overflow-hidden">
                                        <Image src="/article-image.png" alt={relatedArticle.title} width={100} height={100} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="p-4 flex flex-col justify-between">
                                        <h4 className="font-bold mb-2 line-clamp-2">{relatedArticle.title}</h4>
                                        <p className="text-sm line-clamp-2">{relatedArticle.excerpt}</p>
                                        <p className="text-sm text-muted-foreground">{relatedArticle.publishDate}</p>
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