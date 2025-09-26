export interface TradingSession {
  walletKey: string;
  capital: number;
  contractAddress: string;
  running: boolean;
  dailyLoss: number;
  lastTradeTime?: number;
  tradeCount: number;
  totalProfit: number;
}

export interface JupiterQuote {
  inputMint: string;
  outputMint: string;
  inAmount: string;
  outAmount: string;
  otherAmountThreshold: string;
  swapMode: string;
  slippageBps: number;
  platformFee?: number;
  priceImpactPct: string;
  routePlan: any[];
  contextSlot?: number;
  timeTaken?: number;
}

export interface TradeResult {
  status: 'success' | 'error' | 'paused' | 'rate_limited';
  input?: string;
  output?: string;
  route?: any;
  message?: string;
  profit?: number;
  timestamp?: number;
}
