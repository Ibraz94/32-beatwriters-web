"use client";

import { useSleeperMatchups, useSleeperLeagueUsers, useSleeperRosters, useNFLState, useSleeperPlayers, usePlayerStats, useSleeperLeague, usePlayerProjections } from "@/lib/hooks/useSleeper";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Loader2, ChevronLeft, ChevronRight, ChevronDown, ChevronUp } from "lucide-react";
import { useState, useMemo } from "react";
import PlayerAvatar from "@/app/components/sleeper/PlayerAvatar";

export default function LeagueMatchupsPage() {
  const params = useParams();
  const leagueId = params.leagueId as string;

  const { data: league } = useSleeperLeague(leagueId);
  const { data: nflState } = useNFLState();
  const [selectedWeek, setSelectedWeek] = useState(nflState?.week || 1);
  const [expandedMatchup, setExpandedMatchup] = useState<number | null>(null);

  const { data: matchups, isLoading: matchupsLoading } = useSleeperMatchups(leagueId, selectedWeek);
  const { data: users, isLoading: usersLoading } = useSleeperLeagueUsers(leagueId);
  const { data: rosters, isLoading: rostersLoading } = useSleeperRosters(leagueId);
  const { data: players, isLoading: playersLoading } = useSleeperPlayers();

  // Use league season for stats
  const statsSeason = league?.season || "2024";
  const currentWeek = nflState?.week || 9;

  // Fetch both stats and projections
  const { data: weekStatsData, isLoading: statsLoading } = usePlayerStats(statsSeason, selectedWeek);
  const { data: weekProjectionsData, isLoading: projectionsLoading } = usePlayerProjections(statsSeason, selectedWeek);

  // Use stats if available and has data, otherwise use projections
  const hasStatsData = weekStatsData && Object.keys(weekStatsData).length > 0;
  const hasProjectionsData = weekProjectionsData && Object.keys(weekProjectionsData).length > 0;

  const isProjectedWeek = selectedWeek > currentWeek || !hasStatsData;
  const playerData = hasStatsData ? weekStatsData : (hasProjectionsData ? weekProjectionsData : weekStatsData);

  const matchupPairs = useMemo(() => {
    if (!matchups || !users || !rosters || !players || !playerData) {
      return [];
    }

    // Check if data is actually loaded (not just an empty object)
    const dataKeys = Object.keys(playerData);
    if (dataKeys.length === 0) {
      return [];
    }

    const pairs: any[] = [];
    const matchupMap = new Map();

    matchups.forEach((matchup) => {
      const roster = rosters.find((r) => r.roster_id === matchup.roster_id);
      const user = users.find((u) => u.user_id === roster?.owner_id);

      // Use roster starters instead of matchup starters (which may be '0' for future seasons)
      const starterIds = roster?.starters || matchup.starters || [];

      // Get player details - use playerData (stats or projections)
      const playerDetails = starterIds.map((playerId: string) => {
        const player = players[playerId];
        // API returns string keys, so use playerId directly
        const playerStats = playerData[playerId];

        // Use pts_ppr from API (stats or projections)
        const playerPoints = playerStats?.pts_ppr || 0;

        return {
          playerId,
          name: player?.full_name || playerId,
          position: player?.position || 'N/A',
          team: player?.team || 'FA',
          points: playerPoints,
          isProjected: isProjectedWeek,
        };
      });

      // Calculate total points from player stats
      const totalPoints = playerDetails.reduce((sum, p) => sum + p.points, 0);

      const teamData = {
        roster_id: matchup.roster_id,
        matchup_id: matchup.matchup_id,
        points: totalPoints,
        team_name: user?.metadata?.team_name || user?.display_name || "Team",
        avatar: user?.avatar,
        players: playerDetails,
      };

      if (!matchupMap.has(matchup.matchup_id)) {
        matchupMap.set(matchup.matchup_id, []);
      }
      matchupMap.get(matchup.matchup_id).push(teamData);
    });

    matchupMap.forEach((teams) => {
      if (teams.length === 2) {
        const [team1, team2] = teams;
        pairs.push({
          matchup_id: team1.matchup_id,
          team1,
          team2,
          winner: team1.points > team2.points ? team1.roster_id : team2.roster_id,
        });
      }
    });

    return pairs.sort((a, b) => a.matchup_id - b.matchup_id);
  }, [matchups, users, rosters, players, playerData, isProjectedWeek]);

  const isLoading = matchupsLoading || usersLoading || rostersLoading || playersLoading || statsLoading || projectionsLoading;

  const handleWeekChange = (direction: 'prev' | 'next') => {
    if (direction === 'prev' && selectedWeek > 1) {
      setSelectedWeek(selectedWeek - 1);
    } else if (direction === 'next' && selectedWeek < 18) {
      setSelectedWeek(selectedWeek + 1);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-3 py-8 h-screen">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-[#E64A30]" />
          <p className="text-gray-600 dark:text-[#C7C8CB] text-xl">Loading matchups...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="text-center mb-8">
        <h2 className="text-xl font-bold mb-4">Week {selectedWeek}</h2>

        {/* Week Selector */}
        <div className="flex items-center justify-center gap-4 mt-6">
          <button
            onClick={() => handleWeekChange('prev')}
            disabled={selectedWeek === 1}
            className="p-2 rounded-full bg-white dark:bg-[#262829] shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-[#3A3D48] transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <div className="flex gap-2">
            {[...Array(18)].map((_, i) => {
              const week = i + 1;
              return (
                <button
                  key={week}
                  onClick={() => setSelectedWeek(week)}
                  className={`w-10 h-10 rounded-full text-sm transition-colors ${selectedWeek === week
                    ? 'bg-[#E64A30] text-white'
                    : 'bg-white dark:bg-[#262829] hover:bg-gray-100 dark:hover:bg-[#3A3D48]'
                    }`}
                >
                  {week}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => handleWeekChange('next')}
            disabled={selectedWeek === 18}
            className="p-2 rounded-full bg-white dark:bg-[#262829] shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-[#3A3D48] transition-colors"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto space-y-6">
        {matchupPairs.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-[#262829] rounded-xl shadow-lg p-8">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-xl font-bold mb-4">No Matchups Available</h3>
            <p className="text-gray-600 dark:text-[#C7C8CB] mb-6">
              Week {selectedWeek} doesn't have matchup data yet
            </p>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 max-w-md mx-auto text-left">
              <h4 className="font-bold mb-3 text-blue-900 dark:text-blue-300">💡 Possible Reasons:</h4>
              <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
                <li>• Games haven't been played yet for this week</li>
                <li>• The season hasn't reached Week {selectedWeek}</li>
                <li>• Current NFL Week: <strong>{nflState?.week || 'Loading...'}</strong></li>
                <li>• League Season: <strong>{league?.season || 'Loading...'}</strong></li>
              </ul>

              <div className="mt-4 pt-4 border-t border-blue-200 dark:border-blue-700">
                <p className="font-semibold mb-2">Try this:</p>
                <button
                  onClick={() => setSelectedWeek(1)}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Go to Week 1
                </button>
              </div>
            </div>
          </div>
        ) : (
          matchupPairs.map((matchup) => (
            <div
              key={matchup.matchup_id}
              className="bg-white dark:bg-[#262829] rounded-md overflow-hidden"
            >
              {/* Matchup Header */}
              <div className="p-6">
                <div className="flex items-center justify-between gap-4">
                  {/* Team 1 */}
                  <div className={`flex-1 flex items-center gap-4 p-4 rounded-md ${matchup.winner === matchup.team1.roster_id
                    ? 'bg-orange-50 dark:bg-orange-900/20 border border-[#E64A30]/30'
                    : 'bg-gray-50 dark:bg-[#262829] border border-[#E64A30]/30'
                    }`}>
                    {matchup.team1.avatar && (
                      <img
                        src={`https://sleepercdn.com/avatars/thumbs/${matchup.team1.avatar}`}
                        alt={matchup.team1.team_name}
                        className="w-16 h-16 rounded-full"
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="font-bold text-lg">{matchup.team1.team_name}</h3>
                      <p className="text-3xl font-bold text-[#E64A30]">
                        {matchup.team1.points.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {/* VS */}
                  <div className="text-2xl font-bold text-gray-300">VS</div>

                  {/* Team 2 */}
                  <div className={`flex-1 flex items-center gap-4 p-4 rounded-md ${matchup.winner === matchup.team2.roster_id
                    ? 'bg-orange-50 dark:bg-orange-900/20 border border-[#E64A30]/30'
                    : 'bg-gray-50 dark:bg-[#262829] border border-[#E64A30]/30'
                    }`}>
                    <div className="flex-1 text-right">
                      <h3 className="font-bold text-lg">{matchup.team2.team_name}</h3>
                      <p className="text-3xl font-bold text-[#E64A30]">
                        {matchup.team2.points.toFixed(2)}
                      </p>
                    </div>
                    {matchup.team2.avatar && (
                      <img
                        src={`https://sleepercdn.com/avatars/thumbs/${matchup.team2.avatar}`}
                        alt={matchup.team2.team_name}
                        className="w-16 h-16 rounded-full"
                      />
                    )}
                  </div>
                </div>

                {/* Expand Button */}
                <button
                  onClick={() => setExpandedMatchup(
                    expandedMatchup === matchup.matchup_id ? null : matchup.matchup_id
                  )}
                  className="w-full mt-4 py-2 text-sm font-medium text-[#E64A30] hover:text-[#d43d24] flex items-center justify-center gap-2"
                >
                  {expandedMatchup === matchup.matchup_id ? (
                    <>
                      <ChevronUp className="w-4 h-4" />
                      Hide Player Details
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-4 h-4" />
                      Show Player Details
                    </>
                  )}
                </button>
              </div>

              {/* Player Breakdown - Side by Side by Position */}
              {expandedMatchup === matchup.matchup_id && (
                <div className="border-gray-200 dark:border-gray-700 p-6 bg-gray-50 dark:bg-[#1A1A1A]">
                  <div className="space-y-3">
                    {matchup.team1.players?.map((player1: any, index: number) => {
                      const player2 = matchup.team2.players?.[index];
                      return (
                        <div key={index} className="grid grid-cols-2 gap-4">
                          {/* Team 1 Player */}
                          <Link
                            href={`/leagues/sleeper/player/${player1.playerId}`}
                            className="flex items-center justify-between p-3 bg-white dark:bg-[#262829] border border-[#262829]/20 rounded-md shadow-sm"
                          >
                            <div className="flex items-center gap-3 flex-1">
                              <PlayerAvatar
                                playerName={player1.name}
                                playerId={player1.playerId}
                                size="sm"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-sm truncate">{player1.name}</p>
                                <p className="text-xs text-gray-600 dark:text-[#C7C8CB]">
                                  {player1.position} • {player1.team}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-[#E64A30]">
                                {player1.points.toFixed(1)}
                              </p>
                            </div>
                          </Link>

                          {/* Team 2 Player */}
                          {player2 && (
                            <Link
                              href={`/leagues/sleeper/player/${player2.playerId}`}
                              className="flex items-center justify-between p-3 bg-white dark:bg-[#262829] border border-[#262829]/20 rounded-md shadow-sm"
                            >
                              <div className="flex items-center gap-3 flex-1">
                                <PlayerAvatar
                                  playerName={player2.name}
                                  playerId={player2.playerId}
                                  size="sm"
                                />
                                <div className="flex-1 min-w-0">
                                  <p className="font-semibold text-sm truncate">{player2.name}</p>
                                  <p className="text-xs text-gray-600 dark:text-[#C7C8CB]">
                                    {player2.position} • {player2.team}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-[#E64A30]">
                                  {player2.points.toFixed(1)}
                                </p>
                              </div>
                            </Link>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </>
  );
}
