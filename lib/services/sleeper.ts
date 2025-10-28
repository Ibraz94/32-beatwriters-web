const SLEEPER_BASE_URL = "https://api.sleeper.app/v1";

export interface SleeperUser {
  user_id: string;
  username: string;
  display_name: string;
  avatar: string;
}

export interface SleeperLeague {
  league_id: string;
  name: string;
  season: string;
  total_rosters: number;
  status: string;
  sport: string;
  settings: any;
  scoring_settings: any;
  roster_positions: string[];
}

export interface SleeperRoster {
  roster_id: number;
  owner_id: string;
  players: string[];
  starters: string[];
  settings: {
    wins: number;
    losses: number;
    ties: number;
    fpts: number;
  };
}

export interface SleeperPlayer {
  player_id: string;
  full_name: string;
  first_name: string;
  last_name: string;
  team: string;
  position: string;
  number: number;
  age: number;
  status: string;
}

export const sleeperApi = {
  async getUser(username: string): Promise<SleeperUser> {
    const res = await fetch(`${SLEEPER_BASE_URL}/user/${username}`);
    if (!res.ok) throw new Error("User not found");
    return res.json();
  },

  async getUserLeagues(userId: string, season: string = "2024"): Promise<SleeperLeague[]> {
    const res = await fetch(`${SLEEPER_BASE_URL}/user/${userId}/leagues/nfl/${season}`);
    if (!res.ok) throw new Error("Failed to fetch leagues");
    return res.json();
  },

  async getLeagueRosters(leagueId: string): Promise<SleeperRoster[]> {
    const res = await fetch(`${SLEEPER_BASE_URL}/league/${leagueId}/rosters`);
    if (!res.ok) throw new Error("Failed to fetch rosters");
    return res.json();
  },

  async getAllPlayers(): Promise<Record<string, SleeperPlayer>> {
    const res = await fetch(`${SLEEPER_BASE_URL}/players/nfl`);
    if (!res.ok) throw new Error("Failed to fetch players");
    return res.json();
  },
};
