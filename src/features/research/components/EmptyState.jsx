import { useSelector } from "react-redux";
import { selectMarket, stockPath } from "../../ui/index.js";
import { IconResearch } from "../../../shared/ui/icons.jsx";
import Link from "../../../shared/ui/Link.jsx";

const INTRO = {
  IN: "Search any NSE or BSE stock, ETF, or fund above to pull live figures and work through a structured research checklist — combining real data with your own judgment.",
  US: "Search any US stock or ETF (NYSE, Nasdaq) above to pull live figures and work through a structured research checklist — combining real data with your own judgment.",
};

export default function EmptyState() {
  const market = useSelector(selectMarket);
  return (
    <div className="empty-state">
      <div className="empty-state-inner">
        <span className="empty-state-icon">
          <IconResearch />
        </span>
        <h1>Evaluate before you invest</h1>
        <p>{INTRO[market.key]}</p>

        <div className="trending-picks">
          <span className="trending-picks-label">Popular {market.key === "US" ? "US" : "Indian"} large caps to get started</span>
          <div className="trending-picks-list">
            {market.popular.map((stock) => (
              <Link className="trending-pick-chip" key={stock.symbol} to={stockPath(stock)}>
                {stock.symbol}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
