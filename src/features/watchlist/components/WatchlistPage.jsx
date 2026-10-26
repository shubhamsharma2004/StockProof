import { useDispatch, useSelector } from "react-redux";
import { securityRequested } from "../../../shared/model/events.js";
import CompanyLogo from "../../../shared/ui/CompanyLogo.jsx";
import ChangeText from "../../../shared/ui/ChangeText.jsx";
import DataNotAvailable from "../../../shared/ui/DataNotAvailable.jsx";
import PageHeader from "../../../shared/ui/PageHeader.jsx";
import { IconWatchlist, IconClose } from "../../../shared/ui/icons.jsx";
import { selectWatchlistLoading, toggleWatchlist } from "../model/watchlistSlice.js";
import { selectMarket } from "../../ui/index.js";
import { useWatchlistQuotes } from "../hooks/useWatchlistQuotes.js";

export default function WatchlistPage() {
  const dispatch = useDispatch();
  const loading = useSelector(selectWatchlistLoading);
  const rows = useWatchlistQuotes();
  const market = useSelector(selectMarket);

  return (
    <div className="page-shell">
      <PageHeader
        label="Watchlist"
        title="Watchlist"
        subtitle={loading ? "Loading…" : `${rows.length} saved ${market.label} ${rows.length === 1 ? "stock" : "stocks"}. Switch markets in the top bar to see the others.`}
      />

      {!loading && rows.length === 0 ? (
        <DataNotAvailable
          icon={<IconWatchlist width={30} height={30} />}
          title={`No ${market.label} stocks in your watchlist yet`}
          description="Search a stock in Stock Research and tap the star on its overview card to add it here."
        />
      ) : (
        <div className="panel-card watchlist-card">
          <div className="watchlist-table-head">
            <span>Name</span>
            <span>Price</span>
            <span>Change</span>
            <span></span>
          </div>
          {rows.map(({ item, quote, loading: quoteLoading, money }) => (
            <button
              type="button"
              className="watchlist-row"
              key={item.id}
              onClick={() => dispatch(securityRequested({ security: item }))}
            >
              <span className="watchlist-row-name">
                <CompanyLogo symbol={item.symbol} website={quote?.website} size={36} />
                <span className="watchlist-row-name-text">
                  <strong>{item.name}</strong>
                  <span className="watchlist-row-meta">
                    {item.symbol} · {item.exchange === "US" ? "NYSE / Nasdaq" : item.exchange}
                  </span>
                </span>
              </span>
              <span className="watchlist-row-price">
                {quoteLoading ? "…" : quote?.last_price != null ? money.price(quote.last_price) : "—"}
              </span>
              <ChangeText value={quote?.percent_change} />
              <span
                className="watchlist-row-remove"
                role="button"
                tabIndex={0}
                onClick={(e) => {
                  e.stopPropagation();
                  dispatch(toggleWatchlist(item));
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    e.stopPropagation();
                    dispatch(toggleWatchlist(item));
                  }
                }}
                aria-label={`Remove ${item.name} from watchlist`}
              >
                <IconClose width={14} height={14} />
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
