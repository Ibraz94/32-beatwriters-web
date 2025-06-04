export interface Article {
  id: string
  title: string
  excerpt: string
  author: string
  publishDate: string
  readTime: string
  isPremium: boolean
  category: string
  image: string
  tags: string[]
  content: string
}

export const articles: Article[] = [
  {
    id: 'mahomes-mvp-season',
    title: 'Patrick Mahomes\' Path to Another MVP Season',
    excerpt: 'Analyzing the Kansas City quarterback\'s performance and what makes him the frontrunner for MVP honors this season.',
    author: 'Jake Sullivan',
    publishDate: '2024-01-15',
    readTime: '8 min read',
    isPremium: false,
    category: 'NFL Analysis',
    image: '/api/placeholder/800/400',
    tags: ['Mahomes', 'MVP', 'Chiefs', 'Analysis'],
    content: `
      <h2>The Making of an MVP Season</h2>
      <p>Patrick Mahomes has once again positioned himself as the frontrunner for the NFL MVP award, and his path to this achievement tells a compelling story of consistent excellence and clutch performances when it matters most.</p>
      
      <h3>Statistical Dominance</h3>
      <p>Through 16 games this season, Mahomes has thrown for 4,183 yards and 27 touchdowns while maintaining his characteristic efficiency. His passer rating of 105.2 ranks among the top three in the league, but it's not just the numbers that tell the story—it's when and how he accumulates them.</p>
      
      <p>In games decided by seven points or fewer, Mahomes has been virtually unstoppable, completing 68% of his passes for 1,847 yards and 12 touchdowns with just 2 interceptions. This clutch performance has been the difference between the Chiefs sitting atop the AFC and fighting for a wild card spot.</p>
      
      <h3>Leadership Under Pressure</h3>
      <p>What separates Mahomes from other elite quarterbacks isn't just his arm talent—it's his ability to elevate his teammates' performance in crucial moments. Wide receiver Tyreek Hill has publicly credited Mahomes with helping him achieve career-high numbers, while the offensive line has played some of their best football when protecting their franchise quarterback.</p>
      
      <h3>The Road Ahead</h3>
      <p>With two games remaining in the regular season, Mahomes needs just 317 more passing yards to reach 4,500 for the season—a mark that would further solidify his MVP candidacy. More importantly, his leadership will be crucial as the Chiefs navigate the playoffs with championship expectations.</p>
      
      <p>The combination of individual excellence, team success, and clutch performance makes Mahomes the clear favorite for MVP honors, continuing his trajectory as one of the game's all-time great quarterbacks.</p>
    `
  },
  {
    id: 'ravens-defense-breakdown',
    title: 'Baltimore Ravens Defense: Blueprint for Championship Success',
    excerpt: 'An in-depth look at how the Ravens\' defensive scheme has evolved and what it means for their playoff chances.',
    author: 'Marcus Thompson',
    publishDate: '2024-01-12',
    readTime: '12 min read',
    isPremium: true,
    category: 'Premium Analysis',
    image: '/api/placeholder/800/400',
    tags: ['Ravens', 'Defense', 'Playoffs', 'Strategy'],
    content: `
      <h2>The Evolution of Ravens Defense</h2>
      <p>The Baltimore Ravens have quietly assembled one of the most dominant defensive units in the NFL, and their sophisticated scheme is the blueprint that other championship contenders are trying to emulate.</p>
      
      <h3>Scheme Breakdown</h3>
      <p>Under defensive coordinator Mike Macdonald, the Ravens have implemented a hybrid system that seamlessly transitions between 3-4 and 4-3 fronts, confusing opposing offenses and creating mismatches across the field.</p>
      
      <h3>Key Personnel</h3>
      <p>Roquan Smith's addition has been transformative, providing the Ravens with an elite linebacker who can cover running backs, rush the passer, and stop the run with equal effectiveness. The secondary, anchored by safety Kyle Hamilton, has developed into one of the most versatile units in the league.</p>
      
      <h3>Advanced Analytics</h3>
      <p>According to our proprietary metrics, the Ravens defense ranks #1 in opponent adjusted yards per play and #2 in red zone efficiency, making them nearly impossible to score against in crucial situations. Their pressure rate of 31.2% leads the league, while their coverage grades rank in the top five across all defensive back positions.</p>
      
      <p><strong>Premium Insight:</strong> The Ravens' success stems from their unique ability to disguise coverage post-snap, with safety rotations that happen after the quarterback's initial read, leading to a league-high 23 interceptions. Film study reveals that opposing quarterbacks complete just 52% of their passes when the Ravens show pre-snap movement, compared to a league average of 64%.</p>
      
      <h3>Playoff Implications</h3>
      <p>This defensive prowess positions Baltimore as the most dangerous team entering the playoffs. Historical data shows that teams with top-3 defenses in both yards per play and red zone efficiency have a 73% success rate in advancing past the divisional round.</p>
    `
  },
  {
    id: 'draft-prospects-2024',
    title: '2024 NFL Draft: Top 10 Prospects to Watch',
    excerpt: 'College football stars making waves and positioning themselves for the upcoming NFL Draft.',
    author: 'Sarah Chen',
    publishDate: '2024-01-10',
    readTime: '15 min read',
    isPremium: true,
    category: 'Draft Analysis',
    image: '/api/placeholder/800/400',
    tags: ['Draft', '2024', 'Prospects', 'College Football'],
    content: `
      <h2>The 2024 Draft Class Deep Dive</h2>
      <p>The 2024 NFL Draft promises to be one of the most talent-rich classes in recent memory, with potential franchise-changing players available across multiple positions. Our scouting team has evaluated over 200 prospects, and these ten stand out as the most likely to make immediate impact.</p>
      
      <h3>Top 10 Prospects</h3>
      <ol>
        <li><strong>Caleb Williams, QB, USC</strong> - Generational talent with elite arm strength and mobility. Heisman Trophy winner who threw 30 TDs with just 5 INTs.</li>
        <li><strong>Drake Maye, QB, North Carolina</strong> - Pro-ready pocket passer with excellent decision-making and leadership qualities.</li>
        <li><strong>Marvin Harrison Jr., WR, Ohio State</strong> - Precise route runner with exceptional hands and elite body control in traffic.</li>
        <li><strong>Malik Nabers, WR, LSU</strong> - Dynamic playmaker with game-breaking speed and versatility.</li>
        <li><strong>Jayden Daniels, QB, LSU</strong> - Dual-threat quarterback with improved accuracy and decision-making.</li>
        <li><strong>Rome Odunze, WR, Washington</strong> - Complete receiver with size, speed, and excellent catching radius.</li>
        <li><strong>Brock Bowers, TE, Georgia</strong> - Most complete tight end prospect since Kyle Pitts.</li>
        <li><strong>Joe Alt, OT, Notre Dame</strong> - Elite pass protector with NFL-ready technique.</li>
        <li><strong>Laiatu Latu, EDGE, UCLA</strong> - Premier pass rusher with relentless motor and pass-rush instincts.</li>
        <li><strong>Quinyon Mitchell, CB, Toledo</strong> - Lockdown corner with elite ball skills and physicality.</li>
      </ol>
      
      <h3>Exclusive Scouting Reports</h3>
      <p>Our advanced scouting network has provided detailed breakdowns of each prospect's strengths, weaknesses, and NFL projection. Williams, in particular, shows the arm talent and mobility that NFL teams covet in today's game.</p>
      
      <p><strong>Premium Content:</strong> Detailed combine predictions show Williams posting a 4.6 40-yard dash with elite arm strength measurements. Our team fit analysis suggests he's the perfect match for teams like Chicago, Washington, and New England who need franchise quarterbacks.</p>
      
      <h3>Draft Day Predictions</h3>
      <p>Based on insider information from NFL front offices, expect significant trading activity in the top 10 as teams position themselves for these premium prospects. The quarterback market could see unprecedented movement.</p>
    `
  },
  {
    id: 'bills-playoff-run',
    title: 'Buffalo Bills: Can They Finally Break Through?',
    excerpt: 'Breaking down the Bills\' strengths and weaknesses as they enter the postseason with championship aspirations.',
    author: 'Mike Rodriguez',
    publishDate: '2024-01-08',
    readTime: '10 min read',
    isPremium: false,
    category: 'Team Analysis',
    image: '/api/placeholder/800/400',
    tags: ['Bills', 'Playoffs', 'Josh Allen', 'AFC'],
    content: `
      <h2>Buffalo's Championship Window</h2>
      <p>The Buffalo Bills enter the 2024 playoffs with perhaps the most talented roster in franchise history, but questions remain about whether they can finally break through and reach the Super Bowl for the first time since the early 1990s.</p>
      
      <h3>Offensive Firepower</h3>
      <p>Josh Allen continues to be the driving force behind Buffalo's success, throwing for 4,121 yards and 29 touchdowns while adding 15 rushing touchdowns. His dual-threat ability makes the Bills' offense uniquely difficult to defend, especially in crucial short-yardage situations.</p>
      
      <p>The addition of veteran wide receivers has given Allen more reliable targets, while the running game has shown marked improvement with James Cook emerging as a legitimate threat. Cook's 1,122 rushing yards and 10 touchdowns provide the balance that has been missing from Buffalo's attack in previous seasons.</p>
      
      <h3>Defensive Concerns</h3>
      <p>While the Bills' defense has playmakers like Von Miller and Matt Milano, they've struggled against elite rushing attacks throughout the season. This vulnerability was exposed in losses to Cincinnati and Miami, where opposing teams controlled the line of scrimmage and dominated time of possession.</p>
      
      <p>The secondary, despite having talented players, has been inconsistent in coverage, allowing big plays at crucial moments. Safety Damar Hamlin's inspiring return has provided emotional lift, but the unit still ranks 18th in passing yards allowed per game.</p>
      
      <h3>The Playoff Path</h3>
      <p>Buffalo's path to the Super Bowl likely runs through Kansas City, meaning they'll need to prove they can beat the Chiefs in January—something they've struggled to do in recent years. The Bills are 0-3 against Kansas City in the playoffs under Sean McDermott, including heartbreaking losses in the divisional round.</p>
      
      <p>Home-field advantage at Highmark Stadium could be crucial, where Buffalo is 8-1 this season and the crowd noise and weather conditions favor their style of play.</p>
      
      <h3>Keys to Success</h3>
      <p>For Buffalo to finally break through, they'll need consistent pressure on opposing quarterbacks, improved red zone efficiency, and clutch performances from their supporting cast. The talent is undeniable, but execution in crucial moments will determine whether 2024 is finally Buffalo's year to break through.</p>
    `
  },
  {
    id: 'fantasy-championship-week',
    title: 'Fantasy Football Championship Week: Start/Sit Decisions',
    excerpt: 'Expert recommendations for your fantasy lineup in the most important week of the season.',
    author: 'David Kim',
    publishDate: '2024-01-05',
    readTime: '6 min read',
    isPremium: false,
    category: 'Fantasy Football',
    image: '/api/placeholder/800/400',
    tags: ['Fantasy', 'Start/Sit', 'Championship', 'Week 17'],
    content: `
      <h2>Championship Week Strategy</h2>
      <p>Fantasy football championship week requires careful consideration of matchups, weather conditions, and potential rest for playoff-bound teams. Here's our expert analysis to help you make the crucial decisions that could determine your league championship.</p>
      
      <h3>Must-Start Players</h3>
      <ul>
        <li><strong>Josh Allen (BUF)</strong> - Facing Miami's weak pass defense at home in crucial AFC East showdown</li>
        <li><strong>Christian McCaffrey (SF)</strong> - Should see full workload against Arizona as 49ers fight for playoff positioning</li>
        <li><strong>Tyreek Hill (MIA)</strong> - Bills secondary has struggled recently, and Miami needs this game</li>
        <li><strong>Dak Prescott (DAL)</strong> - Detroit's defense allows the 4th-most fantasy points to quarterbacks</li>
        <li><strong>Davante Adams (LV)</strong> - Indianapolis defense is vulnerable to slot receivers</li>
      </ul>
      
      <h3>Risky Plays</h3>
      <p>Several star players on playoff-bound teams may see limited snaps if their teams have nothing to play for. Monitor injury reports and coach comments leading up to Sunday:</p>
      
      <ul>
        <li><strong>Travis Kelce (KC)</strong> - Chiefs may rest key players if they clinch #1 seed early</li>
        <li><strong>Ezekiel Elliott (NE)</strong> - Patriots have been eliminated and may focus on evaluating younger players</li>
        <li><strong>DeAndre Hopkins (TEN)</strong> - Titans offense has been inconsistent, and weather could be a factor</li>
      </ul>
      
      <h3>Sleeper Picks</h3>
      <p>Look for players on teams fighting for playoff spots, as they'll be highly motivated and likely to see full usage:</p>
      
      <ul>
        <li><strong>Baker Mayfield (TB)</strong> - Buccaneers need win to secure wild card spot</li>
        <li><strong>David Montgomery (DET)</strong> - Lions fighting for division title, Montgomery should see goal-line work</li>
        <li><strong>Jaylen Waddle (MIA)</strong> - Dolphins must win to keep playoff hopes alive</li>
      </ul>
      
      <h3>Weather Considerations</h3>
      <p>Weather will be a factor in several games, particularly in Buffalo and Green Bay, where snow and cold temperatures could impact passing games. Consider pivoting to running backs and defenses in these conditions.</p>
      
      <p>The key to championship week success is balancing ceiling and floor - you need players who can deliver big performances but also have safe floors in case of unexpected developments.</p>
    `
  },
  {
    id: 'cowboys-future-outlook',
    title: 'Dallas Cowboys: Offseason Moves That Will Define 2024',
    excerpt: 'Exclusive insider analysis on the Cowboys\' planned roster moves and coaching decisions for next season.',
    author: 'Jennifer Walsh',
    publishDate: '2024-01-03',
    readTime: '14 min read',
    isPremium: true,
    category: 'Insider Report',
    image: '/api/placeholder/800/400',
    tags: ['Cowboys', 'Offseason', 'Roster', 'Jerry Jones'],
    content: `
      <h2>Cowboys' Crossroads</h2>
      <p>The Dallas Cowboys face critical decisions this offseason that will shape their franchise for years to come, with salary cap concerns and aging stars creating urgency for immediate action. Our insider sources provide exclusive details on the team's plans.</p>
      
      <h3>Salary Cap Situation</h3>
      <p>Dallas enters the offseason approximately $23 million over the projected salary cap, necessitating difficult decisions about veteran contracts and potential restructures. The team must create space to re-sign key players while maintaining competitive depth.</p>
      
      <p>Key contracts requiring attention include Dak Prescott's $55 million cap hit and Ezekiel Elliott's declining production relative to his $18 million salary. The Cowboys are exploring various restructure scenarios to maintain flexibility.</p>
      
      <h3>Key Free Agents</h3>
      <p>The Cowboys must decide on extensions for Dak Prescott and CeeDee Lamb, while also addressing needs at running back and along the defensive line. Lamb's breakout season has positioned him for a significant payday, while questions remain about Prescott's long-term fit.</p>
      
      <h3>Exclusive Insider Information</h3>
      <p><strong>Premium Intel:</strong> Sources within the organization indicate Jerry Jones is prepared to make significant changes to the coaching staff, with defensive coordinator Dan Quinn's future uncertain despite recent success. The front office is particularly concerned about the team's inability to perform in crucial games.</p>
      
      <p>The front office is also exploring trade possibilities for several veteran players, including potential moves that could create significant cap space while adding draft capital. Names mentioned in internal discussions include Brandin Cooks and several defensive veterans.</p>
      
      <h3>Draft Strategy</h3>
      <p>With limited cap space, the Cowboys will rely heavily on the draft to add talent. Our sources indicate the team is prioritizing defensive line depth and offensive line youth, with plans to target these positions early in the 2024 draft.</p>
      
      <p>The organization recognizes that their championship window with this core group is closing, creating urgency around every decision made this offseason.</p>
    `
  },
  {
    id: 'lions-nfc-contenders',
    title: 'Detroit Lions: From Laughingstock to NFC Contenders',
    excerpt: 'How Dan Campbell has transformed Detroit into one of the most dangerous teams in the NFC.',
    author: 'Tommy Martinez',
    publishDate: '2024-01-02',
    readTime: '11 min read',
    isPremium: false,
    category: 'Team Analysis',
    image: '/api/placeholder/800/400',
    tags: ['Lions', 'Dan Campbell', 'NFC', 'Transformation'],
    content: `
      <h2>The Motor City Renaissance</h2>
      <p>The Detroit Lions' transformation from perennial basement dwellers to legitimate NFC contenders represents one of the most remarkable turnarounds in recent NFL history. Under head coach Dan Campbell, the Lions have developed an identity built on toughness, creativity, and unwavering belief.</p>
      
      <h3>Campbell's Culture Change</h3>
      <p>Since taking over in 2021, Campbell has instilled a blue-collar mentality that resonates with the city of Detroit. His passionate approach and willingness to take risks has created a team that plays with incredible heart and determination.</p>
      
      <p>The Lions' aggressive fourth-down approach (going for it 31 times this season) reflects Campbell's philosophy of trusting his players and refusing to play scared. This mentality has translated into one of the most feared offenses in the NFL.</p>
      
      <h3>Offensive Explosion</h3>
      <p>Offensive coordinator Ben Johnson has crafted one of the most innovative schemes in football, utilizing motion, misdirection, and creative personnel groupings to create mismatches. The Lions rank 2nd in total offense and 1st in rushing yards per game.</p>
      
      <p>Jared Goff's renaissance has been remarkable, throwing for 3,827 yards and 28 touchdowns while completing 67.8% of his passes. His chemistry with receivers Amon-Ra St. Brown and Josh Reynolds has been a key factor in Detroit's success.</p>
      
      <h3>Defensive Improvements</h3>
      <p>While the offense gets most of the attention, defensive coordinator Aaron Glenn has quietly built a solid unit around young talent like Aidan Hutchinson and Brian Branch. The Lions' defense has shown significant improvement in pressure rate and third-down efficiency.</p>
      
      <h3>Playoff Expectations</h3>
      <p>Detroit enters the playoffs as a legitimate threat to make a deep run. Their combination of explosive offense, improved defense, and home-field advantage at Ford Field makes them dangerous against any opponent.</p>
      
      <p>For a franchise that hasn't won a playoff game since 1991, this season represents the culmination of years of smart drafting, coaching, and culture building. The Lions are no longer the NFL's punchline—they're a team no one wants to face in January.</p>
    `
  },
  {
    id: 'rookie-quarterback-analysis',
    title: 'Rookie Quarterbacks: Lessons from 2023\'s Class',
    excerpt: 'Analyzing the performance of rookie quarterbacks and what it means for future draft evaluations.',
    author: 'Alex Thompson',
    publishDate: '2023-12-28',
    readTime: '9 min read',
    isPremium: true,
    category: 'Draft Analysis',
    image: '/api/placeholder/800/400',
    tags: ['Rookies', 'Quarterbacks', 'Draft', 'Analysis'],
    content: `
      <h2>The 2023 Rookie QB Class Evaluation</h2>
      <p>The 2023 rookie quarterback class has provided valuable insights into modern QB evaluation, with performances that both validated and challenged conventional scouting wisdom. Our comprehensive analysis reveals key trends that will shape future draft strategies.</p>
      
      <h3>Standout Performers</h3>
      <p>C.J. Stroud's exceptional rookie season with Houston has redefined expectations for first-year quarterbacks. His 4,108 passing yards and 23 touchdowns while maintaining a 63.9% completion percentage represents one of the best rookie campaigns in NFL history.</p>
      
      <p>Anthony Richardson's injury-shortened season with Indianapolis showed flashes of the elite athleticism that made him the #4 overall pick, but also highlighted the development needed for his passing accuracy and decision-making.</p>
      
      <h3>System Fit and Development</h3>
      <p><strong>Premium Analysis:</strong> Our evaluation shows that rookie quarterback success correlates heavily with offensive system fit and supporting cast quality. Stroud's success in Houston's West Coast-influenced scheme with excellent receiver talent contrasts sharply with other rookies in less favorable situations.</p>
      
      <p>Advanced metrics reveal that pocket presence and pre-snap recognition separate successful rookie quarterbacks from those who struggle. Stroud's pressure-to-sack ratio of 15.3% ranks among the best for rookie quarterbacks in the past decade.</p>
      
      <h3>Development Patterns</h3>
      <p>Historical analysis of rookie quarterback performance shows that first-year success often predicts long-term viability. Since 2010, quarterbacks who throw for over 3,500 yards and maintain a completion percentage above 60% in their rookie season have a 78% success rate over their first four years.</p>
      
      <h3>Implications for 2024 Draft</h3>
      <p>The success of Stroud, who was considered more "pro-ready" coming out of Ohio State, reinforces the value of college production and decision-making over pure athletic tools. This trend should influence how teams evaluate prospects like Caleb Williams and Drake Maye in the upcoming draft.</p>
    `
  }
]

export const getArticleById = (id: string): Article | undefined => {
  return articles.find(article => article.id === id)
}

export const getPremiumArticles = (): Article[] => {
  return articles.filter(article => article.isPremium)
}

export const getFreeArticles = (): Article[] => {
  return articles.filter(article => !article.isPremium)
} 