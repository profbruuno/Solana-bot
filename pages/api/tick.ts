import type { NextApiRequest, NextApiResponse } from "next";

let botState = {
  running: false,
  capital: 0,
  address: "",
  lastUpdate: null as number | null
};

export default async function handler(
  req: NextApiRequest, 
  res: NextApiResponse
) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== "GET") {
    return res.status(405).json({ 
      status: "error", 
      message: "Method not allowed. Use GET." 
    });
  }

  try {
    console.log("Tick endpoint called");

    if (!botState.running) {
      return res.status(200).json({ 
        status: "success",
        botStatus: "Stopped", 
        message: "Bot is not running. Start the bot first.",
        data: null
      });
    }

    // Simulate market data with slight price variations
    const basePrice = 12.50;
    const variation = (Math.random() - 0.5) * 2; // ±1 USDC variation
    const currentPrice = (basePrice + variation).toFixed(4);

    res.status(200).json({
      status: "success",
      botStatus: "Running",
      message: "Current market data",
      data: {
        input: "0.01 SOL",
        output: `${currentPrice} USDC`,
        price: parseFloat(currentPrice),
        capital: botState.capital,
        address: botState.address,
        running: botState.running
      },
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error("Tick error:", error);
    res.status(200).json({ 
      status: "error",
      message: error.message || "Internal server error" 
    });
  }
}
