import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { marketDataApi } from "../../market-data/index.js";
import { buildSymbol } from "../../../shared/lib/symbols.js";
import { showToast } from "../../../shared/lib/toast.js";
import { MODES } from "../lib/checklist.js";
import { normalizeManualData } from "../lib/manualFields.js";

const initialState = {
  selected: null, // { symbol, name, exchange }
  dataSource: "none", // none | loading | live | manual
  fetchedData: {},
  fetchedAt: null, // epoch ms
  mode: MODES.STOCK,
  checkedItems: {},
  chartRange: "1y",
  activeTab: "overview",
  requestId: null, // the in-flight openSecurity call; older responses are ignored
};

// Loads a live quote through the shared RTK Query cache, then copies it into
// this slice — the research workspace needs its own editable copy because
// manual entry overwrites individual fields.
export const openSecurity = createAsyncThunk(
  "research/openSecurity",
  async (security, { dispatch, getState, requestId }) => {
    const subscription = dispatch(marketDataApi.endpoints.getQuote.initiate(buildSymbol(security.symbol, security.exchange)));
    try {
      return await subscription.unwrap();
    } catch (err) {
      if (getState().research.requestId === requestId) {
        showToast("Live data unavailable — enter figures manually below.", "warn");
      }
      throw err;
    } finally {
      subscription.unsubscribe();
    }
  }
);

function resetFor(state, security) {
  state.selected = security;
  state.checkedItems = {};
  state.fetchedData = {};
  state.fetchedAt = null;
  state.chartRange = "1y";
  state.activeTab = "overview";
}

const researchSlice = createSlice({
  name: "research",
  initialState,
  reducers: {
    // payload: { text, exchange } — exchange follows the active market.
    manualEntryStarted(state, action) {
      const text = (action.payload?.text || "").trim();
      const exchange = action.payload?.exchange || "NSE";
      resetFor(state, { symbol: text || "MANUAL", name: text || "Manual entry", exchange });
      state.dataSource = "manual";
      state.mode = MODES.STOCK;
      state.requestId = null;
    },
    selectionCleared() {
      return initialState;
    },
    itemToggled(state, action) {
      const { itemId, checked } = action.payload;
      state.checkedItems[itemId] = checked;
    },
    // payload: { values, currency }
    manualFieldsChanged(state, action) {
      Object.assign(state.fetchedData, normalizeManualData(action.payload.values, action.payload.currency));
    },
    historyEntryLoaded(state, action) {
      const entry = action.payload;
      resetFor(state, { symbol: entry.ticker, name: entry.name || entry.ticker, exchange: entry.exchange });
      state.mode = entry.isETF ? MODES.ETF : MODES.STOCK;
      state.fetchedData = entry.fetchedData || {};
      state.checkedItems = entry.checkedItems || {};
      state.dataSource = "manual";
      state.requestId = null;
    },
    chartRangeChanged(state, action) {
      state.chartRange = action.payload;
    },
    tabChanged(state, action) {
      state.activeTab = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(openSecurity.pending, (state, action) => {
        resetFor(state, action.meta.arg);
        state.mode = MODES.STOCK;
        state.dataSource = "loading";
        state.requestId = action.meta.requestId;
      })
      .addCase(openSecurity.fulfilled, (state, action) => {
        if (state.requestId !== action.meta.requestId) return;
        state.dataSource = "live";
        state.fetchedData = action.payload;
        state.fetchedAt = Date.now();
        state.requestId = null;
      })
      .addCase(openSecurity.rejected, (state, action) => {
        if (state.requestId !== action.meta.requestId) return;
        state.dataSource = "manual";
        state.requestId = null;
      });
  },
});

export const { manualEntryStarted, selectionCleared, itemToggled, manualFieldsChanged, chartRangeChanged, tabChanged, historyEntryLoaded } =
  researchSlice.actions;
export default researchSlice.reducer;

export const loadHistoryEntry = (entry) => (dispatch) => {
  dispatch(historyEntryLoaded(entry));
  showToast("Loaded past evaluation — figures shown are the saved snapshot.", "info");
};
