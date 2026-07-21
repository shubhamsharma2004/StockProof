import { useEffect, useState } from "react";
import { buildSymbol, fetchStock } from "../../api.js";
import { formatCurrency, formatPercent } from "../../utils.js";
import { companyLogoUrl } from "../../companyLogo.js";
import { IconWatchlist, IconTrendUp, IconTrendDown, IconClose } from "../icons.jsx";
import PageHeader from "../PageHeader.jsx";
import DataNotAvailable from "../research/DataNotAvailable.jsx";

function RowLogo({ symbol, website }) {
  const [failed, setFailed] = useState(false);
  const url = companyLogoUrl(website, { size: 48, symbol });
  if (url && !failed) {
    return <img className="watchlist-row-logo" src={url} alt="" width={28} height={28} onError={() => setFailed(true)} />;
  }
  return <span className="watchlist-row-logo watchlist-row-logo--fallback">{(symbol || "?").charAt(0)}</span>;
}

export default function WatchlistView({ watchlist, onOpen }) {
  const [quotes, setQuotes] = useState({});
  const [loadingQuotes, setLoadingQuotes] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function loadAll() {
      if (!watchlist.items.length) {
        setQuotes({});
        return;
      }
      setLoadingQuotes(true);
      const results = await Promise.all(
        watchlist.items.map(async (item) => {
          const symbol = buildSymbol(item.symbol, item.exchange);
          const res = await fetchStock(symbol);
          return [item.symbol, res.ok ? res.data : null];
        })
      );
      if (!cancelled) {
        setQuotes(Object.fromEntries(results));
        setLoadingQuotes(false);
      }
    }
    loadAll();
    return () => {
      cancelled = true;
    };
  }, [watchlist.items]);

  return (
    <div className="page-shell">
      <PageHeader
        label="Watchlist"
        title="Watchlist"
        subtitle={
          watchlist.loading
            ? "Loading…"
            : `${watchlist.items.length} saved ${watchlist.items.length === 1 ? "security" : "securities"}.`
        }
      />

      {!watchlist.loading && watchlist.items.length === 0 ? (
        <DataNotAvailable
          icon={<IconWatchlist width={30} height={30} />}
          title="Your watchlist is empty"
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
          {watchlist.items.map((item) => {
            const quote = quotes[item.symbol];
            const loaded = Boolean(quote);
            const isUp = quote?.percent_change != null && quote.percent_change >= 0;
            return (
              <button type="button" className="watchlist-row" key={item.id} onClick={() => onOpen(item)}>
                <span className="watchlist-row-name">
                  <RowLogo symbol={item.symbol} website={quote?.website} />
                  <span className="watchlist-row-name-text">
                    <strong>{item.name}</strong>
                    <span className="watchlist-row-meta">
                      {item.symbol} · {item.exchange}
                    </span>
                  </span>
                </span>
                <span className="watchlist-row-price">
                  {loadingQuotes && !loaded ? "…" : quote?.last_price != null ? formatCurrency(quote.last_price) : "—"}
                </span>
                <span
                  className={`watchlist-row-change ${loaded && quote.percent_change != null ? (isUp ? "is-positive" : "is-negative") : ""}`}
                >
                  {loaded && quote.percent_change != null ? (
                    <>
                      {isUp ? <IconTrendUp width={13} height={13} /> : <IconTrendDown width={13} height={13} />}
                      {formatPercent(quote.percent_change)}
                    </>
                  ) : (
                    "—"
                  )}
                </span>
                <span
                  className="watchlist-row-remove"
                  role="button"
                  tabIndex={0}
                  onClick={(e) => {
                    e.stopPropagation();
                    watchlist.toggle(item);
                  }}
                  aria-label={`Remove ${item.name} from watchlist`}
                >
                  <IconClose width={14} height={14} />
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
