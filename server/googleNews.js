// Per-company headlines from Google News RSS (free, no key). Yahoo's search
// returns no news at all for NSE tickers, so this is the per-stock source;
// Yahoo still powers the market-wide feed in yahoo.js.
import { cached } from "./cache.js";

const HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
};
const TTL_MS = 15 * 60 * 1000;
const MAX_ITEMS = 12;

const ENTITIES = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " };
function decode(text) {
  return text
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCharCode(parseInt(n, 16)))
    .replace(/&(\w+);/g, (m, name) => ENTITIES[name] ?? m)
    .trim();
}

function tag(xml, name) {
  const match = xml.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`));
  return match ? decode(match[1]) : null;
}

// "Legal name Limited" → "Legal name", so the search isn't limited to
// articles that spell out the full registered name.
function searchableName(name) {
  return (name || "")
    .replace(/\b(limited|ltd\.?|inc\.?|corp\.?|corporation|co\.?|plc)$/i, "")
    .replace(/[.,]+$/, "")
    .trim();
}

// Quote pages and SEO filler ("… stock price, news, quote and history",
// "Share Price Target 2026, 2027, 2030…", "Price Prediction for Monday")
// aren't news, and would skew the sentiment read.
const NOT_NEWS =
  /stock price,? (news,? )?quote|share price today|price target \d{4}|price prediction|share price\s+[—–-]\s|live updates?$/i;

// Google News edition per market, so a US company gets US coverage.
const EDITIONS = {
  IN: "hl=en-IN&gl=IN&ceid=IN:en",
  US: "hl=en-US&gl=US&ceid=US:en",
};

export function getStockNews(symbol, name, market = "IN") {
  const company = searchableName(name);
  const terms = [company && `"${company}"`, `"${symbol} share"`, `"${symbol} stock"`].filter(Boolean).join(" OR ");
  const edition = EDITIONS[market] || EDITIONS.IN;
  const url = `https://news.google.com/rss/search?q=${encodeURIComponent(`(${terms}) when:14d`)}&${edition}`;

  return cached(`gnews:${market}:${symbol}`, TTL_MS, async () => {
    const r = await fetch(url, { headers: HEADERS });
    if (!r.ok) throw new Error(`Google News responded ${r.status}`);
    const xml = await r.text();

    const seen = new Set();
    const articles = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)]
      .map(([, item]) => {
        const publisher = tag(item, "source");
        let title = tag(item, "title") || "";
        // Google appends " - Publisher" to every title.
        if (publisher && title.endsWith(` - ${publisher}`)) title = title.slice(0, -(publisher.length + 3));
        const published = Date.parse(tag(item, "pubDate") || "");
        return {
          uuid: tag(item, "guid") || tag(item, "link"),
          title,
          publisher,
          link: tag(item, "link"),
          publishedAt: Number.isFinite(published) ? published : null,
        };
      })
      .filter((a) => {
        if (!a.title || !a.link || NOT_NEWS.test(a.title)) return false;
        const key = a.title.toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .sort((a, b) => (b.publishedAt || 0) - (a.publishedAt || 0))
      .slice(0, MAX_ITEMS);

    return { asOf: new Date().toISOString(), articles };
  });
}
