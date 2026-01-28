/**
 * Utility functions for formatting and displaying prospect statistics
 */

type StatKey = string;

/**
 * Maps stat keys to human-readable labels
 */
const STAT_LABELS: Record<StatKey, string> = {
  // QB Stats
  careerPassAttempts: 'Career Pass Attempts',
  careerYardsPerAttempt: 'Career Yards Per Attempt',
  careerCompletionPercentage: 'Career Completion %',
  bestSeasonCompletionPercentage: 'Best Season Completion %',
  bestSeasonPassingYards: 'Best Season Passing Yards',
  bestSeasonTouchdowns: 'Best Season Touchdowns',
  bestSeasonRushYards: 'Best Season Rush Yards',
  careerInterceptionRate: 'Career Interception Rate',
  
  // TE Stats
  wingspan: 'Wingspan',
  fortyTime: '40-Yard Dash',
  twentyYardShuttle: '20-Yard Shuttle',
  speedScore: 'Speed Score',
  collegeYardsPerReception: 'College Yards Per Reception',
  bestSeasonYardsPerReception: 'Best Season Yards Per Reception',
  bestSeasonReceivingYards: 'Best Season Receiving Yards',
  careerYardsAfterCatchPerReception: 'Career YAC Per Reception',
  bestSeasonYardsPerTeamPassAttempt: 'Best Season Yards Per Team Pass Attempt',
  careerADOT: 'Career ADOT',
  careerYardsPerRouteRun: 'Career Yards Per Route Run',
  bestSeasonYardsPerRouteRun: 'Best Season Yards Per Route Run',
  bestSeasonFirstDownPerRouteRun: 'Best Season First Down Per Route Run',
  careerFirstDownPerRouteRun: 'Career First Down Per Route Run',
  
  // RB Stats
  bmi: 'BMI',
  tenYardSplit: '10-Yard Split',
  burstScore: 'Burst Score',
  careerYardsPerCarry: 'Career Yards Per Carry',
  yardsAfterContactPerAttempt: 'Yards After Contact Per Attempt',
  missedTacklesForcedPerAttempt: 'Missed Tackles Forced Per Attempt',
  singleSeasonReceptions: 'Single Season Receptions',
  yardsPerReception: 'Yards Per Reception',
  careerTargetsPerRouteRun: 'Career Targets Per Route Run',
  bestSeasonTargetsPerRouteRun: 'Best Season Targets Per Route Run',
  careerTargetShare: 'Career Target Share',
  bestSeasonTargetShare: 'Best Season Target Share',
  careerScrimmageYardsPerTeamPlay: 'Career Scrimmage Yards Per Team Play',
  bestSeasonScrimmageYardsPerTeamPlay: 'Best Season Scrimmage Yards Per Team Play',
  first1000ScrimmageYardSeason: 'First 1000 Scrimmage Yard Season',
  
  // WR Stats
  earlyDeclare: 'Early Declare',
  rating247: '247 Rating',
  careerAlignment: 'Career Alignment',
  collegeTargetShare: 'College Target Share',
  breakoutAge: 'Breakout Age',
  careerReceivingYardsPerGame: 'Career Receiving Yards Per Game',
  finalYearReceivingYardsPerGame: 'Final Year Receiving Yards Per Game',
  careerYardsPerReception: 'Career Yards Per Reception',
  finalYearYardsPerReception: 'Final Year Yards Per Reception',
  finalYearADOT: 'Final Year ADOT',
  yardsPerTeamPassAttempt: 'Yards Per Team Pass Attempt',
  finalYearYardsPerRouteRun: 'Final Year Yards Per Route Run',
  careerFirstDownPerRouteRunRate: 'Career First Down Per Route Run Rate',
  bestYearFirstDownPerRouteRunRate: 'Best Year First Down Per Route Run Rate',
};

/**
 * Gets a human-readable label for a stat key
 * @param key - The stat key
 * @returns Human-readable label
 */
export function getStatLabel(key: StatKey): string {
  return STAT_LABELS[key] || key;
}

/**
 * Formats a stat value with appropriate units and precision
 * @param key - The stat key
 * @param value - The stat value (string)
 * @returns Formatted stat value
 */
export function formatStatValue(key: StatKey, value: string | null | undefined): string {
  // Handle null/empty values
  if (!value || value.trim() === '') {
    return '-';
  }

  const numValue = parseFloat(value);
  
  // Handle non-numeric values
  if (isNaN(numValue)) {
    // Special handling for boolean-like values (e.g., earlyDeclare for WR)
    if (value.toLowerCase() === 'true' || value.toLowerCase() === 'yes' || value === '1') {
      return 'Yes';
    }
    if (value.toLowerCase() === 'false' || value.toLowerCase() === 'no' || value === '0') {
      return 'No';
    }
    // Return as-is for text values (like careerAlignment for WR)
    return value;
  }

  // Format based on stat type
  
  // Percentage stats
  if (key.includes('Percentage') || key.includes('Rate') || key.includes('Share')) {
    return `${numValue.toFixed(1)}%`;
  }
  
  // Time stats (40-yard dash, shuttle)
  if (key.includes('Time') || key.includes('Shuttle')) {
    return `${numValue.toFixed(2)}s`;
  }
  
  // Wingspan (in inches)
  if (key === 'wingspan') {
    return `${numValue.toFixed(1)}"`;
  }
  
  // BMI
  if (key === 'bmi') {
    return numValue.toFixed(1);
  }
  
  // Scores (Speed Score, Burst Score, RAS Score)
  if (key.includes('Score')) {
    return numValue.toFixed(1);
  }
  
  // Yards stats
  if (key.includes('Yards') && !key.includes('Per')) {
    return Math.round(numValue).toString();
  }
  
  // Per-attempt/per-carry/per-reception stats
  if (key.includes('Per') || key.includes('ADOT')) {
    return numValue.toFixed(2);
  }
  
  // Counting stats (attempts, touchdowns, receptions)
  if (key.includes('Attempts') || key.includes('Touchdowns') || key.includes('Receptions')) {
    return Math.round(numValue).toString();
  }
  
  // Age
  if (key.includes('Age')) {
    return numValue.toFixed(1);
  }
  
  // Rating
  if (key.includes('rating')) {
    return numValue.toFixed(2);
  }
  
  // Default: 2 decimal places
  return numValue.toFixed(2);
}

/**
 * Handles null or empty stat values
 * @param value - The stat value
 * @returns Formatted value or dash for null/empty
 */
export function handleNullValue(value: string | null | undefined): string {
  if (!value || value.trim() === '') {
    return '-';
  }
  return value;
}

/**
 * Formats all stats in an object
 * @param stats - Object containing stat key-value pairs
 * @returns Object with formatted values
 */
export function formatAllStats(stats: Record<string, string | null | undefined>): Record<string, string> {
  const formatted: Record<string, string> = {};
  
  for (const [key, value] of Object.entries(stats)) {
    formatted[key] = formatStatValue(key, value);
  }
  
  return formatted;
}
