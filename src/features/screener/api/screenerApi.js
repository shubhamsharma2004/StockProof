import { baseApi } from "../../../shared/api/baseApi.js";

export const screenerApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // market: "IN" (NSE pool) | "US" (US large caps).
    getScreener: build.query({
      query: (market) => ({ url: "screener", params: { market } }),
      transformResponse: (payload) => ({
        asOf: payload?.asOf || null,
        market: payload?.market || "IN",
        currency: payload?.currency || "INR",
        poolSize: payload?.poolSize ?? null,
        gainers: Array.isArray(payload?.gainers) ? payload.gainers : [],
        losers: Array.isArray(payload?.losers) ? payload.losers : [],
        mostActive: Array.isArray(payload?.mostActive) ? payload.mostActive : [],
      }),
    }),
  }),
});

export const { useGetScreenerQuery } = screenerApi;
