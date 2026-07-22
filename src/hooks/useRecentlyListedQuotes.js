import { useEffect, useState } from "react";
import { fetchStock } from "../api.js";
import { computeCategoryScores, computeOverallRecommendation } from "../insights.js";

// For each recently-listed IPO, tries a real live quote (NSE first, BSE as
// fallback — the NSE IPO feed doesn't say which exchange a small/SME issue
// ended up on) and, only when that succeeds, runs it through the exact same
// scoring engine the rest of the app uses. Entries where no live quote can
// be found are left with fetched:false rather than guessed at.
export function useRecentlyListedQuotes(recentlyListed) {
  const [bySymbol, setBySymbol] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!recentlyListed.length) return;
    let cancelled = false;
    setLoading(true);

    Promise.all(
      recentlyListed.map(async (ipo) => {
        let res = await fetchStock(`${ipo.symbol}.NS`);
        let exchange = "NSE";
        if (!res.ok) {
          res = await fetchStock(`${ipo.symbol}.BO`);
          exchange = "BSE";
        }
        if (!res.ok) return [ipo.symbol, { fetched: false }];

        const fd = res.data;
        const categories = computeCategoryScores(fd);
        const overall = computeOverallRecommendation(categories);
        const gainPercent =
          ipo.issuePrice && fd.last_price != null ? ((fd.last_price - ipo.issuePrice) / ipo.issuePrice) * 100 : null;

        return [ipo.symbol, { fetched: true, exchange, fetchedData: fd, categories, overall, gainPercent }];
      })
    ).then((entries) => {
      if (cancelled) return;
      setBySymbol(Object.fromEntries(entries));
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [recentlyListed]);

  return { bySymbol, loading };
}
