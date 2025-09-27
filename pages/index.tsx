import { useState } from "react";

export default function Home() {
  const [key, setKey] = useState("");
  const [capital, setCapital] = useState("500");
  const [address, setAddress] = useState("");
  const [status, setStatus] = useState("Stopped");
  const [output, setOutput] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Client-side trading simulation
  const simulateTrading = async (action: 'start' | 'tick' | 'stop') => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const SOL_MINT = "So11111111111111111111111111111111111111112";
    const USDC_MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";
    
    // Generate realistic price data
    const basePrice = 12.50;
    const variation = (Math.random() - 0.5) * 4; // ±2 USDC variation
    const currentPrice = (basePrice + variation).toFixed(4);
    
    switch (action) {
      case 'start':
        return {
          status: "success",
          botStatus: "Running", 
          message: "Trading bot started successfully",
          data: {
            input: "0.01 SOL",
            output: `${currentPrice} USDC`,
            capital: Number(capital),
            address: address,
            timestamp: new Date().toISOString()
          }
        };
      
      case 'tick':
        return {
          status: "success",
          botStatus: status === "Running" ? "Running" : "Stopped",
          message: status === "Running" ? "Current market data" : "Bot is stopped",
          data: status === "Running" ? {
            input: "0.01 SOL",
            output: `${currentPrice} USDC`,
            price: parseFloat(currentPrice),
            capital: Number(capital),
            address: address,
            running: status === "Running",
            timestamp: new Date().toISOString()
          } : null
        };
      
      case 'stop':
        return {
          status: "success",
          botStatus: "Stopped",
          message: "Trading bot stopped successfully",
          data: {
            wasRunning: status === "Running",
            finalCapital: Number(capital),
            finalAddress: address,
            timestamp: new Date().toISOString()
          }
        };
      
      default:
        return {
          status: "error",
          message: "Unknown action"
        };
    }
  };

  async function startBot() {
    setIsLoading(true);
    setOutput(null);
    
    try {
      // Validate inputs
      if (!key.trim() || !capital.trim() || !address.trim()) {
        throw new Error("Please fill in all fields");
      }

      if (key.trim().length < 10) {
        throw new Error("Please enter a valid private key or seed phrase");
      }

      if (address.trim().length < 10) {
        throw new Error("Please enter a valid contract address");
      }

      const data = await simulateTrading('start');
      setStatus(data.botStatus || "Running");
      setOutput(data);
      
    } catch (error: any) {
      setOutput({ 
        status: "error", 
        message: error.message || "Failed to start bot"
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function stopBot() {
    setIsLoading(true);
    
    try {
      const data = await simulateTrading('stop');
      setStatus(data.botStatus || "Stopped");
      setOutput(data);
      
    } catch (error: any) {
      setOutput({ 
        status: "error", 
        message: error.message || "Failed to stop bot"
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function tickBot() {
    setIsLoading(true);
    
    try {
      const data = await simulateTrading('tick');
      setStatus(data.botStatus || status);
      setOutput(data);
      
    } catch (error: any) {
      setOutput({ 
        status: "error", 
        message: error.message || "Failed to get market data"
      });
    } finally {
      setIsLoading(false);
    }
  }

  // Real Jupiter API call (optional - can be enabled later)
  const getRealQuote = async () => {
    try {
      const SOL_MINT = "So11111111111111111111111111111111111111112";
      const USDC_MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";
      const amountLamports = 0.01 * 1e9;
      
      const url = `https://quote-api.jup.ag/v6/quote?inputMint=${SOL_MINT}&outputMint=${USDC_MINT}&amount=${amountLamports}&slippageBps=50`;
      
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch quote');
      
      const data = await response.json();
      const outAmount = data?.outAmount;
      const uiPrice = outAmount / 1e6;
      
      return {
        status: "success",
        input: "0.01 SOL",
        output: `${uiPrice.toFixed(4)} USDC`,
        realData: true
      };
    } catch (error) {
      // Fallback to simulated data
      return simulateTrading('tick');
    }
  };

  return (
    <main style={{ 
      padding: 20, 
      maxWidth: 800, 
      margin: "0 auto", 
      fontFamily: 'Arial, sans-serif',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      minHeight: '100vh'
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
          marginBottom: 10,
          fontSize: '2.5rem',
          background: 'linear-gradient(45deg, #667eea, #764ba2)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          🔥 Solana Trading Bot
        </h1>
        
        <p style={{ 
          color: '#666', 
          textAlign: 'center', 
          marginBottom: 30,
          fontSize: '1.1rem'
        }}>
          Advanced automated trading for Solana tokens
        </p>

        <div style={{ marginBottom: 25 }}>
          <label style={{ 
            display: "block", 
            marginBottom: 8, 
            fontWeight: "bold",
            color: '#333',
            fontSize: '1.1rem'
          }}>
            🔑 Private key / Seed phrase
          </label>
          <textarea 
            value={key} 
            onChange={(e) => setKey(e.target.value)}
            placeholder="Enter your private key or seed phrase (demo only)"
            style={{ 
              width: "100%", 
              padding: 15, 
              border: "2px solid #e1e5e9", 
              borderRadius: 10,
              minHeight: 100,
              fontFamily: 'monospace',
              fontSize: 14,
              transition: 'border-color 0.3s'
            }}
            onFocus={(e) => e.target.style.borderColor = '#667eea'}
            onBlur={(e) => e.target.style.borderColor = '#e1e5e9'}
          />
        </div>

        <div style={{ marginBottom: 25 }}>
          <label style={{ 
            display: "block", 
            marginBottom: 8, 
            fontWeight: "bold",
            color: '#333',
            fontSize: '1.1rem'
          }}>
            💰 Capital (USDC)
          </label>
          <input
            type="number"
            value={capital}
            onChange={(e) => setCapital(e.target.value)}
            style={{ 
              width: "100%", 
              padding: 15, 
              border: "2px solid #e1e5e9", 
              borderRadius: 10,
              fontSize: 16,
              transition: 'border-color 0.3s'
            }}
            onFocus={(e) => e.target.style.borderColor = '#667eea'}
            onBlur={(e) => e.target.style.borderColor = '#e1e5e9'}
          />
        </div>

        <div style={{ marginBottom: 30 }}>
          <label style={{ 
            display: "block", 
            marginBottom: 8, 
            fontWeight: "bold",
            color: '#333',
            fontSize: '1.1rem'
          }}>
            📍 Token Contract Address
          </label>
          <input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Enter token contract address"
            style={{ 
              width: "100%", 
              padding: 15, 
              border: "2px solid #e1e5e9", 
              borderRadius: 10,
              fontFamily: 'monospace',
              fontSize: 14,
              transition: 'border-color 0.3s'
            }}
            onFocus={(e) => e.target.style.borderColor = '#667eea'}
            onBlur={(e) => e.target.style.borderColor = '#e1e5e9'}
          />
        </div>

        <div style={{ 
          marginBottom: 30, 
          display: 'flex', 
          gap: 15, 
          flexWrap: 'wrap',
          justifyContent: 'center'
        }}>
          <button 
            onClick={startBot} 
            disabled={isLoading}
            style={{ 
              padding: "15px 30px", 
              backgroundColor: status === "Running" ? "#28a745" : "#0070f3",
              color: "white",
              border: "none",
              borderRadius: 10,
              cursor: isLoading ? "not-allowed" : "pointer",
              fontSize: 16,
              fontWeight: 'bold',
              flex: 1,
              minWidth: 140,
              transition: 'all 0.3s',
              opacity: isLoading ? 0.7 : 1
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            {isLoading ? "⏳ Processing..." : status === "Running" ? "🔄 Restart Bot" : "🚀 Start Bot"}
          </button>
          
          <button 
            onClick={tickBot} 
            disabled={isLoading}
            style={{ 
              padding: "15px 30px", 
              backgroundColor: "#6c757d",
              color: "white",
              border: "none",
              borderRadius: 10,
              cursor: isLoading ? "not-allowed" : "pointer",
              fontSize: 16,
              fontWeight: 'bold',
              flex: 1,
              minWidth: 140,
              transition: 'all 0.3s',
              opacity: isLoading ? 0.7 : 1
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            {isLoading ? "⏳ Loading..." : "📊 Get Quote"}
          </button>
          
          <button 
            onClick={stopBot} 
            disabled={isLoading || status === "Stopped"}
            style={{ 
              padding: "15px 30px",
              backgroundColor: status === "Stopped" ? "#6c757d" : "#dc3545",
              color: "white",
              border: "none",
              borderRadius: 10,
              cursor: (isLoading || status === "Stopped") ? "not-allowed" : "pointer",
              fontSize: 16,
              fontWeight: 'bold',
              flex: 1,
              minWidth: 140,
              transition: 'all 0.3s',
              opacity: (isLoading || status === "Stopped") ? 0.7 : 1
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            {isLoading ? "⏳ Stopping..." : "🛑 Stop Bot"}
          </button>
        </div>

        <div style={{ 
          padding: 20, 
          backgroundColor: status === "Running" ? 
            "linear-gradient(135deg, #d4edda, #c3e6cb)" : 
            "linear-gradient(135deg, #fff3cd, #ffeaa7)",
          border: `3px solid ${status === "Running" ? "#28a745" : "#ffc107"}`,
          borderRadius: 12,
          marginBottom: 25,
          textAlign: 'center'
        }}>
          <h2 style={{ 
            margin: 0, 
            color: status === "Running" ? "#155724" : "#856404",
            fontSize: '1.5rem'
          }}>
            {status === "Running" ? "✅ Bot Active" : "⏸️ Bot Stopped"}
          </h2>
          <p style={{ 
            margin: '10px 0 0 0', 
            color: status === "Running" ? "#155724" : "#856404",
            fontSize: '1.1rem'
          }}>
            Status: <strong>{status}</strong>
          </p>
        </div>

        {output && (
          <div style={{ 
            padding: 20, 
            backgroundColor: output.status === "error" ? 
              "linear-gradient(135deg, #f8d7da, #f5c6cb)" : 
              "linear-gradient(135deg, #d1ecf1, #bee5eb)",
            border: `3px solid ${output.status === "error" ? "#dc3545" : "#17a2b8"}`,
            borderRadius: 12
          }}>
            <h3 style={{ 
              marginBottom: 15, 
              color: output.status === "error" ? "#721c24" : "#0c5460",
              fontSize: '1.3rem'
            }}>
              {output.status === "error" ? "❌ Error" : "📈 Trading Data"}
            </h3>
            <pre style={{ 
              whiteSpace: "pre-wrap", 
              wordBreak: "break-word",
              fontSize: 14,
              backgroundColor: "rgba(255,255,255,0.9)",
              padding: 15,
              borderRadius: 8,
              border: "1px solid rgba(0,0,0,0.1)",
              maxHeight: 300,
              overflow: 'auto',
              fontFamily: 'monospace'
            }}>
              {JSON.stringify(output, null, 2)}
            </pre>
          </div>
        )}

        <div style={{ 
          marginTop: 25, 
          padding: 20, 
          backgroundColor: "linear-gradient(135deg, #d4edda, #c3e6cb)",
          border: "3px solid #28a745",
          borderRadius: 12,
          textAlign: 'center'
        }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#155724' }}>💡 How It Works</h4>
          <p style={{ margin: 0, color: '#155724', fontSize: '0.9rem' }}>
            This is a <strong>client-side demo</strong> that simulates trading. 
            No server API calls are made - everything runs in your browser for maximum reliability.
          </p>
        </div>
      </div>
    </main>
  );
            }
