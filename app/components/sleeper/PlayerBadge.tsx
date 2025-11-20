"use client";

import PlayerAvatar from "./PlayerAvatar";

interface PlayerBadgeProps {
  playerName: string;
  playerId?: string;
  position?: string;
  team?: string;
  isStarter?: boolean;
  onClick?: () => void;
}

export default function PlayerBadge({
  playerName,
  playerId,
  position,
  team,
  isStarter = false,
  onClick,
}: PlayerBadgeProps) {
  const badgeClasses = isStarter
    ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800"
    : "bg-[#E3E4E5] dark:bg-[#3A3D48] text-gray-700 dark:text-[#C7C8CB]";

  return (
    <div
      className={`${badgeClasses} px-3 py-2 rounded-full text-xs font-medium flex items-center gap-2 hover:scale-105 transition-transform cursor-pointer`}
      onClick={onClick}
      title={`${playerName}${position ? ` - ${position}` : ''}${team ? ` (${team})` : ''}`}
    >
      <PlayerAvatar playerName={playerName} playerId={playerId} size="sm" />
      <div className="flex flex-col">
        <span className="font-semibold">{playerName}</span>
        {(position || team) && (
          <span className="text-[10px] opacity-75">
            {position && position}
            {position && team && " • "}
            {team && team}
          </span>
        )}
      </div>
    </div>
  );
}
