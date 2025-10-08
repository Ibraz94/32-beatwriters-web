'use client'

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Lock, Clock } from "lucide-react";
import { useGetArticlesQuery, Article, getImageUrl } from "@/lib/services/articlesApi";

export default function NewArticles() {
    const [activeTab, setActiveTab] = useState<'latest' | 'scheduled'>('latest');

    const { data: articles, isLoading, error } = useGetArticlesQuery({
        page: 1,
        limit: 10,
        sortBy: 'publishedAt',
        sortOrder: 'desc',
    });

    if (isLoading) return <p className="text-center text-gray-400 py-10">Loading...</p>;
    if (error) return <p className="text-center text-red-500 py-10">Failed to load articles.</p>;

    const allArticles = articles?.data.articles || [];
    const featuredArticle = allArticles[0];
    const latestArticles = allArticles.slice(1, 4);
    const scheduledArticles = allArticles.filter(a => a.status === "draft");

    return (
        <section className="container mx-auto px-4 md:px-6 py-10">
            {/* Section Heading */}
            <h2 className="hidden md:flex justify-center text-center text-xl md:text-5xl tracking-tight text-gray-800 mb-8 dark:text-white111">
                Our Articles
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                {/* LEFT - Featured Article */}
                <div className="hidden md:grid relative w-full h-72 md:h-[450px] overflow-hidden group col-span-7 rounded-3xl">
                    {featuredArticle?.featuredImage ? (
                        <Image
                            src={getImageUrl(featuredArticle.featuredImage) || ""}
                            alt={featuredArticle.title}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                    ) : (
                        <div className="w-full h-full bg-gray-200" />
                    )}

                    {/* Dark Overlay */}
                    <div className="absolute inset-0 bg-black/40" />

                    {/* Lock + Text */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center px-6">
                        <Lock className="h-10 w-10 mb-3 opacity-90" />
                        <h3 className="text-2xl md:text-3xl font-semibold">Schedule Articles</h3>
                    </div>
                </div>

                {/* RIGHT - Tabs + Article List */}
                <div className="col-span-5 flex flex-col justify-between h-96 md:h-[450px]">
                    {/* Tabs */}
                    <div className="flex mb-4">
                        {['latest', 'scheduled'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab as 'latest' | 'scheduled')}
                                className={`w-1/2 text-center pb-2 font-medium text-base md:text-lg transition-all dark:text-white${activeTab === tab
                                    ? 'text-black border-b-3 border-[var(--color-orange)]'
                                    : 'text-gray-500 hover:text-gray-700 border-b-3 border-[#1A1A1A]'
                                    }`}
                            >
                                {tab === 'latest' ? 'Latest Articles' : 'Schedule Articles'}
                            </button>
                        ))}
                    </div>

                    {/* Articles List */}
                    <div className="space-y-2 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-200">
                        {(activeTab === 'latest' ? latestArticles : scheduledArticles).length > 0 ? (
                            (activeTab === 'latest' ? latestArticles : scheduledArticles).map(
                                (article: Article) => (
                                    <Link
                                        href={`/articles/${article.id}`}
                                        key={article.id}
                                        className="flex items-center gap-4 hover:bg-gray-50 px-3 rounded-xl transition-all h-24 md:h-28 border border-gray-100 dark:border-none"
                                    >
                                        {/* Thumbnail */}
                                        <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-xl overflow-hidden flex-shrink-0">
                                            {article.featuredImage ? (
                                                <Image
                                                    src={getImageUrl(article.featuredImage) || ""}
                                                    alt={article.title}
                                                    fill
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-gray-200" />
                                            )}
                                        </div>

                                        {/* Content */}
                                        <div className="flex flex-col justify-center h-full overflow-hidden">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-xs font-medium bg-[#F6BCB2] dark:bg-[var(--color-orange)] text-black dark:text-white px-2 py-0.5 rounded-full">
                                                    NFL
                                                </span>
                                                <span className="flex items-center gap-1 text-gray-400 text-xs dark:text-[#C7C8CB]">
                                                    <Clock className="h-3 w-3" /> 29 Minutes
                                                </span>
                                            </div>
                                            <p
                                                className="text-gray-800 text-sm md:text-base leading-snug line-clamp-2 dark:text-[#C7C8CB]"
                                            >{article.title}</p>
                                        </div>
                                    </Link>
                                )
                            )
                        ) : (
                            <p className="text-gray-400 text-center py-6">
                                No articles available.
                            </p>
                        )}
                    </div>
                </div>
            </div>

        </section>
    );
}
