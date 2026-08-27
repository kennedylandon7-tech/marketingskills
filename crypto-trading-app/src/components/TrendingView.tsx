import { useCallback, useEffect, useState } from "react";
import { fetchTrendingSolanaPairs } from "../api/dexscreener";
import { assessRisk } from "../lib/riskScore";
import type { TrendingToken } from "../types";
import TrendingTokenCard from "./TrendingTokenCard";
import WalletConnect from "./WalletConnect";

const REFRESH_MS = 45_000;

export default function TrendingView() {
  const [tokens, setTokens] = useState<TrendingToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const pairs = await fetchTrendingSolanaPairs();
      const withRisk: TrendingToken[] = pairs
        .map((pair) => ({ pair, risk: assessRisk(pair) }))
        .sort((a, b) => b.risk.momentumScore - a.risk.momentumScore)
        .slice(0, 24);
      setTokens(withRisk);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const id = setInterval(load, REFRESH_MS);
    return () => clearInterval(id);
  }, [load]);

  return (
    <div>
      <div className="meme-disclaimer">
        <strong>Extreme risk zone.</strong> These are brand-new or recently-promoted Solana
        tokens, discovered via DexScreener's public boost feed. Discovery ≠ endorsement — being
        listed here just means the token is active and listed, not that it's legitimate.
        The large majority of tokens like these lose most or all of their value, and many are
        outright scams (rug pulls, honeypots, wash-traded volume). There is no trade setup or
        buy signal here — only live market data and computed risk flags. Never risk money you
        can't afford to lose completely, and verify contract/liquidity details yourself before
        doing anything.
      </div>

      <div className="view-controls">
        <WalletConnect />
        <button className="refresh-btn" onClick={load} disabled={loading}>
          {loading ? "Scanning…" : "Refresh now"}
        </button>
      </div>

      {lastUpdated && (
        <div className="last-updated">Last updated {lastUpdated.toLocaleTimeString()}</div>
      )}

      {error && <div className="coin-card-error">Failed to load trending tokens: {error}</div>}

      <div className="grid">
        {tokens.map((t) => (
          <TrendingTokenCard key={t.pair.pairAddress} token={t} />
        ))}
      </div>

      {!loading && !error && tokens.length === 0 && (
        <div className="empty-state">No trending Solana tokens found right now.</div>
      )}
    </div>
  );
}
