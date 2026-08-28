import { useCallback, useEffect, useState } from "react";
import { getPhantomProvider, type PhantomPublicKey } from "../lib/phantomProvider";
import type { WalletState } from "../types";

// Public Solana RPC — fine for occasional balance lookups from a small app,
// but it's shared/rate-limited infrastructure, not meant for heavy traffic.
const SOLANA_RPC_URL = "https://api.mainnet-beta.solana.com";

async function fetchSolBalance(publicKey: string): Promise<number> {
  const res = await fetch(SOLANA_RPC_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "getBalance",
      params: [publicKey, { commitment: "confirmed" }],
    }),
  });
  if (!res.ok) throw new Error(`Solana RPC error ${res.status}`);
  const data = (await res.json()) as { result?: { value: number }; error?: { message: string } };
  if (data.error) throw new Error(data.error.message);
  const lamports = data.result?.value ?? 0;
  return lamports / 1_000_000_000;
}

/** Read-only Phantom connection: public key + SOL balance only. Never requests transaction signing. */
export function usePhantomWallet() {
  const [state, setState] = useState<WalletState>({
    connected: false,
    connecting: false,
    publicKey: null,
    solBalance: null,
    error: null,
    hasProvider: false,
  });

  useEffect(() => {
    const provider = getPhantomProvider();
    setState((s) => ({ ...s, hasProvider: !!provider }));
    if (!provider) return;

    const handleAccountChanged = (...args: unknown[]) => {
      const pk = args[0] as PhantomPublicKey | null;
      if (pk) {
        setState((s) => ({ ...s, connected: true, publicKey: pk.toString() }));
      } else {
        setState((s) => ({ ...s, connected: false, publicKey: null, solBalance: null }));
      }
    };
    const handleDisconnect = () => {
      setState((s) => ({ ...s, connected: false, publicKey: null, solBalance: null }));
    };

    provider.on("accountChanged", handleAccountChanged);
    provider.on("disconnect", handleDisconnect);

    // Reconnect silently if the site was previously trusted.
    provider.connect({ onlyIfTrusted: true }).then(
      ({ publicKey }) => setState((s) => ({ ...s, connected: true, publicKey: publicKey.toString() })),
      () => {}, // not previously trusted — user must click Connect
    );

    return () => {
      provider.removeListener("accountChanged", handleAccountChanged);
      provider.removeListener("disconnect", handleDisconnect);
    };
  }, []);

  useEffect(() => {
    if (!state.connected || !state.publicKey) return;
    let cancelled = false;
    fetchSolBalance(state.publicKey)
      .then((bal) => {
        if (!cancelled) setState((s) => ({ ...s, solBalance: bal }));
      })
      .catch((err) => {
        if (!cancelled) setState((s) => ({ ...s, error: err instanceof Error ? err.message : String(err) }));
      });
    return () => {
      cancelled = true;
    };
  }, [state.connected, state.publicKey]);

  const connect = useCallback(async () => {
    const provider = getPhantomProvider();
    if (!provider) {
      setState((s) => ({ ...s, error: "Phantom wallet not found" }));
      return;
    }
    setState((s) => ({ ...s, connecting: true, error: null }));
    try {
      const { publicKey } = await provider.connect();
      setState((s) => ({ ...s, connecting: false, connected: true, publicKey: publicKey.toString() }));
    } catch (err) {
      setState((s) => ({
        ...s,
        connecting: false,
        error: err instanceof Error ? err.message : "Connection rejected",
      }));
    }
  }, []);

  const disconnect = useCallback(async () => {
    const provider = getPhantomProvider();
    if (!provider) return;
    await provider.disconnect();
    setState((s) => ({ ...s, connected: false, publicKey: null, solBalance: null }));
  }, []);

  return { ...state, connect, disconnect };
}
