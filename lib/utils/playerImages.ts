/**
 * Player headshot utilities
 * Sleeper API doesn't provide player images, so we use ESPN's CDN
 */

// Map of Sleeper player IDs to ESPN player IDs
// This would need to be populated or fetched from a mapping service
const sleeperToEspnMap: Record<string, string> = {
  // Example mappings - you'd need a complete database
  // "4046": "3116593", // Patrick Mahomes
  // "4017": "3139477", // Josh Allen
  // Add more mappings as needed
};

/**
 * Get ESPN player headshot URL
 * @param espnPlayerId - ESPN player ID
 * @param size - 'full' or 'small'
 */
export function getEspnHeadshot(espnPlayerId: string, size: 'full' | 'small' = 'full'): string {
  return `https://a.espncdn.com/i/headshots/nfl/players/${size}/${espnPlayerId}.png`;
}

/**
 * Get player headshot from Sleeper player ID
 * Falls back to placeholder if mapping not found
 */
export function getPlayerHeadshot(sleeperPlayerId: string): string {
  const espnId = sleeperToEspnMap[sleeperPlayerId];
  
  if (espnId) {
    return getEspnHeadshot(espnId);
  }
  
  // Fallback to a placeholder or team logo
  return '/default-player.jpg';
}

/**
 * Get player headshot with error handling
 * Returns a promise that resolves to the image URL or fallback
 */
export async function getPlayerHeadshotWithFallback(
  sleeperPlayerId: string,
  playerName?: string
): Promise<string> {
  const espnId = sleeperToEspnMap[sleeperPlayerId];
  
  if (espnId) {
    const imageUrl = getEspnHeadshot(espnId);
    
    // Check if image exists
    try {
      const response = await fetch(imageUrl, { method: 'HEAD' });
      if (response.ok) {
        return imageUrl;
      }
    } catch (error) {
      console.warn(`Failed to load headshot for player ${sleeperPlayerId}`);
    }
  }
  
  // Try alternative sources or return placeholder
  return '/default-player.jpg';
}

/**
 * Component helper for player image with fallback
 */
export function getPlayerImageProps(sleeperPlayerId: string, playerName: string) {
  return {
    src: getPlayerHeadshot(sleeperPlayerId),
    alt: playerName,
    onError: (e: React.SyntheticEvent<HTMLImageElement>) => {
      const target = e.target as HTMLImageElement;
      target.src = '/default-player.jpg';
    },
  };
}

/**
 * Alternative: Use initials as fallback
 */
export function getPlayerInitials(playerName: string): string {
  const names = playerName.split(' ');
  if (names.length >= 2) {
    return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
  }
  return playerName.substring(0, 2).toUpperCase();
}

/**
 * Generate a color based on player name for avatar background
 */
export function getPlayerAvatarColor(playerName: string): string {
  const colors = [
    '#E64A30', // Orange
    '#3B82F6', // Blue
    '#10B981', // Green
    '#F59E0B', // Amber
    '#8B5CF6', // Purple
    '#EC4899', // Pink
    '#14B8A6', // Teal
  ];
  
  const hash = playerName.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);
  
  return colors[Math.abs(hash) % colors.length];
}
