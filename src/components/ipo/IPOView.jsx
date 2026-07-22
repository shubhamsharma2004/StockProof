import { useState } from "react";
import { useIpoData } from "../../hooks/useIpoData.js";
import { useRecentlyListedQuotes } from "../../hooks/useRecentlyListedQuotes.js";
import { subscriptionStrength, formatSubscriptionTimes } from "../../ipoInsights.js";
import { formatCurrency, formatNumber, formatDateTime } from "../../utils.js";
import PageHeader from "../PageHeader.jsx";
import DataNotAvailable from "../research/DataNotAvailable.jsx";
import StarRating from "../StarRating.jsx";
import { IconResearch } from "../icons.jsx";

const TABS = [
  { key: "open", label: "Open Now" },
  { key: "upcoming", label: "Upcoming" },
  { key: "listed", label: "Recently Listed" },
];

export default function IPOView({ onOpen }) {
  const ipo = useIpoData();
  const [activeTab, setActiveTab] = useState("open");

  return (
    <div className="page-shell">
      <PageHeader
        label="IPO Analysis"
        title="IPO Analysis"
        subtitle="Real data from NSE's IPO feed. Subscription numbers are a demand signal, not a valuation — Recently Listed issues get the same fundamentals-based scoring as the rest of the app, since that's only possible once a company is actually trading."
      />

      {ipo.loading ? (
        <div className="panel-card">
          <p className="panel-subtitle">Loading IPO data…</p>
        </div>
      ) : ipo.error ? (
        <DataNotAvailable
          icon={<IconResearch width={30} height={30} />}
          title="IPO data unavailable right now"
          description="NSE's IPO feed couldn't be reached. Try again shortly."
        />
      ) : (
        <div className="panel-card">
          <div className="tabs-row screener-tabs">
            {TABS.map((t) => (
              <button
                key={t.key}
                type="button"
                className={`tab-btn ${activeTab === t.key ? "is-active" : ""}`}
                onClick={() => setActiveTab(t.key)}
              >
                {t.label}
              </button>
            ))}
          </div>
          {ipo.asOf ? <p className="screener-asof">As of {formatDateTime(new Date(ipo.asOf))}</p> : null}

          {activeTab === "open" ? <OpenNowTab list={ipo.openNow} /> : null}
          {activeTab === "upcoming" ? <UpcomingTab list={ipo.upcoming} /> : null}
          {activeTab === "listed" ? <RecentlyListedTab list={ipo.recentlyListed} onOpen={onOpen} /> : null}
        </div>
      )}
    </div>
  );
}

function OpenNowTab({ list }) {
  if (list.length === 0) {
    return <p className="panel-subtitle" style={{ padding: "16px 0" }}>No IPOs open for subscription right now.</p>;
  }
  return (
    <div className="ipo-card-grid">
      {list.map((row) => {
        const strength = subscriptionStrength(row.subscriptionTimes);
        return (
          <div className="ipo-card" key={row.symbol}>
            <div className="ipo-card-top">
              <strong>{row.company}</strong>
              <span className={`pill pill--${strength.tone}`}>{strength.label}</span>
            </div>
            <span className="ipo-card-meta">{row.symbol} · {row.exchange}{row.series ? ` · ${row.series}` : ""}</span>
            <div className="ipo-card-detail-grid">
              <div>
                <span className="scenario-detail-label">Price Band</span>
                <span className="scenario-detail-value">{row.priceBand || "—"}</span>
              </div>
              <div>
                <span className="scenario-detail-label">Closes</span>
                <span className="scenario-detail-value">{row.endDate || "—"}</span>
              </div>
              <div>
                <span className="scenario-detail-label">Subscription</span>
                <span className="scenario-detail-value">{formatSubscriptionTimes(row.subscriptionTimes) || "Not enough data"}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function UpcomingTab({ list }) {
  if (list.length === 0) {
    return <p className="panel-subtitle" style={{ padding: "16px 0" }}>No upcoming IPOs listed right now.</p>;
  }
  return (
    <div className="ipo-card-grid">
      {list.map((row) => (
        <div className="ipo-card" key={row.symbol}>
          <div className="ipo-card-top">
            <strong>{row.company}</strong>
          </div>
          <span className="ipo-card-meta">{row.symbol}{row.series ? ` · ${row.series}` : ""}</span>
          <div className="ipo-card-detail-grid">
            <div>
              <span className="scenario-detail-label">Price Band</span>
              <span className="scenario-detail-value">{row.priceBand || "—"}</span>
            </div>
            <div>
              <span className="scenario-detail-label">Opens</span>
              <span className="scenario-detail-value">{row.startDate || "—"}</span>
            </div>
            <div>
              <span className="scenario-detail-label">Closes</span>
              <span className="scenario-detail-value">{row.endDate || "—"}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function RecentlyListedTab({ list, onOpen }) {
  const { bySymbol, loading } = useRecentlyListedQuotes(list);

  if (list.length === 0) {
    return <p className="panel-subtitle" style={{ padding: "16px 0" }}>No recently listed IPOs available right now.</p>;
  }

  return (
    <div className="ipo-card-grid">
      {list.map((row) => {
        const q = bySymbol[row.symbol];
        return (
          <button
            type="button"
            className="ipo-card ipo-card--clickable"
            key={row.symbol}
            onClick={() => q?.fetched && onOpen({ symbol: row.symbol, name: row.company, exchange: q.exchange })}
          >
            <div className="ipo-card-top">
              <strong>{row.company}</strong>
              {q?.fetched ? <StarRating value={q.overall.stars} size={14} /> : null}
            </div>
            <span className="ipo-card-meta">{row.symbol} · Listed {row.listingDate}</span>
            <div className="ipo-card-detail-grid">
              <div>
                <span className="scenario-detail-label">Issue Price</span>
                <span className="scenario-detail-value">{row.issuePrice != null ? formatCurrency(row.issuePrice) : "—"}</span>
              </div>
              <div>
                <span className="scenario-detail-label">Current Price</span>
                <span className="scenario-detail-value">
                  {q?.fetched && q.fetchedData.last_price != null ? formatCurrency(q.fetchedData.last_price) : loading ? "…" : "Not available"}
                </span>
              </div>
              <div>
                <span className="scenario-detail-label">Since Listing</span>
                <span className={`scenario-detail-value ${q?.gainPercent != null ? (q.gainPercent >= 0 ? "is-positive" : "is-negative") : ""}`}>
                  {q?.gainPercent != null ? `${q.gainPercent >= 0 ? "+" : ""}${formatNumber(q.gainPercent)}%` : "—"}
                </span>
              </div>
              <div>
                <span className="scenario-detail-label">Current Read</span>
                <span className="scenario-detail-value">
                  {q?.fetched ? (q.overall.label !== "Not enough data" ? q.overall.label : "Not enough data") : loading ? "…" : "Not available"}
                </span>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
