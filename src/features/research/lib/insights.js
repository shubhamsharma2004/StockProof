import { moneyFor } from "../../../shared/lib/money.js";

// Deterministic, rule-based analysis layer — no external AI service, same
// spirit as rating.js but decomposed into the four category scores the
// dashboard shows (Financial Health / Valuation / Growth / Risk). Every
// score is computed only from fields we actually have; components with a
// null input are skipped and weights are rescaled, so partial data still
// produces an honest score instead of a misleadingly precise one. When too
// little is available, a category comes back with `available: false` and
// the UI should show a "Not enough data" state rather than a number.

function bucket(score, tiers) {
  for (const tier of tiers) {
    if (score >= tier.min) return tier.label;
  }
  return tiers[tiers.length - 1].label;
}

// Sums only the weight of components that had real data, rescales the
// earned points onto a 0-100 scale, then dampens toward the middle by how
// much of the total signal is actually missing. Without this, 1-2 strong
// signals out of 4 could read as a confident 100/100 — technically not
// fabricated (every input is real), but overconfident in a way that could
// mislead someone skimming a big green number. Below 40% data completeness
// the category is treated as unavailable rather than shown at all.
function weightedScore(components) {
  let earned = 0;
  let possible = 0;
  const totalMax = components.reduce((sum, c) => sum + c.max, 0);
  for (const c of components) {
    if (c.value == null) continue;
    earned += c.points;
    possible += c.max;
  }
  const completeness = totalMax === 0 ? 0 : possible / totalMax;
  if (possible === 0 || completeness < 0.4) return null;
  const raw = (earned / possible) * 100;
  const damped = raw * (0.5 + 0.5 * completeness);
  return { score: Math.round(damped), completeness };
}

function scoreDebtToEquity(v) {
  if (v == null) return 0;
  if (v < 0.3) return 1;
  if (v < 0.6) return 0.7;
  if (v < 1) return 0.35;
  return 0;
}

export function computeFinancialHealth(fd) {
  const components = [
    { value: fd.debt_to_equity, max: 30, points: scoreDebtToEquity(fd.debt_to_equity) * 30 },
    {
      value: fd.profit_margin,
      max: 25,
      points: fd.profit_margin == null ? 0 : fd.profit_margin > 20 ? 25 : fd.profit_margin > 10 ? 17 : fd.profit_margin > 0 ? 9 : 0,
    },
    {
      value: fd.return_on_equity,
      max: 25,
      points: fd.return_on_equity == null ? 0 : fd.return_on_equity > 20 ? 25 : fd.return_on_equity > 15 ? 18 : fd.return_on_equity > 8 ? 10 : 0,
    },
    {
      value: fd.current_ratio,
      max: 20,
      points: fd.current_ratio == null ? 0 : fd.current_ratio > 1.5 ? 20 : fd.current_ratio > 1 ? 12 : 5,
    },
  ];
  const result = weightedScore(components);
  if (result == null) return { score: null, status: "Not enough data", available: false };
  const status = bucket(result.score, [
    { min: 80, label: "Strong" },
    { min: 60, label: "Good" },
    { min: 40, label: "Moderate" },
    { min: 0, label: "Weak" },
  ]);
  return { score: result.score, status, available: true, completeness: result.completeness };
}

export function computeValuation(fd) {
  const components = [
    {
      value: fd.pe_ratio,
      max: 40,
      points: fd.pe_ratio == null ? 0 : fd.pe_ratio > 0 && fd.pe_ratio <= 20 ? 40 : fd.pe_ratio <= 35 ? 25 : fd.pe_ratio <= 50 ? 10 : 0,
    },
    {
      value: fd.pb_ratio,
      max: 30,
      points: fd.pb_ratio == null ? 0 : fd.pb_ratio > 0 && fd.pb_ratio <= 3 ? 30 : fd.pb_ratio <= 6 ? 18 : 5,
    },
    {
      value: fd.dividend_yield,
      max: 30,
      points:
        fd.dividend_yield == null
          ? 0
          : fd.dividend_yield === 0
          ? 15
          : fd.dividend_yield > 0.5 && fd.dividend_yield <= 6
          ? 30
          : fd.dividend_yield > 6
          ? 12
          : 15,
    },
  ];
  const result = weightedScore(components);
  if (result == null) return { score: null, status: "Not enough data", available: false };
  const status = bucket(result.score, [
    { min: 80, label: "Attractive" },
    { min: 55, label: "Reasonable" },
    { min: 35, label: "Expensive" },
    { min: 0, label: "Overvalued" },
  ]);
  return { score: result.score, status, available: true, completeness: result.completeness };
}

