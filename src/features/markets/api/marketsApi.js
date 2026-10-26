import { baseApi } from "../../../shared/api/baseApi.js";

export const marketsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // Yahoo Finance headlines by region: india, us, europe, japan, commodities.
    getMarketNews: build.query({
      query: () => "marketNews",
      transformResponse: (payload) => ({ asOf: payload?.asOf || null, categories: payload?.categories || {} }),
    }),
    // Finnhub (via the server proxy, which holds the key) — US focused.
    getUsMarketStatus: build.query({
      query: () => "usMarketStatus",
      keepUnusedDataFor: 60,
    }),
    getUsQuotes: build.query({
      query: (symbols) => ({ url: "usQuotes", params: { symbols: symbols.join(",") } }),
      transformResponse: (payload) => payload?.quotes || [],
      keepUnusedDataFor: 60,
    }),
    getGlobalNews: build.query({
      query: (category) => ({ url: "globalNews", params: { category } }),
      transformResponse: (payload) => payload?.articles || [],
    }),
  }),
});

export const {
  useGetMarketNewsQuery,
  useGetUsMarketStatusQuery,
  useGetUsQuotesQuery,
  useGetGlobalNewsQuery,
} = marketsApi;
