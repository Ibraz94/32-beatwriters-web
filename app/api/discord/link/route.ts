import { NextRequest, NextResponse } from 'next/server'
import { buildApiUrl, API_CONFIG } from '../../../../lib/config/api'

export async function GET(request: NextRequest) {
  try {
    // Get the code from query parameters
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    
    if (!code) {
      return NextResponse.json(
        { error: 'Missing authorization code' },
        { status: 400 }
      )
    }

    // Forward the request to your external API
    const externalUrl = `${buildApiUrl(`/api/discord/link?code=${code}`)}`
    
    console.log('🔄 Proxying Discord link request to:', externalUrl)
    
    const response = await fetch(externalUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        // Forward any auth headers if needed
        ...(request.headers.get('authorization') && {
          'authorization': request.headers.get('authorization')!
        })
      },
      // Add timeout
      signal: AbortSignal.timeout(10000) // 10 second timeout
    })

    if (!response.ok) {
      console.error('❌ Discord link API error:', response.status, response.statusText)
      return NextResponse.json(
        { error: 'Failed to link Discord account' },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log('✅ Discord link response:', data)
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('❌ Discord link error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 