import type { DexPair } from "../types";

// DexScreener's free public API — no key required, documented at
// https://docs.dexscreener.com/api/reference
const BOOSTS_LATEST_URL = "https://api.dexscreener.com/token-boosts/latest/v1";
const TOKENS_URL = "https://api.dexscreener.com/latest/dex/tokens";

interface BoostedToken {
  chainId: string;
  tokenAddress: string;
}

/**
 * Discovery only: recently-boosted (paid-promotion) Solana tokens. This is
 * NOT an organic trending signal — it just gives us a pool of active,
 * currently-listed tokens to pull real market data for. The actual
 * momentum/risk numbers shown to the user come from live pair data below,
 * not from the fact that a token was boosted.
 */
async function fetchBoostedSolanaTokenAddresses(limit = 30): Promise<string[]> {
  const res = await fetch(BOOSTS_LATEST_URL);
  if (!res.ok) throw new Error(`DexScreener boosts API error ${res.status}`);
  const raw = (await res.json()) as BoostedToken[];
  const solanaAddresses = raw
    .filter((t) => t.chainId === "solana")
    .map((t) => t.tokenAddress);
  return Array.from(new Set(solanaAddresses)).slice(0, limit);
}

/** Fetch live pair data (price, volume, liquidity, age, txns) for a batch of token addresses. */
export async function fetchPairsForTokens(addresses: string[]): Promise<DexPair[]> {
  if (addresses.length === 0) return [];
  // DexScreener accepts up to 30 comma-separated addresses per call.
  const url = `${TOKENS_URL}/${addresses.join(",")}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`DexScreener tokens API error ${res.status}`);
  const data = (await res.json()) as { pairs: DexPair[] | null };
  return data.pairs ?? [];
}

/**
 * For each token, keep only its highest-liquidity Solana pair (a token can
 * have multiple pools; the deepest one is the most representative price).
 */
function dedupeByToken(pairs: DexPair[]): DexPair[] {
  const best = new Map<string, DexPair>();
  for (const pair of pairs) {
    if (pair.chainId !== "solana") continue;
    const key = pair.baseToken.address;
    const existing = best.get(key);
    const liq = pair.liquidity?.usd ?? 0;
    const existingLiq = existing?.liquidity?.usd ?? -1;
    if (!existing || liq > existingLiq) best.set(key, pair);
  }
  return Array.from(best.values());
}

export async function fetchTrendingSolanaPairs(): Promise<DexPair[]> {
  const addresses = await fetchBoostedSolanaTokenAddresses(30);
  const pairs = await fetchPairsForTokens(addresses);
  return dedupeByToken(pairs);
}
