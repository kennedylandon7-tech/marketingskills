import { Connection, PublicKey, VersionedTransaction } from "@solana/web3.js";
import { useCallback, useRef, useState } from "react";
import { buildSwapTransaction, DEFAULT_SLIPPAGE_BPS, getQuote, type JupiterQuote } from "../api/jupiter";
import { getPhantomProvider } from "../lib/phantomProvider";

const SOLANA_RPC_URL = "https://api.mainnet-beta.solana.com";
const LAMPORTS_PER_SOL = 1_000_000_000;
const CONFIRMATION_TIMEOUT_MS = 45_000;
const CONFIRMATION_POLL_MS = 2_000;

export type SwapPhase =
  | "idle"
  | "quoting"
  | "quoted"
  | "building"
  | "awaiting-approval"
  | "submitting"
  | "confirming"
  | "confirmed"
  | "failed"
  | "rejected";

export interface SwapState {
  phase: SwapPhase;
  quote: JupiterQuote | null;
  priceImpactPct: number | null;
  outputDecimals: number | null;
  error: string | null;
  signature: string | null;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function getMintDecimals(connection: Connection, mint: string): Promise<number> {
  try {
    const info = await connection.getParsedAccountInfo(new PublicKey(mint));
    const data = info.value?.data;
    if (data && typeof data === "object" && "parsed" in data) {
      const decimals = (data as { parsed?: { info?: { decimals?: number } } }).parsed?.info?.decimals;
      if (typeof decimals === "number") return decimals;
    }
  } catch {
    // fall through to default
  }
  return 6; // reasonable fallback for SPL tokens when lookup fails
}

/**
 * Real fund-moving flow: quote via Jupiter, confirm in our UI, then hand the
 * built transaction to Phantom's signAndSendTransaction — the user approves
 * (or rejects) in Phantom's own popup. We never touch keys or signatures
 * ourselves; Phantom does the signing.
 */
export function useSwap() {
  const [state, setState] = useState<SwapState>({
    phase: "idle",
    quote: null,
    priceImpactPct: null,
    outputDecimals: null,
    error: null,
    signature: null,
  });
  const connectionRef = useRef<Connection | null>(null);
  if (!connectionRef.current) connectionRef.current = new Connection(SOLANA_RPC_URL, "confirmed");

  const reset = useCallback(() => {
    setState({
      phase: "idle",
      quote: null,
      priceImpactPct: null,
      outputDecimals: null,
      error: null,
      signature: null,
    });
  }, []);

  const fetchQuote = useCallback(async (outputMint: string, solAmount: number) => {
    setState((s) => ({ ...s, phase: "quoting", error: null }));
    try {
      const lamports = Math.round(solAmount * LAMPORTS_PER_SOL);
      const [quote, outputDecimals] = await Promise.all([
        getQuote(outputMint, lamports, DEFAULT_SLIPPAGE_BPS),
        getMintDecimals(connectionRef.current!, outputMint),
      ]);
      const priceImpactPct = parseFloat(quote.priceImpactPct) * 100;
      setState((s) => ({ ...s, phase: "quoted", quote, priceImpactPct, outputDecimals }));
      return quote;
    } catch (err) {
      setState((s) => ({
        ...s,
        phase: "failed",
        error: err instanceof Error ? err.message : "Could not get a quote for this token",
      }));
      return null;
    }
  }, []);

  const executeSwap = useCallback(async (outputMint: string, solAmount: number) => {
    const provider = getPhantomProvider();
    if (!provider || !provider.publicKey) {
      setState((s) => ({ ...s, phase: "failed", error: "Connect Phantom first" }));
      return;
    }

    try {
      // Re-quote immediately before building so we never send a stale price.
      setState((s) => ({ ...s, phase: "building", error: null }));
      const lamports = Math.round(solAmount * LAMPORTS_PER_SOL);
      const freshQuote = await getQuote(outputMint, lamports, DEFAULT_SLIPPAGE_BPS);
      const priceImpactPct = parseFloat(freshQuote.priceImpactPct) * 100;
      setState((s) => ({ ...s, quote: freshQuote, priceImpactPct }));

      const { swapTransactionBase64 } = await buildSwapTransaction(
        freshQuote,
        provider.publicKey.toString(),
      );
      const txBytes = Uint8Array.from(atob(swapTransactionBase64), (c) => c.charCodeAt(0));
      const transaction = VersionedTransaction.deserialize(txBytes);

      setState((s) => ({ ...s, phase: "awaiting-approval" }));
      const { signature } = await provider.signAndSendTransaction(transaction);
      setState((s) => ({ ...s, phase: "submitting", signature }));

      setState((s) => ({ ...s, phase: "confirming" }));
      const connection = connectionRef.current!;
      const deadline = Date.now() + CONFIRMATION_TIMEOUT_MS;
      let confirmed = false;
      let onChainError: string | null = null;

      while (Date.now() < deadline) {
        const { value } = await connection.getSignatureStatus(signature);
        if (value?.err) {
          onChainError = typeof value.err === "string" ? value.err : JSON.stringify(value.err);
          break;
        }
        if (value?.confirmationStatus === "confirmed" || value?.confirmationStatus === "finalized") {
          confirmed = true;
          break;
        }
        await sleep(CONFIRMATION_POLL_MS);
      }

      if (onChainError) {
        setState((s) => ({ ...s, phase: "failed", error: `Transaction failed on-chain: ${onChainError}` }));
      } else if (confirmed) {
        setState((s) => ({ ...s, phase: "confirmed" }));
      } else {
        setState((s) => ({
          ...s,
          phase: "failed",
          error: "Timed out waiting for confirmation — check the signature on Solscan before retrying",
        }));
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      const rejected = /reject|denied|cancel/i.test(message);
      setState((s) => ({
        ...s,
        phase: rejected ? "rejected" : "failed",
        error: rejected ? null : message,
      }));
    }
  }, []);

  return { ...state, fetchQuote, executeSwap, reset };
}
