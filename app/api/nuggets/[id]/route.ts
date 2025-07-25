import { NextRequest, NextResponse } from 'next/server'
import { buildApiUrl, API_CONFIG } from '../../../../lib/config/api'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Forward the request to your external API
    const externalUrl = `${buildApiUrl(API_CONFIG.ENDPOINTS.NUGGETS)}/${id}`
    
    console.log('🔄 Proxying nugget GET request to:', externalUrl)
    
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
    
    console.log('📡 GET Response status:', response.status, response.statusText)
    
    // Get the raw response text first
    const responseText = await response.text()
    console.log('📡 GET Raw response:', responseText.substring(0, 500) + (responseText.length > 500 ? '...' : ''))
    
    if (!response.ok) {
      console.error('GET Response body:', responseText)
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
    
    console.error('Error fetching nugget:', error)
    return NextResponse.json(
      { error: 'Failed to connect to external API: ' + (error as Error).message },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    
    // Forward the PUT request to your external API
    const externalUrl = `${buildApiUrl(API_CONFIG.ENDPOINTS.NUGGETS)}/${id}`
    
    console.log('🔄 Proxying nugget PUT request to:', externalUrl)
    
    const response = await fetch(externalUrl, {
      method: 'PUT',
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
    
    console.log('📡 PUT Response status:', response.status, response.statusText)
    
    // Get the raw response text first
    const responseText = await response.text()
    console.log('📡 PUT Raw response:', responseText.substring(0, 500) + (responseText.length > 500 ? '...' : ''))
    
    if (!response.ok) {
      console.error('PUT Response body:', responseText)
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
    
    console.error('Error updating nugget:', error)
    return NextResponse.json(
      { error: 'Failed to connect to external API: ' + (error as Error).message },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Forward the DELETE request to your external API
    const externalUrl = `${buildApiUrl(API_CONFIG.ENDPOINTS.NUGGETS)}/${id}`
    
    console.log('🔄 Proxying nugget DELETE request to:', externalUrl)
    
    const response = await fetch(externalUrl, {
      method: 'DELETE',
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
    
    console.log('📡 DELETE Response status:', response.status, response.statusText)
    
    // Get the raw response text first
    const responseText = await response.text()
    console.log('📡 DELETE Raw response:', responseText.substring(0, 500) + (responseText.length > 500 ? '...' : ''))
    
    if (!response.ok) {
      console.error('DELETE Response body:', responseText)
      return NextResponse.json(
        { 
          error: `External API returned ${response.status}: ${response.statusText}`,
          details: responseText.substring(0, 200)
        },
        { status: response.status }
      )
    }
    
    // Try to parse as JSON (some DELETE responses might be empty)
    let data
    try {
      data = responseText ? JSON.parse(responseText) : { message: 'Nugget deleted successfully' }
    } catch (parseError) {
      // If response is empty or not JSON, assume successful deletion
      data = { message: 'Nugget deleted successfully' }
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
    
    console.error('Error deleting nugget:', error)
    return NextResponse.json(
      { error: 'Failed to connect to external API: ' + (error as Error).message },
      { status: 500 }
    )
  }
} 