const SLEEPER_BASE_URL = "https://api.sleeper.app/v1";

export interface SleeperUser {
  user_id: string;
  username: string;
  display_name: string;
  avatar: string;
  metadata?: {
    team_name?: string;
  };
}

export interface SleeperLeague {
  league_id: string;
  name: string;
  season: string;
  total_rosters: number;
  status: string;
  sport: string;
  settings: {
    playoff_week_start?: number;
    num_teams?: number;
    playoff_teams?: number;
    waiver_type?: number;
    trade_deadline?: number;
  };
  scoring_settings: Record<string, number>;
  roster_positions: string[];
  previous_league_id?: string;
  draft_id?: string;
}

export interface SleeperRoster {
  roster_id: number;
  owner_id: string;
  players: string[];
  starters: string[];
  reserve?: string[];
  taxi?: string[];
  settings: {
    wins: number;
    losses: number;
    ties: number;
    fpts: number;
    fpts_decimal?: number;
    fpts_against?: number;
    fpts_against_decimal?: number;
    ppts?: number;
    ppts_decimal?: number;
  };
  metadata?: {
    streak?: string;
    record?: string;
  };
}

export interface SleeperPlayer {
  player_id: string;
  full_name: string;
  first_name: string;
  last_name: string;
  team: string | null;
  position: string;
  number: number;
  age: number;
  status: string;
  fantasy_positions?: string[];
  depth_chart_position?: string;
  depth_chart_order?: number;
  injury_status?: string;
  years_exp?: number;
  height?: string;
  weight?: string;
  college?: string;
  birth_date?: string;
  search_rank?: number;
}

export interface SleeperMatchup {
  roster_id: number;
  matchup_id: number;
  points: number;
  players_points?: Record<string, number>;
  starters_points?: number[];
  players?: string[];
  starters?: string[];
  custom_points?: number;
}

export interface SleeperLeagueUser {
  user_id: string;
  display_name: string;
  avatar: string;
  metadata?: {
    team_name?: string;
  };
  is_owner?: boolean;
  is_bot?: boolean;
}

export interface SleeperTransaction {
  type: string;
  transaction_id: string;
  status_updated: number;
  status: string;
  settings?: any;
  roster_ids: number[];
  metadata?: any;
  leg?: number;
  drops?: Record<string, number>;
  draft_picks?: any[];
  creator?: string;
  created?: number;
  consenter_ids?: number[];
  adds?: Record<string, number>;
  waiver_budget?: any[];
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

  async getLeague(leagueId: string): Promise<SleeperLeague> {
    const res = await fetch(`${SLEEPER_BASE_URL}/league/${leagueId}`);
    if (!res.ok) throw new Error("Failed to fetch league");
    return res.json();
  },

  async getLeagueRosters(leagueId: string): Promise<SleeperRoster[]> {
    const res = await fetch(`${SLEEPER_BASE_URL}/league/${leagueId}/rosters`);
    if (!res.ok) throw new Error("Failed to fetch rosters");
    return res.json();
  },

  async getLeagueUsers(leagueId: string): Promise<SleeperLeagueUser[]> {
    const res = await fetch(`${SLEEPER_BASE_URL}/league/${leagueId}/users`);
    if (!res.ok) throw new Error("Failed to fetch league users");
    return res.json();
  },

  async getLeagueMatchups(leagueId: string, week: number): Promise<SleeperMatchup[]> {
    const res = await fetch(`${SLEEPER_BASE_URL}/league/${leagueId}/matchups/${week}`);
    if (!res.ok) throw new Error("Failed to fetch matchups");
    return res.json();
  },

  async getLeagueTransactions(leagueId: string, week: number): Promise<SleeperTransaction[]> {
    const res = await fetch(`${SLEEPER_BASE_URL}/league/${leagueId}/transactions/${week}`);
    if (!res.ok) throw new Error("Failed to fetch transactions");
    return res.json();
  },

  async getAllPlayers(): Promise<Record<string, SleeperPlayer>> {
    const res = await fetch(`${SLEEPER_BASE_URL}/players/nfl`);
    if (!res.ok) throw new Error("Failed to fetch players");
    return res.json();
  },

  async getNFLState(): Promise<{
    week: number;
    season_type: string;
    season: string;
    previous_season: string;
    display_week: number;
    season_start_date: string;
    league_season: string;
    league_create_season: string;
  }> {
    const res = await fetch(`${SLEEPER_BASE_URL}/state/nfl`);
    if (!res.ok) throw new Error("Failed to fetch NFL state");
    return res.json();
  },

  async getPlayerStats(season: string, week: number): Promise<Record<string, any>> {
    const res = await fetch(`${SLEEPER_BASE_URL}/stats/nfl/regular/${season}/${week}`);
    if (!res.ok) throw new Error("Failed to fetch player stats");
    return res.json();
  },

  async getSeasonStats(season: string): Promise<Record<string, any>> {
    const res = await fetch(`${SLEEPER_BASE_URL}/stats/nfl/regular/${season}`);
    if (!res.ok) throw new Error("Failed to fetch season stats");
    return res.json();
  },

  async getPlayerProjections(season: string, week: number): Promise<Record<string, any>> {
    const res = await fetch(`${SLEEPER_BASE_URL}/projections/nfl/regular/${season}/${week}`);
    if (!res.ok) throw new Error("Failed to fetch projections");
    return res.json();
  },

  async getTrendingPlayers(type: 'add' | 'drop'): Promise<any[]> {
    const res = await fetch(`${SLEEPER_BASE_URL}/players/nfl/trending/${type}`);
    if (!res.ok) throw new Error("Failed to fetch trending players");
    return res.json();
  },
};
