import type { NextApiRequest, NextApiResponse } from "next";

let tradingSession: any = null;

export default async function handler(
  req: NextApiRequest, 
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    if (tradingSession) {
      tradingSession.running = false;
    }

    // FIXED: Changed 'status' to 'botStatus' for consistency
    res.status(200).json({ 
      botStatus: "Stopped",  // ← CHANGED FROM 'status' TO 'botStatus'
      message: "Trading bot has been stopped",
      finalStats: tradingSession ? {
        totalTrades: tradingSession.tradeCount,
        totalProfit: tradingSession.totalProfit
      } : null
    });
  } catch (error: any) {
    console.error("Stop error:", error);
    res.status(500).json({ 
      status: "Error", 
      error: error.message 
    });
  }
}
