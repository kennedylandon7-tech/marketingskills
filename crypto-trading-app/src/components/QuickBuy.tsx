import { useState } from "react";
import type { usePhantomWallet } from "../hooks/usePhantomWallet";
import { useSwap } from "../hooks/useSwap";

const PRESET_AMOUNTS = [0.1, 0.5, 1];
const MIN_SOL_BUFFER = 0.01; // leave room for network/priority fees

type Wallet = ReturnType<typeof usePhantomWallet>;

interface Props {
  mint: string;
  symbol: string;
  wallet: Wallet;
}

function formatTokenAmount(raw: string, decimals: number) {
  const n = Number(raw) / 10 ** decimals;
  if (n >= 1000) return n.toLocaleString(undefined, { maximumFractionDigits: 2 });
  if (n >= 1) return n.toFixed(3);
  return n.toPrecision(4);
}

function impactClass(pct: number) {
  if (pct >= 15) return "impact-severe";
  if (pct >= 5) return "impact-high";
  return "impact-ok";
}

export default function QuickBuy({ mint, symbol, wallet }: Props) {
  const [pendingAmount, setPendingAmount] = useState<number | null>(null);
  const swap = useSwap();

  const canBuy = wallet.connected && wallet.hasProvider;

  const handlePreset = async (amount: number) => {
    if (!canBuy) {
      wallet.connect();
      return;
    }
    setPendingAmount(amount);
    await swap.fetchQuote(mint, amount);
  };

  const handleConfirm = async () => {
    if (pendingAmount === null) return;
    await swap.executeSwap(mint, pendingAmount);
  };

  const handleCancel = () => {
    setPendingAmount(null);
    swap.reset();
  };

  const insufficientBalance =
    pendingAmount !== null && wallet.solBalance !== null && wallet.solBalance < pendingAmount + MIN_SOL_BUFFER;

  const panelOpen = pendingAmount !== null && swap.phase !== "idle";

  return (
    <div className="quick-buy">
      {canBuy ? (
        <div className="quick-buy-presets">
          {PRESET_AMOUNTS.map((amt) => (
            <button
              key={amt}
              className="preset-btn"
              onClick={() => handlePreset(amt)}
              disabled={panelOpen && swap.phase !== "failed" && swap.phase !== "rejected"}
            >
              {amt} SOL
            </button>
          ))}
        </div>
      ) : (
        <button className="preset-btn connect-to-buy-btn" onClick={() => wallet.connect()}>
          Connect Phantom to buy
        </button>
      )}

      {panelOpen && (
        <div className="buy-confirm-panel">
          {(swap.phase === "quoting" || swap.phase === "building") && (
            <div className="buy-status">Getting a live quote…</div>
          )}

          {swap.phase === "quoted" && swap.quote && (
            <>
              <div className="buy-confirm-row">
                <span>
                  Spend <strong>{pendingAmount} SOL</strong>
                </span>
                <span>
                  Get ≈{" "}
                  <strong>
                    {formatTokenAmount(swap.quote.outAmount, swap.outputDecimals ?? 6)} {symbol}
                  </strong>
                </span>
              </div>
              <div className={`buy-impact ${impactClass(swap.priceImpactPct ?? 0)}`}>
                Price impact: {(swap.priceImpactPct ?? 0).toFixed(1)}%
                {(swap.priceImpactPct ?? 0) >= 15 && " — severe, you may get much less than expected"}
              </div>
              <div className="buy-slippage-note">Max slippage 5% · min received after slippage: {formatTokenAmount(swap.quote.otherAmountThreshold, swap.outputDecimals ?? 6)} {symbol}</div>
              {insufficientBalance && (
                <div className="buy-impact impact-severe">Insufficient SOL balance for this amount + fees</div>
              )}
              <div className="buy-confirm-actions">
                <button className="confirm-buy-btn" onClick={handleConfirm} disabled={insufficientBalance}>
                  {(swap.priceImpactPct ?? 0) >= 15 ? "Buy anyway" : "Confirm in Phantom"}
                </button>
                <button className="cancel-buy-btn" onClick={handleCancel}>
                  Cancel
                </button>
              </div>
            </>
          )}

          {swap.phase === "awaiting-approval" && (
            <div className="buy-status">Approve in the Phantom popup…</div>
          )}
          {swap.phase === "submitting" && <div className="buy-status">Sending transaction…</div>}
          {swap.phase === "confirming" && <div className="buy-status">Confirming on-chain…</div>}

          {swap.phase === "confirmed" && (
            <>
              <div className="buy-status buy-status-success">
                ✅ Bought {symbol}
                {swap.signature && (
                  <a
                    href={`https://solscan.io/tx/${swap.signature}`}
                    target="_blank"
                    rel="noreferrer"
                    className="token-link"
                  >
                    {" "}
                    view tx →
                  </a>
                )}
              </div>
              <button className="cancel-buy-btn" onClick={handleCancel}>
                Close
              </button>
            </>
          )}

          {swap.phase === "rejected" && (
            <>
              <div className="buy-status">Cancelled in Phantom.</div>
              <button className="cancel-buy-btn" onClick={handleCancel}>
                Close
              </button>
            </>
          )}

          {swap.phase === "failed" && (
            <>
              <div className="buy-status buy-status-error">{swap.error ?? "Something went wrong"}</div>
              <div className="buy-confirm-actions">
                <button className="confirm-buy-btn" onClick={() => handlePreset(pendingAmount!)}>
                  Retry
                </button>
                <button className="cancel-buy-btn" onClick={handleCancel}>
                  Close
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
