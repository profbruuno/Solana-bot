import type { NextApiRequest, NextApiResponse } from "next";

let tradingSession: any = null;

export default async function handler(
  req: NextApiRequest, 
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // If no session exists or bot is stopped
    if (!tradingSession || !tradingSession.running) {
      return res.status(200).json({ 
        botStatus: "Stopped", 
        message: "Bot is not running. Start the bot first." 
      });
    }

    // Get current quote
    const SOL_MINT = "So11111111111111111111111111111111111111112";
    const USDC_MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";
    const amountLamports = 0.01 * 1e9;
    
    const url = `https://quote-api.jup.ag/v6/quote?inputMint=${SOL_MINT}&outputMint=${USDC_MINT}&amount=${amountLamports}&slippageBps=50`;
    
    const response = await fetch(url);
    const data = await response.json();

    const outAmount = data?.outAmount;
    const uiPrice = outAmount / 1e6;

    res.status(200).json({
      botStatus: "Running",
      message: "Current market quote",
      quote: {
        input: "0.01 SOL",
        output: `${uiPrice.toFixed(4)} USDC`,
        price: uiPrice,
        timestamp: new Date().toISOString()
      },
      session: {
        running: tradingSession.running,
        capital: tradingSession.capital,
        address: tradingSession.contractAddress
      }
    });

  } catch (error: any) {
    console.error("Tick error:", error);
    res.status(200).json({ 
      botStatus: "Error",
      message: error.message || "Failed to get market data"
    });
  }
}
