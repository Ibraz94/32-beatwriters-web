"use client";

import { useSleeperLeagues } from "@/lib/hooks/useSleeper";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Loader2, Trophy, Users } from "lucide-react";

export default function LeaguesPage() {
  const params = useParams();
  const userId = params.userId as string;

  const { data: leagues, error, isLoading } = useSleeperLeagues(userId);

  if (isLoading) {
    return (
      <div className="container mx-auto px-3 py-8">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-[#E64A30]" />
          <p className="text-gray-600 dark:text-[#C7C8CB] text-xl">Loading leagues...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-3 py-8">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 text-xl mb-4">Failed to load leagues.</p>
          <Link
            href="/leagues/sleeper"
            className="text-[#E64A30] hover:text-[#d43d24] font-medium"
          >
            ← Back to Search
          </Link>
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
            href="/leagues/sleeper"
            className="text-[#E64A30] hover:text-[#d43d24] inline-flex items-center font-medium"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Search
          </Link>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-2xl leading-8 mb-4 md:text-5xl md:leading-14">
            Your Leagues
          </h1>
        </div>

        {!leagues || leagues.length === 0 ? (
          <div className="text-center py-12">
            <Trophy className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600 dark:text-[#C7C8CB] text-lg">
              No leagues found for this user.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {leagues.map((league) => (
              <div
                key={league.league_id}
                className="bg-white dark:bg-[#262829] p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-102"
              >
                <div className="flex items-start justify-between mb-4">
                  <Trophy className="w-8 h-8 text-[#E64A30]" />
                  <span className="text-xs px-3 py-1 rounded-full bg-[#E3E4E5] dark:bg-[#3A3D48] text-gray-700 dark:text-[#C7C8CB] font-medium">
                    {league.status}
                  </span>
                </div>

                <h2 className="text-xl font-bold font-oswald mb-3 line-clamp-2">
                  {league.name}
                </h2>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600 dark:text-[#C7C8CB]">
                    <span className="font-medium mr-2">Season:</span>
                    <span>{league.season}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600 dark:text-[#C7C8CB]">
                    <Users className="w-4 h-4 mr-2" />
                    <span>{league.total_rosters} Teams</span>
                  </div>
                </div>

                <Link
                  href={`/leagues/sleeper/league/${league.league_id}`}
                  className="inline-flex items-center justify-center w-full bg-[#E64A30] hover:bg-[#d43d24] px-4 py-2 rounded-full text-white font-medium transition-colors"
                >
                  View Rosters
                  <svg
                    className="ml-2 w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
