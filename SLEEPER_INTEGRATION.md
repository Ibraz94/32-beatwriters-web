# 🏈 Sleeper API Integration

Complete Sleeper API integration using React Query for the 32BeatWriters platform.

## 📁 Project Structure

```
lib/
├── hooks/
│   └── useSleeper.ts          # React Query hooks for Sleeper API
├── services/
│   └── sleeper.ts             # Sleeper API service layer
└── providers/
    └── QueryProvider.tsx      # React Query provider

app/(pages)/leagues/
├── page.tsx                                    # Leagues landing page
└── sleeper/
    ├── page.tsx                                # Sleeper user search
    ├── leagues/[userId]/page.tsx               # User leagues list
    ├── league/[leagueId]/page.tsx              # League rosters view
    └── players/page.tsx                        # NFL players search
```

## 🚀 Features

### 1. Leagues Landing Page (`/leagues`)
- Central hub for all fantasy league platforms
- Card-based interface for easy navigation
- Expandable for future platforms (ESPN, Yahoo, etc.)

### 2. User Search (`/leagues/sleeper`)
- Enter Sleeper username with avatar display
- Fetch and display user profile
- Navigate to user's leagues

### 3. Leagues View (`/leagues/sleeper/leagues/[userId]`)
- Display all leagues for a user
- Show league details (name, season, teams, status)
- Navigate to individual league rosters

### 4. League Dashboard (`/leagues/sleeper/league/[leagueId]`)
- **Rosters Tab**: View all team rosters with player names
  - Team names and owner information
  - Win/Loss records and total points
  - Starters (green badges) vs Bench (gray badges)
  - Real player names instead of IDs
  - Sorted by fantasy points

- **Standings Tab** (`/standings`): Complete league standings
  - Ranked by wins and points
  - Win/Loss/Tie records
  - Win percentage
  - Points For (PF) and Points Against (PA)
  - Point differential
  - Trophy icon for 1st place
  - Desktop table view and mobile card view

- **Matchups Tab** (`/matchups`): Weekly head-to-head results
  - Week-by-week matchup display
  - Week selector (1-18)
  - Team avatars and names
  - Live scoring
  - Winner highlighting (green border)
  - VS format display

### 5. Player Search (`/leagues/sleeper/players`)
- Search all NFL players
- Filter by name, team, or position
- Display player details (team, position, number, age, status)
- Optimized with result limiting (50 players)

## 🔧 Technical Details

### React Query Configuration
- Default stale time: 1 minute
- Players data stale time: 1 hour (rarely changes)
- Disabled refetch on window focus
- Automatic error handling

### API Endpoints Used
- `GET /v1/user/{username}` - User profile with avatar
- `GET /v1/user/{userId}/leagues/nfl/{season}` - User leagues
- `GET /v1/league/{leagueId}` - League details and settings
- `GET /v1/league/{leagueId}/rosters` - League rosters with stats
- `GET /v1/league/{leagueId}/users` - League members and team names
- `GET /v1/league/{leagueId}/matchups/{week}` - Weekly matchups and scores
- `GET /v1/league/{leagueId}/transactions/{week}` - Trades, adds, drops
- `GET /v1/players/nfl` - All NFL players with detailed info
- `GET /v1/state/nfl` - Current NFL week and season info

## 🎨 UI Features
- Matches project design system with consistent colors and spacing
- Background pattern overlay on all pages
- Responsive grid layouts (1-4 columns based on screen size)
- Loading states with spinner animations
- Error handling with user-friendly messages
- Back navigation with arrow icons
- Hover effects and smooth transitions
- Color-coded starters (green badges) vs bench (gray badges)
- Card-based layouts with shadows
- Orange accent color (#E64A30) for CTAs
- Dark mode support throughout

## 📦 Dependencies
- `@tanstack/react-query` - Data fetching and caching
- Next.js 15 App Router
- TypeScript
- Tailwind CSS

## 🔗 Navigation Flow
```
/leagues (landing page)
  → /leagues/sleeper (Sleeper search)
    → /leagues/sleeper/leagues/[userId] (user's leagues)
      → /leagues/sleeper/league/[leagueId] (league rosters)

/leagues/sleeper/players (independent player search)
```

## 💡 Usage Example

### Viewing Your Leagues
1. Click "Feeds" → "Leagues" in the navbar (or visit `/leagues`)
2. Click on the "Sleeper" card
3. Enter a Sleeper username (e.g., "JohnDoe")
4. Click "Search" or press Enter
5. View user profile with avatar and click "View Leagues"
6. Browse all your leagues with status indicators

### Exploring League Details
1. Click "View Rosters" on any league
2. See complete rosters with real player names
3. Navigate between tabs:
   - **Rosters**: View all teams and their players
   - **Standings**: See league rankings and statistics
   - **Matchups**: Check weekly head-to-head results
4. Use week selector to view different weeks
5. See team names, avatars, and records

### Player Search
1. Visit `/leagues/sleeper/players`
2. Type player name, team, or position
3. Browse results with detailed player info
4. View team, position, number, age, and status

## ✅ Implemented Features
- ✅ Player name resolution (IDs mapped to real names)
- ✅ League standings with rankings
- ✅ Weekly matchups with scores
- ✅ Team names and avatars
- ✅ Win/Loss records and statistics
- ✅ Current NFL week tracking

## 🚀 Future Enhancements
- Player performance charts (Recharts integration)
- Weekly projections and rankings
- Trade analyzer and suggestions
- Waiver wire recommendations
- Transaction history view
- Playoff bracket visualization
- Draft recap and analysis
- Player comparison tool
- League activity feed
- Push notifications for matchups
- Export league data to CSV/Excel
- Historical season comparisons
- Power rankings algorithm
- Local storage caching for user preferences

## 📝 Important Notes

### Player Images
**Sleeper API does NOT provide player headshot images.** 

Current implementation:
- ✅ Team owner avatars from Sleeper CDN
- ✅ Player initials avatars with unique colors
- ✅ Fallback system for missing images

To add real player headshots:
- See `PLAYER_IMAGES_GUIDE.md` for detailed instructions
- Option 1: ESPN CDN (free, requires ID mapping)
- Option 2: Third-party APIs (paid)
- Option 3: Keep initials (current, works well)

### Other Notes
- All player IDs resolved to real names
- Current NFL week auto-detected
- Supports 2025 season datais 
- Fully responsive across all devices
- No authentication required (public Sleeper API)
- React Query caching for optimal performance


i think for player stats you should check again, there is week dropdown to see week wise data, also the tables are showing week wise data, and the stats is still minimal then api have, check and fix this issue