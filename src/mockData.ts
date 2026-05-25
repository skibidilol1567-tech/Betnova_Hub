import { BetMarket, LeaderboardEntry, MarketCategory } from './types';

const marketData: Record<MarketCategory, { title: string; keyword: string; desc: string }[]> = {
  'Sports': [
    { title: "NBA Playoffs: Celtics to win first round in 5 games or less", keyword: "basketball,nba,celtics", desc: "Will the Boston Celtics win their first-round series in 5 or fewer games?" },
    { title: "MLB: Shohei Ohtani to hit 10th Home Run by May 1st", keyword: "baseball,mlb,ohtani", desc: "Will Shohei Ohtani reach 10 home runs in the 2026 season before May 1st?" },
    { title: "NHL Playoffs: Rangers to win first two home games", keyword: "hockey,nhl,rangers", desc: "Will the New York Rangers win both Game 1 and Game 2 at home?" },
    { title: "F1: Red Bull to secure 1-2 finish in Azerbaijan GP", keyword: "racing,f1,redbull", desc: "Will Red Bull Racing have both drivers finish 1st and 2nd in the Azerbaijan Grand Prix?" },
    { title: "Soccer: Arsenal vs Man City - Arsenal to win", keyword: "soccer,premierleague,arsenal", desc: "Will Arsenal defeat Manchester City in their crucial late-season matchup?" },
    { title: "Tennis: Swiatek to win Madrid Open 2026", keyword: "tennis,clay,swiatek", desc: "Will Iga Swiatek win the singles title at the 2026 Madrid Open?" },
    { title: "NBA Playoffs: Nuggets to sweep first round", keyword: "basketball,nba,nuggets", desc: "Will the Denver Nuggets win their first-round series in exactly 4 games?" },
    { title: "Champions League: Bayern Munich to reach Final", keyword: "soccer,ucl,bayern", desc: "Will Bayern Munich advance to the 2025-26 UEFA Champions League Final?" },
    { title: "NFL Draft: 5+ Quarterbacks to be taken in 1st Round", keyword: "nfl,draft,qb", desc: "Will at least 5 quarterbacks be selected in the first round of the 2026 NFL Draft?" },
    { title: "Kentucky Derby: Top 3 finisher to come from post 10-20", keyword: "horse,racing,derby", desc: "Will any of the top 3 finishers in the Kentucky Derby start from post positions 10 through 20?" },
    { title: "WNBA: Las Vegas Aces to win season opener", keyword: "wnba,basketball,aces", desc: "Will the Las Vegas Aces win their first game of the 2026 season?" },
    { title: "French Open: Nadal to announce participation by May 1st", keyword: "tennis,nadal,frenchopen", desc: "Will Rafael Nadal officially confirm his entry into the 2026 French Open by May 1st?" }
  ],
  'Economics': [
    { title: "Stock Market: S&P 500 to close above 6300 by Friday", keyword: "stock,market,sp500", desc: "Will the S&P 500 index finish the week at or above 6,300?" },
    { title: "Bitcoin: Price to stay above $115,000 all week", keyword: "bitcoin,crypto,price", desc: "Will the price of Bitcoin remain above $115,000 USD throughout the entire current week?" },
    { title: "Interest Rates: Fed to signal 'Hold' in next statement", keyword: "fed,interest,finance", desc: "Will the Federal Reserve's next official statement explicitly signal a rate hold (no changes)?" },
    { title: "US GDP: Q1 2026 growth to be reported above 2.5%", keyword: "economy,gdp,usa", desc: "Will the first estimate for US Q1 2026 GDP growth (released late April) be 2.5% or higher?" },
    { title: "Nasdaq: Tech stocks to rally 2% this week", keyword: "nasdaq,tech,stocks", desc: "Will the Nasdaq Composite index increase by 2.0% or more between Monday and Friday?" },
    { title: "Gold: Spot price to break $2,600 by May 1st", keyword: "gold,commodity,wealth", desc: "Will the spot price of gold reach or exceed $2,600 per ounce before May 1st?" },
    { title: "Startup Funding: Total Q1 AI funding to exceed $20B", keyword: "startup,ai,funding", desc: "Will final reports show that AI startups raised more than $20 billion in VC funding during Q1 2026?" },
    { title: "Real Estate: Mortgage rates to drop below 6.5%", keyword: "house,mortgage,finance", desc: "Will the average 30-year fixed mortgage rate drop below 6.5% this week?" },
    { title: "Oil: Brent Crude to hit $90/barrel by May", keyword: "oil,energy,brent", desc: "Will Brent Crude oil prices reach $90 per barrel at any point before May 1st?" },
    { title: "Retail Sales: March data to show 0.5% increase", keyword: "retail,shopping,consumer", desc: "Will the final retail sales data for March (revised in April) show a month-over-month increase of 0.5% or more?" },
    { title: "Earnings: Microsoft to report record Cloud revenue", keyword: "microsoft,cloud,azure", desc: "Will Microsoft's upcoming earnings report show record-high revenue for its Cloud division?" },
    { title: "Currency: USD to weaken against Yen by Friday", keyword: "forex,usd,jpy", desc: "Will the USD/JPY exchange rate be lower on Friday close than it was on Monday open?" }
  ],
  'Politics': [
    { title: "US Budget: Congress to pass emergency funding bill", keyword: "politics,congress,money", desc: "Will a new emergency funding bill be passed by both the House and Senate this week?" },
    { title: "UK: New Prime Minister approval rating above 40%", keyword: "uk,politics,poll", desc: "Will the latest poll show the UK Prime Minister's approval rating at or above 40%?" },
    { title: "Canada: PM Trudeau to announce new housing initiative", keyword: "canada,housing,policy", desc: "Will Prime Minister Trudeau announce a major new federal housing initiative this week?" },
    { title: "France: Majority to support new climate law in poll", keyword: "france,politics,climate", desc: "Will a major national poll in France show majority support for the proposed climate law?" },
    { title: "Australia: Election date to be officially set", keyword: "australia,election,vote", desc: "Will the official date for the next Australian federal election be announced this month?" },
    { title: "EU: New trade pact with Japan to be finalized", keyword: "europe,japan,trade", desc: "Will the EU and Japan officially sign the finalized trade cooperation pact this month?" },
    { title: "Supreme Court: Ruling on student loans by June", keyword: "scotus,law,student", desc: "Will the US Supreme Court issue its final ruling on the pending student loan case before June 30th?" },
    { title: "UN: New global health treaty to be drafted", keyword: "un,health,treaty", desc: "Will the UN publish a formal draft of the new Global Health Preparedness Treaty this month?" },
    { title: "Germany: Chancellor to visit Kyiv this week", keyword: "germany,diplomacy,ukraine", desc: "Will the German Chancellor conduct an official state visit to Kyiv before Sunday?" },
    { title: "Japan: New digital currency pilot to start May 1st", keyword: "japan,crypto,bank", desc: "Will the Bank of Japan officially launch its new digital currency pilot program on May 1st?" },
    { title: "India: Prime Minister to address Global Summit", keyword: "india,summit,leader", desc: "Will the Prime Minister of India give a keynote address at the upcoming Global Economic Summit?" },
    { title: "Mexico: New energy trade agreement with USA", keyword: "mexico,usa,energy", desc: "Will Mexico and the USA announce a new joint energy trade agreement by April 30th?" }
  ],
  'Weather': [
    { title: "California: Record Sierra Snowpack to last into July", keyword: "snow,mountains,water", desc: "Will the 2026 Sierra Nevada snowpack remain above 50% of peak levels until July 1st?" },
    { title: "Pacific: EL Niño to transition to La Niña by June", keyword: "ocean,climate,weather", desc: "Will NOAA officially declare a transition to La Niña conditions before the end of June?" },
    { title: "Midwest: 10+ tornadoes to be reported this week", keyword: "tornado,storm,wind", desc: "Will at least 10 confirmed tornadoes be reported in the US Midwest between Monday and Sunday?" },
    { title: "Florida: High temperatures to reach 95°F by Friday", keyword: "heat,sun,florida", desc: "Will the high temperature in Miami or Orlando reach 95°F before the weekend?" },
    { title: "NYC: Rainfall to exceed 4 inches this month", keyword: "rain,city,water", desc: "Will New York City record a total of 4 or more inches of rainfall during April 2026?" },
    { title: "Texas: Major heatwave to start before May 1st", keyword: "heat,texas,sun", desc: "Will a multi-day heatwave (over 100°F) begin in Dallas or Austin before May 1st?" },
    { title: "Europe: April storms to cause flooding in Germany", keyword: "rain,germany,flood", desc: "Will heavy rainfall in Germany cause the Rhine river to reach flood stage this month?" },
    { title: "Arctic: Lowest April sea ice extent since 2012", keyword: "ice,arctic,climate", desc: "Will the average Arctic sea ice extent for April 2026 be lower than all years since 2012?" },
    { title: "Global: Record high average temp for April 2026", keyword: "climate,earth,heat", desc: "Will April 2026 be the hottest April on record globally?" },
    { title: "London: First 20°C day of the year this week", keyword: "london,sun,spring", desc: "Will the temperature in London reach 20°C (68°F) for the first time this year this week?" },
    { title: "Australia: Great Barrier Reef to show record recovery", keyword: "ocean,reef,nature", desc: "Will the annual reef health survey report record-high coral cover in 2026?" },
    { title: "Canada: Wildfire season to start 'above normal' in May", keyword: "fire,forest,canada", desc: "Will the official May forecast for Canada's wildfire season categorize risk as 'Above Normal'?" }
  ],
  'Tech': [
    { title: "OpenAI: GPT-4.5 to be announced by May 1st", keyword: "ai,openai,gpt", desc: "Will OpenAI officially announce the release of a 'GPT-4.5' model before May 1st?" },
    { title: "Apple: New M4 Macs to be teased this month", keyword: "apple,mac,processor", desc: "Will Apple release any official teaser or info about M4-powered Macs in April?" },
    { title: "Google: New Pixel 8a to leak in high-res", keyword: "google,pixel,phone", desc: "Will high-resolution, unwatermarked marketing renders of the Pixel 8a leak this week?" },
    { title: "SpaceX: Successful landing of Booster 12", keyword: "rocket,spacex,booster", desc: "Will SpaceX successfully land the Super Heavy booster during the next Starship test flight?" },
    { title: "Meta: Quest 4 details to be leaked", keyword: "meta,vr,quest", desc: "Will credible leaks regarding the specs or release date of Quest 4 emerge this month?" },
    { title: "Tesla: Optimus Gen 3 robot to be revealed", keyword: "tesla,robot,optimus", desc: "Will Tesla reveal the third generation of the Optimus humanoid robot this month?" },
    { title: "Gaming: GTA VI to release new trailer by June", keyword: "gaming,gta,rockstar", desc: "Will Rockstar Games release a second official trailer for GTA VI before July 1st?" },
    { title: "AI: New open-source Llama model with 400B+ parameters", keyword: "ai,meta,llama", desc: "Will Meta release an open-source Llama model exceeding 400 billion parameters this quarter?" },
    { title: "Microsoft: Windows 12 Beta to start in May", keyword: "microsoft,windows,os", desc: "Will Microsoft officially launch a public beta program for Windows 12 in May?" },
    { title: "Energy: New fusion record to be set in Europe", keyword: "energy,fusion,tech", desc: "Will a European fusion research facility set a new record for sustained energy output this month?" },
    { title: "Social Media: Viral new AI companion app to hit #1", keyword: "app,tech,phone", desc: "Will a new AI-focused social or companion app reach #1 on the App Store (US) this week?" },
    { title: "Chips: New architecture to outperform NVIDIA Blackwell", keyword: "chip,ai,tech", desc: "Will a startup or competitor reveal a new chip architecture claiming higher efficiency than NVIDIA's Blackwell?" }
  ]
};

