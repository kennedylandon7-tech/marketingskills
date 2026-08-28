# Runner Scanner

A live discovery dashboard for new/active Solana tokens — for daily coin
sniping. Real-time-moving price sparklines, computed risk flags, and a
one-click manual trade link. No trade signals, no automated trading.

## What this is (and isn't)

No tool can reliably predict where a meme coin will go — treat anything that
claims otherwise with suspicion.

- Discovers active Solana tokens via DexScreener's public token-boosts feed
  (a paid-promotion list, used purely for discovery — it is **not** itself a
  quality or trending signal, and the UI says so).
- Pulls live pair data every ~10 seconds (price, liquidity, volume, age,
  buy/sell transaction counts) for each discovered token, so the sparkline on
  each card genuinely moves in near-real time. Which tokens are shown re-sorts
  every ~60 seconds (a separate, slower discovery pass) so the grid doesn't
  reshuffle on every price tick.
- Computes a risk assessment per token: liquidity depth, pair age, FDV/liquidity
  ratio (float concentration proxy), recent buy/sell pressure, and how extreme
  the recent price move already is. The floor is always "medium risk" — nothing
  here is ever labeled safe, because brand-new/thinly-traded tokens aren't. A
  large share of tokens in this category lose most or all of their value, and
  some are outright scams.
- Sorts by a momentum score (volume relative to liquidity, weighted by price
  move) so the most "active" tokens surface first — this is about visibility,
  not a recommendation.
- **No buy/sell signal, no trade setup, no in-app trading, no auto-copy-trading
  from other wallets.** A "Trade on Jupiter" button on each card deep-links to
  Jupiter's swap UI for that token, for a fast *manual* path if you choose to
  act — the app itself never executes or signs anything.

**Why no whale-copy-trading:** attributing on-chain transactions to a specific
"whale" wallet reliably needs a paid indexer (the free public data available
here isn't good enough to trust), and getting that attribution wrong — showing
a false "whale just bought" signal — is worse than not having the feature. The
buy/sell pressure bar on each card is real data straight from DexScreener, not
an inference, which is why that's what's shown instead.

**Phantom wallet connect:** read-only. Requests only the public key
(`connect()`), never transaction signing. Shows the connected address and live
SOL balance (via Solana's public RPC). There's no "send," "swap," or "sign"
anywhere in this app.

This is a market-data and risk-visibility tool, not a signal service and not
investment advice.

## Running it

```bash
npm install
npm run dev
```

Then open the printed local URL.

To build a static production bundle:

```bash
npm run build
npm run preview
```

## Project structure

```
src/
  api/dexscreener.ts          Token discovery (boosts feed) + live pair data
  hooks/usePhantomWallet.ts    Read-only Phantom connect/disconnect + SOL balance
  lib/riskScore.ts              Risk flags + level per token (no buy/sell signal)
  components/
    TrendingView.tsx              Two-tier polling: 60s discovery, 10s live price ticks
    TrendingTokenCard.tsx         Per-token card: sparkline, pressure bar, risk flags, trade link
    Sparkline.tsx                 Dependency-free live-updating SVG chart
    WalletConnect.tsx             Phantom connect/disconnect UI
  App.tsx                         Header + TrendingView
```

## Extending it

- Tune risk thresholds/weights in `src/lib/riskScore.ts`.
- Tune poll cadence (`DISCOVERY_MS`, `PRICE_TICK_MS`) in `TrendingView.tsx`.
- DexScreener's public API has no organic "trending" endpoint without a paid
  key — the boosts feed is a reasonable free proxy for "active token pool."
  If you get access to a paid indexer (Birdeye, Helius, etc.), that's also
  where reliable whale-wallet attribution would become feasible.
- This intentionally does not execute trades or request transaction signing
  anywhere. If you want in-app swaps, that's a separate, carefully reviewed
  addition — it moves this from a discovery tool to something that can lose
  real money on a bug or a malicious RPC response.
