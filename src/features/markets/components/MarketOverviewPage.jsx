import { useSelector } from "react-redux";
import { PAGES, selectRegion, usePageMeta } from "../../ui/index.js";
import { MARKET_KEYS } from "../../../shared/config/markets.js";
import PageHeader from "../../../shared/ui/PageHeader.jsx";
import GlobalOverview from "./GlobalOverview.jsx";
import IndiaOverview from "./IndiaOverview.jsx";

const SUBTITLES = {
  [MARKET_KEYS.INDIA]: "Where Indian markets stand today — Nifty, Sensex and Bank Nifty, plus market-wide headlines.",
  [MARKET_KEYS.US]: "US market status and leaders in US dollars, Indian ADRs, and world market news.",
};

export default function MarketOverviewPage() {
  usePageMeta(PAGES.MARKETS);
  const region = useSelector(selectRegion);

  return (
    <div className="page-shell">
      <PageHeader label="Market Overview" title="Market Overview" subtitle={SUBTITLES[region]} />

      <div className="markets-stack">{region === MARKET_KEYS.INDIA ? <IndiaOverview /> : <GlobalOverview />}</div>
    </div>
  );
}
