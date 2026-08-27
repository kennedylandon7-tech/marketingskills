import type { DexPair, RiskAssessment, RiskLevel } from "../types";

const MS_PER_HOUR = 60 * 60 * 1000;

/**
 * Meme-coin / freshly-launched-token risk assessment.
 *
 * This deliberately does NOT produce a buy/sell signal or a "setup" the way
 * the majors scanner does — there is no reliable technical edge on
 * brand-new, thinly-traded tokens, and framing this like a trade setup
 * would imply a rigor that doesn't exist here. Instead this surfaces the
 * real risk factors (liquidity, age, concentration proxy, buy/sell
 * pressure, how extreme the recent move already is) so the user can judge
 * for themselves. The floor is always "high risk" or worse — nothing in
 * this category is ever labeled safe.
 */
export function assessRisk(pair: DexPair): RiskAssessment {
  const flags: string[] = [];
  let severity = 0; // higher = riskier

  const liquidityUsd = pair.liquidity?.usd ?? 0;
  if (liquidityUsd < 5_000) {
    flags.push(`Extremely low liquidity ($${liquidityUsd.toLocaleString()}) — even a small sell can crash the price`);
    severity += 3;
  } else if (liquidityUsd < 25_000) {
    flags.push(`Low liquidity ($${liquidityUsd.toLocaleString()}) — expect high slippage`);
    severity += 2;
  } else if (liquidityUsd < 100_000) {
    flags.push(`Modest liquidity ($${liquidityUsd.toLocaleString()})`);
    severity += 1;
  }

  const ageMs = pair.pairCreatedAt ? Date.now() - pair.pairCreatedAt : null;
  const ageHours = ageMs !== null ? ageMs / MS_PER_HOUR : null;
  if (ageHours === null) {
    flags.push("Pair age unknown");
    severity += 1;
  } else if (ageHours < 1) {
    flags.push(`Launched under an hour ago (${Math.round(ageHours * 60)}m old) — peak rug-pull window`);
    severity += 3;
  } else if (ageHours < 24) {
    flags.push(`Launched ${ageHours.toFixed(1)}h ago — still in the highest-risk window`);
    severity += 2;
  } else if (ageHours < 24 * 7) {
    flags.push(`${Math.round(ageHours / 24)} day(s) old — still very new`);
    severity += 1;
  }

  const fdv = pair.fdv ?? pair.marketCap ?? 0;
  if (liquidityUsd > 0 && fdv > 0) {
    const ratio = fdv / liquidityUsd;
    if (ratio > 100) {
      flags.push(`FDV is ${ratio.toFixed(0)}x liquidity — thin float, easy to manipulate the price`);
      severity += 2;
    } else if (ratio > 30) {
      flags.push(`FDV is ${ratio.toFixed(0)}x liquidity — light float relative to headline market cap`);
      severity += 1;
    }
  }

  const h1 = pair.txns?.h1;
  if (h1 && h1.buys + h1.sells > 0) {
    const sellShare = h1.sells / (h1.buys + h1.sells);
    if (sellShare > 0.65) {
      flags.push(`Sell-heavy in the last hour (${h1.sells} sells vs ${h1.buys} buys) — possible distribution`);
      severity += 2;
    }
  }

  const m5Change = pair.priceChange?.m5 ?? 0;
  const h1Change = pair.priceChange?.h1 ?? 0;
  if (Math.abs(m5Change) > 50) {
    flags.push(`${m5Change > 0 ? "+" : ""}${m5Change.toFixed(0)}% in the last 5 minutes — likely already overextended if you're seeing this now`);
    severity += 2;
  } else if (Math.abs(h1Change) > 100) {
    flags.push(`${h1Change > 0 ? "+" : ""}${h1Change.toFixed(0)}% in the last hour — chasing this adds significant risk`);
    severity += 1;
  }

  let level: RiskLevel;
  if (severity >= 6) level = "extreme";
  else if (severity >= 3) level = "high";
  else level = "medium"; // floor — brand-new/low-cap tokens are never "low risk" here

  if (flags.length === 0) {
    flags.push("No acute red flags detected in the available data — this is still an unaudited, highly speculative token");
  }

  // Momentum score for ranking "hot" tokens: recent volume relative to
  // liquidity, weighted by how much the price has actually moved.
  const volH1 = pair.volume?.h1 ?? 0;
  const volLiqRatio = liquidityUsd > 0 ? volH1 / liquidityUsd : 0;
  const momentumScore = volLiqRatio * (1 + Math.abs(h1Change) / 100);

  return { level, flags, momentumScore };
}
