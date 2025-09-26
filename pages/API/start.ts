import type { NextApiRequest, NextApiResponse } from "next";
import { runTradingTick } from "../../lib/trading";
import { TradingSession } from "../../types";

// In-memory session storage (for demo - use database in production)
let tradingSession: TradingSession | null = null;

export default async function handler(
  req: NextApiRequest, 
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { key, capital, address } = req.body;

    if (!key || !capital || !address) {
      return res.status(400).json({ 
        error: 'Missing required parameters: key, capital, address' 
      });
    }

    tradingSession = {
      walletKey: key,
      capital: Number(capital),
      contractAddress: address,
      running: true,
      dailyLoss: 0,
      tradeCount: 0,
      totalProfit: 0,
      lastTradeTime: Date.now()
    };

    const result = await runTradingTick(tradingSession);

    res.status(200).json({ 
      status: "Running", 
      session: {
        running: tradingSession.running,
        tradeCount: tradingSession.tradeCount,
        totalProfit: tradingSession.totalProfit
      },
      ...result 
    });
  } catch (error: any) {
    console.error('Start error:', error);
    res.status(500).json({ 
      status: "Error", 
      error: error.message 
    });
  }
}
