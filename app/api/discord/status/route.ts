import { NextRequest, NextResponse } from 'next/server'
import { buildApiUrl, API_CONFIG } from '../../../../lib/config/api'

export async function GET(request: NextRequest) {
  try {
    // Forward the request to your external API
    const externalUrl = `${buildApiUrl('/api/discord/status')}`
    
    console.log('🔄 Proxying Discord status request to:', externalUrl)
    
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
      console.error('❌ Discord status API error:', response.status, response.statusText)
      return NextResponse.json(
        { error: 'Failed to get Discord status' },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log('✅ Discord status response:', data)
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('❌ Discord status error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 