"use client";

import { useState, useMemo } from "react";
import { useSleeperPlayers } from "@/lib/hooks/useSleeper";
import Link from "next/link";
import { ArrowLeft, Search, Loader2, Users } from "lucide-react";

export default function PlayersPage() {
  const [query, setQuery] = useState("");
  const { data: players, isLoading } = useSleeperPlayers();

  const filtered = useMemo(() => {
    if (!players || !query) return [];

    const searchTerm = query.toLowerCase();
    return Object.values(players)
      .filter(
        (p) =>
          p.full_name?.toLowerCase().includes(searchTerm) ||
          p.team?.toLowerCase().includes(searchTerm) ||
          p.position?.toLowerCase().includes(searchTerm)
      )
      .slice(0, 50); // Limit to 50 results for performance
  }, [players, query]);

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
            href="/leagues/sleeper"
            className="text-[#E64A30] hover:text-[#d43d24] inline-flex items-center font-medium"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Search
          </Link>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-2xl leading-8 mb-4 md:text-5xl md:leading-14">
            NFL Players Search
          </h1>
          <p className="text-gray-600 dark:text-[#C7C8CB] text-lg">
            Search for any NFL player by name, team, or position
          </p>
        </div>

        <div className="max-w-2xl mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, team, or position..."
              className="w-full pl-12 pr-4 py-3 rounded-full border border-[#C7C8CB] dark:bg-[#262829] dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-[#E64A30] text-base"
            />
          </div>
        </div>

        {isLoading && (
          <div className="text-center py-12">
            <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-[#E64A30]" />
            <p className="text-gray-600 dark:text-[#C7C8CB]">Loading players database...</p>
          </div>
        )}

        {query && !isLoading && (
          <p className="text-gray-600 dark:text-[#C7C8CB] mb-6 text-center">
            Found {filtered.length} player{filtered.length !== 1 ? "s" : ""}
            {filtered.length === 50 && " (showing first 50)"}
          </p>
        )}

        {!query && !isLoading && (
          <div className="text-center py-12">
            <Users className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600 dark:text-[#C7C8CB] text-lg">
              Start typing to search for players
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((player) => (
            <div
              key={player.player_id}
              className="bg-white dark:bg-[#262829] p-5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-102"
            >
              <h2 className="text-lg font-bold font-oswald mb-3 line-clamp-1">
                {player.full_name}
              </h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-[#C7C8CB]">Team:</span>
                  <span className="font-medium">{player.team || "Free Agent"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-[#C7C8CB]">Position:</span>
                  <span className="font-medium text-[#E64A30]">{player.position}</span>
                </div>
                {player.number && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-[#C7C8CB]">Number:</span>
                    <span className="font-medium">#{player.number}</span>
                  </div>
                )}
                {player.age && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-[#C7C8CB]">Age:</span>
                    <span className="font-medium">{player.age}</span>
                  </div>
                )}
                {player.status && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-[#C7C8CB]">Status:</span>
                    <span className="font-medium capitalize">{player.status}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {query && !isLoading && filtered.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-[#C7C8CB] text-lg">
              No players found matching "{query}"
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
