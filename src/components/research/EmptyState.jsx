import { IconResearch } from "../icons.jsx";
import { formatNumber } from "../../utils.js";
import { TRENDING_STOCKS } from "../../trendingStocks.js";

export default function EmptyState({ guestCount, isGuest, stockData }) {
  return (
    <div className="empty-state">
      <div className="empty-state-inner">
        <span className="empty-state-icon">
          <IconResearch />
        </span>
        <h1>Evaluate before you invest</h1>
        <p>
          Search any NSE or BSE stock, ETF, or fund above to pull live figures and work through a
          structured research checklist — combining real data with your own judgment.
        </p>
        {isGuest && guestCount != null ? (
          <p className="guest-count-line">{formatNumber(guestCount, 0)} people have tried Stockproof as a guest</p>
        ) : null}

        <div className="trending-picks">
          <span className="trending-picks-label">Popular large caps to get started</span>
          <div className="trending-picks-list">
            {TRENDING_STOCKS.map((stock) => (
              <button
                type="button"
                className="trending-pick-chip"
                key={stock.symbol}
                onClick={() => stockData.selectSecurity(stock)}
              >
                {stock.symbol}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
