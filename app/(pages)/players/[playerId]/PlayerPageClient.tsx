'use client'

export const dynamic = 'force-dynamic'

import { useParams, useSearchParams, usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect, useMemo } from 'react'
import { CircleGauge, Newspaper, Dumbbell, Search, Loader2, Logs, NotepadTextDashed, Clock, ChevronDown } from 'lucide-react'
import { getImageUrl, useGetPlayerQuery, useGetPlayersQuery, useGetPlayerProfilerQuery, useGetPlayerPerformanceProfilerQuery, useFollowPlayerMutation, useUnfollowPlayerMutation } from '@/lib/services/playersApi'
import { useGetNuggetsByPlayerIdQuery, getImageUrl as getNuggetImageUrl, useGetNuggetsQuery, type NuggetFilters } from '@/lib/services/nuggetsApi'
import { useGetTeamsQuery, getTeamLogoUrl } from '@/lib/services/teamsApi'
import { useAuth } from '@/lib/hooks/useAuth'
import { ReadMore } from '@/app/components/ReadMore'
import { ChartConfig, ChartContainer } from "@/components/ui/chart"
import { Bar, BarChart, LabelList, XAxis, Cell } from "recharts"
import { useToast } from '@/app/components/Toast'
import SearchBar from '@/components/ui/search'
import { useRouter } from 'next/navigation'

