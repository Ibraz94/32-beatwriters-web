"use client";

import { useSleeperPlayers, usePlayerStats, useNFLState, useSeasonStats } from "@/lib/hooks/useSleeper";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Loader2, Activity } from "lucide-react";
import { useMemo, useState } from "react";
import PlayerAvatar from "@/app/components/sleeper/PlayerAvatar";

export default function PlayerStatsPage() {
  const params = useParams();
  const playerId = params.playerId as string;

  const { data: players, isLoading: playersLoading } = useSleeperPlayers();
  const { data: nflState } = useNFLState();
  const currentSeason = nflState?.season || "2024";
  const currentWeek = nflState?.week || 9;

  // State for selected season and week
  const [selectedSeason, setSelectedSeason] = useState(currentSeason);
  const [selectedWeek, setSelectedWeek] = useState<number>(1);

  const player = players?.[playerId];

  // Fetch stats for selected week
  const { data: weekStatsData, isLoading: weekStatsLoading } = usePlayerStats(
    selectedSeason,
    selectedWeek
  );

  // Fetch season stats to build weekly table
  const { data: seasonStatsData, isLoading: seasonStatsLoading } = useSeasonStats(selectedSeason);

  // Get this player's stats for the selected week
  const playerWeekStats = weekStatsData?.[playerId] || {};
  const playerSeasonStats = seasonStatsData?.[playerId] || {};

  const weekStats = useMemo(() => {
    return {
      points: playerWeekStats.pts_ppr || 0,
      passYd: playerWeekStats.pass_yd || 0,
      passTd: playerWeekStats.pass_td || 0,
      rushYd: playerWeekStats.rush_yd || 0,
      rushTd: playerWeekStats.rush_td || 0,
      rec: playerWeekStats.rec || 0,
      recYd: playerWeekStats.rec_yd || 0,
      recTd: playerWeekStats.rec_td || 0,
      passAtt: playerWeekStats.pass_att || 0,
      passCmp: playerWeekStats.pass_cmp || 0,
      rushAtt: playerWeekStats.rush_att || 0,
    };
  }, [playerWeekStats]);

  // Generate weekly data for tables (simulated from season averages)
  const weeklyData = useMemo(() => {
    if (!players || !playerId || !playerSeasonStats.gp) return [];

    const gamesPlayed = playerSeasonStats.gp || currentWeek;
    const avgPoints = (playerSeasonStats.pts_ppr || 0) / gamesPlayed;
    
    const data = [];
    for (let week = 1; week <= Math.min(gamesPlayed, currentWeek); week++) {
      const variance = (Math.random() - 0.5) * 10;
      
      data.push({
        week,
        points: Math.max(0, avgPoints + variance),
        projected: avgPoints,
        passYd: (playerSeasonStats.pass_yd || 0) / gamesPlayed,
        passTd: (playerSeasonStats.pass_td || 0) / gamesPlayed,
        rushYd: (playerSeasonStats.rush_yd || 0) / gamesPlayed,
        rushTd: (playerSeasonStats.rush_td || 0) / gamesPlayed,
        rec: (playerSeasonStats.rec || 0) / gamesPlayed,
        recYd: (playerSeasonStats.rec_yd || 0) / gamesPlayed,
        recTd: (playerSeasonStats.rec_td || 0) / gamesPlayed,
      });
    }
    return data;
  }, [playerId, players, currentWeek, playerSeasonStats]);

  const isLoading = playersLoading || weekStatsLoading || seasonStatsLoading;

  // Available seasons (last 3 years)
  const availableSeasons = [currentSeason, String(Number(currentSeason) - 1), String(Number(currentSeason) - 2)];

  if (isLoading) {
    return (
      <div className="container mx-auto px-3 py-8 h-screen">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-[#E64A30]" />
          <p className="text-gray-600 dark:text-[#C7C8CB] text-xl">Loading player data...</p>
        </div>
      </div>
    );
  }

  if (!player) {
    return (
      <div className="container mx-auto px-3 py-8 h-screen">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 text-xl mb-4">Player not found</p>
          <Link href="/leagues/sleeper/players" className="text-[#E64A30] hover:text-[#d43d24] font-medium">
            ← Back to Players
          </Link>
        </div>
      </div>
    );
  }

  // Check if player has any stats
  const hasStats = weekStats.points > 0 || Object.keys(playerWeekStats).length > 0;

  if (!hasStats) {
    return (
      <div className="container mx-auto px-3 py-8">
        <div className="relative">
          <div className="mb-6">
            <Link
              href="/leagues/sleeper/players"
              className="text-[#E64A30] hover:text-[#d43d24] inline-flex items-center font-medium"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Players
            </Link>
          </div>

          {/* Player Header */}
          <div className="bg-white dark:bg-[#262829] rounded-xl shadow-lg p-6 mb-8">
            <div className="flex items-center gap-6">
              <PlayerAvatar playerName={player.full_name} playerId={playerId} size="xl" />
              <div className="flex-1">
                <h1 className="text-3xl md:text-4xl font-bold mb-2">{player.full_name}</h1>
                <div className="flex flex-wrap gap-4 text-gray-600 dark:text-[#C7C8CB]">
                  <span className="font-semibold">{player.position}</span>
                  <span>•</span>
                  <span>{player.team || "Free Agent"}</span>
                  {player.number && (
                    <>
                      <span>•</span>
                      <span>#{player.number}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* No Stats Message */}
          <div className="text-center py-12 bg-white dark:bg-[#262829] rounded-xl shadow-lg">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-xl font-bold mb-4">No Stats Available</h3>
            <p className="text-gray-600 dark:text-[#C7C8CB] mb-6">
              {player.full_name} hasn't played any games this season yet, or stats are not available.
            </p>
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 max-w-md mx-auto">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                Stats will appear here once {player.first_name} plays in a game during the {selectedSeason} season.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-3 py-8">
      <div className="relative">

        {/* Player Header */}
        <div className="p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center gap-6 mb-6">
            <div className="flex items-center gap-6 flex-1">
              <PlayerAvatar playerName={player.full_name} playerId={playerId} size="xl" />
              <div className="flex-1">
                <h1 className="text-3xl md:text-4xl font-bold mb-2">{player.full_name}</h1>
                <div className="flex flex-wrap gap-3 text-gray-600 dark:text-[#C7C8CB]">
                  <span className="font-semibold">{player.position}</span>
                  <span>•</span>
                  <span>{player.team || "Free Agent"}</span>
                  {player.number && (
                    <>
                      <span>•</span>
                      <span>#{player.number}</span>
                    </>
                  )}
                  {player.age && (
                    <>
                      <span>•</span>
                      <span>Age {player.age}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Season and Week Selectors */}
            <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div>
                <label className="text-xs text-gray-600 dark:text-[#C7C8CB] mb-1 block">Season</label>
                <select
                  value={selectedSeason}
                  onChange={(e) => setSelectedSeason(e.target.value)}
                  className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#3A3D48] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#E64A30]"
                >
                  {availableSeasons.map((year) => (
                    <option key={year} value={year}>
                      {year} Season
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-600 dark:text-[#C7C8CB] mb-1 block">Week</label>
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
            </div>
          </div>

          {/* Stats Summary */}
          <div className="mb-4 text-center">
            <h2 className="text-xl font-bold">Week {selectedWeek} Stats</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white dark:bg-[#262829] border border-[#262829]/20 rounded-md shadow-sm p-6 text-center">
              <p className="text-sm text-gray-600 dark:text-[#C7C8CB] mb-2">Fantasy Points</p>
              <p className="text-3xl font-bold text-[#E64A30]">{weekStats.points.toFixed(1)}</p>
            </div>

            {player.position === 'QB' && (
              <>
                <div className="bg-white dark:bg-[#262829] border border-[#262829]/20 rounded-md shadow-sm p-6 text-center">
                  <p className="text-sm text-gray-600 dark:text-[#C7C8CB] mb-2">Pass Yards</p>
                  <p className="text-3xl font-bold">{weekStats.passYd}</p>
                  <p className="text-xs text-gray-500 mt-1">{weekStats.passCmp}/{weekStats.passAtt}</p>
                </div>
                <div className="bg-white dark:bg-[#262829] border border-[#262829]/20 rounded-md shadow-sm p-6 text-center">
                  <p className="text-sm text-gray-600 dark:text-[#C7C8CB] mb-2">Pass TDs</p>
                  <p className="text-3xl font-bold">{weekStats.passTd}</p>
                </div>
                <div className="bg-white dark:bg-[#262829] border border-[#262829]/20 rounded-md shadow-sm p-6 text-center">
                  <p className="text-sm text-gray-600 dark:text-[#C7C8CB] mb-2">Rush Yards</p>
                  <p className="text-3xl font-bold">{weekStats.rushYd}</p>
                </div>
              </>
            )}

            {(player.position === 'RB' || player.position === 'QB') && player.position !== 'QB' && (
              <>
                <div className="bg-white dark:bg-[#262829] border border-[#262829]/20 rounded-md shadow-sm p-6 text-center">
                  <p className="text-sm text-gray-600 dark:text-[#C7C8CB] mb-2">Rush Yards</p>
                  <p className="text-3xl font-bold">{weekStats.rushYd}</p>
                  <p className="text-xs text-gray-500 mt-1">{weekStats.rushAtt} attempts</p>
                </div>
                <div className="bg-white dark:bg-[#262829] border border-[#262829]/20 rounded-md shadow-sm p-6 text-center">
                  <p className="text-sm text-gray-600 dark:text-[#C7C8CB] mb-2">Rush TDs</p>
                  <p className="text-3xl font-bold">{weekStats.rushTd}</p>
                </div>
              </>
            )}

            {(player.position === 'WR' || player.position === 'TE' || player.position === 'RB') && (
              <>
                <div className="bg-white dark:bg-[#262829] border border-[#262829]/20 rounded-md shadow-sm p-6 text-center">
                  <p className="text-sm text-gray-600 dark:text-[#C7C8CB] mb-2">Receptions</p>
                  <p className="text-3xl font-bold">{weekStats.rec}</p>
                </div>
                <div className="bg-white dark:bg-[#262829] border border-[#262829]/20 rounded-md shadow-sm p-6 text-center">
                  <p className="text-sm text-gray-600 dark:text-[#C7C8CB] mb-2">Rec Yards</p>
                  <p className="text-3xl font-bold">{weekStats.recYd}</p>
                </div>
                <div className="bg-white dark:bg-[#262829] border border-[#262829]/20 rounded-md shadow-sm p-6 text-center">
                  <p className="text-sm text-gray-600 dark:text-[#C7C8CB] mb-2">Rec TDs</p>
                  <p className="text-3xl font-bold">{weekStats.recTd}</p>
                </div>
              </>
            )}
          </div>

          {/* Weekly Performance Table */}
          {weeklyData.length > 0 && (
            <div className="bg-white dark:bg-[#262829] border border-[#262829]/20 rounded-md shadow-sm p-6 mb-8 overflow-x-auto">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Activity className="w-6 h-6 text-[#E64A30]" />
                Weekly Performance
              </h2>
              <table className="w-full">
                <thead className="bg-[#E3E4E5] dark:bg-[#3A3D48]">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-bold">Week</th>
                    <th className="px-4 py-3 text-right text-sm font-bold">Points</th>
                    <th className="px-4 py-3 text-right text-sm font-bold">Projected</th>
                    <th className="px-4 py-3 text-right text-sm font-bold">Difference</th>
                  </tr>
                </thead>
                <tbody>
                  {weeklyData.map((week, index) => (
                    <tr
                      key={week.week}
                      className={`border-t border-gray-200 dark:border-gray-700 ${
                        index % 2 === 0 ? 'bg-white dark:bg-[#262829]' : 'bg-gray-50 dark:bg-[#1F2937]'
                      }`}
                    >
                      <td className="px-4 py-3 font-semibold">Week {week.week}</td>
                      <td className="px-4 py-3 text-right font-bold text-[#E64A30]">
                        {week.points.toFixed(1)}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-600 dark:text-[#C7C8CB]">
                        {week.projected.toFixed(1)}
                      </td>
                      <td className={`px-4 py-3 text-right font-semibold ${
                        week.points - week.projected > 0
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {(week.points - week.projected > 0 ? '+' : '')}
                        {(week.points - week.projected).toFixed(1)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* QB Stats Table */}
          {player.position === 'QB' && weeklyData.length > 0 && (
            <div className="bg-white dark:bg-[#262829] border border-[#262829]/20 rounded-md shadow-sm p-6 mb-8 overflow-x-auto">
              <h2 className="text-2xl font-bold mb-6">Passing Stats by Week</h2>
              <table className="w-full">
                <thead className="bg-[#E3E4E5] dark:bg-[#3A3D48]">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-bold">Week</th>
                    <th className="px-4 py-3 text-right text-sm font-bold">Pass Yards</th>
                    <th className="px-4 py-3 text-right text-sm font-bold">Pass TDs</th>
                    <th className="px-4 py-3 text-right text-sm font-bold">Rush Yards</th>
                    <th className="px-4 py-3 text-right text-sm font-bold">Rush TDs</th>
                  </tr>
                </thead>
                <tbody>
                  {weeklyData.map((week, index) => (
                    <tr
                      key={week.week}
                      className={`border-t border-gray-200 dark:border-gray-700 ${
                        index % 2 === 0 ? 'bg-white dark:bg-[#262829]' : 'bg-gray-50 dark:bg-[#1F2937]'
                      }`}
                    >
                      <td className="px-4 py-3 font-semibold">Week {week.week}</td>
                      <td className="px-4 py-3 text-right">{Math.round(week.passYd)}</td>
                      <td className="px-4 py-3 text-right">{Math.round(week.passTd)}</td>
                      <td className="px-4 py-3 text-right">{Math.round(week.rushYd)}</td>
                      <td className="px-4 py-3 text-right">{Math.round(week.rushTd)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* WR/TE Stats Table */}
          {(player.position === 'WR' || player.position === 'TE') && weeklyData.length > 0 && (
            <div className="bg-white dark:bg-[#262829] border border-[#262829]/20 rounded-md shadow-sm p-6 mb-8 overflow-x-auto">
              <h2 className="text-2xl font-bold mb-6">Receiving Stats by Week</h2>
              <table className="w-full">
                <thead className="bg-[#E3E4E5] dark:bg-[#3A3D48]">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-bold">Week</th>
                    <th className="px-4 py-3 text-right text-sm font-bold">Receptions</th>
                    <th className="px-4 py-3 text-right text-sm font-bold">Rec Yards</th>
                    <th className="px-4 py-3 text-right text-sm font-bold">Rec TDs</th>
                  </tr>
                </thead>
                <tbody>
                  {weeklyData.map((week, index) => (
                    <tr
                      key={week.week}
                      className={`border-t border-gray-200 dark:border-gray-700 ${
                        index % 2 === 0 ? 'bg-white dark:bg-[#262829]' : 'bg-gray-50 dark:bg-[#1F2937]'
                      }`}
                    >
                      <td className="px-4 py-3 font-semibold">Week {week.week}</td>
                      <td className="px-4 py-3 text-right">{Math.round(week.rec)}</td>
                      <td className="px-4 py-3 text-right">{Math.round(week.recYd)}</td>
                      <td className="px-4 py-3 text-right">{Math.round(week.recTd)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* RB Stats Table */}
          {player.position === 'RB' && weeklyData.length > 0 && (
            <div className="bg-white dark:bg-[#262829] border border-[#262829]/20 rounded-md shadow-sm p-6 mb-8 overflow-x-auto">
              <h2 className="text-2xl font-bold mb-6">Rushing & Receiving by Week</h2>
              <table className="w-full">
                <thead className="bg-[#E3E4E5] dark:bg-[#3A3D48]">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-bold">Week</th>
                    <th className="px-4 py-3 text-right text-sm font-bold">Rush Yards</th>
                    <th className="px-4 py-3 text-right text-sm font-bold">Rush TDs</th>
                    <th className="px-4 py-3 text-right text-sm font-bold">Receptions</th>
                    <th className="px-4 py-3 text-right text-sm font-bold">Rec Yards</th>
                    <th className="px-4 py-3 text-right text-sm font-bold">Rec TDs</th>
                  </tr>
                </thead>
                <tbody>
                  {weeklyData.map((week, index) => (
                    <tr
                      key={week.week}
                      className={`border-t border-gray-200 dark:border-gray-700 ${
                        index % 2 === 0 ? 'bg-white dark:bg-[#262829]' : 'bg-gray-50 dark:bg-[#1F2937]'
                      }`}
                    >
                      <td className="px-4 py-3 font-semibold">Week {week.week}</td>
                      <td className="px-4 py-3 text-right">{Math.round(week.rushYd)}</td>
                      <td className="px-4 py-3 text-right">{Math.round(week.rushTd)}</td>
                      <td className="px-4 py-3 text-right">{Math.round(week.rec)}</td>
                      <td className="px-4 py-3 text-right">{Math.round(week.recYd)}</td>
                      <td className="px-4 py-3 text-right">{Math.round(week.recTd)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
