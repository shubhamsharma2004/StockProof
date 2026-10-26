import { formatPercent, formatVolume, formatNumber } from "../../../shared/lib/format.js";

// Shared metadata for the raw quote/checklist fields — used wherever a
// liveFields[] entry needs a human label + formatted value (insight cards).
// Kept separate from insights.js, which is about computed scores, not raw
// field display. Money fields take the stock's currency formatters.
export function fieldFormatters(money) {
  return {
    last_price: money.price,
    percent_change: formatPercent,
    year_high: money.price,
    year_low: money.price,
    volume: formatVolume,
    market_cap: money.amountCr,
    pe_ratio: (v) => (v == null ? "—" : formatNumber(v)),
    pb_ratio: (v) => (v == null ? "—" : formatNumber(v)),
    dividend_yield: (v) => (v == null ? "—" : `${formatNumber(v)}%`),
    book_value: money.price,
    earnings_per_share: money.price,
    sector: (v) => v || "—",
    industry: (v) => v || "—",
  };
}

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
