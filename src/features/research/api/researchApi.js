import { baseApi } from "../../../shared/api/baseApi.js";
import { bareSymbol } from "../../../shared/lib/symbols.js";

// Real NSE-sourced data that Yahoo doesn't carry for Indian stocks —
// shareholding pattern and reported EPS. Both endpoints are keyed by NSE's
// own regulatory-filing symbol and answer { available: false } rather than
// erroring when a company simply isn't in the feed; that's mapped to null.
export const researchApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getShareholding: build.query({
      query: (symbolWithSuffix) => ({ url: "shareholding", params: { symbol: bareSymbol(symbolWithSuffix) } }),
      transformResponse: (payload) =>
        payload?.available
          ? {
              promoterPct: typeof payload.promoter_pct === "number" ? payload.promoter_pct : null,
              publicPct: typeof payload.public_pct === "number" ? payload.public_pct : null,
              quarterEnd: payload.quarter_end || null,
              history: Array.isArray(payload.history) ? payload.history : [],
            }
          : null,
    }),
    getNseEps: build.query({
      query: (symbolWithSuffix) => ({ url: "nseEps", params: { symbol: bareSymbol(symbolWithSuffix) } }),
      transformResponse: (payload) =>
        payload?.available
          ? {
              eps: typeof payload.eps === "number" ? payload.eps : null,
              basis: payload.basis === "ttm" ? "ttm" : "quarterly",
              periodEnd: payload.periodEnd || null,
              stale: !!payload.stale,
            }
          : null,
    }),
    // Recent company headlines (Google News, last 14 days), in the edition
    // for the stock's market.
    getStockNews: build.query({
      query: ({ symbol, name, market }) => ({ url: "stockNews", params: { symbol: bareSymbol(symbol), name, market } }),
      transformResponse: (payload) => (Array.isArray(payload?.articles) ? payload.articles : []),
    }),
    // Same-industry US peers (Finnhub).
    getUsPeers: build.query({
      query: (symbol) => ({ url: "usPeers", params: { symbol } }),
      transformResponse: (payload) => payload?.peers || [],
      keepUnusedDataFor: 3600,
    }),
  }),
});

export const { useGetShareholdingQuery, useGetNseEpsQuery, useGetStockNewsQuery, useGetUsPeersQuery } = researchApi;
