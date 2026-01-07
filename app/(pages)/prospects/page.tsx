'use client'

import { useEffect, useMemo, useState, Suspense } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Search, Filter, ArrowUp, ArrowDown } from 'lucide-react'
import { buildApiUrl } from '@/lib/config/api'
import { useAuth } from '@/lib/hooks/useAuth'
import { usePathname } from 'next/navigation'
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

interface ProspectRow {
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
    eligibility: string | null
    status: string
    createdAt: string
    updatedAt: string
}

function ProspectsContent() {
    const pathname = usePathname()
    const { isAuthenticated, isLoading: authLoading, user } = useAuth()
    const [data, setData] = useState<ProspectRow[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string>('')
    const [position, setPosition] = useState<string | undefined>(undefined)
    const [searchTerm, setSearchTerm] = useState('')
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
    const [sortBy, setSortBy] = useState<'rank' | 'name'>('rank')
    const [showMobileFilters, setShowMobileFilters] = useState(false)

    const maxProspects = 50 // Show only top 50 prospects

    // Debounce search term
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm)
        }, 500)

        return () => clearTimeout(timer)
    }, [searchTerm])

    // Load prospects initially (only once on mount)
    useEffect(() => {
        const loadProspects = async () => {
            setLoading(true)
            setError('')
            try {
                const params = new URLSearchParams()
                params.set('limit', String(maxProspects)) // Limit to top 50
                const res = await fetch(buildApiUrl(`/api/nfl-prospects?${params.toString()}`), { cache: 'no-store' })
                if (!res.ok) throw new Error('Failed to load prospects')
                const json = await res.json()
                const prospects = json?.data?.prospects
                let rows: ProspectRow[] = Array.isArray(prospects) ? prospects : []

                // Filter only active prospects
                rows = rows.filter(prospect => prospect.status === 'active')

                setData(rows)
            } catch (e: any) {
                setError(e?.message || 'Failed to load prospects')
            } finally {
                setLoading(false)
            }
        }
        loadProspects()
    }, [maxProspects])

    // Filter and sort data client-side
    const filteredData = useMemo(() => {
        let filtered = [...data]

        // Apply search filter
        if (debouncedSearchTerm) {
            const searchLower = debouncedSearchTerm.toLowerCase()
            filtered = filtered.filter(prospect => 
                (prospect.name?.toLowerCase() || '').includes(searchLower) ||
                (prospect.school?.toLowerCase() || '').includes(searchLower) ||
                (prospect.position?.toLowerCase() || '').includes(searchLower)
            )
        }

        // Apply position filter
        if (position) {
            filtered = filtered.filter(prospect => prospect.position === position)
        }

        // Apply client-side sorting
        if (sortBy === 'name') {
            filtered.sort((a, b) => (a.name || '').localeCompare(b.name || ''))
        } else if (sortBy === 'rank') {
            filtered.sort((a, b) => {
                const rankA = a.rank ?? Infinity
                const rankB = b.rank ?? Infinity
                return rankA - rankB
            })
        }

        return filtered
    }, [data, debouncedSearchTerm, position, sortBy])

    const normalized = useMemo(() => {
        return filteredData.map((r, idx) => {
            const playerName = r.name || '—'
            const overallRank = r.rank ?? '—' // Use existing rank, or '—' if null
            const school = r.school || '—'
            const position = r.position || '—'
            const stars = r.stars ?? '—'
            return {
                rank: idx + 1,
                playerName,
                overallRank,
                school,
                position,
                stars,
                // Add prospect-specific normalized fields here
            }
        })
    }, [filteredData])

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

    return (
        <div className="container mx-auto px-3 sm:px-6 lg:px-7 py-7">
            <div className='relative py-'>
                <div
                    className="hidden md:flex absolute left-[-28px] right-[-28px] h-[300%] bg-cover bg-center bg-no-repeat bg-[url('/background-image2.png')] opacity-10 dark:opacity-5"
                    style={{
                        transform: "scaleY(-1)",
                        zIndex: -50,
                        top: '-100px'
                    }}

                ></div>

                {/* Header */}
                <div className="mb-6 flex flex-col items-center justify-center">
                    <h1 className="text-4xl lg:text-5xl mb-4">NFL Prospects</h1>
                    <p className="text-lg lg:text-xl text-muted-foreground mb-4">Explore top NFL prospects and their rankings</p>
                </div>

                {/* Search Bar + Filter Button in One Line (Mobile) */}
                <div className="flex items-center md:hidden gap-3 w-full mb-5">
                    {/* Search Bar */}
                    <div className="flex-1 h-12 border border-[#C7C8CB] rounded-full px-4 bg-white dark:bg-[#262829]">
                        <div className="relative w-full h-full">
                            <Search className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search prospects..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full h-full pl-8 pr-4 bg-transparent placeholder:text-gray-400 focus:outline-none text-base"
                            />
                        </div>
                    </div>

                    {/* Mobile Filter Toggle Button */}
                    <button
                        onClick={() => setShowMobileFilters(!showMobileFilters)}
                        className="flex items-center gap-2 px-4 py-2 h-12 border border-[#E64A30] text-[#E64A30] rounded-full dark:border-none dark:bg-[#262829] transition-colors whitespace-nowrap"
                    >
                        <Filter className="w-5 h-5" />
                        <span className="text-sm font-medium">Filters</span>
                    </button>
                </div>

                {/* Filters Container */}
                <div className={`mb-6 ${showMobileFilters ? 'block' : 'hidden'} md:block`}>
                    <div className="flex flex-col md:flex-row items-center justify-center gap-3">
                        {/* Search Bar (Desktop) */}
                        <div className="hidden md:flex flex-1 w-full max-w-md h-12 border border-[#C7C8CB] rounded-full px-4 bg-white dark:bg-[#262829]">
                            <div className="relative w-full h-full">
                                <Search className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="Search prospects..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full h-full pl-8 pr-4 bg-transparent placeholder:text-gray-400 focus:outline-none text-base"
                                />
                            </div>
                        </div>

                        {/* Filter Row (Position & Sort) */}
                        <div className="flex flex-row items-center justify-center gap-3 w-full md:w-auto">
                            {/* Position Dropdown */}
                            <div className="flex-1 md:flex-none border border-[#C7C8CB] h-12 rounded-full px-3 bg-white dark:bg-[#262829]">
                                <Select
                                    value={position || "all"}
                                    onValueChange={(value) => setPosition(value === "all" ? undefined : value)}
                                >
                                    <SelectTrigger className="h-full w-full md:w-32 !border-none !border-0 flex items-center gap-2">
                                        <SelectValue placeholder="All Positions" />
                                    </SelectTrigger>
                                    <SelectContent className="border-none bg-white dark:bg-[#262829]">
                                        <SelectGroup>
                                            <SelectItem value="all">All Positions</SelectItem>
                                            {['QB', 'RB', 'WR', 'TE', 'EDGE', 'DL', 'LB', 'DB', 'OT', 'IOL', 'S', 'CB', 'K', 'P', 'LS'].map((pos) => (
                                                <SelectItem key={pos} value={pos}>
                                                    {pos}
                                                </SelectItem>
                                            ))}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Sort Dropdown */}
                            <div className="flex-1 md:flex-none border border-[#C7C8CB] h-12 rounded-full px-3 bg-white dark:bg-[#262829]">
                                <Select
                                    value={sortBy}
                                    onValueChange={(value: 'rank' | 'name') => setSortBy(value)}
                                >
                                    <SelectTrigger className="h-full w-full md:w-40 !border-none !border-0 flex items-center gap-2">
                                        <SelectValue placeholder="Sort By" />
                                    </SelectTrigger>
                                    <SelectContent className="border-none bg-white dark:bg-[#262829]">
                                        <SelectGroup>
                                            <SelectItem value="rank">Sort by Rank</SelectItem>
                                            <SelectItem value="name">Sort by Name</SelectItem>
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                </div>


            </div>

            {/* Error State */}
            {error && (
                <div className="text-center py-12">
                    <p className="text-xl text-destructive">{error}</p>
                </div>
            )}

            {/* Loading State */}
            {!error && loading && (
                <div className="space-y-4">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="grid grid-cols-6 md:grid-cols-12 border-b pb-4 border-border animate-pulse">
                            <div className="col-span-1">
                                <div className="w-15 h-15 rounded-full bg-gray-300 dark:bg-gray-700"></div>
                            </div>
                            <div className="col-span-5 md:col-span-11 ml-4">
                                <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-1/3 mb-2"></div>
                                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/4"></div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Empty State */}
            {!error && !loading && normalized.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-xl text-muted-foreground">No prospects found</p>
                </div>
            )}

            {/* Player Cards */}
            {!error && !loading && normalized.length > 0 && (
                <div className="space-y-4">
                    {filteredData.map((prospect, index) => (
                        <div
                            key={`${prospect.id}-${index}`}
                            className="flex flex-row items-start gap-3 md:gap-4 border-b pb-4 border-[var(--color-gray)] hover:bg-accent/5 transition-colors rounded-lg p-2"
                        >
                            {/* Rank Number */}
                            <div className="flex-shrink-0 relative">
                                <div className="flex flex-col items-center justify-center w-12 h-12 md:w-16 md:h-16 rounded-2xl md:rounded-3xl bg-[#E64A30] text-white">
                                    <span className="text-[10px] md:text-xs">Rank</span>
                                    <span className="text-lg md:text-2xl font-bold">{prospect.rank || index + 1}</span>
                                </div>
                                {/* Rank Change Indicator - Positioned outside the rank box */}
                                {prospect.rankChange === 'UP' && (
                                    <div className="absolute -top-1 -right-1.5 bg-[#10B981] rounded-full border p-0.5 md:p-1">
                                        <ArrowUp className="w-3 h-3 md:w-4 md:h-4 text-white" strokeWidth={3} />
                                    </div>
                                )}
                                {prospect.rankChange === 'DOWN' && (
                                    <div className="absolute -top-1 -right-1.5 bg-red-500 rounded-full border p-0.5 md:p-1">
                                        <ArrowDown className="w-3 h-3 md:w-4 md:h-4 text-white" strokeWidth={3} />
                                    </div>
                                )}
                            </div>

                            {/* Player Details */}
                            <div className="flex-1 min-w-0">
                                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                                    <div className="flex-1 min-w-0">
                                        {/* School Logo & Player Name */}
                                        <div className="flex items-center gap-2 md:gap-3 mb-1">
                                            {/* School Logo */}
                                            {prospect.logo && (
                                                <div className="relative w-8 h-8 md:w-12 md:h-12 flex-shrink-0">
                                                    <Image
                                                        src={prospect.logo}
                                                        alt={`${prospect.school} logo`}
                                                        fill
                                                        className="object-contain"
                                                        loader={({ src }) => src}
                                                    />
                                                </div>
                                            )}
                                            <h2 className="text-lg sm:text-2xl md:text-3xl font-bold truncate">{prospect.name}</h2>
                                            {prospect.stars && (
                                                <div className="flex items-center flex-shrink-0">
                                                    <span className="mx-1">•</span>
                                                    <div className="flex items-center gap-0.5 md:gap-1">
                                                        {[...Array(prospect.stars)].map((_, i) => (
                                                            <span key={i} className="text-yellow-500 text-xs md:text-base">★</span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* School, Position, Position Group, Eligibility */}
                                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs md:text-sm text-muted-foreground mb-2 mt-1 md:mt-3">
                                            <span className="font-semibold">{prospect.school} </span>
                                            <span>•</span>
                                            <span className="font-semibold text-foreground">{prospect.position}</span>
                                            {prospect.positionGroup && (
                                                <>
                                                    <span>•</span>
                                                    <span className="font-semibold text-foreground">{prospect.positionGroup}</span>
                                                </>
                                            )}
                                            <span>•</span>
                                            <span className="font-semibold text-foreground">
                                                {prospect.eligibility && prospect.eligibility.trim() !== '' ? prospect.eligibility : ''}
                                            </span>
                                        </div>

                                        {/* Rating */}
                                        {/* {prospect.rating !== null && prospect.rating !== undefined && (
                                            <div className="mt-2 md:mt-3 flex items-center gap-2">
                                                <div className="flex items-center gap-1">
                                                    <div className="w-16 md:w-24 h-1.5 md:h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-[#E64A30]"
                                                            style={{ width: `${(prospect.rating / 10) * 100}%` }}
                                                        ></div>
                                                    </div>
                                                    <span className="text-xs md:text-sm font-medium">{prospect.rating}/10</span>
                                                </div>
                                            </div>
                                        )} */}
                                    </div>
                                </div>

                                {/* Analysis auto-show when present */}
                                {prospect.analysis && (
                                    <div className="mt-4 p-4 bg-gray-50 dark:bg-[#262829] rounded-lg border border-gray-200 dark:border-gray-700">
                                        <h3 className="text-sm font-semibold mb-2 text-[#E64A30]">Analysis</h3>
                                        <div 
                                            className="text-sm dark:text-[#D2D6E2] leading-relaxed prose prose-sm dark:prose-invert max-w-none [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-2 [&_li]:my-1 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:my-2"
                                            dangerouslySetInnerHTML={{ __html: prospect.analysis }}
                                        />
                                    </div>
                                )}

                                {/* Fantasy Outlook auto-show when present */}
                                {prospect.writeUp && (
                                    <div className="mt-4 p-4 bg-gray-50 dark:bg-[#262829] rounded-lg border border-gray-200 dark:border-gray-700">
                                        <h3 className="text-sm font-semibold mb-2 text-[#E64A30]">Fantasy Outlook</h3>
                                        <div 
                                            className="text-sm dark:text-[#D2D6E2] leading-relaxed prose prose-sm dark:prose-invert max-w-none [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-2 [&_li]:my-1 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:my-2"
                                            dangerouslySetInnerHTML={{ __html: prospect.writeUp }}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}



        </div>
    )
}

export default function ProspectsPage() {
    return (
        <Suspense fallback={<div className="container mx-auto max-w-6xl px-4 py-12">Loading…</div>}>
            <ProspectsContent />
        </Suspense>
    )
}