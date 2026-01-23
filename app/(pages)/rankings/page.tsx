'use client'

import { useEffect, useMemo, useState, Suspense } from 'react'
import { buildApiUrl } from '@/lib/config/api'

interface RankingRow {
  id?: string | number
  player?: string
  name?: string
  position?: string
  team?: string
  projPts?: number
  passYds?: number
  passTds?: number
  ints?: number
  rushYds?: number
  tds?: number
  [key: string]: any
}

type PositionType = 'QB' | 'RB' | 'WR' | 'TE' | 'Flex'

interface Column {
  key: string
  label: string
  width?: string
}

function RankingsContent() {
  interface WeekOption {
    week: number;
    label: string;
  }

  const [data, setData] = useState<RankingRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')
  const [weeks, setWeeks] = useState<WeekOption[]>([])
  const [week, setWeek] = useState<number | undefined>(undefined)
  const [currentWeek, setCurrentWeek] = useState<number | undefined>(undefined)
  const [format, setFormat] = useState<'standard' | 'halfPPR' | 'ppr'>('ppr')
  const [position, setPosition] = useState<PositionType>('QB')
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')

  // Check if today is Tuesday (data uploads on Wednesday, so only block on Tuesday)
  const isTuesday = useMemo(() => {
    const today = new Date()
    const dayOfWeek = today.getDay() // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    return dayOfWeek === 2 // Tuesday = 2
  }, [])

  // Check if we should show "Data Coming Soon"
  const shouldShowDataComingSoon = useMemo(() => {
    return isTuesday && week !== undefined && currentWeek !== undefined && week === currentWeek
  }, [isTuesday, week, currentWeek])

  // Load weeks and set current week
  useEffect(() => {
    const loadWeeks = async () => {
      try {
        const weeksRes = await fetch(buildApiUrl('/api/rankings/weeks'), { cache: 'no-store' })
        const weeksJson = await weeksRes.json()
        const currentWeekValue: number | undefined = weeksJson?.data?.currentWeek
        // Backend now returns weeks as array of { week: number, label: string }
        const weeksArr: WeekOption[] = Array.isArray(weeksJson?.data?.weeks) 
          ? weeksJson.data.weeks 
          : []
        setWeeks(weeksArr)
        setCurrentWeek(currentWeekValue)
        if (currentWeekValue) setWeek(currentWeekValue)
      } catch (e: any) {
        setError(e?.message || 'Failed to load weeks')
      }
    }
    loadWeeks()
  }, [])

  // Load rankings when week/format/position changes
  useEffect(() => {
    const loadRankings = async () => {
      if (!week) return

      // Skip loading if we should show "Data Coming Soon" (Tuesday/Wednesday for latest week)
      if (shouldShowDataComingSoon) {
        setLoading(false)
        setData([])
        return
      }

      setLoading(true)
      setError('')
      try {
        const params = new URLSearchParams({ week: String(week), format })
        if (position) params.set('position', position)
        const res = await fetch(buildApiUrl(`/api/rankings?${params.toString()}`), { cache: 'no-store' })
        if (!res.ok) throw new Error('Failed to load rankings')
        const json = await res.json()
        const players = json?.data?.players
        const rows: RankingRow[] = Array.isArray(players) ? players : []
        setData(rows)
      } catch (e: any) {
        setError(e?.message || 'Failed to load rankings')
      } finally {
        setLoading(false)
      }
    }
    loadRankings()
  }, [week, format, position, shouldShowDataComingSoon])

  const normalized = useMemo(() => {
    // First, map all data and calculate projection points
    const playersWithProj = data.map((r) => {
      const playerName = r.player || r.name || r.Player || r.player_name || '—'
      const projections = (r as any)?.projections || {}
      const stats = (r as any)?.stats || {}
      const proj = projections?.[format] ?? projections?.ppr ?? null

      return {
        playerName,
        proj: proj ?? 0, // Use 0 for sorting if null
        passY: stats?.passingYards ?? null,
        passTd: stats?.passingTDs ?? null,
        rushY: stats?.rushingYards ?? null,
        recY: stats?.receivingYards ?? null,
        rec: stats?.receptions ?? null,
        // Use tdDisplayValue (bookOdds like "-150", "+300") for display, fallback to calculated totalTDs
        tds: stats?.tdDisplayValue ?? stats?.totalTDs ?? (stats?.rushingTDs ?? 0) + (stats?.receivingTDs ?? 0),
      }
    })

    // Sort by projection points (descending) to calculate rank
    const sortedByProj = [...playersWithProj].sort((a, b) => {
      const aProj = a.proj ?? 0
      const bProj = b.proj ?? 0
      return bProj - aProj // Descending order (highest first)
    })

    // Create a map of playerName to rank based on projection points
    const rankMap = new Map<string, number>()
    sortedByProj.forEach((player, idx) => {
      rankMap.set(player.playerName, idx + 1)
    })

    // Map back to original data with ranks based on projection points
    return playersWithProj.map((player) => ({
      ...player,
      rank: rankMap.get(player.playerName) ?? 999, // Default to 999 if not found
      proj: player.proj === 0 ? null : player.proj, // Convert 0 back to null for display
    }))
  }, [data, format])

  // Filter normalized data by search term
  const filteredData = useMemo(() => {
    let filtered = normalized

    // Apply search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim()
      filtered = filtered.filter(row =>
        row.playerName.toLowerCase().includes(searchLower)
      )
    }

    // Apply sorting
    if (sortColumn) {
      filtered = [...filtered].sort((a, b) => {
        const aValue = (a as any)[sortColumn]
        const bValue = (b as any)[sortColumn]

        // Handle null/undefined values
        if (aValue == null && bValue == null) return 0
        if (aValue == null) return 1
        if (bValue == null) return -1

        // Handle string values (for TDs bookOdds)
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortDirection === 'asc'
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue)
        }

        // Handle numeric values
        const numA = typeof aValue === 'number' ? aValue : parseFloat(aValue) || 0
        const numB = typeof bValue === 'number' ? bValue : parseFloat(bValue) || 0

        return sortDirection === 'asc' ? numA - numB : numB - numA
      })
    }

    return filtered
  }, [normalized, searchTerm, sortColumn, sortDirection])

  // Get columns based on position
  const getColumns = (pos: PositionType): Column[] => {
    const baseColumns: Column[] = [
      { key: 'rank', label: 'Rank' },
      { key: 'playerName', label: 'Player' },
      { key: 'proj', label: 'Proj. Pts' }
    ]

    switch (pos) {
      case 'QB':
        return [
          ...baseColumns,
          { key: 'passY', label: 'Pass Yds' },
          { key: 'passTd', label: 'Pass TDs' },
          { key: 'rushY', label: 'Rush Yds' },
          { key: 'tds', label: 'TDs' }
        ]
      case 'RB':
        return [
          ...baseColumns,
          { key: 'rushY', label: 'Rush Yds' },
          { key: 'recY', label: 'Rec Yds' },
          { key: 'rec', label: 'Receptions' },
          { key: 'tds', label: 'TDs' }
        ]
      case 'WR':
        return [
          ...baseColumns,

          { key: 'recY', label: 'Rec Yds' },
          { key: 'rec', label: 'Receptions' },
          { key: 'tds', label: 'TDs' },
        ]
      case 'TE':
        return [
          ...baseColumns,
          { key: 'recY', label: 'Rec Yds' },
          { key: 'rec', label: 'Receptions' },
          { key: 'tds', label: 'TDs' },
        ]
      case 'Flex':
        return [
          ...baseColumns,
          { key: 'rushY', label: 'Rush Yds' },
          { key: 'recY', label: 'Rec Yds' },
          { key: 'rec', label: 'Receptions' },
          { key: 'tds', label: 'TDs' },
        ]
      default:
        return baseColumns
    }
  }

  const columns = getColumns(position)

  // Handle column sorting
  const handleSort = (columnKey: string) => {
    if (sortColumn === columnKey) {
      // Toggle direction if clicking the same column
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      // Set new column and default to descending for numeric columns
      setSortColumn(columnKey)
      setSortDirection('desc')
    }
  }

  return (
    <div className="container mx-auto px-3 sm:px-6 lg:px-7 py-7">
      <div className='relative py-5'>
        <div
          className="hidden md:flex absolute left-[-28px] right-[-28px] h-[300%] bg-cover bg-center bg-no-repeat bg-[url('/background-image2.png')] opacity-10 dark:opacity-5"
          style={{
            transform: "scaleY(-1)",
            zIndex: -50,
            top: '-100px'
          }}

        ></div>
        {/* Mobile Filter Layout */}
        <div className="mb-4 md:hidden flex flex-col gap-3">
          {/* Row 1: Search + Week */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search player..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-md dark:bg-[#262829] text-sm"
              />
            </div>
            <select
              value={week ?? ''}
              onChange={(e) => setWeek(Number(e.target.value))}
              className="px-2 py-2 border border-border rounded-md dark:bg-[#262829] text-sm min-w-[90px]"
            >
              <option value="" disabled>Week</option>
              {weeks.map((w) => (
                <option key={w.week} value={w.week}>{w.label}</option>
              ))}
            </select>
          </div>

          {/* Row 2: Position + Format */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1 bg-accent/40 rounded-md p-1 overflow-x-auto no-scrollbar flex-1">
              {(['QB', 'RB', 'WR', 'TE', 'Flex'] as PositionType[]).map((pos) => (
                <button
                  key={pos}
                  onClick={() => setPosition(pos)}
                  className={`px-3 py-1 rounded text-xs whitespace-nowrap flex-shrink-0 ${position === pos ? 'bg-[#E64A30] rounded-full text-white' : 'text-foreground hover:bg-accent'}`}
                >
                  {pos}
                </button>
              ))}
            </div>

            <select
              value={format}
              onChange={(e) => setFormat(e.target.value as any)}
              className="px-2 py-2 border border-border rounded-md dark:bg-[#262829] text-sm min-w-[80px]"
            >
              <option value="ppr">PPR</option>
              <option value="halfPPR">0.5 PPR</option>
              <option value="standard">Std</option>
            </select>
          </div>

          <p className="text-xs text-muted-foreground">Vegas prop driven. Expect more props to be added as the week progresses.</p>
        </div>

        {/* Desktop Filter Layout */}
        <div className="mb-1 hidden md:block">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3 flex-wrap">
              {/* Week Dropdown */}
              <label className="text-sm text-muted-foreground">Week</label>
              <select
                value={week ?? ''}
                onChange={(e) => setWeek(Number(e.target.value))}
                className="px-3 py-2 border border-border rounded-md dark:bg-[#262829]"
              >
                <option value="" disabled>Select week</option>
                {weeks.map((w) => (
                  <option key={w.week} value={w.week}>{w.label}</option>
                ))}
              </select>

              {/* Position Tabs */}
              <div className="ml-3 flex items-center gap-1 bg-accent/40 rounded-md p-1">
                {(['QB', 'RB', 'WR', 'TE', 'Flex'] as PositionType[]).map((pos) => (
                  <button
                    key={pos}
                    onClick={() => setPosition(pos)}
                    className={`px-3 py-1 rounded ${position === pos ? 'bg-[#E64A30] rounded-full text-white' : 'text-foreground hover:bg-accent'}`}
                  >
                    {pos}
                  </button>
                ))}
              </div>
            </div>

            {/* Format Dropdown (right side) */}
            <div className="flex items-center gap-2">
              <label className="text-sm text-muted-foreground">Format</label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value as any)}
                className="px-3 py-2 border border-border rounded-md dark:bg-[#262829]"
              >
                <option value="ppr">PPR</option>
                <option value="halfPPR">Half PPR</option>
                <option value="standard">Standard</option>
              </select>
            </div>
          </div>

          {/* Search Field and Description - Same row */}
          <div className="mt-4 flex items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">Vegas prop driven. Expect more props to be added as the week progresses.</p>
            <div className="flex items-center gap-2">
              <label className="text-sm text-muted-foreground">Search</label>
              <input
                type="text"
                placeholder="Player name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-3 py-2 border border-border rounded-md dark:bg-[#262829] min-w-[200px] max-w-[300px]"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto w-full orange-scroll">
        <table className="w-full min-w-[700px]">
          <thead>
            <tr className="bg-[#F6BCB2] dark:bg-[#3A3D48] text-[#1D212D] dark:text-white text-center text-xs font-semibold">
              {columns.map((col) => {
                const isSortable = col.key === 'proj'
                const isSorted = sortColumn === col.key

                return (
                  <th
                    key={col.key}
                    className={`p-3 text-center ${isSortable ? 'cursor-pointer hover:bg-[#E8A89A] dark:hover:bg-[#4A4D58] select-none' : ''}`}
                    onClick={() => isSortable && handleSort(col.key)}
                  >
                    <div className="flex items-center justify-center gap-1">
                      <span>{col.label}</span>
                      {isSortable && (
                        <span className="text-xs">
                          {isSorted ? (
                            sortDirection === 'asc' ? '↑' : '↓'
                          ) : (
                            <span className="opacity-30">↕</span>
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {error && (
              <tr>
                <td colSpan={columns.length} className="p-6 text-center text-destructive">{error}</td>
              </tr>
            )}
            {!error && loading && (
              <tr>
                <td colSpan={columns.length} className="p-6 text-center text-muted-foreground">Loading…</td>
              </tr>
            )}
            {!error && !loading && shouldShowDataComingSoon && (
              <tr>
                <td colSpan={columns.length} className="p-12">
                  <div className="flex flex-col items-center justify-center py-12 px-6 bg-gradient-to-br from-[#FFE6E2] to-[#FFF4F2] dark:from-[#2A2D35] dark:to-[#1F2128] rounded-lg border-2 border-dashed border-[#E64A30]/30 dark:border-[#E64A30]/20 shadow-inner">
                    <div className="relative mb-6">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-20 h-20 rounded-full bg-[#E64A30]/10 dark:bg-[#E64A30]/20 animate-pulse"></div>
                      </div>
                      <div className="relative flex items-center justify-center w-16 h-16 mx-auto">
                        <svg
                          className="w-12 h-12 text-[#E64A30] dark:text-[#E64A30]"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold text-[#1D212D] dark:text-white mb-2">
                      Data Coming Soon
                    </h3>
                    <p className="text-base text-muted-foreground mb-4">
                      Week {week} rankings will be available soon
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="w-2 h-2 rounded-full bg-[#E64A30] animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 rounded-full bg-[#E64A30] animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 rounded-full bg-[#E64A30] animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </td>
              </tr>
            )}
            {!error && !loading && !shouldShowDataComingSoon && filteredData.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="p-6 text-center text-muted-foreground">
                  {searchTerm ? `No players found matching "${searchTerm}"` : 'No data'}
                </td>
              </tr>
            )}
            {!error && !loading && !shouldShowDataComingSoon && filteredData.map((row, index) => (
              <tr key={`${row.rank}-${row.playerName}`} className="text-center bg-[#FFE6E2] dark:bg-[#262829] border-t border-border">
                {columns.map((col) => {
                  const value = (row as any)[col.key]
                  let displayValue: string | number = value ?? '—'

                  // Rank column: always use rank based on projection points (not index)
                  if (col.key === 'rank') {
                    displayValue = typeof value === 'number' ? value.toString() : '—'
                  }
                  // Format numbers
                  else if (typeof value === 'number') {
                    // Show 1 decimal place for numeric values
                    displayValue = value.toFixed(1)
                  }
                  // TDs column: display as string if it's bookOdds format (e.g., "-150", "+300")
                  else if (col.key === 'tds' && typeof value === 'string') {
                    displayValue = value // Already in bookOdds format, use as-is
                  }

                  return (
                    <td key={col.key} className="p-3 text-[#1D212D] dark:text-white">
                      {col.key === 'playerName' ? <span className="font-medium">{displayValue}</span> : displayValue}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  )
}

export default function RankingsPage() {
  return (
    <Suspense fallback={<div className="container mx-auto max-w-6xl px-4 py-12">Loading…</div>}>
      <RankingsContent />
    </Suspense>
  )
}


