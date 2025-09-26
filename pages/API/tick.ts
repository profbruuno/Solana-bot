import type { NextApiRequest, NextApiResponse } from "next";
import { runTradingTick } from "../../lib/trading";

// In-memory session (same as in start.ts)
let tradingSession: any = null;

export default async function handler(
  req: NextApiRequest, 
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    if (!tradingSession || !tradingSession.running) {
      return res.status(200).json({ 
        status: "Stopped", 
        message: "Trading bot is not running" 
      });
    }

    const result = await runTradingTick(tradingSession);
    
    res.status(200).json({
      status: "Running",
      session: {
        running: tradingSession.running,
        tradeCount: tradingSession.tradeCount,
        totalProfit: tradingSession.totalProfit,
        dailyLoss: tradingSession.dailyLoss
      },
      ...result
    });
  } catch (error: any) {
    console.error('Tick error:', error);
    res.status(500).json({ 
      status: "Error", 
      error: error.message 
    });
  }
}
