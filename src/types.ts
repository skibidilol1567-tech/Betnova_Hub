export type MarketCategory = 'Sports' | 'Economics' | 'Politics' | 'Weather' | 'Tech';

export interface BetMarket {
  id: string;
  title: string;
  category: MarketCategory;
  probability: number; // 1-99%
  volume: number;
  expires: string;
  imageUrl: string;
  probabilityHistory: { time: string; probability: number }[];
  imageKeyword: string;
  description: string;
  openInterest: number;
  dailyChange: number;
}

export interface LeaderboardEntry {
  rank: number;
  username: string;
  profit: number;
  winRate: number;
  avatar: string;
}

export interface ActiveBet {
  id: string;
  marketId: string;
  side: 'YES' | 'NO';
  amount: number; // in cents
  odds: number; // multiplier (e.g., 2.5)
  status: 'OPEN' | 'WON' | 'LOST';
  placedAt: number;
}

export interface UserState {
  uid?: string;
  email?: string;
  balance: number; // in cents
  portfolio: ActiveBet[];
  role?: 'admin' | 'user';
}
