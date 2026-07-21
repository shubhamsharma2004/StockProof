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

// Market-cap tier — a widely used rough convention (Rs 20,000 Cr+ large,
// Rs 5,000-20,000 Cr mid, below small), not an official SEBI list membership.
export function marketCapTier(marketCapCr) {
  if (marketCapCr == null) return null;
  if (marketCapCr >= 20000) return "Large Cap";
  if (marketCapCr >= 5000) return "Mid Cap";
  return "Small Cap";
}

export function computeStrengthsAndWatch(fd) {
  const strengths = [];
  const watch = [];

  if (fd.debt_to_equity != null) {
    if (fd.debt_to_equity < 0.4) strengths.push("Low Debt");
    else if (fd.debt_to_equity > 1) watch.push("High Debt");
  }
  if (fd.return_on_equity != null && fd.return_on_equity > 15) strengths.push("Strong ROE");
  if (fd.profit_margin != null) {
    if (fd.profit_margin > 15) strengths.push("Healthy Margins");
    else if (fd.profit_margin <= 0) watch.push("Weak Margins");
  }
  if (fd.total_cash_cr != null && fd.total_debt_cr != null && fd.total_cash_cr > fd.total_debt_cr) {
    strengths.push("High Cash Reserves");
  }
  if (fd.revenue_growth != null && fd.earnings_growth != null && fd.revenue_growth > 8 && fd.earnings_growth > 8) {
    strengths.push("Consistent Growth");
  } else if (fd.revenue_growth != null && fd.revenue_growth < 5) {
    watch.push("Slowing Growth");
  }
  if (fd.pe_ratio != null && fd.pe_ratio > 40) watch.push("Expensive Valuation");
  if (fd.dividend_yield != null && fd.dividend_yield > 0.5 && fd.dividend_yield <= 6) strengths.push("Healthy Cash Flow");
  if (fd.dividend_yield != null && fd.dividend_yield > 7) watch.push("Unusually High Yield");

  return { strengths: strengths.slice(0, 4), watch: watch.slice(0, 4) };
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

export function buildFinalRecommendation(fd, categories, checklistPercent) {
  const { strengths, watch } = computeStrengthsAndWatch(fd);
  const overall = computeOverallRecommendation(categories);

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
    reasons: strengths,
    watchOuts: watch,
    suitableFor: [...new Set(suitableFor)].slice(0, 4),
    checklistPercent,
  };
}

// Builds an SVG polyline "x,y x,y ..." string normalized into a viewBox of
// the given width/height, for lightweight inline sparklines. Returns null
// when there isn't enough data to draw a meaningful line.
export function buildSparklinePoints(values, width = 120, height = 36, padding = 3) {
  const nums = (values || []).filter((v) => typeof v === "number" && Number.isFinite(v));
  if (nums.length < 2) return null;
  const min = Math.min(...nums);
  const max = Math.max(...nums);
  const range = max - min || 1;
  const innerW = width - padding * 2;
  const innerH = height - padding * 2;
  return nums
    .map((v, i) => {
      const x = padding + (i / (nums.length - 1)) * innerW;
      const y = padding + innerH - ((v - min) / range) * innerH;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}
