"use client";

import { useState } from "react";
import Image from "next/image";
import { getPlayerInitials, getPlayerAvatarColor } from "@/lib/utils/playerImages";

interface PlayerAvatarProps {
  playerName: string;
  playerId?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeClasses = {
  sm: "w-8 h-8 text-xs",
  md: "w-12 h-12 text-sm",
  lg: "w-16 h-16 text-base",
  xl: "w-24 h-24 text-xl",
};

export default function PlayerAvatar({
  playerName,
  playerId,
  size = "md",
  className = "",
}: PlayerAvatarProps) {
  const [imageError, setImageError] = useState(false);
  const initials = getPlayerInitials(playerName);
  const bgColor = getPlayerAvatarColor(playerName);

  // For now, we'll use initials since we don't have ESPN ID mapping
  // In the future, you could add ESPN ID mapping here
  const showInitials = true; // Change to false when you have image URLs

  if (showInitials || imageError) {
    return (
      <div
        className={`${sizeClasses[size]} ${className} rounded-full flex items-center justify-center font-bold text-white`}
        style={{ backgroundColor: bgColor }}
        title={playerName}
      >
        {initials}
      </div>
    );
  }

  return (
    <div className={`${sizeClasses[size]} ${className} rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700`}>
      <Image
        src={`/api/player-image/${playerId}`} // You'd need to create this API route
        alt={playerName}
        width={96}
        height={96}
        className="w-full h-full object-cover"
        onError={() => setImageError(true)}
        loader={({ src }) => src}
      />
    </div>
  );
}
