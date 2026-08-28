// Jupiter's public swap-routing API — the same aggregator basically every
// Solana trading app (terminals included) uses under the hood to find a
// route and build the transaction. We never show Jupiter's UI to the user;
// we only use it to construct a transaction that Phantom then asks the user
// to approve.
const JUPITER_BASE = "https://quote-api.jup.ag/v6";

export const SOL_MINT = "So11111111111111111111111111111111111111112";

// Meme-coin liquidity is thin and moves fast — 5% gives the swap a realistic
// chance of landing without being reckless. Surfaced to the user, not hidden.
export const DEFAULT_SLIPPAGE_BPS = 500;

export interface JupiterQuote {
  inputMint: string;
  outputMint: string;
  inAmount: string;
  outAmount: string;
  otherAmountThreshold: string;
  priceImpactPct: string;
  slippageBps: number;
  routePlan: unknown[];
}

export async function getQuote(
  outputMint: string,
  amountLamports: number,
  slippageBps = DEFAULT_SLIPPAGE_BPS,
): Promise<JupiterQuote> {
  const params = new URLSearchParams({
    inputMint: SOL_MINT,
    outputMint,
    amount: String(Math.round(amountLamports)),
    slippageBps: String(slippageBps),
    swapMode: "ExactIn",
  });
  const res = await fetch(`${JUPITER_BASE}/quote?${params.toString()}`);
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Jupiter quote failed (${res.status}): ${body || "no route found"}`);
  }
  return (await res.json()) as JupiterQuote;
}

export async function buildSwapTransaction(
  quote: JupiterQuote,
  userPublicKey: string,
): Promise<{ swapTransactionBase64: string; lastValidBlockHeight?: number }> {
  const res = await fetch(`${JUPITER_BASE}/swap`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      quoteResponse: quote,
      userPublicKey,
      wrapAndUnwrapSol: true,
      dynamicComputeUnitLimit: true,
      prioritizationFeeLamports: "auto",
    }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Jupiter swap build failed (${res.status}): ${body}`);
  }
  const data = (await res.json()) as { swapTransaction: string; lastValidBlockHeight?: number };
  return { swapTransactionBase64: data.swapTransaction, lastValidBlockHeight: data.lastValidBlockHeight };
}
