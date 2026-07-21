import { useCallback, useState } from "react";
import { buildSymbol, fetchStock, fetchStockChart, normalizeManualData } from "../api.js";
import { showToast } from "../utils.js";

export function useStockData() {
  const [selected, setSelected] = useState(null);
  const [dataSource, setDataSource] = useState("none"); // none | loading | live | manual
  const [fetchedData, setFetchedData] = useState({});
  const [fetchedAt, setFetchedAt] = useState(null);
  const [mode, setMode] = useState("stock");
  const [checkedItems, setCheckedItems] = useState({});

  const [chart, setChart] = useState({ loading: false, error: null, points: [], range: "1y" });

  const loadChart = useCallback(async (symbolWithSuffix, range) => {
    setChart((c) => ({ ...c, loading: true, error: null, range }));
    const res = await fetchStockChart(symbolWithSuffix, range);
    if (res.ok) {
      setChart({ loading: false, error: null, points: res.points, range: res.range });
    } else {
      setChart({ loading: false, error: res.error, points: [], range });
    }
  }, []);

  const selectSecurity = useCallback(
    async (result, { forceManual = false } = {}) => {
      setSelected(result);
      setCheckedItems({});
      setChart({ loading: false, error: null, points: [], range: "1y" });

      if (forceManual) {
        setDataSource("manual");
        setFetchedData({});
        setFetchedAt(null);
        return;
      }

      setDataSource("loading");
      setFetchedData({});
      const symbol = buildSymbol(result.symbol, result.exchange);
      const res = await fetchStock(symbol);
      if (res.ok) {
        setDataSource("live");
        setFetchedData(res.data);
        setFetchedAt(new Date());
        loadChart(symbol, "1y");
      } else {
        setDataSource("manual");
        setFetchedData({});
        setFetchedAt(null);
        showToast("Live data unavailable — enter figures manually below.", "warn");
      }
    },
    [loadChart]
  );

  const changeChartRange = useCallback(
    (range) => {
      if (!selected) return;
      const symbol = buildSymbol(selected.symbol, selected.exchange);
      loadChart(symbol, range);
    },
    [selected, loadChart]
  );

  const enterManualEntry = useCallback(
    (rawQuery) => {
      selectSecurity(
        { symbol: rawQuery.trim() || "MANUAL", name: rawQuery.trim() || "Manual entry", exchange: "NSE" },
        { forceManual: true }
      );
    },
    [selectSecurity]
  );

  const setManualField = useCallback((raw) => {
    setFetchedData((prev) => ({ ...prev, ...normalizeManualData(raw) }));
  }, []);

  const clearSelection = useCallback(() => {
    setSelected(null);
    setDataSource("none");
    setFetchedData({});
    setFetchedAt(null);
    setCheckedItems({});
  }, []);

  const toggleItem = useCallback((itemId, checked) => {
    setCheckedItems((prev) => ({ ...prev, [itemId]: checked }));
  }, []);

  const loadFromHistoryEntry = useCallback((entry) => {
    setSelected({ symbol: entry.ticker, name: entry.name || entry.ticker, exchange: entry.exchange });
    setMode(entry.isETF ? "etf" : "stock");
    setFetchedData(entry.fetchedData || {});
    setFetchedAt(null);
    setCheckedItems(entry.checkedItems || {});
    setDataSource("manual");
    setChart({ loading: false, error: null, points: [], range: "1y" });
    showToast("Loaded past evaluation — figures shown are the saved snapshot.", "info");
  }, []);

  return {
    selected,
    dataSource,
    fetchedData,
    fetchedAt,
    mode,
    setMode,
    checkedItems,
    toggleItem,
    selectSecurity,
    enterManualEntry,
    setManualField,
    clearSelection,
    loadFromHistoryEntry,
    chart,
    changeChartRange,
  };
}
