'use client'

import { useEffect, useMemo, useState, Suspense } from 'react'
import { buildApiUrl } from '@/lib/config/api'

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
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [totalProspects, setTotalProspects] = useState(0)
    const pageSize = 50 // As per API response pagination.pageSize

    // Load prospects when week/format/position changes
    useEffect(() => {
        const loadProspects = async () => {
            setLoading(true)
            setError('')
            try {
                const params = new URLSearchParams()
                if (position) params.set('position', position)
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
    }, [position, currentPage]) // Depend on position and currentPage for re-fetching

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
                <div className="mb-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-center gap-3">
                            {/* Position Tabs */}
                            <div className="ml-3 flex items-center gap-1 bg-accent/40 rounded-md p-1">
                                {['', 'QB', 'RB', 'WR', 'TE', 'EDGE', 'DL', 'LB', 'DB', 'OT', 'IOL', 'S', 'CB', 'K', 'P', 'LS'].map((pos) => (
                                    <button
                                        key={pos || 'ALL'}
                                        onClick={() => setPosition(pos as any)}
                                        className={`px-3 py-1 rounded ${position === pos ? 'bg-[#E64A30] rounded-full text-white' : 'text-foreground hover:bg-accent'}`}
                                    >
                                        {pos || 'ALL'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Pagination Controls (top right) */}
                        <div className='flex flex-col items-end'>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                                    disabled={currentPage === 1 || loading}
                                    className="px-3 py-1 bg-[#E64A30] text-white rounded-md disabled:opacity-50 text-sm"
                                >
                                    Previous
                                </button>
                                <span className="text-sm text-muted-foreground">
                                    Page {currentPage} of {totalPages}
                                </span>
                                <button
                                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                                    disabled={currentPage === totalPages || loading}
                                    className="px-3 py-1 bg-[#E64A30] text-white rounded-md disabled:opacity-50 text-sm"
                                >
                                    Next
                                </button>
                            </div>
                            <p className="mt-3 ml-3 text-sm text-muted-foreground">Total Prospects: {totalProspects}</p>
                        </div>
                    </div>

                </div>
            </div>

            <div className="overflow-x-auto w-full orange-scroll">
                <table className="w-full min-w-[700px]">
                    <thead>
                        <tr className="bg-[#F6BCB2] dark:bg-[#3A3D48] text-[#1D212D] dark:text-white text-center text-xs font-semibold">
                            <th className="p-3 text-left">#</th>
                            <th className="p-3 text-left">Player</th>
                            <th className="p-3 text-left">School</th>
                            <th className="p-3 text-left">Position</th>
                            <th className="p-3 text-left">Stars</th>
                            <th className="p-3 text-left">Overall Rank</th>
                        </tr>
                    </thead>
                    <tbody>
                        {error && (
                            <tr>
                                <td colSpan={6} className="p-6 text-center text-destructive">{error}</td>
                            </tr>
                        )}
                        {!error && loading && (
                            <tr>
                                <td colSpan={6} className="p-6 text-center text-muted-foreground">Loading…</td>
                            </tr>
                        )}
                        {!error && !loading && normalized.length === 0 && (
                            <tr>
                                <td colSpan={6} className="p-6 text-center text-muted-foreground">No data</td>
                            </tr>
                        )}
                        {!error && !loading && normalized.map((row) => (
                            <tr key={`${row.rank}-${row.playerName}`} className="text-start bg-[#FFE6E2] dark:bg-[#262829] border-t border-border">
                                <td className="p-3 text-[#1D212D] dark:text-white">{row.rank}</td>
                                <td className="p-3 font-medium text-[#1D212D] dark:text-white">{row.playerName}</td>
                                <td className="p-3 text-[#1D212D] dark:text-white">{row.school}</td>
                                <td className="p-3 text-[#1D212D] dark:text-white">{row.position}</td>
                                <td className="p-3 text-[#1D212D] dark:text-white">{row.stars}</td>
                                <td className="p-3 text-[#1D212D] dark:text-white">{row.overallRank}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

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