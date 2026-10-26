import { derivePbRatio } from "../../market-data/index.js";

export const MANUAL_FIELD_DEFS = [
  { key: "last_price", label: "Last price (₹)" },
  { key: "percent_change", label: "Day change (%)" },
  { key: "year_high", label: "52-week high (₹)" },
  { key: "year_low", label: "52-week low (₹)" },
  { key: "volume", label: "Trading volume" },
  { key: "market_cap", label: "Market cap (₹ cr)" },
  { key: "pe_ratio", label: "P/E ratio" },
  { key: "dividend_yield", label: "Dividend yield (%)" },
  { key: "book_value", label: "Book value per share (₹)" },
  { key: "earnings_per_share", label: "EPS (₹)" },
  { key: "sector", label: "Sector" },
  { key: "industry", label: "Industry" },
];

export const TEXT_FIELDS = new Set(["sector", "industry"]);

// Labels in the stock's currency. US market cap is typed in $ billions
// (nobody thinks in "dollar crores") and stored in the crore units the
// rest of the app uses.
export function manualFieldLabel(def, currency) {
  if (currency !== "USD") return def.label;
  if (def.key === "market_cap") return "Market cap ($ billions)";
  return def.label.replace("₹", "$");
}

const USD_BILLIONS_TO_CRORE = 100;

export function displayManualValue(key, value, currency) {
  if (value == null) return "";
  return key === "market_cap" && currency === "USD" ? value / USD_BILLIONS_TO_CRORE : value;
}

export function normalizeManualData(rawEntries, currency = "INR") {
  const out = {};
  for (const { key } of MANUAL_FIELD_DEFS) {
    if (TEXT_FIELDS.has(key)) {
      out[key] = rawEntries[key]?.trim() || null;
      continue;
    }
    const value = Number(rawEntries[key]);
    out[key] = Number.isFinite(value) && rawEntries[key] !== "" ? value : null;
  }
  if (currency === "USD" && out.market_cap != null) out.market_cap *= USD_BILLIONS_TO_CRORE;
  out.currency = currency;
  out.pb_ratio = derivePbRatio(out.last_price, out.book_value);
  return out;
}
