import { formatCurrency, formatMarketCap, formatNumber } from "../../utils.js";

const NOT_AVAILABLE = "Data not available";

// NSE's reported EPS is preferred (real filing data) over Yahoo's trailingEps
// when available; Yahoo is the fallback, not the other way round. Both are
// labeled so it's never ambiguous which one — and what time basis — is shown.
function resolveEps(fd, nse) {
  const nseEps = nse?.eps;
  if (nseEps?.eps != null) {
    const source = nseEps.basis === "ttm" ? "NSE, TTM" : `NSE, Q ended ${nseEps.periodEnd || "—"}`;
    return { value: formatCurrency(nseEps.eps), source: nseEps.stale ? `${source} (cached)` : source };
  }
  if (fd.earnings_per_share != null) {
    return { value: formatCurrency(fd.earnings_per_share), source: "Yahoo, TTM" };
  }
  return { value: null, source: null };
}

export default function SnapshotGrid({ fd, nse }) {
  const eps = resolveEps(fd, nse || {});
  const promoterPct = nse?.shareholding?.promoterPct;

  const tiles = [
    { label: "Market Cap", value: fd.market_cap != null ? formatMarketCap(fd.market_cap) : null },
    { label: "P/E Ratio", value: fd.pe_ratio != null ? formatNumber(fd.pe_ratio) : null },
    { label: "P/B Ratio", value: fd.pb_ratio != null ? formatNumber(fd.pb_ratio) : null },
    { label: "ROE", value: fd.return_on_equity != null ? `${formatNumber(fd.return_on_equity)}%` : null },
    { label: "ROCE", value: null },
    { label: "EPS", value: eps.value, source: eps.source },
    { label: "Book Value", value: fd.book_value != null ? formatCurrency(fd.book_value) : null },
    { label: "Dividend Yield", value: fd.dividend_yield != null ? `${formatNumber(fd.dividend_yield)}%` : null },
    { label: "Face Value", value: null },
    { label: "Debt to Equity", value: fd.debt_to_equity != null ? formatNumber(fd.debt_to_equity) : null },
    { label: "Promoter Holding", value: promoterPct != null ? `${formatNumber(promoterPct)}%` : null, source: promoterPct != null ? "NSE" : null },
    { label: "FII Holding", value: null },
    { label: "DII Holding", value: null },
    { label: "52W High", value: fd.year_high != null ? formatCurrency(fd.year_high) : null },
    { label: "52W Low", value: fd.year_low != null ? formatCurrency(fd.year_low) : null },
  ];

  return (
    <section className="panel-card">
      <h2 className="panel-title">Company Snapshot</h2>
      <div className="snapshot-grid">
        {tiles.map((t) => (
          <div className="snapshot-tile" key={t.label}>
            <span className="snapshot-tile-label">{t.label}</span>
            <span className={`snapshot-tile-value ${t.value == null ? "is-muted" : ""}`}>
              {t.value ?? NOT_AVAILABLE}
            </span>
            {t.source ? <span className="snapshot-tile-source">{t.source}</span> : null}
          </div>
        ))}
      </div>
    </section>
  );
}
