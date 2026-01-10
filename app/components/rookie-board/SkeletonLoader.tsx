'use client'

import React from 'react'

export function PlayerRowSkeleton() {
  return (
    <tr className="text-center bg-[#FFE6E2] dark:bg-[#262829] border-t border-border animate-pulse">
      <td className="p-3">
        <div className="h-4 w-8 bg-gray-300 dark:bg-gray-600 rounded mx-auto"></div>
      </td>
      <td className="p-3 text-left">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gray-300 dark:bg-gray-600 flex-shrink-0"></div>
          <div className="h-4 w-32 bg-gray-300 dark:bg-gray-600 rounded"></div>
        </div>
      </td>
      <td className="p-3">
        <div className="h-4 w-12 bg-gray-300 dark:bg-gray-600 rounded mx-auto"></div>
      </td>
      <td className="p-3">
        <div className="h-4 w-16 bg-gray-300 dark:bg-gray-600 rounded mx-auto"></div>
      </td>
      <td className="p-3">
        <div className="h-4 w-12 bg-gray-300 dark:bg-gray-600 rounded mx-auto"></div>
      </td>
      <td className="p-3">
        <div className="h-4 w-8 bg-gray-300 dark:bg-gray-600 rounded mx-auto"></div>
      </td>
    </tr>
  )
}

export function TierHeadingSkeleton() {
  return (
    <tr className="bg-[#E64A30] dark:bg-[#E64A30]/90 animate-pulse">
      <td colSpan={6} className="p-4">
        <div className="h-6 w-48 bg-white/30 rounded"></div>
      </td>
    </tr>
  )
}

export function RankingTableSkeleton() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[900px]">
        <thead>
          <tr className="bg-[#F6BCB2] dark:bg-[#3A3D48] text-[#1D212D] dark:text-white text-center text-xs font-semibold">
            <th className="p-3 text-center">Our Rank</th>
            <th className="p-3 text-left">Player</th>
            <th className="p-3 text-center">Position</th>
            <th className="p-3 text-center">Team</th>
            <th className="p-3 text-center">ADP</th>
            <th className="p-3 text-center">More Info</th>
          </tr>
        </thead>
        <tbody>
          <TierHeadingSkeleton />
          <PlayerRowSkeleton />
          <PlayerRowSkeleton />
          <PlayerRowSkeleton />
          <PlayerRowSkeleton />
          <PlayerRowSkeleton />
          <PlayerRowSkeleton />
          <TierHeadingSkeleton />
          <PlayerRowSkeleton />
          <PlayerRowSkeleton />
          <PlayerRowSkeleton />
          <PlayerRowSkeleton />
          <PlayerRowSkeleton />
          <PlayerRowSkeleton />
        </tbody>
      </table>
    </div>
  )
}
