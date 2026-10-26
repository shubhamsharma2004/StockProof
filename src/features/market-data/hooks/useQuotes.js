import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createSelector } from "@reduxjs/toolkit";
import { marketDataApi } from "../api/marketDataApi.js";

// Subscribes to a variable-length list of quotes at once — hooks can't be
// called in a loop, so this drives RTK Query's endpoint directly and reads
// each symbol's cache entry back out. Shares the cache with every
// useGetQuoteQuery() call, so nothing is fetched twice.
export function useQuotes(symbols) {
  const dispatch = useDispatch();
  const key = symbols.join("|");

  useEffect(() => {
    const subscriptions = symbols.map((s) => dispatch(marketDataApi.endpoints.getQuote.initiate(s)));
    return () => subscriptions.forEach((sub) => sub.unsubscribe());
    // `key` stands in for `symbols`, whose array identity changes every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, key]);

  const selectQuotes = useMemo(
    () =>
      createSelector(
        symbols.map((s) => marketDataApi.endpoints.getQuote.select(s)),
        (...results) =>
          Object.fromEntries(
            symbols.map((s, i) => [
              s,
              {
                data: results[i].data,
                // "uninitialized" counts as loading: the subscription effect
                // hasn't dispatched yet on the very first render.
                isLoading: results[i].isLoading || results[i].isUninitialized,
                isError: results[i].isError,
              },
            ])
          )
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [key]
  );

  return useSelector(selectQuotes);
}
