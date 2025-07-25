import { NextRequest, NextResponse } from 'next/server'
import { buildApiUrl, API_CONFIG } from '../../../../lib/config/api'


export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Forward the request to your external API
    const externalUrl = `${buildApiUrl(API_CONFIG.ENDPOINTS.ARTICLES)}/${id}`
    
    console.log('Proxying article request to:', externalUrl)
    
    const response = await fetch(externalUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Forward any auth headers if needed
        ...(request.headers.get('authorization') && {
          'authorization': request.headers.get('authorization')!
        })
      }
    })
    
    if (!response.ok) {
      console.error('External API error:', response.status, response.statusText)
      return NextResponse.json(
        { error: `External API returned ${response.status}: ${response.statusText}` },
        { status: response.status }
      )
    }
    
    const data = await response.json()
    console.log('External API article response:', data)
    
    // Return the data from your external API
    return NextResponse.json(data)
    
  } catch (error) {
    console.error('Proxy error:', error)
    return NextResponse.json(
      { error: 'Failed to connect to external API: ' + (error as Error).message },
      { status: 500 }
    )
  }
} 