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
    const { key, capital, address } = req.body;

    if (!key || !capital || !address) {
      return res.status(400).json({ 
        error: "Missing required parameters: key, capital, address" 
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

    // FIXED: Remove duplicate 'status' property
    res.status(200).json({ 
      botStatus: "Running",  // Changed from 'status' to 'botStatus'
      session: {
        running: tradingSession.running,
        tradeCount: tradingSession.tradeCount,
        totalProfit: tradingSession.totalProfit
      },
      ...result 
    });
  } catch (error: any) {
    console.error("Start error:", error);
    res.status(500).json({ 
      status: "Error", 
      error: error.message 
    });
  }
}

async function runTradingTick(session: any) {
  try {
    const SOL_MINT = "So11111111111111111111111111111111111111112";
    const USDC_MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";
    
    const amountLamports = 0.01 * 1e9;
    const url = `https://quote-api.jup.ag/v6/quote?inputMint=${SOL_MINT}&outputMint=${USDC_MINT}&amount=${amountLamports}&slippageBps=50`;

    const response = await fetch(url);
    const data = await response.json();

    const outAmount = data?.outAmount;
    const uiPrice = outAmount / 1e6;

    return {
      tradeStatus: "success",  // Changed from 'status' to 'tradeStatus'
      input: "0.01 SOL",
      output: `${uiPrice.toFixed(4)} USDC`,
      route: data?.routes?.[0],
    };
  } catch (err: any) {
    return { tradeStatus: "error", message: err.message };  // Fixed here too
  }
}
