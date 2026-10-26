import { baseApi } from "../../../shared/api/baseApi.js";
import { normalizeQuote } from "../../market-data/index.js";

export const ipoApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // Complete lists from NSE's feed: open | upcoming | closed | listed.
    getIpos: build.query({
      query: (status) => ({ url: "ipos", params: { status } }),
    }),
    // ipoalerts: company profile (about, strengths, risks, lot size, timeline).
    getIpoProfile: build.query({
      query: (symbol) => ({ url: "ipoProfile", params: { symbol } }),
      keepUnusedDataFor: 3600,
    }),
    // ipoalerts: daily grey-market premium for the last 30 days.
    getIpoGmp: build.query({
      query: (symbol) => ({ url: "ipoGmp", params: { symbol } }),
      keepUnusedDataFor: 1800,
    }),
    // US IPO calendar (Finnhub) for the US side of the page.
    getUsIpoCalendar: build.query({
      query: () => "usIpoCalendar",
      transformResponse: (payload) => payload?.ipos || [],
    }),
    // A just-listed issue may trade on NSE or only on BSE (common for SME),
    // so this tries NSE first and BSE as a fallback. No quote on either is
    // an error — the card then says "Not available" rather than guess.
    getListedQuote: build.query({
      async queryFn(bareSymbol, _api, _extra, fetchWithBQ) {
        for (const [suffix, exchange] of [
          [".NS", "NSE"],
          [".BO", "BSE"],
        ]) {
          const res = await fetchWithBQ({ url: "stockQuote", params: { symbol: `${bareSymbol}${suffix}` } });
          if (!res.error) return { data: { exchange, quote: normalizeQuote(res.data) } };
        }
        return { error: { status: "NOT_FOUND", error: "No live quote on NSE or BSE" } };
      },
    }),
  }),
});

export const { useGetIposQuery, useGetIpoProfileQuery, useGetIpoGmpQuery, useGetListedQuoteQuery, useGetUsIpoCalendarQuery } = ipoApi;
