// Thin wrapper around a small Firebase Cloud Function proxy (functions/index.js)
// that fetches live NSE/BSE data from Yahoo Finance. Yahoo's endpoints return no
// CORS headers, so a static frontend can't call them directly — the proxy exists
// purely to add those headers and negotiate Yahoo's session-crumb handshake.
// Every export here returns a { ok, ... } shape instead of throwing, so callers
// can always fall back to manual entry without special-casing network errors.

const FUNCTIONS_BASE = "https://asia-south1-vetly-5351b.cloudfunctions.net";
const FETCH_TIMEOUT_MS = 6000;

async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    const payload = await res.json().catch(() => null);
    if (!res.ok) {
      throw new Error(payload?.error || `Request failed with status ${res.status}`);
    }
    return payload;
  } finally {
    clearTimeout(timer);
  }
}

export async function fetchScreener() {
  try {
    const payload = await fetchWithTimeout(`${FUNCTIONS_BASE}/screener`);
    return {
      ok: true,
      asOf: payload?.asOf || null,
      poolSize: payload?.poolSize ?? null,
      gainers: Array.isArray(payload?.gainers) ? payload.gainers : [],
      losers: Array.isArray(payload?.losers) ? payload.losers : [],
      mostActive: Array.isArray(payload?.mostActive) ? payload.mostActive : [],
    };
  } catch (err) {
    return { ok: false, error: err?.message || "Screener request failed" };
  }
}

export async function fetchMarketNews() {
  try {
    const payload = await fetchWithTimeout(`${FUNCTIONS_BASE}/marketNews`);
    return { ok: true, asOf: payload?.asOf || null, categories: payload?.categories || {} };
  } catch (err) {
    return { ok: false, error: err?.message || "News request failed" };
  }
}

export async function fetchIpoData() {
  try {
    const payload = await fetchWithTimeout(`${FUNCTIONS_BASE}/ipoData`);
    return {
      ok: true,
      asOf: payload?.asOf || null,
      openNow: Array.isArray(payload?.openNow) ? payload.openNow : [],
      upcoming: Array.isArray(payload?.upcoming) ? payload.upcoming : [],
      recentlyListed: Array.isArray(payload?.recentlyListed) ? payload.recentlyListed : [],
    };
  } catch (err) {
    return { ok: false, error: err?.message || "IPO data request failed" };
  }
}

// Bare NSE symbol (no .NS/.BO suffix) — these two endpoints are keyed by
// NSE's own regulatory-filing symbol, not the Yahoo-style suffixed one.
function bareSymbol(symbolWithSuffix) {
  return (symbolWithSuffix || "").replace(/\.(NS|BO)$/i, "").toUpperCase();
}

export async function fetchShareholding(symbolWithSuffix) {
  try {
    const payload = await fetchWithTimeout(
      `${FUNCTIONS_BASE}/shareholding?symbol=${encodeURIComponent(bareSymbol(symbolWithSuffix))}`
    );
    if (!payload?.available) return { ok: true, available: false };
    return {
      ok: true,
      available: true,
      promoterPct: typeof payload.promoter_pct === "number" ? payload.promoter_pct : null,
      publicPct: typeof payload.public_pct === "number" ? payload.public_pct : null,
      quarterEnd: payload.quarter_end || null,
      history: Array.isArray(payload.history) ? payload.history : [],
    };
  } catch (err) {
    return { ok: false, error: err?.message || "Shareholding request failed" };
  }
}

export async function fetchNseEps(symbolWithSuffix) {
  try {
    const payload = await fetchWithTimeout(`${FUNCTIONS_BASE}/nseEps?symbol=${encodeURIComponent(bareSymbol(symbolWithSuffix))}`);
    if (!payload?.available) return { ok: true, available: false };
    return {
      ok: true,
      available: true,
      eps: typeof payload.eps === "number" ? payload.eps : null,
      basis: payload.basis === "ttm" ? "ttm" : "quarterly",
      periodEnd: payload.periodEnd || null,
      stale: !!payload.stale,
    };
  } catch (err) {
    return { ok: false, error: err?.message || "NSE EPS request failed" };
  }
}

export async function fetchGuestCount() {
  try {
    const payload = await fetchWithTimeout(`${FUNCTIONS_BASE}/guestCounter`);
    return { ok: true, count: payload?.count ?? null };
  } catch (err) {
    return { ok: false, error: err?.message || "Could not load guest count" };
  }
}

