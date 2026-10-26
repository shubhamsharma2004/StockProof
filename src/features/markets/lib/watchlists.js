// Curated symbols shown on Market Overview — fixed shortlists, not a
// "most popular" feed (no such data exists on the free plans).

// Yahoo index symbols for the India side.
export const INDIA_INDICES = [
  { symbol: "^NSEI", name: "Nifty 50" },
  { symbol: "^BSESN", name: "Sensex" },
  { symbol: "^NSEBANK", name: "Nifty Bank" },
];

export const US_LEADERS = ["AAPL", "MSFT", "NVDA", "GOOGL", "AMZN", "META", "TSLA", "JPM"];

// Indian companies whose shares also trade in the US as ADRs. Prices are in
// US dollars and move on US market hours, so they can differ from NSE.
export const INDIAN_ADRS = ["INFY", "WIT", "IBN", "HDB", "RDY", "MMYT"];

// One tab row over two sources: Finnhub categories and Yahoo regions.
export const WORLD_NEWS_TABS = [
  { key: "general", label: "Top stories", source: "finnhub" },
  { key: "europe", label: "Europe", source: "yahoo" },
  { key: "japan", label: "Japan", source: "yahoo" },
  { key: "commodities", label: "Commodities", source: "yahoo" },
  { key: "forex", label: "Forex", source: "finnhub" },
  { key: "crypto", label: "Crypto", source: "finnhub" },
  { key: "merger", label: "Mergers", source: "finnhub" },
];
