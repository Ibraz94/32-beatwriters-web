# 🏈 Sleeper API Integration - Feed-Based Flow

Complete Sleeper API integration using React Query for the 32BeatWriters platform.
**NEW FLOW**: Sleeper works as a feed source, displaying player nuggets from league rosters.

## 📁 Project Structure

```
lib/
├── hooks/
│   └── useSleeper.ts          # React Query hooks for Sleeper API
├── services/
│   └── sleeper.ts             # Sleeper API service layer
└── providers/
    └── QueryProvider.tsx      # React Query provider

app/(pages)/feeds/
└── sleeper/
    ├── page.tsx                                # Sleeper username entry
    └── leagues/[userId]/
        ├── page.tsx                            # User leagues list
        └── [leagueId]/page.tsx                 # League players as nuggets feed
```

## 🚀 New Flow Overview

### Flow Steps:
1. **User enters Sleeper username** → `/feeds/sleeper`
2. **Redirects to user's leagues** → `/feeds/sleeper/leagues/[userId]`
3. **User clicks specific league** → `/feeds/sleeper/leagues/[userId]/[leagueId]`
4. **Displays player nuggets** → Fetches existing nuggets for players in that league roster

### Key Changes:
- ❌ No more standalone league dashboard with rosters/standings/matchups tabs
- ✅ Sleeper acts as a **feed source** (like other feeds)
- ✅ UI matches **feed/nuggets interface** (same as existing nuggets section)
- ✅ Fetches nuggets for players in the selected league
- ✅ Displays in familiar nugget card format

## 🎯 Features

### 1. Username Entry (`/feeds/sleeper`)
- Simple input for Sleeper username
- Validates user exists via Sleeper API
- Auto-redirects to user's leagues page

### 2. Leagues List (`/feeds/sleeper/leagues/[userId]`)
- Display all leagues for the user
- Show league name, season, team count, status
- Click any league to view player nuggets

### 3. League Nuggets Feed (`/feeds/sleeper/leagues/[userId]/[leagueId]`)
- Fetch all players from league rosters via Sleeper API
- Query existing nuggets database for those players
- Display nuggets in standard feed/nuggets UI format
- Filter, sort, and interact like regular nuggets feed
- Shows league context (league name, user's team, etc.)

## 🔧 Technical Details

### React Query Configuration
- Default stale time: 1 minute
- Players data stale time: 1 hour (rarely changes)
- Disabled refetch on window focus
- Automatic error handling

### Sleeper API Endpoints Used
- `GET /v1/user/{username}` - User profile validation
- `GET /v1/user/{userId}/leagues/nfl/{season}` - User's leagues list
- `GET /v1/league/{leagueId}/rosters` - All players in league rosters
- `GET /v1/players/nfl` - Player metadata (names, teams, positions)

### Internal API Integration
- Fetch nuggets from existing nuggets database/API
- Filter nuggets by player IDs from Sleeper rosters
- Display using existing nugget components

## 🎨 UI Features
- **Reuses existing nuggets UI components**
- Same card layout as main nuggets feed
- Same filtering and sorting options
- League context header showing:
  - League name and season
  - User's team info
  - Back navigation to leagues list
- Matches project design system
- Background pattern overlay
- Loading states and error handling
- Responsive design

## 📦 Dependencies
- `@tanstack/react-query` - Data fetching and caching
- Next.js 15 App Router
- TypeScript
- Tailwind CSS
- Existing nuggets components (reused)

## 🔗 Navigation Flow
```
/feeds/sleeper (username entry)
  → /feeds/sleeper/leagues/[userId] (leagues list)
    → /feeds/sleeper/leagues/[userId]/[leagueId] (player nuggets feed)
```

## 💡 Usage Example

### Viewing League Player Nuggets
1. Navigate to `/feeds/sleeper` (or click Sleeper in feeds menu)
2. Enter your Sleeper username (e.g., "JohnDoe")
3. Auto-redirects to your leagues list
4. Click on any league card
5. View all nuggets for players in that league
6. Interact with nuggets (like, comment, share) as usual

### What You See
- League header with name and context
- Nugget cards for all players in league rosters
- Same UI as regular nuggets feed
- Filter by player, team, position
- Sort by date, popularity, etc.

## ✅ Implementation Checklist
- ✅ Move Sleeper routes from `/leagues/sleeper` to `/feeds/sleeper`
- ✅ Update username page to auto-redirect to leagues
- ✅ Create leagues list page at `/feeds/sleeper/leagues/[userId]`
- ✅ Create league nuggets feed at `/feeds/sleeper/leagues/[userId]/[leagueId]`
- ✅ Fetch roster players from Sleeper API
- ✅ Query nuggets database for those players
- ✅ Reuse existing nugget card components
- ✅ Add league context header
- ✅ Update navigation and breadcrumbs
- ⚠️ Old roster/standings/matchups tabs still exist at `/leagues/sleeper` (can be removed if not needed)

## 🚀 Future Enhancements
- Filter nuggets by starters vs bench players
- Show user's team players highlighted
- Weekly nugget digests for league
- Notifications for new nuggets about league players
- Compare nuggets across multiple leagues
- Export league player nuggets

## � Impportant Notes

### Key Differences from Old Flow
- ❌ **Removed**: Standalone league dashboard, rosters tab, standings tab, matchups tab
- ❌ **Removed**: Player search page
- ✅ **Added**: Feed-based approach with nuggets
- ✅ **Added**: Integration with existing nuggets system
- ✅ **Simplified**: Sleeper is now just a feed source, not a separate feature

### Data Flow
1. Sleeper API provides player IDs from rosters
2. Map player IDs to player names/metadata
3. Query nuggets database for those players
4. Display nuggets using existing UI components
5. User interacts with nuggets normally

### Benefits
- Consistent UX across all feeds
- Reuses existing nuggets infrastructure
- Simpler codebase (less custom UI)
- Better integration with platform
- Familiar interface for users