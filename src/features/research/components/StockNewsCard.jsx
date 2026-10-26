import { skipToken } from "@reduxjs/toolkit/query/react";
import { useSelector } from "react-redux";
import { articleId, SentimentBadge, SentimentPanel, useHeadlineSentiment } from "../../sentiment/index.js";
import NewsArticleList from "../../../shared/ui/NewsArticleList.jsx";
import { bareSymbol } from "../../../shared/lib/symbols.js";
import { useGetStockNewsQuery } from "../api/researchApi.js";
import { selectLiveSymbol, selectSecurityMarket, selectSelected } from "../model/selectors.js";

export default function StockNewsCard() {
  const symbol = useSelector(selectLiveSymbol);
  const selected = useSelector(selectSelected);
  const market = useSelector(selectSecurityMarket);
  const { currentData: articles, isFetching, isError } = useGetStockNewsQuery(
    symbol ? { symbol, name: selected?.name || "", market } : skipToken
  );
  const sentiment = useHeadlineSentiment(articles);

  return (
    <section className="panel-card">
      <h2 className="panel-title">News &amp; Sentiment</h2>
      <p className="panel-subtitle">Headlines mentioning {selected?.name || "this company"} from the last two weeks, via Google News.</p>

      {isFetching && !articles ? (
        <p className="panel-subtitle">Loading recent headlines…</p>
      ) : isError ? (
        <p className="panel-subtitle">Headlines are unavailable right now.</p>
      ) : (
        <>
          {articles?.length ? <SentimentPanel sentiment={sentiment} subject={`${bareSymbol(selected?.symbol)} headlines`} /> : null}
          <NewsArticleList
            articles={articles}
            emptyLabel="No recent headlines found for this company."
            renderExtra={(a) => <SentimentBadge result={sentiment.resultsById[articleId(a)]} />}
          />
        </>
      )}
    </section>
  );
}