export function historyCAGR(history) {
  const valid = (history || []).filter((h) => typeof h.value_cr === "number" && h.value_cr > 0);
  if (valid.length < 2) return null;
  const first = valid[0];
  const last = valid[valid.length - 1];
  const years = last.year - first.year;
  if (years <= 0) return null;
  const cagr = (Math.pow(last.value_cr / first.value_cr, 1 / years) - 1) * 100;
  return Number.isFinite(cagr) ? cagr : null;
}

export function computeGrowth(fd) {
  const revenueCAGR = historyCAGR(fd.revenue_history);
  const profitCAGR = historyCAGR(fd.net_income_history);
  const components = [
    {
      value: fd.revenue_growth,
      max: 30,
      points: fd.revenue_growth == null ? 0 : fd.revenue_growth > 15 ? 30 : fd.revenue_growth > 8 ? 21 : fd.revenue_growth > 0 ? 10 : 0,
    },
    {
      value: fd.earnings_growth,
      max: 30,
      points: fd.earnings_growth == null ? 0 : fd.earnings_growth > 15 ? 30 : fd.earnings_growth > 8 ? 21 : fd.earnings_growth > 0 ? 10 : 0,
    },
    {
      value: revenueCAGR,
      max: 20,
      points: revenueCAGR == null ? 0 : revenueCAGR > 12 ? 20 : revenueCAGR > 5 ? 13 : revenueCAGR > 0 ? 6 : 0,
    },
    {
      value: profitCAGR,
      max: 20,
      points: profitCAGR == null ? 0 : profitCAGR > 12 ? 20 : profitCAGR > 5 ? 13 : profitCAGR > 0 ? 6 : 0,
    },
  ];
  const result = weightedScore(components);
  if (result == null) return { score: null, status: "Not enough data", available: false, revenueCAGR, profitCAGR };
  const status = bucket(result.score, [
    { min: 80, label: "Excellent" },
    { min: 60, label: "Good" },
    { min: 35, label: "Slow" },
    { min: 0, label: "Weak" },
  ]);
  return { score: result.score, status, available: true, revenueCAGR, profitCAGR, completeness: result.completeness };
}

// Higher = safer (lower risk) — mirrors how the other three cards read
// (higher is always "better") so the row scans consistently.
export function computeRisk(fd) {
  let rangePosition = null;
  if (fd.last_price != null && fd.year_high != null && fd.year_low != null && fd.year_high !== fd.year_low) {
    rangePosition = (fd.last_price - fd.year_low) / (fd.year_high - fd.year_low);
  }
  const components = [
    { value: fd.debt_to_equity, max: 35, points: scoreDebtToEquity(fd.debt_to_equity) * 35 },
    {
      value: fd.beta,
      max: 30,
      points: fd.beta == null ? 0 : fd.beta < 1 ? 30 : fd.beta < 1.5 ? 18 : 5,
    },
    {
      value: rangePosition,
      max: 20,
      points: rangePosition == null ? 0 : rangePosition > 0.15 && rangePosition < 0.85 ? 20 : 8,
    },
    {
      value: fd.volume,
      max: 15,
      points: fd.volume == null ? 0 : fd.volume >= 100000 ? 15 : fd.volume >= 10000 ? 9 : 3,
    },
  ];
  const result = weightedScore(components);
  if (result == null) return { score: null, status: "Not enough data", available: false };
  const status = bucket(result.score, [
    { min: 80, label: "Low" },
    { min: 60, label: "Moderate" },
    { min: 35, label: "Elevated" },
    { min: 0, label: "High" },
  ]);
  return { score: result.score, status, available: true, completeness: result.completeness };
}

// Net margin per year, derived by matching revenue_history and
// net_income_history entries on year — used for the Financial Health card's
// sparkline. Real, derived data (not fabricated), but only as complete as
// the two source arrays allow.
export function deriveNetMarginHistory(fd) {
  const revenueByYear = new Map((fd.revenue_history || []).map((r) => [r.year, r.value_cr]));
  const incomeByYear = fd.net_income_history || [];
  return incomeByYear
    .map((r) => {
      const revenue = revenueByYear.get(r.year);
      if (!revenue) return null;
      return revenue > 0 ? (r.value_cr / revenue) * 100 : null;
    })
    .filter((v) => v != null);
}

export function computeCategoryScores(fd) {
  return {
    financialHealth: computeFinancialHealth(fd),
    valuation: computeValuation(fd),
    growth: computeGrowth(fd),
    risk: computeRisk(fd),
  };
}

// Market-cap tier — widely used rough conventions, not official index
// membership. India: ₹20,000 Cr+ large, ₹5,000–20,000 Cr mid. US: $10B+
// large, $2–10B mid. Market cap arrives in crore units for both currencies.
export function marketCapTier(marketCapCr, currency = "INR") {
  if (marketCapCr == null) return null;
  if (currency === "USD") {
    const dollars = marketCapCr * 1e7;
    if (dollars >= 10e9) return "Large Cap";
    if (dollars >= 2e9) return "Mid Cap";
    return "Small Cap";
  }
  if (marketCapCr >= 20000) return "Large Cap";
  if (marketCapCr >= 5000) return "Mid Cap";
  return "Small Cap";
}

