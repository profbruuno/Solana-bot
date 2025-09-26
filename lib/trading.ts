import { JupiterQuote } from '../types';

const SOL_MINT = "So11111111111111111111111111111111111111112";
const USDC_MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";

export async function runTradingTick(session: any) {
  try {
    if (!session.running) {
      return { status: 'paused', message: 'Trading is paused' };
    }

    // Rate limiting: 30 seconds between trades
    const now = Date.now();
    if (session.lastTradeTime && (now - session.lastTradeTime) < 30000) {
      return { 
        status: 'rate_limited', 
        message: 'Wait 30 seconds between trades' 
      };
    }

    // Get quote from Jupiter
    const inputMint = SOL_MINT;
    const outputMint = await resolveOutputMint(session.contractAddress);
    const amountLamports = 0.01 * 1e9; // 0.01 SOL

    const quote = await getJupiterQuote(inputMint, outputMint, amountLamports);
    
    if (!quote) {
      return { status: 'error', message: 'Failed to get quote from Jupiter' };
    }

    const uiPrice = parseInt(quote.outAmount) / 1e6; // USDC has 6 decimals

    // Simulate trade execution (replace with actual trade execution)
    const tradeResult = await simulateTradeExecution(quote, session);

    session.lastTradeTime = now;
    session.tradeCount = (session.tradeCount || 0) + 1;

    return {
      status: 'success',
      input: "0.01 SOL",
      output: `${uiPrice.toFixed(4)} USDC`,
      price: uiPrice,
      route: quote.routePlan,
      tradeResult
    };
  } catch (err: any) {
    console.error('Trading error:', err);
    return { status: 'error', message: err.message };
  }
}

async function getJupiterQuote(
  inputMint: string, 
  outputMint: string, 
  amount: number
): Promise<JupiterQuote | null> {
  try {
    const slippageBps = parseInt(process.env.MAX_SLIPPAGE_BPS || '50');
    const url = `https://quote-api.jup.ag/v6/quote?inputMint=${inputMint}&outputMint=${outputMint}&amount=${amount}&slippageBps=${slippageBps}`;

    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Jupiter API error: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching Jupiter quote:', error);
    return null;
  }
}

async function resolveOutputMint(contractAddress: string): Promise<string> {
  // For now, return USDC mint for all contracts
  // You can extend this to support different tokens
  return USDC_MINT;
}

async function simulateTradeExecution(quote: JupiterQuote, session: any) {
  // Simulate trade execution - replace with actual Solana transaction
  const profit = Math.random() * 10 - 2; // Random profit/loss between -2 and +8
  
  session.totalProfit = (session.totalProfit || 0) + profit;
  
  return {
    simulated: true,
    profit,
    transactionId: `simulated_${Date.now()}`,
    timestamp: new Date().toISOString()
  };
}