export function getMockMarkets(): BetMarket[] {
  const categories: MarketCategory[] = ['Sports', 'Economics', 'Politics', 'Weather', 'Tech'];
  const markets: BetMarket[] = [];

  categories.forEach(cat => {
    // Stable pseudo-random shuffle per page load based on category name, or simple shuffle
    // To make it simple and fully responsive, let's just pick a consistent subset or shuffle
    const shuffled = [...marketData[cat]].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 6);

    selected.forEach((data, i) => {
      const probability = Math.floor(Math.random() * 80) + 10; // 10-90%
      const probabilityHistory: { time: string; probability: number }[] = [];
      let currentProb = probability;
      for (let j = 0; j < 12; j++) {
        const time = new Date(Date.now() - (12 - j) * 2 * 3600000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        currentProb = Math.max(5, Math.min(95, currentProb + (Math.random() * 12 - 6)));
        probabilityHistory.push({ time, probability: Math.round(currentProb) });
      }

      const imageKeyword = data.title.split(':')[0].replace(/[^a-zA-Z0-9]/g, ',');

      markets.push({
        id: `BET-${cat.toUpperCase()}-${i}-${Date.now()}`,
        title: data.title,
        category: cat,
        probability,
        volume: Math.floor(Math.random() * 10000000) + 50000,
        expires: new Date(Date.now() + (Math.random() * 48 + 1) * 3600000).toISOString(),
        imageUrl: `https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80`, // Reliable default fallback image
        probabilityHistory,
        imageKeyword: data.title,
        description: data.desc,
        openInterest: Math.floor(Math.random() * 500000) + 10000,
        dailyChange: parseFloat((Math.random() * 10 - 5).toFixed(2))
      });
    });
  });

  return markets;
}

export function getMockLeaderboard(): LeaderboardEntry[] {
  return [
    { rank: 1, username: "WhaleTrader", profit: 1250000, winRate: 68, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Whale" },
    { rank: 2, username: "NovaKing", profit: 840000, winRate: 62, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=King" },
    { rank: 3, username: "AlphaBet", profit: 720000, winRate: 71, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alpha" },
    { rank: 4, username: "PredictorPro", profit: 510000, winRate: 59, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Pro" },
    { rank: 5, username: "MarketMaker", profit: 480000, winRate: 64, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Maker" },
    { rank: 6, username: "BullishBob", profit: 320000, winRate: 55, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Bob" },
    { rank: 7, username: "BearishBen", profit: 290000, winRate: 57, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ben" },
    { rank: 8, username: "QuantQueen", profit: 250000, winRate: 74, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Queen" },
    { rank: 9, username: "RiskTaker", profit: 180000, winRate: 48, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Risk" },
    { rank: 10, username: "LuckyLuke", profit: 150000, winRate: 52, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Luke" },
  ];
}
