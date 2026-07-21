import { useState } from "react";
import { useMarketNews } from "../../hooks/useMarketNews.js";
import { formatDateTime } from "../../utils.js";
import { IconMarket } from "../icons.jsx";
import PageHeader from "../PageHeader.jsx";
import DataNotAvailable from "../research/DataNotAvailable.jsx";
import NewsArticleList from "../news/NewsArticleList.jsx";

const CATEGORIES = [
  { key: "india", label: "India" },
  { key: "us", label: "United States" },
  { key: "europe", label: "Europe" },
  { key: "japan", label: "Japan" },
  { key: "commodities", label: "Commodities" },
];

export default function MarketView() {
  const news = useMarketNews();
  const [activeCategory, setActiveCategory] = useState("india");

  return (
    <div className="page-shell">
      <PageHeader label="Market" title="Market" subtitle="Real headlines by region and category, sourced live from Yahoo Finance." />

      {news.loading ? (
        <div className="panel-card">
          <p className="panel-subtitle">Loading market news…</p>
        </div>
      ) : news.error ? (
        <DataNotAvailable
          icon={<IconMarket width={30} height={30} />}
          title="Market news unavailable right now"
          description="The live news feed couldn't be reached. Try again shortly."
        />
      ) : (
        <div className="panel-card">
          <div className="tabs-row screener-tabs">
            {CATEGORIES.map((c) => (
              <button
                key={c.key}
                type="button"
                className={`tab-btn ${activeCategory === c.key ? "is-active" : ""}`}
                onClick={() => setActiveCategory(c.key)}
              >
                {c.label}
              </button>
            ))}
          </div>
          {news.asOf ? <p className="screener-asof">As of {formatDateTime(new Date(news.asOf))}</p> : null}
          <NewsArticleList articles={news.categories[activeCategory]} />
        </div>
      )}
    </div>
  );
}