export default function PlayerPageClient({ id }: any) {
    const params = useParams()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const router = useRouter()

    const playerId = id as string

    console.log({ playerId })

    // Tab state
    const [activeTab, setActiveTab] = useState('news')
    // Follow state
    const [isFollowing, setIsFollowing] = useState(false)
    const [loadingFollow, setLoadingFollow] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [allNuggets, setAllNuggets] = useState<any[]>([])
    const [hasMoreNuggets, setHasMoreNuggets] = useState(true)
    const [isLoadingMore, setIsLoadingMore] = useState(false)
    const ITEMS_PER_PAGE = 15
    const [followPlayer] = useFollowPlayerMutation();
    const [unfollowPlayer] = useUnfollowPlayerMutation();
    const { showToast } = useToast();

    // Year selection state for nuggets filtering
    const [selectedYearForNuggets, setSelectedYearForNuggets] = useState('2025')

    const queryParams = useMemo(() => {
        const params: any = {
            ...(debouncedSearchTerm && { search: debouncedSearchTerm }),
            playerId: parseInt(playerId),
            sortBy: 'createdAt' as const,
            sortOrder: 'desc' as const
        }
        if (selectedYearForNuggets) {
            params.year = selectedYearForNuggets
        }
        return params
    }, [debouncedSearchTerm, playerId, selectedYearForNuggets])

    // Main query for nuggets - with all filters
    const {
        data: nuggetsData,
        isLoading: isLoadingNuggets,
        error: nuggetsError,
        isFetching: isFetchingNuggets
    } = useGetNuggetsQuery(queryParams as NuggetFilters)


    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm)
        }, 500)
        return () => clearTimeout(timer)
    }, [searchTerm])

    // Update nuggets when year changes
    useEffect(() => {
        setCurrentPage(1)
    }, [selectedYearForNuggets])

    // Handle loading nuggets
    useEffect(() => {
        if (nuggetsData?.data?.nuggets) {
            const newNuggets = nuggetsData.data.nuggets

            if (currentPage === 1) {
                // First page - replace all nuggets
                setAllNuggets(newNuggets)
            } else {
                // Additional pages - append to existing nuggets
                setAllNuggets(prev => [...prev, ...newNuggets])
            }

            // Check if there are more nuggets to load
            setHasMoreNuggets(newNuggets.length === ITEMS_PER_PAGE)
            setIsLoadingMore(false)
        }
    }, [nuggetsData, currentPage])




    // Year selection state for performance metrics
    const [selectedYear, setSelectedYear] = useState('2025')

    // Game Logs and Performance Metrics year selection logic
    const currentYearDynamic = new Date().getFullYear();
    const availableYearsDynamic = Array.from({ length: currentYearDynamic - 2018 }, (_, i) => (currentYearDynamic - i).toString());

    useEffect(() => {
        if (!selectedYear && availableYearsDynamic.includes('2025')) {
            setSelectedYear('2025');
        } else if (!selectedYear && availableYearsDynamic.length > 0) {
            setSelectedYear(availableYearsDynamic[0]);
        }
    }, [availableYearsDynamic, selectedYear]);

    // Get the page number user came from (for back navigation)
    const fromPage = searchParams?.get('page')
    const backToPlayersUrl = fromPage ? `/players?page=${fromPage}` : '/players'

    // Add authentication check
    const { isAuthenticated, isLoading: authLoading, user } = useAuth()

    // First, fetch the player from internal API to get the playerId
    const { data: internalPlayerResponse, isLoading: internalPlayerLoading, error: internalPlayerError, refetch: refetchPlayer } = useGetPlayerQuery(playerId)

    // Extract the actual player data from the response
    const internalPlayer = internalPlayerResponse?.data


    useEffect(() => {
        refetchPlayer()
    }, [playerId, refetchPlayer])




    useEffect(() => {
        if (internalPlayer) {

            setIsFollowing(internalPlayer?.isFollowed || false)
        }
    }, [internalPlayer])

    // Toggle follow/unfollow
    const toggleFollow = async (playerId: string, isPlayerFollowed: boolean) => {
        if (!isAuthenticated) {
            showToast("Please log in to follow players.", "warning");
            return;
        }

        console.log("Toggling follow status:", { playerId, isPlayerFollowed });

        // Optimistic UI update
        setLoadingFollow(true);

        try {
            if (isPlayerFollowed) {
                await unfollowPlayer(playerId).unwrap();
                showToast("Player unfollowed successfully!", "success");
            } else {
                await followPlayer(playerId).unwrap();
                showToast("Player followed successfully!", "success");
            }

            setIsFollowing(!isPlayerFollowed);
        } catch (error) {
            console.log("Error toggling follow status:", error);
            showToast("Failed to update follow status. Please try again.", "error");
        } finally {
            setLoadingFollow(false);
        }
    }


    // Then use the playerId from internal API to fetch detailed data from Player Profiler API
    const { data: playerResponse, isLoading: playerLoading, error: playerError } = useGetPlayerProfilerQuery(
        internalPlayer?.playerId || '',
        { skip: !internalPlayer?.playerId }
    )

    // Fetch performance data for selected year
    const { data: performanceResponse, isLoading: performanceLoading } = useGetPlayerPerformanceProfilerQuery(
        { playerId: internalPlayer?.playerId || '', year: selectedYear },
        { skip: !internalPlayer?.playerId }
    )

    // Extract player data from the nested response
    const player = playerResponse?.data?.Player
    const basicPlayer = internalPlayer // Data from internal API
    const performancePlayer = performanceResponse?.data?.Player

    // Debug: Log the actual response structure (remove in production)
    if (process.env.NODE_ENV === 'development') {
        console.log('Internal Player API Response:', internalPlayerResponse)
        console.log('Internal Player Data:', internalPlayer)
        console.log('Internal Player ID:', internalPlayer?.playerId)
        console.log('Player Data:', player)
        console.log('Player Error:', playerError)
    }

    const teamName = player?.Core?.Team?.Name || basicPlayer?.team
    const teamLoading = false

    // Fetch nuggets for this specific player
    const { data: nuggetResponse, isLoading: nuggetsLoading } = useGetNuggetsByPlayerIdQuery(playerId)
    const nuggets = nuggetResponse?.data?.nuggets || []
    console.log('Nuggets for player:', nuggets)

    // Teams query for nuggets team logos
    const { data: teamsData } = useGetTeamsQuery()

    // Helper function to find team by abbreviation or name
    const findTeamByKey = (teamKey: string) => {
        if (!teamsData?.teams || !teamKey) return null

        return teamsData.teams.find(team =>
            team.abbreviation?.toLowerCase() === teamKey.toLowerCase() ||
            team.name?.toLowerCase() === teamKey.toLowerCase() ||
            team.city?.toLowerCase() === teamKey.toLowerCase()
        )
    }

    const playerTeam = findTeamByKey(player?.Core?.Team?.Name || '')

    // Fetch all players for teammates - get more players to find teammates
    const { data: playersResponse } = useGetPlayersQuery({
        page: 1,
        limit: 100  // Increased limit to fetch more players
    })
    const allPlayers = playersResponse?.data?.players || []

    // Get teammates (same team, different player)
    const currentTeam = player?.Core?.Team?.Name || basicPlayer?.team
    const teammates = allPlayers
        .filter(p => {
            // More flexible team matching
            const playerTeam = p.team
            return playerTeam === currentTeam && p.id !== basicPlayer?.id
        })

    // Debug logging
    console.log('Current player team:', currentTeam)
    console.log('All players count:', allPlayers.length)
    console.log('Teammates found:', teammates.length)
    console.log('Sample teammates:', teammates.slice(0, 3).map(t => ({ name: t.name, team: t.team })))

    const loading = playerLoading || teamLoading || authLoading || internalPlayerLoading || performanceLoading

    const chartConfig = {
        desktop: {
            label: "Desktop",
            color: "#2563eb",
        },
        mobile: {
            label: "Mobile",
            color: "#2563eb",
        }
    } satisfies ChartConfig

    // Helper function to format numbers to 2 decimal places
    const formatNumber = (value: string | number | undefined) => {
        if (!value || value === 'N/A') return value
        const num = parseFloat(value.toString())
        return isNaN(num) ? value : num.toFixed(2)
    }

    // Tab components
    const tabs = [
        { id: 'news', label: 'News & Updates', icon: Newspaper },
        { id: 'performance', label: 'Performance Metrics', icon: CircleGauge },
        // { id: 'workout', label: 'Workout Metrics', icon: Dumbbell },
        { id: 'season-stats', label: 'Season Stats', icon: NotepadTextDashed },
        { id: 'game-log', label: 'Game Log', icon: Logs },
    ]


    const handleSearch = (term: string) => {
        setSearchTerm(term)
    }

    // Show authentication required message if not authenticated or has insufficient membership
    if (!authLoading && (!isAuthenticated || (user?.memberships && user.memberships.id !== undefined && user.memberships.id < 2))) {
        return (
            <div className="container mx-auto h-screen px-4 py-8 flex flex-col items-center justify-center">
                <div className="max-w-6xl mx-auto text-center">
                    <h1 className="text-3xl font-bold mb-4">Premium Access Required</h1>
                    <p className="text-gray-600 mb-8">
                        {!isAuthenticated
                            ? "Please login to your account to view the feed. Don't have a subscription? Please subscribe to access premium content."
                            : "Please upgrade to a premium subscription to view the feed."
                        }
                    </p>

                    {!isAuthenticated && (
                        <p className="text-gray-600 mb-8">
                            <Link href={{
                                pathname: '/login',
                                query: { redirect: pathname }
                            }} className="text-[#E64A30] hover:text-[#E64A30]/80 font-semibold">Login</Link>
                        </p>
                    )}
                    <Link
                        href="/subscribe"
                        className="bg-[#E64A30] hover:bg-[#E64A30]/90 text-white px-6 py-3 rounded-full font-semibold"
                    >
                        Subscribe
                    </Link>
                </div>
            </div>
        )
    }

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-6xl mx-auto">
                    <div className="animate-pulse">
                        <div className="h-8 bg-gray-200 rounded mb-4"></div>
                        <div className="h-64 bg-gray-200 rounded mb-6"></div>
                        <div className="space-y-3">
                            <div className="h-4 bg-gray-200 rounded"></div>
                            <div className="h-4 bg-gray-200 rounded"></div>
                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    if ((playerError && internalPlayerError) || (!player && !basicPlayer)) {
        // Check if the error is specifically an authentication error
        const isAuthError = (playerError && 'status' in playerError && (playerError.status === 401 || playerError.status === 403)) ||
            (internalPlayerError && 'status' in internalPlayerError && (internalPlayerError.status === 401 || internalPlayerError.status === 403))

        if (isAuthError) {
            return (
                <div className="container mx-auto px-4 py-8">
                    <div className="max-w-6xl mx-auto text-center">
                        <h1 className="text-3xl font-bold mb-4">Authentication Required</h1>
                        <p className="text-gray-600 mb-8">You need to be signed in to view this player profile.</p>
                        <div className="space-x-4">
                            <Link
                                href={{
                                    pathname: '/login',
                                    query: { redirect: pathname }  // Pass the current path as a query parameter
                                }}
                                className="bg-[#E64A30] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#E64A30]/80 transition-colors"
                            >
                                Sign In
                            </Link>
                            <Link
                                href={backToPlayersUrl}
                                className="text-[#E64A30] border border-[#E64A30] px-6 py-3 rounded-lg font-semibold hover:bg-[#E64A30]/80 hover:text-white transition-colors"
                            >
                                Back to Players
                            </Link>
                        </div>
                    </div>
                </div>
            )
        }

        return (
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-6xl mx-auto h-screen text-center">
                    <h1 className="text-3xl font-bold mb-4">Player Not Found</h1>
                    <p className="text-gray-600 mb-8">The player you're looking for doesn't exist or has been moved.</p>
                    <Link
                        href={backToPlayersUrl}
                        className="text-[#E64A30]/80 px-6 py-3 rounded-lg font-semibold hover:bg-white transition-colors"
                    >
                        Back to Players
                    </Link>
                </div>
            </div>
        )
    }

    // Get player image URL - prefer Player Profiler API image, fallback to internal API
    const playerImage = player?.Core?.Avatar || player?.Core?.['Alt Image'] || getImageUrl(basicPlayer?.headshotPic) || '/default-player.jpg'

    // Get player name - prefer Player Profiler API, fallback to internal API
    const playerName = player?.Core?.['Full Name'] || basicPlayer?.name || 'Unknown Player'

    // Get player position - prefer Player Profiler API, fallback to internal API
    const playerPosition = player?.Core?.Position || basicPlayer?.position || 'N/A'

    // Get player age - prefer Player Profiler API, fallback to internal API
    const playerAge = player?.Core?.Age || basicPlayer?.age || 'N/A'

    const displayNuggets = allNuggets


    // Render tab content
    const renderTabContent = () => {
        switch (activeTab) {
            case 'workout':
                return (
                    <div className="space-y-8">
                        {/* Workout Metrics - Only show if Player Profiler data is available */}
                        {player?.['Workout Metrics'] ? (
                            <div>
                                <h2 className="text-3xl mb-8">Workout Metrics</h2>

                                <div className="text-white">
                                    {/* Primary Metrics Chart */}
                                    <div className="grid grid-cols-1 gap-4">
                                        {/* Mobile Chart */}
                                        <div className="w-full block sm:hidden">
                                            <ChartContainer config={chartConfig} className="h-[300px] w-full">
                                                <BarChart
                                                    data={[
                                                        {
                                                            name: "40-YARD",
                                                            fullName: "40-YARD DASH",
                                                            value: parseFloat(player['Workout Metrics']['40-Yard Dash']) || 0,
                                                            displayValue: player['Workout Metrics']['40-Yard Dash'] || 'N/A',
                                                            rank: player['Workout Metrics']['40-Yard Dash Rank'] || 10,
                                                            hasData: !!player['Workout Metrics']['40-Yard Dash'],
                                                        },
                                                        {
                                                            name: "SPEED",
                                                            fullName: "SPEED SCORE",
                                                            value: parseFloat(player['Workout Metrics']['Speed Score']) || 0,
                                                            displayValue: player['Workout Metrics']['Speed Score'] || 'N/A',
                                                            rank: player['Workout Metrics']['Speed Score Rank'] || 10,
                                                            hasData: !!player['Workout Metrics']['Speed Score'],
                                                        },
                                                        {
                                                            name: "BURST",
                                                            fullName: "BURST SCORE",
                                                            value: parseFloat(player['Workout Metrics']['Burst Score']) || 0,
                                                            displayValue: player['Workout Metrics']['Burst Score'] || 'N/A',
                                                            rank: player['Workout Metrics']['Burst Score Rank'] || 10,
                                                            hasData: !!player['Workout Metrics']['Burst Score'],
                                                        },
                                                        {
                                                            name: "AGILITY",
                                                            fullName: "AGILITY SCORE",
                                                            value: parseFloat(player['Workout Metrics']['Agility Score']) || 0,
                                                            displayValue: player['Workout Metrics']['Agility Score'] || 'N/A',
                                                            rank: player['Workout Metrics']['Agility Score Rank'] || 10,
                                                            hasData: !!player['Workout Metrics']['Agility Score'],
                                                        },
                                                        {
                                                            name: "CATCH",
                                                            fullName: "CATCH RADIUS",
                                                            value: parseFloat(player['Workout Metrics']['Catch Radius']) || 0,
                                                            displayValue: player['Workout Metrics']['Catch Radius'] || 'N/A',
                                                            rank: player['Workout Metrics']['Catch Radius Rank'] || 10,
                                                            hasData: !!player['Workout Metrics']['Catch Radius'],
                                                        },
                                                    ]}
                                                    margin={{ top: 15, right: 15, left: 15, bottom: 40 }}
                                                    barSize={25}
                                                >
                                                    <Bar dataKey="rank" radius={[4, 4, 0, 0]}>
                                                        {[
                                                            {
                                                                name: "40-YARD",
                                                                hasData: !!player['Workout Metrics']['40-Yard Dash'],
                                                            },
                                                            {
                                                                name: "SPEED",
                                                                hasData: !!player['Workout Metrics']['Speed Score'],
                                                            },
                                                            {
                                                                name: "BURST",
                                                                hasData: !!player['Workout Metrics']['Burst Score'],
                                                            },
                                                            {
                                                                name: "AGILITY",
                                                                hasData: !!player['Workout Metrics']['Agility Score'],
                                                            },
                                                            {
                                                                name: "CATCH",
                                                                hasData: !!player['Workout Metrics']['Catch Radius'],
                                                            },
                                                        ].map((entry, index) => (
                                                            <Cell
                                                                key={`cell-${index}`}
                                                                fill={entry.hasData ? "#9F0712" : "#D1D5DB"}
                                                            />
                                                        ))}
                                                        <LabelList
                                                            dataKey="displayValue"
                                                            position="top"
                                                            offset={8}
                                                            style={{ fontSize: '11px', fontWeight: 'bold' }}
                                                        />
                                                        <LabelList
                                                            dataKey="rank"
                                                            position="insideTop"
                                                            fill="white"
                                                            style={{ fontSize: '10px' }}
                                                        />
                                                    </Bar>
                                                    <XAxis
                                                        dataKey="name"
                                                        axisLine={false}
                                                        tickLine={false}
                                                        tick={{ fontSize: 10, fontWeight: '600' }}
                                                        height={40}
                                                        interval={0}
                                                    />
                                                </BarChart>
                                            </ChartContainer>
                                        </div>

                                        {/* Desktop Chart */}
                                        <div className="max-w-3xl hidden sm:block mx-auto">
                                            <ChartContainer config={chartConfig} className="h-[450px]">
                                                <BarChart
                                                    data={[
                                                        {
                                                            name: "40-YARD DASH",
                                                            fullName: "40-YARD DASH",
                                                            value: parseFloat(player['Workout Metrics']['40-Yard Dash']) || 0,
                                                            displayValue: player['Workout Metrics']['40-Yard Dash'] || 'N/A',
                                                            rank: player['Workout Metrics']['40-Yard Dash Rank'] || 10,
                                                            hasData: !!player['Workout Metrics']['40-Yard Dash'],
                                                        },
                                                        {
                                                            name: "SPEED SCORE",
                                                            fullName: "SPEED SCORE",
                                                            value: parseFloat(player['Workout Metrics']['Speed Score']) || 0,
                                                            displayValue: player['Workout Metrics']['Speed Score'] || 'N/A',
                                                            rank: player['Workout Metrics']['Speed Score Rank'] || 10,
                                                            hasData: !!player['Workout Metrics']['Speed Score'],
                                                        },
                                                        {
                                                            name: "BURST SCORE",
                                                            fullName: "BURST SCORE",
                                                            value: parseFloat(player['Workout Metrics']['Burst Score']) || 0,
                                                            displayValue: player['Workout Metrics']['Burst Score'] || 'N/A',
                                                            rank: player['Workout Metrics']['Burst Score Rank'] || 10,
                                                            hasData: !!player['Workout Metrics']['Burst Score'],
                                                        },
                                                        {
                                                            name: "AGILITY SCORE",
                                                            fullName: "AGILITY SCORE",
                                                            value: parseFloat(player['Workout Metrics']['Agility Score']) || 0,
                                                            displayValue: player['Workout Metrics']['Agility Score'] || 'N/A',
                                                            rank: player['Workout Metrics']['Agility Score Rank'] || 10,
                                                            hasData: !!player['Workout Metrics']['Agility Score'],
                                                        },
                                                        {
                                                            name: "CATCH RADIUS",
                                                            fullName: "CATCH RADIUS",
                                                            value: parseFloat(player['Workout Metrics']['Catch Radius']) || 0,
                                                            displayValue: player['Workout Metrics']['Catch Radius'] || 'N/A',
                                                            rank: player['Workout Metrics']['Catch Radius Rank'] || 10,
                                                            hasData: !!player['Workout Metrics']['Catch Radius'],
                                                        },
                                                    ]}
                                                    maxBarSize={90}
                                                >
                                                    <Bar dataKey="rank" radius={[4, 4, 0, 0]}>
                                                        {[
                                                            {
                                                                name: "40-YARD DASH",
                                                                hasData: !!player['Workout Metrics']['40-Yard Dash'],
                                                            },
                                                            {
                                                                name: "SPEED SCORE",
                                                                hasData: !!player['Workout Metrics']['Speed Score'],
                                                            },
                                                            {
                                                                name: "BURST SCORE",
                                                                hasData: !!player['Workout Metrics']['Burst Score'],
                                                            },
                                                            {
                                                                name: "AGILITY SCORE",
                                                                hasData: !!player['Workout Metrics']['Agility Score'],
                                                            },
                                                            {
                                                                name: "CATCH RADIUS",
                                                                hasData: !!player['Workout Metrics']['Catch Radius'],
                                                            },
                                                        ].map((entry, index) => (
                                                            <Cell
                                                                key={`cell-${index}`}
                                                                fill={entry.hasData ? "#9F0712" : "#D1D5DB"}
                                                            />
                                                        ))}
                                                        <LabelList
                                                            dataKey="displayValue"
                                                            position="top"
                                                            offset={10}
                                                            style={{ fontSize: '20px', fontWeight: 'bold' }}
                                                        />
                                                        <LabelList
                                                            dataKey="rank"
                                                            position="insideTop"
                                                            offset={10}
                                                            style={{ fontSize: '16px', textAlign: 'left', fill: 'white' }}
                                                        />
                                                    </Bar>
                                                    <XAxis
                                                        dataKey="name"
                                                        axisLine={false}
                                                        tickLine={false}
                                                        interval={0}
                                                        textAnchor="middle"
                                                        fontSize={16}
                                                        fontWeight={600}
                                                    />
                                                </BarChart>
                                            </ChartContainer>
                                        </div>
                                    </div>

                                </div>
                                {player?.['College Performance'] && (
                                    <div className="grid grid-cols-1 md:grid-cols-3 items-center justify-center gap-2">

                                        <div className="border border-gray-400 rounded p-2 flex flex-col justify-around">
                                            <div className="flex items-center justify-between text-lg">
                                                <h1>{player['College Performance']['College Dominator Rating']}</h1>
                                                <h2 className="mr-2">{player['College Performance']['College Dominator Rating Rank']}</h2>
                                            </div>
                                            <div className="flex items-end">
                                                <span className="text-lg font-semibold">College Dominator</span>
                                            </div>
                                        </div>

                                        <div className="border border-gray-400 rounded p-2 flex flex-col justify-around">
                                            <div className="flex items-center justify-between text-lg">
                                                <h1>{player['College Performance']['College Target Share']}%</h1>
                                                <h2 className="mr-2">{player['College Performance']['College Target Share Rank']}</h2>
                                            </div>
                                            <div className="flex items-end">
                                                <span className="text-lg font-semibold">College Target Share</span>
                                            </div>
                                        </div>



                                        <div className="border border-gray-400 rounded p-2 flex flex-col justify-around">
                                            <div className="flex items-center justify-between text-lg">
                                                <h1>{player['College Performance']['Breakout Age']}</h1>
                                                <h2 className="mr-2">{player['College Performance']['Breakout Age Rank']}</h2>
                                            </div>
                                            <div className="flex items-end">
                                                <span className="text-lg font-semibold">Breakout Age</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>



                        ) : (
                            <div className="rounded-xl p-8 shadow-xl border text-center">
                                <Dumbbell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-gray-600 mb-2">Workout Metrics Unavailable</h3>
                                <p className="text-gray-500">Detailed workout metrics are not available for this player.</p>
                            </div>
                        )}
                    </div>
                )

            case 'performance':
                // Generate available years (2019 onwards)
                const currentYear = new Date().getFullYear()
                const availableYears = Array.from({ length: currentYear - 2018 }, (_, i) => (currentYear - i).toString())

                // Get performance data for selected year
                const performanceData = performancePlayer?.['Performance Metrics']?.[selectedYear]

                return (
                    <div className="space-y-8">
                        <div>
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
                                <h2 className="text-3xl font-black mb-4 sm:mb-0">Performance Metrics</h2>

                                {/* Year Selector and Games Played */}
                                <div className="flex items-center gap-6">
                                    {performanceData && (
                                        <div className="flex items-center gap-2 bg-[#E64A30] text-white px-4 py-2 rounded-full text-sm">
                                            <span className="font-semibold">Games:</span>
                                            <span className="text-lg font-bold">{performanceData['Games']}</span>
                                        </div>
                                    )}

                                    <div className="flex items-center gap-3 bg-[#E64A30] text-white px-4 py-2 rounded-full text-sm relative">
                                        <label htmlFor="year-select" className="font-semibold">Season:</label>
                                        <select
                                            id="year-select"
                                            value={selectedYear}
                                            onChange={(e) => setSelectedYear(e.target.value)}
                                            className="appearance-none bg-transparent text-white text-sm font-medium focus:outline-none pr-6"
                                        >
                                            {availableYears.map(year => (
                                                <option key={year} value={year} className="text-black">
                                                    {year}
                                                </option>
                                            ))}
                                        </select>
                                        <ChevronDown size={16} className="absolute right-3 pointer-events-none text-white" />
                                    </div>
                                </div>
                            </div>

                            {/* Performance Metrics Display */}
                            {performanceData ? (
                                <div className="space-y-8">

                                    {/* Opportunity Section */}
                                    <div className="space-y-4">
                                        <h3 className="text-xl font-bold">Opportunity</h3>
                                        <div className="bg-white dark:bg-gray-800 rounded shadow-md overflow-hidden w-[360px] md:w-[640px] lg:w-full">
                                            <div className="overflow-x-auto orange-scroll w-[360px] md:w-[640px] lg:w-full">
                                                <table className="w-full">
                                                    <thead>
                                                        <tr className="bg-[#FFE6E2] dark:bg-[#3A3D48] text-center">
                                                            <th className="text-xs font-semibold p-3 text-[#1D212D] dark:text-[#C7C8CB]">TARGETS</th>
                                                            <th className="text-xs font-semibold p-3 text-[#1D212D] dark:text-[#C7C8CB]">TARGET SHARE</th>
                                                            <th className="text-xs font-semibold p-3 text-[#1D212D] dark:text-[#C7C8CB]">TARGET RATE</th>
                                                            <th className="text-xs font-semibold p-3 text-[#1D212D] dark:text-[#C7C8CB]">SNAP SHARE</th>
                                                            <th className="text-xs font-semibold p-3 text-[#1D212D] dark:text-[#C7C8CB]">SLOT SNAPS</th>
                                                            <th className="text-xs font-semibold p-3 text-[#1D212D] dark:text-[#C7C8CB]">ROUTES RUN</th>
                                                            <th className="text-xs font-semibold p-3 text-[#1D212D] dark:text-[#C7C8CB]">ROUTE PARTICIPATION</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        <tr className="bg-[#F6BCB2] dark:bg-[#262829] text-center">
                                                            <td className="p-3">
                                                                <div className="text-lg font-bold text-[#1D212D] dark:text-[#C7C8CB]">{performanceData['Targets']}</div>
                                                                <div className="text-xs text-[#1D212D] font-semibold dark:text-[#C7C8CB]">#{performanceData['Targets Rank']}</div>
                                                            </td>
                                                            <td className="p-3">
                                                                <div className="text-lg font-bold text-[#1D212D] dark:text-[#C7C8CB]">{parseFloat(performanceData['Target Share']).toFixed(2)}%</div>
                                                                <div className="text-xs text-[#1D212D] font-semibold dark:text-[#C7C8CB]">#{performanceData['Target Share Rank']}</div>
                                                            </td>
                                                            <td className="p-3">
                                                                <div className="text-lg font-bold text-[#1D212D] dark:text-[#C7C8CB]">{parseFloat(performanceData['Target Rate']).toFixed(2)}%</div>
                                                                <div className="text-xs text-[#1D212D] font-semibold dark:text-[#C7C8CB]">#{performanceData['Target Rate Rank']}</div>
                                                            </td>
                                                            <td className="p-3">
                                                                <div className="text-lg font-bold text-[#1D212D] dark:text-[#C7C8CB]">{parseFloat(performanceData['Snap Share']).toFixed(2)}%</div>
                                                                <div className="text-xs text-[#1D212D] font-semibold dark:text-[#C7C8CB]">#{performanceData['Snap Share Rank']}</div>
                                                            </td>
                                                            <td className="p-3">
                                                                <div className="text-lg font-bold text-[#1D212D] dark:text-[#C7C8CB]">{performanceData['Slot Snaps']}</div>
                                                                <div className="text-xs text-[#1D212D] font-semibold dark:text-[#C7C8CB]">#{performanceData['Slot Snaps Rank']}</div>
                                                            </td>
                                                            <td className="p-3">
                                                                <div className="text-lg font-bold text-[#1D212D] dark:text-[#C7C8CB]">{performanceData['Routes Run']}</div>
                                                                <div className="text-xs text-[#1D212D] font-semibold dark:text-[#C7C8CB]">#{performanceData['Routes Run Rank']}</div>
                                                            </td>
                                                            <td className="p-3">
                                                                <div className="text-lg font-bold text-[#1D212D] dark:text-[#C7C8CB]">{parseFloat(performanceData['Route Participation']).toFixed(2)}%</div>
                                                                <div className="text-xs text-[#1D212D] font-semibold dark:text-[#C7C8CB]">#{performanceData['Route Participation Rank']}</div>
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Opportunity Section 2 */}
                                    <div className="space-y-4">
                                        <h3 className="text-xl font-bold">Opportunity</h3>
                                        <div className="bg-white dark:bg-gray-800 rounded shadow-md overflow-hidden w-[360px] md:w-[640px] lg:w-full">
                                            <div className="overflow-x-auto orange-scroll w-[360px] md:w-[640px] lg:w-full">
                                                <table className="w-full">
                                                    <thead>
                                                        <tr className="bg-[#FFE6E2] dark:bg-[#3A3D48] text-center">
                                                            <th className="text-xs font-semibold p-3 text-[#1D212D] dark:text-[#C7C8CB]">AIR YARDS</th>
                                                            <th className="text-xs font-semibold p-3 text-[#1D212D] dark:text-[#C7C8CB]">AIR YARDS SHARE</th>
                                                            <th className="text-xs font-semibold p-3 text-[#1D212D] dark:text-[#C7C8CB]">AVERAGE TARGET DISTANCE (ADOT)</th>
                                                            <th className="text-xs font-semibold p-3 text-[#1D212D] dark:text-[#C7C8CB]">DEEP TARGETS</th>
                                                            <th className="text-xs font-semibold p-3 text-[#1D212D] dark:text-[#C7C8CB]">RED ZONE TARGETS</th>
                                                            <th className="text-xs font-semibold p-3 text-[#1D212D] dark:text-[#C7C8CB]">TARGET QUALITY RATING</th>
                                                            <th className="text-xs font-semibold p-3 text-[#1D212D] dark:text-[#C7C8CB]">CATCHABLE TARGET RATE</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        <tr className="bg-[#F6BCB2] dark:bg-[#262829] text-center">
                                                            <td className="p-3">
                                                                <div className="text-lg font-bold text-[#1D212D] dark:text-[#C7C8CB]">{performanceData['Air Yards']}</div>
                                                                <div className="text-xs font-semibold text-[#1D212D] dark:text-[#C7C8CB]">#{performanceData['Air Yards Rank']}</div>
                                                            </td>
                                                            <td className="p-3">
                                                                <div className="text-lg font-bold text-[#1D212D] dark:text-[#C7C8CB]">{formatNumber(performanceData['Air Yards Share'])}%</div>
                                                                <div className="text-xs font-semibold text-[#1D212D] dark:text-[#C7C8CB]">#{performanceData['Air Yards Share Rank']}</div>
                                                            </td>
                                                            <td className="p-3">
                                                                <div className="text-lg font-bold text-[#1D212D] dark:text-[#C7C8CB]">{formatNumber(performanceData['Average Target Distance'])}</div>
                                                                <div className="text-xs font-semibold text-[#1D212D] dark:text-[#C7C8CB]">#{performanceData['Average Target Distance Rank']}</div>
                                                            </td>
                                                            <td className="p-3">
                                                                <div className="text-lg font-bold text-[#1D212D] dark:text-[#C7C8CB]">{performanceData['Deep Targets']}</div>
                                                                <div className="text-xs font-semibold text-[#1D212D] dark:text-[#C7C8CB]">#{performanceData['Deep Targets Rank']}</div>
                                                            </td>
                                                            <td className="p-3">
                                                                <div className="text-lg font-bold text-[#1D212D] dark:text-[#C7C8CB]">{performanceData['Red Zone Targets']}</div>
                                                                <div className="text-xs font-semibold text-[#1D212D] dark:text-[#C7C8CB]">#{performanceData['Red Zone Targets Rank']}</div>
                                                            </td>
                                                            <td className="p-3">
                                                                <div className="text-lg font-bold text-[#1D212D] dark:text-[#C7C8CB]">{formatNumber(performanceData['Target Quality Rating'])}</div>
                                                                <div className="text-xs font-semibold text-[#1D212D] dark:text-[#C7C8CB]">#{performanceData['Target Quality Rating Rank']}</div>
                                                            </td>
                                                            <td className="p-3">
                                                                <div className="text-lg font-bold text-[#1D212D] dark:text-[#C7C8CB]">{formatNumber(performanceData['Catchable Target Rate'])}%</div>
                                                                <div className="text-xs font-semibold text-[#1D212D] dark:text-[#C7C8CB]">#{performanceData['Catchable Target Rate Rank']}</div>
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Productivity Section */}
                                    <div className="space-y-4">
                                        <h3 className="text-xl font-bold">Productivity</h3>
                                        <div className="bg-white dark:bg-gray-800 rounded shadow-md overflow-hidden w-[360px] md:w-[640px] lg:w-full">
                                            <div className="overflow-x-auto orange-scroll w-[360px] md:w-[640px] lg:w-full">
                                                <table className="w-full">
                                                    <thead>
                                                        <tr className="bg-[#FFE6E2] dark:bg-[#3A3D48] text-center">
                                                            <th className="text-xs font-semibold p-3 text-[#1D212D] dark:text-[#C7C8CB]">RECEPTIONS</th>
                                                            <th className="text-xs font-semibold p-3 text-[#1D212D] dark:text-[#C7C8CB]">RECEIVING YARDS</th>
                                                            <th className="text-xs font-semibold p-3 text-[#1D212D] dark:text-[#C7C8CB]">YARDS AFTER CATCH</th>
                                                            <th className="text-xs font-semibold p-3 text-[#1D212D] dark:text-[#C7C8CB]">UNREALIZED AIR YARDS</th>
                                                            <th className="text-xs font-semibold p-3 text-[#1D212D] dark:text-[#C7C8CB]">TOTAL TDS</th>
                                                            <th className="text-xs font-semibold p-3 text-[#1D212D] dark:text-[#C7C8CB]">FANTASY POINTS PER GAME</th>
                                                            <th className="text-xs font-semibold p-3 text-[#1D212D] dark:text-[#C7C8CB]">EXPECTED FANTASY POINTS PER GAME</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        <tr className="bg-[#F6BCB2] dark:bg-[#262829] text-center">
                                                            <td className="p-3">
                                                                <div className="text-lg font-bold text-[#1D212D] dark:text-[#C7C8CB]">{performanceData['Receptions']}</div>
                                                                <div className="text-xs font-semibold text-[#1D212D] dark:text-[#C7C8CB]">#{performanceData['Receptions Rank']}</div>
                                                            </td>
                                                            <td className="p-3">
                                                                <div className="text-lg font-bold text-[#1D212D] dark:text-[#C7C8CB]">{performanceData['Receiving Yards']}</div>
                                                                <div className="text-xs font-semibold text-[#1D212D] dark:text-[#C7C8CB]">#{performanceData['Receiving Yards Rank']}</div>
                                                            </td>
                                                            <td className="p-3">
                                                                <div className="text-lg font-bold text-[#1D212D] dark:text-[#C7C8CB]">{performanceData['Yards After Catch']}</div>
                                                                <div className="text-xs font-semibold text-[#1D212D] dark:text-[#C7C8CB]">#{performanceData['Yards After Catch Rank']}</div>
                                                            </td>
                                                            <td className="p-3">
                                                                <div className="text-lg font-bold text-[#1D212D] dark:text-[#C7C8CB]">{performanceData['Unrealized Air Yards']}</div>
                                                                <div className="text-xs font-semibold text-[#1D212D] dark:text-[#C7C8CB]">#{performanceData['Unrealized Air Yards Rank']}</div>
                                                            </td>
                                                            <td className="p-3">
                                                                <div className="text-lg font-bold text-[#1D212D] dark:text-[#C7C8CB]">{performanceData['Total Touchdowns']}</div>
                                                                <div className="text-xs font-semibold text-[#1D212D] dark:text-[#C7C8CB]">#{performanceData['Total Touchdowns Rank']}</div>
                                                            </td>
                                                            <td className="p-3">
                                                                <div className="text-lg font-bold text-[#1D212D] dark:text-[#C7C8CB]">{formatNumber(performanceData['Fantasy Points Per Game'])}</div>
                                                                <div className="text-xs font-semibold text-[#1D212D] dark:text-[#C7C8CB]">#{performanceData['Fantasy Points Per Game Rank']}</div>
                                                            </td>
                                                            <td className="p-3">
                                                                <div className="text-lg font-bold text-[#1D212D] dark:text-[#C7C8CB]">{formatNumber(performanceData['Expected Fantasy Points Per Game'])}</div>
                                                                <div className="text-xs font-semibold text-[#1D212D] dark:text-[#C7C8CB]">#{performanceData['Expected Fantasy Points Per Game Rank']}</div>
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Efficiency Section 1 */}
                                    <div className="space-y-4">
                                        <h3 className="text-xl font-bold">Efficiency</h3>
                                        <div className="bg-white dark:bg-gray-800 rounded shadow-md overflow-hidden w-[360px] md:w-[640px] lg:w-full">
                                            <div className="overflow-x-auto orange-scroll w-[360px] md:w-[640px] lg:w-full">
                                                <table className="w-full">
                                                    <thead>
                                                        <tr className="bg-[#FFE6E2] dark:bg-[#3A3D48] text-center">
                                                            <th className="text-xs font-semibold p-3 text-[#1D212D] dark:text-[#C7C8CB]">TARGET ACCURACY</th>
                                                            <th className="text-xs font-semibold p-3 text-[#1D212D] dark:text-[#C7C8CB]">YARDS PER ROUTE RUN</th>
                                                            <th className="text-xs font-semibold p-3 text-[#1D212D] dark:text-[#C7C8CB]">FORMATION ADJUSTED YARDS PER ROUTE RUN</th>
                                                            <th className="text-xs font-semibold p-3 text-[#1D212D] dark:text-[#C7C8CB]">YARDS PER TARGET</th>
                                                            <th className="text-xs font-semibold p-3 text-[#1D212D] dark:text-[#C7C8CB]">YARDS PER RECEPTION</th>
                                                            <th className="text-xs font-semibold p-3 text-[#1D212D] dark:text-[#C7C8CB]">YARDS PER TEAM PASS ATTEMPT</th>
                                                            <th className="text-xs font-semibold p-3 text-[#1D212D] dark:text-[#C7C8CB]">TRUE CATCH RATE</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        <tr className="bg-[#F6BCB2] dark:bg-[#262829] text-center">
                                                            <td className="p-3">
                                                                <div className="text-lg font-bold text-[#1D212D] dark:text-[#C7C8CB]">{formatNumber(performanceData['Target Accuracy'])}</div>
                                                                <div className="text-xs text-[#1D212D] font-semibold dark:text-[#C7C8CB]">#{performanceData['Target Accuracy Rank']}</div>
                                                            </td>
                                                            <td className="p-3">
                                                                <div className="text-lg font-bold text-[#1D212D] dark:text-[#C7C8CB]">{formatNumber(performanceData['Yards Per Route Run'])}</div>
                                                                <div className="text-xs text-[#1D212D] font-semibold dark:text-[#C7C8CB]">#{performanceData['Yards Per Route Run Rank']}</div>
                                                            </td>
                                                            <td className="p-3">
                                                                <div className="text-lg font-bold text-[#1D212D] dark:text-[#C7C8CB]">{formatNumber(performanceData['Formation Adjusted Yards Per Route Run'])}</div>
                                                                <div className="text-xs text-[#1D212D] font-semibold dark:text-[#C7C8CB]">#{performanceData['Formation Adjusted Yards Per Route Run Rank']}</div>
                                                            </td>
                                                            <td className="p-3">
                                                                <div className="text-lg font-bold text-[#1D212D] dark:text-[#C7C8CB]">{formatNumber(performanceData['Yards Per Target'])}</div>
                                                                <div className="text-xs text-[#1D212D] font-semibold dark:text-[#C7C8CB]">#{performanceData['Yards Per Target Rank']}</div>
                                                            </td>
                                                            <td className="p-3">
                                                                <div className="text-lg font-bold text-[#1D212D] dark:text-[#C7C8CB]">{formatNumber(performanceData['Yards Per Reception'])}</div>
                                                                <div className="text-xs text-[#1D212D] font-semibold dark:text-[#C7C8CB]">#{performanceData['Yards Per Reception Rank']}</div>
                                                            </td>
                                                            <td className="p-3">
                                                                <div className="text-lg font-bold text-[#1D212D] dark:text-[#C7C8CB]">{formatNumber(performanceData['Yards Per Team Pass Attempt'])}</div>
                                                                <div className="text-xs text-[#1D212D] font-semibold dark:text-[#C7C8CB]">#{performanceData['Yards Per Team Pass Attempt Rank']}</div>
                                                            </td>
                                                            <td className="p-3">
                                                                <div className="text-lg font-bold text-[#1D212D] dark:text-[#C7C8CB]">{formatNumber(performanceData['True Catch Rate'])}%</div>
                                                                <div className="text-xs text-[#1D212D] font-semibold dark:text-[#C7C8CB]">#{performanceData['True Catch Rate Rank']}</div>
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Efficiency Section 2 */}
                                    <div className="space-y-4">
                                        <h3 className="text-xl font-bold">Efficiency</h3>
                                        <div className="bg-white dark:bg-gray-800 rounded shadow-md overflow-hidden w-[360px] md:w-[640px] lg:w-full">
                                            <div className="overflow-x-auto orange-scroll w-[360px] md:w-[640px] lg:w-full">
                                                <table className="w-full">
                                                    <thead>
                                                        <tr className="bg-[#FFE6E2] dark:bg-[#3A3D48] text-center">
                                                            <th className="text-xs font-semibold p-3 text-[#1D212D] dark:text-[#C7C8CB]">TARGET SEPARATION</th>
                                                            <th className="text-xs font-semibold p-3 text-[#1D212D] dark:text-[#C7C8CB]">TARGET PREMIUM</th>
                                                            <th className="text-xs font-semibold p-3 text-[#1D212D] dark:text-[#C7C8CB]">DOMINATOR RATING</th>
                                                            <th className="text-xs font-semibold p-3 text-[#1D212D] dark:text-[#C7C8CB]">JUKE RATE</th>
                                                            <th className="text-xs font-semibold p-3 text-[#1D212D] dark:text-[#C7C8CB]">EXPLOSIVE RATING</th>
                                                            <th className="text-xs font-semibold p-3 text-[#1D212D] dark:text-[#C7C8CB]">DROPS</th>
                                                            <th className="text-xs font-semibold p-3 text-[#1D212D] dark:text-[#C7C8CB]">CONTESTED CATCH RATE</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        <tr className="bg-[#F6BCB2] dark:bg-[#262829] text-center">
                                                            <td className="p-3">
                                                                <div className="text-lg font-bold text-[#1D212D] dark:text-[#C7C8CB]">{formatNumber(performanceData['Target Separation'])}</div>
                                                                <div className="text-xs text-[#1D212D] font-semibold dark:text-[#C7C8CB]">#{performanceData['Target Separation Rank']}</div>
                                                            </td>
                                                            <td className="p-3">
                                                                <div className="text-lg font-bold text-[#1D212D] dark:text-[#C7C8CB]">{formatNumber(performanceData['Target Premium'])}</div>
                                                                <div className="text-xs text-[#1D212D] font-semibold dark:text-[#C7C8CB]">#{performanceData['Target Premium Rank']}</div>
                                                            </td>
                                                            <td className="p-3">
                                                                <div className="text-lg font-bold text-[#1D212D] dark:text-[#C7C8CB]">{formatNumber(performanceData['Dominator Rating'])}</div>
                                                                <div className="text-xs text-[#1D212D] font-semibold dark:text-[#C7C8CB]">#{performanceData['Dominator Rating Rank']}</div>
                                                            </td>
                                                            <td className="p-3">
                                                                <div className="text-lg font-bold text-[#1D212D] dark:text-[#C7C8CB]">{formatNumber(performanceData['Juke Rate'])}%</div>
                                                                <div className="text-xs text-[#1D212D] font-semibold dark:text-[#C7C8CB]">#{performanceData['Juke Rate Rank']}</div>
                                                            </td>
                                                            <td className="p-3">
                                                                <div className="text-lg font-bold text-[#1D212D] dark:text-[#C7C8CB]">N/A</div>
                                                                <div className="text-xs text-[#1D212D] font-semibold dark:text-[#C7C8CB]">#N/A</div>
                                                            </td>
                                                            <td className="p-3">
                                                                <div className="text-lg font-bold text-[#1D212D] dark:text-[#C7C8CB]">{performanceData['Drops']}</div>
                                                                <div className="text-xs text-[#1D212D] font-semibold dark:text-[#C7C8CB]">#{performanceData['Drops Rank']}</div>
                                                            </td>
                                                            <td className="p-3">
                                                                <div className="text-lg font-bold text-[#1D212D] dark:text-[#C7C8CB]">{formatNumber(performanceData['Contested Catch Conversion Rate'])}%</div>
                                                                <div className="text-xs text-[#1D212D] font-semibold dark:text-[#C7C8CB]">#{performanceData['Contested Catch Conversion Rate Rank']}</div>
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>


                                    {/* Efficiency Section 3 */}
                                    <div className="space-y-4">
                                        <h3 className="text-xl font-bold">Efficiency</h3>
                                        <div className="bg-white dark:bg-gray-800 rounded shadow-md overflow-hidden w-[360px] md:w-[640px] lg:w-full">
                                            <div className="overflow-x-auto orange-scroll w-[360px] md:w-[640px] lg:w-full">
                                                <table className="w-full">
                                                    <thead>
                                                        <tr className="bg-[#FFE6E2] dark:bg-[#3A3D48] text-center">
                                                            <th className="text-xs font-semibold p-3 text-[#1D212D] dark:text-[#C7C8CB]">
                                                                PRODUCTION PREMIUM
                                                            </th>
                                                            <th className="text-xs font-semibold p-3 text-[#1D212D] dark:text-[#C7C8CB]">
                                                                EXPECTED POINTS ADDED (EPA)
                                                            </th>
                                                            <th className="text-xs font-semibold p-3 text-[#1D212D] dark:text-[#C7C8CB]">
                                                                QB RATING PER TARGET
                                                            </th>
                                                            <th className="text-xs font-semibold p-3 text-[#1D212D] dark:text-[#C7C8CB]">
                                                                BEST BALL POINTS ADDED
                                                            </th>
                                                            <th className="text-xs font-semibold p-3 text-[#1D212D] dark:text-[#C7C8CB]">
                                                                FANTASY POINTS PER ROUTE RUN
                                                            </th>
                                                            <th className="text-xs font-semibold p-3 text-[#1D212D] dark:text-[#C7C8CB]">
                                                                FANTASY POINTS PER TARGET
                                                            </th>
                                                            <th className="text-xs font-semibold p-3 text-[#1D212D] dark:text-[#C7C8CB]">
                                                                TOTAL FANTASY POINTS
                                                            </th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        <tr className="bg-[#F6BCB2] dark:bg-[#262829] text-center">
                                                            <td className="p-3">
                                                                <div className="text-lg font-bold text-[#1D212D] dark:text-[#C7C8CB]">
                                                                    {formatNumber(performanceData["Production Premium"])}
                                                                </div>
                                                                <div className="text-xs font-semibold text-[#1D212D] dark:text-[#C7C8CB]">
                                                                    #{performanceData["Production Premium Rank"]}
                                                                </div>
                                                            </td>
                                                            <td className="p-3">
                                                                <div className="text-lg font-bold text-[#1D212D] dark:text-[#C7C8CB]">
                                                                    {formatNumber(performanceData["Expected Points Added"])}
                                                                </div>
                                                                <div className="text-xs font-semibold text-[#1D212D] dark:text-[#C7C8CB]">
                                                                    #{performanceData["Expected Points Added Rank"]}
                                                                </div>
                                                            </td>
                                                            <td className="p-3">
                                                                <div className="text-lg font-bold text-[#1D212D] dark:text-[#C7C8CB]">
                                                                    {formatNumber(performanceData["QB Rating When Targeted"])}
                                                                </div>
                                                                <div className="text-xs font-semibold text-[#1D212D] dark:text-[#C7C8CB]">
                                                                    #{performanceData["QB Rating When Targeted Rank"]}
                                                                </div>
                                                            </td>
                                                            <td className="p-3">
                                                                <div className="text-lg font-bold text-[#1D212D] dark:text-[#C7C8CB]">
                                                                    {formatNumber(performanceData["Best Ball Points Added"])}
                                                                </div>
                                                                <div className="text-xs font-semibold text-[#1D212D] dark:text-[#C7C8CB]">
                                                                    #{performanceData["Best Ball Points Added Rank"]}
                                                                </div>
                                                            </td>
                                                            <td className="p-3">
                                                                <div className="text-lg font-bold text-[#1D212D] dark:text-[#C7C8CB]">
                                                                    {formatNumber(performanceData["Fantasy Points Per Route Run"])}
                                                                </div>
                                                                <div className="text-xs font-semibold text-[#1D212D] dark:text-[#C7C8CB]">
                                                                    #{performanceData["Fantasy Points Per Route Run Rank"]}
                                                                </div>
                                                            </td>
                                                            <td className="p-3">
                                                                <div className="text-lg font-bold text-[#1D212D] dark:text-[#C7C8CB]">
                                                                    {formatNumber(performanceData["Fantasy Points Per Target"])}
                                                                </div>
                                                                <div className="text-xs font-semibold text-[#1D212D] dark:text-[#C7C8CB]">
                                                                    #{performanceData["Fantasy Points Per Target Rank"]}
                                                                </div>
                                                            </td>
                                                            <td className="p-3">
                                                                <div className="text-lg font-bold text-[#1D212D] dark:text-[#C7C8CB]">
                                                                    {formatNumber(performanceData["Total Fantasy Points"])}
                                                                </div>
                                                                <div className="text-xs font-semibold text-[#1D212D] dark:text-[#C7C8CB]">
                                                                    #{performanceData["Fantasy Points Rank"]}
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Zone vs Man Section */}
                                    <div className="space-y-4">
                                        <h3 className="text-xl font-bold">Zone vs Man</h3>
                                        <div className="bg-white dark:bg-gray-800 rounded shadow-md overflow-hidden w-[360px] md:w-[640px] lg:w-full">
                                            <div className="overflow-x-auto orange-scroll w-[360px] md:w-[640px] lg:w-full">
                                                <table className="w-full">
                                                    <thead>
                                                        <tr className="bg-[#FFE6E2] dark:bg-[#3A3D48] text-center">
                                                            <th className="text-xs font-semibold p-3 text-[#1D212D] dark:text-[#C7C8CB]">TOTAL ROUTE WINS</th>
                                                            <th className="text-xs font-semibold p-3 text-[#1D212D] dark:text-[#C7C8CB]">ROUTE WIN RATE</th>
                                                            <th className="text-xs font-semibold p-3 text-[#1D212D] dark:text-[#C7C8CB]">ROUTES VS MAN</th>
                                                            <th className="text-xs font-semibold p-3 text-[#1D212D] dark:text-[#C7C8CB]">WIN RATE VS MAN</th>
                                                            <th className="text-xs font-semibold p-3 text-[#1D212D] dark:text-[#C7C8CB]">TARGET RATE VS MAN</th>
                                                            <th className="text-xs font-semibold p-3 text-[#1D212D] dark:text-[#C7C8CB]">TARGET SEPARATION VS MAN</th>
                                                            <th className="text-xs font-semibold p-3 text-[#1D212D] dark:text-[#C7C8CB]">FANTASY POINTS PER TARGET VS MAN</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        <tr className="bg-[#F6BCB2] dark:bg-[#262829] text-center">
                                                            <td className="p-3">
                                                                <div className="text-lg font-bold text-[#1D212D] dark:text-[#C7C8CB]">{performanceData['Total Route Wins']}</div>
                                                                <div className="text-xs font-semibold text-[#1D212D] dark:text-[#C7C8CB]">#{performanceData['Total Route Wins Rank']}</div>
                                                            </td>
                                                            <td className="p-3">
                                                                <div className="text-lg font-bold text-[#1D212D] dark:text-[#C7C8CB]">{formatNumber(performanceData['Route Win Rate'])}%</div>
                                                                <div className="text-xs font-semibold text-[#1D212D] dark:text-[#C7C8CB]">#{performanceData['Route Win Rate Rank']}</div>
                                                            </td>
                                                            <td className="p-3">
                                                                <div className="text-lg font-bold text-[#1D212D] dark:text-[#C7C8CB]">{performanceData['Routes vs Man']}</div>
                                                                <div className="text-xs font-semibold text-[#1D212D] dark:text-[#C7C8CB]">#{performanceData['Routes vs Man Rank']}</div>
                                                            </td>
                                                            <td className="p-3">
                                                                <div className="text-lg font-bold text-[#1D212D] dark:text-[#C7C8CB]">{formatNumber(performanceData['Win Rate vs Man'])}%</div>
                                                                <div className="text-xs font-semibold text-[#1D212D] dark:text-[#C7C8CB]">#{performanceData['Win Rate vs Man Rank']}</div>
                                                            </td>
                                                            <td className="p-3">
                                                                <div className="text-lg font-bold text-[#1D212D] dark:text-[#C7C8CB]">{formatNumber(performanceData['Target Rate vs Man'])}%</div>
                                                                <div className="text-xs font-semibold text-[#1D212D] dark:text-[#C7C8CB]">#{performanceData['Target Rate vs Man Rank']}</div>
                                                            </td>
                                                            <td className="p-3">
                                                                <div className="text-lg font-bold text-[#1D212D] dark:text-[#C7C8CB]">{formatNumber(performanceData['Target Separation vs Man'])}</div>
                                                                <div className="text-xs font-semibold text-[#1D212D] dark:text-[#C7C8CB]">#{performanceData['Target Separation vs Man Rank']}</div>
                                                            </td>
                                                            <td className="p-3">
                                                                <div className="text-lg font-bold text-[#1D212D] dark:text-[#C7C8CB]">{formatNumber(performanceData['Fantasy Points Per Target vs Man'])}</div>
                                                                <div className="text-xs font-semibold text-[#1D212D] dark:text-[#C7C8CB]">#{performanceData['Fantasy Points Per Target vs Man Rank']}</div>
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>


                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <CircleGauge className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                    <h3 className="text-xl font-bold text-gray-600 mb-2">No Performance Data Available</h3>
                                    <p className="text-gray-500">Performance metrics are not available for {playerName} in {selectedYear}.</p>
                                    <p className="text-gray-500 mt-2">Try selecting a different year or check back later for updates.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )

            case 'news':
                // Helper function to render fantasy insight HTML
                const renderFantasyInsight = (fantasyInsight: string | null) => {
                    if (fantasyInsight) {
                        return <div dangerouslySetInnerHTML={{ __html: fantasyInsight }}></div>
                    }
                    return null
                }

                const currentYears = new Date().getFullYear()
                const availableYear = Array.from({ length: currentYears - 2018 }, (_, i) => (currentYears - i).toString())


                return (
                    <div className="space-y-6">
                        {/* Search Bar */}
                        {/* <div className="relative w-full mb-6 flex">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search news for this player"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="filter-input w-full pl-10 pr-4 py-3 rounded shadow-sm"
                            />

                            <select
                                id="year-select"
                                value={selectedYearForNuggets}
                                onChange={(e) => setSelectedYearForNuggets(e.target.value)}
                                className="px-4 py-2 mx-2 select border bg-card rounded text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-500"
                            >
                                {availableYear.map(year => (
                                    <option key={year} value={year}>{year}</option>
                                ))}
                            </select>
                        </div> */}
                        <div className='flex justify-center'>
                            <SearchBar
                                placeholder="Search any news that suits you"
                                size="md"
                                width="w-full"
                                buttonLabel="Search here"
                                onButtonClick={() => alert("Button clicked!")}
                                onChange={(val) => console.log(val)}
                                className="flex justify-center items-center"
                            />
                        </div>
                        {isLoadingNuggets ? (
                            <div className="space-y-6">
                                {[...Array(3)].map((_, i) => (
                                    <div key={i} className="rounded border shadow-lg overflow-hidden animate-pulse h-screen">
                                        <div>
                                            <div className="flex gap-4 mb-4">
                                                <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
                                                <div className="flex-1">
                                                    <div className="h-6 bg-gray-200 rounded mb-2"></div>
                                                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <div className="h-4 bg-gray-200 rounded"></div>
                                                <div className="h-4 bg-gray-200 rounded"></div>
                                                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : displayNuggets.length > 0 ? (
                            <div className="space-y-6">
                                {displayNuggets.map((nugget, index) => {
                                    const playerTeam = findTeamByKey(nugget.player.team || '')

                                    return (
                                        <div
                                            key={`${nugget.id}-${index}`}
                                            className="overflow-hidden grid grid-cols-6 md:grid-cols-12 border-b pb-4 border-[var(--color-gray)]"
                                        >
                                            {/* Player Headshot */}
                                            <div
                                                className="cursor-pointer border rounded-full p-0 w-15 h-15 flex items-center justify-center relative col-span-1"
                                                onClick={() => router.push(`/players/${nugget.player.id}`)}
                                            >
                                                <Image
                                                    src={getNuggetImageUrl(nugget.player.headshotPic) || '/default-player.jpg'}
                                                    alt={`${nugget.player.name} headshot`}
                                                    fill
                                                    className="rounded-full object-cover bg-background overflow-hidden"
                                                    loader={({ src }) => src}
                                                />
                                            </div>

                                            {/* Right Section */}
                                            <div className="col-span-5 md:col-span-11">
                                                {/* Header */}
                                                <div className="flex items-center gap-2 ml-4 mr-4 col-1">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2">
                                                            <Link href={`/players/${nugget.player.id}`}>
                                                                <h1 className="text-xl font-bold hover:text-[#E64A30] transition-colors">
                                                                    {nugget.player.name}
                                                                </h1>
                                                            </Link>
                                                            {playerTeam && (
                                                                <div className="flex items-center">
                                                                    <Image
                                                                        src={getTeamLogoUrl(playerTeam.logo) || ''}
                                                                        alt={`${playerTeam.name} logo`}
                                                                        width={32}
                                                                        height={24}
                                                                        className="object-contain"
                                                                        loader={({ src }) => src}
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
                                                </div>

                                                {/* Content */}
                                                <div className="mt-3 ml-4 dark:text-[#D2D6E2]">
                                                    <ReadMore id={nugget.id.toString()} text={nugget.content} amountOfCharacters={400} />
                                                </div>

                                                {/* Fantasy Insight */}
                                                {nugget.fantasyInsight && (
                                                    <div className="px-4 mt-2 dark:text-[#D2D6E2]">
                                                        <h1 className="font-semibold mt-0 text-[#E64A30]">Fantasy Insight:</h1>
                                                        {renderFantasyInsight(nugget.fantasyInsight)}
                                                    </div>
                                                )}

                                                {/* Footer: Source + Date */}
                                                <div className="bg-[var(--gray-background-color)] rounded-full px-3 py-2 flex flex-row items-center justify-between flex-nowrap gap-2 mr-5 ml-5 mt-2 dark:bg-[var(--dark-theme-color)]">

                                                    {/* Source */}
                                                    {nugget.sourceUrl && (
                                                        <div className="flex items-center gap-1 bg-[var(--light-orange-background-color)] rounded-full px-3 py-1.5 w-max max-w-[70%] dark:text-black">
                                                            <span className="font-semibold text-sm">Source:</span>
                                                            <Link
                                                                href={
                                                                    nugget.sourceUrl.startsWith('http://') || nugget.sourceUrl.startsWith('https://')
                                                                        ? nugget.sourceUrl
                                                                        : `https://${nugget.sourceUrl}`
                                                                }
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-left hover:text-[#E64A30] text-sm truncate"
                                                            >
                                                                {nugget.sourceName}
                                                            </Link>
                                                        </div>
                                                    )}

                                                    {/* Date */}
                                                    <div className="flex flex-row gap-2 items-center text-gray-400 whitespace-nowrap">
                                                        <Clock size={18} />
                                                        <h1 className="text-gray-400 text-sm">
                                                            {new Date(nugget.createdAt).toLocaleDateString('en-US', {
                                                                year: 'numeric',
                                                                month: 'short',
                                                                day: 'numeric',
                                                            })}
                                                        </h1>
                                                    </div>
                                                </div>


                                            </div>
                                        </div>

                                    )
                                })}
                            </div>
                        ) : (
                            <div className="rounded-sm p-8 shadow-xl border border-white/20 text-center">
                                <Newspaper className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-gray-600 mb-2">No News Available</h3>
                                <p className="text-gray-500 mb-6">{searchTerm ? `No news found for "${searchTerm}".` : `There are currently no news available for ${playerName}. Check back later for updates!`}</p>
                            </div>
                        )}
                    </div>
                )

            case 'season-stats':
                const seasonStats = performancePlayer?.['Performance Metrics'];
                const currentYearSeasonStats = new Date().getFullYear();
                const generatedYears = Array.from({ length: currentYearSeasonStats - 2023 }, (_, i) => (currentYearSeasonStats - i).toString());
                const yearsFromData = seasonStats ? Object.keys(seasonStats) : [];
                const combinedYears = Array.from(new Set([...generatedYears, ...yearsFromData]));

                // Sort the years in descending order to ensure the latest year is on top
                const sortedYears = combinedYears.sort((a, b) => Number(b) - Number(a));

                // Create an array of column names that have data in any year
                const columns = [
                    { name: 'Season', key: 'Season', type: 'number' },
                    { name: 'Games Played', key: 'Games', type: 'number' },
                    { name: 'Rush Attempts', key: 'Rush Attempts', type: 'number' },
                    { name: 'Rush Yards', key: 'Rushing Yards', type: 'number' },
                    { name: 'Yards Per Carry', key: 'Rush Yards / Rush Attempts', type: 'calculated' },
                    { name: 'Receptions', key: 'Receptions', type: 'number' },
                    { name: 'Receiving Yards', key: 'Receiving Yards', type: 'number' },
                    { name: 'Total Touchdowns', key: 'Total Touchdowns', type: 'calculated' },
                    { name: 'Air Yards', key: 'Air Yards', type: 'number' },
                    { name: 'Receiving TDs', key: 'Receiving TDs', type: 'number' },
                    { name: 'Fantasy Points Per Game', key: 'Fantasy Points Per Game', type: 'number' },
                ];

                // Function to check if column data exists in any year
                interface SeasonPerformanceMetrics {
                    Season?: number | string;
                    Games?: number | string;
                    'Rush Attempts'?: number | string;
                    'Rushing Yards'?: number | string;
                    'Rushing Touchdowns'?: number | string;
                    'Receptions'?: number | string;
                    'Receiving Yards'?: number | string;
                    'Receiving TDs'?: number | string;
                    'Air Yards'?: number | string;
                    'Fantasy Points Per Game'?: number | string;
                    [key: string]: any;  // Add index signature to allow any string key
                }

                interface SeasonStats {
                    [year: string]: SeasonPerformanceMetrics;
                }

                interface Column {
                    name: string;
                    key: string;
                    type: 'number' | 'text' | 'calculated';
                }

                const columnHasData = (columnKey: string): boolean => {
                    return sortedYears.some((year: string) => {
                        const yearData = ((seasonStats as unknown) as SeasonStats)[year];
                        return yearData && yearData[columnKey] != null;
                    });
                };

                // Filter out columns that have no data for all years
                const visibleColumns = columns.filter((column) => columnHasData(column.key));

                return (
                    <div className="space-y-8">
                        <div>
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
                                <h2 className="text-3xl font-black mb-4 sm:mb-0">Season Stats</h2>
                            </div>

                            {/* Performance Metrics Display */}
                            {seasonStats ? (
                                <div className="space-y-8">
                                    {/* Season Stats Table */}
                                    <div className="space-y-4">
                                        <div className="bg-white dark:bg-gray-800 rounded shadow-md overflow-hidden w-[360px] md:w-[640px] lg:w-full">
                                            <div className="overflow-x-auto orange-scroll w-full">
                                                <table className="w-full">
                                                    <thead>
                                                        <tr className="bg-[#0F0724] text-center">
                                                            {visibleColumns.map((column) => (
                                                                <th key={column.key} className="text-xs font-semibold p-3 text-[#1D212D] bg-[#F6BCB2] dark:bg-[#3A3D48] dark:text-[#C7C8CB]">
                                                                    {column.name}
                                                                </th>
                                                            ))}
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {/* Loop through all the years (sorted) and display data */}
                                                        {sortedYears.map((year) => {
                                                            const yearData = seasonStats?.[year] || {}; // Fallback to empty object if year data is missing

                                                            return (
                                                                <tr key={year} className="bg-[#FFE6E2] text-center dark:bg-[#262829]">
                                                                    {visibleColumns.map((column) => {
                                                                        let value: string | number = 'N/A'; // Default to 'N/A'
                                                                        if (column.key === 'Season') {
                                                                            value = year; // Display the year for the Season column
                                                                        } else if (column.type === 'calculated') {
                                                                            if (column.key === 'Rush Yards / Rush Attempts') {
                                                                                const rushAttempts = parseInt((yearData as any)['Rush Attempts']);
                                                                                const rushYards = parseInt((yearData as any)['Rushing Yards']);
                                                                                value = (rushAttempts > 0 && rushYards != null) ? (rushYards / rushAttempts).toFixed(2) : 'N/A';
                                                                            } else if (column.key === 'Total Touchdowns') {
                                                                                const rushingTouchdowns = parseInt(yearData['Rushing Touchdowns'] as string);
                                                                                const receivingTouchdowns = parseInt(yearData['Receiving TDs'] as string);
                                                                                value = (rushingTouchdowns != null || receivingTouchdowns != null) ? ( (isNaN(rushingTouchdowns) ? 0 : rushingTouchdowns) + (isNaN(receivingTouchdowns) ? 0 : receivingTouchdowns) ) : 'N/A';
                                                                            }
                                                                        } else {
                                                                            const rawValue = (yearData as SeasonPerformanceMetrics)[column.key];
                                                                            value = (rawValue != null && rawValue !== '') ? (typeof rawValue === 'string' ? parseInt(rawValue) || rawValue : rawValue) : 'N/A';
                                                                        }

                                                                        return (
                                                                            <td key={column.key} className="p-3 text-[#1D212D] dark:text-[#C7C8CB]">
                                                                                {value}
                                                                            </td>
                                                                        );
                                                                    })}
                                                                </tr>
                                                            );
                                                        })}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <CircleGauge className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                    <h3 className="text-xl font-bold text-gray-600 mb-2">No Performance Data Available</h3>
                                    <p className="text-gray-500">Performance metrics are not available for the selected player.</p>
                                    <p className="text-gray-500 mt-2">Try selecting a different year or check back later for updates.</p>
                                </div>
                            )}
                        </div>
                    </div>
                );

            case 'game-log':
                const gameLogs = performancePlayer?.['Game Logs']; // Game log data
               
                // Function to handle year change from the dropdown
                interface YearChangeEvent {
                    target: {
                        value: string;
                    }
                }

                const handleYearChange = (event: YearChangeEvent): void => {
                    setSelectedYear(event.target.value); // Set the selected year
                };

                // Get the selected year data
                const selectedYearData = (gameLogs?.[selectedYear] || {}) as Record<string, any>;

                // Create columns for the game log table
                const gameLogcolumns = [
                    { name: 'Week', key: 'week', type: 'number' },  // Updated to use 'week' key
                    { name: 'Opponent', key: 'Opponent', type: 'text' },
                    { name: 'Snap Share', key: 'Snap Share', type: 'text' },
                    { name: 'Carries', key: 'Carries', type: 'number' },
                    { name: 'Routes', key: 'Routes Run', type: 'number' },
                    { name: 'Targets', key: 'Targets', type: 'number' },
                    { name: 'Receptions', key: 'Receptions', type: 'number' },
                    { name: 'Total Yards', key: 'Total Yards', type: 'number' },
                    { name: 'Total Tds', key: 'Total Touchdowns', type: 'number' },
                    { name: 'Fantasy Points', key: 'Fantasy Points', type: 'number' },
                ];

                return (
                    <div className="space-y-8">
                        <div>
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
                                <h2 className="text-3xl font-black mb-4 sm:mb-0">Game Logs</h2>

                                {/* Dropdown for Year Selection */}
                                <select
                                    value={selectedYear}
                                    onChange={handleYearChange}
                                    className="px-4 py-2 select border bg-card rounded-full text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#E64A30]"
                                >
                                    {/* Sort the years in descending order */}
                                    {availableYearsDynamic.sort((a, b) => Number(b) - Number(a)).map((year) => (
                                        <option key={year} value={year}>
                                            {year}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Game Log Table */}
                            {selectedYearData ? (
                                <div className="space-y-8">
                                    <div className="space-y-4">
                                        <h3 className="text-xl font-bold">Game Log for {selectedYear}</h3>
                                        <div className="bg-white dark:bg-gray-800 rounded shadow-md overflow-hidden w-[360px] md:w-[640px] lg:w-full">
                                            <div className="overflow-x-auto w-full orange-scroll">
                                                <table className="w-full">
                                                    <thead>
                                                        <tr className="bg-[#0F0724] text-center">
                                                            {gameLogcolumns.map((column) => (
                                                                <th key={column.key} className="text-xs font-semibold p-3  bg-[#F6BCB2] text-[#1D212D] dark:bg-[#3A3D48] dark:text-white">
                                                                    {column.name}
                                                                </th>
                                                            ))}
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {/* Loop through all the game logs for the selected year */}
                                                        {Object.keys(selectedYearData).map((week) => {
                                                            const weekData = selectedYearData[week];

                                                            return (
                                                                <tr key={week} className="text-center bg-[#FFE6E2] dark:bg-[#262829]">
                                                                    {gameLogcolumns.map((column) => {
                                                                        let value = weekData[column.key] || '-'; // Default to '-' if no data

                                                                        // For the 'Week' column, we use the `week` variable directly
                                                                        if (column.key === 'week') {
                                                                            value = week;
                                                                        }

                                                                        return (
                                                                            <td key={column.key} className="p-3 text-[#1D212D] dark:text-white">
                                                                                {value}
                                                                            </td>
                                                                        );
                                                                    })}
                                                                </tr>
                                                            );
                                                        })}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <CircleGauge className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                    <h3 className="text-xl font-bold text-gray-600 mb-2">No Game Log Data Available</h3>
                                    <p className="text-gray-500">Game log data is not available for the selected year.</p>
                                    <p className="text-gray-500 mt-2">Try selecting a different year or check back later for updates.</p>
                                </div>
                            )}
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };



    return (
        <div>
            {/* Hero Section */}
            <div className="relative bg-[#F1F1F1] md:dark:bg-black text-white container m-2 rounded-3xl mx-auto overflow-x-hidden dark:bg-[#1A1A1A]">
                <div className="hidden md:flex flex-row items-center gap-12"> {/* Hidden on mobile, shown on md and up */}
                    {/* Player Image */}
                    <div
                        className="relative pl-6 bg-[linear-gradient(90deg,#E64A30_0%,#E64A30_50%,#F1F1F1_40%,#F1F1F1_100%)] dark:bg-[linear-gradient(90deg,#E64A30_0%,#E64A30_50%,#000000_40%,#000000_100%)]"
                    >
                        {/* Back triangles */}
                        <div className="absolute top-0 left-0 h-full w-full overflow-hidden pointer-events-none">
                            <div
                                className="absolute w-[720px] left-0 opacity-50 bg-[#F6BCB2] dark:bg-[#7B3F00]"
                                style={{
                                    height: '70%',
                                    top: '3rem',
                                    clipPath: 'polygon(52% 0%, 49% 100%, 55% 100%)',
                                    transform: 'translateX(-7px)',
                                }}
                            ></div>

                            <div
                                className="absolute w-[720px] left-0 opacity-50 bg-[#f8d2ca] dark:bg-[#5C1A00]"
                                style={{
                                    height: '60%',
                                    top: '7rem',
                                    clipPath: 'polygon(52% 0%, 49% 100%, 55% 100%)',
                                    transform: 'translateX(60px)',
                                }}
                            ></div>
                        </div>

                        {/* Player main image */}
                        <div className="absolute -top-20 left-5">
                            {playerTeam && (
                                <Image
                                    src={getTeamLogoUrl(playerTeam.logo) || '/default-player.jpg'}
                                    alt={playerName}
                                    width={360}
                                    height={360}
                                    className="overflow-visible"
                                    loader={({ src }) => src}
                                />
                            )}
                        </div>

                        <div className="w-auto h-full overflow-hidden relative">
                            <Image
                                src={playerImage}
                                alt={playerName}
                                width={520}
                                height={491}
                                className="object-cover"
                                loader={({ src }) => src}
                            />
                        </div>
                    </div>

                    {/* Player Info */}
                    <div className="flex flex-col justify-between text-left ml-12 flex-1 pr-8 py-6 bg-[#F1F1F1] dark:bg-black">
                        {/* Header: Name + ADP */}
                        <div className="flex items-center justify-start mb-3 gap-6">
                            <h1 className="text-4xl text-[#1D212D] dark:text-white">{playerName}</h1>

                            {player?.Core?.ADP && (
                                <div className="flex items-center gap-1 bg-[#F6BCB2] dark:bg-[#F6BCB2] text-black px-3 py-1 rounded-full text-sm">
                                    <Image src="/underdog.webp" alt="ADP" width={20} height={14} loader={({ src }) => src}/>
                                    <span className="font-xl">ADP: {player.Core.ADP}</span>
                                </div>
                            )}
                        </div>

                        {/* Team & Position Info */}
                        <div className="flex items-center gap-3 flex-wrap mb-4">
                            {playerTeam?.logo ? (
                                <div className="bg-[#E3E4E5] dark:bg-[#2C2C2C] rounded-full p-2 flex items-center justify-center">
                                    <Image
                                        src={getTeamLogoUrl(playerTeam.logo) || ''}
                                        alt="Team Logo"
                                        width={27}
                                        height={21}
                                        loader={({ src }) => src}
                                    />
                                </div>
                            ) : (
                                <div className="bg-[#E3E4E5] dark:bg-[#2C2C2C] rounded-full px-3 py-1 flex items-center justify-center">
                                    <span className="text-[#3A3D48] dark:text-gray-300 text-sm font-semibold">Free Agent</span>
                                </div>
                            )}
                            <p className="text-[#3A3D48] dark:text-gray-300 text-xl">
                                {teamName || ''} {player?.Core['ADP Year']} &nbsp; {player?.Core?.Position}
                            </p>
                        </div>

                        {/* Follow Button */}
                        <div className="mb-5">
                            <button
                                className={`text-white text-md px-10 py-1 rounded-full transition-colors hover:cursor-pointer ${isFollowing
                                    ? 'bg-[#E64A30] border border-[#E64A30]'
                                    : 'bg-[#E64A30] hover:bg-[#E64A30]/80 border border-[#E64A30]'
                                    }`}
                                onClick={(e) => {
                                    e.preventDefault();
                                    toggleFollow(playerId, isFollowing);
                                }}
                            >
                                {loadingFollow ? (
                                    <>
                                        <Loader2 className="w-3 h-3 animate-spin inline-block mr-2" />
                                        Loading...
                                    </>
                                ) : isFollowing ? (
                                    'FOLLOWING'
                                ) : (
                                    'Follow'
                                )}
                            </button>
                        </div>

                        {/* Stats Section */}
                        <div className="border-t border-[#C7C8CB] dark:border-gray-700 pt-4">
                            <div className="grid grid-cols-3 gap-3 w-fit">
                                {[
                                    `HT/WT: ${player?.Core?.Height || '-'} , ${player?.Core?.Weight || '-'}`,
                                    `Age: ${player?.Core?.Age || '-'}`,
                                    `Draft Info: ${player?.Core?.['Draft Pick'] || '-'} (${player?.Core?.['Draft Year'] || '-'})`,
                                    // `Status: ${player?.Core?.Active ? 'Active' : 'Inactive'}`,
                                    `College: ${player?.Core?.College || '-'}`,
                                ].map((text, i) => (
                                    <div
                                        key={i}
                                        className="bg-[#E3E4E5] dark:bg-gray-800 rounded-full px-4 py-1.5 text-sm text-[#1D212D] dark:text-gray-300 text-center flex items-center justify-center min-w-[180px] h-8"
                                    >
                                        {text}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Mobile View */}
                <div className="flex flex-col md:hidden items-center gap-8 relative w-full">

                    {/* Background & Gradient Section (Mobile only) */}
                    <div
                        className="relative md:hidden bg-[linear-gradient(90deg,#E64A30_0%,#E64A30_50%,#F1F1F1_40%,#F1F1F1_100%)] dark:bg-[linear-gradient(90deg,#E64A30_0%,#E64A30_50%,#000000_40%,#000000_100%)]"

                    >
                        {/* Back triangles */}
                        <div className="absolute top-0 left-0 h-full w-full overflow-hidden pointer-events-none">
                            <div
                                className="bg-[#F6BCB2] absolute w-[720px] left-0"
                                style={{
                                    height: '70%',
                                    top: '3rem',
                                    clipPath: 'polygon(52% 0%, 49% 100%, 55% 100%)',
                                    transform: 'translateX(-80px)',
                                    opacity: 0.5,
                                }}
                            ></div>
                            <div
                                className="bg-[#f8d2ca] absolute w-[720px] left-0"
                                style={{
                                    height: '60%',
                                    top: '7rem',
                                    clipPath: 'polygon(52% 0%, 49% 100%, 55% 100%)',
                                    transform: 'translateX(-40px)',
                                    opacity: 0.5,
                                }}
                            ></div>
                        </div>

                        {/* Team logo */}
                        <div className="absolute -top-12 left-5">
                            {playerTeam && (
                                <Image
                                    src={getTeamLogoUrl(playerTeam.logo) || '/default-player.jpg'}
                                    alt={playerName}
                                    width={220}
                                    height={220}
                                    className="overflow-visible"
                                    loader={({ src }) => src}
                                />
                            )}
                        </div>

                        {/* Player Image */}
                        <div className="relative w-full flex justify-center">
                            <Image
                                src={playerImage}
                                alt={playerName}
                                width={520}
                                height={491}
                                className="object-cover"
                                loader={({ src }) => src}
                            />
                        </div>
                    </div>


                    {/* Player Info Section */}
                    <div className="flex flex-col justify-between text-left md:ml-12 flex-1 pr-4 md:pr-8 py-6">

                        {/* Header: Name + ADP */}
                        <div className="flex items-center justify-start mb-3 gap-4">
                            <h1 className="text-3xl md:text-4xl text-[#1D212D] dark:text-white">{playerName}</h1>
                            {player?.Core?.ADP && (
                                <div className="flex items-center gap-1 bg-[#F6BCB2] text-black px-3 py-1 rounded-full text-sm dark:text-[#1D212D]">
                                    <Image src="/underdog.webp" alt="ADP" width={20} height={14} loader={({ src }) => src}/>
                                    <span className="font-xl">ADP: {player.Core.ADP}</span>
                                </div>
                            )}
                        </div>

                        {/* Team & Position */}
                        <div className="flex items-center gap-3 flex-wrap mb-4">
                            {playerTeam?.logo ? (
                                <div className="bg-[#E3E4E5] dark:bg-[#2C2C2C] rounded-full p-2 flex items-center justify-center">
                                    <Image
                                        src={getTeamLogoUrl(playerTeam.logo) || ''}
                                        alt="Team Logo"
                                        width={27}
                                        height={21}
                                        loader={({ src }) => src}
                                    />
                                </div>
                            ) : (
                                <div className="bg-[#E3E4E5] dark:bg-[#2C2C2C] rounded-full px-3 py-1 flex items-center justify-center">
                                    <span className="text-[#3A3D48] dark:text-gray-300 text-sm font-semibold">Free Agent</span>
                                </div>
                            )}
                            <p className="text-[#3A3D48] text-lg md:text-xl dark:text-[#C7C8CB]">
                                {teamName || ''} {player?.Core['ADP Year']} &nbsp; {player?.Core?.Position}
                            </p>
                        </div>

                        {/* Follow Button */}
                        <div className="mb-5">
                            <button
                                className={`text-white text-md px-10 py-1 rounded-full transition-colors hover:cursor-pointer ${isFollowing
                                    ? 'bg-[#E64A30] border border-[#E64A30]'
                                    : 'bg-[#E64A30] hover:bg-[#E64A30]/80 border border-[#E64A30]'
                                    }`}
                                onClick={(e) => {
                                    e.preventDefault()
                                    toggleFollow(playerId, isFollowing)
                                }}
                            >
                                {loadingFollow ? (
                                    <>
                                        <Loader2 className="w-3 h-3 animate-spin inline-block mr-2" />
                                        Loading...
                                    </>
                                ) : isFollowing ? (
                                    'FOLLOWING'
                                ) : (
                                    'Follow'
                                )}
                            </button>
                        </div>

                        {/* Stats Section */}
                        <div className="border-t border-[#C7C8CB] pt-4 dark:border-none">
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 w-fit">
                                {[
                                    `HT/WT: ${player?.Core?.Height || '-'} , ${player?.Core?.Weight || '-'}`,
                                    `Age: ${player?.Core?.Age || '-'}`,
                                    `Draft Info: ${player?.Core?.['Draft Pick'] || '-'} (${player?.Core?.['Draft Year'] || '-'})`,
                                    `Status: ${player?.Core?.Active ? 'Active' : 'Inactive'}`,
                                    `College: ${player?.Core?.College || '-'}`,
                                ].map((text, i) => (
                                    <div
                                        key={i}
                                        className="bg-[#E3E4E5] dark:bg-[#262829] rounded-full px-4 py-1.5 text-sm text-[#1D212D] dark:text-[#C7C8CB] text-center flex items-center justify-center min-w-[150px] h-8"
                                    >
                                        {text}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            {/* Main Content */}
            <div className="container mx-auto px-4 pb-16">
                <div className="grid lg:grid-cols-1 gap-8">
                    {/* Player Details and Tabs */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Fantasy Outlook Section */}
                        {(basicPlayer?.fantasyOutlook || player?.Core?.['Fantasy Outlook']) && (
                            <div className="rounded-3xl border border-[#C7C8CB] dark:border-gray-700 overflow-hidden">
                                <div className="bg-[#E64A30] px-6 py-2">
                                    <h2 className="text-2xl text-white flex items-center gap-2">
                                        Fantasy Outlook
                                    </h2>
                                </div>
                                <div className="p-6">
                                    <p className="text-base leading-relaxed whitespace-pre-line">
                                        {basicPlayer?.fantasyOutlook || player?.Core?.['Fantasy Outlook']}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Tabs Section */}
                        <div className="rounded border border-white/20 shadow-xl overflow-hidden mt-12">
                            {/* Tab Navigation */}
                            <div className="border-b border-white/20">
                                <nav className="flex space-x-0 p-2 border border-[#C7C8CB] rounded-full bg-white/5">
                                    {tabs.map((tab) => {
                                        const IconComponent = tab.icon
                                        const isActive = activeTab === tab.id
                                        return (
                                            <button
                                                key={tab.id}
                                                onClick={() => setActiveTab(tab.id)}
                                                className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 text-xl transition-all rounded-full 
                                                ${isActive
                                                        ? 'bg-[#E64A30] text-white'
                                                        : 'text-[#72757C] hover:bg-[#E3E4E5] hover:text-[#1D212D]'
                                                    }`}
                                            >
                                                <IconComponent className="w-4 h-4" />
                                                <span className="hidden sm:inline">{tab.label}</span>
                                            </button>
                                        )
                                    })}
                                </nav>
                            </div>

                            {/* Tab Content */}
                            <div className="p-4">
                                {renderTabContent()}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-center gap-2 mt-10 mb-4">
                <h1 className="text-sm">Data Powered By PlayerProfiler </h1>
                <Link
                    href='https://playerprofiler.com/'
                    target="_blank"
                >
                    <Image
                        src="/pp-logo.png"
                        width={30}
                        height={30}
                        alt="pp=logo"
                        loader={({ src }) => src}
                    />
                </Link>
            </div>
        </div >
    )
} 