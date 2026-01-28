/**
 * TypeScript interfaces for position-specific prospect statistics
 */

/**
 * Quarterback statistics interface
 */
export interface QBStats {
  careerPassAttempts: string;
  careerYardsPerAttempt: string;
  careerCompletionPercentage: string;
  bestSeasonCompletionPercentage: string;
  bestSeasonPassingYards: string;
  bestSeasonTouchdowns: string;
  bestSeasonRushYards: string;
  careerInterceptionRate: string;
}

/**
 * Tight End statistics interface
 */
export interface TEStats {
  wingspan: string;
  fortyTime: string;
  twentyYardShuttle: string;
  speedScore: string;
  collegeYardsPerReception: string;
  bestSeasonYardsPerReception: string;
  bestSeasonReceivingYards: string;
  careerYardsAfterCatchPerReception: string;
  bestSeasonYardsPerTeamPassAttempt: string;
  careerADOT: string;
  careerYardsPerRouteRun: string;
  bestSeasonYardsPerRouteRun: string;
  bestSeasonFirstDownPerRouteRun: string;
  careerFirstDownPerRouteRun: string;
}

/**
 * Running Back statistics interface
 */
export interface RBStats {
  bmi: string;
  fortyTime: string;
  tenYardSplit: string;
  speedScore: string;
  burstScore: string;
  careerYardsPerCarry: string;
  yardsAfterContactPerAttempt: string;
  missedTacklesForcedPerAttempt: string;
  singleSeasonReceptions: string;
  yardsPerReception: string;
  careerTargetsPerRouteRun: string;
  bestSeasonTargetsPerRouteRun: string;
  careerTargetShare: string;
  bestSeasonTargetShare: string;
  careerScrimmageYardsPerTeamPlay: string;
  bestSeasonScrimmageYardsPerTeamPlay: string;
  first1000ScrimmageYardSeason: string;
}

/**
 * Wide Receiver statistics interface
 */
export interface WRStats {
  earlyDeclare: string;
  rating247: string;
  careerAlignment: string;
  fortyTime: string;
  speedScore: string;
  collegeTargetShare: string;
  breakoutAge: string;
  careerReceivingYardsPerGame: string;
  finalYearReceivingYardsPerGame: string;
  careerYardsPerReception: string;
  finalYearYardsPerReception: string;
  careerADOT: string;
  finalYearADOT: string;
  yardsPerTeamPassAttempt: string;
  careerYardsPerRouteRun: string;
  finalYearYardsPerRouteRun: string;
  careerFirstDownPerRouteRunRate: string;
  bestYearFirstDownPerRouteRunRate: string;
}

/**
 * Union type for all position-specific prospect statistics
 */
export type ProspectStats = QBStats | TEStats | RBStats | WRStats;
