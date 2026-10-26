import { baseApi } from "../../../shared/api/baseApi.js";
import { normalizeChartPoints, normalizeQuote, normalizeSearchResult } from "../lib/normalizeQuote.js";
import { safeRange } from "../lib/chartRanges.js";

// Generic market data used by many features (research, dashboard,
// watchlist, portfolio, peers). Quotes are cached per suffixed symbol, so
// the same stock shown on the dashboard and the watchlist is fetched once.
export const marketDataApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getQuote: build.query({
      query: (symbolWithSuffix) => ({ url: "stockQuote", params: { symbol: symbolWithSuffix } }),
      transformResponse: normalizeQuote,
      keepUnusedDataFor: 120,
    }),
    getChart: build.query({
      query: ({ symbol, range }) => ({ url: "stockChart", params: { symbol, range: safeRange(range) } }),
      transformResponse: normalizeChartPoints,
    }),
    // { text, market: "IN" | "US" } — results only from that market.
    searchSecurities: build.query({
      query: ({ text, market }) => ({ url: "stockSearch", params: { q: text, market } }),
      transformResponse: (payload) => (payload?.results || []).map(normalizeSearchResult).filter((r) => r.symbol),
      keepUnusedDataFor: 60,
    }),
  }),
});

export const { useGetQuoteQuery, useGetChartQuery, useSearchSecuritiesQuery } = marketDataApi;
