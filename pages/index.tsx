import { useState, useEffect, useRef } from "react";

interface Trade {
  id: number;
  type: 'BUY' | 'SELL';
  amount: number;
  price: number;
  pnl: number;
  timestamp: string;
  token: string;
}

interface Position {
  token: string;
  amount: number;
  entryPrice: number;
  currentPrice: number;
  pnl: number;
}

export default function Home() {
  const [privateKey, setPrivateKey] = useState("");
  const [capital, setCapital] = useState("1000");
  const [slippage, setSlippage] = useState("1.0");
  const [riskPercent, setRiskPercent] = useState("2");
  const [status, setStatus] = useState("Stopped");
  const [output, setOutput] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const [balances, setBalances] = useState({
    usdc: 1000,
    sol: 0,
    totalValue: 1000
  });
  
  const [marketData, setMarketData] = useState({
    solPrice: 0,
    priceChange: 0,
    lastUpdated: ""
  });
  
  const [trades, setTrades] = useState<Trade[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [tradingStats, setTradingStats] = useState({
    totalTrades: 0,
    winningTrades: 0,
    totalPnl: 0,
    dailyPnl: 0
  });

  const tradingInterval = useRef<NodeJS.Timeout | null>(null);

  // Fetch real SOL price from Jupiter API
  const fetchSolPrice = async () => {
    try {
      const response = await fetch(
        'https://price.jup.ag/v4/price?ids=SOL&vsToken=USDC'
      );
      const data = await response.json();
      
      if (data.data?.SOL?.price) {
        const newPrice = data.data.SOL.price;
        setMarketData(prev => ({
          solPrice: newPrice,
          priceChange: ((newPrice - prev.solPrice) / prev.solPrice * 100) || 0,
          lastUpdated: new Date().toLocaleTimeString()
        }));

        // Update position PnL
        updatePositionPnL(newPrice);
        
        // Update total portfolio value
        updatePortfolioValue(newPrice);
      }
    } catch (error) {
      console.error('Error fetching SOL price:', error);
    }
  };

  const updatePositionPnL = (currentPrice: number) => {
    setPositions(prev => prev.map(position => ({
      ...position,
      currentPrice,
      pnl: (currentPrice - position.entryPrice) * position.amount
    })));
  };

  const updatePortfolioValue = (solPrice: number) => {
    const solValue = balances.sol * solPrice;
    const totalValue = balances.usdc + solValue;
    setBalances(prev => ({ ...prev, totalValue }));
  };

  // Trading strategy: Simple mean reversion
  const executeTradingStrategy = (currentPrice: number) => {
    if (status !== "Running") return;

    const priceChange = marketData.priceChange;
    const availableUSDC = balances.usdc;
    const availableSOL = balances.sol;

    // Buy signal: Price drops more than 1%
    if (priceChange < -1 && availableUSDC > 10) {
      const tradeAmount = (availableUSDC * parseFloat(riskPercent)) / 100;
      const solAmount = tradeAmount / currentPrice;
      
      executeTrade('BUY', solAmount, currentPrice);
    }
    // Sell signal: Price rises more than 1.5%
    else if (priceChange > 1.5 && availableSOL > 0.01) {
      const solAmount = availableSOL * 0.5; // Sell 50% of position
      executeTrade('SELL', solAmount, currentPrice);
    }
  };

  const executeTrade = (type: 'BUY' | 'SELL', amount: number, price: number) => {
    const slippageAmount = parseFloat(slippage) / 100;
    const executedPrice = type === 'BUY' ? price * (1 + slippageAmount) : price * (1 - slippageAmount);
    
    let pnl = 0;
    let newBalances = { ...balances };

    if (type === 'BUY') {
      const cost = amount * executedPrice;
      if (cost > balances.usdc) return; // Insufficient funds

      newBalances.usdc -= cost;
      newBalances.sol += amount;

      // Close any existing short position or open long
      const existingPosition = positions.find(p => p.token === 'SOL');
      if (existingPosition) {
        pnl = (executedPrice - existingPosition.entryPrice) * amount;
      }
    } else {
      const revenue = amount * executedPrice;
      if (amount > balances.sol) return; // Insufficient SOL

      newBalances.usdc += revenue;
      newBalances.sol -= amount;

      // Calculate PnL for the sale
      const existingPosition = positions.find(p => p.token === 'SOL');
      if (existingPosition) {
        pnl = (executedPrice - existingPosition.entryPrice) * amount;
      }
    }

    const newTrade: Trade = {
      id: Date.now(),
      type,
      amount: parseFloat(amount.toFixed(4)),
      price: parseFloat(executedPrice.toFixed(4)),
      pnl: parseFloat(pnl.toFixed(2)),
      timestamp: new Date().toISOString(),
      token: 'SOL'
    };

    setBalances(newBalances);
    setTrades(prev => [newTrade, ...prev.slice(0, 19)]); // Keep last 20 trades

    // Update trading statistics
    setTradingStats(prev => ({
      totalTrades: prev.totalTrades + 1,
      winningTrades: prev.winningTrades + (pnl > 0 ? 1 : 0),
      totalPnl: prev.totalPnl + pnl,
      dailyPnl: prev.dailyPnl + pnl
    }));

    // Update positions
    updatePositions(type, amount, executedPrice);

    setOutput({
      status: "success",
      message: `${type} order executed: ${amount.toFixed(4)} SOL @ $${executedPrice.toFixed(2)}`,
      data: {
        trade: newTrade,
        newBalances,
        timestamp: new Date().toISOString()
      }
    });
  };

  const updatePositions = (type: 'BUY' | 'SELL', amount: number, price: number) => {
    if (type === 'BUY') {
      const existingPosition = positions.find(p => p.token === 'SOL');
      if (existingPosition) {
        // Average down or up
        const totalAmount = existingPosition.amount + amount;
        const averagePrice = ((existingPosition.entryPrice * existingPosition.amount) + (price * amount)) / totalAmount;
        
        setPositions(prev => prev.map(p => 
          p.token === 'SOL' 
            ? { ...p, amount: totalAmount, entryPrice: averagePrice, currentPrice: price }
            : p
        ));
      } else {
        // New position
        setPositions([{
          token: 'SOL',
          amount,
          entryPrice: price,
          currentPrice: price,
          pnl: 0
        }]);
      }
    } else {
      // SELL - reduce position
      const existingPosition = positions.find(p => p.token === 'SOL');
      if (existingPosition) {
        const newAmount = existingPosition.amount - amount;
        if (newAmount <= 0) {
          // Position closed
          setPositions(prev => prev.filter(p => p.token !== 'SOL'));
        } else {
          // Reduce position
          setPositions(prev => prev.map(p => 
            p.token === 'SOL' 
              ? { ...p, amount: newAmount, currentPrice: price }
              : p
          ));
        }
      }
    }
  };

  const startTrading = async () => {
    setIsLoading(true);
    
    try {
      if (!privateKey.trim()) {
        throw new Error("Private key is required");
      }

      // Initial price fetch
      await fetchSolPrice();

      setStatus("Running");
      setOutput({
        status: "success",
        message: "Trading bot started successfully",
        data: {
          initialCapital: capital,
          tradingStarted: new Date().toISOString(),
          strategy: "Mean Reversion"
        }
      });

      // Start trading interval
      tradingInterval.current = setInterval(async () => {
        await fetchSolPrice();
        executeTradingStrategy(marketData.solPrice);
      }, 5000); // Update every 5 seconds

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
    if (tradingInterval.current) {
      clearInterval(tradingInterval.current);
      tradingInterval.current = null;
    }

    setStatus("Stopped");
    setOutput({
      status: "success",
      message: "Trading bot stopped",
      data: {
        finalStats: tradingStats,
        finalBalance: balances.totalValue,
        totalTrades: trades.length
      }
    });
  };

  const manualTrade = (type: 'BUY' | 'SELL') => {
    if (status !== "Running") {
      setOutput({ status: "error", message: "Start trading first" });
      return;
    }

    const amount = type === 'BUY' ? 0.1 : Math.min(0.1, balances.sol);
    executeTrade(type, amount, marketData.solPrice);
  };

  const winRate = tradingStats.totalTrades > 0 
    ? ((tradingStats.winningTrades / tradingStats.totalTrades) * 100).toFixed(1)
    : '0.0';

  // Initialize price on component mount
  useEffect(() => {
    fetchSolPrice();
    const priceInterval = setInterval(fetchSolPrice, 30000); // Update price every 30 seconds

    return () => {
      if (priceInterval) clearInterval(priceInterval);
      if (tradingInterval.current) clearInterval(tradingInterval.current);
    };
  }, []);

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
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        marginBottom: 20
      }}>
        <h1 style={{ 
          color: '#1a1a1a', 
          marginBottom: 10,
          fontSize: '28px',
          fontWeight: '600'
        }}>
          Solana Trading Bot
        </h1>
        
        <p style={{ 
          color: '#666', 
          marginBottom: 30,
          fontSize: '16px'
        }}>
          Professional automated trading with real market data
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 30 }}>
          {/* Left Column - Configuration */}
          <div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", marginBottom: 8, fontWeight: "600", color: '#333' }}>
                Private Key
              </label>
              <textarea 
                value={privateKey} 
                onChange={(e) => setPrivateKey(e.target.value)}
                placeholder="Enter private key for trading"
                style={{ 
                  width: "100%", 
                  padding: 12, 
                  border: "1px solid #ddd", 
                  borderRadius: 4,
                  minHeight: 80,
                  fontSize: 14,
                  fontFamily: 'monospace'
                }}
              />
            </div>

            <div style={{ marginBottom: 15 }}>
              <label style={{ display: "block", marginBottom: 8, fontWeight: "600", color: '#333' }}>
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
                  fontSize: 14
                }}
              />
            </div>
          </div>

          {/* Right Column - Trading Parameters */}
          <div>
            <div style={{ marginBottom: 15 }}>
              <label style={{ display: "block", marginBottom: 8, fontWeight: "600", color: '#333' }}>
                Slippage (%)
              </label>
              <input
                type="number"
                value={slippage}
                onChange={(e) => setSlippage(e.target.value)}
                step="0.1"
                style={{ 
                  width: "100%", 
                  padding: 10, 
                  border: "1px solid #ddd", 
                  borderRadius: 4,
                  fontSize: 14
                }}
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", marginBottom: 8, fontWeight: "600", color: '#333' }}>
                Risk per Trade (%)
              </label>
              <input
                type="number"
                value={riskPercent}
                onChange={(e) => setRiskPercent(e.target.value)}
                min="0.1"
                max="10"
                style={{ 
                  width: "100%", 
                  padding: 10, 
                  border: "1px solid #ddd", 
                  borderRadius: 4,
                  fontSize: 14
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
                  fontSize: 14,
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
                  fontSize: 14,
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
                  fontSize: 13,
                  flex: 1
                }}
              >
                BUY 0.1 SOL
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
                  fontSize: 13,
                  flex: 1
                }}
              >
                SELL 0.1 SOL
              </button>
            </div>
          </div>
        </div>

        {/* Status Bar */}
        <div style={{ 
          padding: 15, 
          backgroundColor: status === "Running" ? "#d4edda" : "#f8d7da",
          border: `1px solid ${status === "Running" ? "#c3e6cb" : "#f5c6cb"}`,
          borderRadius: 4,
          marginBottom: 20,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span style={{ 
            fontWeight: '600', 
            color: status === "Running" ? "#155724" : "#721c24" 
          }}>
            Status: {status}
          </span>
          <span style={{ fontSize: '14px', color: '#666' }}>
            Last update: {marketData.lastUpdated}
          </span>
        </div>

        {/* Market Data and Balances */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
          <div style={{ padding: 15, backgroundColor: '#f8f9fa', borderRadius: 4, border: '1px solid #e9ecef' }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '16px', fontWeight: '600' }}>Market Data</h3>
            <div style={{ fontSize: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                <span>SOL Price:</span>
                <span style={{ fontWeight: '600' }}>${marketData.solPrice.toFixed(4)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                <span>24h Change:</span>
                <span style={{ 
                  fontWeight: '600', 
                  color: marketData.priceChange >= 0 ? '#28a745' : '#dc3545' 
                }}>
                  {marketData.priceChange.toFixed(2)}%
                </span>
              </div>
            </div>
          </div>

          <div style={{ padding: 15, backgroundColor: '#f8f9fa', borderRadius: 4, border: '1px solid #e9ecef' }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '16px', fontWeight: '600' }}>Portfolio</h3>
            <div style={{ fontSize: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                <span>USDC Balance:</span>
                <span>${balances.usdc.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                <span>SOL Balance:</span>
                <span>{balances.sol.toFixed(4)} SOL</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                <span>Total Value:</span>
                <span style={{ fontWeight: '600' }}>${balances.totalValue.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Trading Statistics */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
          <div style={{ padding: 15, backgroundColor: '#f8f9fa', borderRadius: 4, border: '1px solid #e9ecef' }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '16px', fontWeight: '600' }}>Trading Statistics</h3>
            <div style={{ fontSize: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                <span>Total Trades:</span>
                <span>{tradingStats.totalTrades}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                <span>Win Rate:</span>
                <span>{winRate}%</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
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

          <div style={{ padding: 15, backgroundColor: '#f8f9fa', borderRadius: 4, border: '1px solid #e9ecef' }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '16px', fontWeight: '600' }}>Open Positions</h3>
            {positions.length > 0 ? (
              positions.map(position => (
                <div key={position.token} style={{ fontSize: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                    <span>{position.token}:</span>
                    <span>{position.amount.toFixed(4)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                    <span>Entry Price:</span>
                    <span>${position.entryPrice.toFixed(4)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Unrealized PnL:</span>
                    <span style={{ 
                      fontWeight: '600', 
                      color: position.pnl >= 0 ? '#28a745' : '#dc3545' 
                    }}>
                      ${position.pnl.toFixed(2)}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ fontSize: '14px', color: '#666' }}>No open positions</div>
            )}
          </div>
        </div>

        {/* Recent Trades */}
        <div style={{ marginBottom: 20 }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '16px', fontWeight: '600' }}>Recent Trades</h3>
          <div style={{ 
            backgroundColor: '#f8f9fa', 
            borderRadius: 4, 
            border: '1px solid #e9ecef',
            maxHeight: 200,
            overflowY: 'auto'
          }}>
            {trades.length > 0 ? (
              trades.slice(0, 10).map(trade => (
                <div key={trade.id} style={{ 
                  padding: '10px 15px', 
                  borderBottom: '1px solid #e9ecef',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <span style={{ 
                      fontWeight: '600', 
                      color: trade.type === 'BUY' ? '#28a745' : '#dc3545',
                      marginRight: 10
                    }}>
                      {trade.type}
                    </span>
                    <span style={{ fontSize: '13px', color: '#666' }}>
                      {trade.amount} SOL @ ${trade.price}
                    </span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ 
                      fontWeight: '600', 
                      color: trade.pnl >= 0 ? '#28a745' : '#dc3545',
                      fontSize: '13px'
                    }}>
                      {trade.pnl >= 0 ? '+' : ''}${trade.pnl.toFixed(2)}
                    </div>
                    <div style={{ fontSize: '12px', color: '#999' }}>
                      {new Date(trade.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ padding: 20, textAlign: 'center', color: '#666' }}>
                No trades yet
              </div>
            )}
          </div>
        </div>

        {/* Output Console */}
        {output && (
          <div style={{ 
            padding: 15, 
            backgroundColor: output.status === "error" ? '#f8d7da' : '#d1ecf1',
            border: `1px solid ${output.status === "error" ? '#f5c6cb' : '#bee5eb'}`,
            borderRadius: 4
          }}>
            <div style={{ 
              fontWeight: '600', 
              color: output.status === "error" ? '#721c24' : '#0c5460',
              marginBottom: 10
            }}>
              {output.status === "error" ? "Error" : "Activity"}
            </div>
            <div style={{ 
              fontSize: '13px', 
              fontFamily: 'monospace',
              backgroundColor: 'rgba(255,255,255,0.7)',
              padding: 10,
              borderRadius: 2,
              maxHeight: 150,
              overflowY: 'auto'
            }}>
              {output.message}
              {output.data && (
                <div style={{ marginTop: 10, fontSize: '12px' }}>
                  {JSON.stringify(output.data, null, 2)}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
