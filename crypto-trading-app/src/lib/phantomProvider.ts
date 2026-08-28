export interface PhantomPublicKey {
  toString(): string;
}

export interface PhantomSignAndSendResult {
  signature: string;
}

export interface PhantomProvider {
  isPhantom?: boolean;
  publicKey: PhantomPublicKey | null;
  connect: (opts?: { onlyIfTrusted?: boolean }) => Promise<{ publicKey: PhantomPublicKey }>;
  disconnect: () => Promise<void>;
  on: (event: string, handler: (...args: unknown[]) => void) => void;
  removeListener: (event: string, handler: (...args: unknown[]) => void) => void;
  // Accepts a @solana/web3.js VersionedTransaction. Typed loosely here to
  // avoid coupling this shared module to the web3.js import graph.
  signAndSendTransaction: (transaction: unknown) => Promise<PhantomSignAndSendResult>;
}

export function getPhantomProvider(): PhantomProvider | null {
  const w = window as unknown as { phantom?: { solana?: PhantomProvider }; solana?: PhantomProvider };
  if (w.phantom?.solana?.isPhantom) return w.phantom.solana;
  if (w.solana?.isPhantom) return w.solana;
  return null;
}
