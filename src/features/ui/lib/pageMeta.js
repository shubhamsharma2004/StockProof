import { PAGES } from "../model/pages.js";

// Every page's <title> and description in one place. Like routes.js this is
// plain data the server also reads (server/seo.js), so the title a link
// preview shows matches the one the app sets.

export const DEFAULT_DESCRIPTION =
  "Evaluate any NSE/BSE stock or ETF against a structured checklist covering fundamentals, valuation, risk, and portfolio fit. Free tool, no signup required.";

const withSite = (title) => `${title} | Stockproof`;

// Search snippets cut off around 160 characters.
function clip(text, max = 158) {
  return text.length <= max ? text : `${text.slice(0, max - 1).replace(/\s+\S*$/, "")}…`;
}

export const PAGE_META = {
  [PAGES.DASHBOARD]: {
    title: "Stockproof — Stock & ETF Evaluation Checklist",
    description: DEFAULT_DESCRIPTION,
  },
  [PAGES.RESEARCH]: {
    title: withSite("Stock Research — Analyse Any NSE, BSE or US Stock"),
    description: "Search any Indian or US stock for live price, fundamentals, valuation, growth and risk scores, financials, peers and news — then work through a research checklist.",
  },
  [PAGES.IPO]: {
    title: withSite("IPO GMP Today — Live Subscription Status & Upcoming IPOs"),
    description: "Every NSE mainboard and SME IPO with live grey market premium (GMP), subscription status, price band, lot size, dates, strengths and risks. Updated through the day.",
  },
  [PAGES.GUIDE]: {
    title: withSite("Stock Market Guide & Glossary — Ratios Explained Simply"),
    description: "What P/E, ROE, debt to equity, GMP and other stock market terms mean, how Stockproof's scores are calculated, and where the data comes from. Plain English.",
  },
  [PAGES.SCREENER]: { title: withSite("Stock Screener — Top Gainers, Losers & Most Active") },
  [PAGES.MARKETS]: { title: withSite("Market Overview — Nifty, Sensex & Global Markets") },
  [PAGES.WATCHLIST]: { title: withSite("Watchlist") },
  [PAGES.PORTFOLIO]: { title: withSite("Portfolio") },
};

export function stockMeta({ symbol, name, exchange }) {
  const us = exchange === "US";
  const label = name && name.toUpperCase() !== symbol.toUpperCase() ? `${name} (${symbol})` : symbol;
  return {
    title: withSite(`${label} ${us ? "Stock" : "Share"} Price, Analysis & Score`),
    description: clip(
      `Live ${label} ${us ? "stock" : "share"} price on ${us ? "NYSE/Nasdaq" : exchange} with fundamentals, valuation, growth and risk scores, financials, peers and the latest news.`
    ),
  };
}

export function ipoMeta(ipo) {
  const name = String(ipo.name || ipo.symbol).replace(/\s+(limited|ltd\.?)$/i, "");
  return {
    title: withSite(`${name} IPO GMP Today, Subscription Status & Review`),
    description: clip(
      `${name} IPO: grey market premium (GMP) trend, live subscription, price band, lot size, key dates, strengths and risks${ipo.type === "SME" ? " for this SME issue" : ""}.`
    ),
  };
}

export function termMeta({ term, full, definition }) {
  const label = full ? `${term} (${full})` : term;
  return {
    title: withSite(`What is ${label}? Meaning Explained Simply`),
    description: clip(`${label}: ${definition}`),
  };
}
