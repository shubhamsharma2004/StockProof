import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Every market-data call goes through a small proxy (server/) that fetches
// live data from Yahoo Finance and NSE. Those sites send no CORS headers, so
// a browser can't call them directly. By default the proxy is served by the
// Vite dev/preview server on the same origin at /api; set VITE_API_BASE_URL
// to point at a separately hosted copy instead.
export const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";
const FETCH_TIMEOUT_MS = 8000;

// One RTK Query API slice for the whole app. Each feature injects its own
// endpoints (see features/*/api) rather than all of them living here, so a
// feature's server contract stays next to the code that uses it.
export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({ baseUrl: API_BASE, timeout: FETCH_TIMEOUT_MS }),
  keepUnusedDataFor: 300,
  endpoints: () => ({}),
});

export function errorMessage(error, fallback) {
  return error?.data?.error || error?.error || fallback;
}
