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
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ 
      status: "error", 
      message: "Method not allowed. Use POST." 
    });
  }

  try {
    console.log("Stop endpoint called");

    const wasRunning = botState.running;
    botState.running = false;

    res.status(200).json({ 
      status: "success",
      botStatus: "Stopped",
      message: wasRunning ? "Trading bot stopped successfully" : "Bot was already stopped",
      data: {
        wasRunning: wasRunning,
        finalCapital: botState.capital,
        finalAddress: botState.address
      },
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error("Stop error:", error);
    res.status(200).json({ 
      status: "error",
      message: error.message || "Internal server error" 
    });
  }
}
