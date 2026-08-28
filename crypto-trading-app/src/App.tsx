import TrendingView from "./components/TrendingView";

export default function App() {
  return (
    <div className="app">
      <header className="app-header">
        <div className="brand">
          <span className="brand-mark">🔥</span>
          <div>
            <h1>Runner Scanner</h1>
            <p className="subtitle">Live Solana token discovery for daily coin sniping. Not a trade signal.</p>
          </div>
        </div>
      </header>

      <TrendingView />
    </div>
  );
}
