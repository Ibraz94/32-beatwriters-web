# 🏈 Sleeper API + Next.js Frontend Integration (Complete Guide)

This guide walks you through building a project that directly integrates with the **Sleeper API**.

It includes:
- User entering Sleeper username
- Fetching and displaying user’s leagues (teams)
- Viewing team rosters and players
- Searching players
- Viewing player stats and fantasy data



## 👤 Phase 1 — Fetch Sleeper User Profile

### Step 1: Create User Search Page

`app/page.tsx`

```tsx
"use client";
import { useState } from "react";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function Home() {
  const [username, setUsername] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const { data: user, error } = useSWR(
    submitted ? `https://api.sleeper.app/v1/user/${username}` : null,
    fetcher
  );

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-950 text-white p-6">
      <h1 className="text-4xl font-bold mb-6">Sleeper Fantasy Dashboard</h1>
      <input
        type="text"
        placeholder="Enter Sleeper username..."
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className="p-3 text-black rounded-md w-72 mb-4"
      />
      <button
        onClick={() => setSubmitted(true)}
        className="bg-blue-500 hover:bg-blue-600 px-5 py-2 rounded-lg"
      >
        Search
      </button>

      {error && <p className="text-red-500 mt-4">User not found.</p>}
      {user && (
        <div className="mt-6 p-4 bg-gray-800 rounded-lg">
          <h2 className="text-xl font-semibold">Username: {user.display_name}</h2>
          <p>User ID: {user.user_id}</p>
          <p>Avatar: {user.avatar}</p>
          <a
            href={`/leagues/${user.user_id}`}
            className="text-blue-400 hover:underline mt-4 inline-block"
          >
            View Leagues →
          </a>
        </div>
      )}
    </div>
  );
}
```

---

## 🏆 Phase 2 — Fetch Leagues by User ID

Create a dynamic route to show leagues for a user.

`app/leagues/[userId]/page.tsx`

```tsx
"use client";
import useSWR from "swr";
import Link from "next/link";
import { useParams } from "next/navigation";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function LeaguesPage() {
  const params = useParams();
  const userId = params.userId as string;

  const { data: leagues, error } = useSWR(
    userId ? `https://api.sleeper.app/v1/user/${userId}/leagues/nfl/2024` : null,
    fetcher
  );

  if (error) return <p className="text-red-500">Failed to load leagues.</p>;
  if (!leagues) return <p className="text-gray-400">Loading leagues...</p>;

  return (
    <div className="p-6 text-white">
      <h1 className="text-3xl font-bold mb-6">User Leagues</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {leagues.map((league: any) => (
          <div key={league.league_id} className="bg-gray-800 p-4 rounded-lg">
            <h2 className="text-lg font-semibold">{league.name}</h2>
            <p>Season: {league.season}</p>
            <p>Total Teams: {league.total_rosters}</p>
            <Link
              href={`/league/${league.league_id}`}
              className="text-blue-400 hover:underline mt-3 inline-block"
            >
              View Roster →
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## 🧩 Phase 3 — Show League Rosters

`app/league/[leagueId]/page.tsx`

```tsx
"use client";
import useSWR from "swr";
import { useParams } from "next/navigation";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function LeagueRosterPage() {
  const params = useParams();
  const leagueId = params.leagueId as string;

  const { data: rosters, error } = useSWR(
    leagueId ? `https://api.sleeper.app/v1/league/${leagueId}/rosters` : null,
    fetcher
  );

  if (error) return <p className="text-red-500">Failed to load rosters.</p>;
  if (!rosters) return <p className="text-gray-400">Loading rosters...</p>;

  return (
    <div className="p-6 text-white">
      <h1 className="text-3xl font-bold mb-6">Rosters</h1>
      {rosters.map((r: any) => (
        <div key={r.roster_id} className="bg-gray-800 p-4 rounded-lg mb-4">
          <h2 className="font-semibold">Roster ID: {r.roster_id}</h2>
          <p>Owner ID: {r.owner_id}</p>
          <p>Players: {r.players?.join(", ")}</p>
        </div>
      ))}
    </div>
  );
}
```

---

## 🔍 Phase 4 — Player Search & Details

`app/players/page.tsx`

```tsx
"use client";
import { useState } from "react";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function PlayersPage() {
  const [query, setQuery] = useState("");
  const { data: players } = useSWR(
    query ? `https://api.sleeper.app/v1/players/nfl` : null,
    fetcher
  );

  const filtered = players
    ? Object.values(players).filter((p: any) =>
        p.full_name?.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  return (
    <div className="p-6 text-white">
      <h1 className="text-3xl font-bold mb-6">NFL Players Search</h1>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search player..."
        className="p-3 text-black rounded-md w-80 mb-6"
      />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {filtered.map((p: any) => (
          <div key={p.player_id} className="bg-gray-800 p-4 rounded-lg">
            <h2 className="text-lg font-semibold">{p.full_name}</h2>
            <p>Team: {p.team}</p>
            <p>Position: {p.position}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## 🧠 Phase 5 — Optional Features to Extend

- Add player performance charts using **Recharts**.
- Show league standings & weekly matchups.
- Cache user profile with **localStorage**.
- Use **Next.js Route Handlers** for light proxying (to avoid rate limits).

---

## ✅ Conclusion

This frontend-only integration allows:
- Entering a Sleeper username
- Fetching leagues and rosters
- Searching and viewing player data
- Building your own fantasy dashboard

It’s lightweight, serverless, and fully compatible with **Next.js App Router** + **SWR**.

---
