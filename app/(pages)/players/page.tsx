"use client"

export const dynamic = 'force-dynamic'

import { useState, useEffect, Suspense } from "react"
import Link from "next/link"
import Image from "next/image"
import { Users, Search, X, Loader2, ArrowLeft, ArrowRight } from "lucide-react"
import { useGetPlayersQuery, getImageUrl, Player, useFollowPlayerMutation, useUnfollowPlayerMutation } from '@/lib/services/playersApi'
import { useGetTeamsQuery, getTeamLogoUrl } from '@/lib/services/teamsApi'
import { useSearchParams, useRouter } from "next/navigation"
import { useAuth } from '@/lib/hooks/useAuth'
import { useToast } from '@/app/components/Toast'
import SearchBar from "@/components/ui/search"

// PlayerCard component to handle individual player rendering with hooks
function PlayerCard({ player, currentPage, teamsData, isFollowing, onToggleFollow, isAuthenticated, isLoading }: {
    player: Player;
    currentPage: number;
    teamsData: any;
    isFollowing: boolean;
    onToggleFollow: () => void;
    isAuthenticated: boolean;
    isLoading: boolean;
}) {
    const imageUrl = getImageUrl(player.headshotPic)

    // Helper function to find team by abbreviation or name
    const findTeamByKey = (teamKey: string) => {
        if (!teamsData?.teams || !teamKey) return null

        return teamsData.teams.find((team: any) =>
            team.abbreviation?.toLowerCase() === teamKey.toLowerCase() ||
            team.name?.toLowerCase() === teamKey.toLowerCase() ||
            team.city?.toLowerCase() === teamKey.toLowerCase()
        )
    }

    const playerTeam = findTeamByKey(player.team || '')

    return (
        <Link
            href={`/players/${player.id}?page=${currentPage}`}
            className="rounded-xl hover:shadow-lg transition-all duration-200 hover:scale-101 overflow-hidden p-1 bg-white dark:bg-[#262829] shadow-lg"
        >
            {/* Player Image */}
            <div className="relative h-48 bg-[#E3E4E5] p-4 rounded-lg dark:bg-black">
                <Image
                    src={imageUrl || '/default-player.jpg'}
                    alt={player.name}
                    fill
                    className="object-cover"
                    onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.src = '/default-player.jpg'
                    }}
                />
            </div>

            {/* Player Info */}
            <div className="p-2">
                <div className="flex justify-between">
                    <h3 className="text-2xl leading-tight font-oswald">
                        {player.name}
                    </h3>
                </div>

                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            {playerTeam && (
                                <Image
                                    src={getTeamLogoUrl(playerTeam.logo) || ''}
                                    alt={`${playerTeam.name} logo`}
                                    width={24}
                                    height={18}
                                    className='object-contain'
                                />
                            )}
                            <h1 className="text-sm font-oswald">{player.team || 'Free Agent'}  {player.position}</h1>

                        </div>
                    </div>
                    <button
                        className={`w-full text-xs border bg-[#E64A30] text-white text-center px-5 py-2 rounded-full transition-colors hover:cursor-pointer flex items-center justify-center gap-1 ${isFollowing ? 'bg-[#E64A30] hover:bg-gray-500' : 'hover:bg-gray-500 dark:border-none'
                            }`}
                        onClick={e => {
                            e.preventDefault(); // Prevent Link navigation
                            onToggleFollow();
                        }}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-3 h-3 animate-spin" />
                                <span>...</span>
                            </>
                        ) : (
                            isFollowing ? 'Following' : 'Follow'
                        )}
                    </button>

                </div>
            </div>
        </Link>
    )
}

function PlayersContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { isAuthenticated } = useAuth();
    const { showToast } = useToast();

    const [searchTerm, setSearchTerm] = useState("");
    const [selectedPosition, setSelectedPosition] = useState("all");
    const [selectedConference, setSelectedConference] = useState("all");
    const [page, setPage] = useState(() => {
        const pageFromUrl = searchParams?.get("page");
        return pageFromUrl ? parseInt(pageFromUrl, 10) : 1;
    });



    // Track follow state for each player
    const [followedPlayers, setFollowedPlayers] = useState<{ [id: string]: boolean }>({});
    const [loadingFollow, setLoadingFollow] = useState<{ [id: string]: boolean }>({});

    const [followPlayer] = useFollowPlayerMutation();
    const [unfollowPlayer] = useUnfollowPlayerMutation();

    // Teams query
    const { data: teamsData, isLoading: isLoadingTeams } = useGetTeamsQuery()
    // Fetch players from the server
    const { data: playersResponse, isLoading: playersLoading, error: playersError, refetch: refetchPlayers } = useGetPlayersQuery({
        page,
        limit: 12,
        pageSize: 12,
        search: searchTerm || undefined,
        position: selectedPosition !== "all" ? selectedPosition : undefined,
        conference: selectedConference !== "all" ? selectedConference : undefined,
    });

    const updateURL = (newPage?: number, newSearch?: string, newPosition?: string, newConference?: string) => {
        const params = new URLSearchParams()

        const currentPage = newPage ?? page
        const currentSearch = newSearch ?? searchTerm
        const currentPosition = newPosition ?? selectedPosition
        const currentConference = newConference ?? selectedConference

        if (currentPage > 1) params.set('page', currentPage.toString())
        if (currentSearch) params.set('search', currentSearch)
        if (currentPosition !== "all") params.set('position', currentPosition)
        if (currentConference !== "all") params.set('conference', currentConference)

        const newURL = params.toString() ? `?${params.toString()}` : '/players'
        router.replace(newURL, { scroll: false })
    }

    const handlePageChange = (newPage: number) => {
        setPage(newPage)
        updateURL(newPage, searchTerm, selectedPosition, selectedConference)
        // Scroll to top when page changes
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const clearAllFilters = () => {
        setSearchTerm("")
        setSelectedPosition("all")
        setSelectedConference("all")
        const newPage = 1
        setPage(newPage)
        updateURL(newPage, "", "all", "all")
    }

    // Initialize from URL parameters on mount
    useEffect(() => {
        const urlPage = searchParams?.get('page')
        const urlSearch = searchParams?.get('search')
        const urlPosition = searchParams?.get('position')
        const urlConference = searchParams?.get('conference')

        if (urlPage) setPage(parseInt(urlPage, 10))
        if (urlSearch) setSearchTerm(urlSearch)
        if (urlPosition) setSelectedPosition(urlPosition)
        if (urlConference) setSelectedConference(urlConference)
    }, [searchParams])

    // Handle search term changes with debouncing
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (searchTerm !== (searchParams?.get('search') || '')) {
                setPage(1) // Reset to first page when searching
                updateURL(1, searchTerm, selectedPosition, selectedConference)
            }
        }, 500) // 500ms debounce

        return () => clearTimeout(timeoutId)
    }, [searchTerm])

    // Handle filter changes (position and conference)
    useEffect(() => {
        const currentPosition = searchParams?.get('position') || 'all'
        const currentConference = searchParams?.get('conference') || 'all'

        if (selectedPosition !== currentPosition || selectedConference !== currentConference) {
            setPage(1) // Reset to first page when filters change
            updateURL(1, searchTerm, selectedPosition, selectedConference)
        }
    }, [selectedPosition, selectedConference])

    // Set the initial followed players on load
    useEffect(() => {
        if (playersResponse?.data?.players) {
            const initialFollowedPlayers = playersResponse.data.players.reduce((acc: any, player: any) => {
                acc[player.id] = player.isFollowed || false; // Use player follow status directly
                return acc;
            }, {});
            setFollowedPlayers(initialFollowedPlayers);
        }
    }, [playersResponse]);

    useEffect(() => {
        refetchPlayers();
    }
        , [page, searchTerm, selectedPosition, selectedConference]);


    // Toggle follow/unfollow
    const toggleFollow = async (playerId: string, isPlayerFollowed: boolean) => {
        if (!isAuthenticated) {
            showToast("Please log in to follow players.", "warning");
            return;
        }

        // Optimistic UI update
        setLoadingFollow((prev) => ({ ...prev, [playerId]: true }));

        try {
            if (isPlayerFollowed) {
                await unfollowPlayer(playerId).unwrap();
                showToast("Player unfollowed successfully!", "success");
            } else {
                await followPlayer(playerId).unwrap();
                showToast("Player followed successfully!", "success");
            }

            // Update followed players state for immediate UI feedback
            setFollowedPlayers((prev) => ({
                ...prev,
                [playerId]: !prev[playerId], // Toggle the follow state
            }));

            // Re-fetch the players data after the follow/unfollow operation
            refetchPlayers();

        } catch (error: any) {
            console.error("Error toggling follow status:", error);
            // Revert state in case of error
            setFollowedPlayers((prev) => ({
                ...prev,
                [playerId]: isPlayerFollowed, // Revert back to the previous state
            }));

            if (error?.status === 401 || error?.data?.message?.includes("Authentication required")) {
                showToast("Please log in to follow players.", "warning");
            } else {
                showToast("Failed to update follow status. Please try again.", "error");
            }
        } finally {
            setLoadingFollow((prev) => ({ ...prev, [playerId]: false }));
        }
    };

    // Loading state
    if (playersLoading) {
        return (
            <section className="container mx-auto max-w-7xl px-4 py-8">
                <div className="text-center mb-8">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">All Players</h1>
                    <p className="text-xl max-w-4xl mx-auto mb-6">Loading players...</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {Array.from({ length: 12 }).map((_, index) => (
                        <div key={index} className="animate-pulse">
                            <div className="bg-gray-300 rounded-lg h-48 mb-4"></div>
                            <div className="h-4 bg-gray-300 rounded mb-2"></div>
                            <div className="h-3 bg-gray-300 rounded mb-2"></div>
                            <div className="h-3 bg-gray-300 rounded w-3/4"></div>
                        </div>
                    ))}
                </div>
            </section>
        );
    }

    // Error state
    if (playersError) {
        return (
            <section className="container mx-auto max-w-7xl px-4 py-8">
                <div className="text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">All Players</h1>
                    <p className="text-xl text-red-600 mb-4">Failed to load players</p>
                    <p className="text-gray-600">Please try again later.</p>
                </div>
            </section>
        );
    }

    // Player list
    const players = playersResponse?.data?.players || [];
    const totalPages = playersResponse?.data?.pagination?.totalPages || 0;

    return (
        <div>
            {/* Gray Background Section */}
            <section className="container mx-auto max-w-7xl px-4 py-8">
                <div className="text-center mb-8">
                    <h1 className="text-2xl leading-8 mb-4 md:text-5xl md:leading-14">All Players</h1>
                </div>

                <div className='flex justify-center mb-10'>
                    <SearchBar
                        placeholder="Search Players"
                        size="md"
                        width="w-full md:w-1/2"
                        buttonLabel="Search here"
                        onButtonClick={() => alert("Button clicked!")}
                        onChange={(val) => console.log(val)}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {players.map((player) => (
                        <PlayerCard
                            key={player.id}
                            player={player}
                            currentPage={page}
                            teamsData={teamsData}
                            isFollowing={followedPlayers[player.id]}
                            onToggleFollow={() => toggleFollow(player.id.toString(), followedPlayers[player.id])}
                            isAuthenticated={isAuthenticated}
                            isLoading={loadingFollow[player.id] || false}
                        />
                    ))}
                </div>

                {players.length === 0 && (
                    <div className="text-center py-12">
                        <h3 className="text-xl font-semibold mb-2">No players found</h3>
                        <p className="mb-4">Try adjusting your search criteria or filters</p>
                        <button
                            onClick={clearAllFilters}
                            className="bg-red-800 text-white px-6 py-2 rounded-lg hover:bg-red-900 transition-colors"
                        >
                            Clear Filters
                        </button>
                    </div>
                )}
            </section>

            {/* Black Background Pagination Section */}
            {totalPages > 1 && (
                <div className="bg-transparent dark:bg-black py-6 mt-6">
                    <div className="flex justify-center">
                        <div className="flex gap-2">
                            <button
                                onClick={() => handlePageChange(Math.max(1, page - 1))}
                                disabled={page === 1}
                                className="px-3 py-2 rounded-full border-none disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transition-all text-[#72757C] border-gray-500 bg-[#F1F2F2] dark:bg-[#262829] dark:text-[#C7C8CB]"
                            >
                                <ArrowLeft size={18}/>
                            </button>

                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                const pageNum = Math.max(1, Math.min(totalPages - 4, page - 2)) + i
                                return (
                                    <button
                                        key={pageNum}
                                        onClick={() => handlePageChange(pageNum)}
                                        className={`px-4 py-2 rounded-full border transition-all bg-[#262829] ${pageNum === page
                                                ? 'dark:bg-[#E64A30] dark:text-white border-[#E64A30] bg-[#E3E4E5]'
                                                : 'text-[#72757C] hover:scale-105 bg-[#E3E4E5] border-none dark:border-gray-600 dark:bg-[#262829] dark:text-[#C7C8CB]'
                                            }`}
                                    >
                                        {pageNum}
                                    </button>
                                )
                            })}

                            <button
                                onClick={() => handlePageChange(Math.min(totalPages, page + 1))}
                                disabled={page === totalPages}
                                className="flex items-center justify-center gap-2 px-4 py-2 rounded-full border bg-[#E64A30] text-white dark:text-black dark:border-none font-medium 
             disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transition-all"
                            >
                                Next
                                <ArrowRight size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>

    );
}
export default function Players() {
    return (
        <Suspense fallback={
            <section className="container mx-auto max-w-7xl px-4 py-8">
                <div className="text-center mb-8">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">
                        All <span className="text-red-800">Players</span>
                    </h1>
                    <p className="text-xl max-w-4xl mx-auto mb-6">
                        Loading players...
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {Array.from({ length: 12 }).map((_, index) => (
                        <div key={index} className="animate-pulse">
                            <div className="bg-gray-300 rounded-lg h-48 mb-4"></div>
                            <div className="h-4 bg-gray-300 rounded mb-2"></div>
                            <div className="h-3 bg-gray-300 rounded mb-2"></div>
                            <div className="h-3 bg-gray-300 rounded w-3/4"></div>
                        </div>
                    ))}
                </div>
            </section>
        }>
            <PlayersContent />
        </Suspense>
    )
}
