import { useCallback, useState } from "react";
import { useSelector } from "react-redux";
import { selectRegion } from "../../ui/index.js";
import { useSearchSecuritiesQuery } from "../../market-data/index.js";
import { useDebouncedValue } from "../../../shared/hooks/useDebouncedValue.js";

const MIN_QUERY_LENGTH = 2;

// Local search-box state (query/open) — deliberately NOT in the store.
// Multiple search boxes can be on screen at once (topbar + Portfolio's own
// picker); each needs its own dropdown, or typing in one pops open both.
// The results themselves come from RTK Query's shared cache.
export function useStockSearch({ onSelect, onManualEntry }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const debounced = useDebouncedValue(query.trim(), 350);
  const tooShort = debounced.length < MIN_QUERY_LENGTH;

  const market = useSelector(selectRegion);
  const { data, isFetching, isError } = useSearchSecuritiesQuery({ text: debounced, market }, { skip: tooShort });

  const onQueryChange = useCallback((q) => {
    setQuery(q);
    setOpen(q.trim().length >= MIN_QUERY_LENGTH);
  }, []);

  const selectSecurity = useCallback(
    (result) => {
      setOpen(false);
      setQuery("");
      onSelect(result);
    },
    [onSelect]
  );

  const enterManualEntry = useCallback(() => {
    setOpen(false);
    const q = query;
    setQuery("");
    onManualEntry(q);
  }, [query, onManualEntry]);

  return {
    query,
    onQueryChange,
    results: tooShort ? [] : data || [],
    searchLoading: query.trim() !== debounced || isFetching,
    searchError: !tooShort && isError,
    searchOpen: open,
    setSearchOpen: setOpen,
    selectSecurity,
    enterManualEntry,
  };
}
