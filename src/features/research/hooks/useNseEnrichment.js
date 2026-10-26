import { skipToken } from "@reduxjs/toolkit/query/react";
import { useSelector } from "react-redux";
import { useGetNseEpsQuery, useGetShareholdingQuery } from "../api/researchApi.js";
import { selectNseSymbol } from "../model/selectors.js";

// Shareholding + reported EPS for the stock currently open in research.
// Both the Overview snapshot and the Shareholding tab call this; RTK Query
// dedupes, so the network sees one request per symbol either way.
export function useNseEnrichment() {
  const symbol = useSelector(selectNseSymbol);
  const shareholding = useGetShareholdingQuery(symbol ?? skipToken);
  const eps = useGetNseEpsQuery(symbol ?? skipToken);

  // `currentData`, not `data`: while a new symbol loads, `data` still holds
  // the previous stock's figures.
  return {
    loading: shareholding.isFetching || eps.isFetching,
    shareholding: shareholding.currentData ?? null,
    eps: eps.currentData ?? null,
  };
}