export async function incrementGuestCount() {
  try {
    const payload = await fetchWithTimeout(`${FUNCTIONS_BASE}/guestCounter`, { method: "POST" });
    return { ok: true, count: payload?.count ?? null };
  } catch (err) {
    return { ok: false, error: err?.message || "Could not update guest count" };
  }
}

function normalizeSearchResult(raw) {
  const symbol = raw?.symbol || "";
  return {
    symbol,
    name: raw?.name || symbol,
    exchange: raw?.exchange === "BSE" ? "BSE" : "NSE",
  };
}

export async function searchSecurities(queryText) {
  const trimmed = queryText.trim();
  if (trimmed.length < 2) {
    return { ok: true, results: [] };
  }
  try {
    const payload = await fetchWithTimeout(`${FUNCTIONS_BASE}/stockSearch?q=${encodeURIComponent(trimmed)}`);
    const results = (payload?.results || []).map(normalizeSearchResult).filter((r) => r.symbol);
    return { ok: true, results };
  } catch (err) {
    return { ok: false, error: err?.message || "Search request failed" };
  }
}

// Ensures a symbol carries the .NS/.BO suffix Yahoo Finance expects.
export function buildSymbol(rawSymbol, exchange) {
  const symbol = (rawSymbol || "").trim().toUpperCase();
  if (symbol.endsWith(".NS") || symbol.endsWith(".BO")) return symbol;
  const suffix = exchange === "BSE" ? ".BO" : ".NS";
  return `${symbol}${suffix}`;
}

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

function normalizeStockPayload(raw) {
  const out = {};
  for (const field of NUMERIC_FIELDS) {
    // Number(null) is 0, not NaN — a genuinely-missing field must short
    // circuit to null here, or it silently becomes a fake real zero (e.g.
    // "Current Price ₹0" for a stock we simply have no data for).
    const raw_value = raw?.[field];
    const value = raw_value == null ? null : Number(raw_value);
    out[field] = value != null && Number.isFinite(value) ? value : null;
  }
  for (const field of STRING_FIELDS) {
    out[field] = raw?.[field] || null;
  }
  for (const field of HISTORY_ARRAY_FIELDS) {
    out[field] = Array.isArray(raw?.[field]) ? raw[field] : [];
  }

  if (out.last_price != null && out.book_value != null && out.book_value !== 0) {
    out.pb_ratio = Number((out.last_price / out.book_value).toFixed(2));
  } else {
    out.pb_ratio = null;
  }
  return out;
}

export async function fetchStock(symbolWithSuffix) {
  try {
    const payload = await fetchWithTimeout(
      `${FUNCTIONS_BASE}/stockQuote?symbol=${encodeURIComponent(symbolWithSuffix)}`
    );
    return { ok: true, data: normalizeStockPayload(payload) };
  } catch (err) {
    return { ok: false, error: err?.message || "Stock data request failed" };
  }
}

const CHART_RANGES = ["1d", "5d", "1mo", "6mo", "1y", "5y", "max"];

export async function fetchStockChart(symbolWithSuffix, range = "1y") {
  const safeRange = CHART_RANGES.includes(range) ? range : "1y";
  try {
    const payload = await fetchWithTimeout(
      `${FUNCTIONS_BASE}/stockChart?symbol=${encodeURIComponent(symbolWithSuffix)}&range=${safeRange}`
    );
    const points = Array.isArray(payload?.points)
      ? payload.points.filter((p) => typeof p?.c === "number" && typeof p?.t === "number")
      : [];
    return { ok: true, range: safeRange, points };
  } catch (err) {
    return { ok: false, error: err?.message || "Chart data request failed" };
  }
}

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

export function normalizeManualData(rawEntries) {
  const out = {};
  for (const { key } of MANUAL_FIELD_DEFS) {
    if (key === "sector" || key === "industry") {
      out[key] = rawEntries[key]?.trim() || null;
      continue;
    }
    const value = Number(rawEntries[key]);
    out[key] = Number.isFinite(value) && rawEntries[key] !== "" ? value : null;
  }
  if (out.last_price != null && out.book_value != null && out.book_value !== 0) {
    out.pb_ratio = Number((out.last_price / out.book_value).toFixed(2));
  } else {
    out.pb_ratio = null;
  }
  return out;
}
