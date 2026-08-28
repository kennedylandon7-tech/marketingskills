interface Props {
  prices: number[];
  width?: number;
  height?: number;
}

/** Dependency-free live-updating sparkline. Redraws smoothly as `prices` grows. */
export default function Sparkline({ prices, width = 320, height = 64 }: Props) {
  if (prices.length < 2) {
    return <div className="sparkline-placeholder" style={{ width, height }} />;
  }

  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const range = max - min || max * 0.01 || 1;
  const padY = height * 0.12;
  const usableH = height - padY * 2;

  const points = prices.map((p, i) => {
    const x = (i / (prices.length - 1)) * width;
    const y = padY + usableH - ((p - min) / range) * usableH;
    return [x, y];
  });

  const linePath = points.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`).join(" ");
  const areaPath = `${linePath} L${width},${height} L0,${height} Z`;

  const up = prices[prices.length - 1] >= prices[0];
  const stroke = up ? "#22c55e" : "#ef4444";
  const gradientId = up ? "sparkline-up" : "sparkline-down";
  const lastPoint = points[points.length - 1];

  return (
    <svg className="sparkline" width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
      <defs>
        <linearGradient id="sparkline-up" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#22c55e" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="sparkline-down" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ef4444" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#${gradientId})`} stroke="none" />
      <path d={linePath} fill="none" stroke={stroke} strokeWidth={1.75} strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={lastPoint[0]} cy={lastPoint[1]} r={2.5} fill={stroke} className="sparkline-dot" />
    </svg>
  );
}
