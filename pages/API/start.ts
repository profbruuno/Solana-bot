import type { NextApiRequest, NextApiResponse } from "next";
import { runTradingTick } from "../../lib/trading";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { key, capital, address } = req.body;

  const session = {
    walletKey: key,
    capital: Number(capital),
    contractAddress: address,
    running: true,
    dailyLoss: 0,
  };

  const result = await runTradingTick(session);

  res.json({ status: "Running", ...result });
}
