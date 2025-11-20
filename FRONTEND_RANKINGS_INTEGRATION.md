## 32BeatWriters Fantasy Rankings – Next.js Frontend Integration Guide

This guide shows how to build a rankings page similar to `First Down Studio`'s Rankings using our new public endpoints powered by SportsGameOdds. It includes endpoints, response shapes, and copy‑pasteable Next.js examples using native `fetch`.

- Reference UI: [First Down Studio – Rankings](https://www.firstdown.studio/rankings)
- Data provider: [SportsGameOdds API](https://sportsgameodds.com/docs/)

### Base URL

```
http://localhost:4004/api/rankings
```

---

## Endpoints

All endpoints are public. Responses have `{ success, data }` shape.

### 1) Get available weeks (1..current)
- GET `/api/rankings/weeks?season=2025`

Response
```json
{
  "success": true,
  "data": {
    "weeks": [1, 2, 3, 4],
    "currentWeek": 4,
    "season": 2025,
    "lastUpdated": "2025-09-25T12:00:00.000Z"
  }
}
```

### 2) Get current week only
- GET `/api/rankings/current-week?season=2025`

Response
```json
{
  "success": true,
  "data": {
    "season": 2025,
    "currentWeek": 4,
    "lastUpdated": "2025-09-25T12:00:00.000Z"
  }
}
```

### 3) Get rankings by format
- GET `/api/rankings?week=4&season=2025&format=ppr&position=QB`
- Query params:
  - `week` (required): 1–18
  - `season` (optional, default: 2025)
  - `format` (optional): `standard | halfPPR | ppr` (default: `ppr`)
  - `position` (optional): `QB | RB | WR | TE | K | DST`

Response (truncated)
```json
{
  "success": true,
  "data": {
    "week": 4,
    "season": 2025,
    "lastUpdated": "2025-09-25T12:00:00.000Z",
    "totalPlayers": 150,
    "players": [
      {
        "id": "sgodds_player_id",
        "name": "Josh Allen",
        "position": "QB",
        "team": "BUF",
        "gameInfo": {
          "homeTeam": "BUF",
          "awayTeam": "MIA",
          "gameTime": "2025-09-28T18:00:00Z",
          "spread": -7.5,
          "total": 48.5
        },
        "props": {
          "passingYards": { "over": 275.5, "under": 275.5 },
          "passingTDs": { "over": 2.5, "under": 2.5 },
          "interceptions": { "over": 0.5, "under": 0.5 },
          "rushingYards": { "over": 35.5, "under": 35.5 },
          "rushingTDs": { "over": 0.5, "under": 0.5 },
          "receivingYards": { "over": 0, "under": 0 },
          "receivingTDs": { "over": 0, "under": 0 },
          "receptions": { "over": 0, "under": 0 }
        },
        "projections": {
          "standard": 24.52,
          "halfPPR": 24.52,
          "ppr": 24.52
        },
        "stats": {
          "passingYards": 275.5,
          "passingTDs": 2.5,
          "interceptions": 0.5,
          "rushingYards": 35.5,
          "rushingTDs": 0.5,
          "receivingYards": 0,
          "receivingTDs": 0,
          "receptions": 0
        }
      }
    ]
  }
}
```

### 4) Get all scoring formats in one request
- GET `/api/rankings/all?week=4&season=2025&position=RB`

Response (shape)
```json
{
  "success": true,
  "data": {
    "standard": { "week": 4, "season": 2025, "totalPlayers": 64, "players": [...] },
    "halfPPR": { "week": 4, "season": 2025, "totalPlayers": 64, "players": [...] },
    "ppr": { "week": 4, "season": 2025, "totalPlayers": 64, "players": [...] }
  }
}
```

### 5) Get rankings summary (top players by position)
- GET `/api/rankings/summary?week=4&season=2025&format=ppr&limit=10`

Response (shape)
```json
{
  "success": true,
  "data": {
    "week": 4,
    "season": 2025,
    "lastUpdated": "2025-09-25T12:00:00.000Z",
    "totalPlayers": 200,
    "summary": {
      "QB": [ { "id": "...", "name": "...", "position": "QB", "team": "...", "projections": {"ppr": 22.3}, ... } ],
      "RB": [ ... ],
      "WR": [ ... ],
      "TE": [ ... ]
    }
  }
}
```

---

## Next.js – Recommended Integration Patterns

Below are three common patterns. All use native `fetch` (no axios) per project preference.

### A) Server Component (fetch on the server)
```tsx
// app/rankings/page.tsx
import React from 'react';

async function getWeeks() {
  const res = await fetch('http://localhost:4004/api/rankings/weeks', { cache: 'no-store' });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Failed to fetch weeks');
  return json.data as { weeks: number[]; currentWeek: number; season: number };
}

async function getRankings(week: number, format: 'standard'|'halfPPR'|'ppr' = 'ppr', position?: string) {
  const params = new URLSearchParams({ week: String(week), format });
  if (position) params.set('position', position);
  const res = await fetch(`http://localhost:4004/api/rankings?${params}`, { cache: 'no-store' });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Failed to fetch rankings');
  return json.data as {
    week: number; season: number; totalPlayers: number; lastUpdated: string;
    players: Array<{ id: string; name: string; position: string; team: string; projections: any; stats: any; gameInfo: any }>;
  };
}

export default async function RankingsPage() {
  const { currentWeek } = await getWeeks();
  const { players } = await getRankings(currentWeek, 'ppr');

  return (
    <div>
      <h1>Fantasy Rankings (Week {currentWeek})</h1>
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Player</th>
            <th>Pos</th>
            <th>Team</th>
            <th>PPR</th>
          </tr>
        </thead>
        <tbody>
          {players.map((p, i) => (
            <tr key={p.id}>
              <td>{i + 1}</td>
              <td>{p.name}</td>
              <td>{p.position}</td>
              <td>{p.team}</td>
              <td>{p.projections.ppr.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

### B) Route Handler proxy (centralize server-side calls)
```ts
// app/api/rankings/route.ts
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const res = await fetch(`http://localhost:4004/api/rankings${url.search}`, { cache: 'no-store' });
  const json = await res.json();
  return NextResponse.json(json);
}
```

Then client components can call `/api/rankings?...` without CORS concerns.

### C) Client Component (interactive controls)
```tsx
// components/RankingsClient.tsx
"use client";
import React from 'react';

export default function RankingsClient() {
  const [week, setWeek] = React.useState<number>();
  const [format, setFormat] = React.useState<'standard'|'halfPPR'|'ppr'>('ppr');
  const [position, setPosition] = React.useState<string>('');
  const [players, setPlayers] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const loadWeeks = async () => {
      try {
        const res = await fetch('/api/rankings/weeks');
        const json = await res.json();
        if (json.success) setWeek(json.data.currentWeek);
      } catch {}
    };
    loadWeeks();
  }, []);

  const loadPlayers = React.useCallback(async () => {
    if (!week) return;
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams({ week: String(week), format });
      if (position) params.set('position', position);
      const res = await fetch(`/api/rankings?${params.toString()}`);
      const json = await res.json();
      if (json.success) setPlayers(json.data.players);
      else setError(json.message || 'Failed to load');
    } catch (e: any) {
      setError(e?.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [week, format, position]);

  React.useEffect(() => { loadPlayers(); }, [loadPlayers]);

  return (
    <div>
      <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        <select value={week ?? ''} onChange={(e) => setWeek(Number(e.target.value))}>
          {Array.from({ length: week ?? 1 }, (_, i) => i + 1).map(w => (
            <option key={w} value={w}>Week {w}</option>
          ))}
        </select>
        <select value={format} onChange={(e) => setFormat(e.target.value as any)}>
          <option value="standard">Standard</option>
          <option value="halfPPR">Half PPR</option>
          <option value="ppr">PPR</option>
        </select>
        <select value={position} onChange={(e) => setPosition(e.target.value)}>
          <option value="">All</option>
          <option value="QB">QB</option>
          <option value="RB">RB</option>
          <option value="WR">WR</option>
          <option value="TE">TE</option>
          <option value="K">K</option>
          <option value="DST">DST</option>
        </select>
      </div>

      {loading && <div>Loading...</div>}
      {error && <div style={{ color: 'red' }}>{error}</div>}

      {!loading && !error && (
        <table>
          <thead>
            <tr>
              <th>#</th><th>Player</th><th>Pos</th><th>Team</th><th>Proj Pts</th>
            </tr>
          </thead>
          <tbody>
            {players.map((p, i) => (
              <tr key={p.id}>
                <td>{i + 1}</td>
                <td>{p.name}</td>
                <td>{p.position}</td>
                <td>{p.team}</td>
                <td>{p.projections[format].toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
```

---

## Display Guidance (to match First Down Studio feel)

- Tabs for formats: `PPR | Half PPR | Standard`
- Filters: Week (1..current), Position (QB/RB/WR/TE/K/DST)
- Columns similar to:
  - `# | Player | Proj. Pts | Pass Yds | Pass TDs | INTs | Rush Yds | TDs | Rec Yds | Rec TDs | Receptions`
- Show small note: “Vegas prop driven. Expect more props to be added as the week progresses.”

---

## Notes

- Use server fetching (`cache: 'no-store'`) for freshest data.
- If you need a single request to build tabs, use `/all` and read `standard/halfPPR/ppr` blocks.
- Our projected points follow standard fantasy formulas computed from Vegas prop lines.
- The backend already handles “current week” detection and returns 1..current to simplify UI.

---

## Quick QA URLs (open in browser)

- Weeks: `http://localhost:4004/api/rankings/weeks`
- Current week: `http://localhost:4004/api/rankings/current-week`
- PPR rankings (current week 4): `http://localhost:4004/api/rankings?week=4&format=ppr`
- All formats (week 4): `http://localhost:4004/api/rankings/all?week=4`


