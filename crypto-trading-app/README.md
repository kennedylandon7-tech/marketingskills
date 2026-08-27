# Crypto Setup Scanner

A client-side dashboard with two tabs:

- **Majors** — confluence-based technical setups on major crypto pairs, with
  pre-defined, risk-managed trade plans (entry, stop-loss, three take-profit
  levels, stated risk-to-reward).
- **🔥 Trending (Solana)** — live discovery of new/active Solana tokens with
  computed risk flags (liquidity, age, float concentration, buy/sell
  pressure). No trade setup or buy signal here — this asset class doesn't
  support one honestly. Includes a read-only "Connect Phantom" wallet button.

## What this is (and isn't)

No tool can reliably predict where crypto prices will go — treat anything that
claims otherwise with suspicion.

**Majors tab:**
- Pulls live OHLCV candles for 10 major pairs from Binance's public market-data
  API (falls back to `api.binance.us` if the primary host is geo-blocked).
- Computes standard technical indicators: EMA(20/50) trend structure, MACD
  histogram momentum, RSI(14), ATR(14) for volatility, and recent swing
  highs/lows for market structure.
- Scores how many of those signals agree. A trade setup (long or short) is only
  surfaced when confluence is strong (≥60%); otherwise the card explicitly says
  **"no setup"** rather than forcing a trade.
- When a setup exists, risk is defined *before* any entry: stop-loss is placed
  using ATR and recent structure, and take-profits are computed as fixed
  multiples of that risk (R), so risk-to-reward is known upfront.
- Includes a position-size calculator: enter your account size and risk % per
  trade, and it computes how much to actually risk in dollars and units.

**Trending (Solana) tab:**
- Discovers active Solana tokens via DexScreener's public token-boosts feed
  (this is a paid-promotion list, used purely for discovery — it is **not**
  itself a quality or trending signal, and the UI says so).
- Pulls live pair data (price, liquidity, volume, age, buy/sell transaction
  counts) for each discovered token from DexScreener's public API.
- Computes a risk assessment per token: liquidity depth, pair age, FDV/liquidity
  ratio (float concentration proxy), recent buy/sell pressure, and how extreme
  the recent price move already is. The floor is always "medium risk" — nothing
  here is ever labeled safe, because brand-new/thinly-traded tokens aren't.
  A large share of tokens in this category lose most or all of their value,
  and some are outright scams.
- Sorts by a momentum score (volume relative to liquidity, weighted by price
  move) so the most "active" tokens surface first — this is about visibility,
  not a recommendation.
- **No buy/sell signal, no trade setup, no in-app trading.** This is discovery
  + risk data only. Verify contracts and liquidity yourself (e.g. on
  DexScreener, Solscan) before doing anything with real money.

**Phantom wallet connect:**
- Read-only. Requests only the public key (`connect()`), never transaction
  signing. Shows the connected address and live SOL balance (via Solana's
  public RPC). There's no "send," "swap," or "sign" anywhere in this app.

This is a decision-support and market-data tool, not a signal service and not
investment advice. It does not place any trades — it's read-only analysis.

## Running it

```bash
npm install
npm run dev
```

Then open the printed local URL. The Majors tab auto-refreshes every 60
seconds; the Trending tab every 45 seconds.

To build a static production bundle:

```bash
npm run build
npm run preview
```

## Project structure

```
src/
  api/binance.ts            Binance klines client (majors), with binance.us fallback
  api/dexscreener.ts         DexScreener client: token discovery + live pair data (trending)
  hooks/usePhantomWallet.ts   Read-only Phantom connect/disconnect + SOL balance
  lib/indicators.ts           EMA, RSI, MACD, ATR, swing high/low helpers (majors)
  lib/signals.ts               Confluence scoring + trade setup (majors)
  lib/riskScore.ts              Risk flags + level for trending tokens (no buy/sell signal)
  components/
    MajorsView.tsx               Majors tab: coin grid, timeframe switch, polling
    TrendingView.tsx             Trending tab: token grid, wallet connect, polling
    CoinCard.tsx / Chart.tsx / RiskCalculator.tsx   Majors tab components
    TrendingTokenCard.tsx        Per-token risk card
    WalletConnect.tsx            Phantom connect/disconnect UI
    Disclaimer.tsx
  App.tsx                        Tab shell (Majors / Trending)
```

## Extending it

- Add more majors pairs by editing `DEFAULT_COINS` in `src/api/binance.ts`.
- Tune majors signal strictness in `src/lib/signals.ts`.
- Tune trending risk thresholds/weights in `src/lib/riskScore.ts`.
- DexScreener's public API has no organic "trending" endpoint without a paid
  key — the boosts feed is a reasonable free proxy for "active token pool,"
  but if you get API access to something better (Birdeye, etc.), swap it in
  `src/api/dexscreener.ts`.
- This intentionally does not execute trades or request transaction signing
  anywhere. If you want in-app swaps, that's a separate, carefully reviewed
  addition — it moves this from an analysis tool to something that can lose
  real money on a bug or a malicious RPC response.
