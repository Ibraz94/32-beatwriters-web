"use client";

import Link from "next/link";
import Image from "next/image";
import { ChevronRight } from "lucide-react";

export default function LeaguesHome() {
  const leagueSites = [
    {
      name: "Sleeper",
      href: "/leagues/sleeper",
      icon: "/sleeper_logo.png",
    },
    // Add more league sites here in the future
    // {
    //   name: "ESPN",
    //   description: "View your ESPN fantasy leagues",
    //   href: "/leagues/espn",
    //   icon: "🏆",
    // },
  ];

  return (
    <div className="container mx-auto min-h-screen px-3 py-8">
      <div className="relative">
        <div
          className="hidden md:flex absolute left-[-12px] right-[-12px] h-[300%] bg-cover bg-center bg-no-repeat bg-[url('/background-image2.png')] opacity-10 dark:opacity-5"
          style={{
            transform: "scaleY(-1)",
            zIndex: -50,
            top: '-100px'
          }}
        ></div>

        <div className="text-center mb-8">
          <h1 className="text-2xl leading-8 mb-4 md:text-5xl md:leading-14">
            Leagues
          </h1>
          <p className="text-gray-600 dark:text-[#C7C8CB] text-lg md:text-xl">
            Connect to your league platforms
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto mt-12">
          {leagueSites.map((site) => (
            <Link
              key={site.name}
              href={site.href}
              className="group relative overflow-hidden border border-[#262829]/20 rounded-md shadow-sm bg-white dark:bg-[#262829] p-8 transition-all duration-300 hover:shadow-lg"
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="text-7xl mb-2">
                  <Image
                  src={site.icon}
                  width={260}
                  height={260}
                  alt=""
                /></div>
                <div className="mt-4 inline-flex items-center font-semibold group-hover:translate-x-1 transition-transform">
                  Access
                  <ChevronRight/>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Coming Soon Section */}
        <div className="mt-12 text-center">
          <p className="text-gray-500 dark:text-[#C7C8CB] text-sm">
            More league platforms coming soon...
          </p>
        </div>
      </div>
    </div>
  );
}
