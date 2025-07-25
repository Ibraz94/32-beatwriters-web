# Discord Integration Guide

This guide explains how the Discord OAuth integration works in the 32BeatWriters application.

## Overview

The Discord integration allows users to:
1. **Sign up/Login** using their Discord account
2. **Link existing accounts** with Discord
3. **Join the Discord server** automatically
4. **Access Discord-specific features**

## API Endpoints

### 1. Get Discord Login URL
```
GET /api/discord/login-url
```
**Authentication:** Required  
**Description:** Returns the Discord OAuth authorization URL  
**Response:**
```json
{
  "url": "https://discord.com/api/oauth2/authorize?client_id=...&redirect_uri=...&response_type=code&scope=identify%20guilds.join"
}
```

### 2. Discord OAuth Callback
```
GET /api/discord/callback?code={authorization_code}&state={state}
```
**Authentication:** Not required (OAuth flow)  
**Description:** Handles the Discord OAuth callback  
**Flow:**
1. Receives authorization code from Discord
2. Exchanges code for access token
3. Gets user information from Discord
4. Adds user to Discord server
5. Creates/updates user in database
6. Redirects to frontend with JWT token

**Redirect URLs:**
- **Success:** `{FRONTEND_URL}/account?discord=success&token={jwt}&username={discord_username}`
- **Error:** `{FRONTEND_URL}/account?discord=error&message={error_message}`

### 3. Link Existing Account
```
GET /api/discord/link?code={authorization_code}
```
**Authentication:** Required  
**Description:** Links Discord account to existing user  
**Response:**
```json
{
  "success": true,
  "message": "Successfully linked Discord account",
  "discordUsername": "username#1234"
}
```

### 4. Get Discord Status
```
GET /api/discord/status
```
**Authentication:** Required  
**Description:** Returns Discord connection status for current user  
**Response:**
```json
{
  "connected": true,
  "discordId": "123456789012345678",
  "discordUsername": "username#1234"
}
```

## Database Schema

The Discord integration uses these fields in the `users` table:

```sql
discordId VARCHAR(255) -- Discord user ID
discordUsername VARCHAR(255) -- Discord username
```

## OAuth Flow

### 1. User initiates Discord login
```
Frontend → GET /api/discord/login-url
Backend → Returns Discord authorization URL
Frontend → Redirects user to Discord
```

### 2. User authorizes on Discord
```
User → Authorizes on Discord.com
Discord → Redirects to /api/discord/callback with code
```

### 3. Backend processes callback
```
Backend → Exchanges code for token
Backend → Gets user info from Discord
Backend → Adds user to Discord server
Backend → Creates/updates user in database
Backend → Redirects to frontend with JWT
```

### 4. Frontend handles success
```
Frontend → Receives JWT token
Frontend → Stores token and logs user in
Frontend → Shows success message
```

## Configuration

### Environment Variables
```env
# Discord OAuth Configuration
DISCORD_CLIENT_ID=your_discord_client_id
DISCORD_CLIENT_SECRET=your_discord_client_secret
DISCORD_BOT_TOKEN=your_discord_bot_token
DISCORD_SERVER_ID=your_discord_server_id

# Frontend URL for redirects
FRONTEND_URL=https://32-beatwriters-web.vercel.app
```

### Discord Application Setup
1. **Create Discord Application** at [Discord Developer Portal](https://discord.com/developers/applications)
2. **Set OAuth2 Redirect URI** to: `https://api.32beatwriters.staging.pegasync.com/api/discord/callback`
3. **Add Bot to Server** with required permissions
4. **Copy credentials** to environment variables

## User Management

### New Users (Discord Signup)
- Creates new user account with Discord information
- Generates temporary password
- Assigns default "user" role
- Sends welcome email

### Existing Users (Account Linking)
- Links Discord account to existing user
- Prevents duplicate Discord account linking
- Updates user profile with Discord information

### User Lookup
The system looks up users by:
1. **Discord ID** (primary)
2. **Email address** (fallback)

## Error Handling

### Common Errors
1. **Invalid authorization code** - Code expired or already used
2. **Discord server addition failed** - Bot permissions or server issues
3. **Duplicate Discord account** - Account already linked to another user
4. **Database errors** - Connection or constraint issues

### Error Responses
- **400 Bad Request** - Missing or invalid parameters
- **500 Internal Server Error** - Server-side processing errors
- **Redirect with error** - OAuth flow errors redirect to frontend

## Security Considerations

1. **JWT Tokens** - Secure token generation and validation
2. **State Parameter** - CSRF protection (can be implemented)
3. **Rate Limiting** - Prevent abuse of OAuth endpoints
4. **Input Validation** - Validate all Discord data
5. **Error Logging** - Log errors without exposing sensitive data

## Testing

### Test Scripts
- `test-discord-callback.js` - Tests callback endpoint
- Manual testing with Discord OAuth flow

### Test Scenarios
1. **New user signup** via Discord
2. **Existing user linking** Discord account
3. **Error handling** with invalid codes
4. **Duplicate account** prevention
5. **Server addition** success/failure

## Monitoring

### Logs to Monitor
- Discord callback requests
- Token exchange success/failure
- User creation/updates
- Server addition attempts
- Error rates and types

### Metrics to Track
- Discord signup conversion rate
- Account linking success rate
- Discord server join success rate
- Error frequency by type

## Troubleshooting

### Common Issues
1. **"Invalid redirect URI"** - Check Discord app configuration
2. **"Bot token invalid"** - Verify bot token and permissions
3. **"User not found"** - Check database connection and user lookup
4. **"Server addition failed"** - Verify bot permissions and server ID

### Debug Steps
1. Check Discord application settings
2. Verify environment variables
3. Review server logs for errors
4. Test OAuth flow manually
5. Check database connectivity

## Future Enhancements

1. **State Parameter** - Add CSRF protection
2. **Refresh Tokens** - Implement token refresh logic
3. **Role Sync** - Sync Discord roles with application roles
4. **Webhook Integration** - Real-time Discord events
5. **Analytics** - Track Discord integration usage 