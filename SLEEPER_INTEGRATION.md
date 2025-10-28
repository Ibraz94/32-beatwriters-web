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
- Enter Sleeper username
- Fetch and display user profile
- Navigate to user's leagues

### 3. Leagues View (`/leagues/sleeper/leagues/[userId]`)
- Display all leagues for a user
- Show league details (name, season, teams)
- Navigate to individual league rosters

### 4. Roster View (`/leagues/sleeper/league/[leagueId]`)
- View all rosters in a league
- Display team records and points
- Show starters vs bench players
- Sorted by fantasy points

### 5. Player Search (`/leagues/sleeper/players`)
- Search all NFL players
- Filter by name, team, or position
- Display player details (team, position, number, age, status)
- Optimized with result limiting

## 🔧 Technical Details

### React Query Configuration
- Default stale time: 1 minute
- Players data stale time: 1 hour (rarely changes)
- Disabled refetch on window focus
- Automatic error handling

### API Endpoints Used
- `GET /v1/user/{username}` - User profile
- `GET /v1/user/{userId}/leagues/nfl/{season}` - User leagues
- `GET /v1/league/{leagueId}/rosters` - League rosters
- `GET /v1/players/nfl` - All NFL players

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

1. Click "Feeds" → "Leagues" in the navbar (or visit `/leagues`)
2. Click on the "Sleeper" card
3. Enter a Sleeper username (e.g., "JohnDoe")
4. Click "Search" or press Enter
5. View user profile and click "View Leagues"
6. Browse leagues and click "View Rosters"
7. See all teams, records, and player IDs

For player search:
1. Visit `/leagues/sleeper/players`
2. Type player name, team, or position
3. Browse results (limited to 50 for performance)

## 🚀 Future Enhancements
- Player name resolution (map IDs to names)
- League standings and matchups
- Player performance charts (Recharts)
- Weekly projections
- Trade analyzer
- Waiver wire recommendations
- Local storage caching for user preferences
