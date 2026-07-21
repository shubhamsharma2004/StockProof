import { useEffect, useState } from "react";
import { fetchScreener } from "../../api.js";
import { formatCurrency, formatPercent, formatVolume, formatDateTime } from "../../utils.js";
import { IconScreener, IconTrendUp, IconTrendDown } from "../icons.jsx";
import PageHeader from "../PageHeader.jsx";
import DataNotAvailable from "../research/DataNotAvailable.jsx";

const TABS = [
  { key: "gainers", label: "Day Gainers" },
  { key: "losers", label: "Day Losers" },
  { key: "mostActive", label: "Most Active" },
];

export default function ScreenerView({ onOpen }) {
  const [state, setState] = useState({ loading: true, error: null, data: null });
  const [activeTab, setActiveTab] = useState("gainers");

  useEffect(() => {
    let cancelled = false;
    setState({ loading: true, error: null, data: null });
    fetchScreener().then((res) => {
      if (cancelled) return;
      if (res.ok) setState({ loading: false, error: null, data: res });
      else setState({ loading: false, error: res.error, data: null });
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const rows = state.data ? state.data[activeTab] : [];

  return (
    <div className="page-shell">
      <PageHeader
        label="Screener"
        title="Screener"
        subtitle={`Real-time movers among ${
          state.data?.poolSize ?? "a curated set of"
        } large & mid-cap NSE stocks — not the full market.`}
      />

      {state.loading ? (
        <div className="panel-card">
          <p className="panel-subtitle">Loading live market data…</p>
        </div>
      ) : state.error ? (
        <DataNotAvailable
          icon={<IconScreener width={30} height={30} />}
          title="Screener data unavailable right now"
          description="The live market feed couldn't be reached. Try again shortly."
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

          {state.data?.asOf ? (
            <p className="screener-asof">As of {formatDateTime(new Date(state.data.asOf))}</p>
          ) : null}

          <div className="screener-table">
            <div className="screener-table-head">
              <span>Company</span>
              <span>Price</span>
              <span>Change</span>
              <span>Volume</span>
              <span>P/E</span>
            </div>
            {rows.length === 0 ? (
              <p className="panel-subtitle" style={{ padding: "16px 0" }}>
                No data in this category right now.
              </p>
            ) : (
              rows.map((row) => {
                const isUp = row.percent_change != null && row.percent_change >= 0;
                return (
                  <button
                    type="button"
                    className="screener-row"
                    key={row.symbol}
                    onClick={() => onOpen({ symbol: row.symbol, name: row.name, exchange: "NSE" })}
                  >
                    <span className="screener-row-name">
                      <strong>{row.name}</strong>
                      <span className="watchlist-row-meta">{row.symbol} · NSE</span>
                    </span>
                    <span className="watchlist-row-price">{row.last_price != null ? formatCurrency(row.last_price) : "—"}</span>
                    <span className={`watchlist-row-change ${row.percent_change != null ? (isUp ? "is-positive" : "is-negative") : ""}`}>
                      {row.percent_change != null ? (
                        <>
                          {isUp ? <IconTrendUp width={13} height={13} /> : <IconTrendDown width={13} height={13} />}
                          {formatPercent(row.percent_change)}
                        </>
                      ) : (
                        "—"
                      )}
                    </span>
                    <span>{row.volume != null ? formatVolume(row.volume) : "—"}</span>
                    <span>{row.pe_ratio != null ? row.pe_ratio : "—"}</span>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
