import type { TrendingToken } from "../types";

function fmtUsd(n: number | null | undefined) {
  if (n === null || n === undefined) return "—";
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n.toFixed(2)}`;
}

function fmtPrice(priceUsd: string | null) {
  if (!priceUsd) return "—";
  const n = parseFloat(priceUsd);
  if (n >= 1) return `$${n.toFixed(4)}`;
  return `$${n.toPrecision(3)}`;
}

function fmtPct(n: number | undefined) {
  if (n === undefined) return "—";
  const sign = n > 0 ? "+" : "";
  return `${sign}${n.toFixed(1)}%`;
}

function fmtAge(createdAt: number | null) {
  if (!createdAt) return "unknown";
  const hours = (Date.now() - createdAt) / (1000 * 60 * 60);
  if (hours < 1) return `${Math.round(hours * 60)}m`;
  if (hours < 24) return `${hours.toFixed(1)}h`;
  return `${Math.round(hours / 24)}d`;
}

export default function TrendingTokenCard({ token }: { token: TrendingToken }) {
  const { pair, risk } = token;
  const h1Change = pair.priceChange?.h1;

  return (
    <div className={`token-card risk-${risk.level}`}>
      <div className="token-card-header">
        <div>
          <h3>{pair.baseToken.symbol}</h3>
          <span className="token-name">{pair.baseToken.name}</span>
        </div>
        <span className={`risk-badge risk-badge-${risk.level}`}>{risk.level} risk</span>
      </div>

      <div className="token-stats-grid">
        <div>
          <span className="k">Price</span>
          <span className="v">{fmtPrice(pair.priceUsd)}</span>
        </div>
        <div>
          <span className="k">1h change</span>
          <span className={`v ${h1Change && h1Change >= 0 ? "v-tp" : "v-stop"}`}>{fmtPct(h1Change)}</span>
        </div>
        <div>
          <span className="k">Liquidity</span>
          <span className="v">{fmtUsd(pair.liquidity?.usd)}</span>
        </div>
        <div>
          <span className="k">Vol (1h)</span>
          <span className="v">{fmtUsd(pair.volume?.h1)}</span>
        </div>
        <div>
          <span className="k">FDV</span>
          <span className="v">{fmtUsd(pair.fdv ?? pair.marketCap)}</span>
        </div>
        <div>
          <span className="k">Age</span>
          <span className="v">{fmtAge(pair.pairCreatedAt)}</span>
        </div>
      </div>

      <ul className="risk-flags">
        {risk.flags.map((f, i) => (
          <li key={i}>{f}</li>
        ))}
      </ul>

      <a className="token-link" href={pair.url} target="_blank" rel="noreferrer">
        View on DexScreener →
      </a>
    </div>
  );
}
