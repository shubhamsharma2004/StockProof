import { useDispatch, useSelector } from "react-redux";
import { WatchlistPanel } from "../../watchlist/index.js";
import { navigateTo, PAGES, selectMarket, usePageMeta } from "../../ui/index.js";
import { featuredChanged, selectFeatured } from "../model/dashboardSlice.js";
import { TOPBAR_SEARCH_ID } from "../../../shared/config/domIds.js";
import FeaturedChartCard from "./FeaturedChartCard.jsx";
import MoversStrip from "./MoversStrip.jsx";

export default function DashboardPage() {
  usePageMeta(PAGES.DASHBOARD);
  const dispatch = useDispatch();
  const featured = useSelector(selectFeatured);
  const market = useSelector(selectMarket);
  const feature = (s) => dispatch(featuredChanged({ symbol: s.symbol, name: s.name, exchange: s.exchange || market.defaultExchange }));

  return (
    <div className="dashboard">
      <div className="dash-section-head">
        <h1 className="dash-title">Today's movers <span className="dash-title-market">{market.flag} {market.label}</span></h1>
        <button type="button" className="link-btn" onClick={() => dispatch(navigateTo(PAGES.SCREENER))}>
          Open screener
        </button>
      </div>

      <MoversStrip activeSymbol={featured.symbol} onSelect={feature} />

      <div className="dash-grid">
        <FeaturedChartCard />
        <WatchlistPanel
          activeSymbol={featured.symbol}
          onSelect={feature}
          onAdd={() => document.getElementById(TOPBAR_SEARCH_ID)?.focus()}
        />
      </div>
    </div>
  );
}