function n(value, digits = 2) {
  return Number(value).toLocaleString("en-IN", { maximumFractionDigits: digits, minimumFractionDigits: 0 });
}

// Every strength/watch item carries the real number that triggered it,
// written as a plain sentence a non-finance reader can act on — not just a
// jargon term next to a threshold comparison. The number stays in the
// sentence so it's still a traceable claim, not a vibe. Callers that only
// need the short tag (e.g. the compact Hero chips) can just read `.label`;
// callers showing the fuller cards should show `.proof` alongside it.
export function computeStrengthsAndWatch(fd) {
  const strengths = [];
  const watch = [];
  // Explanations use the stock's own currency (₹ for Indian, $ for US).
  const money = moneyFor(fd.currency === "USD" ? "USD" : "INR");
  const c = money.symbol;

  if (fd.debt_to_equity != null) {
    if (fd.debt_to_equity < 0.4) {
      strengths.push({
        label: "Low Debt",
        proof: `Debt-to-Equity is ${n(fd.debt_to_equity)} — this company runs mostly on its own money rather than borrowed money, so rising interest rates or a slow year are less likely to hurt it.`,
      });
    } else if (fd.debt_to_equity > 1) {
      watch.push({
        label: "High Debt",
        proof: `Debt-to-Equity is ${n(fd.debt_to_equity)} — this company owes more than its own shareholders have put in, so it's more exposed if interest rates rise or profits dip.`,
      });
    }
  }
  if (fd.return_on_equity != null && fd.return_on_equity > 15) {
    strengths.push({
      label: "Strong ROE",
      proof: `Return on Equity is ${n(fd.return_on_equity)}% — for every ${c}100 shareholders have put in, the company is turning that into ${c}${n(fd.return_on_equity)} of profit a year, a strong return.`,
    });
  }
  if (fd.profit_margin != null) {
    if (fd.profit_margin > 15) {
      strengths.push({
        label: "Healthy Margins",
        proof: `Net Profit Margin is ${n(fd.profit_margin)}% — out of every ${c}100 in sales, about ${c}${n(fd.profit_margin, 0)} ends up as actual profit, a healthy cut.`,
      });
    } else if (fd.profit_margin <= 0) {
      watch.push({
        label: "Weak Margins",
        proof: `Net Profit Margin is ${n(fd.profit_margin)}% — the company is making little to no real profit on what it sells right now, or losing money on it.`,
      });
    }
  }
  if (fd.total_cash_cr != null && fd.total_debt_cr != null && fd.total_cash_cr > fd.total_debt_cr) {
    strengths.push({
      label: "High Cash Reserves",
      proof: `The company holds ${money.amountCr(fd.total_cash_cr)} in cash against ${money.amountCr(fd.total_debt_cr)} it owes — more cash on hand than debt, a comfortable cushion if business slows.`,
    });
  }
  if (fd.revenue_growth != null && fd.earnings_growth != null && fd.revenue_growth > 8 && fd.earnings_growth > 8) {
    strengths.push({
      label: "Consistent Growth",
      proof: `Sales grew ${n(fd.revenue_growth)}% and profit grew ${n(fd.earnings_growth)}% — both are climbing together, not just one propped up by cost-cutting.`,
    });
  } else if (fd.revenue_growth != null && fd.revenue_growth < 5) {
    watch.push({
      label: "Slowing Growth",
      proof: `Sales grew only ${n(fd.revenue_growth)}% — the business is expanding slowly, which can mean it's maturing or running into headwinds.`,
    });
  }
  if (fd.pe_ratio != null && fd.pe_ratio > 40) {
    watch.push({
      label: "Expensive Valuation",
      proof: `The P/E ratio is ${n(fd.pe_ratio)} — you'd be paying ${c}${n(fd.pe_ratio, 0)} for every ${c}1 of current annual profit, a price that already assumes a lot of future growth.`,
    });
  }
  if (fd.dividend_yield != null && fd.dividend_yield > 0.5 && fd.dividend_yield <= 6) {
    strengths.push({
      label: "Healthy Cash Flow",
      proof: `The dividend yield is ${n(fd.dividend_yield)}% — the company pays shareholders a reasonable, sustainable-looking slice of profit in cash each year.`,
    });
  }
  if (fd.dividend_yield != null && fd.dividend_yield > 7) {
    watch.push({
      label: "Unusually High Yield",
      proof: `The dividend yield is ${n(fd.dividend_yield)}% — that's unusually high, and often means the share price has fallen a lot rather than the payout being extra generous. Worth checking why before assuming it's a bonus.`,
    });
  }

  return { strengths: strengths.slice(0, 4), watch: watch.slice(0, 4) };
}

