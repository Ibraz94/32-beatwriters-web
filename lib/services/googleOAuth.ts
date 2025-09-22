// Google OAuth configuration
const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!

if (!GOOGLE_CLIENT_ID) {
  throw new Error('NEXT_PUBLIC_GOOGLE_CLIENT_ID environment variable is required')
}

export interface GoogleUser {
  id: string
  email: string
  name: string
  given_name: string
  family_name: string
  picture: string
  verified_email: boolean
}

/**
 * Get Google OAuth authorization URL
 */
export const getGoogleAuthUrl = (state: 'signup' | 'login' = 'signup'): string => {
  const redirectUri = `${window.location.origin}/api/auth/callback/google`
  
  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'offline',
    prompt: 'consent',
    state: state,
  })

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
}

/**
 * Handle Google OAuth callback and get user data
 * This will be called from the callback page
 */
export const handleGoogleCallback = async (code: string): Promise<{ success: boolean; user?: GoogleUser; error?: string }> => {
  try {
    const response = await fetch('/api/auth/callback/google', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      return { success: false, error: errorData.error || 'Google authentication failed' }
    }

    const data = await response.json()
    return { success: true, user: data.user }
  } catch (error) {
    console.error('Google OAuth callback error:', error)
    return { success: false, error: 'Failed to process Google authentication' }
  }
}
