import { formatDate } from "../../../shared/lib/format.js";
import { useGetUsIpoCalendarQuery } from "../api/ipoApi.js";

const STATUS_TONE = { priced: "positive", expected: "neutral", filed: "muted" };

function compactUsd(value) {
  if (!value) return "—";
  if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
  return `$${value.toLocaleString("en-US")}`;
}

export default function UsIpoCalendar() {
  const { data: ipos, isLoading, isError } = useGetUsIpoCalendarQuery();

  return (
    <section className="panel-card">
      <h2 className="panel-title">US IPO calendar</h2>
      <p className="panel-subtitle">Pricings from the past week and listings expected over the next 30 days.</p>

      {isLoading ? (
        <p className="panel-subtitle">Loading IPO calendar…</p>
      ) : isError ? (
        <p className="panel-subtitle">The IPO calendar is unavailable right now.</p>
      ) : ipos.length === 0 ? (
        <p className="panel-subtitle">No US IPOs in this window.</p>
      ) : (
        <div className="us-ipo-table">
          <div className="us-ipo-head">
            <span>Date</span>
            <span>Company</span>
            <span>Price</span>
            <span>Deal size</span>
            <span>Status</span>
          </div>
          {ipos.map((ipo) => (
            <div className="us-ipo-row" key={`${ipo.date}-${ipo.name}`}>
              <span>{formatDate(ipo.date)}</span>
              <span className="us-ipo-company">
                <strong>{ipo.name}</strong>
                <span>{[ipo.symbol, ipo.exchange].filter(Boolean).join(" · ") || "Symbol not assigned yet"}</span>
              </span>
              <span>{ipo.price ? `$${ipo.price}` : "—"}</span>
              <span>{compactUsd(ipo.value)}</span>
              <span>
                <span className={`pill pill--${STATUS_TONE[ipo.status] || "muted"}`}>{ipo.status || "—"}</span>
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
