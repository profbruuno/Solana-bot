import fetch from "node-fetch";

// Common Solana mints
const SOL_MINT = "So11111111111111111111111111111111111111112";
const USDC_MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";

export async function runTradingTick(session: any) {
  try {
    const inputMint = SOL_MINT;
    const outputMint = USDC_MINT;

    // Amount: 0.01 SOL in lamports (1 SOL = 1e9 lamports)
    const amountLamports = 0.01 * 1e9;

    const url = `https://quote-api.jup.ag/v6/quote?inputMint=${inputMint}&outputMint=${outputMint}&amount=${amountLamports}&slippageBps=50`;

    const resp = await fetch(url);
    if (!resp.ok) {
      throw new Error(`Jupiter API error: ${resp.status}`);
    }
    const data = await resp.json();

    const outAmount = data?.outAmount;
    const uiPrice = outAmount / 1e6; // USDC has 6 decimals

    return {
      status: "ok",
      input: "0.01 SOL",
      output: `${uiPrice.toFixed(4)} USDC`,
      route: data?.routes?.[0],
    };
  } catch (err: any) {
    return { status: "error", message: err.message };
  }
}
