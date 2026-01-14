'use client'

import { useSearchParams, usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { ArrowUp, ArrowDown } from 'lucide-react'
import { buildApiUrl } from '@/lib/config/api'
import { useAuth } from '@/lib/hooks/useAuth'
import { ReadMore } from '@/app/components/ReadMore'

interface ProspectData {
    id: string
    externalId: string
    name: string
    school: string
    position: string
    positionGroup: string
    logo: string | null
    picture: string | null
    rank: number | null
    rankChange: 'UP' | 'DOWN' | 'NOCHANGE' | null
    writeUp: string | null
    analysis: string | null
    rating: number | null
    stars: number | null
    weight: number | null
    eligibility: string | null
    status: string
    createdAt: string
    updatedAt: string
}

export default function ProspectPageClient({ id }: { id: string }) {
    const pathname = usePathname()
    const searchParams = useSearchParams()

    const prospectId = id as string

    // State
    const [prospect, setProspect] = useState<ProspectData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string>('')

    // Get the page number user came from (for back navigation)
    const fromPage = searchParams?.get('page')
    const backToProspectsUrl = fromPage ? `/prospects?page=${fromPage}` : '/prospects'

    // Add authentication check
    const { isAuthenticated, isLoading: authLoading, user } = useAuth()

    // Fetch prospect data
    useEffect(() => {
        const fetchProspect = async () => {
            setLoading(true)
            setError('')
            try {
                const res = await fetch(buildApiUrl(`/api/nfl-prospects/${prospectId}`), { cache: 'no-store' })
                if (!res.ok) throw new Error('Failed to load prospect')
                const json = await res.json()
                setProspect(json?.data || null)
            } catch (e: any) {
                setError(e?.message || 'Failed to load prospect')
            } finally {
                setLoading(false)
            }
        }
        fetchProspect()
    }, [prospectId])

    // Show authentication required message if not authenticated or has insufficient membership
    if (!authLoading && (!isAuthenticated || (user?.memberships && user.memberships.id !== undefined && user.memberships.id < 2))) {
        return (
            <div className="container mx-auto h-screen px-4 py-8 flex flex-col items-center justify-center">
                <div className="max-w-6xl mx-auto text-center">
                    <h1 className="text-3xl font-bold mb-4">Premium Access Required</h1>
                    <p className="text-gray-600 mb-8">
                        {!isAuthenticated
                            ? "Please login to your account to view NFL prospects. Don't have a subscription? Please subscribe to access premium content."
                            : "Please upgrade to a premium subscription to view NFL prospects."
                        }
                    </p>

                    {!isAuthenticated && (
                        <p className="text-gray-600 mb-8">
                            <Link href={{
                                pathname: '/login',
                                query: { redirect: pathname }
                            }} className="text-[#E64A30] hover:text-[#E64A30]/90 font-semibold">Login</Link>
                        </p>
                    )}
                    <Link
                        href="/subscribe"
                        className="bg-[#E64A30] text-white px-6 py-3 rounded-full font-semibold"
                    >
                        Subscribe
                    </Link>
                </div>
            </div>
        )
    }

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

    if (error || !prospect) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-6xl mx-auto h-screen text-center">
                    <h1 className="text-3xl font-bold mb-4">Prospect Not Found</h1>
                    <p className="text-gray-600 mb-8">The prospect you're looking for doesn't exist or has been moved.</p>
                    <Link
                        href={backToProspectsUrl}
                        className="text-[#E64A30]/80 px-6 py-3 rounded-lg font-semibold hover:bg-white transition-colors"
                    >
                        Back to Prospects
                    </Link>
                </div>
            </div>
        )
    }

    // Get prospect image URL - use logo as main image for now
    const prospectImage = prospect.logo || '/default-player.jpg'

    return (
        <div>
            {/* Hero Section */}
            <div className="relative bg-[#F1F1F1] md:dark:bg-black text-white container m-2 rounded-3xl mx-auto overflow-hidden dark:bg-[#1A1A1A]">
                <div className="hidden md:flex flex-row items-center gap-12">
                    {/* Prospect Image */}
                    <div className="relative pl-6 bg-[linear-gradient(90deg,#E64A30_0%,#E64A30_50%,#F1F1F1_40%,#F1F1F1_100%)] dark:bg-[linear-gradient(90deg,#E64A30_0%,#E64A30_50%,#000000_40%,#000000_100%)]">
                        {/* Back triangles */}
                        <div className="absolute inset-0 overflow-hidden pointer-events-none">
                            <div
                                className="absolute left-10 bg-[#F6BCB2] dark:bg-[#7B3F00]"
                                style={{
                                    width: '500px',
                                    height: '80%',
                                    bottom: '0',
                                    clipPath: 'polygon(50% 0%, 47% 100%, 53% 100%)',
                                    transform: 'translateX(-80px)',
                                    opacity: 0.6,
                                }}
                            ></div>

                            <div
                                className="absolute left-0 bg-[#f8d2ca] dark:bg-[#5C1A00]"
                                style={{
                                    width: '500px',
                                    height: '70%',
                                    bottom: '0',
                                    clipPath: 'polygon(50% 0%, 47% 100%, 53% 100%)',
                                    transform: 'translateX(10px)',
                                    opacity: 0.6,
                                }}
                            ></div>
                        </div>

                        <div className="w-auto h-full overflow-hidden relative flex items-center justify-center py-12 px-8">
                            <Image
                                src={prospectImage}
                                alt={prospect.name}
                                width={200}
                                height={200}
                                className="object-contain relative z-10"
                                loader={({ src }) => src}
                                onError={(e) => {
                                    const target = e.target as HTMLImageElement
                                    target.src = '/default-player.jpg'
                                }}
                            />
                        </div>
                    </div>

                    {/* Prospect Info */}
                    <div className="flex flex-col justify-between text-left ml-12 flex-1 pr-8 py-6 bg-[#F1F1F1] dark:bg-black">
                        {/* Header: Name + Rank */}
                        <div className="flex items-center justify-start mb-3 gap-6">
                            <h1 className="text-4xl text-[#1D212D] dark:text-white">{prospect.name}</h1>

                            {prospect.rank && (
                                <div className="flex items-center gap-2">
                                    <div className="flex items-center gap-1 bg-[#E64A30] text-white px-4 py-2 rounded-full text-sm">
                                        <span className="font-semibold">Rank:</span>
                                        <span className="text-lg font-bold">#{prospect.rank}</span>
                                    </div>
                                    {prospect.rankChange === 'UP' && (
                                        <div className="bg-[#10B981] rounded-full p-1.5">
                                            <ArrowUp className="w-4 h-4 text-white" strokeWidth={3} />
                                        </div>
                                    )}
                                    {prospect.rankChange === 'DOWN' && (
                                        <div className="bg-red-500 rounded-full p-1.5">
                                            <ArrowDown className="w-4 h-4 text-white" strokeWidth={3} />
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                        {/* Stats Section */}
                        <div className="border-t border-[#C7C8CB] dark:border-gray-700 pt-4">
                            <div className="grid grid-cols-3 gap-3 w-fit">
                                {[
                                    `Position: ${prospect.position}`,
                                    `Position Group: ${prospect.positionGroup || '-'}`,
                                    `Eligibility: ${prospect.eligibility || '-'}`,
                                    `School: ${prospect.school || ''}`,
                                    `Weight: ${prospect.weight || ''}`

                                ].map((text, i) => (
                                    <div
                                        key={i}
                                        className="bg-[#E3E4E5] dark:bg-gray-800 rounded-full px-4 py-1.5 text-sm text-[#1D212D] dark:text-gray-300 text-center flex items-center justify-center min-w-[180px] h-8"
                                    >
                                        {text}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Mobile View */}
                <div className="flex flex-col md:hidden items-center gap-8 relative w-full">
                    {/* Background & Gradient Section (Mobile only) */}
                    <div className="relative w-full md:hidden bg-[linear-gradient(90deg,#E64A30_0%,#E64A30_50%,#F1F1F1_40%,#F1F1F1_100%)] dark:bg-[linear-gradient(90deg,#E64A30_0%,#E64A30_50%,#000000_40%,#000000_100%)]">
                        {/* Back triangles */}
                        <div className="absolute top-0 left-0 h-full w-full overflow-hidden pointer-events-none">
                            <div
                                className="bg-[#F6BCB2] absolute w-[720px] left-24"
                                style={{
                                    height: '80%',
                                    bottom: '0',
                                    clipPath: 'polygon(50% 0%, 47% 100%, 53% 100%)',
                                    transform: 'translateX(-120px)',
                                    opacity: 0.6,
                                }}
                            ></div>
                            <div
                                className="bg-[#f8d2ca] absolute w-[720px] -left-8"
                                style={{
                                    height: '70%',
                                    bottom: '0',
                                    clipPath: 'polygon(50% 0%, 47% 100%, 53% 100%)',
                                    transform: 'translateX(-60px)',
                                    opacity: 0.6,
                                }}
                            ></div>
                        </div>

                        {/* Prospect Image */}
                        <div className="relative w-full flex justify-center py-12 px-4">
                            <Image
                                src={prospectImage}
                                alt={prospect.name}
                                width={200}
                                height={200}
                                className="object-contain relative z-10"
                                loader={({ src }) => src}
                                onError={(e) => {
                                    const target = e.target as HTMLImageElement
                                    target.src = '/default-player.jpg'
                                }}
                            />
                        </div>
                    </div>

                    {/* Prospect Info Section */}
                    <div className="flex flex-col justify-between text-left md:ml-12 flex-1 pr-4 md:pr-8 py-6">
                        {/* Header: Name + Rank */}
                        <div className="flex items-center justify-start mb-3 gap-4">
                            <h1 className="text-3xl md:text-4xl text-[#1D212D] dark:text-white">{prospect.name}</h1>
                            {prospect.rank && (
                                <div className="flex items-center gap-2">
                                    <div className="flex items-center gap-1 bg-[#E64A30] text-white px-3 py-1 rounded-full text-sm">
                                        <span className="font-semibold">Rank:</span>
                                        <span className="text-lg font-bold">#{prospect.rank}</span>
                                    </div>
                                    {prospect.rankChange === 'UP' && (
                                        <div className="bg-[#10B981] rounded-full p-1">
                                            <ArrowUp className="w-3 h-3 text-white" strokeWidth={3} />
                                        </div>
                                    )}
                                    {prospect.rankChange === 'DOWN' && (
                                        <div className="bg-red-500 rounded-full p-1">
                                            <ArrowDown className="w-3 h-3 text-white" strokeWidth={3} />
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                        {/* Stats Section */}
                        <div className="border-t border-[#C7C8CB] pt-4 dark:border-none">
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 w-fit">
                                {[
                                    `Position: ${prospect.position}`,
                                    `Position Group: ${prospect.positionGroup || '-'}`,
                                    `Eligibility: ${prospect.eligibility || '-'}`,
                                    `School: ${prospect.school || ''}`,
                                    `Weight: ${prospect.weight || ''}`

                                ].map((text, i) => (
                                    <div
                                        key={i}
                                        className="bg-[#E3E4E5] dark:bg-gray-800 rounded-full px-4 py-1.5 text-sm text-[#1D212D] dark:text-gray-300 text-center flex items-center justify-center min-w-[180px] h-8"
                                    >
                                        {text}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-4 pb-16">
                <div className="grid lg:grid-cols-1 gap-8">
                    {/* Prospect Details */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Analysis Section */}
                        {prospect.analysis && (
                            <div className="rounded-3xl border border-[#C7C8CB] dark:border-gray-700 overflow-hidden">
                                <div className="bg-[#E64A30] px-6 py-2">
                                    <h2 className="text-2xl text-white flex items-center gap-2">
                                        Analysis
                                    </h2>
                                </div>
                                <div className="p-6">
                                    <div className="prose max-w-none prose-sm sm:prose-base md:prose-lg dark:prose-invert [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-2 [&_li]:my-1 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:my-2">
                                        <ReadMore 
                                            id={`analysis-${prospect.id}`}
                                            text={prospect.analysis}
                                            amountOfWords={200}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Fantasy Outlook Section */}
                        {prospect.writeUp && (
                            <div className="rounded-3xl border border-[#C7C8CB] dark:border-gray-700 overflow-hidden">
                                <div className="bg-[#E64A30] px-6 py-2">
                                    <h2 className="text-2xl text-white flex items-center gap-2">
                                        Fantasy Outlook
                                    </h2>
                                </div>
                                <div className="p-6">
                                    <div className="prose max-w-none prose-sm sm:prose-base md:prose-lg dark:prose-invert [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-2 [&_li]:my-1 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:my-2">
                                        <ReadMore 
                                            id={`writeup-${prospect.id}`}
                                            text={prospect.writeUp}
                                            amountOfWords={200}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
