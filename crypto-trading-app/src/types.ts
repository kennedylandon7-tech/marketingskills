export interface Candle {
  openTime: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export type Direction = "long" | "short" | "none";

export interface TradeSetup {
  direction: Direction;
  confidence: number; // 0-100
  price: number;
  entry: number;
  stopLoss: number;
  takeProfit1: number; // ~1.5R
  takeProfit2: number; // ~2R
  takeProfit3: number; // ~3R
  riskRewardAtTP2: number;
  reasons: string[];
  warnings: string[];
  atr: number;
}

export interface CoinSignal {
  symbol: string;
  label: string;
  candles: Candle[];
  setup: TradeSetup | null;
  error?: string;
}

export interface DexPair {
  chainId: string;
  dexId: string;
  pairAddress: string;
  baseToken: { address: string; name: string; symbol: string };
  quoteToken: { address: string; name: string; symbol: string };
  priceUsd: string | null;
  priceChange: { m5?: number; h1?: number; h6?: number; h24?: number };
  volume: { m5?: number; h1?: number; h6?: number; h24?: number };
  liquidity: { usd?: number; base?: number; quote?: number } | null;
  fdv: number | null;
  marketCap: number | null;
  pairCreatedAt: number | null; // ms epoch
  txns: {
    m5?: { buys: number; sells: number };
    h1?: { buys: number; sells: number };
    h24?: { buys: number; sells: number };
  };
  url: string;
}

export type RiskLevel = "extreme" | "high" | "medium";

export interface RiskAssessment {
  level: RiskLevel;
  flags: string[];
  momentumScore: number;
}

export interface TrendingToken {
  pair: DexPair;
  risk: RiskAssessment;
}

export interface WalletState {
  connected: boolean;
  connecting: boolean;
  publicKey: string | null;
  solBalance: number | null;
  error: string | null;
  hasProvider: boolean;
}
