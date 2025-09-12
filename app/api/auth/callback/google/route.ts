import { NextRequest, NextResponse } from 'next/server'

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!

if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
  throw new Error('Google OAuth environment variables are required')
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')
  const state = searchParams.get('state')

  // Handle OAuth errors
  if (error) {
    console.error('Google OAuth error:', error)
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/login?error=oauth_error`)
  }

  if (!code) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/login?error=no_code`)
  }

  try {
    // Exchange authorization code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',
        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/callback/google`,
      }),
    })

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json()
      console.error('Google token exchange error:', errorData)
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/login?error=token_exchange_failed`)
    }

    const tokenData = await tokenResponse.json()

    // Get user info from Google
    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    })

    if (!userResponse.ok) {
      console.error('Google user info error:', await userResponse.text())
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/login?error=user_info_failed`)
    }

    const googleUser = await userResponse.json()

    // Determine redirect based on state
    const isSignup = state === 'signup'
    const redirectUrl = isSignup 
      ? `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/subscribe?google_auth=true&google_user=${encodeURIComponent(JSON.stringify(googleUser))}`
      : `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/login?google_auth=true&google_user=${encodeURIComponent(JSON.stringify(googleUser))}`

    return NextResponse.redirect(redirectUrl)

  } catch (error) {
    console.error('Google OAuth callback error:', error)
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/login?error=callback_error`)
  }
}
