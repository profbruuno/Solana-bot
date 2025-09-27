import { useState } from "react";

export default function Home() {
  const [key, setKey] = useState("");
  const [capital, setCapital] = useState("500");
  const [address, setAddress] = useState("");
  const [status, setStatus] = useState("Stopped");
  const [output, setOutput] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Client-side trading simulation - NO API CALLS
  const simulateTrading = async (action: 'start' | 'tick' | 'stop') => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const basePrice = 12.50;
    const variation = (Math.random() - 0.5) * 4;
    const currentPrice = (basePrice + variation).toFixed(4);
    
    switch (action) {
      case 'start':
        return {
          status: "success",
          botStatus: "Running", 
          message: "Trading bot started successfully!",
          data: {
            input: "0.01 SOL",
            output: `${currentPrice} USDC`,
            capital: Number(capital),
            address: address,
            timestamp: new Date().toISOString()
          }
        };
      
      case 'tick':
        if (status === "Running") {
          return {
            status: "success",
            botStatus: "Running",
            message: "Current market data",
            data: {
              input: "0.01 SOL",
              output: `${currentPrice} USDC`,
              price: parseFloat(currentPrice),
              capital: Number(capital),
              address: address,
              timestamp: new Date().toISOString()
            }
          };
        } else {
          return {
            status: "success",
            botStatus: "Stopped",
            message: "Bot is stopped. Start the bot first.",
            data: null
          };
        }
      
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
      if (!key.trim() || !capital.trim() || !address.trim()) {
        throw new Error("Please fill in all fields");
      }

      const data = await simulateTrading('start');
      setStatus(data.botStatus);
      setOutput(data);
      
    } catch (error: any) {
      setOutput({ 
        status: "error", 
        message: error.message
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function stopBot() {
    setIsLoading(true);
    
    try {
      const data = await simulateTrading('stop');
      setStatus(data.botStatus);
      setOutput(data);
      
    } catch (error: any) {
      setOutput({ 
        status: "error", 
        message: error.message
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function tickBot() {
    setIsLoading(true);
    
    try {
      const data = await simulateTrading('tick');
      setOutput(data);
      
    } catch (error: any) {
      setOutput({ 
        status: "error", 
        message: error.message
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main style={{ 
      padding: 20, 
      maxWidth: 800, 
      margin: "0 auto", 
      fontFamily: 'Arial, sans-serif',
      minHeight: '100vh'
    }}>
      <div style={{ 
        background: 'white', 
        padding: 30, 
        borderRadius: 15, 
        boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
        marginTop: 20
      }}>
        <h1 style={{ 
          color: '#333', 
          textAlign: 'center', 
          marginBottom: 10
        }}>
          Solana Trading Bot
        </h1>
        
        <p style={{ 
          color: '#666', 
          textAlign: 'center', 
          marginBottom: 30
        }}>
          Client-Side Demo - No Server Required
        </p>

        <div style={{ marginBottom: 20 }}>
          <label style={{ display: "block", marginBottom: 8, fontWeight: "bold" }}>
            Private Key / Seed Phrase
          </label>
          <textarea 
            value={key} 
            onChange={(e) => setKey(e.target.value)}
            placeholder="Enter any text (demo only)"
            style={{ 
              width: "100%", 
              padding: 12, 
              border: "1px solid #ddd", 
              borderRadius: 5,
              minHeight: 80,
              fontSize: 14
            }}
          />
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ display: "block", marginBottom: 8, fontWeight: "bold" }}>
            Capital (USDC)
          </label>
          <input
            type="number"
            value={capital}
            onChange={(e) => setCapital(e.target.value)}
            style={{ 
              width: "100%", 
              padding: 12, 
              border: "1px solid #ddd", 
              borderRadius: 5,
              fontSize: 16
            }}
          />
        </div>

        <div style={{ marginBottom: 25 }}>
          <label style={{ display: "block", marginBottom: 8, fontWeight: "bold" }}>
            Token Contract Address
          </label>
          <input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Enter any contract address"
            style={{ 
              width: "100%", 
              padding: 12, 
              border: "1px solid #ddd", 
              borderRadius: 5,
              fontSize: 14
            }}
          />
        </div>

        <div style={{ marginBottom: 25, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button 
            onClick={startBot} 
            disabled={isLoading}
            style={{ 
              padding: "12px 20px", 
              backgroundColor: "#0070f3",
              color: "white",
              border: "none",
              borderRadius: 5,
              cursor: "pointer",
              fontSize: 16,
              flex: 1,
              minWidth: 120
            }}
          >
            {isLoading ? "Loading..." : "Start Bot"}
          </button>
          <button 
            onClick={tickBot} 
            disabled={isLoading}
            style={{ 
              padding: "12px 20px", 
              backgroundColor: "#666",
              color: "white",
              border: "none",
              borderRadius: 5,
              cursor: "pointer",
              fontSize: 16,
              flex: 1,
              minWidth: 120
            }}
          >
            {isLoading ? "Loading..." : "Get Quote"}
          </button>
          <button 
            onClick={stopBot} 
            disabled={isLoading}
            style={{ 
              padding: "12px 20px",
              backgroundColor: "#ff4444",
              color: "white",
              border: "none",
              borderRadius: 5,
              cursor: "pointer",
              fontSize: 16,
              flex: 1,
              minWidth: 120
            }}
          >
            {isLoading ? "Loading..." : "Stop Bot"}
          </button>
        </div>

        <div style={{ 
          padding: 15, 
          backgroundColor: status === "Running" ? "#e8f5e8" : "#fff3cd",
          border: `1px solid ${status === "Running" ? "#4caf50" : "#ffc107"}`,
          borderRadius: 5,
          marginBottom: 20
        }}>
          <h2 style={{ margin: 0, color: status === "Running" ? "#2e7d32" : "#856404" }}>
            Status: {status}
          </h2>
        </div>

        {output && (
          <div style={{ 
            padding: 15, 
            backgroundColor: output.status === "error" ? "#ffebee" : "#f5f5f5", 
            border: `1px solid ${output.status === "error" ? "#f44336" : "#ddd"}`,
            borderRadius: 5
          }}>
            <h3 style={{ marginBottom: 10, color: output.status === "error" ? "#d32f2f" : "#333" }}>
              {output.status === "error" ? "Error" : "Output"}
            </h3>
            <pre style={{ 
              whiteSpace: "pre-wrap", 
              wordBreak: "break-word",
              fontSize: 14,
              backgroundColor: "white",
              padding: 12,
              borderRadius: 4,
              border: "1px solid #eee",
              maxHeight: 300,
              overflow: 'auto'
            }}>
              {JSON.stringify(output, null, 2)}
            </pre>
          </div>
        )}

        <div style={{ 
          marginTop: 20, 
          padding: 15, 
          backgroundColor: "#e8f5e8",
          border: "1px solid #4caf50",
          borderRadius: 5
        }}>
          <p style={{ margin: 0, color: "#155724", fontSize: '14px' }}>
            ✅ This is a client-side demo that works entirely in your browser.
          </p>
        </div>
      </div>
    </main>
  );
                }
