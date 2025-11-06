"use client";

import { useParams, usePathname } from "next/navigation";
import Link from "next/link";
import { Trophy, Users, BarChart3, User, ArrowLeft } from "lucide-react";
import { useSleeperLeague } from "@/lib/hooks/useSleeper";

export default function LeagueLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const pathname = usePathname();
  const leagueId = params.leagueId as string;

  const { data: league } = useSleeperLeague(leagueId);

  const tabs = [
    // {
    //   name: "Rosters",
    //   href: `/leagues/sleeper/league/${leagueId}`,
    //   icon: Users,
    //   isActive: pathname === `/leagues/sleeper/league/${leagueId}`,
    // },

    {
      name: "Matchups",
      href: `/leagues/sleeper/league/${leagueId}/matchups`,
      icon: BarChart3,
      isActive: pathname?.includes("/matchups"),
    },
    {
      name: "My Team",
      href: `/leagues/sleeper/league/${leagueId}/my-team`,
      icon: User,
      isActive: pathname?.includes("/my-team"),
    },
    {
      name: "Standings",
      href: `/leagues/sleeper/league/${leagueId}/standings`,
      icon: Trophy,
      isActive: pathname?.includes("/standings"),
    },
  ];

  return (
    <div className="container mx-auto px-3 py-8 ">
      <div className="relative">
        {/* <div
          className="hidden md:flex absolute left-[-12px] right-[-12px] h-[300%] bg-cover bg-center bg-no-repeat bg-[url('/background-image2.png')] opacity-10 dark:opacity-5"
          style={{
            transform: "scaleY(-1)",
            zIndex: -50,
            top: '-100px'
          }}
        ></div> */}

        {/* Back Navigation */}
        <div className="mb-6">
          <Link
            href="/leagues/sleeper"
            className="text-[#E64A30] hover:text-[#d43d24] inline-flex items-center font-medium"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Search
          </Link>
        </div>

        {/* League Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl leading-8 mb-2 md:text-5xl md:leading-14">
            {league?.name || "League"}
          </h1>
          <p className="text-gray-600 dark:text-[#C7C8CB]">
            {league?.season} Season • {league?.total_rosters} Teams
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          {/* Desktop Tabs */}
          <div className="hidden md:flex justify-center gap-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <Link
                  key={tab.name}
                  href={tab.href}
                  className={`px-6 py-3 rounded-full font-medium transition-all flex items-center gap-2 ${tab.isActive
                      ? 'bg-[#E64A30] text-white shadow-lg'
                      : 'bg-white dark:bg-[#262829] hover:bg-gray-100 dark:hover:bg-[#3A3D48]'
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.name}
                </Link>
              );
            })}
          </div>

          {/* Mobile Tabs */}
          <div className="md:hidden">
            <div className="grid grid-cols-2 gap-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <Link
                    key={tab.name}
                    href={tab.href}
                    className={`px-4 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${tab.isActive
                        ? 'bg-[#E64A30] text-white shadow-lg'
                        : 'bg-white dark:bg-[#262829]'
                      }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm">{tab.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* Page Content */}
        {children}
      </div>
    </div>
  );
}
