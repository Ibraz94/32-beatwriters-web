# NFL Articles Feature

This feature provides a dynamic article system for NFL content with premium access control.

## Features

- **Article Listing Page** (`/articles`) - Shows all NFL articles with premium indicators
- **Dynamic Article Pages** (`/articles/[id]`) - Individual article pages with content access control
- **Premium Access Control** - Restricts certain articles to premium subscribers only
- **Responsive Design** - Works on all device sizes
- **Mock Authentication** - Simulates user login and premium status

## Testing Premium Access

### To Test as Non-Premium User (Default)
The system is configured by default to show a non-premium user. Premium articles will show:
- Article excerpt only
- Premium access required message
- Upgrade and login buttons

### To Test as Premium User
Modify the `useAuth` hook in `/hooks/useAuth.ts`:

```typescript
// Change this line:
isPremium: false // Change to true to simulate premium user

// To:
isPremium: true
```

### Premium vs Free Articles

**Premium Articles:**
- Ravens Defense Analysis
- 2024 NFL Draft Prospects
- Cowboys Offseason Outlook
- Rookie Quarterback Analysis

**Free Articles:**
- Mahomes MVP Season
- Bills Playoff Analysis
- Fantasy Championship Week
- Lions NFC Contenders

## File Structure

```
app/(pages)/articles/
├── page.tsx                 # Main articles listing page
├── [id]/
│   └── page.tsx            # Dynamic article page
├── data/
│   └── nfl-articles.ts     # Article data and types
├── hooks/
│   └── useAuth.ts          # Authentication hook
└── README.md               # This file
```

## Components

### Articles Listing (`/articles`)
- Grid layout of article cards
- Premium badges for premium content
- Author, read time, and category information
- Link to premium upgrade

### Article Page (`/articles/[id]`)
- Full article layout with hero image
- Article metadata (author, date, read time, views)
- Tag system
- Premium access gate for restricted content
- Related articles section
- User status indicator (for testing)

### Premium Access Gate
When a non-premium user tries to access premium content:
- Shows article excerpt
- Displays premium benefits
- Provides upgrade and login buttons
- Clear messaging about premium requirements

## Article Data Structure

Each article includes:
- `id`: Unique identifier for routing
- `title`: Article headline
- `excerpt`: Brief description/preview
- `author`: Article author name
- `publishDate`: Publication date
- `readTime`: Estimated reading time
- `isPremium`: Boolean for access control
- `category`: Article category
- `image`: Hero image URL
- `tags`: Array of relevant tags
- `content`: Full HTML content

## Integration Points

This feature is designed to integrate with:
- User authentication system
- Payment/subscription system
- Content management system
- Analytics tracking

## Customization

### Adding New Articles
Add new articles to the `nflArticles` array in `data/nfl-articles.ts`

### Modifying Premium Logic
Update the `canAccessPremium` logic in the article page component

### Styling Changes
The components use Tailwind CSS classes and can be easily customized 