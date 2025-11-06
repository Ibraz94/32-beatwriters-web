"use client";

import { useTrendingPlayers, useSleeperPlayers } from "@/lib/hooks/useSleeper";
import Link from "next/link";
import { ArrowLeft, Loader2, TrendingUp, TrendingDown } from "lucide-react";
import { useState, useMemo } from "react";
import PlayerAvatar from "@/app/components/sleeper/PlayerAvatar";

export default function TrendingPlayersPage() {
  const [activeTab, setActiveTab] = useState<'add' | 'drop'>('add');
  
  const { data: trendingAdds, isLoading: addsLoading } = useTrendingPlayers('add');
  const { data: trendingDrops, isLoading: dropsLoading } = useTrendingPlayers('drop');
  const { data: players, isLoading: playersLoading } = useSleeperPlayers();

  const trendingData = useMemo(() => {
    const trending = activeTab === 'add' ? trendingAdds : trendingDrops;
    if (!trending || !players) return [];

    return trending.slice(0, 50).map((item: any) => {
      const player = players[item.player_id];
      return {
        playerId: item.player_id,
        count: item.count,
        name: player?.full_name || item.player_id,
        position: player?.position || 'N/A',
        team: player?.team || 'FA',
        status: player?.status,
        injury_status: player?.injury_status,
      };
    });
  }, [activeTab, trendingAdds, trendingDrops, players]);

  const isLoading = addsLoading || dropsLoading || playersLoading;

  if (isLoading) {
    return (
      <div className="container mx-auto px-3 py-8">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-[#E64A30]" />
          <p className="text-gray-600 dark:text-[#C7C8CB] text-xl">Loading trending players...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-3 py-8">
      <div className="relative">
        <div
          className="hidden md:flex absolute left-[-12px] right-[-12px] h-[300%] bg-cover bg-center bg-no-repeat bg-[url('/background-image2.png')] opacity-10 dark:opacity-5"
          style={{
            transform: "scaleY(-1)",
            zIndex: -50,
            top: '-100px'
          }}
        ></div>

        <div className="mb-6">
          <Link
            href="/leagues"
            className="text-[#E64A30] hover:text-[#d43d24] inline-flex items-center font-medium"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Leagues
          </Link>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-2xl leading-8 mb-4 md:text-5xl md:leading-14">
            Trending Players
          </h1>
          <p className="text-gray-600 dark:text-[#C7C8CB] text-lg">
            Most added and dropped players across all Sleeper leagues
          </p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={() => setActiveTab('add')}
            className={`px-8 py-3 rounded-full font-semibold transition-colors flex items-center gap-2 ${
              activeTab === 'add'
                ? 'bg-green-500 text-white'
                : 'bg-white dark:bg-[#262829] hover:bg-gray-100 dark:hover:bg-[#3A3D48]'
            }`}
          >
            <TrendingUp className="w-5 h-5" />
            Most Added
          </button>
          <button
            onClick={() => setActiveTab('drop')}
            className={`px-8 py-3 rounded-full font-semibold transition-colors flex items-center gap-2 ${
              activeTab === 'drop'
                ? 'bg-red-500 text-white'
                : 'bg-white dark:bg-[#262829] hover:bg-gray-100 dark:hover:bg-[#3A3D48]'
            }`}
          >
            <TrendingDown className="w-5 h-5" />
            Most Dropped
          </button>
        </div>

        {/* Trending List */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-[#262829] rounded-xl shadow-lg overflow-hidden">
            {/* Header */}
            <div className="bg-[#E3E4E5] dark:bg-[#3A3D48] px-6 py-4 grid grid-cols-12 gap-4 font-bold text-sm">
              <div className="col-span-1 text-center">#</div>
              <div className="col-span-6">Player</div>
              <div className="col-span-2 text-center">Position</div>
              <div className="col-span-3 text-center">
                {activeTab === 'add' ? 'Adds' : 'Drops'}
              </div>
            </div>

            {/* List */}
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {trendingData.map((player, index) => (
                <Link
                  key={player.playerId}
                  href={`/leagues/sleeper/player/${player.playerId}`}
                  className="px-6 py-4 grid grid-cols-12 gap-4 items-center hover:bg-gray-50 dark:hover:bg-[#3A3D48] transition-colors"
                >
                  <div className="col-span-1 text-center">
                    <span className="font-bold text-lg text-gray-600 dark:text-[#C7C8CB]">
                      {index + 1}
                    </span>
                  </div>

                  <div className="col-span-6 flex items-center gap-3">
                    <PlayerAvatar 
                      playerName={player.name} 
                      playerId={player.playerId} 
                      size="md" 
                    />
                    <div>
                      <h3 className="font-semibold">{player.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-[#C7C8CB]">
                        {player.team}
                        {player.injury_status && (
                          <span className="ml-2 text-red-500">
                            ({player.injury_status})
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="col-span-2 text-center">
                    <span className="px-3 py-1 rounded-full bg-[#E3E4E5] dark:bg-[#3A3D48] text-sm font-semibold">
                      {player.position}
                    </span>
                  </div>

                  <div className="col-span-3 text-center">
                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-bold ${
                      activeTab === 'add'
                        ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                        : 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                    }`}>
                      {activeTab === 'add' ? (
                        <TrendingUp className="w-4 h-4" />
                      ) : (
                        <TrendingDown className="w-4 h-4" />
                      )}
                      {player.count.toLocaleString()}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Info Box */}
          <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
            <h3 className="font-bold text-lg mb-2 text-blue-900 dark:text-blue-300">
              💡 How to Use This Data
            </h3>
            <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
              <li>• <strong>Most Added:</strong> Players gaining popularity - potential breakouts or favorable matchups</li>
              <li>• <strong>Most Dropped:</strong> Players losing value - injuries, poor performance, or tough schedules</li>
              <li>• Check injury status before adding players</li>
              <li>• Consider your league's scoring settings</li>
              <li>• Act fast on trending adds - they may not be available long!</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
