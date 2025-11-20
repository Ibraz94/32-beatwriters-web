import { NextResponse } from 'next/server'
import { buildApiUrl } from '@/lib/config/api'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const search = url.search
  const upstream = buildApiUrl(`/api/rankings/current-week${search}`)
  const res = await fetch(upstream, { cache: 'no-store' })
  const json = await res.json()
  return NextResponse.json(json)
}


