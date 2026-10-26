import { useDispatch } from "react-redux";
import { useGetChartQuery, useGetQuoteQuery } from "../../market-data/index.js";
import { navigateTo, PAGES } from "../../ui/index.js";
import { formatDateTime, formatNumber } from "../../../shared/lib/format.js";
import ChangeText from "../../../shared/ui/ChangeText.jsx";
import NewsArticleList from "../../../shared/ui/NewsArticleList.jsx";
import Sparkline from "../../../shared/ui/Sparkline.jsx";
import { useGetMarketNewsQuery } from "../api/marketsApi.js";
import { INDIA_INDICES } from "../lib/watchlists.js";

function IndexCard({ symbol, name }) {
  const { data: quote, isLoading } = useGetQuoteQuery(symbol);
  const { data: points } = useGetChartQuery({ symbol, range: "1d" });

  return (
    <div className="index-card">
      <div className="index-card-top">
        <span className="index-card-name">{name}</span>
        {points?.length >= 2 ? <Sparkline values={points.map((p) => p.c)} width={96} height={34} tone="auto" filled /> : null}
      </div>
      {quote?.last_price != null ? (
        <div className="index-card-bottom">
          <span className="index-card-level">{formatNumber(quote.last_price)}</span>
          <ChangeText value={quote.percent_change} />
        </div>
      ) : (
        <span className="us-quote-missing">{isLoading ? "Loading…" : "Unavailable"}</span>
      )}
    </div>
  );
}

export default function IndiaOverview() {
  const dispatch = useDispatch();
  const { data: news, isLoading, isError } = useGetMarketNewsQuery();

  return (
    <>
      <section className="panel-card">
        <div className="panel-card-head">
          <h2 className="panel-title">Indian indices</h2>
          <button type="button" className="link-btn" onClick={() => dispatch(navigateTo(PAGES.SCREENER))}>
            Today's movers in Screener
          </button>
        </div>
        <div className="index-grid">
          {INDIA_INDICES.map((i) => (
            <IndexCard key={i.symbol} symbol={i.symbol} name={i.name} />
          ))}
        </div>
      </section>

      <section className="panel-card">
        <h2 className="panel-title">Indian market news</h2>
        <p className="panel-subtitle">NSE/BSE-listed companies and Indian markets, sourced live from Yahoo Finance. For one company's news, open it in Stock Research.</p>
        {isLoading ? (
          <p className="panel-subtitle">Loading headlines…</p>
        ) : isError ? (
          <p className="panel-subtitle">Headlines are unavailable right now.</p>
        ) : (
          <>
            {news.asOf ? <p className="screener-asof">As of {formatDateTime(news.asOf)}</p> : null}
            <NewsArticleList articles={news.categories.india} emptyLabel="No India-specific headlines available right now." />
          </>
        )}
      </section>
    </>
  );
}
