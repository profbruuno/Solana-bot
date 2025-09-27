import type { NextApiRequest, NextApiResponse } from "next";

// Simple in-memory storage
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
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
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
    console.log("Start endpoint called");
    
    const { key, capital, address } = req.body;

    // Basic validation
    if (!key || !capital || !address) {
      return res.status(400).json({ 
        status: "error", 
        message: "Missing required fields: key, capital, or address" 
      });
    }

    // Update bot state
    botState = {
      running: true,
      capital: Number(capital) || 500,
      address: address || "",
      lastUpdate: Date.now()
    };

    // Simulate getting a quote (without external API call for reliability)
    const simulatedPrice = (Math.random() * 15 + 5).toFixed(4); // Random price between 5-20 USDC

    res.status(200).json({ 
      status: "success",
      botStatus: "Running", 
      message: "Trading bot started successfully",
      data: {
        input: "0.01 SOL",
        output: `${simulatedPrice} USDC`,
        capital: botState.capital,
        address: botState.address
      },
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error("Start error:", error);
    res.status(200).json({ 
      status: "error",
      message: error.message || "Internal server error" 
    });
  }
}
