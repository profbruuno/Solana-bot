import { useState, useEffect, useRef } from "react";

// Simple interfaces to avoid complex types
interface Trade {
  id: string;
  type: string;
  amount: number;
  price: number;
  pnl: number;
  timestamp: string;
}

export default function Home() {
  const [privateKey, setPrivateKey] = useState("");
  const [capital, setCapital] = useState("1000");
  const [slippage, setSlippage] = useState("1.0");
  const [riskPercent, setRiskPercent] = useState("2");
  const [status, setStatus] = useState("Stopped");
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState("");
  
  // Simplified state management
  const [balances, setBalances] = useState({
    usdc: 1000,
    sol: 0,
    totalValue: 1000
  });
  
  const [marketData, setMarketData] = useState({
    solPrice: 152.50,
    priceChange: 0.25,
    lastUpdated: new Date().toLocaleTimeString()
  });
  
  const [trades, setTrades] = useState<Trade[]>([]);
  const [tradingStats, setTradingStats] = useState({
    totalTrades: 0,
    winningTrades: 0,
    totalPnl: 0
  });

  const tradingInterval = useRef<NodeJS.Timeout | null>(null);

  // Safe price simulation - removed complex APIs
  const simulateRealisticPrice = () => {
    const basePrice = 152.50;
    const volatility = 0.018;
    const randomChange = (Math.random() - 0.5) * volatility * basePrice;
    const newPrice = Math.max(145, Math.min(160, basePrice + randomChange));
    
    const priceChange = marketData.solPrice > 0 ? 
      ((newPrice - marketData.solPrice) / marketData.solPrice * 100) : 0.25;
    
    setMarketData({
      solPrice: newPrice,
      priceChange: parseFloat(priceChange.toFixed(2)),
      lastUpdated: new Date().toLocaleTimeString()
    });

    // Update portfolio value
    const solValue = balances.sol * newPrice;
    const totalValue = balances.usdc + solValue;
    setBalances(prev => ({ ...prev, totalValue }));
  };

  // Safe user initialization
  const initializeUser = () => {
    try {
      let userIdentifier = localStorage.getItem('tradingBotUserId');
      if (!userIdentifier) {
        userIdentifier = 'user_' + Date.now();
        localStorage.setItem('tradingBotUserId', userIdentifier);
      }
      setUserId(userIdentifier);
      return userIdentifier;
    } catch (error) {
      const localUserId = 'local_' + Date.now();
      setUserId(localUserId);
      return localUserId;
    }
  };

  // Safe trade execution
  const executeTrade = (type: string, amount: number, price: number) => {
    try {
      if (amount < 0.001) return;

      const slippageAmount = parseFloat(slippage) / 100;
      const executedPrice = type === 'BUY' ? price * (1 + slippageAmount) : price * (1 - slippageAmount);
      
      let tradePnl = 0;
      const newBalances = { ...balances };

      if (type === 'BUY') {
        const cost = amount * executedPrice;
        if (cost > balances.usdc) return;
        newBalances.usdc -= cost;
        newBalances.sol += amount;
      } else {
        const revenue = amount * executedPrice;
        if (amount > balances.sol) return;
        newBalances.usdc += revenue;
        newBalances.sol -= amount;
      }

      // Simple PnL calculation
      if (type === 'SELL' && trades.length > 0) {
        const buyTrades = trades.filter(t => t.type === 'BUY');
        if (buyTrades.length > 0) {
          const totalCost = buyTrades.reduce((sum, trade) => sum + (trade.amount * trade.price), 0);
          const totalAmount = buyTrades.reduce((sum, trade) => sum + trade.amount, 0);
          const averageCost = totalAmount > 0 ? totalCost / totalAmount : 0;
          tradePnl = (executedPrice - averageCost) * amount;
        }
      }

      const newTrade: Trade = {
        id: 'trade_' + Date.now(),
        type,
        amount: parseFloat(amount.toFixed(4)),
        price: parseFloat(executedPrice.toFixed(2)),
        pnl: parseFloat(tradePnl.toFixed(2)),
        timestamp: new Date().toISOString()
      };

      setBalances(newBalances);
      setTrades(prev => [newTrade, ...prev.slice(0, 19)]);

      setTradingStats(prev => ({
        totalTrades: prev.totalTrades + 1,
        winningTrades: prev.winningTrades + (tradePnl > 0 ? 1 : 0),
        totalPnl: prev.totalPnl + tradePnl
      }));

    } catch (error) {
      console.error('Trade execution error:', error);
    }
  };

  // Safe trading strategy
  const executeTradingStrategy = () => {
    if (status !== "Running") return;

    const currentPrice = marketData.solPrice;
    const priceChange = marketData.priceChange;
    const availableUSDC = balances.usdc;
    const availableSOL = balances.sol;

    // Simple trading logic
    if (priceChange < -1.5 && availableUSDC > 50) {
      const tradeAmount = (availableUSDC * parseFloat(riskPercent)) / 100;
      const solAmount = tradeAmount / currentPrice;
      executeTrade('BUY', solAmount, currentPrice);
    }
    else if (priceChange > 2.0 && availableSOL > 0.01) {
      const solAmount = Math.min(availableSOL * 0.3, availableSOL);
      executeTrade('SELL', solAmount, currentPrice);
    }
  };

  // Safe start trading
  const startTrading = () => {
    setIsLoading(true);
    
    try {
      if (!privateKey.trim()) {
        alert("Please enter a private key");
        setIsLoading(false);
        return;
      }

      initializeUser();
      
      // Reset to initial state
      setBalances({
        usdc: parseFloat(capital) || 1000,
        sol: 0,
        totalValue: parseFloat(capital) || 1000
      });
      setTrades([]);
      setTradingStats({
        totalTrades: 0,
        winningTrades: 0,
        totalPnl: 0
      });

      setStatus("Running");

      // Start intervals
      tradingInterval.current = setInterval(() => {
        simulateRealisticPrice();
        executeTradingStrategy();
      }, 10000);

    } catch (error) {
      console.error('Start trading error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Safe stop trading
  const stopTrading = () => {
    if (tradingInterval.current) {
      clearInterval(tradingInterval.current);
      tradingInterval.current = null;
    }
    setStatus("Stopped");
  };

  // Safe manual trade
  const manualTrade = (type: string) => {
    if (status !== "Running") {
      alert("Start trading first");
      return;
    }

    const currentPrice = marketData.solPrice;
    const amount = 0.03;

    if ((type === 'BUY' && balances.usdc > amount * currentPrice) || 
        (type === 'SELL' && balances.sol > amount)) {
      executeTrade(type, amount, currentPrice);
    } else {
      alert("Insufficient funds");
    }
  };

  // Safe reset
  const resetAccount = () => {
    if (tradingInterval.current) {
      clearInterval(tradingInterval.current);
      tradingInterval.current = null;
    }

    localStorage.removeItem('tradingBotUserId');
    
    setBalances({
      usdc: parseFloat(capital) || 1000,
      sol: 0,
      totalValue: parseFloat(capital) || 1000
    });
    setTrades([]);
    setTradingStats({
      totalTrades: 0,
      winningTrades: 0,
      totalPnl: 0
    });
    setStatus("Stopped");
    
    initializeUser();
  };

  // Calculate win rate safely
  const winRate = tradingStats.totalTrades > 0 
    ? ((tradingStats.winningTrades / tradingStats.totalTrades) * 100).toFixed(1)
    : '0.0';

  // Safe useEffect
  useEffect(() => {
    initializeUser();
    
    // Price update interval
    const priceInterval = setInterval(simulateRealisticPrice, 20000);
    
    // Cleanup
    return () => {
      if (priceInterval) clearInterval(priceInterval);
      if (tradingInterval.current) clearInterval(tradingInterval.current);
    };
  }, []); // Empty dependency array for safety

  return (
    <main style={{ 
      padding: 20, 
      maxWidth: 1000, 
      margin: "0 auto", 
      fontFamily: 'Arial, sans-serif',
      background: '#f8f9fa',
      minHeight: '100vh'
    }}>
      <div style={{ 
        background: 'white', 
        padding: 30, 
        borderRadius: 8, 
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        marginBottom: 20
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h1 style={{ 
            color: '#1a1a1a',
            fontSize: '24px',
            fontWeight: '600',
            margin: 0
          }}>
            Solana Trading Bot
          </h1>
          <button 
            onClick={resetAccount}
            style={{ 
              padding: "8px 16px",
              backgroundColor: "#6c757d",
              color: "white",
              border: "none",
              borderRadius: 4,
              cursor: "pointer",
              fontSize: '13px'
            }}
          >
            Reset Account
          </button>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 30 }}>
          {/* Left Column */}
          <div>
            <div style={{ marginBottom: 15 }}>
              <label style={{ display: "block", marginBottom: 5, fontWeight: "600", color: '#333', fontSize: '14px' }}>
                Private Key
              </label>
              <textarea 
                value={privateKey} 
                onChange={(e) => setPrivateKey(e.target.value)}
                placeholder="Enter private key for demo"
                style={{ 
                  width: "100%", 
                  padding: 10, 
                  border: "1px solid #ddd", 
                  borderRadius: 4,
                  minHeight: 60,
                  fontSize: '13px',
                  fontFamily: 'monospace'
                }}
              />
            </div>

            <div style={{ marginBottom: 15 }}>
              <label style={{ display: "block", marginBottom: 5, fontWeight: "600", color: '#333', fontSize: '14px' }}>
                Trading Capital (USDC)
              </label>
              <input
                type="number"
                value={capital}
                onChange={(e) => setCapital(e.target.value)}
                style={{ 
                  width: "100%", 
                  padding: 10, 
                  border: "1px solid #ddd", 
                  borderRadius: 4,
                  fontSize: '14px'
                }}
              />
            </div>
          </div>

          {/* Right Column */}
          <div>
            <div style={{ marginBottom: 15 }}>
              <label style={{ display: "block", marginBottom: 5, fontWeight: "600", color: '#333', fontSize: '14px' }}>
                Slippage (%)
              </label>
              <input
                type="number"
                value={slippage}
                onChange={(e) => setSlippage(e.target.value)}
                style={{ 
                  width: "100%", 
                  padding: 10, 
                  border: "1px solid #ddd", 
                  borderRadius: 4,
                  fontSize: '14px'
                }}
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", marginBottom: 5, fontWeight: "600", color: '#333', fontSize: '14px' }}>
                Risk per Trade (%)
              </label>
              <input
                type="number"
                value={riskPercent}
                onChange={(e) => setRiskPercent(e.target.value)}
                style={{ 
                  width: "100%", 
                  padding: 10, 
                  border: "1px solid #ddd", 
                  borderRadius: 4,
                  fontSize: '14px'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
              <button 
                onClick={startTrading} 
                disabled={isLoading || status === "Running"}
                style={{ 
                  padding: "12px 20px", 
                  backgroundColor: status === "Running" ? "#28a745" : "#007bff",
                  color: "white",
                  border: "none",
                  borderRadius: 4,
                  cursor: (isLoading || status === "Running") ? "not-allowed" : "pointer",
                  fontSize: '14px',
                  fontWeight: '600',
                  flex: 1
                }}
              >
                {status === "Running" ? "Trading Active" : "Start Trading"}
              </button>
              
              <button 
                onClick={stopTrading} 
                disabled={isLoading || status === "Stopped"}
                style={{ 
                  padding: "12px 20px",
                  backgroundColor: status === "Stopped" ? "#6c757d" : "#dc3545",
                  color: "white",
                  border: "none",
                  borderRadius: 4,
                  cursor: (isLoading || status === "Stopped") ? "not-allowed" : "pointer",
                  fontSize: '14px',
                  fontWeight: '600',
                  flex: 1
                }}
              >
                Stop Trading
              </button>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button 
                onClick={() => manualTrade('BUY')}
                disabled={isLoading || status !== "Running"}
                style={{ 
                  padding: "10px 15px", 
                  backgroundColor: "#28a745",
                  color: "white",
                  border: "none",
                  borderRadius: 4,
                  cursor: (isLoading || status !== "Running") ? "not-allowed" : "pointer",
                  fontSize: '13px',
                  flex: 1
                }}
              >
                BUY 0.03 SOL
              </button>
              
              <button 
                onClick={() => manualTrade('SELL')}
                disabled={isLoading || status !== "Running"}
                style={{ 
                  padding: "10px 15px",
                  backgroundColor: "#dc3545",
                  color: "white",
                  border: "none",
                  borderRadius: 4,
                  cursor: (isLoading || status !== "Running") ? "not-allowed" : "pointer",
                  fontSize: '13px',
                  flex: 1
                }}
              >
                SELL 0.03 SOL
              </button>
            </div>
          </div>
        </div>

        {/* Status Bar */}
        <div style={{ 
          padding: 15, 
          backgroundColor: status === "Running" ? "#d4edda" : "#fff3cd",
          border: `1px solid ${status === "Running" ? "#c3e6cb" : "#ffeaa7"}`,
          borderRadius: 4,
          marginBottom: 20,
          textAlign: 'center'
        }}>
          <span style={{ 
            fontWeight: '600', 
            color: status === "Running" ? "#155724" : "#856404",
            fontSize: '16px'
          }}>
            Status: {status} | SOL Price: ${marketData.solPrice.toFixed(2)}
          </span>
        </div>

        {/* Market Data and Portfolio */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15, marginBottom: 20 }}>
          <div style={{ padding: 15, backgroundColor: '#f8f9fa', borderRadius: 4, border: '1px solid #e9ecef' }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '15px', fontWeight: '600' }}>Market Data</h3>
            <div style={{ fontSize: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                <span>SOL Price:</span>
                <span style={{ fontWeight: '600' }}>${marketData.solPrice.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Price Change:</span>
                <span style={{ 
                  fontWeight: '600', 
                  color: marketData.priceChange >= 0 ? '#28a745' : '#dc3545' 
                }}>
                  {marketData.priceChange >= 0 ? '+' : ''}{marketData.priceChange}%
                </span>
              </div>
            </div>
          </div>

          <div style={{ padding: 15, backgroundColor: '#f8f9fa', borderRadius: 4, border: '1px solid #e9ecef' }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '15px', fontWeight: '600' }}>Portfolio</h3>
            <div style={{ fontSize: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                <span>USDC:</span>
                <span>${balances.usdc.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                <span>SOL:</span>
                <span>{balances.sol.toFixed(4)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Total Value:</span>
                <span style={{ fontWeight: '600' }}>${balances.totalValue.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Trading Statistics */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15, marginBottom: 20 }}>
          <div style={{ padding: 15, backgroundColor: '#f8f9fa', borderRadius: 4, border: '1px solid #e9ecef' }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '15px', fontWeight: '600' }}>Trading Statistics</h3>
            <div style={{ fontSize: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                <span>Total Trades:</span>
                <span>{tradingStats.totalTrades}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                <span>Win Rate:</span>
                <span>{winRate}%</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Total PnL:</span>
                <span style={{ 
                  fontWeight: '600', 
                  color: tradingStats.totalPnl >= 0 ? '#28a745' : '#dc3545' 
                }}>
                  ${tradingStats.totalPnl.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          <div style={{ padding: 15, backgroundColor: '#e7f3ff', borderRadius: 4, border: '1px solid #b3d9ff' }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '15px', fontWeight: '600', color: '#0066cc' }}>Trading Bot</h3>
            <div style={{ fontSize: '13px', color: '#0066cc' }}>
              <div style={{ marginBottom: 5 }}>✅ Client-Side Only</div>
              <div style={{ marginBottom: 5 }}>✅ No External Dependencies</div>
              <div>✅ Realistic Price Simulation</div>
            </div>
          </div>
        </div>

        {/* Recent Trades */}
        <div style={{ marginBottom: 20 }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '15px', fontWeight: '600' }}>Recent Trades</h3>
          <div style={{ 
            backgroundColor: '#f8f9fa', 
            borderRadius: 4, 
            border: '1px solid #e9ecef',
            maxHeight: 300,
            overflowY: 'auto'
          }}>
            {trades.length > 0 ? (
              trades.map(trade => (
                <div key={trade.id} style={{ 
                  padding: '10px 15px', 
                  borderBottom: '1px solid #e9ecef',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '13px'
                }}>
                  <div>
                    <span style={{ 
                      fontWeight: '600', 
                      color: trade.type === 'BUY' ? '#28a745' : '#dc3545',
                      marginRight: 10
                    }}>
                      {trade.type}
                    </span>
                    <span style={{ color: '#666' }}>
                      {trade.amount.toFixed(3)} SOL
                    </span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: '#666' }}>
                      @ ${trade.price.toFixed(2)}
                    </div>
                    <div style={{ 
                      fontWeight: '600', 
                      color: trade.pnl >= 0 ? '#28a745' : '#dc3545',
                      fontSize: '12px'
                    }}>
                      {trade.pnl >= 0 ? '+' : ''}${trade.pnl.toFixed(2)}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ padding: 20, textAlign: 'center', color: '#666', fontSize: '14px' }}>
                No trades yet. Start trading to see your history.
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
