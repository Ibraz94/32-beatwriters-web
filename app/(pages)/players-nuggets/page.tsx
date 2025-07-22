'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Bookmark, Loader2, UserPlus } from 'lucide-react'
import { ReadMore } from '@/app/components/ReadMore'
import {
    useGetNuggetsQuery,
    getImageUrl,
    useSaveNuggetMutation,
    useUnsaveNuggetMutation
} from '@/lib/services/nuggetsApi'
import { useAuth } from '@/lib/hooks/useAuth'
import { useGetTeamsQuery, getTeamLogoUrl } from '@/lib/services/teamsApi'
import { useRouter, usePathname } from 'next/navigation'
import MobileFeedTabs from '@/app/components/MobileFeedTabs'

export default function PlayersNuggetsPage() {
    const { isAuthenticated, isLoading: authLoading, user } = useAuth()
    const [bookmarkLoading, setBookmarkLoading] = useState<number | null>(null)
    const router = useRouter()
    const pathname = usePathname();

    // Get nuggets for user's followed players
    const { data: nuggetsData, isLoading: isLoadingNuggets, error: nuggetsError } = useGetNuggetsQuery({
        followedPlayers: true // This would be a new filter parameter
    })

    // Teams query
    const { data: teamsData, isLoading: isLoadingTeams } = useGetTeamsQuery()

    // Save/Unsave mutations
    const [saveNugget] = useSaveNuggetMutation()
    const [unsaveNugget] = useUnsaveNuggetMutation()

    // Helper function to find team by abbreviation or name
    const findTeamByKey = (teamKey: string) => {
        if (!teamsData?.teams || !teamKey) return null

        return teamsData.teams.find(team =>
            team.abbreviation?.toLowerCase() === teamKey.toLowerCase() ||
            team.name?.toLowerCase() === teamKey.toLowerCase() ||
            team.city?.toLowerCase() === teamKey.toLowerCase()
        )
    }

    // Handle save/unsave nugget
    const handleBookmarkClick = async (nuggetId: number, isSaved: boolean) => {
        setBookmarkLoading(nuggetId)
        
        try {
            if (isSaved) {
                await unsaveNugget(nuggetId).unwrap()
            } else {
                await saveNugget(nuggetId).unwrap()
            }
        } catch (error) {
            console.error('Error saving/unsaving nugget:', error)
        } finally {
            setBookmarkLoading(null)
        }
    }

    const fantasyInsight = (fantasyInsight: string) => {
        if (fantasyInsight) {
            return <div dangerouslySetInnerHTML={{ __html: fantasyInsight }}></div>
        } else if (fantasyInsight === '') {
        } else {
            return null
        }
    }

    // Combined loading states
    const isLoading = isLoadingNuggets || authLoading || isLoadingTeams
    const error = nuggetsError
    const nuggets = nuggetsData?.data?.nuggets || []

    // Show authentication required message if not authenticated
    if (!authLoading && !isAuthenticated) {
        return (
            <div className="container mx-auto h-screen px-4 py-8 flex flex-col items-center justify-center">
                <div className="max-w-6xl mx-auto text-center">
                    <h1 className="text-3xl font-bold mb-4">Authentication Required</h1>
                    <p className="text-gray-600 mb-8">Please login to view nuggets from your followed players.</p>
                    <Link
                       href={{
        pathname: '/login',
        query: { redirect: pathname }  // Pass the current path as a query parameter
      }}
                        className="bg-red-800 text-white px-6 py-3 rounded-lg font-semibold"
                    >
                        Login
                    </Link>
                </div>
            </div>
        )
    }

    // Loading state
    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center mb-12">
                    <h1 className="text-3xl font-bold mb-4">My Players Nuggets</h1>
                    <p className="text-xl max-w-4xl mx-auto">Loading nuggets from your followed players...</p>
                </div>
                <div className="flex justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-red-800" />
                </div>
            </div>
        )
    }

    // Error state
    if (error) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center">
                    <h1 className="text-3xl font-bold mb-4">My Players Nuggets</h1>
                    <p className="text-xl text-red-600 mb-4">Failed to load nuggets</p>
                    <p className="text-gray-600">Please try again later.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Mobile Feed Tabs */}
            <MobileFeedTabs />
            
            <div className="text-center mb-12">
                <h1 className="text-3xl font-bold mb-4">My Players Nuggets</h1>
                <p className="text-xl max-w-4xl mx-auto">
                    {nuggets.length > 0 
                        ? `Latest nuggets from your followed players (${nuggets.length} found)`
                        : "No nuggets from your followed players yet."
                    }
                </p>
            </div>

            {nuggets.length === 0 ? (
                <div className="text-center py-12">
                    <UserPlus className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-xl text-gray-600 mb-4">No followed players yet</p>
                    <p className="text-gray-500 mb-8">Follow some players to see their nuggets here.</p>
                    <Link
                        href="/players"
                        className="bg-red-800 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors"
                    >
                        Browse Players
                    </Link>
                </div>
            ) : (
                <div className="max-w-4xl mx-auto">
                    <div className="space-y-6">
                        {nuggets.map((nugget, index) => {
                            const playerTeam = findTeamByKey(nugget.player.team || '')
                            return (
                                <div key={`${nugget.id}-${index}`} className="overflow-hidden shadow-md hover:shadow-xl transition-shadow">
                                    <div className='flex mt-8 gap-2 ml-4 mr-4'>
                                        <div
                                            className="cursor-pointer border rounded-full py-2 w-12 h-12 flex items-center justify-center"
                                            onClick={() => router.push(`/players/${nugget.player.id}`, { scroll: false })}
                                        >
                                            <Image
                                                src={getImageUrl(nugget.player.headshotPic) || ''}
                                                alt={`${nugget.player.name} headshot`}
                                                width={50}
                                                height={50}
                                                className='rounded-full object-cover bg-background overflow-hidden'
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <Link href={`/players/${nugget.player.id}`}>
                                                    <h1 className='text-xl'>{nugget.player.name}</h1>
                                                </Link>
                                                {playerTeam && (
                                                    <div className="flex items-center">
                                                        <Image
                                                            src={getTeamLogoUrl(playerTeam.logo) || ''}
                                                            alt={`${playerTeam.name} logo`}
                                                            width={32}
                                                            height={24}
                                                            className='object-contain '
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                            {nugget.player.team && (
                                                <p className="text-sm text-gray-500">
                                                    {nugget.player.position} • {nugget.player.team}
                                                </p>
                                            )}
                                        </div>
                                        {/* Bookmark Button */}
                                        <div className="flex items-center">
                                            <button
                                                onClick={() => handleBookmarkClick(nugget.id, nugget.isSaved || false)}
                                                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                                                title={nugget.isSaved ? 'Remove from saved' : 'Save nugget'}
                                                disabled={bookmarkLoading === nugget.id}
                                            >
                                                {bookmarkLoading === nugget.id ? (
                                                    <Loader2 className="w-5 h-5 animate-spin text-red-800" />
                                                ) : (
                                                    <Bookmark 
                                                        className={`w-5 h-5 ${
                                                            nugget.isSaved 
                                                                ? 'fill-red-800 text-red-800' 
                                                                : 'text-gray-500 hover:text-red-800'
                                                        }`} 
                                                    />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="px-6 py-4 border-t border-white/20 mt-3">
                                        <ReadMore id={nugget.id.toString()} text={nugget.content} amountOfCharacters={400} />
                                    </div>
                                    <div className='px-6 py-2'>
                                        {nugget.fantasyInsight && (
                                            <>
                                                <h1 className='font-semibold mt-4 text-red-800'>Fantasy Insight:</h1>
                                                {fantasyInsight(nugget.fantasyInsight)}
                                            </>
                                        )}
                                    </div>

                                    <div className='px-6 py-4 border-b border-white/20'>
                                        <div className='flex flex-col mt-1 -mb-8 text-sm'>
                                            {nugget.sourceUrl && (
                                                <>
                                                    <div className=''>Source:
                                                        <Link href={nugget.sourceUrl.startsWith('http://') || nugget.sourceUrl.startsWith('https://')
                                                            ? nugget.sourceUrl
                                                            : `https://${nugget.sourceUrl}`} target='_blank' rel='noopener noreferrer' className='text-left hover:text-red-800'> {nugget.sourceName}</Link></div>
                                                </>
                                            )}
                                        </div>
                                        <h1 className='text-right text-gray-400 mt-2 text-sm'>
                                            {new Date(nugget.createdAt).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric'
                                            })}
                                        </h1>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}
        </div>
    )
} 