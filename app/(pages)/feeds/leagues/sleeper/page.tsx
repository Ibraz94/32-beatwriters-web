"use client";

import { useState } from "react";
import { useSleeperUser } from "@/lib/hooks/useSleeper";
import Link from "next/link";
import { ArrowLeft, Search, Loader2, ChevronRight } from "lucide-react";

export default function SleeperHome() {
  const [username, setUsername] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const { data: user, error, isLoading } = useSleeperUser(username, submitted);

  const handleSearch = () => {
    if (username.trim()) {
      setSubmitted(true);
    }
  };

  return (
    <div className="container mx-auto px-3 py-8 h-screen">
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
            href="/feeds/leagues"
            className="text-[#E64A30] hover:text-[#d43d24] inline-flex items-center font-medium"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Leagues
          </Link>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-2xl leading-8 mb-4 md:text-5xl md:leading-14">
            Sleeper
          </h1>
          <p className="text-gray-600 dark:text-[#C7C8CB] text-lg">
            Enter your Sleeper username
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="flex flex-col md:flex-row gap-3 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="username..."
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setSubmitted(false);
                }}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="w-full pl-12 pr-4 py-3 rounded-full border border-[#C7C8CB] dark:bg-[#262829] dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-[#E64A30] text-base"
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={!username.trim() || isLoading}
              className="bg-[#E64A30] hover:bg-[#d43d24] disabled:bg-gray-400 disabled:cursor-not-allowed px-8 py-3 rounded-full text-white font-medium transition-colors flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Searching...
                </>
              ) : (
                "Search"
              )}
            </button>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-center">
              <p className="text-red-600 dark:text-red-400">
                User not found. Please check the username and try again.
              </p>
            </div>
          )}

          {user && (
            <div className="mt-8 p-6 bg-white dark:bg-[#262829] border border-[#262829]/20 rounded-md shadow-sm max-w-sm mx-auto">
              <div className="flex items-center gap-4 mb-4">
                {user.avatar && ( 
                  <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                    <img
                      src={`https://sleepercdn.com/avatars/thumbs/${user.avatar}`}
                      alt={user.display_name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div>
                  <h2 className="text-2xl font-bold font-oswald">{user.display_name}</h2>
                  <p className="text-gray-600 dark:text-[#C7C8CB]">@{user.username}</p>
                </div>
              </div>
              
              <Link
                href={`/feeds/leagues/sleeper/${user.user_id}`}
                className="inline-flex items-center justify-center bg-[#E64A30] hover:bg-[#d43d24] px-4 py-2 rounded-full text-white font-medium transition-colors"
              >
                View Leagues
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
