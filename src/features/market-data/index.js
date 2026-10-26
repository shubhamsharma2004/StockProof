// Public API of the market-data feature — other features import from here,
// never from its internal folders.
export { marketDataApi, useGetQuoteQuery, useGetChartQuery, useSearchSecuritiesQuery } from "./api/marketDataApi.js";
export { useQuotes } from "./hooks/useQuotes.js";
export { normalizeQuote, derivePbRatio } from "./lib/normalizeQuote.js";
export { CHART_RANGES, tickFormatterFor } from "./lib/chartRanges.js";
