import { nflTeams, NFLTeam } from '../../teams/data/teams'

export interface Player {
  id: string
  name: string
  position: string
  number: number
  image: string
  height: string
  weight: string
  college: string
  team: {
    id: string
    name: string
    city: string
    abbreviation: string
    logo: string
    primaryColor: string
    conference: 'AFC' | 'NFC'
    division: string
  }
}

// Generate a unique player ID from name and team
const generatePlayerId = (playerName: string, teamId: string): string => {
  return `${playerName.toLowerCase().replace(/\s+/g, '-')}-${teamId}`
}

// Extract all players from all teams
export const getAllPlayers = (): Player[] => {
  const allPlayers: Player[] = []
  
  nflTeams.forEach(team => {
    team.keyPlayers.forEach(player => {
      allPlayers.push({
        id: generatePlayerId(player.name, team.id),
        name: player.name,
        position: player.position,
        number: player.number,
        image: player.image,
        height: player.height,
        weight: player.weight,
        college: player.college,
        team: {
          id: team.id,
          name: team.name,
          city: team.city,
          abbreviation: team.abbreviation,
          logo: team.logo,
          primaryColor: team.primaryColor,
          conference: team.conference,
          division: team.division
        }
      })
    })
  })
  
  return allPlayers
}

// Get player by ID
export const getPlayerById = (playerId: string): Player | undefined => {
  const allPlayers = getAllPlayers()
  return allPlayers.find(player => player.id === playerId)
}

// Get players by team
export const getPlayersByTeam = (teamId: string): Player[] => {
  const allPlayers = getAllPlayers()
  return allPlayers.filter(player => player.team.id === teamId)
}

// Get players by position
export const getPlayersByPosition = (position: string): Player[] => {
  const allPlayers = getAllPlayers()
  return allPlayers.filter(player => player.position.toLowerCase() === position.toLowerCase())
}

// Get players by conference
export const getPlayersByConference = (conference: 'AFC' | 'NFC'): Player[] => {
  const allPlayers = getAllPlayers()
  return allPlayers.filter(player => player.team.conference === conference)
}

// Search players by name
export const searchPlayersByName = (searchTerm: string): Player[] => {
  const allPlayers = getAllPlayers()
  return allPlayers.filter(player => 
    player.name.toLowerCase().includes(searchTerm.toLowerCase())
  )
}

// Get unique positions
export const getAllPositions = (): string[] => {
  const allPlayers = getAllPlayers()
  const positions = new Set(allPlayers.map(player => player.position))
  return Array.from(positions).sort()
}

// Get featured players (e.g., QBs from premium teams)
export const getFeaturedPlayers = (): Player[] => {
  const allPlayers = getAllPlayers()
  return allPlayers.filter(player => 
    player.position === 'QB' || 
    ['Patrick Mahomes', 'Josh Allen', 'Lamar Jackson'].includes(player.name)
  ).slice(0, 8)
} 