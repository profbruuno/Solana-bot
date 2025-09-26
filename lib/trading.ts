// Example imports -- adjust as needed
import fetch from 'node-fetch';

export async function getTradingData() {
    const resp = await fetch('YOUR_API_ENDPOINT');
    // Cast the response to the expected type to satisfy TypeScript
    const data = await resp.json() as { outAmount: number };

    const outAmount = data.outAmount;
    const uiPrice = outAmount / 1e6; // USDC has 6 decimals

    return {
        outAmount,
        uiPrice,
        // ...other return values as needed
    };
}

// If you expect additional fields, adjust the type accordingly:
export type TradingDataResponse = {
    outAmount: number;
    // Add other fields if your API response contains more
};
