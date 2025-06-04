# NFL Teams Feature

This feature provides comprehensive team pages for all 32 NFL teams with premium access control for exclusive content.

## Features

- **Team Listing Page** (`/teams`) - Shows all NFL teams organized by conference with premium indicators
- **Dynamic Team Pages** (`/teams/[name]`) - Individual team pages with detailed analysis and premium insights
- **Premium Access Control** - Restricts certain team features to premium subscribers only
- **Responsive Design** - Works on all device sizes
- **Mock Authentication** - Simulates user login and premium status

## Testing Premium Access

### To Test as Non-Premium User (Default)
The system is configured by default to show a non-premium user. Premium teams will show:
- Basic team information and analysis
- Premium access required message for exclusive insights
- Upgrade and login buttons

### To Test as Premium User
Modify the `useAuth` hook in `/articles/hooks/useAuth.ts`:

```typescript
// Change this line:
isPremium: false // Change to true to simulate premium user

// To:
isPremium: true
```

### Premium vs Free Teams

**Premium Teams:**
- San Francisco 49ers (advanced salary cap & coaching analysis)
- Dallas Cowboys (insider trade rumors & front office insights)
- Philadelphia Eagles (roster building & strategic analysis)
- Baltimore Ravens (championship probability & advanced metrics)

**Free Teams:**
- Kansas City Chiefs (championship DNA analysis)
- Buffalo Bills (Josh Allen era breakdown)
- Green Bay Packers (post-Rodgers transition analysis)
- Miami Dolphins (speed & innovation focus)

## File Structure

```
app/(pages)/teams/
├── page.tsx                 # Main teams listing page
├── [name]/
│   └── page.tsx            # Dynamic team page
├── data/
│   └── nfl-teams.ts        # Team data and types
└── README.md               # This file
```

## Components

### Teams Listing (`/teams`)
- Grid layout organized by AFC/NFC conferences
- Premium badges for premium teams
- Team cards with logo, description, record, and stadium
- Link to premium upgrade
- League statistics overview

### Team Page (`/teams/[name]`)
- Team header with logo, colors, and basic info
- Team statistics (record, championships, playoff appearances)
- Roster information with key players
- Detailed team analysis
- Premium insights section (for premium teams)
- Recent news sidebar
- Division teams navigation

### Premium Access Gate
When a non-premium user tries to access premium team insights:
- Shows team overview and basic analysis
- Displays premium benefits
- Provides upgrade and login buttons
- Clear messaging about premium requirements

## Team Data Structure

Each team includes:
- `id`: Unique identifier for routing
- `name`: Team name
- `city`: Team city
- `abbreviation`: Team abbreviation
- `conference`: AFC or NFC
- `division`: Team division
- `logo`: Team logo path
- `primaryColor`: Team primary color
- `secondaryColor`: Team secondary color
- `founded`: Year founded
- `stadium`: Home stadium name
- `headCoach`: Current head coach
- `generalManager`: Current GM
- `owner`: Team owner
- `championships`: Number of championships
- `playoffAppearances`: Number of playoff appearances
- `record2023`: 2023 season record
- `isPremium`: Boolean for access control
- `description`: Team description
- `keyPlayers`: Array of key players with positions and numbers
- `recentNews`: Array of recent news items
- `premiumInsights`: Premium-only content (salary cap, trades, injuries, coaching)
- `detailedAnalysis`: Full HTML content analysis

## Premium Content Features

Premium teams include exclusive access to:

### Salary Cap Analysis
- Current cap situation and projections
- Key contract decisions and restructures
- Future flexibility and constraints

### Draft Strategy
- Team priorities and needs
- Expected draft approach and targets
- Trade scenarios and considerations

### Trade Rumors
- Current trade speculation
- Player availability and interest
- Front office strategies and timelines

### Injury Reports
- Current player health status
- Impact on team performance
- Recovery timelines and expectations

### Coaching Analysis
- System evaluation and effectiveness
- Game management and strategy
- Pressure situations and performance

## Integration Points

This feature is designed to integrate with:
- User authentication system
- Payment/subscription system
- Content management system
- Analytics tracking
- Player database

## Customization

### Adding New Teams
Add new teams to the `nflTeams` array in `data/nfl-teams.ts`

### Modifying Premium Logic
Update the `canAccessPremium` logic in the team page component

### Styling Changes
The components use Tailwind CSS classes and can be easily customized

### Team Colors
Team primary colors are used for the banner backgrounds and can be customized per team

## URL Structure

- `/teams` - Main teams listing
- `/teams/kansas-city-chiefs` - Kansas City Chiefs page
- `/teams/san-francisco-49ers` - San Francisco 49ers page (Premium)
- `/teams/dallas-cowboys` - Dallas Cowboys page (Premium)
- `/teams/baltimore-ravens` - Baltimore Ravens page (Premium)

All team URLs use the team ID format (lowercase, hyphenated)

## Testing URLs

Test the following premium and free team pages:

**Free Teams:**
- `/teams/kansas-city-chiefs`
- `/teams/buffalo-bills`
- `/teams/green-bay-packers`
- `/teams/miami-dolphins`

**Premium Teams:**
- `/teams/san-francisco-49ers`
- `/teams/dallas-cowboys`
- `/teams/philadelphia-eagles`
- `/teams/baltimore-ravens`

## Future Enhancements

Potential improvements include:
- Real-time statistics integration
- Player profile pages
- Team comparison tools
- Fantasy football integration
- Social sharing features
- Mobile app support 