import { useState } from "react";
import NewsArticleList from "../../../shared/ui/NewsArticleList.jsx";
import Tabs from "../../../shared/ui/Tabs.jsx";
import { useGetGlobalNewsQuery, useGetMarketNewsQuery } from "../api/marketsApi.js";
import { WORLD_NEWS_TABS } from "../lib/watchlists.js";

// One tab row over two feeds: Finnhub (top stories, forex, crypto,
// mergers) and Yahoo regions (Europe, Japan, commodities). Each query is
// skipped until its tab is opened.
export default function WorldNews() {
  const [tab, setTab] = useState(WORLD_NEWS_TABS[0].key);
  const source = WORLD_NEWS_TABS.find((t) => t.key === tab)?.source;

  const finnhub = useGetGlobalNewsQuery(tab, { skip: source !== "finnhub" });
  const yahoo = useGetMarketNewsQuery(undefined, { skip: source !== "yahoo" });
  const active = source === "finnhub" ? finnhub : yahoo;
  const articles = source === "finnhub" ? finnhub.currentData : yahoo.data?.categories[tab];

  return (
    <section className="panel-card">
      <h2 className="panel-title">World market news</h2>
      <Tabs tabs={WORLD_NEWS_TABS} activeTab={tab} onChange={setTab} label="News categories" className="screener-tabs" />
      {active.isFetching && !articles ? (
        <p className="panel-subtitle">Loading headlines…</p>
      ) : active.isError ? (
        <p className="panel-subtitle">Headlines are unavailable right now.</p>
      ) : (
        <NewsArticleList articles={articles} emptyLabel="No headlines in this category right now." />
      )}
    </section>
  );
}
