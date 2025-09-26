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
    const wasRunning = tradingSession?.running || false;
    
    if (tradingSession) {
      tradingSession.running = false;
    }

    res.status(200).json({ 
      botStatus: "Stopped",
      message: "Trading bot has been stopped",
      wasRunning: wasRunning,
      finalStats: tradingSession ? {
        capital: tradingSession.capital,
        address: tradingSession.contractAddress
      } : null
    });

  } catch (error: any) {
    console.error("Stop error:", error);
    res.status(200).json({ 
      botStatus: "Error",
      message: error.message || "Failed to stop bot"
    });
  }
}
