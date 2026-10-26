// Finnhub (https://finnhub.io). The free plan only covers US markets, so
// this powers the Global side of Market Overview — US market status, quotes, news,
// and the US IPO calendar. The key is read from the server environment and
// sent as a header; it never reaches the browser.
import { cached } from "./cache.js";

const BASE = "https://finnhub.io/api/v1";

export class MissingKeyError extends Error {}

async function finnhub(path) {
  const key = process.env.FINNHUB_API_KEY;
  if (!key) throw new MissingKeyError("FINNHUB_API_KEY is not configured on the server");
  const r = await fetch(`${BASE}/${path}`, { headers: { "X-Finnhub-Token": key } });
  if (!r.ok) throw new Error(`Finnhub ${path.split("?")[0]} responded ${r.status}`);
  return r.json();
}

export function getUsMarketStatus() {
  return cached("finnhub:status:US", 60 * 1000, async () => {
    const s = await finnhub("stock/market-status?exchange=US");
    return {
      isOpen: Boolean(s.isOpen),
      session: s.session || null, // pre-market | regular | post-market | null
      holiday: s.holiday || null,
      timezone: s.timezone || "America/New_York",
      asOf: typeof s.t === "number" ? s.t * 1000 : Date.now(),
    };
  });
}

const NEWS_CATEGORIES = new Set(["general", "forex", "crypto", "merger"]);

// "Headline - Reuters" → "Headline"; the publisher is already shown below it.
function stripPublisherSuffix(headline, source) {
  if (!source) return headline;
  const suffix = ` - ${source}`;
  return headline.toLowerCase().endsWith(suffix.toLowerCase()) ? headline.slice(0, -suffix.length) : headline;
}

// Some feeds put the headline (plus publisher) in the summary field; showing
// it twice adds nothing.
function usefulSummary(headline, summary) {
  const clean = (s) => (s || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  const text = clean(summary);
  if (!text) return null;
  const head = clean(headline).replace(/ (reuters|bloomberg|cnbc|ap)$/, "");
  return text.startsWith(head.slice(0, 40)) ? null : summary.trim();
}
const MAX_ARTICLES = 25;

export function getFinnhubNews(category) {
  const safe = NEWS_CATEGORIES.has(category) ? category : "general";
  return cached(`finnhub:news:${safe}`, 5 * 60 * 1000, async () => {
    const items = await finnhub(`news?category=${safe}`);
    const articles = (Array.isArray(items) ? items : [])
      .filter((n) => n.headline && n.url)
      .slice(0, MAX_ARTICLES)
      .map((n) => ({
        uuid: `finnhub-${n.id}`,
        title: stripPublisherSuffix(n.headline, n.source),
        summary: usefulSummary(n.headline, n.summary),
        // Finnhub substitutes the publisher's logo when a story has no
        // photo; a wall of identical logos isn't a thumbnail.
        image: n.image && !/\/logo\//i.test(n.image) ? n.image : null,
        publisher: n.source || null,
        link: n.url,
        publishedAt: typeof n.datetime === "number" ? n.datetime * 1000 : null,
      }));
    return { asOf: new Date().toISOString(), category: safe, articles };
  });
}

// Name/logo/industry change rarely — cache for a day.
function getProfile(symbol) {
  return cached(`finnhub:profile:${symbol}`, 24 * 60 * 60 * 1000, async () => {
    const p = await finnhub(`stock/profile2?symbol=${encodeURIComponent(symbol)}`);
    return { name: p.name || symbol, logo: p.logo || null, industry: p.finnhubIndustry || null, website: p.weburl || null };
  });
}

function getUsQuote(symbol) {
  return cached(`finnhub:quote:${symbol}`, 60 * 1000, async () => {
    const q = await finnhub(`quote?symbol=${encodeURIComponent(symbol)}`);
    // Finnhub answers unknown symbols with all-zero quotes rather than an error.
    if (!q || !q.c) return null;
    return {
      price: q.c,
      change: q.d ?? null,
      changePct: q.dp ?? null,
      open: q.o ?? null,
      high: q.h ?? null,
      low: q.l ?? null,
      prevClose: q.pc ?? null,
      asOf: typeof q.t === "number" ? q.t * 1000 : null,
    };
  });
}

const MAX_SYMBOLS = 20;

// Quote + profile for a list of US tickers. A symbol whose lookup fails is
// returned with quote: null instead of failing the whole batch.
export async function getUsQuotes(symbolsParam) {
  const symbols = [...new Set(String(symbolsParam || "").split(",").map((s) => s.trim().toUpperCase()).filter(Boolean))].slice(0, MAX_SYMBOLS);
  const rows = await Promise.all(
    symbols.map(async (symbol) => {
      const [profile, quote] = await Promise.all([getProfile(symbol).catch(() => null), getUsQuote(symbol).catch(() => null)]);
      return { symbol, name: profile?.name || symbol, logo: profile?.logo || null, industry: profile?.industry || null, quote };
    })
  );
  return { asOf: new Date().toISOString(), quotes: rows };
}

// Same-industry US peers (free plan covers US companies only).
export function getUsPeers(symbol) {
  return cached(`finnhub:peers:${symbol}`, 24 * 60 * 60 * 1000, async () => {
    const peers = await finnhub(`stock/peers?symbol=${encodeURIComponent(symbol)}`);
    return { peers: (Array.isArray(peers) ? peers : []).filter((p) => p && p !== symbol && !p.includes(".")).slice(0, 6) };
  });
}

function isoDate(d) {
  return d.toISOString().slice(0, 10);
}

// Last week's pricings plus the next month's expected listings.
export function getUsIpoCalendar() {
  return cached("finnhub:ipo", 60 * 60 * 1000, async () => {
    const now = new Date();
    const from = isoDate(new Date(now.getTime() - 7 * 864e5));
    const to = isoDate(new Date(now.getTime() + 30 * 864e5));
    const data = await finnhub(`calendar/ipo?from=${from}&to=${to}`);
    const ipos = (data?.ipoCalendar || [])
      .filter((i) => i.name && i.date && i.status !== "withdrawn")
      .map((i) => ({
        date: i.date,
        name: i.name,
        symbol: i.symbol || null,
        exchange: i.exchange || null,
        price: i.price || null, // a single price or a "low-high" range string
        shares: typeof i.numberOfShares === "number" ? i.numberOfShares : null,
        value: typeof i.totalSharesValue === "number" && i.totalSharesValue > 0 ? i.totalSharesValue : null,
        status: i.status || null, // expected | priced | filed | withdrawn
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
    return { asOf: new Date().toISOString(), from, to, ipos };
  });
}
