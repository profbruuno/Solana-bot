import { useState } from "react";

export default function Home() {
  const [key, setKey] = useState("");
  const [capital, setCapital] = useState("500");
  const [address, setAddress] = useState("");
  const [status, setStatus] = useState("Stopped");
  const [output, setOutput] = useState<any>(null);

  async function startBot() {
    const res = await fetch("/api/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, capital, address }),
    });
    const data = await res.json();
    setStatus(data.status);
    setOutput(data);
  }

  async function stopBot() {
    const res = await fetch("/api/stop", { method: "POST" });
    const data = await res.json();
    setStatus(data.status);
  }

  async function tickBot() {
    const res = await fetch("/api/tick");
    const data = await res.json();
    setOutput(data);
  }

  return (
    <main style={{ padding: 20 }}>
      <h1>Solana Trading Bot</h1>
      <label>Private key / Seed phrase</label>
      <textarea value={key} onChange={(e) => setKey(e.target.value)} />
      <label>Capital (USDC)</label>
      <input
        type="number"
        value={capital}
        onChange={(e) => setCapital(e.target.value)}
      />
      <label>Contract address</label>
      <input
        value={address}
        onChange={(e) => setAddress(e.target.value)}
      />
      <div style={{ marginTop: 10 }}>
        <button onClick={startBot}>Start</button>
        <button onClick={tickBot}>Tick</button>
        <button onClick={stopBot}>Stop</button>
      </div>
      <h2>Status: {status}</h2>
      <pre>{output && JSON.stringify(output, null, 2)}</pre>
    </main>
  );
}
