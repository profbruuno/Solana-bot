import { useState } from "react";

export default function Home() {
  const [key, setKey] = useState("");
  const [capital, setCapital] = useState("500");
  const [address, setAddress] = useState("");
  const [status, setStatus] = useState("Stopped");
  const [output, setOutput] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function startBot() {
    setIsLoading(true);
    try {
      const res = await fetch("/api/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, capital, address }),
      });
      const data = await res.json();
      setStatus(data.botStatus || data.status); // Updated to handle new property name
      setOutput(data);
    } catch (error) {
      setOutput({ status: "error", message: "Failed to start bot" });
    } finally {
      setIsLoading(false);
    }
  }

  async function stopBot() {
    setIsLoading(true);
    try {
      const res = await fetch("/api/stop", { method: "POST" });
      const data = await res.json();
      setStatus(data.botStatus || data.status); // Updated to handle new property name
      setOutput(data);
    } catch (error) {
      setOutput({ status: "error", message: "Failed to stop bot" });
    } finally {
      setIsLoading(false);
    }
  }

  async function tickBot() {
    setIsLoading(true);
    try {
      const res = await fetch("/api/tick");
      const data = await res.json();
      setStatus(data.botStatus || data.status); // Updated to handle new property name
      setOutput(data);
    } catch (error) {
      setOutput({ status: "error", message: "Failed to get tick data" });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main style={{ padding: 20, maxWidth: 800, margin: "0 auto" }}>
      <h1>Solana Trading Bot</h1>
      
      <div style={{ marginBottom: 15 }}>
        <label style={{ display: "block", marginBottom: 5, fontWeight: "bold" }}>
          Private key / Seed phrase
        </label>
        <textarea 
          value={key} 
          onChange={(e) => setKey(e.target.value)}
          placeholder="Enter your private key or seed phrase"
          style={{ 
            width: "100%", 
            padding: 10, 
            border: "1px solid #ddd", 
            borderRadius: 4,
            minHeight: 80 
          }}
        />
      </div>

      <div style={{ marginBottom: 15 }}>
        <label style={{ display: "block", marginBottom: 5, fontWeight: "bold" }}>
          Capital (USDC)
        </label>
        <input
          type="number"
          value={capital}
          onChange={(e) => setCapital(e.target.value)}
          style={{ 
            width: "100%", 
            padding: 10, 
            border: "1px solid #ddd", 
            borderRadius: 4 
          }}
        />
      </div>

      <div style={{ marginBottom: 20 }}>
        <label style={{ display: "block", marginBottom: 5, fontWeight: "bold" }}>
          Token Contract Address
        </label>
        <input
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Enter token contract address"
          style={{ 
            width: "100%", 
            padding: 10, 
            border: "1px solid #ddd", 
            borderRadius: 4 
          }}
        />
      </div>

      <div style={{ marginBottom: 20 }}>
        <button 
          onClick={startBot} 
          disabled={isLoading}
          style={{ 
            padding: "10px 20px", 
            marginRight: 10, 
            backgroundColor: "#0070f3",
            color: "white",
            border: "none",
            borderRadius: 4,
            cursor: isLoading ? "not-allowed" : "pointer"
          }}
        >
          {isLoading ? "Starting..." : "Start Bot"}
        </button>
        <button 
          onClick={tickBot} 
          disabled={isLoading}
          style={{ 
            padding: "10px 20px", 
            marginRight: 10,
            backgroundColor: "#666",
            color: "white",
            border: "none",
            borderRadius: 4,
            cursor: isLoading ? "not-allowed" : "pointer"
          }}
        >
          Get Quote
        </button>
        <button 
          onClick={stopBot} 
          disabled={isLoading}
          style={{ 
            padding: "10px 20px",
            backgroundColor: "#ff4444",
            color: "white",
            border: "none",
            borderRadius: 4,
            cursor: isLoading ? "not-allowed" : "pointer"
          }}
        >
          Stop Bot
        </button>
      </div>

      <div style={{ 
        padding: 15, 
        backgroundColor: status === "Running" ? "#e8f5e8" : "#fff3cd",
        border: `1px solid ${status === "Running" ? "#4caf50" : "#ffc107"}`,
        borderRadius: 4,
        marginBottom: 20
      }}>
        <h2>Status: {status}</h2>
      </div>

      {output && (
        <div style={{ 
          padding: 15, 
          backgroundColor: "#f5f5f5", 
          border: "1px solid #ddd",
          borderRadius: 4
        }}>
          <h3>Latest Output:</h3>
          <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
            {JSON.stringify(output, null, 2)}
          </pre>
        </div>
      )}
    </main>
  );
}