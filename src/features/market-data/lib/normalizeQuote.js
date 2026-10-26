const NUMERIC_FIELDS = [
  "last_price",
  "percent_change",
  "year_high",
  "year_low",
  "volume",
  "market_cap",
  "pe_ratio",
  "dividend_yield",
  "book_value",
  "earnings_per_share",
  // Extra quote-day fields
  "day_open",
  "day_high",
  "day_low",
  "prev_close",
  "avg_volume",
  "beta",
  "forward_pe",
  // Ratios (real, current values only — no fabricated "industry average")
  "return_on_equity",
  "return_on_assets",
  "debt_to_equity",
  "profit_margin",
  "operating_margin",
  "gross_margin",
  "ebitda_margin",
  "revenue_growth",
  "earnings_growth",
  "current_ratio",
  "total_cash_cr",
  "total_debt_cr",
  "employees",
  "shares_outstanding",
];

const STRING_FIELDS = ["sector", "industry", "long_name", "website", "ceo", "headquarters", "currency"];

// Historical annual arrays — trend sparklines. Length varies 0-5 per symbol;
// consumers must treat these as "may be empty", never assume a fixed length.
const HISTORY_ARRAY_FIELDS = ["revenue_history", "net_income_history", "balance_sheet_history"];

export function derivePbRatio(lastPrice, bookValue) {
  if (lastPrice != null && bookValue != null && bookValue !== 0) {
    return Number((lastPrice / bookValue).toFixed(2));
  }
  return null;
}

export function normalizeQuote(raw) {
  const out = {};
  for (const field of NUMERIC_FIELDS) {
    // Number(null) is 0, not NaN — a genuinely-missing field must short
    // circuit to null here, or it silently becomes a fake real zero (e.g.
    // "Current Price ₹0" for a stock we simply have no data for).
    const rawValue = raw?.[field];
    const value = rawValue == null ? null : Number(rawValue);
    out[field] = value != null && Number.isFinite(value) ? value : null;
  }
  for (const field of STRING_FIELDS) {
    out[field] = raw?.[field] || null;
  }
  for (const field of HISTORY_ARRAY_FIELDS) {
    out[field] = Array.isArray(raw?.[field]) ? raw[field] : [];
  }
  out.pb_ratio = derivePbRatio(out.last_price, out.book_value);
  return out;
}

export function normalizeChartPoints(payload) {
  return Array.isArray(payload?.points)
    ? payload.points.filter((p) => typeof p?.c === "number" && typeof p?.t === "number")
    : [];
}

export function normalizeSearchResult(raw) {
  const symbol = raw?.symbol || "";
  return {
    symbol,
    name: raw?.name || symbol,
    exchange: ["BSE", "US"].includes(raw?.exchange) ? raw.exchange : "NSE",
  };
}
