export interface NFLTeam {
  id: string
  name: string
  city: string
  abbreviation: string
  conference: 'AFC' | 'NFC'
  division: string
  logo: string
  primaryColor: string
  secondaryColor: string
  founded: number
  stadium: string
  headCoach: string
  generalManager: string
  owner: string
  championships: number
  playoffAppearances: number
  record2023: string
  isPremium: boolean
  description: string
  keyPlayers: {
    name: string
    position: string
    number: number
    image: string
    height: string
    weight: string
    college: string
  }[]
  socialMedia: {
    website: string
    facebook: string
    instagram: string
    twitter: string
  }[]
  recentNews: {
    title: string
    date: string
    summary: string
  }[]
  premiumInsights?: {
    salary_cap_situation: string
    draft_strategy: string
    trade_rumors: string
    injury_report: string
    coaching_analysis: string
  }
  detailedAnalysis: string
}

export const nflTeams: NFLTeam[] = [
  {
    id: 'arizona-cardinals',
    name: 'Arizona Cardinals',
    city: 'Arizona',
    abbreviation: 'ARI',
    conference: 'NFC',
    division: 'NFC West',
    logo: '/ARI.webp',
    primaryColor: '#E31837',
    secondaryColor: '#FFB81C',
    founded: 1960,
    stadium: 'Arrowhead Stadium',
    headCoach: 'Andy Reid',
    generalManager: 'Brett Veach',
    owner: 'Clark Hunt',
    championships: 3,
    playoffAppearances: 12,
    record2023: '11-6',
    isPremium: true,
    description: 'The Kansas City Chiefs are the defending Super Bowl champions and one of the most dynamic teams in the NFL, led by superstar quarterback Patrick Mahomes.',
    keyPlayers: [
      { name: 'Clayton Tune', position: 'QB', number: 15, image: '/clayton-tune.jpg', height: '6-3"', weight: '225', college: 'Houston' },
      { name: 'Desmond Ridder', position: 'QB', number: 1, image: '/clayton-tune.jpg', height: '6-3"', weight: '220', college: 'Cincinnati' },
      { name: 'Emari Demercado', position: 'DT', number: 95, image: '/clayton-tune.jpg', height: '6-5"', weight: '300', college: 'Missourri' },
      { name: 'Greg Dortch', position: 'WR', number: 10, image: '/clayton-tune.jpg', height: '5-10"', weight: '180', college: 'West Alabama' },
      { name: 'Kyle Pitts', position: 'TE', number: 10, image: '/clayton-tune.jpg', height: '6-6"', weight: '240', college: 'Florida' },
      { name: 'Rondale Moore', position: 'WR', number: 11, image: '/clayton-tune.jpg', height: '5-9"', weight: '180', college: 'Purdue' },
      { name: 'Rondale Moore', position: 'WR', number: 11, image: '/clayton-tune.jpg', height: '5-9"', weight: '180', college: 'Purdue' },
      { name: 'Rondale Moore', position: 'WR', number: 11, image: '/clayton-tune.jpg', height: '5-9"', weight: '180', college: 'Purdue' },
      { name: 'Rondale Moore', position: 'WR', number: 11, image: '/clayton-tune.jpg', height: '5-9"', weight: '180', college: 'Purdue' },
      { name: 'Rondale Moore', position: 'WR', number: 11, image: '/clayton-tune.jpg', height: '5-9"', weight: '180', college: 'Purdue' },
      { name: 'Rondale Moore', position: 'WR', number: 11, image: '/clayton-tune.jpg', height: '5-9"', weight: '180', college: 'Purdue' },
      { name: 'Rondale Moore', position: 'WR', number: 11, image: '/clayton-tune.jpg', height: '5-9"', weight: '180', college: 'Purdue' },
    ],
    recentNews: [
      {
        title: 'Chiefs Sign Key Players to Extensions',
        date: '2024-01-15',
        summary: 'Kansas City secures their core with multi-year deals for championship window.'
      },
      {
        title: 'Mahomes Named to Pro Bowl',
        date: '2024-01-12',
        summary: 'Quarterback earns his sixth Pro Bowl selection in dominant season.'
      }
    ],
    socialMedia: [
      {
        website: 'https://www.azcardinals.com/',
        facebook: 'https://www.facebook.com/arizonacardinals',
        instagram: 'https://www.instagram.com/azcardinals',
        twitter: 'https://x.com/AZCardinals',
      }
    ],
    detailedAnalysis: `
      <h2>Championship DNA</h2>
      <p>The Kansas City Chiefs have established themselves as the premier franchise in the NFL, winning three Super Bowls in five years. Under Andy Reid's innovative offensive system, the team has created a sustainable model for success.</p>
      
      <h3>Offensive Excellence</h3>
      <p>Led by Patrick Mahomes, the Chiefs' offense is predicated on creative play-calling, exceptional quarterback play, and versatile skill position players. Travis Kelce remains the most dominant tight end in football, while the receiving corps provides multiple threats.</p>
      
      <h3>Defensive Evolution</h3>
      <p>The Chiefs' defense has evolved from a liability to a strength, anchored by Chris Jones and a young secondary that has shown remarkable improvement. Defensive coordinator Steve Spagnuolo has crafted schemes that complement the team's offensive firepower.</p>
      
      <h3>Championship Window</h3>
      <p>With Mahomes in his prime and a strong supporting cast, the Chiefs' championship window remains wide open. The organization's commitment to retaining key players while developing young talent ensures continued success.</p>
    `
  },
  {
    id: 'atlanta-falcons',
    name: 'Atlanta Falcons',
    city: 'Atlanta',
    abbreviation: 'ATL',
    conference: 'NFC',
    division: 'NFC South',
    logo: '/ATL.webp',
    primaryColor: '#AA0000',
    secondaryColor: '#B3995D',
    founded: 1946,
    stadium: 'Levi\'s Stadium',
    headCoach: 'Kyle Shanahan',
    generalManager: 'John Lynch',
    owner: 'Jed York',
    championships: 5,
    playoffAppearances: 28,
    record2023: '12-5',
    isPremium: true,
    description: 'The San Francisco 49ers are one of the most successful franchises in NFL history, known for their innovative offensive schemes and dominant defense.',
    keyPlayers: [
      { name: 'Brock Purdy', position: 'QB', number: 13, image: '/brock-purdy.webp', height: '6-2"', weight: '210', college: 'Iowa State' },
      { name: 'Christian McCaffrey', position: 'RB', number: 23, image: '/christian-mccaffrey.webp', height: '5-10"', weight: '210', college: 'Stanford' },
        { name: 'Nick Bosa', position: 'DE', number: 97, image: '/nick-bosa.webp', height: '6-5"', weight: '265', college: 'Ohio State' },
      { name: 'Deebo Samuel', position: 'WR', number: 19, image: '/deebo-samuel.webp', height: '6-0"', weight: '205', college: 'South Carolina' }     
    ],
    recentNews: [
      {
        title: '49ers Extend Key Defensive Players',
        date: '2024-01-14',
        summary: 'San Francisco locks up core defensive talent for championship push.'
      },
      {
        title: 'Purdy\'s Remarkable Sophomore Season',
        date: '2024-01-10',
        summary: 'Second-year quarterback continues to exceed expectations as team leader.'
      }
    ],
    socialMedia: [
      {
        website: 'https://www.azcardinals.com/',
        facebook: 'https://www.facebook.com/arizonacardinals',
        instagram: 'https://www.instagram.com/azcardinals',
        twitter: 'https://x.com/AZCardinals',
      }
    ],
    premiumInsights: {
      salary_cap_situation: 'The 49ers are projected to be $18M over the cap, requiring strategic restructures and potential releases. Key decisions loom on aging veterans and extension candidates.',
      draft_strategy: 'Focus on offensive line depth and secondary help. The team may trade up for elite talent if QB situation resolves favorably.',
      trade_rumors: 'Multiple veterans could be moved to create cap space. Brandon Aiyuk and several defensive players are generating trade interest.',
      injury_report: 'CMC dealing with minor knee issues, Bosa managing wrist injury. Both expected healthy for playoffs.',
      coaching_analysis: 'Shanahan\'s system maximizes player potential, but question marks remain about big-game execution and play-calling in crucial moments.'
    },
    detailedAnalysis: `
      <h2>Championship Contender Analysis</h2>
      <p>The San Francisco 49ers represent one of the most complete teams in the NFL, combining elite coaching with top-tier talent across multiple position groups. Kyle Shanahan's innovative offensive system has created a sustainable model for success.</p>
      
      <h3>Offensive Innovation</h3>
      <p>The 49ers' offense under Shanahan is a masterclass in scheme and execution. The zone-running game creates explosive plays, while the passing attack utilizes motion and misdirection to create favorable matchups. Brock Purdy's emergence as a franchise quarterback has elevated the entire unit.</p>
      
      <h3>Defensive Dominance</h3>
      <p>Nick Bosa leads one of the NFL's most fearsome pass rushes, while the secondary has developed into a ballhawking unit. The linebacker corps provides excellent coverage and run support, making this defense nearly impossible to sustain drives against.</p>
      
      <h3>Premium Analysis: Championship Window</h3>
      <p>With salary cap constraints looming, the 49ers face critical decisions that will determine their championship window. The organization must balance retaining core talent with adding complementary pieces through the draft and strategic free agency.</p>
      
      <p>Advanced metrics show the 49ers ranking in the top 5 in most efficiency categories, but questions remain about their ability to close out championship games. The combination of talent and coaching gives them multiple paths to success.</p>
    `
  },
  {
    id: 'buffalo-bills',
    name: 'Buffalo Bills',
    city: 'Buffalo',
    abbreviation: 'BUF',
    conference: 'AFC',
    division: 'AFC East',
    logo: '/BUF.webp',
    primaryColor: '#00338D',
    secondaryColor: '#C60C30',
    founded: 1960,
    stadium: 'Highmark Stadium',
    headCoach: 'Sean McDermott',
    generalManager: 'Brandon Beane',
    owner: 'Terry Pegula',
    championships: 0,
    playoffAppearances: 21,
    record2023: '11-6',
    isPremium: true,
    description: 'The Buffalo Bills are perennial AFC contenders led by dynamic quarterback Josh Allen and a passionate fanbase known as Bills Mafia.',
    keyPlayers: [
      { name: 'Josh Allen', position: 'QB', number: 17, image: '/josh-allen.webp', height: '6-5"', weight: '230', college: 'Wyoming' },
      { name: 'Stefon Diggs', position: 'WR', number: 14, image: '/stefon-diggs.webp', height: '6-1"', weight: '190', college: 'Maryland' },
      { name: 'Von Miller', position: 'OLB', number: 40, image: '/von-miller.webp', height: '6-3"', weight: '250', college: 'Texas A&M' },
      { name: 'Matt Milano', position: 'LB', number: 58, image: '/matt-milano.webp', height: '6-2"', weight: '210', college: 'Boston College' }
    ],
    recentNews: [
      {
        title: 'Bills Clinch AFC East Division',
        date: '2024-01-16',
        summary: 'Buffalo secures fourth consecutive division title with dominant performance.'
      },
      {
        title: 'Josh Allen MVP Candidate',
        date: '2024-01-13',
        summary: 'Quarterback\'s exceptional season puts him in MVP conversation.'
      }
    ],
    socialMedia: [
      {
        website: 'https://www.azcardinals.com/',
        facebook: 'https://www.facebook.com/arizonacardinals',
        instagram: 'https://www.instagram.com/azcardinals',
        twitter: 'https://x.com/AZCardinals',
      }
    ],
    detailedAnalysis: `
      <h2>The Josh Allen Era</h2>
      <p>The Buffalo Bills have transformed into legitimate Super Bowl contenders behind the dynamic play of Josh Allen. The franchise has built a culture of excellence that resonates throughout western New York.</p>
      
      <h3>Offensive Evolution</h3>
      <p>Josh Allen's development from raw prospect to elite quarterback has been remarkable. His combination of arm strength, mobility, and improved decision-making makes Buffalo's offense one of the most explosive in the NFL.</p>
      
      <h3>Defensive Identity</h3>
      <p>Sean McDermott's defensive system emphasizes speed, aggression, and situational awareness. The Bills' defense thrives in creating turnovers and pressuring opposing quarterbacks, though consistency against elite rushing attacks remains a concern.</p>
      
      <h3>Championship Pursuit</h3>
      <p>The Bills' championship window is wide open with Allen in his prime. The organization's commitment to surrounding him with talent while maintaining defensive competitiveness creates multiple paths to playoff success.</p>
    `
  },
  {
    id: 'dallas-cowboys',
    name: 'Dallas Cowboys',
    city: 'Dallas',
    abbreviation: 'DAL',
    conference: 'NFC',
    division: 'NFC East',
    logo: '/teams/dallas-cowboys.png',
    primaryColor: '#003594',
    secondaryColor: '#869397',
    founded: 1960,
    stadium: 'AT&T Stadium',
    headCoach: 'Mike McCarthy',
    generalManager: 'Jerry Jones',
    owner: 'Jerry Jones',
    championships: 5,
    playoffAppearances: 35,
    record2023: '12-5',
    isPremium: true,
    description: 'America\'s Team, the Dallas Cowboys are one of the most valuable and recognizable franchises in professional sports.',
    keyPlayers: [
      { name: 'Dak Prescott', position: 'QB', number: 4, image: '/dak-prescott.webp', height: '6-2"', weight: '230', college: 'Missourri' },
      { name: 'CeeDee Lamb', position: 'WR', number: 88, image: '/cee-dee-lamb.webp', height: '6-1"', weight: '190', college: 'Oklahoma' },
      { name: 'Micah Parsons', position: 'LB', number: 11, image: '/micah-parsons.webp', height: '6-3"', weight: '240', college: 'Penn State' },
      { name: 'Trevon Diggs', position: 'CB', number: 7, image: '/trevon-diggs.webp', height: '6-0"', weight: '190', college: 'Alabama' }
    ],
    recentNews: [
      {
        title: 'Cowboys Face Salary Cap Decisions',
        date: '2024-01-17',
        summary: 'Dallas must make tough choices with key players entering contract years.'
      },
      {
        title: 'Parsons Named Defensive Player of Year Finalist',
        date: '2024-01-14',
        summary: 'Linebacker\'s dominant season earns recognition as top defensive player.'
      }
    ],
    socialMedia: [
      {
        website: 'https://www.azcardinals.com/',
        facebook: 'https://www.facebook.com/arizonacardinals',
        instagram: 'https://www.instagram.com/azcardinals',
        twitter: 'https://x.com/AZCardinals',
      }
    ],
    premiumInsights: {
      salary_cap_situation: 'Dallas faces a projected $23M cap deficit with major decisions on Prescott ($55M cap hit) and other veterans. Restructures and potential releases are inevitable.',
      draft_strategy: 'Cowboys prioritizing defensive line depth and offensive line youth. May trade back to accumulate picks given limited cap space.',
      trade_rumors: 'Brandin Cooks and several defensive veterans mentioned in trade discussions. Team exploring options to create cap flexibility.',
      injury_report: 'Prescott managing minor ankle issue, Parsons dealing with shoulder soreness. Both expected healthy for postseason.',
      coaching_analysis: 'McCarthy faces pressure to deliver playoff success. His conservative approach in big games has been criticized by ownership and fanbase.'
    },
    detailedAnalysis: `
      <h2>America's Team Under Pressure</h2>
      <p>The Dallas Cowboys enter 2024 with championship expectations but significant challenges. Jerry Jones' aggressive approach to roster building has created both opportunities and constraints that will define the franchise's immediate future.</p>
      
      <h3>Offensive Capabilities</h3>
      <p>Dak Prescott's leadership and CeeDee Lamb's emergence have created a potent passing attack. The Cowboys' offensive line, while aging, remains effective when healthy. However, questions persist about the running game and red zone efficiency.</p>
      
      <h3>Defensive Transformation</h3>
      <p>Micah Parsons has revolutionized Dallas' defense, providing elite pass rush from multiple positions. Trevon Diggs' ball-hawking ability creates game-changing moments, though consistency in coverage remains a concern.</p>
      
      <h3>Premium Analysis: Championship Window</h3>
      <p>The Cowboys' championship window is narrowing due to salary cap constraints and an aging core. Advanced analytics show Dallas ranking highly in most offensive categories but struggling in crucial defensive metrics against elite competition.</p>
      
      <p>Insider sources indicate significant roster changes are inevitable, with the organization prioritizing youth and salary cap flexibility. The next two seasons will determine whether this core group can deliver the franchise's first championship since 1995.</p>
    `
  },
  {
    id: 'philadelphia-eagles',
    name: 'Philadelphia Eagles',
    city: 'Philadelphia',
    abbreviation: 'PHI',
    conference: 'NFC',
    division: 'NFC East',
    logo: '/teams/philadelphia-eagles.png',
    primaryColor: '#004C54',
    secondaryColor: '#A5ACAF',
    founded: 1933,
    stadium: 'Lincoln Financial Field',
    headCoach: 'Nick Sirianni',
    generalManager: 'Howie Roseman',
    owner: 'Jeffrey Lurie',
    championships: 1,
    playoffAppearances: 28,
    record2023: '11-6',
    isPremium: true,
    description: 'The Philadelphia Eagles are known for their passionate fanbase and aggressive, physical style of play that embodies the city of Philadelphia.',
    keyPlayers: [
      { name: 'Jalen Hurts', position: 'QB', number: 1, image: '/jalen-hurts.webp', height: '6-2"', weight: '220', college: 'Alabama' },
      { name: 'A.J. Brown', position: 'WR', number: 11, image: '/a-j-brown.webp', height: '6-1"', weight: '210', college: 'Ole Miss' },
      { name: 'Lane Johnson', position: 'OT', number: 65, image: '/lane-johnson.webp', height: '6-7"', weight: '310', college: 'Oklahoma' },
      { name: 'Haason Reddick', position: 'OLB', number: 7, image: '/haason-reddick.webp', height: '6-3"', weight: '240', college: 'Temple' }
    ],
    recentNews: [
      {
        title: 'Eagles Bounce Back from Slow Start',
        date: '2024-01-15',
        summary: 'Philadelphia overcomes early season struggles to secure playoff berth.'
      },
      {
        title: 'Hurts\' Leadership Praised by Teammates',
        date: '2024-01-11',
        summary: 'Quarterback\'s growth as leader evident in team\'s late season surge.'
      }
    ],
    socialMedia: [
      {
        website: 'https://www.azcardinals.com/',
        facebook: 'https://www.facebook.com/arizonacardinals',
        instagram: 'https://www.instagram.com/azcardinals',
        twitter: 'https://x.com/AZCardinals',
      }
    ],
    premiumInsights: {
      salary_cap_situation: 'Eagles have moderate cap space but face decisions on aging veterans. Extension talks with Hurts and other core players will shape future flexibility.',
      draft_strategy: 'Philadelphia focusing on defensive depth and offensive line succession planning. May target early-round linebacker and safety.',
      trade_rumors: 'Several veterans could be moved if team misses playoffs. Focus on getting younger while maintaining competitive core.',
      injury_report: 'Hurts managing minor shoulder issue, Brown dealing with knee soreness. Both practicing fully.',
      coaching_analysis: 'Sirianni\'s aggressive philosophy aligns with team culture, but game management and situational play-calling need improvement.'
    },
    detailedAnalysis: `
      <h2>Resilience and Championship Pursuit</h2>
      <p>The Philadelphia Eagles have shown remarkable resilience, overcoming early season adversity to position themselves as legitimate contenders. Howie Roseman's aggressive roster construction has created a team built for sustained success.</p>
      
      <h3>Offensive Identity</h3>
      <p>Jalen Hurts' dual-threat ability anchors an offense that can attack defenses in multiple ways. A.J. Brown's addition has transformed the passing game, while the offensive line remains among the NFL's best units when healthy.</p>
      
      <h3>Defensive Evolution</h3>
      <p>The Eagles' defense has evolved from liability to strength, featuring improved pass rush and secondary play. The unit's physical style reflects the city's mentality and creates problems for opposing offenses.</p>
      
      <h3>Premium Analysis: Building for Tomorrow</h3>
      <p>Philadelphia's success stems from strategic roster building that balances immediate competitiveness with long-term sustainability. Advanced metrics show improvement in crucial areas, though concerns remain about consistency against elite competition.</p>
      
      <p>The organization's commitment to developing young talent while maintaining veteran leadership creates multiple pathways to championship contention. The next two seasons will determine whether this group can capture the franchise's second Super Bowl title.</p>
    `
  },
  {
    id: 'green-bay-packers',
    name: 'Green Bay Packers',
    city: 'Green Bay',
    abbreviation: 'GB',
    conference: 'NFC',
    division: 'NFC North',
    logo: '/teams/green-bay-packers.png',
    primaryColor: '#203731',
    secondaryColor: '#FFB612',
    founded: 1919,
    stadium: 'Lambeau Field',
    headCoach: 'Matt LaFleur',
    generalManager: 'Brian Gutekunst',
    owner: 'Public Ownership',
    championships: 4,
    playoffAppearances: 36,
    record2023: '9-8',
    isPremium: true,
    description: 'The Green Bay Packers are the NFL\'s only publicly-owned team, with a rich history and legendary home field advantage at Lambeau Field.',
    keyPlayers: [
      { name: 'Jordan Love', position: 'QB', number: 10, image: '/jordan-love.webp', height: '6-3"', weight: '210', college: 'Utah State' },
      { name: 'Christian Watson', position: 'WR', number: 9, image: '/christian-watson.webp', height: '6-3"', weight: '205', college: 'Northwestern' },
      { name: 'Jaire Alexander', position: 'CB', number: 23, image: '/jaire-alexander.webp', height: '6-0"', weight: '190', college: 'Louisville' },
      { name: 'Rashan Gary', position: 'OLB', number: 52, image: '/rashan-gary.webp', height: '6-4"', weight: '265', college: 'Michigan' }
    ],
    recentNews: [
      {
        title: 'Love Leads Packers to Playoff Berth',
        date: '2024-01-16',
        summary: 'Young quarterback proves himself in crucial late-season games.'
      },
      {
        title: 'Packers\' Young Core Shows Promise',
        date: '2024-01-12',
        summary: 'Green Bay\'s youth movement paying dividends for future success.'
      }
    ],
    socialMedia: [
      {
        website: 'https://www.azcardinals.com/',
        facebook: 'https://www.facebook.com/arizonacardinals',
        instagram: 'https://www.instagram.com/azcardinals',
        twitter: 'https://x.com/AZCardinals',
      }
    ],
    detailedAnalysis: `
      <h2>The Post-Rodgers Era</h2>
      <p>The Green Bay Packers have successfully navigated the transition from Aaron Rodgers to Jordan Love, establishing a foundation for sustained success. The organization's commitment to developing young talent while maintaining competitive standards has created optimism for the future.</p>
      
      <h3>Offensive Development</h3>
      <p>Jordan Love's emergence as a franchise quarterback has validated the Packers' patient approach to succession planning. Matt LaFleur's offensive system emphasizes Love's strengths while developing his decision-making and leadership skills.</p>
      
      <h3>Defensive Foundation</h3>
      <p>The Packers' defense has shown significant improvement, led by Jaire Alexander's elite coverage skills and Rashan Gary's pass rush ability. The unit's youth and athleticism provide hope for long-term success.</p>
      
      <h3>Lambeau Legacy</h3>
      <p>Playing at historic Lambeau Field continues to provide the Packers with a significant home field advantage. The franchise's unique ownership structure and community connection create a sustainable model for success.</p>
    `
  },
  {
    id: 'baltimore-ravens',
    name: 'Baltimore Ravens',
    city: 'Baltimore',
    abbreviation: 'BAL',
    conference: 'AFC',
    division: 'AFC North',
    logo: '/BAL.webp',
    primaryColor: '#241773',
    secondaryColor: '#000000',
    founded: 1996,
    stadium: 'M&T Bank Stadium',
    headCoach: 'John Harbaugh',
    generalManager: 'Eric DeCosta',
    owner: 'Steve Bisciotti',
    championships: 2,
    playoffAppearances: 15,
    record2023: '13-4',
    isPremium: true,
    description: 'The Baltimore Ravens are known for their physical, hard-hitting style and have been one of the most consistent franchises since their inception.',
    keyPlayers: [
      { name: 'Lamar Jackson', position: 'QB', number: 8, image: '/lamar-jackson.webp', height: '6-2"', weight: '220', college: 'Louisville' },
      { name: 'Mark Andrews', position: 'TE', number: 89, image: '/mark-andrews.webp', height: '6-5"', weight: '250', college: 'Oklahoma' },
      { name: 'Roquan Smith', position: 'LB', number: 18, image: '/roquan-smith.webp', height: '6-2"', weight: '230', college: 'Georgia' },
      { name: 'Kyle Hamilton', position: 'S', number: 14, image: '/kyle-hamilton.webp', height: '6-2"', weight: '205', college: 'Alabama' }
    ],
    recentNews: [
      {
        title: 'Ravens Secure #1 AFC Seed',
        date: '2024-01-18',
        summary: 'Baltimore earns home field advantage throughout AFC playoffs.'
      },
      {
        title: 'Jackson Named MVP Finalist',
        date: '2024-01-15',
        summary: 'Quarterback\'s exceptional season puts him in MVP race once again.'
      }
    ],
    socialMedia: [
      {
        website: 'https://www.azcardinals.com/',
        facebook: 'https://www.facebook.com/arizonacardinals',
        instagram: 'https://www.instagram.com/azcardinals',
        twitter: 'https://x.com/AZCardinals',
      }
    ],
    premiumInsights: {
      salary_cap_situation: 'Ravens have excellent cap management with Jackson\'s extension providing flexibility. Positioned well for key re-signings and strategic additions.',
      draft_strategy: 'Baltimore targeting defensive depth and offensive line help. May trade up for premium talent given strong cap position.',
      trade_rumors: 'Team exploring veteran additions for playoff push. Multiple teams have inquired about Ravens\' depth players.',
      injury_report: 'Jackson dealing with minor back tightness, Andrews managing knee issue. Both expected to be full-go for playoffs.',
      coaching_analysis: 'Harbaugh\'s experience and adaptability have been crucial to team success. His playoff pedigree gives Ravens significant advantage.'
    },
    detailedAnalysis: `
      <h2>Championship Caliber Organization</h2>
      <p>The Baltimore Ravens have established themselves as the AFC's premier team, combining elite quarterback play with dominant defense. John Harbaugh's leadership and Eric DeCosta's roster construction have created a championship-caliber organization.</p>
      
      <h3>Offensive Revolution</h3>
      <p>Lamar Jackson's unique skill set has revolutionized the Ravens' offense, creating a system that's virtually impossible to replicate. The running game, anchored by Jackson and a talented backfield, sets up explosive passing opportunities.</p>
      
      <h3>Defensive Dominance</h3>
      <p>The Ravens' defense represents the gold standard in the NFL, combining speed, athleticism, and football intelligence. Roquan Smith's addition has elevated an already elite unit to historic levels.</p>
      
      <h3>Premium Analysis: Super Bowl Favorites</h3>
      <p>Advanced metrics show the Ravens as the most complete team in football, ranking in the top 5 in nearly every major category. Their unique offensive system, combined with elite defense, creates matchup nightmares for opponents.</p>
      
      <p>Championship probability models give Baltimore the highest likelihood of reaching the Super Bowl, with their combination of talent, coaching, and organizational culture providing multiple advantages over the competition.</p>
    `
  },
  {
    id: 'cincinnati-bengals',
    name: 'Cincinnati Bengals',
    city: 'Cincinnati',
    abbreviation: 'CIN',
    conference: 'AFC',
    division: 'AFC North',
    logo: '/CIN.webp',
    primaryColor: '#008E97',
    secondaryColor: '#FC4C02',
    founded: 1966,
    stadium: 'Hard Rock Stadium',
    headCoach: 'Mike McDaniel',
    generalManager: 'Chris Grier',
    owner: 'Stephen Ross',
    championships: 2,
    playoffAppearances: 23,
    record2023: '11-6',
    isPremium: true,
    description: 'The Miami Dolphins are known for their explosive offense and the only perfect season in NFL history (1972).',
    keyPlayers: [
      { name: 'Tua Tagovailoa', position: 'QB', number: 1, image: '/tua-tagovailoa.webp', height: '6-2"', weight: '220', college: 'Alabama' },
      { name: 'Tyreek Hill', position: 'WR', number: 10, image: '/tyreek-hill.webp', height: '5-10"', weight: '180', college: 'West Alabama' },
      { name: 'Jaylen Waddle', position: 'WR', number: 17, image: '/jaylen-waddle.webp', height: '5-10"', weight: '190', college: 'Alabama' },
      { name: 'Bradley Chubb', position: 'OLB', number: 2, image: '/bradley-chubb.webp', height: '6-3"', weight: '250', college: 'North Carolina State' }
    ],
    recentNews: [
      {
        title: 'Dolphins\' Speed Creates Matchup Problems',
        date: '2024-01-14',
        summary: 'Miami\'s explosive offense continues to challenge NFL defenses.'
      },
      {
        title: 'Tua\'s Health Key to Playoff Success',
        date: '2024-01-11',
        summary: 'Quarterback\'s availability crucial for team\'s championship hopes.'
      }
    ],
    socialMedia: [
      {
        website: 'https://www.azcardinals.com/',
        facebook: 'https://www.facebook.com/arizonacardinals',
        instagram: 'https://www.instagram.com/azcardinals',
        twitter: 'https://x.com/AZCardinals',
      }
    ],
    detailedAnalysis: `
      <h2>Speed and Innovation</h2>
      <p>The Miami Dolphins have transformed into one of the NFL's most explosive offensive teams under Mike McDaniel's innovative system. The combination of scheme and speed creates unique challenges for opposing defenses.</p>
      
      <h3>Offensive Explosion</h3>
      <p>Tua Tagovailoa's quick release and accuracy perfectly complement the speed of Tyreek Hill and Jaylen Waddle. McDaniel's creative use of motion and misdirection maximizes the team's athletic advantages.</p>
      
      <h3>Defensive Development</h3>
      <p>While the offense garners attention, the Dolphins' defense has shown significant improvement. The pass rush, led by Bradley Chubb, provides pressure that allows the secondary to create turnovers.</p>
      
      <h3>Championship Potential</h3>
      <p>Miami's success depends heavily on Tua's health and the defense's continued development. When fully healthy, the Dolphins possess the explosive capability to compete with any team in the league.</p>
    `
  }
]

export const getTeamById = (id: string): NFLTeam | undefined => {
  return nflTeams.find(team => team.id === id)
}

export const getTeamByName = (name: string): NFLTeam | undefined => {
  const formattedName = name.toLowerCase().replace(/\s+/g, '-')
  return nflTeams.find(team => team.id === formattedName || team.name.toLowerCase() === name.toLowerCase())
}

export const getPremiumTeams = (): NFLTeam[] => {
  return nflTeams.filter(team => team.isPremium)
}

export const getFreeTeams = (): NFLTeam[] => {
  return nflTeams.filter(team => !team.isPremium)
}

export const getTeamsByConference = (conference: 'AFC' | 'NFC'): NFLTeam[] => {
  return nflTeams.filter(team => team.conference === conference)
}

export const getTeamsByDivision = (division: string): NFLTeam[] => {
  return nflTeams.filter(team => team.division === division)
} 