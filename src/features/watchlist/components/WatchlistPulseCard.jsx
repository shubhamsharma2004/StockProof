import { formatNumber } from "../../../shared/lib/format.js";
import { IconArrowDownSmall, IconArrowUpSmall } from "../../../shared/ui/icons.jsx";
import { useWatchlistQuotes } from "../hooks/useWatchlistQuotes.js";

// The dark summary card at the top of the sidebar. It summarises the
// watchlist's real day moves — there are no holdings/quantities in this
// app, so it never shows a fabricated "portfolio value".
export default function WatchlistPulseCard() {
  const rows = useWatchlistQuotes();
  const changes = rows.map((r) => r.quote?.percent_change).filter((v) => typeof v === "number");
  const average = changes.length ? changes.reduce((a, b) => a + b, 0) / changes.length : null;
  const up = changes.filter((v) => v >= 0).length;
  const stillLoading = rows.some((r) => r.loading);

  return (
    <section className="pulse-card" aria-label="Watchlist summary">
      <span className="pulse-card-label">Watchlist today</span>
      {rows.length === 0 ? (
        <>
          <strong className="pulse-card-value">—</strong>
          <span className="pulse-card-meta">Add stocks to track their daily move</span>
        </>
      ) : average == null && !stillLoading ? (
        <>
          <strong className="pulse-card-value pulse-card-value--muted">Prices unavailable</strong>
          <span className="pulse-card-meta">Live market data couldn't be reached</span>
        </>
      ) : (
        <>
          <div className="pulse-card-row">
            <strong className="pulse-card-value">
              {average == null ? "…" : `${average >= 0 ? "+" : "−"}${formatNumber(Math.abs(average))}%`}
            </strong>
            {changes.length ? (
              <span className="pulse-card-breadth" aria-label={`${up} up, ${changes.length - up} down`}>
                <span className="is-positive">
                  <IconArrowUpSmall width={13} height={13} />
                  {up}
                </span>
                <span className="is-negative">
                  <IconArrowDownSmall width={13} height={13} />
                  {changes.length - up}
                </span>
              </span>
            ) : null}
          </div>
          <span className="pulse-card-meta">
            Avg. day move across {rows.length} {rows.length === 1 ? "stock" : "stocks"}
          </span>
        </>
      )}
    </section>
  );
}
