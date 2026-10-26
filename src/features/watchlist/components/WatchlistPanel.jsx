import CompanyLogo from "../../../shared/ui/CompanyLogo.jsx";
import ChangeText from "../../../shared/ui/ChangeText.jsx";
import { IconPlus } from "../../../shared/ui/icons.jsx";
import { useWatchlistQuotes } from "../hooks/useWatchlistQuotes.js";

// The dashboard's "My watchlist" card. What clicking a row does is the
// caller's call (the dashboard swaps its featured chart).
export default function WatchlistPanel({ activeSymbol, onSelect, onAdd }) {
  const rows = useWatchlistQuotes();

  return (
    <section className="dash-card watchlist-panel">
      <header className="dash-card-head">
        <h2 className="dash-card-title">My watchlist</h2>
        <button type="button" className="icon-btn icon-btn--ghost" onClick={onAdd} aria-label="Add a stock to your watchlist">
          <IconPlus width={20} height={20} />
        </button>
      </header>

      {rows.length === 0 ? (
        <div className="watchlist-panel-empty">
          <p>Nothing here yet.</p>
          <p>Search a stock, then tap <strong>Add to Watchlist</strong> on its research page to track it here.</p>
        </div>
      ) : (
        <ul className="watchlist-panel-list">
          {rows.map(({ item, quote, loading, failed, money }) => (
            <li key={item.id}>
              <button
                type="button"
                className={`watchlist-panel-row ${activeSymbol === item.symbol ? "is-active" : ""}`}
                onClick={() => onSelect(item)}
              >
                <CompanyLogo symbol={item.symbol} website={quote?.website} size={44} className="company-logo--round" />
                <span className="watchlist-panel-id">
                  <strong>{item.symbol}</strong>
                  <span>{item.name}</span>
                </span>
                <span className="watchlist-panel-quote">
                  {quote?.last_price != null ? (
                    <>
                      <strong>{money.price(quote.last_price)}</strong>
                      <ChangeText value={quote.percent_change} showArrow={false} />
                    </>
                  ) : (
                    <span className="watchlist-panel-unavailable">{loading ? "Loading…" : failed ? "Price unavailable" : "—"}</span>
                  )}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
