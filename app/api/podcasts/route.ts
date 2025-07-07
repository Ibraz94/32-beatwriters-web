import { NextRequest, NextResponse } from 'next/server'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.32beatwriters.com/api'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Build query parameters from search params
    const queryParams = new URLSearchParams()
    
    // Extract common filter parameters
    const filters = [
      'category', 'host', 'guest', 'season', 'isPremium', 'isExplicit',
      'tags', 'search', 'page', 'limit', 'sortBy', 'sortOrder'
    ]
    
    filters.forEach(filter => {
      const value = searchParams.get(filter)
      if (value) {
        queryParams.append(filter, value)
      }
    })
    
    // Handle array parameters like tags
    const tags = searchParams.getAll('tags')
    tags.forEach(tag => {
      queryParams.append('tags', tag)
    })

    // Fetch episodes from external API
    const apiUrl = `${API_BASE_URL}/podcasts${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Add authorization if needed
        ...(request.headers.get('authorization') && {
          'Authorization': request.headers.get('authorization')!
        })
      },
      cache: 'no-store' // Ensure fresh data
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch episodes' },
        { status: response.status }
      )
    }

    const data = await response.json()
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching podcast episodes:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
