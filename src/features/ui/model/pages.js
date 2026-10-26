export const PAGES = {
  DASHBOARD: "dashboard",
  RESEARCH: "research",
  WATCHLIST: "watchlist",
  PORTFOLIO: "portfolio",
  SCREENER: "screener",
  IPO: "ipo",
  MARKETS: "markets",
  GUIDE: "guide",
};

// Free to browse while signed out. Every other page opens the sign-in
// popup instead of navigating.
export const PUBLIC_PAGES = new Set([PAGES.DASHBOARD, PAGES.RESEARCH, PAGES.GUIDE]);
