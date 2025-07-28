# Discord Integration Guide

## Overview
This guide covers the complete Discord OAuth2 integration flow for adding users to your Discord server and updating your database.

## Prerequisites
- Discord Application created in Discord Developer Portal
- Bot added to your Discord server
- Backend API running with Discord integration

## Current Configuration
- **Client ID**: `1399366024704426086`
- **Client Secret**: `YG7kxYJYUQAmKQqDGLUg1exubm-yfzs7`
- **Redirect URI**: `https://a686fd561074.ngrok-free.app/api/discord/oauth-callback`
- **Bot Token**: `MTM5OTM2NjAyNDcwNDQyNjA4Ng.GikH6P.1-4KjwXGJ9KyII0FXYKsRjsiOnLNonAQKOJh5M`
- **Server ID**: `1399365503205511259`

## Step-by-Step API Flow

### 1. Get Discord Authorization URL
```bash
GET https://a686fd561074.ngrok-free.app/api/discord/login-url
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response:**
```json
{
  "url": "https://discord.com/oauth2/authorize?client_id=1399366024704426086&response_type=code&redirect_uri=https%3A%2F%2Fa686fd561074.ngrok-free.app%2Fapi%2Fdiscord%2Foauth-callback&scope=identify+guilds.join"
}
```

### 2. User Authorizes (Frontend)
User visits the authorization URL and grants permissions:
- `identify` - Gets user's Discord ID and username
- `guilds.join` - Allows adding user to Discord server

### 3. Discord Redirects with Code
After authorization, Discord redirects to:
```
https://a686fd561074.ngrok-free.app/api/discord/oauth-callback?code=AUTHORIZATION_CODE&state=STATE
```

### 4. Backend Processes Callback (Automatic)
The backend automatically:
- Exchanges code for access token
- Gets user info from Discord
- Adds user to Discord server
- Updates database with Discord info
- Redirects to frontend with success

### 5. Manual Database Update (If Needed)
If you need to manually update a user's Discord info:

```bash
POST https://a686fd561074.ngrok-free.app/api/discord/update-info
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "discordId": "USER_DISCORD_ID",
  "discordUsername": "USER_DISCORD_USERNAME"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Discord information updated successfully",
  "discordId": "USER_DISCORD_ID",
  "discordUsername": "USER_DISCORD_USERNAME"
}
```

### 6. Check Discord Connection Status
```bash
GET https://a686fd561074.ngrok-free.app/api/discord/status
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response:**
```json
{
  "connected": true,
  "discordId": "USER_DISCORD_ID",
  "discordUsername": "USER_DISCORD_USERNAME"
}
```

## Discord Developer Portal Setup

### Required Bot Permissions
In Discord Developer Portal → OAuth2 → General, enable:
- ✅ **Manage Members** (for adding users to server)
- ✅ **View Channels** (for basic access)

### OAuth2 Redirect URI
Add this redirect URI in Discord Developer Portal:
```
https://a686fd561074.ngrok-free.app/api/discord/oauth-callback
```

## Bot Installation (One-time Setup)

### Add Bot to Server
Use this URL to add your bot to the Discord server:
```
https://discord.com/api/oauth2/authorize?client_id=1399366024704426086&permissions=1099511628800&scope=bot
```

## API Endpoints Reference

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/api/discord/login-url` | GET | Get Discord authorization URL | Yes |
| `/api/discord/oauth-callback` | GET | Handle Discord OAuth callback | No |
| `/api/discord/update-info` | POST | Manually update Discord info | Yes |
| `/api/discord/status` | GET | Check Discord connection status | Yes |

## Error Handling

### Common Issues

1. **"Add to Server" appears instead of authorization**
   - **Cause**: Using bot scopes instead of user scopes
   - **Solution**: Use `scope=identify+guilds.join` (not `bot` scopes)

2. **User not added to Discord server**
   - **Cause**: Bot lacks permissions or not in server
   - **Solution**: Add bot to server with "Manage Members" permission

3. **"Unknown Guild" error**
   - **Cause**: Wrong server ID or bot not in server
   - **Solution**: Verify server ID and add bot to server

4. **Database not updated**
   - **Cause**: JWT token mismatch or user lookup failure
   - **Solution**: Use manual update endpoint with correct JWT

## Testing Flow

1. **Get authorization URL** from backend
2. **Authorize with Discord** using the URL
3. **Check logs** for successful callback processing
4. **Verify user appears** in Discord server
5. **Check database** for Discord info
6. **Test status API** to confirm connection

## Security Notes

- Keep bot token and client secret secure
- Use HTTPS for all API calls
- Validate JWT tokens on protected endpoints
- Handle errors gracefully in frontend

## Troubleshooting

### Check Backend Logs
```bash
pm2 logs beatwriterbackend
```

### Verify Discord Configuration
- Bot is in server with correct permissions
- OAuth2 redirect URI matches exactly
- Application ID and secrets are correct

### Test Individual Components
1. Test authorization URL generation
2. Test token exchange
3. Test user info retrieval
4. Test server addition
5. Test database update

## Complete Example Flow

```javascript
// 1. Get authorization URL
const authResponse = await fetch('/api/discord/login-url', {
  headers: { 'Authorization': `Bearer ${jwtToken}` }
});
const { url } = await authResponse.json();

// 2. Redirect user to Discord
window.location.href = url;

// 3. User authorizes and gets redirected back
// Backend processes callback automatically

// 4. Check connection status
const statusResponse = await fetch('/api/discord/status', {
  headers: { 'Authorization': `Bearer ${jwtToken}` }
});
const status = await statusResponse.json();

if (status.connected) {
  console.log('Successfully connected to Discord!');
}
``` 