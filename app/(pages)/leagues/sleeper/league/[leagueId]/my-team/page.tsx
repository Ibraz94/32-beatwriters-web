"use client";

import { useSleeperRosters, useSleeperLeagueUsers, useSleeperPlayers, usePlayerStats, useNFLState, useSleeperLeague } from "@/lib/hooks/useSleeper";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { ArrowLeft, Loader2, TrendingUp, TrendingDown, User } from "lucide-react";
import { useMemo, useState } from "react";
import PlayerAvatar from "@/app/components/sleeper/PlayerAvatar";

export default function MyTeamPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const leagueId = params.leagueId as string;
  
  // Get user ID from URL params (you'd pass this when navigating)
  const userId = searchParams?.get("userId");

  const { data: league } = useSleeperLeague(leagueId);
  const { data: nflState } = useNFLState();
  const [selectedWeek, setSelectedWeek] = useState(nflState?.week || 1);
  
  const { data: rosters, isLoading: rostersLoading } = useSleeperRosters(leagueId);
  const { data: users, isLoading: usersLoading } = useSleeperLeagueUsers(leagueId);
  const { data: players, isLoading: playersLoading } = useSleeperPlayers();
  const { data: weekStats, isLoading: statsLoading } = usePlayerStats(
    league?.season || "2024",
    selectedWeek
  );

  const myRoster = useMemo(() => {
    if (!rosters || !users || !userId) return null;
    
    const user = users.find((u) => u.user_id === userId);
    if (!user) return null;
    
    return rosters.find((r) => r.owner_id === userId);
  }, [rosters, users, userId]);

  const teamData = useMemo(() => {
    if (!myRoster || !players || !weekStats) return null;

    const starters = myRoster.starters?.map((playerId) => {
      const player = players[playerId];
      const stats = weekStats[playerId] || {};
      
      return {
        playerId,
        name: player?.full_name || playerId,
        position: player?.position || "N/A",
        team: player?.team || "FA",
        points: stats.pts_ppr || 0,
        projected: 0, // Would come from projections API
        stats: stats,
        isStarter: true,
      };
    }) || [];

    const bench = myRoster.players
      ?.filter((id) => !myRoster.starters?.includes(id))
      .map((playerId) => {
        const player = players[playerId];
        const stats = weekStats[playerId] || {};
        
        return {
          playerId,
          name: player?.full_name || playerId,
          position: player?.position || "N/A",
          team: player?.team || "FA",
          points: stats.pts_ppr || 0,
          projected: 0,
          stats: stats,
          isStarter: false,
        };
      }) || [];

    const starterPoints = starters.reduce((sum, p) => sum + p.points, 0);
    const benchPoints = bench.reduce((sum, p) => sum + p.points, 0);

    return {
      starters,
      bench,
      starterPoints,
      benchPoints,
      totalPoints: starterPoints + benchPoints,
    };
  }, [myRoster, players, weekStats]);

  const user = useMemo(() => {
    if (!users || !userId) return null;
    return users.find((u) => u.user_id === userId);
  }, [users, userId]);

  const isLoading = rostersLoading || usersLoading || playersLoading || statsLoading;

  if (!userId && !isLoading) {
    return (
      <div className="container mx-auto px-2 py-2 h-full">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Select Your Team</h2>
          <p className="text-gray-600 dark:text-[#C7C8CB] mb-8">
            Choose which team you want to view
          </p>
        </div>

        {users && rosters && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto">
            {users.map((user) => {
              const roster = rosters.find((r) => r.owner_id === user.user_id);
              if (!roster) return null;

              return (
                <Link
                  key={user.user_id}
                  href={`/leagues/sleeper/league/${leagueId}/my-team?userId=${user.user_id}`}
                  className="bg-white dark:bg-[#262829] border border-[#262829]/20 rounded-md shadow-sm p-6 hover:shadow-sm transition-shadow cursor-pointer"
                >
                  <div className="flex items-center gap-4 mb-4">
                    {user.avatar && (
                      <img
                        src={`https://sleepercdn.com/avatars/thumbs/${user.avatar}`}
                        alt={user.display_name}
                        className="w-16 h-16 rounded-full"
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="font-bold text-lg">
                        {user.metadata?.team_name || user.display_name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-[#C7C8CB]">
                        {user.display_name}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex-1 text-center">
                      <p className="text-xs text-gray-600 dark:text-[#C7C8CB] mb-1">Record</p>
                      <p className="font-bold">
                        {roster.settings.wins}-{roster.settings.losses}
                      </p>
                    </div>
                    <div className="flex-1 text-center">
                      <p className="text-xs text-gray-600 dark:text-[#C7C8CB] mb-1">Points</p>
                      <p className="font-bold text-[#E64A30]">
                        {roster.settings.fpts?.toFixed(1)}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-3 py-8 h-screen">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-[#E64A30]" />
          <p className="text-gray-600 dark:text-[#C7C8CB] text-xl">Loading team data...</p>
        </div>
      </div>
    );
  }

  if (!myRoster || !teamData) {
    return (
      <div className="container mx-auto px-3 py-8 h-screen">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 text-xl mb-4">
            Team not found
          </p>
          <Link
            href={`/leagues/sleeper/league/${leagueId}`}
            className="text-[#E64A30] hover:text-[#d43d24] font-medium"
          >
            ← Back to League
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Team Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-4 mb-4">
          {user?.avatar && (
            <img
              src={`https://sleepercdn.com/avatars/thumbs/${user.avatar}`}
              alt={user.display_name}
              className="w-16 h-16 rounded-full"
            />
          )}
          <div>
            <h2 className="text-xl font-bold">
              {user?.metadata?.team_name || user?.display_name || "My Team"}
            </h2>
            <p className="text-gray-600 dark:text-[#C7C8CB]">
              Week {selectedWeek}
            </p>
          </div>
        </div>

        {/* Week Selector */}
        <div className="flex items-center justify-center gap-2 mt-4">
          <label className="text-sm font-medium text-gray-600 dark:text-[#C7C8CB]">
            Select Week:
          </label>
          <select
            value={selectedWeek}
            onChange={(e) => setSelectedWeek(Number(e.target.value))}
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#3A3D48] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#E64A30]"
          >
            {Array.from({ length: 18 }, (_, i) => i + 1).map((week) => (
              <option key={week} value={week}>
                Week {week}
              </option>
            ))}
          </select>
        </div>

          {/* Score Summary */}
          <div className="flex justify-center gap-4 mt-6">
            <div className="bg-white dark:bg-[#262829] border border-[#262829]/20 rounded-md shadow-sm p-6 min-w-[200px]">
              <p className="text-sm text-gray-600 dark:text-[#C7C8CB] mb-2">Total Points</p>
              <p className="text-4xl font-bold text-[#E64A30]">
                {teamData.totalPoints.toFixed(2)}
              </p>
            </div>
            <div className="bg-white dark:bg-[#262829] border border-[#262829]/20 rounded-md shadow-sm p-6 min-w-[200px]">
              <p className="text-sm text-gray-600 dark:text-[#C7C8CB] mb-2">Record</p>
              <p className="text-4xl font-bold">
                {myRoster.settings.wins}-{myRoster.settings.losses}
              </p>
            </div>
          </div>
        </div>

        {/* Starters */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-green-500" />
              Starters
            </h2>
            <div className="text-xl font-bold text-green-600 dark:text-green-400">
              {teamData.starterPoints.toFixed(2)} pts
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {teamData.starters.map((player) => (
              <div
                key={player.playerId}
                className="bg-white dark:bg-[#262829] rounded-md shadow-sm p-5 border border-[#262829]/20"
              >
                <div className="flex items-center gap-3 mb-3">
                  <PlayerAvatar playerName={player.name} playerId={player.playerId} size="md" />
                  <div className="flex-1">
                    <h3 className="font-bold text-lg">{player.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-[#C7C8CB]">
                      {player.position} • {player.team}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-[#E64A30]">
                      {player.points.toFixed(1)}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-[#C7C8CB]">pts</p>
                  </div>
                </div>

                {/* Quick Stats */}
                {player.stats && Object.keys(player.stats).length > 0 && (
                  <div className="grid grid-cols-3 gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
                    {player.stats.pass_yd && (
                      <div className="text-center">
                        <p className="text-xs text-gray-600 dark:text-[#C7C8CB]">Pass YD</p>
                        <p className="font-semibold">{player.stats.pass_yd}</p>
                      </div>
                    )}
                    {player.stats.pass_td && (
                      <div className="text-center">
                        <p className="text-xs text-gray-600 dark:text-[#C7C8CB]">Pass TD</p>
                        <p className="font-semibold">{player.stats.pass_td}</p>
                      </div>
                    )}
                    {player.stats.rush_yd && (
                      <div className="text-center">
                        <p className="text-xs text-gray-600 dark:text-[#C7C8CB]">Rush YD</p>
                        <p className="font-semibold">{player.stats.rush_yd}</p>
                      </div>
                    )}
                    {player.stats.rec && (
                      <div className="text-center">
                        <p className="text-xs text-gray-600 dark:text-[#C7C8CB]">REC</p>
                        <p className="font-semibold">{player.stats.rec}</p>
                      </div>
                    )}
                    {player.stats.rec_yd && (
                      <div className="text-center">
                        <p className="text-xs text-gray-600 dark:text-[#C7C8CB]">Rec YD</p>
                        <p className="font-semibold">{player.stats.rec_yd}</p>
                      </div>
                    )}
                    {player.stats.rec_td && (
                      <div className="text-center">
                        <p className="text-xs text-gray-600 dark:text-[#C7C8CB]">Rec TD</p>
                        <p className="font-semibold">{player.stats.rec_td}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Bench */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <User className="w-6 h-6 text-gray-500" />
              Bench
            </h2>
            <div className="text-xl font-bold text-gray-600 dark:text-gray-400">
              {teamData.benchPoints.toFixed(2)} pts
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {teamData.bench.map((player) => (
              <div
                key={player.playerId}
                className="bg-white dark:bg-[#262829] border border-[#262829]/20 rounded-md shadow-sm p-4"
              >
                <div className="flex items-center gap-2 mb-2">
                  <PlayerAvatar playerName={player.name} playerId={player.playerId} size="sm" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm truncate">{player.name}</h3>
                    <p className="text-xs text-gray-600 dark:text-[#C7C8CB]">
                      {player.position} • {player.team}
                    </p>
                  </div>
                </div>
                <div className="text-center pt-2 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-xl font-bold text-[#E64A30]">
                    {player.points.toFixed(1)}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-[#C7C8CB]">points</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </>
  );
}
