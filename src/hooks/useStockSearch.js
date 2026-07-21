import { useCallback, useRef, useState } from "react";
import { searchSecurities } from "../api.js";

function useDebouncedCallback(fn, delayMs) {
  const timerRef = useRef(null);
  return useCallback(
    (...args) => {
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => fn(...args), delayMs);
    },
    [fn, delayMs]
  );
}

// Local search-box state (query/results/open) — deliberately NOT shared
// globally. Multiple search boxes can be on screen at once (topbar +
// Portfolio's own picker); each needs its own independent dropdown, or
// typing in one pops open both.
export function useStockSearch({ onSelect, onManualEntry }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false);

  const runSearch = useCallback(async (q) => {
    const res = await searchSecurities(q);
    setLoading(false);
    if (res.ok) {
      setResults(res.results);
      setError(null);
    } else {
      setResults([]);
      setError(res.error);
    }
  }, []);
  const debouncedSearch = useDebouncedCallback(runSearch, 350);

  const onQueryChange = useCallback(
    (q) => {
      setQuery(q);
      if (q.trim().length < 2) {
        setResults([]);
        setError(null);
        setOpen(false);
        return;
      }
      setOpen(true);
      setLoading(true);
      debouncedSearch(q);
    },
    [debouncedSearch]
  );

  const selectSecurity = useCallback(
    (result) => {
      setOpen(false);
      setResults([]);
      setQuery("");
      onSelect(result);
    },
    [onSelect]
  );

  const enterManualEntry = useCallback(() => {
    setOpen(false);
    setResults([]);
    const q = query;
    setQuery("");
    onManualEntry(q);
  }, [query, onManualEntry]);

  return {
    query,
    onQueryChange,
    results,
    searchLoading: loading,
    searchError: error,
    searchOpen: open,
    setSearchOpen: setOpen,
    selectSecurity,
    enterManualEntry,
  };
}
