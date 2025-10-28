import { useQuery } from "@tanstack/react-query";
import { sleeperApi } from "@/lib/services/sleeper";

export function useSleeperUser(username: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ["sleeper-user", username],
    queryFn: () => sleeperApi.getUser(username),
    enabled: enabled && !!username,
  });
}

export function useSleeperLeagues(userId: string, season: string = "2025") {
  return useQuery({
    queryKey: ["sleeper-leagues", userId, season],
    queryFn: () => sleeperApi.getUserLeagues(userId, season),
    enabled: !!userId,
  });
}

export function useSleeperRosters(leagueId: string) {
  return useQuery({
    queryKey: ["sleeper-rosters", leagueId],
    queryFn: () => sleeperApi.getLeagueRosters(leagueId),
    enabled: !!leagueId,
  });
}

export function useSleeperPlayers() {
  return useQuery({
    queryKey: ["sleeper-players"],
    queryFn: () => sleeperApi.getAllPlayers(),
    staleTime: 1000 * 60 * 60, // 1 hour - players data doesn't change often
  });
}
