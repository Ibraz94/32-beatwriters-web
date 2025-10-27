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
    return data.map((r, idx) => {
      const playerName = r.player || r.name || r.Player || r.player_name || '—'
      const projections = (r as any)?.projections || {}
      const stats = (r as any)?.stats || {}
      const proj = projections?.[format] ?? projections?.ppr ?? null
      
      return {
        rank: idx + 1,
        playerName,
        proj,
        passY: stats?.passingYards ?? null,
        passTd: stats?.passingTDs ?? null,
        rushY: stats?.rushingYards ?? null,
        recY: stats?.receivingYards ?? null,
        rec: stats?.receptions ?? null,
        // Use totalTDs (probability-based) if available, otherwise sum rushing and receiving TDs
        tds: stats?.totalTDs ?? (stats?.rushingTDs ?? 0) + (stats?.receivingTDs ?? 0),
      }
    })
  }, [data, format])

  // Get columns based on position
  const getColumns = (pos: PositionType): Column[] => {
    const baseColumns: Column[] = [
      { key: 'rank', label: '#' },
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
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
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
          <p className="mt-3 text-sm text-muted-foreground">Vegas prop driven. Expect more props to be added as the week progresses.</p>
        </div>
      </div>

      <div className="overflow-x-auto w-full orange-scroll">
        <table className="w-full min-w-[700px]">
          <thead>
            <tr className="bg-[#F6BCB2] dark:bg-[#3A3D48] text-[#1D212D] dark:text-white text-center text-xs font-semibold">
              {columns.map((col) => (
                <th key={col.key} className="p-3 text-center">{col.label}</th>
              ))}
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
            {!error && !loading && normalized.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="p-6 text-center text-muted-foreground">No data</td>
              </tr>
            )}
            {!error && !loading && normalized.map((row) => (
              <tr key={`${row.rank}-${row.playerName}`} className="text-center bg-[#FFE6E2] dark:bg-[#262829] border-t border-border">
                {columns.map((col) => {
                  const value = (row as any)[col.key]
                  let displayValue = value ?? '—'
                  
                  // Format numbers with 1 decimal place
                  if (typeof value === 'number') {
                    displayValue = value.toFixed(1)
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


