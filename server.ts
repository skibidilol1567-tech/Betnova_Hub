import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Mock real data for betting
  app.get("/api/markets", (req, res) => {
    const categories = ['Sports', 'Economics', 'Politics', 'Weather', 'Tech'];
    const markets = [];

    const marketData = {
      'Sports': [
        { title: "NBA Playoffs: Lakers to win first-round series", keyword: "basketball,nba,lakers", desc: "Will the Los Angeles Lakers win their opening round series in the 2026 NBA Playoffs?" },
        { title: "MLB: Dodgers to win 20+ games by May 1st", keyword: "baseball,mlb,dodgers", desc: "Will the Los Angeles Dodgers record 20 or more wins by May 1st, 2026?" },
        { title: "The Masters: Scottie Scheffler to win 2026 title", keyword: "golf,masters,augusta", desc: "Will Scottie Scheffler win the 2026 Masters Tournament?" },
        { title: "Champions League: Real Madrid to reach Semi-Finals", keyword: "soccer,ucl,madrid", desc: "Will Real Madrid qualify for the semi-finals of the 2025-26 UEFA Champions League?" },
        { title: "NHL: Bruins to win the Presidents' Trophy", keyword: "hockey,nhl,bruins", desc: "Will the Boston Bruins finish the regular season with the most points in the NHL?" },
        { title: "F1: Ferrari to win the Chinese Grand Prix", keyword: "racing,f1,ferrari", desc: "Will a Ferrari driver win the upcoming Chinese Grand Prix in Shanghai?" },
        { title: "NBA: Nikola Jokic to win 2026 MVP", keyword: "jokic,nba,mvp", desc: "Will Nikola Jokic be officially named the NBA Most Valuable Player for the 2025-26 season?" },
        { title: "Premier League: Arsenal to be top of table on May 1st", keyword: "soccer,arsenal,pl", desc: "Will Arsenal FC be in first place in the English Premier League on May 1st?" },
        { title: "Kentucky Derby: Favorite to win the 152nd Derby", keyword: "horse,racing,derby", desc: "Will the betting favorite win the 152nd running of the Kentucky Derby in May?" },
        { title: "WNBA: Caitlin Clark to score 30+ in season opener", keyword: "wnba,basketball,clark", desc: "Will Caitlin Clark score 30 or more points in her first game of the 2026 WNBA season?" },
        { title: "French Open: Alcaraz to reach the Final", keyword: "tennis,alcaraz,rolandgarros", desc: "Will Carlos Alcaraz reach the final of the 2026 French Open?" },
        { title: "NFL Draft: QB to be taken #1 overall", keyword: "nfl,draft,football", desc: "Will a quarterback be selected with the first overall pick in the 2026 NFL Draft?" }
      ],
      'Economics': [
        { title: "Tax Day: IRS to report record tax revenue", keyword: "finance,tax,irs", desc: "Will the IRS report a record-breaking total tax revenue for the 2025 tax filing season ending April 15th?" },
        { title: "US CPI: March inflation to be above 3.0%", keyword: "money,inflation,cpi", desc: "Will the US Consumer Price Index for March 2026 (released in April) show a year-over-year increase above 3.0%?" },
        { title: "S&P 500 to hit 6200 by April 30th", keyword: "stock,market,sp500", desc: "Will the S&P 500 index reach or exceed 6,200 at any point before the end of April?" },
        { title: "Bitcoin to surpass $120,000 this month", keyword: "bitcoin,crypto,price", desc: "Will the price of Bitcoin reach $120,000 USD before May 1st, 2026?" },
        { title: "Fed: No rate cuts announced in May", keyword: "fed,bank,interest", desc: "Will the Federal Reserve maintain current interest rates without any cuts at their May 2026 meeting?" },
        { title: "Gold to close above $2,500/oz this week", keyword: "gold,wealth,market", desc: "Will the spot price of Gold close above $2,500 per ounce on Friday?" },
        { title: "Gas Prices: US average to exceed $4.00/gal", keyword: "gas,oil,energy", desc: "Will the national average price for a gallon of regular unleaded gasoline in the US exceed $4.00 this month?" },
        { title: "Apple: Q2 Revenue to exceed $95 Billion", keyword: "apple,tech,earnings", desc: "Will Apple Inc. report quarterly revenue of $95 billion or more in their upcoming earnings call?" },
        { title: "NVIDIA: Stock to reach $1,000 (pre-split)", keyword: "nvidia,gpu,ai", desc: "Will NVIDIA stock reach a valuation equivalent to $1,000 per share (pre-2024 split) this month?" },
        { title: "Euro: EUR/USD to reach 1.12 by May", keyword: "currency,euro,forex", desc: "Will the Euro strengthen to 1.12 against the US Dollar by May 1st?" },
        { title: "Unemployment: April rate to stay at 3.8%", keyword: "work,jobs,economy", desc: "Will the US unemployment rate for April 2026 be reported exactly at 3.8%?" },
        { title: "Tesla: Q1 deliveries to beat expectations", keyword: "tesla,ev,cars", desc: "Will Tesla's Q1 2026 delivery numbers exceed the analyst consensus of 480,000 vehicles?" }
      ],
      'Politics': [
        { title: "Infrastructure: New Bill to be signed by April 20th", keyword: "politics,law,infrastructure", desc: "Will the President sign the Bipartisan Infrastructure Modernization Act into law by April 20th?" },
        { title: "UK: Labour to lead by 15+ points in polls", keyword: "uk,politics,labour", desc: "Will the average of major UK political polls show the Labour Party leading the Conservatives by 15% or more this week?" },
        { title: "Supreme Court: Ruling on AI Copyright by June", keyword: "law,scotus,ai", desc: "Will the Supreme Court issue its final ruling on the landmark AI copyright case before the end of the current term in June?" },
        { title: "France: Macron to announce new energy policy", keyword: "france,macron,energy", desc: "Will President Macron announce a major shift in France's nuclear energy policy this month?" },
        { title: "EU: New Digital Services Act amendment to pass", keyword: "europe,tech,regulation", desc: "Will the European Parliament pass the proposed 'Transparency Amendment' to the Digital Services Act this quarter?" },
        { title: "G7: Leaders to meet in Italy this June", keyword: "g7,summit,italy", desc: "Will the 2026 G7 Summit be officially confirmed to take place in Italy this June?" },
        { title: "Canada: Federal budget to include new tech tax", keyword: "canada,finance,tech", desc: "Will the 2026 Canadian Federal Budget include a new tax specifically targeting large technology companies?" },
        { title: "Japan: Prime Minister to visit Washington in May", keyword: "japan,diplomacy,usa", desc: "Will the Prime Minister of Japan conduct an official state visit to Washington D.C. in May 2026?" },
        { title: "UN: Security Council to vote on new peace mission", keyword: "un,peace,diplomacy", desc: "Will the UN Security Council hold a formal vote on establishing a new peacekeeping mission in East Africa this month?" },
        { title: "Germany: Green Party to gain 5% in regional polls", keyword: "germany,politics,green", desc: "Will the Green Party see a 5% or greater increase in support in the latest regional election polling?" },
        { title: "Australia: New Climate Accord to be signed", keyword: "australia,climate,treaty", desc: "Will Australia sign the new Indo-Pacific Climate Cooperation Accord by the end of April?" },
        { title: "Mexico: Election frontrunner to hold 10pt lead", keyword: "mexico,election,vote", desc: "Will the leading candidate in the Mexican presidential race maintain a double-digit lead in the polls this month?" }
      ],
      'Weather': [
        { title: "Midwest: Major Spring Storm to hit this week", keyword: "storm,rain,midwest", desc: "Will a major storm system bring over 2 inches of rain to Chicago and Detroit this week?" },
        { title: "Phoenix: First 90°F day before April 20th", keyword: "heat,sun,phoenix", desc: "Will the high temperature in Phoenix, Arizona reach 90°F or higher before April 20th?" },
        { title: "California: Sierra Snowpack to be 120% of normal", keyword: "snow,water,california", desc: "Will the April 15th snowpack measurement in the Sierra Nevada be at least 120% of the historical average?" },
        { title: "Atlantic: First named storm to form in May", keyword: "hurricane,ocean,storm", desc: "Will the first named tropical storm of the 2026 Atlantic season form before June 1st?" },
        { title: "Europe: Paris to hit 25°C this weekend", keyword: "sun,paris,spring", desc: "Will the high temperature in Paris reach at least 25°C (77°F) this coming Saturday or Sunday?" },
        { title: "Australia: Sydney to have driest April on record", keyword: "sydney,dry,weather", desc: "Will Sydney record less than 10mm of total rainfall during the month of April 2026?" },
        { title: "Arctic: Ice melt to start 10 days early", keyword: "ice,arctic,climate", desc: "Will the annual Arctic sea ice melt season begin at least 10 days earlier than the 30-year average?" },
        { title: "Tornado Alley: 50+ tornadoes in April", keyword: "tornado,storm,wind", desc: "Will there be 50 or more confirmed tornadoes in the US during the month of April 2026?" },
        { title: "India: Heatwave to reach 45°C in Delhi", keyword: "heat,india,delhi", desc: "Will the temperature in New Delhi reach 45°C (113°F) before the end of April?" },
        { title: "Global: 2026 to be the hottest year on record", keyword: "earth,global,warming", desc: "Will the global average temperature for 2026 be the highest ever recorded by NASA/NOAA?" },
        { title: "London: No rain for 14 consecutive days", keyword: "london,sun,dry", desc: "Will London experience a period of 14 consecutive days with zero measurable rainfall this month?" },
        { title: "NYC: Cherry Blossoms to peak by April 18th", keyword: "flowers,spring,nyc", desc: "Will the cherry blossoms at the Brooklyn Botanic Garden reach 'Peak Bloom' by April 18th?" }
      ],
      'Tech': [
        { title: "SpaceX: Starship Flight 5 to launch this week", keyword: "rocket,space,spacex", desc: "Will SpaceX conduct the fifth integrated flight test of the Starship system before April 22nd?" },
        { title: "Apple: New iPad Pro to be announced in April", keyword: "apple,ipad,tablet", desc: "Will Apple officially announce a new generation of iPad Pro models during the month of April 2026?" },
        { title: "Google: I/O 2026 to feature 'Gemini 2.0' teaser", keyword: "google,ai,gemini", desc: "Will Google release an official teaser or technical preview for Gemini 2.0 before May 1st?" },
        { title: "OpenAI: GPT-5 to be released by June", keyword: "openai,ai,gpt5", desc: "Will OpenAI formally release GPT-5 to ChatGPT Plus subscribers before June 30th, 2026?" },
        { title: "Tesla: FSD v13 to reach wide release in April", keyword: "tesla,ai,autopilot", desc: "Will Tesla release Full Self-Driving (Supervised) version 13 to the majority of its US fleet this month?" },
        { title: "Meta: New AR Glasses prototype to be shown", keyword: "meta,ar,glasses", desc: "Will Meta publicly demonstrate a new functional prototype of its true AR glasses this month?" },
        { title: "Neuralink: Second human patient to be announced", keyword: "neuralink,brain,tech", desc: "Will Neuralink officially announce the successful implantation of its device in a second human patient by May?" },
        { title: "Microsoft: New AI-powered Surface devices in May", keyword: "microsoft,surface,laptop", desc: "Will Microsoft announce a new line of Surface devices with dedicated AI hardware in May 2026?" },
        { title: "Amazon: Prime Air to expand to 5 new cities", keyword: "amazon,drone,delivery", desc: "Will Amazon announce the expansion of its Prime Air drone delivery service to 5 or more new US cities this year?" },
        { title: "Samsung: Galaxy Z Fold 7 leaks to show triple-fold", keyword: "samsung,phone,fold", desc: "Will credible leaks show that the upcoming Galaxy Z Fold 7 features a triple-folding display design?" },
        { title: "Sony: PS5 Pro to be restocked in all major retailers", keyword: "sony,ps5,gaming", desc: "Will the PS5 Pro be in stock and available for immediate purchase at Amazon, Best Buy, and Walmart this week?" },
        { title: "NVIDIA: New Blackwell GPUs to ship to customers", keyword: "nvidia,gpu,ai", desc: "Will the first production units of NVIDIA's Blackwell architecture GPUs be delivered to customers this month?" }
      ]
    };

    categories.forEach(cat => {
      // Shuffle and pick a subset of markets to simulate rotation
      const shuffled = [...marketData[cat]].sort(() => 0.5 - Math.random());
      const selected = shuffled.slice(0, 6); // Show 6 markets per category

      selected.forEach((data, i) => {
        const probability = Math.floor(Math.random() * 80) + 10; // 10-90%
        
        // Generate mock probability history
        const probabilityHistory = [];
        let currentProb = probability;
        for (let j = 0; j < 12; j++) {
          const time = new Date(Date.now() - (12 - j) * 2 * 3600000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          currentProb = Math.max(5, Math.min(95, currentProb + (Math.random() * 12 - 6)));
          probabilityHistory.push({ time, probability: Math.round(currentProb) });
        }

        // Use title as keyword for image, sanitized
        const imageKeyword = data.title.split(':')[0].replace(/[^a-zA-Z0-9]/g, ',');

        markets.push({
          id: `BET-${cat.toUpperCase()}-${i}-${Date.now()}`,
          title: data.title,
          category: cat,
          probability,
          volume: Math.floor(Math.random() * 10000000) + 50000,
          // Some expire very soon, others later
          expires: new Date(Date.now() + (Math.random() * 48 + 1) * 3600000).toISOString(),
          imageUrl: `https://loremflickr.com/800/600/${imageKeyword.split(',')[0]}?lock=${Math.floor(Math.random() * 1000)}`,
          probabilityHistory,
          imageKeyword: data.title,
          description: data.desc,
          openInterest: Math.floor(Math.random() * 500000) + 10000,
          dailyChange: parseFloat((Math.random() * 10 - 5).toFixed(2))
        });
      });
    });

    res.json(markets);
  });

  app.get("/api/leaderboard", (req, res) => {
    const leaderboard = [
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
    res.json(leaderboard);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
