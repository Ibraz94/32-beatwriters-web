# Redux Setup for 32 Beat Writers

This project now includes a comprehensive Redux setup with Redux Toolkit and RTK Query for state management and API integrations.

## Features

### 🔐 Authentication System
- Complete auth slice with login/logout actions
- JWT token management with auto-refresh
- Role-based access control (user, admin, premium)
- Subscription management integration
- Persistent auth state with localStorage

### 📡 API Services
All API services are built with RTK Query for efficient data fetching and caching:

1. **Auth API** (`lib/services/authApi.ts`)
   - Login, register, logout
   - Password management (forgot/reset/change)
   - Profile management
   - Email verification

2. **Players API** (`lib/services/playersApi.ts`)
   - Player CRUD operations
   - Player stats and filtering
   - Team-based player queries
   - Search functionality

3. **Teams API** (`lib/services/teamsApi.ts`)
   - Team management
   - Team stats and standings
   - Conference/division filtering
   - Schedule and roster management

4. **Articles API** (`lib/services/articlesApi.ts`)
   - Article CRUD with rich metadata
   - Category and tag management
   - Featured/popular/recent articles
   - Like/comment functionality
   - SEO optimization fields

5. **Podcast API** (`lib/services/podcastApi.ts`)
   - Episode management
   - Host and guest information
   - Transcript support
   - Premium content handling

6. **FAQ API** (`lib/services/faqsApi.ts`)
   - FAQ management
   - Category organization
   - Helpful voting system
   - Search functionality

7. **Tools API** (`lib/services/toolsApi.ts`)
   - Fantasy calculators
   - Salary cap tools
   - Draft and trade analyzers
   - Usage tracking and ratings

8. **Subscription API** (`lib/services/subscriptionApi.ts`)
   - Stripe integration ready
   - Plan management
   - Billing and invoices
   - Coupon system

9. **Contact API** (`lib/services/contactApi.ts`)
   - Contact form handling
   - Newsletter subscription
   - Support ticket system
   - Communication preferences

10. **Beat Writers API** (`lib/services/beatWritersApi.ts`)
    - Writer profiles and stats
    - Follow system
    - Verification badges
    - Specialty tracking

## Usage Examples

### Authentication Hook
```tsx
import { useAuth } from '@/lib/hooks/useAuth'

function LoginComponent() {
  const { login, logout, user, isAuthenticated, isLoading } = useAuth()
  
  const handleLogin = async () => {
    const result = await login('email@example.com', 'password')
    if (result.success) {
      console.log('Logged in successfully')
    }
  }
  
  return (
    <div>
      {isAuthenticated ? (
        <div>
          Welcome, {user?.name}!
          <button onClick={logout}>Logout</button>
        </div>
      ) : (
        <button onClick={handleLogin}>Login</button>
      )}
    </div>
  )
}
```

### API Data Fetching
```tsx
import { useGetPlayersQuery, useGetPlayerQuery } from '@/lib/services/playersApi'

function PlayersPage() {
  const { data, error, isLoading } = useGetPlayersQuery({
    team: 'lakers',
    position: 'PG',
    page: 1,
    limit: 10
  })
  
  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error loading players</div>
  
  return (
    <div>
      {data?.players.map(player => (
        <div key={player.id}>{player.name}</div>
      ))}
    </div>
  )
}
```

### Route Protection
```tsx
import { useAuthGuard, usePremiumGuard } from '@/lib/hooks/useAuth'

function PremiumContent() {
  const { hasPremium, isLoading } = usePremiumGuard('/subscribe')
  
  if (isLoading) return <div>Loading...</div>
  if (!hasPremium) return null // Will redirect to /subscribe
  
  return <div>Premium content here</div>
}
```

## Environment Variables

Create a `.env.local` file with the following variables:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your-stripe-key
# Add other environment variables as needed
```

## State Structure

```typescript
{
  auth: {
    user: User | null,
    token: string | null,
    refreshToken: string | null,
    isAuthenticated: boolean,
    isLoading: boolean,
    error: string | null
  },
  // RTK Query APIs
  authApi: { /* RTK Query state */ },
  playersApi: { /* RTK Query state */ },
  teamsApi: { /* RTK Query state */ },
  // ... other APIs
}
```

## TypeScript Support

All APIs include comprehensive TypeScript interfaces:
- Request/response types
- Entity models
- Filter interfaces
- Proper generic typing for hooks

## Caching Strategy

RTK Query provides automatic caching with:
- Intelligent cache invalidation
- Optimistic updates
- Background refetching
- Tag-based cache management

## Getting Started

1. The Redux store is already configured in `lib/store.ts`
2. The provider is wrapped around your app in the layout
3. All API services are ready to use
4. Authentication utilities are available in `lib/utils/auth.ts`

Simply import the hooks you need and start building your components! 