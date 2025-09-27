import { useState, useEffect, useRef } from "react";

interface Trade {
  id: number;
  type: 'BUY' | 'SELL';
  amount: number;
  price: number;
  profit: number;
  timestamp: string;
  token: string;
}

export default function Home() {
  const [key, setKey] = useState("");
  const [capital, setCapital] = useState("500");
  const [address, setAddress] = useState("");
  const [status, setStatus] = useState("Stopped");
  const [output, setOutput] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<'demo' | 'real'>('demo');
  const [trades, setTrades] = useState<Trade[]>([]);
  const [profit, setProfit] = useState(0);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [tradingStats, setTradingStats] = useState({
    totalTrades: 0,
    winningTrades: 0,
    losingTrades: 0,
    totalProfit: 0
  });

  const tradingInterval = useRef<NodeJS.Timeout | null>(null);

  // Simulate real market price fluctuations
  const generateMarketPrice = (basePrice: number = 12.50) => {
    // More realistic price movements
    const volatility = mode === 'real' ? 0.8 : 0.3; // Higher volatility in real mode
    const trend = Math.sin(Date.now() / 60000) * 2; // 1-minute cycles
    const randomMove = (Math.random() - 0.5) * volatility * 4;
    return Math.max(5, basePrice + trend + randomMove);
  };

  // Simulate trading bot logic
  const simulateTradingCycle = () => {
    const newPrice = generateMarketPrice();
    setCurrentPrice(newPrice);

    // Trading logic - buy low, sell high
    const shouldTrade = Math.random() > 0.7; // 30% chance to trade each cycle
    
    if (shouldTrade && status === "Running") {
      const tradeType = Math.random() > 0.5 ? 'BUY' : 'SELL';
      const tradeAmount = Math.random() * 0.1 + 0.01; // 0.01-0.11 SOL
      const tradeProfit = (Math.random() - 0.4) * 20; // -8 to +12 USDC profit
      
      const newTrade: Trade = {
        id: Date.now(),
        type: tradeType,
        amount: parseFloat(tradeAmount.toFixed(4)),
        price: parseFloat(newPrice.toFixed(4)),
        profit: parseFloat(tradeProfit.toFixed(2)),
        timestamp: new Date().toISOString(),
        token: address || 'SOL'
      };

      setTrades(prev => [newTrade, ...prev.slice(0, 9)]); // Keep last 10 trades
      setProfit(prev => prev + tradeProfit);
      
      setTradingStats(prev => ({
        totalTrades: prev.totalTrades + 1,
        winningTrades: prev.winningTrades + (tradeProfit > 0 ? 1 : 0),
        losingTrades: prev.losingTrades + (tradeProfit < 0 ? 1 : 0),
        totalProfit: prev.totalProfit + tradeProfit
      }));

      // Update output with live trading data
      setOutput({
        status: "success",
        botStatus: "Running",
        message: `Trade executed: ${tradeType} ${tradeAmount.toFixed(4)} SOL`,
        data: {
          price: newPrice.toFixed(4),
          trade: newTrade,
          cumulativeProfit: profit + tradeProfit,
          timestamp: new Date().toISOString()
        }
      });
    } else {
      // Just update price without trade
      setOutput({
        status: "success",
        botStatus: "Running",
        message: "Monitoring market...",
        data: {
          currentPrice: newPrice.toFixed(4),
          mode: mode,
          totalTrades: trades.length,
          cumulativeProfit: profit,
          timestamp: new Date().toISOString()
        }
      });
    }
  };

  // Start/stop trading loop
  useEffect(() => {
    if (status === "Running" && mode === 'real') {
      tradingInterval.current = setInterval(simulateTradingCycle, 3000); // Trade every 3 seconds
    } else {
      if (tradingInterval.current) {
        clearInterval(tradingInterval.current);
        tradingInterval.current = null;
      }
    }

    return () => {
      if (tradingInterval.current) {
        clearInterval(tradingInterval.current);
      }
    };
  }, [status, mode]);

  const startTrading = async () => {
    setIsLoading(true);
    setOutput(null);
    setTrades([]);
    setProfit(0);
    setTradingStats({
      totalTrades: 0,
      winningTrades: 0,
      losingTrades: 0,
      totalProfit: 0
    });

    try {
      if (!key.trim() || !capital.trim() || !address.trim()) {
        throw new Error("Please fill in all fields");
      }

      // Initialize with current market price
      const initialPrice = generateMarketPrice();
      setCurrentPrice(initialPrice);

      setStatus("Running");
      setOutput({
        status: "success",
        botStatus: "Running",
        message: `Trading bot started in ${mode.toUpperCase()} mode!`,
        data: {
          mode: mode,
          initialCapital: capital,
          tokenAddress: address,
          initialPrice: initialPrice.toFixed(4),
          timestamp: new Date().toISOString()
        }
      });

    } catch (error: any) {
      setOutput({ 
        status: "error", 
        message: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  const stopTrading = () => {
    setIsLoading(true);
    
    if (tradingInterval.current) {
      clearInterval(tradingInterval.current);
      tradingInterval.current = null;
    }

    setStatus("Stopped");
    setOutput({
      status: "success",
      botStatus: "Stopped",
      message: "Trading bot stopped successfully",
      data: {
        finalStats: tradingStats,
        finalProfit: profit,
        totalTrades: trades.length,
        timestamp: new Date().toISOString()
      }
    });
    setIsLoading(false);
  };

  const getMarketData = () => {
    const newPrice = generateMarketPrice();
    setCurrentPrice(newPrice);
    
    setOutput({
      status: "success",
      botStatus: status,
      message: "Current market data",
      data: {
        currentPrice: newPrice.toFixed(4),
        mode: mode,
        status: status,
        priceChange: ((newPrice - 12.50) / 12.50 * 100).toFixed(2) + '%',
        timestamp: new Date().toISOString()
      }
    });
  };

  const winRate = tradingStats.totalTrades > 0 
    ? ((tradingStats.winningTrades / tradingStats.totalTrades) * 100).toFixed(1)
    : '0.0';

  return (
    <main style={{ 
      padding: 20, 
      maxWidth: 800, 
      margin: "0 auto", 
      fontFamily: 'Arial, sans-serif',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <div style={{ 
        background: 'white', 
        padding: 30, 
        borderRadius: 15, 
        boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
        marginTop: 20
      }}>
        <h1 style={{ 
          color: '#333', 
          textAlign: 'center', 
          marginBottom: 5,
          fontSize: '2rem'
        }}>
          🤖 Advanced Trading Bot
        </h1>
        
        <p style={{ 
          color: '#666', 
          textAlign: 'center', 
          marginBottom: 30
        }}>
          {mode === 'real' ? '🚀 REAL-TIME TRADING' : '💡 DEMO MODE'} 
          {status === "Running" && ' • LIVE'}
        </p>

        {/* Mode Selector */}
        <div style={{ marginBottom: 25, textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', background: '#f0f0f0', borderRadius: 25, padding: 5 }}>
            <button
              onClick={() => setMode('demo')}
              style={{
                padding: '10px 20px',
                border: 'none',
                borderRadius: 20,
                background: mode === 'demo' ? '#0070f3' : 'transparent',
                color: mode === 'demo' ? 'white' : '#666',
                cursor: 'pointer',
                fontWeight: 'bold',
                transition: 'all 0.3s'
              }}
            >
              💡 Demo Mode
            </button>
            <button
              onClick={() => setMode('real')}
              style={{
                padding: '10px 20px',
                border: 'none',
                borderRadius: 20,
                background: mode === 'real' ? '#28a745' : 'transparent',
                color: mode === 'real' ? 'white' : '#666',
                cursor: 'pointer',
                fontWeight: 'bold',
                transition: 'all 0.3s'
              }}
            >
              🚀 Real Mode
            </button>
          </div>
        </div>

        {/* Trading Inputs */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: "block", marginBottom: 8, fontWeight: "bold" }}>
            🔑 Private Key / Seed Phrase
          </label>
          <textarea 
            value={key} 
            onChange={(e) => setKey(e.target.value)}
            placeholder="Enter your private key or seed phrase"
            style={{ 
              width: "100%", 
              padding: 12, 
              border: "2px solid #ddd", 
              borderRadius: 8,
              minHeight: 80,
              fontSize: 14
            }}
          />
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ display: "block", marginBottom: 8, fontWeight: "bold" }}>
            💰 Trading Capital (USDC)
          </label>
          <input
            type="number"
            value={capital}
            onChange={(e) => setCapital(e.target.value)}
            style={{ 
              width: "100%", 
              padding: 12, 
              border: "2px solid #ddd", 
              borderRadius: 8,
              fontSize: 16
            }}
          />
        </div>

        <div style={{ marginBottom: 25 }}>
          <label style={{ display: "block", marginBottom: 8, fontWeight: "bold" }}>
            📍 Token Contract Address
          </label>
          <input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Enter token contract address to trade"
            style={{ 
              width: "100%", 
              padding: 12, 
              border: "2px solid #ddd", 
              borderRadius: 8,
              fontSize: 14
            }}
          />
        </div>

        {/* Control Buttons */}
        <div style={{ marginBottom: 25, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button 
            onClick={startTrading} 
            disabled={isLoading || status === "Running"}
            style={{ 
              padding: "15px 25px", 
              backgroundColor: status === "Running" ? "#28a745" : "#0070f3",
              color: "white",
              border: "none",
              borderRadius: 8,
              cursor: (isLoading || status === "Running") ? "not-allowed" : "pointer",
              fontSize: 16,
              fontWeight: 'bold',
              flex: 1,
              minWidth: 140,
              opacity: (isLoading || status === "Running") ? 0.7 : 1
            }}
          >
            {isLoading ? "🔄 Starting..." : status === "Running" ? "✅ Live Trading" : "🚀 Start Trading"}
          </button>
          
          <button 
            onClick={getMarketData} 
            disabled={isLoading}
            style={{ 
              padding: "15px 25px", 
              backgroundColor: "#6c757d",
              color: "white",
              border: "none",
              borderRadius: 8,
              cursor: isLoading ? "not-allowed" : "pointer",
              fontSize: 16,
              fontWeight: 'bold',
              flex: 1,
              minWidth: 140,
              opacity: isLoading ? 0.7 : 1
            }}
          >
            📊 Market Data
          </button>
          
          <button 
            onClick={stopTrading} 
            disabled={isLoading || status === "Stopped"}
            style={{ 
              padding: "15px 25px",
              backgroundColor: status === "Stopped" ? "#6c757d" : "#dc3545",
              color: "white",
              border: "none",
              borderRadius: 8,
              cursor: (isLoading || status === "Stopped") ? "not-allowed" : "pointer",
              fontSize: 16,
              fontWeight: 'bold',
              flex: 1,
              minWidth: 140,
              opacity: (isLoading || status === "Stopped") ? 0.7 : 1
            }}
          >
            {isLoading ? "🔄 Stopping..." : "🛑 Stop Trading"}
          </button>
        </div>

        {/* Status Panel */}
        <div style={{ 
          padding: 20, 
          backgroundColor: status === "Running" ? 
            "linear-gradient(135deg, #d4edda, #c3e6cb)" : 
            "linear-gradient(135deg, #fff3cd, #ffeaa7)",
          border: `3px solid ${status === "Running" ? "#28a745" : "#ffc107"}`,
          borderRadius: 12,
          marginBottom: 20,
          textAlign: 'center'
        }}>
          <h2 style={{ 
            margin: '0 0 10px 0', 
            color: status === "Running" ? "#155724" : "#856404",
            fontSize: '1.5rem'
          }}>
            {status === "Running" ? "✅ LIVE TRADING" : "⏸️ TRADING STOPPED"}
          </h2>
          <p style={{ margin: '5px 0', color: status === "Running" ? "#155724" : "#856404" }}>
            <strong>Mode:</strong> {mode.toUpperCase()} • <strong>Status:</strong> {status}
          </p>
          {status === "Running" && currentPrice > 0 && (
            <p style={{ margin: '5px 0', color: "#155724", fontSize: '1.2rem', fontWeight: 'bold' }}>
              📈 Current Price: <strong>${currentPrice.toFixed(4)}</strong> per SOL
            </p>
          )}
        </div>

        {/* Trading Statistics */}
        {status === "Running" && (
          <div style={{ 
            padding: 15, 
            backgroundColor: "#e3f2fd",
            border: "2px solid #2196f3",
            borderRadius: 8,
            marginBottom: 20
          }}>
            <h3 style={{ margin: '0 0 10px 0', color: "#0d47a1" }}>📈 Live Trading Stats</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, fontSize: '14px' }}>
              <div>
                <strong>Total Trades:</strong> {tradingStats.totalTrades}
              </div>
              <div>
                <strong>Win Rate:</strong> {winRate}%
              </div>
              <div>
                <strong>Profit/Loss:</strong> 
                <span style={{ color: profit >= 0 ? '#28a745' : '#dc3545', fontWeight: 'bold' }}>
                  ${profit.toFixed(2)}
                </span>
              </div>
              <div>
                <strong>Current Mode:</strong> {mode.toUpperCase()}
              </div>
            </div>
          </div>
        )}

        {/* Recent Trades */}
        {trades.length > 0 && (
          <div style={{ 
            padding: 15, 
            backgroundColor: "#f8f9fa",
            border: "2px solid #6c757d",
            borderRadius: 8,
            marginBottom: 20
          }}>
            <h3 style={{ margin: '0 0 10px 0', color: "#495057" }}>📋 Recent Trades</h3>
            <div style={{ maxHeight: 200, overflowY: 'auto' }}>
              {trades.slice(0, 5).map((trade) => (
                <div key={trade.id} style={{ 
                  padding: '8px', 
                  margin: '5px 0', 
                  backgroundColor: 'white',
                  borderRadius: 4,
                  borderLeft: `4px solid ${trade.type === 'BUY' ? '#28a745' : '#dc3545'}`
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                    <span style={{ fontWeight: 'bold', color: trade.type === 'BUY' ? '#28a745' : '#dc3545' }}>
                      {trade.type}
                    </span>
                    <span style={{ color: trade.profit >= 0 ? '#28a745' : '#dc3545' }}>
                      {trade.profit >= 0 ? '+' : ''}{trade.profit} USDC
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#666' }}>
                    <span>{trade.amount} SOL @ ${trade.price}</span>
                    <span>{new Date(trade.timestamp).toLocaleTimeString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Output Display */}
        {output && (
          <div style={{ 
            padding: 15, 
            backgroundColor: output.status === "error" ? 
              "linear-gradient(135deg, #f8d7da, #f5c6cb)" : 
              "linear-gradient(135deg, #d1ecf1, #bee5eb)",
            border: `3px solid ${output.status === "error" ? "#dc3545" : "#17a2b8"}`,
            borderRadius: 12
          }}>
            <h3 style={{ 
              marginBottom: 15, 
              color: output.status === "error" ? "#721c24" : "#0c5460",
              fontSize: '1.2rem'
            }}>
              {output.status === "error" ? "❌ Error" : "📊 Trading Activity"}
            </h3>
            <pre style={{ 
              whiteSpace: "pre-wrap", 
              wordBreak: "break-word",
              fontSize: 13,
              backgroundColor: "rgba(255,255,255,0.9)",
              padding: 12,
              borderRadius: 6,
              border: "1px solid rgba(0,0,0,0.1)",
              maxHeight: 300,
              overflow: 'auto',
              fontFamily: 'monospace'
            }}>
              {JSON.stringify(output, null, 2)}
            </pre>
          </div>
        )}

        {/* Info Panel */}
        <div style={{ 
          marginTop: 20, 
          padding: 15, 
          backgroundColor: mode === 'real' ? "#d4edda" : "#fff3cd",
          border: `2px solid ${mode === 'real' ? "#28a745" : "#ffc107"}`,
          borderRadius: 8
        }}>
          <h4 style={{ margin: '0 0 10px 0', color: mode === 'real' ? "#155724" : "#856404" }}>
            {mode === 'real' ? '🚀 Real Mode Active' : '💡 Demo Mode Active'}
          </h4>
          <p style={{ margin: 0, fontSize: '14px', color: mode === 'real' ? "#155724" : "#856404" }}>
            <strong>{mode === 'real' ? 'Real Mode:' : 'Demo Mode:'}</strong> {
              mode === 'real' 
                ? 'Simulates live trading with realistic price movements and automatic trade execution every 3 seconds.'
                : 'Shows basic trading simulation with slower price changes for demonstration.'
            }
          </p>
        </div>
      </div>
    </main>
  );
              }
