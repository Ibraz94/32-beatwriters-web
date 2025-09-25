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

function RankingsContent() {
  const [data, setData] = useState<RankingRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')
  const [weeks, setWeeks] = useState<number[]>([])
  const [week, setWeek] = useState<number | undefined>(undefined)
  const [format, setFormat] = useState<'standard' | 'halfPPR' | 'ppr'>('ppr')
  const [position, setPosition] = useState<'' | 'QB' | 'RB' | 'WR' | 'TE' | 'K' | 'DST'>('')

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
      // From integration doc, data.players[i].projections.ppr and stats
      const projections = (r as any)?.projections || {}
      const stats = (r as any)?.stats || {}
      const proj = projections?.ppr ?? null
      const passY = stats?.passingYards ?? null
      const passTd = stats?.passingTDs ?? null
      const interceptions = stats?.interceptions ?? null
      const rushY = stats?.rushingYards ?? null
      const tds = (stats?.rushingTDs ?? 0) + (stats?.receivingTDs ?? 0)
      return {
        rank: idx + 1,
        playerName,
        proj,
        passY,
        passTd,
        interceptions,
        rushY,
        tds,
      }
    })
  }, [data])

  return (
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* Week Dropdown */}
            <label className="text-sm text-muted-foreground">Week</label>
            <select
              value={week ?? ''}
              onChange={(e) => setWeek(Number(e.target.value))}
              className="px-3 py-2 border border-border rounded-md bg-background"
            >
              <option value="" disabled>Select week</option>
              {weeks.map((w) => (
                <option key={w} value={w}>Week {w}</option>
              ))}
            </select>

            {/* Position Tabs */}
            <div className="ml-3 flex items-center gap-1 bg-accent/40 rounded-md p-1">
              {['', 'QB', 'RB', 'WR', 'TE', 'K', 'DST'].map((pos) => (
                <button
                  key={pos || 'ALL'}
                  onClick={() => setPosition(pos as any)}
                  className={`px-3 py-1 rounded ${position === pos ? 'bg-red-800 text-white' : 'text-foreground hover:bg-accent'}`}
                >
                  {pos || 'ALL'}
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
              className="px-3 py-2 border border-border rounded-md bg-background"
            >
              <option value="ppr">PPR</option>
              <option value="halfPPR">Half PPR</option>
              <option value="standard">Standard</option>
            </select>
          </div>
        </div>
        <p className="mt-3 text-sm text-muted-foreground">Vegas prop driven. Expect more props to be added as the week progresses.</p>
      </div>

      <div className="overflow-x-auto border border-border rounded-md">
        <table className="min-w-full text-sm">
          <thead className="bg-accent/40">
            <tr>
              <th className="px-3 py-2 text-left">#</th>
              <th className="px-3 py-2 text-left">Player</th>
              <th className="px-3 py-2 text-left">Proj. Pts</th>
              <th className="px-3 py-2 text-left">Pass Yds</th>
              <th className="px-3 py-2 text-left">Pass TDs</th>
              <th className="px-3 py-2 text-left">INTs</th>
              <th className="px-3 py-2 text-left">Rush Yds</th>
              <th className="px-3 py-2 text-left">TDs</th>
            </tr>
          </thead>
          <tbody>
            {error && (
              <tr>
                <td colSpan={8} className="px-3 py-6 text-center text-destructive">{error}</td>
              </tr>
            )}
            {!error && loading && (
              <tr>
                <td colSpan={8} className="px-3 py-6 text-center text-muted-foreground">Loading…</td>
              </tr>
            )}
            {!error && !loading && normalized.length === 0 && (
              <tr>
                <td colSpan={8} className="px-3 py-6 text-center text-muted-foreground">No data</td>
              </tr>
            )}
            {!error && !loading && normalized.map((row) => (
              <tr key={`${row.rank}-${row.playerName}`} className="border-t border-border">
                <td className="px-3 py-2">{row.rank}</td>
                <td className="px-3 py-2 font-medium">{row.playerName}</td>
                <td className="px-3 py-2">{row.proj ?? '—'}</td>
                <td className="px-3 py-2">{row.passY ?? '—'}</td>
                <td className="px-3 py-2">{row.passTd ?? '—'}</td>
                <td className="px-3 py-2">{row.interceptions ?? '—'}</td>
                <td className="px-3 py-2">{row.rushY ?? '—'}</td>
                <td className="px-3 py-2">{row.tds ?? '—'}</td>
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


