import { useMemo } from "react";
import { useSelector } from "react-redux";
import { useQuotes } from "../../market-data/index.js";
import { selectRegion } from "../../ui/index.js";
import { MARKETS, marketOf } from "../../../shared/config/markets.js";
import { moneyFor } from "../../../shared/lib/money.js";
import { buildSymbol } from "../../../shared/lib/symbols.js";
import { selectWatchlistItems } from "../model/watchlistSlice.js";

// Watchlist entries for the active market (India or US) joined with their
// live quotes and currency formatters:
// [{ item, quote, loading, failed, money }]
export function useWatchlistQuotes() {
  const allItems = useSelector(selectWatchlistItems);
  const region = useSelector(selectRegion);
  const items = useMemo(() => allItems.filter((i) => marketOf(i) === region), [allItems, region]);
  const symbols = useMemo(() => items.map((i) => buildSymbol(i.symbol, i.exchange)), [items]);
  const quotes = useQuotes(symbols);
  const money = moneyFor(MARKETS[region].currency);

  return items.map((item, i) => {
    const q = quotes[symbols[i]];
    return { item, quote: q?.data, loading: Boolean(q?.isLoading), failed: Boolean(q?.isError), money };
  });
}
