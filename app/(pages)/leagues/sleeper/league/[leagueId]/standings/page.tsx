"use client";

import { useSleeperRosters, useSleeperLeagueUsers, useSleeperLeague } from "@/lib/hooks/useSleeper";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Loader2, Trophy, TrendingUp, TrendingDown } from "lucide-react";
import { useMemo } from "react";

export default function LeagueStandingsPage() {
  const params = useParams();
  const leagueId = params.leagueId as string;

  const { data: league, isLoading: leagueLoading } = useSleeperLeague(leagueId);
  const { data: rosters, isLoading: rostersLoading } = useSleeperRosters(leagueId);
  const { data: users, isLoading: usersLoading } = useSleeperLeagueUsers(leagueId);

  const standings = useMemo(() => {
    if (!rosters || !users) return [];

    return rosters
      .map((roster) => {
        const user = users.find((u) => u.user_id === roster.owner_id);
        const winPct = roster.settings.wins + roster.settings.losses + roster.settings.ties > 0
          ? (roster.settings.wins / (roster.settings.wins + roster.settings.losses + roster.settings.ties)) * 100
          : 0;

        return {
          roster_id: roster.roster_id,
          owner_id: roster.owner_id,
          team_name: user?.metadata?.team_name || user?.display_name || "Team",
          avatar: user?.avatar,
          wins: roster.settings.wins,
          losses: roster.settings.losses,
          ties: roster.settings.ties,
          points_for: roster.settings.fpts + (roster.settings.fpts_decimal || 0) / 100,
          points_against: (roster.settings.fpts_against || 0) + (roster.settings.fpts_against_decimal || 0) / 100,
          win_pct: winPct,
        };
      })
      .sort((a, b) => {
        // Sort by wins first
        if (b.wins !== a.wins) return b.wins - a.wins;
        // Then by points for
        return b.points_for - a.points_for;
      });
  }, [rosters, users]);

  const isLoading = leagueLoading || rostersLoading || usersLoading;

  if (isLoading) {
    return (
      <div className="container mx-auto px-2 py-2 h-full">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-[#E64A30]" />
          <p className="text-gray-600 dark:text-[#C7C8CB] text-xl">Loading standings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
          {/* Desktop Table View */}
          <div className="hidden md:block bg-white dark:bg-[#262829] border border-[#262829]/20 rounded-md shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-[#E3E4E5] dark:bg-[#3A3D48]">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-bold">Rank</th>
                  <th className="px-6 py-4 text-left text-sm font-bold">Team</th>
                  <th className="px-6 py-4 text-center text-sm font-bold">W</th>
                  <th className="px-6 py-4 text-center text-sm font-bold">L</th>
                  <th className="px-6 py-4 text-center text-sm font-bold">T</th>
                  <th className="px-6 py-4 text-center text-sm font-bold">Win %</th>
                  <th className="px-6 py-4 text-right text-sm font-bold">PF</th>
                  <th className="px-6 py-4 text-right text-sm font-bold">PA</th>
                  <th className="px-6 py-4 text-right text-sm font-bold">Diff</th>
                </tr>
              </thead>
              <tbody>
                {standings.map((team, index) => (
                  <tr
                    key={team.roster_id}
                    className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-[#3A3D48] transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-lg">{index + 1}</span>
                        {index === 0 && <Trophy className="w-5 h-5 text-yellow-500" />}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {team.avatar && (
                          <img
                            src={`https://sleepercdn.com/avatars/thumbs/${team.avatar}`}
                            alt={team.team_name}
                            className="w-10 h-10 rounded-full"
                          />
                        )}
                        <span className="font-semibold">{team.team_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center font-semibold text-green-600 dark:text-green-400">
                      {team.wins}
                    </td>
                    <td className="px-6 py-4 text-center font-semibold text-red-600 dark:text-red-400">
                      {team.losses}
                    </td>
                    <td className="px-6 py-4 text-center font-semibold text-gray-600 dark:text-gray-400">
                      {team.ties}
                    </td>
                    <td className="px-6 py-4 text-center font-semibold">
                      {team.win_pct.toFixed(1)}%
                    </td>
                    <td className="px-6 py-4 text-right font-semibold">
                      {team.points_for.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-right font-semibold">
                      {team.points_against.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={`font-semibold ${
                        team.points_for - team.points_against > 0
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {(team.points_for - team.points_against > 0 ? '+' : '')}
                        {(team.points_for - team.points_against).toFixed(2)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-4">
            {standings.map((team, index) => (
              <div
                key={team.roster_id}
                className="bg-white dark:bg-[#262829] rounded-xl shadow-lg p-5"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#E3E4E5] dark:bg-[#3A3D48] font-bold text-lg">
                      {index + 1}
                    </div>
                    {team.avatar && (
                      <img
                        src={`https://sleepercdn.com/avatars/thumbs/${team.avatar}`}
                        alt={team.team_name}
                        className="w-12 h-12 rounded-full"
                      />
                    )}
                    <div>
                      <h3 className="font-bold">{team.team_name}</h3>
                      <p className="text-sm text-gray-600 dark:text-[#C7C8CB]">
                        {team.wins}-{team.losses}-{team.ties}
                      </p>
                    </div>
                  </div>
                  {index === 0 && <Trophy className="w-6 h-6 text-yellow-500" />}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[#E3E4E5] dark:bg-[#3A3D48] rounded-lg p-3">
                    <p className="text-xs text-gray-600 dark:text-[#C7C8CB] mb-1">Points For</p>
                    <p className="font-bold text-lg">{team.points_for.toFixed(2)}</p>
                  </div>
                  <div className="bg-[#E3E4E5] dark:bg-[#3A3D48] rounded-lg p-3">
                    <p className="text-xs text-gray-600 dark:text-[#C7C8CB] mb-1">Points Against</p>
                    <p className="font-bold text-lg">{team.points_against.toFixed(2)}</p>
                  </div>
                  <div className="bg-[#E3E4E5] dark:bg-[#3A3D48] rounded-lg p-3">
                    <p className="text-xs text-gray-600 dark:text-[#C7C8CB] mb-1">Win %</p>
                    <p className="font-bold text-lg">{team.win_pct.toFixed(1)}%</p>
                  </div>
                  <div className="bg-[#E3E4E5] dark:bg-[#3A3D48] rounded-lg p-3">
                    <p className="text-xs text-gray-600 dark:text-[#C7C8CB] mb-1">Differential</p>
                    <p className={`font-bold text-lg ${
                      team.points_for - team.points_against > 0
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      {(team.points_for - team.points_against > 0 ? '+' : '')}
                      {(team.points_for - team.points_against).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
  );
}
