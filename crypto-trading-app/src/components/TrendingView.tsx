import { useCallback, useEffect, useRef, useState } from "react";
import { fetchPairsForTokens, fetchTrendingSolanaPairs } from "../api/dexscreener";
import { assessRisk } from "../lib/riskScore";
import type { TrendingToken } from "../types";
import TrendingTokenCard from "./TrendingTokenCard";
import WalletConnect from "./WalletConnect";

const DISCOVERY_MS = 60_000; // which tokens show, and their order
const PRICE_TICK_MS = 10_000; // live price refresh for the current set
const MAX_HISTORY_POINTS = 40;

export default function TrendingView() {
  const [tokens, setTokens] = useState<TrendingToken[]>([]);
  const [priceHistory, setPriceHistory] = useState<Record<string, number[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const addressesRef = useRef<string[]>([]);

  const runDiscovery = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const pairs = await fetchTrendingSolanaPairs();
      const withRisk: TrendingToken[] = pairs
        .map((pair) => ({ pair, risk: assessRisk(pair) }))
        .sort((a, b) => b.risk.momentumScore - a.risk.momentumScore)
        .slice(0, 24);

      addressesRef.current = withRisk.map((t) => t.pair.baseToken.address);
      setTokens(withRisk);
      setPriceHistory((prev) => {
        const next: Record<string, number[]> = {};
        for (const t of withRisk) {
          const addr = t.pair.baseToken.address;
          const price = parseFloat(t.pair.priceUsd ?? "0");
          next[addr] = prev[addr] ?? (Number.isFinite(price) ? [price] : []);
        }
        return next;
      });
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  const runPriceTick = useCallback(async () => {
    const addresses = addressesRef.current;
    if (addresses.length === 0) return;
    try {
      const pairs = await fetchPairsForTokens(addresses);
      const byAddress = new Map(pairs.map((p) => [p.baseToken.address, p]));

      setTokens((prev) =>
        prev.map((t) => {
          const fresh = byAddress.get(t.pair.baseToken.address);
          if (!fresh) return t;
          return { pair: fresh, risk: assessRisk(fresh) };
        }),
      );
      setPriceHistory((prev) => {
        const next = { ...prev };
        for (const [addr, pair] of byAddress) {
          const price = parseFloat(pair.priceUsd ?? "0");
          if (!Number.isFinite(price)) continue;
          const history = next[addr] ?? [];
          next[addr] = [...history, price].slice(-MAX_HISTORY_POINTS);
        }
        return next;
      });
      setLastUpdated(new Date());
    } catch {
      // A single failed live tick isn't worth surfacing an error banner for —
      // the next tick (or the next discovery refresh) will recover.
    }
  }, []);

  useEffect(() => {
    runDiscovery();
    const discoveryId = setInterval(runDiscovery, DISCOVERY_MS);
    return () => clearInterval(discoveryId);
  }, [runDiscovery]);

  useEffect(() => {
    const tickId = setInterval(runPriceTick, PRICE_TICK_MS);
    return () => clearInterval(tickId);
  }, [runPriceTick]);

  return (
    <div>
      <div className="meme-disclaimer">
        <strong>Extreme risk zone.</strong> These are brand-new or recently-promoted Solana
        tokens, discovered via DexScreener's public boost feed. Discovery ≠ endorsement — being
        listed here just means the token is active and listed, not that it's legitimate.
        The large majority of tokens like these lose most or all of their value, and many are
        outright scams (rug pulls, honeypots, wash-traded volume). There is no trade setup, buy
        signal, or automated trading here — only live market data, computed risk flags, and a
        manual link to trade elsewhere if you choose to. Never risk money you can't afford to
        lose completely, and verify contract/liquidity details yourself before doing anything.
      </div>

      <div className="view-controls">
        <WalletConnect />
        <button className="refresh-btn" onClick={runDiscovery} disabled={loading}>
          {loading ? "Scanning…" : "Rescan now"}
        </button>
        {lastUpdated && (
          <span className="live-indicator">
            <span className="live-dot" />
            live · updated {lastUpdated.toLocaleTimeString()}
          </span>
        )}
      </div>

      {error && <div className="coin-card-error">Failed to load trending tokens: {error}</div>}

      <div className="grid">
        {tokens.map((t) => (
          <TrendingTokenCard
            key={t.pair.baseToken.address}
            token={t}
            priceHistory={priceHistory[t.pair.baseToken.address] ?? []}
          />
        ))}
      </div>

      {!loading && !error && tokens.length === 0 && (
        <div className="empty-state">No trending Solana tokens found right now.</div>
      )}
    </div>
  );
}
