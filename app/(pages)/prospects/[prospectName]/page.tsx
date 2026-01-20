
import { Metadata } from 'next'
import ProspectPageClient from './ProspectPageClient'
import { buildApiUrl } from '@/lib/config/api'

// Generate metadata for the prospect page
export async function generateMetadata({ params }: { params: Promise<{ prospectName: string }> }): Promise<Metadata> {
  try {
    const { prospectName } = await params
    const decodedName = decodeURIComponent(prospectName).replace(/-/g, ' ')

    // Fetch prospect data by name
    const response = await fetch(`${buildApiUrl('/api/nfl-prospects')}?name=${encodeURIComponent(decodedName)}`)
    const prospectData = await response.json()

    if (!prospectData || !prospectData.data || !prospectData.data.prospects || prospectData.data.prospects.length === 0) {
      return {
        title: 'Prospect Not Found',
        description: 'The requested prospect could not be found.'
      }
    }

    const prospect = prospectData.data.prospects[0]

    return {
      title: `${prospect.name} - NFL Prospect Profile`,
      description: prospect.writeUp?.substring(0, 160) || `View ${prospect.name}'s prospect profile on 32BeatWriters`,
      openGraph: {
        title: `${prospect.name} - NFL Prospect`,
        description: prospect.writeUp?.substring(0, 160) || `View ${prospect.name}'s prospect profile`,
        images: prospect.picture ? [
          {
            url: prospect.picture,
            width: 1200,
            height: 630,
            alt: prospect.name,
          },
        ] : [],
        type: 'profile',
      },
      twitter: {
        card: 'summary_large_image',
        title: `${prospect.name} - NFL Prospect`,
        description: prospect.writeUp?.substring(0, 160) || `View ${prospect.name}'s prospect profile`,
        images: prospect.picture ? [prospect.picture] : [],
      },
    }
  } catch (error) {
    console.error('Error generating metadata:', error)
    return {
      title: 'NFL Prospect',
      description: 'View NFL prospect profile on 32BeatWriters'
    }
  }
}

export default async function ProspectPage({ params }: { params: Promise<{ prospectName: string }> }) {
  const { prospectName } = await params
  const decodedName = decodeURIComponent(prospectName).replace(/-/g, ' ')
  return <ProspectPageClient name={decodedName} />
}
