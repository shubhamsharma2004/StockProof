import { useEffect, useState } from "react";
import { fetchIpoData } from "../api.js";

export function useIpoData() {
  const [state, setState] = useState({ loading: true, error: null, asOf: null, openNow: [], upcoming: [], recentlyListed: [] });

  useEffect(() => {
    let cancelled = false;
    fetchIpoData().then((res) => {
      if (cancelled) return;
      if (res.ok) {
        setState({ loading: false, error: null, asOf: res.asOf, openNow: res.openNow, upcoming: res.upcoming, recentlyListed: res.recentlyListed });
      } else {
        setState({ loading: false, error: res.error, asOf: null, openNow: [], upcoming: [], recentlyListed: [] });
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
