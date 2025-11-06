"use client";

import { useSleeperRosters, useSleeperLeagueUsers, useSleeperPlayers, useSleeperLeague } from "@/lib/hooks/useSleeper";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Loader2, Trophy, TrendingUp, BarChart3, ArrowLeftIcon, Users as UsersIcon } from "lucide-react";

export default function LeagueRosterPage() {
  const params = useParams();
  const leagueId = params.leagueId as string;

  const { data: league, isLoading: leagueLoading } = useSleeperLeague(leagueId);
  const { data: rosters, error, isLoading } = useSleeperRosters(leagueId);
  const { data: users, isLoading: usersLoading } = useSleeperLeagueUsers(leagueId);
  const { data: players, isLoading: playersLoading } = useSleeperPlayers();

  const getPlayerName = (playerId: string) => {
    if (!players || !players[playerId]) return playerId;
    return players[playerId].full_name || playerId;
  };

  const getTeamName = (ownerId: string) => {
    if (!users) return "Team";
    const user = users.find((u) => u.user_id === ownerId);
    return user?.metadata?.team_name || user?.display_name || "Team";
  };

  const allLoading = isLoading || usersLoading || playersLoading || leagueLoading;

  if (allLoading) {
    return (
      <div className="container mx-auto px-3 py-8">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-[#E64A30]" />
          <p className="text-gray-600 dark:text-[#C7C8CB] text-xl">Loading league data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-3 py-8">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 text-xl mb-4">Failed to load rosters.</p>
          <Link
            href="/leagues/sleeper"
            className="text-[#E64A30] hover:text-[#d43d24] font-medium"
          >
          <ArrowLeftIcon/> Back to Search
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      {!rosters || rosters.length === 0 ? (
          <div className="text-center py-12">
            <Trophy className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600 dark:text-[#C7C8CB] text-lg">
              No rosters found for this league.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {rosters
              .sort((a, b) => (b.settings?.fpts || 0) - (a.settings?.fpts || 0))
              .map((roster, index) => (
                <div
                  key={roster.roster_id}
                  className="bg-white dark:bg-[#262829] p-6 rounded-xl shadow-lg"
                >
                  <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-4 gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#E3E4E5] dark:bg-[#3A3D48] font-bold text-lg">
                        {index + 1}
                      </div>
                      <div>
                        <h2 className="text-xl font-bold font-oswald">
                          {getTeamName(roster.owner_id)}
                        </h2>
                        <p className="text-sm text-gray-600 dark:text-[#C7C8CB]">
                          Roster #{roster.roster_id}
                        </p>
                      </div>
                    </div>
                    {roster.settings && (
                      <div className="flex gap-4">
                        <div className="text-center px-4 py-2 bg-[#E3E4E5] dark:bg-[#3A3D48] rounded-lg">
                          <p className="text-xs text-gray-600 dark:text-[#C7C8CB] mb-1">Record</p>
                          <p className="font-bold text-lg">
                            {roster.settings.wins}-{roster.settings.losses}
                            {roster.settings.ties > 0 && `-${roster.settings.ties}`}
                          </p>
                        </div>
                        <div className="text-center px-4 py-2 bg-[#E3E4E5] dark:bg-[#3A3D48] rounded-lg">
                          <p className="text-xs text-gray-600 dark:text-[#C7C8CB] mb-1">Points</p>
                          <p className="font-bold text-lg text-[#E64A30]">
                            {roster.settings.fpts?.toFixed(1)}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mb-4">
                    <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-green-500" />
                      Starters ({roster.starters?.length || 0})
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {roster.starters?.map((playerId) => (
                        <Link
                          key={playerId}
                          href={`/leagues/sleeper/player/${playerId}`}
                          className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800 px-3 py-1.5 rounded-full text-xs font-medium hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors cursor-pointer"
                          title={`View ${getPlayerName(playerId)} stats`}
                        >
                          {getPlayerName(playerId)}
                        </Link>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold mb-3 text-gray-600 dark:text-[#C7C8CB]">
                      Bench ({(roster.players?.length || 0) - (roster.starters?.length || 0)})
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {roster.players
                        ?.filter(id => !roster.starters?.includes(id))
                        .map((playerId) => (
                          <Link
                            key={playerId}
                            href={`/leagues/sleeper/player/${playerId}`}
                            className="bg-[#E3E4E5] dark:bg-[#3A3D48] text-gray-700 dark:text-[#C7C8CB] px-3 py-1.5 rounded-full text-xs font-medium hover:bg-gray-300 dark:hover:bg-[#4A4D58] transition-colors cursor-pointer"
                            title={`View ${getPlayerName(playerId)} stats`}
                          >
                            {getPlayerName(playerId)}
                          </Link>
                        ))}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
    </>
  );
}
