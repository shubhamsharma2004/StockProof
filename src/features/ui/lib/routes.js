import { bareSymbol } from "../../../shared/lib/symbols.js";
import { PAGES } from "../model/pages.js";

// The URL scheme. Kept free of browser globals and CSS imports: the server's
// sitemap and link-preview meta (server/seo.js) build the same paths from it.
//
//   /                         dashboard
//   /stock/RELIANCE           an NSE stock      /ipo/<company>-ipo-gmp    one IPO
//   /bse/stock/RELIANCE       a BSE stock       /guide/what-is-<term>     one glossary term
//   /us/stock/AAPL            a US stock
//   /research  /watchlist  /portfolio  /screener  /ipo  /markets  /guide

const PAGE_PATHS = {
  [PAGES.DASHBOARD]: "/",
  [PAGES.RESEARCH]: "/research",
  [PAGES.WATCHLIST]: "/watchlist",
  [PAGES.PORTFOLIO]: "/portfolio",
  [PAGES.SCREENER]: "/screener",
  [PAGES.IPO]: "/ipo",
  [PAGES.MARKETS]: "/markets",
  [PAGES.GUIDE]: "/guide",
};

// NSE is the default and gets the short form; the others carry a prefix.
const EXCHANGE_PREFIX = { NSE: "", BSE: "/bse", US: "/us" };

// "P/E ratio" → "pe-ratio", "Revenue & earnings growth" → "revenue-and-earnings-growth".
export function slugify(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/['’./()×]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export const pathForPage = (page) => PAGE_PATHS[page] || "/";

export function stockPath({ symbol, exchange }) {
  const prefix = EXCHANGE_PREFIX[exchange] ?? "";
  const bare = exchange === "US" ? String(symbol).toUpperCase() : bareSymbol(symbol);
  return `${prefix}/stock/${encodeURIComponent(bare)}`;
}

// NSE's feeds spell the same company "Limited" in one list and "Ltd" in
// another, so the suffix is dropped to keep an IPO's URL stable as it moves
// from upcoming to listed.
export const ipoSlug = (ipo) => `${slugify(ipo.name || ipo.symbol).replace(/-(limited|ltd)$/, "")}-ipo-gmp`;
export const ipoPath = (ipo) => `/ipo/${ipoSlug(ipo)}`;

export const termSlug = (term) => `what-is-${slugify(term)}`;
export const termPath = (term) => `/guide/${termSlug(term)}`;

// Path for a page plus its params (ui.params) — the inverse of routeFromPath
// for everything except stocks, which come from the research selection.
export function pathFor(page, params = {}) {
  if (page === PAGES.IPO && params.slug) return `/ipo/${params.slug}`;
  if (page === PAGES.GUIDE && params.term) return `/guide/${params.term}`;
  return pathForPage(page);
}

function decodeSegment(segment) {
  try {
    return decodeURIComponent(segment);
  } catch {
    return segment;
  }
}

// pathname → { page, params, security? }, or null for a path the app
// doesn't know.
export function routeFromPath(pathname) {
  const parts = String(pathname || "/").split("/").filter(Boolean).map(decodeSegment);

  if (parts.length === 0) return { page: PAGES.DASHBOARD, params: {} };

  const stock = (symbol, exchange) => ({ page: PAGES.RESEARCH, params: {}, security: { symbol: symbol.toUpperCase(), name: symbol.toUpperCase(), exchange } });
  if (parts.length === 2 && parts[0] === "stock") return stock(parts[1], "NSE");
  if (parts.length === 3 && parts[1] === "stock" && (parts[0] === "bse" || parts[0] === "us")) return stock(parts[2], parts[0].toUpperCase());

  if (parts.length === 2 && parts[0] === "ipo") return { page: PAGES.IPO, params: { slug: parts[1].toLowerCase() } };
  if (parts.length === 2 && parts[0] === "guide") return { page: PAGES.GUIDE, params: { term: parts[1].toLowerCase() } };

  if (parts.length === 1) {
    const page = Object.keys(PAGE_PATHS).find((key) => PAGE_PATHS[key] === `/${parts[0]}`);
    if (page) return { page, params: {} };
  }
  return null;
}
