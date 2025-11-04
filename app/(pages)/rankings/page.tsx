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
  const [data, setData] = useState<RankingRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')
  const [weeks, setWeeks] = useState<number[]>([])
  const [week, setWeek] = useState<number | undefined>(undefined)
  const [format, setFormat] = useState<'standard' | 'halfPPR' | 'ppr'>('ppr')
  const [position, setPosition] = useState<PositionType>('QB')
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')

  // Load weeks and set current week
  useEffect(() => {
    const loadWeeks = async () => {
      try {
        const weeksRes = await fetch(buildApiUrl('/api/rankings/weeks'), { cache: 'no-store' })
        const weeksJson = await weeksRes.json()
        const currentWeek: number | undefined = weeksJson?.data?.currentWeek
        const weeksArr: number[] = weeksJson?.data?.weeks || []
        setWeeks(weeksArr)
        if (currentWeek) setWeek(currentWeek)
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
  }, [week, format, position])

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
          { key: 'tds', label: 'TDs' },
          { key: 'recY', label: 'Rec Yds' },
          { key: 'rec', label: 'Receptions' }
        ]
      case 'WR':
        return [
          ...baseColumns,
          { key: 'tds', label: 'TDs' },
          { key: 'recY', label: 'Rec Yds' },
          { key: 'rec', label: 'Receptions' }
        ]
      case 'TE':
        return [
          ...baseColumns,
          { key: 'tds', label: 'TDs' },
          { key: 'recY', label: 'Rec Yds' },
          { key: 'rec', label: 'Receptions' }
        ]
      case 'Flex':
        return [
          ...baseColumns,
          { key: 'rushY', label: 'Rush Yds' },
          { key: 'tds', label: 'TDs' },
          { key: 'recY', label: 'Rec Yds' },
          { key: 'rec', label: 'Receptions' }
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
        <div className="mb-1">
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
                  <option key={w} value={w}>Week {w}</option>
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
            {!error && !loading && filteredData.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="p-6 text-center text-muted-foreground">
                  {searchTerm ? `No players found matching "${searchTerm}"` : 'No data'}
                </td>
              </tr>
            )}
            {!error && !loading && filteredData.map((row, index) => (
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


