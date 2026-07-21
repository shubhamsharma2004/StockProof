import { formatCurrency, formatPercent, formatVolume, formatMarketCap, formatNumber } from "./utils.js";

// Shared metadata for the raw quote/checklist fields — used wherever a
// liveFields[] entry needs a human label + formatted value (insight cards,
// the old summary strip). Kept separate from insights.js, which is about
// computed scores, not raw field display.
export const FIELD_FORMATTERS = {
  last_price: formatCurrency,
  percent_change: formatPercent,
  year_high: formatCurrency,
  year_low: formatCurrency,
  volume: formatVolume,
  market_cap: formatMarketCap,
  pe_ratio: (v) => (v == null ? "—" : formatNumber(v)),
  pb_ratio: (v) => (v == null ? "—" : formatNumber(v)),
  dividend_yield: (v) => (v == null ? "—" : `${formatNumber(v)}%`),
  book_value: formatCurrency,
  earnings_per_share: formatCurrency,
  sector: (v) => v || "—",
  industry: (v) => v || "—",
};

export const FIELD_LABELS = {
  last_price: "Last price",
  percent_change: "Day change",
  year_high: "52w high",
  year_low: "52w low",
  volume: "Volume",
  market_cap: "Market cap",
  pe_ratio: "P/E",
  pb_ratio: "P/B",
  dividend_yield: "Dividend yield",
  book_value: "Book value",
  earnings_per_share: "EPS",
  sector: "Sector",
  industry: "Industry",
};