// One plain-English sentence tying the label + confidence together for
// someone without a finance background — deliberately phrased as "here's
// what this means" rather than "here's what to do", since this tool scores
// real data, it doesn't give investment advice.
export function plainSummary(overall) {
  if (overall.stars == null) {
    return "There isn't enough live data yet to form a view on this one.";
  }
  const caveat =
    overall.confidence === "Preliminary"
      ? " You've only just started your own review, though — treat this as an early read, not a conclusion, until you've worked through more of the checklist below."
      : overall.confidence === "Limited Data"
        ? " Only partial data is available for this stock, so treat this as a rough read rather than the full picture."
        : "";

  if (overall.label === "Bullish") {
    return `The real numbers here look strong overall — that's a reasonable starting point to dig deeper, not a signal to buy on its own.${caveat}`;
  }
  if (overall.label === "Bearish") {
    return `Several real numbers here point to genuine concerns — that doesn't automatically mean avoid it, but it's worth understanding exactly why before going further.${caveat}`;
  }
  return `This one's mixed — some real strengths, some real concerns, without a strong signal either way. Worth a closer look before deciding.${caveat}`;
}

// With only 1-2 of the 4 categories available, a raw average can look
// confidently Bullish/Bearish off very little evidence. Below 3 available
// categories this requires a much more lopsided combined score before
// committing to a directional label, and confidence is capped at "Limited
// Data" rather than "Moderate" — half the picture missing is still half
// missing, however good the visible half looks.
export function computeOverallRecommendation(categories) {
  const available = Object.values(categories).filter((c) => c.available);
  if (available.length === 0) {
    return { stars: null, label: "Not enough data", tone: "unknown", confidence: "Limited Data", confidenceCount: 0 };
  }
  const combined = available.reduce((sum, c) => sum + c.score, 0) / available.length;
  const stars = Math.round((combined / 20) * 2) / 2;

  const confident = available.length >= 3;
  const bullThreshold = confident ? 65 : 78;
  const bearThreshold = confident ? 45 : 25;
  const label = combined >= bullThreshold ? "Bullish" : combined >= bearThreshold ? "Neutral" : "Bearish";
  const tone = combined >= bullThreshold ? "positive" : combined >= bearThreshold ? "neutral" : "negative";
  const confidence =
    available.length === 4 ? "High Confidence" : available.length === 3 ? "Moderate Confidence" : "Limited Data";
  return { stars, label, tone, confidence, confidenceCount: available.length, combined: Math.round(combined) };
}

// computeOverallRecommendation's confidence reflects how much real DATA is
// available (4/4 categories populated), not how much of the checklist the
// person viewing it has actually reviewed — those are different things, and
// showing "High Confidence" next to a 0%-reviewed checklist reads as a
// contradictory signal. This downgrades the label when checklist progress is
// still low, regardless of how complete the underlying data is.
export function applyResearchProgressToConfidence(overall, progressPercent) {
  if (overall.stars == null) return overall;
  if (progressPercent < 30) return { ...overall, confidence: "Preliminary" };
  return overall;
}

export function buildFinalRecommendation(fd, categories, checklistPercent) {
  const { strengths, watch } = computeStrengthsAndWatch(fd);
  const overall = applyResearchProgressToConfidence(computeOverallRecommendation(categories), checklistPercent);

  const suitableFor = [];
  if (fd.dividend_yield != null && fd.dividend_yield > 1 && categories.risk.available && categories.risk.score >= 60) {
    suitableFor.push("Long Term");
  }
  if (categories.growth.available && categories.growth.score >= 60) suitableFor.push("SIP");
  if (categories.financialHealth.available && categories.financialHealth.score >= 70 && (!categories.risk.available || categories.risk.score >= 50)) {
    suitableFor.push("Wealth Creation");
  }
  if (categories.risk.available && categories.risk.score < 40) suitableFor.push("High Risk Tolerance Only");

  let investmentLabel = "Needs More Research";
  if (overall.combined != null) {
    if (overall.combined >= 75) investmentLabel = "Strong Long-Term Investment";
    else if (overall.combined >= 55) investmentLabel = "Reasonable Long-Term Investment";
    else if (overall.combined >= 35) investmentLabel = "Proceed With Caution";
    else investmentLabel = "High Risk / Weak Fundamentals";
  }

  return {
    ...overall,
    investmentLabel,
    summary: plainSummary(overall),
    reasons: strengths,
    watchOuts: watch,
    suitableFor: [...new Set(suitableFor)].slice(0, 4),
    checklistPercent,
  };
}
