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

    // Validate required fields
    if (!key || !capital || !address) {
      return res.status(400).json({ 
        error: "Missing required parameters" 
      });
    }

    // Create trading session
    tradingSession = {
      walletKey: key,
      capital: Number(capital),
      contractAddress: address,
      running: true,
      lastTradeTime: Date.now()
    };

    // Get a simple quote from Jupiter
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
      message: "Trading bot started successfully",
      quote: {
        input: "0.01 SOL",
        output: `${uiPrice.toFixed(4)} USDC`,
        price: uiPrice
      },
      session: {
        running: true,
        capital: Number(capital)
      }
    });

  } catch (error: any) {
    console.error("Start error:", error);
    res.status(200).json({ 
      botStatus: "Error",
      message: error.message || "Failed to start bot"
    });
  }
}
