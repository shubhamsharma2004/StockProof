import { useMarketNews } from "../../hooks/useMarketNews.js";
import { formatDateTime } from "../../utils.js";
import { IconNews } from "../icons.jsx";
import PageHeader from "../PageHeader.jsx";
import DataNotAvailable from "../research/DataNotAvailable.jsx";
import NewsArticleList from "./NewsArticleList.jsx";

export default function NewsInsightsView() {
  const news = useMarketNews();
  const articles = news.categories.india;

  return (
    <div className="page-shell">
      <PageHeader
        label="News & Insights"
        title="News & Insights"
        subtitle="All available India exchange news — NSE/BSE-listed companies and Indian markets, sourced live from Yahoo Finance."
      />

      {news.loading ? (
        <div className="panel-card">
          <p className="panel-subtitle">Loading India market news…</p>
        </div>
      ) : news.error ? (
        <DataNotAvailable
          icon={<IconNews width={30} height={30} />}
          title="News unavailable right now"
          description="The live news feed couldn't be reached. Try again shortly."
        />
      ) : (
        <div className="panel-card">
          {news.asOf ? <p className="screener-asof">As of {formatDateTime(new Date(news.asOf))}</p> : null}
          <NewsArticleList articles={articles} emptyLabel="No India-specific headlines available right now." />
        </div>
      )}
    </div>
  );
}
