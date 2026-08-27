import { useState } from "react";
import Disclaimer from "./components/Disclaimer";
import MajorsView from "./components/MajorsView";
import TrendingView from "./components/TrendingView";

type Tab = "majors" | "trending";

export default function App() {
  const [tab, setTab] = useState<Tab>("majors");

  return (
    <div className="app">
      <header className="app-header">
        <div>
          <h1>Crypto Setup Scanner</h1>
          <p className="subtitle">
            {tab === "majors"
              ? "Confluence-based technical signals with defined risk-to-reward. Data from Binance public market data."
              : "Live Solana token discovery with computed risk flags. Not a trade signal."}
          </p>
        </div>
        <div className="tab-select">
          <button className={tab === "majors" ? "active" : ""} onClick={() => setTab("majors")}>
            Majors
          </button>
          <button className={tab === "trending" ? "active" : ""} onClick={() => setTab("trending")}>
            🔥 Trending (Solana)
          </button>
        </div>
      </header>

      <Disclaimer />

      {tab === "majors" ? <MajorsView /> : <TrendingView />}
    </div>
  );
}
