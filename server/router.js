// Host-independent API router: (path, query) → { status, body, maxAge }.
// Adapters (the Vite plugin today; any serverless host later) only translate
// their request/response objects to and from this.
import { getChart, getMarketNews, getQuote, getScreener, searchSecurities } from "./yahoo.js";
import { getIpoList, getNseEps, getShareholding } from "./nse.js";
import { getIpoGmp, getIpoProfile, IpoAlertsUnavailable } from "./ipoAlerts.js";
import { getStockNews } from "./googleNews.js";
import { getFinnhubNews, getUsIpoCalendar, getUsMarketStatus, getUsPeers, getUsQuotes, MissingKeyError } from "./finnhub.js";

const upper = (v) => String(v || "").trim().toUpperCase();
const bare = (v) => upper(v).replace(/\.(NS|BO)$/i, "");
const market = (q) => (upper(q.get("market")) === "US" ? "US" : "IN");

// endpoint → [handler(query), browser/CDN cache seconds]
const ROUTES = {
  stockSearch: [(q) => searchSecurities(String(q.get("q") || "").trim(), market(q)), 60],
  stockQuote: [(q) => requireSymbol(upper(q.get("symbol")), getQuote), 15],
  stockChart: [(q) => requireSymbol(upper(q.get("symbol")), (s) => getChart(s, q.get("range"))), 60],
  screener: [(q) => getScreener(String(q.get("market") || "IN").toUpperCase()), 30],
  marketNews: [() => getMarketNews(), 300],
  ipos: [(q) => getIpoList(String(q.get("status") || "open")), 300],
  ipoProfile: [(q) => requireSymbol(bare(q.get("symbol")), getIpoProfile), 3600],
  ipoGmp: [(q) => requireSymbol(bare(q.get("symbol")), getIpoGmp), 1800],
  shareholding: [(q) => requireSymbol(bare(q.get("symbol")), getShareholding), 3600],
  nseEps: [(q) => requireSymbol(bare(q.get("symbol")), getNseEps), 3600],
  stockNews: [(q) => requireSymbol(bare(q.get("symbol")), (s) => getStockNews(s, String(q.get("name") || ""), market(q))), 900],
  usPeers: [(q) => requireSymbol(upper(q.get("symbol")), getUsPeers), 86400],
  usMarketStatus: [() => getUsMarketStatus(), 60],
  globalNews: [(q) => getFinnhubNews(String(q.get("category") || "general")), 300],
  usIpoCalendar: [() => getUsIpoCalendar(), 3600],
  usQuotes: [(q) => getUsQuotes(q.get("symbols")), 60],
};

class BadRequest extends Error {}

function requireSymbol(symbol, fn) {
  if (!symbol) throw new BadRequest("symbol is required");
  return fn(symbol);
}

export async function handleApi(endpoint, query) {
  const route = ROUTES[endpoint];
  if (!route) return { status: 404, body: { error: `Unknown endpoint: ${endpoint}` } };
  const [handler, maxAge] = route;
  try {
    return { status: 200, body: await handler(query), maxAge };
  } catch (err) {
    if (err instanceof BadRequest) return { status: 400, body: { error: err.message } };
    if (err instanceof MissingKeyError || err instanceof IpoAlertsUnavailable) return { status: 503, body: { error: err.message } };
    return { status: 502, body: { error: err?.message || "Upstream request failed" } };
  }
}
