import { NextRequest, NextResponse } from 'next/server'

const EXTERNAL_API_BASE = 'https://api.32beatwriters.staging.pegasync.com/api'

export async function GET(request: NextRequest) {
  try {
    // Get the search parameters from the original request
    const { searchParams } = new URL(request.url)
    const queryString = searchParams.toString()
    
    // Forward the request to your external API
    const externalUrl = `${EXTERNAL_API_BASE}/nuggets${queryString ? `?${queryString}` : ''}`
    
    console.log('🔄 Proxying nuggets request to:', externalUrl)
    
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
    
    console.log('📡 Response status:', response.status, response.statusText)
    console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()))
    
    // Get the raw response text first
    const responseText = await response.text()
    console.log('📡 Raw response:', responseText.substring(0, 500) + (responseText.length > 500 ? '...' : ''))
    
    if (!response.ok) {
      console.error('Response body:', responseText)
      return NextResponse.json(
        { 
          error: `External API returned ${response.status}: ${response.statusText}`,
          details: responseText.substring(0, 200)
        },
        { status: response.status }
      )
    }
    
    // Try to parse as JSON
    let data
    try {
      data = JSON.parse(responseText)
    } catch (parseError) {
      return NextResponse.json(
        { 
          error: 'External API returned non-JSON response',
          responseText: responseText.substring(0, 200)
        },
        { status: 500 }
      )
    }
    
    // Return the data from your external API
    return NextResponse.json(data)

  } catch (error) {
    // Check if it's a timeout error
    if (error instanceof Error && error.name === 'AbortError') {
      return NextResponse.json(
        { error: 'External API request timed out (10s)' },
        { status: 504 }
      )
    }
    
    console.error('Error fetching nuggets:', error)
    return NextResponse.json(
      { error: 'Failed to connect to external API: ' + (error as Error).message },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Forward the POST request to your external API
    const externalUrl = `${EXTERNAL_API_BASE}/nuggets`
    
    console.log('🔄 Proxying POST nugget request to:', externalUrl)
    
    const response = await fetch(externalUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        // Forward any auth headers if needed
        ...(request.headers.get('authorization') && {
          'authorization': request.headers.get('authorization')!
        })
      },
      body: JSON.stringify(body),
      // Add timeout
      signal: AbortSignal.timeout(10000) // 10 second timeout
    })
    
    console.log('📡 POST Response status:', response.status, response.statusText)
    
    // Get the raw response text first
    const responseText = await response.text()
    console.log('📡 POST Raw response:', responseText.substring(0, 500) + (responseText.length > 500 ? '...' : ''))
    
    if (!response.ok) {
      console.error('POST Response body:', responseText)
      return NextResponse.json(
        { 
          error: `External API returned ${response.status}: ${response.statusText}`,
          details: responseText.substring(0, 200)
        },
        { status: response.status }
      )
    }
    
    // Try to parse as JSON
    let data
    try {
      data = JSON.parse(responseText)
    } catch (parseError) {
      return NextResponse.json(
        { 
          error: 'External API returned non-JSON response',
          responseText: responseText.substring(0, 200)
        },
        { status: 500 }
      )
    }
    
    // Return the data from your external API
    return NextResponse.json(data, { status: response.status })

  } catch (error) {
    // Check if it's a timeout error
    if (error instanceof Error && error.name === 'AbortError') {
      return NextResponse.json(
        { error: 'External API request timed out (10s)' },
        { status: 504 }
      )
    }
    
    console.error('Error creating nugget:', error)
    return NextResponse.json(
      { error: 'Failed to connect to external API: ' + (error as Error).message },
      { status: 500 }
    )
  }
}
