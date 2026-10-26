import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { PAGES, selectRegion, usePageMeta } from "../../ui/index.js";
import { MARKET_KEYS } from "../../../shared/config/markets.js";
import { formatDateTime, formatVolume, formatVolumeIntl } from "../../../shared/lib/format.js";
import { moneyFor } from "../../../shared/lib/money.js";
import { securityRequested } from "../../../shared/model/events.js";
import ChangeText from "../../../shared/ui/ChangeText.jsx";
import DataNotAvailable from "../../../shared/ui/DataNotAvailable.jsx";
import PageHeader from "../../../shared/ui/PageHeader.jsx";
import Tabs from "../../../shared/ui/Tabs.jsx";
import { IconScreener } from "../../../shared/ui/icons.jsx";
import { useGetScreenerQuery } from "../api/screenerApi.js";

const TABS = [
  { key: "gainers", label: "Day Gainers" },
  { key: "losers", label: "Day Losers" },
  { key: "mostActive", label: "Most Active" },
];

const MARKETS = {
  [MARKET_KEYS.INDIA]: {
    exchange: "NSE",
    price: moneyFor("INR").price,
    volume: formatVolume,
    subtitle: (n) => `Real-time movers among ${n ?? "a curated set of"} large & mid-cap NSE stocks — not the full market. Tap a stock to research it.`,
  },
  [MARKET_KEYS.US]: {
    exchange: "US",
    price: moneyFor("USD").price,
    volume: formatVolumeIntl,
    subtitle: (n) => `Real-time movers among ${n ?? "a curated set of"} US large caps (NYSE & Nasdaq), in US dollars — not the full market. Tap a stock to research it.`,
  },
};

export default function ScreenerPage() {
  usePageMeta(PAGES.SCREENER);
  const dispatch = useDispatch();
  const region = useSelector(selectRegion);
  const market = MARKETS[region];
  const { currentData: data, isFetching, isError } = useGetScreenerQuery(region);
  const [activeTab, setActiveTab] = useState("gainers");
  const rows = data ? data[activeTab] : [];

  return (
    <div className="page-shell">
      <PageHeader label="Screener" title="Screener" subtitle={market.subtitle(data?.poolSize)} />

      {isFetching && !data ? (
        <div className="panel-card">
          <p className="panel-subtitle">Loading live market data…</p>
        </div>
      ) : isError ? (
        <DataNotAvailable
          icon={<IconScreener width={30} height={30} />}
          title="Screener data unavailable right now"
          description="The live market feed couldn't be reached. Try again shortly."
        />
      ) : (
        <div className="panel-card">
          <Tabs tabs={TABS} activeTab={activeTab} onChange={setActiveTab} label="Screener lists" className="screener-tabs" />

          {data?.asOf ? <p className="screener-asof">As of {formatDateTime(data.asOf)}</p> : null}

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
                const cells = (
                  <>
                    <span className="screener-row-name">
                      <strong>{row.name}</strong>
                      <span className="watchlist-row-meta">
                        {row.symbol} · {market.exchange}
                      </span>
                    </span>
                    <span className="watchlist-row-price">{row.last_price != null ? market.price(row.last_price) : "—"}</span>
                    <ChangeText value={row.percent_change} />
                    <span>{row.volume != null ? market.volume(row.volume) : "—"}</span>
                    <span>{row.pe_ratio != null ? row.pe_ratio : "—"}</span>
                  </>
                );
                return (
                  <button
                    type="button"
                    className="screener-row"
                    key={row.symbol}
                    onClick={() => dispatch(securityRequested({ security: { symbol: row.symbol, name: row.name, exchange: market.exchange } }))}
                  >
                    {cells}
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
