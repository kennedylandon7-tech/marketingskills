# Runner Scanner

A live discovery dashboard for new/active Solana tokens, for daily coin
sniping — real-time-moving price sparklines, computed risk flags, and
one-tap buying through your own connected Phantom wallet.

## ⚠️ This app can move real funds

Once you connect Phantom, tapping a preset buy amount builds a real Solana
swap and asks **your own Phantom wallet** to approve it. Nothing is signed or
sent without you explicitly approving the popup Phantom shows you — this app
never has your keys and never signs anything itself — but once you approve,
it is a real, irreversible on-chain transaction using real SOL. Test with the
smallest preset (0.1 SOL) on a token you've verified yourself before trusting
this further, and read "How buying actually works" below before you use it.

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
- **No buy/sell signal, no trade setup, no auto-copy-trading from other
  wallets.** The app never decides for you — it shows real data and, if you
  choose to act, executes exactly the trade you asked for.

**Why no whale-copy-trading:** attributing on-chain transactions to a specific
"whale" wallet reliably needs a paid indexer (the free public data available
here isn't good enough to trust), and getting that attribution wrong — showing
a false "whale just bought" signal — is worse than not having the feature. The
buy/sell pressure bar on each card is real data straight from DexScreener, not
an inference, which is why that's what's shown instead.

## How buying actually works

1. You tap a preset amount (0.1 / 0.5 / 1 SOL). The app fetches a live quote
   from Jupiter (Solana's swap-routing aggregator — the same routing engine
   most Solana trading apps use under the hood) and shows you: expected
   tokens received, price impact, and minimum received after slippage.
2. You review that and tap **Confirm in Phantom**. The app re-quotes (so you
   never trade on a stale price), builds the swap transaction, and hands it
   to Phantom.
3. **Phantom shows its own approval popup** — this app never sees your keys
   and cannot bypass this step. You approve or reject there.
4. If approved, the app polls Solana for confirmation and shows you the
   result: bought, failed on-chain (e.g. slippage exceeded), or timed out.

Guardrails built in:
- Preset amounts only (no free-text input) to avoid fat-finger errors.
- 5% max slippage, shown before you confirm — meme-coin liquidity is thin and
  moves fast, so this is deliberately not razor-tight, but it's never hidden.
- Price-impact warnings: colored amber above 5%, red above 15%, with an
  explicit "this may cost you a lot more than expected" note at the high end.
  It never blocks the trade outright — it's your money — but it won't let you
  miss the warning.
- A balance check against the preset amount + a small fee buffer before
  allowing the trade.
- Buttons disable while a transaction is in flight, so you can't double-submit.

**What I could not test in this build:** an actual mainnet swap end-to-end.
This was built and verified with mocked responses (the UI state machine,
transaction deserialization, and confirmation polling all work correctly
against realistic fake data), but I don't have a funded wallet or live
mainnet access to execute a real trade and watch it settle. Please treat your
first few trades as the real test, starting with the smallest preset, and
open an issue / let me know if anything about the flow looks wrong before you
trust it with meaningful amounts.

**Phantom wallet connect:** requests only the public key on connect, and
signing only ever happens through Phantom's own popup when you explicitly
buy. This app never requests your seed phrase or private key, and has no
other transaction type wired up (no sells, no arbitrary transfers) — buying
via the preset flow is the only thing it can ask Phantom to sign.

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
  api/jupiter.ts                Jupiter quote + swap-transaction-build client
  hooks/usePhantomWallet.ts    Read-only wallet connect state + SOL balance
  hooks/useSwap.ts              Buy flow state machine: quote -> confirm -> sign -> poll
  lib/riskScore.ts              Risk flags + level per token (no buy/sell signal)
  lib/phantomProvider.ts        Shared Phantom provider detection/typing
  components/
    TrendingView.tsx              Two-tier polling: 60s discovery, 10s live price ticks
    TrendingTokenCard.tsx         Per-token card: sparkline, pressure bar, risk flags, QuickBuy
    QuickBuy.tsx                   Preset buttons, confirm panel, live buy status
    Sparkline.tsx                 Dependency-free live-updating SVG chart
    WalletConnect.tsx             Phantom connect/disconnect + balance display
  App.tsx                         Header + TrendingView
```

## Extending it

- Tune risk thresholds/weights in `src/lib/riskScore.ts`.
- Tune poll cadence (`DISCOVERY_MS`, `PRICE_TICK_MS`) in `TrendingView.tsx`.
- Tune slippage/preset amounts in `src/api/jupiter.ts` and `QuickBuy.tsx`.
- DexScreener's public API has no organic "trending" endpoint without a paid
  key — the boosts feed is a reasonable free proxy for "active token pool."
  If you get access to a paid indexer (Birdeye, Helius, etc.), that's also
  where reliable whale-wallet attribution would become feasible.
- Selling isn't wired up — this only builds SOL→token swaps. Adding the
  reverse (token→SOL) is a reasonable next step and reuses the same
  `useSwap` hook and Jupiter client; treat it with the same care as buying.
