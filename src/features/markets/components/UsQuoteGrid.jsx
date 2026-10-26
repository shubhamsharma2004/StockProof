import { formatUsd } from "../../../shared/lib/format.js";
import ChangeText from "../../../shared/ui/ChangeText.jsx";
import CompanyLogo from "../../../shared/ui/CompanyLogo.jsx";
import { useGetUsQuotesQuery } from "../api/marketsApi.js";

export default function UsQuoteGrid({ title, subtitle, symbols }) {
  const { data: rows, isLoading, isError } = useGetUsQuotesQuery(symbols);

  return (
    <section className="panel-card">
      <h2 className="panel-title">{title}</h2>
      {subtitle ? <p className="panel-subtitle">{subtitle}</p> : null}

      {isLoading ? (
        <div className="us-quote-grid">
          {symbols.map((s) => (
            <div className="us-quote-card" key={s}>
              <div className="skeleton skeleton-line" style={{ width: "50%" }} />
              <div className="skeleton skeleton-line" style={{ width: "80%" }} />
            </div>
          ))}
        </div>
      ) : isError ? (
        <p className="panel-subtitle">US quotes are unavailable right now.</p>
      ) : (
        <div className="us-quote-grid">
          {rows.map((row) => (
            <div className="us-quote-card" key={row.symbol}>
              <div className="us-quote-top">
                <CompanyLogo symbol={row.symbol} src={row.logo} size={40} className="company-logo--round" />
                <span className="us-quote-id">
                  <strong>{row.symbol}</strong>
                  <span title={row.name}>{row.name}</span>
                </span>
              </div>
              {row.quote ? (
                <div className="us-quote-bottom">
                  <span className="us-quote-price">{formatUsd(row.quote.price)}</span>
                  <ChangeText value={row.quote.changePct} />
                </div>
              ) : (
                <span className="us-quote-missing">Quote unavailable</span>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
