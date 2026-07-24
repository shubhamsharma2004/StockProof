import { useEffect, useState } from "react";
import { fetchShareholding, fetchNseEps } from "../api.js";

// Real NSE-sourced data that Yahoo doesn't carry for Indian stocks —
// shareholding pattern and reported EPS. Fetched once per selected symbol
// (not per tab) since both the Overview snapshot and the dedicated
// Shareholding tab need the same data; the backend itself caches these
// aggressively, so this is a cheap call either way.
export function useNseEnrichment(symbolWithSuffix) {
  const [state, setState] = useState({ loading: false, shareholding: null, eps: null });

  useEffect(() => {
    if (!symbolWithSuffix) {
      setState({ loading: false, shareholding: null, eps: null });
      return;
    }
    let cancelled = false;
    setState({ loading: true, shareholding: null, eps: null });
    Promise.all([fetchShareholding(symbolWithSuffix), fetchNseEps(symbolWithSuffix)]).then(([sh, eps]) => {
      if (cancelled) return;
      setState({
        loading: false,
        shareholding: sh.ok && sh.available ? sh : null,
        eps: eps.ok && eps.available ? eps : null,
      });
    });
    return () => {
      cancelled = true;
    };
  }, [symbolWithSuffix]);

  return state;
}
