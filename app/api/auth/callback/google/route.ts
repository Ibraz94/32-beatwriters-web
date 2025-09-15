import { NextRequest, NextResponse } from 'next/server'
import { GoogleUser } from '@/lib/services/googleOAuth'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const error = searchParams.get('error')

    // Handle OAuth errors
    if (error) {
      console.error('Google OAuth error:', error)
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000'}/subscribe?error=oauth_error&message=${encodeURIComponent('Google authentication failed')}`
      )
    }

    if (!code) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000'}/subscribe?error=no_code&message=${encodeURIComponent('No authorization code received')}`
      )
    }

    // Exchange code for user info
    const userInfo = await exchangeCodeForUserInfo(code)
    
    if (!userInfo) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000'}/subscribe?error=user_info_failed&message=${encodeURIComponent('Failed to get user information')}`
      )
    }

    // Determine redirect based on state parameter
    const userData = encodeURIComponent(JSON.stringify(userInfo))
    const baseUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000'
    
    let redirectUrl: string
    if (state === 'login') {
      // Redirect to login page for login flow
      redirectUrl = `${baseUrl}/login?google_auth=true&google_user=${userData}`
    } else {
      // Default to subscribe page for signup flow
      redirectUrl = `${baseUrl}/subscribe?google_auth=true&google_user=${userData}&state=${state || 'signup'}`
    }

    return NextResponse.redirect(redirectUrl)

  } catch (error) {
    console.error('Google OAuth callback error:', error)
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000'}/subscribe?error=callback_error&message=${encodeURIComponent('Authentication callback failed')}`
    )
  }
}

async function exchangeCodeForUserInfo(code: string): Promise<GoogleUser | null> {
  try {
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        code,
        grant_type: 'authorization_code',
        redirect_uri: `${process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000'}/api/auth/callback/google`,
      }),
    })

    if (!tokenResponse.ok) {
      console.error('Token exchange failed:', await tokenResponse.text())
      return null
    }

    const tokenData = await tokenResponse.json()
    const { access_token } = tokenData

    // Get user info from Google
    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    })

    if (!userResponse.ok) {
      console.error('User info fetch failed:', await userResponse.text())
      return null
    }

    const userData = await userResponse.json()
    
    return {
      id: userData.id,
      email: userData.email,
      name: userData.name,
      given_name: userData.given_name,
      family_name: userData.family_name,
      picture: userData.picture,
      verified_email: userData.verified_email,
    }
  } catch (error) {
    console.error('Error exchanging code for user info:', error)
    return null
  }
}