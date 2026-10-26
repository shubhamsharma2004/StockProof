import { PAGES } from "../features/ui/index.js";
import {
  IconDashboard,
  IconResearch,
  IconWatchlist,
  IconPortfolio,
  IconLayers,
  IconIpo,
} from "../shared/ui/icons.jsx";

// Sidebar structure. A `children` entry renders as a collapsible group, like
// the design's "Stock & fund" section.
export const PRIMARY_NAV = [
  { key: PAGES.DASHBOARD, label: "Dashboard", Icon: IconDashboard },
  { key: PAGES.RESEARCH, label: "Stock Research", Icon: IconResearch },
  { key: PAGES.WATCHLIST, label: "Watchlist", Icon: IconWatchlist },
  { key: PAGES.PORTFOLIO, label: "Portfolio", Icon: IconPortfolio },
  { key: PAGES.IPO, label: "IPO Analysis", Icon: IconIpo },
  {
    key: "markets-group",
    label: "Markets",
    Icon: IconLayers,
    children: [
      { key: PAGES.SCREENER, label: "Screener" },
      { key: PAGES.MARKETS, label: "Market Overview" },
    ],
  },
];

export const FEEDBACK_URL = "https://forms.gle/z3rsKYyhjF4g4Dge7";
