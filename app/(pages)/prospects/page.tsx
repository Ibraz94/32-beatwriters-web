'use client'

import { useEffect, useMemo, useState, Suspense } from 'react'
import Image from 'next/image'
import { Search, ChevronDown } from 'lucide-react'
import { buildApiUrl } from '@/lib/config/api'
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
    picture: string | null
    rank: number | null
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
    const [data, setData] = useState<ProspectRow[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string>('')
    const [position, setPosition] = useState<string | undefined>(undefined)
    const [searchTerm, setSearchTerm] = useState('')
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [totalProspects, setTotalProspects] = useState(0)
    const [expandedAnalysis, setExpandedAnalysis] = useState<Set<string>>(new Set())
    const [expandedWriteUp, setExpandedWriteUp] = useState<Set<string>>(new Set())
    const pageSize = 50 // As per API response pagination.pageSize

    // Toggle functions for accordion
    const toggleAnalysis = (prospectId: string) => {
        setExpandedAnalysis(prev => {
            const newSet = new Set(prev)
            if (newSet.has(prospectId)) {
                newSet.delete(prospectId)
            } else {
                newSet.add(prospectId)
            }
            return newSet
        })
    }

    const toggleWriteUp = (prospectId: string) => {
        setExpandedWriteUp(prev => {
            const newSet = new Set(prev)
            if (newSet.has(prospectId)) {
                newSet.delete(prospectId)
            } else {
                newSet.add(prospectId)
            }
            return newSet
        })
    }

    // Debounce search term
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm)
        }, 500)

        return () => clearTimeout(timer)
    }, [searchTerm])

    // Load prospects when position, search, or page changes
    useEffect(() => {
        const loadProspects = async () => {
            setLoading(true)
            setError('')
            try {
                const params = new URLSearchParams()
                if (position) params.set('position', position)
                if (debouncedSearchTerm) params.set('search', debouncedSearchTerm)
                params.set('page', String(currentPage))
                params.set('pageSize', String(pageSize))
                const res = await fetch(buildApiUrl(`/api/nfl-prospects?${params.toString()}`), { cache: 'no-store' })
                if (!res.ok) throw new Error('Failed to load prospects')
                const json = await res.json()
                const prospects = json?.data?.prospects
                const pagination = json?.data?.pagination
                const rows: ProspectRow[] = Array.isArray(prospects) ? prospects : []
                setData(rows)
                if (pagination) {
                    setTotalPages(pagination.totalPages)
                    setTotalProspects(pagination.total)
                }
            } catch (e: any) {
                setError(e?.message || 'Failed to load prospects')
            } finally {
                setLoading(false)
            }
        }
        loadProspects()
    }, [position, debouncedSearchTerm, currentPage]) // Depend on position, search, and currentPage for re-fetching

    const normalized = useMemo(() => {
        return data.map((r, idx) => {
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
    }, [data])

    return (
        <div className="container mx-auto px-3 sm:px-6 lg:px-7 py-7">
            <div className='relative py-5'>
                <div
                    className="
      hidden md:flex absolute
left-[-28px] right-[-28px]
       h-[300%]
      bg-cover bg-center bg-no-repeat
      bg-[url('/background-image2.png')]
      opacity-10 dark:opacity-5
  "
                    style={{
                        transform: "scaleY(-1)",
                        zIndex: -50,
                        top: '-100px'
                    }}

                ></div>

                {/* Header */}
                <div className="mb-6 flex flex-col items-center justify-center">
                    <h1 className="text-3xl font-bold mb-4">NFL Draft Prospects</h1>
                    <p className="text-muted-foreground mb-6">Explore top NFL draft prospects and their rankings</p>
                </div>

                {/* Search Bar and Position Filter */}
                <div className="mb-6 flex flex-col sm:flex-row tems-center justify-center gap-3">
                    {/* Search Bar */}
                    <div className="flex-1 w-full sm:max-w-md h-12 border border-[#C7C8CB] rounded-full px-4 bg-white dark:bg-[#262829]">
                        <div className="relative w-full">
                            <Search className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search prospects..."
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value)
                                    setCurrentPage(1)
                                }}
                                className="w-full pl-8 pr-4 py-3 bg-transparent placeholder:text-gray-400 focus:outline-none text-base"
                            />
                        </div>
                    </div>

                    {/* Position Dropdown */}
                    <div className="border border-[#C7C8CB] h-12 rounded-full px-3 bg-white dark:bg-[#262829]">
                        <Select
                            value={position || "all"}
                            onValueChange={(value) => {
                                setPosition(value === "all" ? undefined : value)
                                setCurrentPage(1)
                            }}
                        >
                            <SelectTrigger className="h-10 w-32 !border-none !border-0 flex items-center gap-2">
                                <SelectValue placeholder="All Positions" />
                            </SelectTrigger>
                            <SelectContent className="border-none">
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
                </div>

                {/* Pagination Controls */}
                <div className='flex flex-col sm:flex-row items-center justify-between gap-4 mb-6'>
                    <p className="text-sm text-muted-foreground">
                        Total Prospects: <span className="font-semibold">{totalProspects}</span>
                    </p>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                            disabled={currentPage === 1 || loading}
                            className="px-4 py-2 bg-[#E64A30] text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors hover:bg-[#d14429]"
                        >
                            Previous
                        </button>
                        <span className="text-sm font-medium">
                            Page {currentPage} of {totalPages}
                        </span>
                        <button
                            onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages || loading}
                            className="px-4 py-2 bg-[#E64A30] text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors hover:bg-[#d14429]"
                        >
                            Next
                        </button>
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
                    {data.map((prospect, index) => (
                        <div
                            key={`${prospect.id}-${index}`}
                            className="grid grid-cols-6 md:grid-cols-12 border-b pb-4 border-[var(--color-gray)] hover:bg-accent/5 transition-colors rounded-lg p-2"
                        >
                            {/* Rank Number (where profile picture was) */}
                            <div className="col-span-1 flex items-start justify-center">
                                <div className="flex flex-col items-center justify-center w-16 h-16 rounded-3xl bg-[#E64A30] text-white">
                                    <span className="text-xs">Rank</span>
                                    <span className="text-2xl font-bold">{prospect.rank !== null ? prospect.rank + 1 : index + 1}</span>
                                </div>
                            </div>

                            {/* Player Details */}
                            <div className="col-span-5 md:col-span-11 ml-4">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        {/* Player Name & School Logo */}
                                        <div className="flex items-center gap-3 mb-1">
                                            <h2 className="text-3xl font-bold">{prospect.name}</h2>
                                            {prospect.stars && (
                                                <>
                                                    <span>•</span>
                                                    <div className="flex items-center gap-1">
                                                        {[...Array(prospect.stars)].map((_, i) => (
                                                            <span key={i} className="text-yellow-500">★</span>
                                                        ))}
                                                    </div>
                                                </>
                                            )}
                                        </div>

                                        {/* Position, Stars, Eligibility */}
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2 mt-3">

                                            {/* School Logo/Badge (where rank badge was) */}
                                            <h1>School :</h1>
                                            <span className="text-sm font-semibold">{prospect.school} </span>
                                            <h1>Position :</h1>
                                            <span className="font-semibold text-foreground">{prospect.position}</span>

                                            <span>Eligibilty : </span>
                                            <span className="font-semibold text-foreground">
                                                {prospect.eligibility && prospect.eligibility.trim() !== '' ? prospect.eligibility : 'N/A'}
                                            </span>
                                        </div>

                                        {/* Rating */}
                                        {prospect.rating !== null && prospect.rating !== undefined && (
                                            <div className="mt-3 flex items-center gap-2">
                                                <span className="text-sm font-semibold ">Rating:</span>
                                                <div className="flex items-center gap-1">
                                                    <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-[#E64A30]"
                                                            style={{ width: `${(prospect.rating / 10) * 100}%` }}
                                                        ></div>
                                                    </div>
                                                    <span className="text-sm font-medium">{prospect.rating}/10</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Analysis and WriteUp Buttons */}
                                    <div className="flex gap-2 ml-4">
                                        {prospect.analysis && (
                                            <button
                                                onClick={() => toggleAnalysis(prospect.id)}
                                                className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${expandedAnalysis.has(prospect.id)
                                                    ? 'bg-[#E64A30] text-white'
                                                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                                                    }`}
                                            >
                                                Analysis
                                            </button>
                                        )}
                                        {prospect.writeUp && (
                                            <button
                                                onClick={() => toggleWriteUp(prospect.id)}
                                                className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${expandedWriteUp.has(prospect.id)
                                                    ? 'bg-[#E64A30] text-white'
                                                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                                                    }`}
                                            >
                                                WriteUp
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Sliding Analysis Content */}
                                {prospect.analysis && (
                                    <div className={`overflow-hidden transition-all duration-300 ease-in-out ${expandedAnalysis.has(prospect.id) ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                                        }`}>
                                        <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border">
                                            <h3 className="text-sm font-semibold mb-2 text-[#E64A30]">Analysis</h3>
                                            <p className="text-sm dark:text-[#D2D6E2] leading-relaxed">
                                                {prospect.analysis}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Sliding WriteUp Content */}
                                {prospect.writeUp && (
                                    <div className={`overflow-hidden transition-all duration-300 ease-in-out ${expandedWriteUp.has(prospect.id) ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                                        }`}>
                                        <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border">
                                            <h3 className="text-sm font-semibold mb-2 text-[#E64A30]">Write-Up</h3>
                                            <p className="text-sm dark:text-[#D2D6E2] leading-relaxed">
                                                {prospect.writeUp}
                                            </p>
                                        </div>
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