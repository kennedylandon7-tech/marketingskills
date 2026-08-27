import { usePhantomWallet } from "../hooks/usePhantomWallet";

function truncate(address: string) {
  return `${address.slice(0, 4)}…${address.slice(-4)}`;
}

export default function WalletConnect() {
  const { connected, connecting, publicKey, solBalance, error, hasProvider, connect, disconnect } =
    usePhantomWallet();

  if (!hasProvider) {
    return (
      <a
        className="wallet-btn wallet-btn-install"
        href="https://phantom.app/download"
        target="_blank"
        rel="noreferrer"
      >
        Install Phantom
      </a>
    );
  }

  if (connected && publicKey) {
    return (
      <div className="wallet-connected">
        <span className="wallet-address" title={publicKey}>
          {truncate(publicKey)}
        </span>
        <span className="wallet-balance">
          {solBalance !== null ? `${solBalance.toFixed(3)} SOL` : "…"}
        </span>
        <button className="wallet-btn wallet-btn-disconnect" onClick={disconnect}>
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <div className="wallet-connect">
      <button className="wallet-btn" onClick={connect} disabled={connecting}>
        {connecting ? "Connecting…" : "Connect Phantom"}
      </button>
      {error && <span className="wallet-error">{error}</span>}
    </div>
  );
}
