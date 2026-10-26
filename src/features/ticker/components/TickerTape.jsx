import { useDispatch, useSelector } from "react-redux";
import { selectMarket } from "../../ui/index.js";
import { useGetScreenerQuery } from "../../screener/index.js";
import { moneyFor } from "../../../shared/lib/money.js";
import { securityRequested } from "../../../shared/model/events.js";
import ChangeText from "../../../shared/ui/ChangeText.jsx";

// Real prices for the screener's large/mid-cap pool, de-duplicated across
// its three lists. Reuses the cached screener response — no extra request.
function tickerRows(data) {
  const seen = new Set();
  return [...(data?.mostActive || []), ...(data?.gainers || []), ...(data?.losers || [])].filter((row) => {
    if (!row?.symbol || row.last_price == null || seen.has(row.symbol)) return false;
    seen.add(row.symbol);
    return true;
  });
}

// Scrolling price tape across the top of every page. The list is rendered
// twice so the CSS loop is seamless; the copy is hidden from assistive tech.
export default function TickerTape() {
  const dispatch = useDispatch();
  const market = useSelector(selectMarket);
  const money = moneyFor(market.currency);
  const { currentData: data, isFetching } = useGetScreenerQuery(market.key);
  const isLoading = isFetching && !data;
  const rows = tickerRows(data);

  // No live data → say so in the strip, never fill it with placeholder prices.
  if (rows.length === 0) {
    return (
      <div className="ticker" role="region" aria-label="Live stock prices">
        <span className="ticker-label">
          <span className={`ticker-dot ${isLoading ? "" : "is-offline"}`} aria-hidden="true" />
          {market.exchangeLabel}
        </span>
        <p className="ticker-status">{isLoading ? "Loading live prices…" : "Live prices are unavailable right now."}</p>
      </div>
    );
  }

  const open = (row) => dispatch(securityRequested({ security: { symbol: row.symbol, name: row.name, exchange: market.defaultExchange } }));
  // ~4s per item keeps the speed readable regardless of list length.
  const duration = `${Math.max(30, rows.length * 4)}s`;

  return (
    <div className="ticker" role="region" aria-label="Live stock prices">
      <span className="ticker-label">
        <span className="ticker-dot" aria-hidden="true" />
        {market.exchangeLabel}
      </span>
      <div className="ticker-viewport">
        <div className="ticker-track" style={{ "--ticker-duration": duration }}>
          {[0, 1].map((copy) => (
            <ul className="ticker-list" key={copy} aria-hidden={copy === 1 ? "true" : undefined}>
              {rows.map((row) => (
                <li key={row.symbol}>
                  <button type="button" className="ticker-item" tabIndex={copy === 1 ? -1 : 0} onClick={() => open(row)}>
                    <strong>{row.symbol}</strong>
                    <span className="ticker-price">{money.price(row.last_price)}</span>
                    <ChangeText value={row.percent_change} />
                  </button>
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>
    </div>
  );
}
