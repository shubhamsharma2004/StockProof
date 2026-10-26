import { PAGES } from "../features/ui/index.js";
import { DashboardPage } from "../features/dashboard/index.js";
import { ResearchPage } from "../features/research/index.js";
import { WatchlistPage } from "../features/watchlist/index.js";
import { PortfolioPage } from "../features/portfolio/index.js";
import { ScreenerPage } from "../features/screener/index.js";
import { IpoPage } from "../features/ipo/index.js";
import { GuidePage } from "../features/guide/index.js";
import { MarketOverviewPage } from "../features/markets/index.js";

// page key → component. Adding a page means adding a feature and one line
// here (plus a nav entry) — nothing else in the shell changes.
export const PAGE_COMPONENTS = {
  [PAGES.DASHBOARD]: DashboardPage,
  [PAGES.RESEARCH]: ResearchPage,
  [PAGES.WATCHLIST]: WatchlistPage,
  [PAGES.PORTFOLIO]: PortfolioPage,
  [PAGES.SCREENER]: ScreenerPage,
  [PAGES.IPO]: IpoPage,
  [PAGES.MARKETS]: MarketOverviewPage,
  [PAGES.GUIDE]: GuidePage,
};
