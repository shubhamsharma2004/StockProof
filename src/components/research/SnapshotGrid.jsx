import { formatCurrency, formatMarketCap, formatNumber } from "../../utils.js";

const NOT_AVAILABLE = "Data not available";

export default function SnapshotGrid({ fd }) {
  const tiles = [
    { label: "Market Cap", value: fd.market_cap != null ? formatMarketCap(fd.market_cap) : null },
    { label: "P/E Ratio", value: fd.pe_ratio != null ? formatNumber(fd.pe_ratio) : null },
    { label: "P/B Ratio", value: fd.pb_ratio != null ? formatNumber(fd.pb_ratio) : null },
    { label: "ROE", value: fd.return_on_equity != null ? `${formatNumber(fd.return_on_equity)}%` : null },
    { label: "ROCE", value: null },
    { label: "EPS", value: fd.earnings_per_share != null ? formatCurrency(fd.earnings_per_share) : null },
    { label: "Book Value", value: fd.book_value != null ? formatCurrency(fd.book_value) : null },
    { label: "Dividend Yield", value: fd.dividend_yield != null ? `${formatNumber(fd.dividend_yield)}%` : null },
    { label: "Face Value", value: null },
    { label: "Debt to Equity", value: fd.debt_to_equity != null ? formatNumber(fd.debt_to_equity) : null },
    { label: "Promoter Holding", value: null },
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
          </div>
        ))}
      </div>
    </section>
  );
}
