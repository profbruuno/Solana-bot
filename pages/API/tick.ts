import type { NextApiRequest, NextApiResponse } from "next";
import { runTradingTick } from "../../lib/trading";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const result = await runTradingTick({});
  res.json(result);
}
