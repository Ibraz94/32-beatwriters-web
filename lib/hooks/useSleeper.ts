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

export function useSleeperLeague(leagueId: string) {
  return useQuery({
    queryKey: ["sleeper-league", leagueId],
    queryFn: () => sleeperApi.getLeague(leagueId),
    enabled: !!leagueId,
  });
}

export function useSleeperRosters(leagueId: string) {
  return useQuery({
    queryKey: ["sleeper-rosters", leagueId],
    queryFn: () => sleeperApi.getLeagueRosters(leagueId),
    enabled: !!leagueId,
  });
}

export function useSleeperLeagueUsers(leagueId: string) {
  return useQuery({
    queryKey: ["sleeper-league-users", leagueId],
    queryFn: () => sleeperApi.getLeagueUsers(leagueId),
    enabled: !!leagueId,
  });
}

export function useSleeperMatchups(leagueId: string, week: number) {
  return useQuery({
    queryKey: ["sleeper-matchups", leagueId, week],
    queryFn: () => sleeperApi.getLeagueMatchups(leagueId, week),
    enabled: !!leagueId && week > 0,
  });
}

export function useSleeperTransactions(leagueId: string, week: number) {
  return useQuery({
    queryKey: ["sleeper-transactions", leagueId, week],
    queryFn: () => sleeperApi.getLeagueTransactions(leagueId, week),
    enabled: !!leagueId && week > 0,
  });
}

export function useSleeperPlayers() {
  return useQuery({
    queryKey: ["sleeper-players"],
    queryFn: () => sleeperApi.getAllPlayers(),
    staleTime: 1000 * 60 * 60, // 1 hour - players data doesn't change often
  });
}

export function useNFLState() {
  return useQuery({
    queryKey: ["nfl-state"],
    queryFn: () => sleeperApi.getNFLState(),
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
}

export function usePlayerStats(season: string, week: number) {
  return useQuery({
    queryKey: ["player-stats", season, week],
    queryFn: () => sleeperApi.getPlayerStats(season, week),
    enabled: !!season && week > 0,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

export function useSeasonStats(season: string) {
  return useQuery({
    queryKey: ["season-stats", season],
    queryFn: () => sleeperApi.getSeasonStats(season),
    enabled: !!season,
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}

export function usePlayerProjections(season: string, week: number) {
  return useQuery({
    queryKey: ["player-projections", season, week],
    queryFn: () => sleeperApi.getPlayerProjections(season, week),
    enabled: !!season && week > 0,
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
}

export function useTrendingPlayers(type: 'add' | 'drop') {
  return useQuery({
    queryKey: ["trending-players", type],
    queryFn: () => sleeperApi.getTrendingPlayers(type),
    staleTime: 1000 * 60 * 15, // 15 minutes
  });
}
