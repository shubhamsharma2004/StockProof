import { useEffect, useState } from "react";
import { fetchMarketNews } from "../api.js";

export function useMarketNews() {
  const [state, setState] = useState({ loading: true, error: null, asOf: null, categories: {} });

  useEffect(() => {
    let cancelled = false;
    fetchMarketNews().then((res) => {
      if (cancelled) return;
      if (res.ok) setState({ loading: false, error: null, asOf: res.asOf, categories: res.categories });
      else setState({ loading: false, error: res.error, asOf: null, categories: {} });
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
