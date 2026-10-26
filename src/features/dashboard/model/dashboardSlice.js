import { createSelector, createSlice } from "@reduxjs/toolkit";
import { selectRegion } from "../../ui/index.js";
import { selectWatchlistItems } from "../../watchlist/index.js";
import { MARKETS, marketOf } from "../../../shared/config/markets.js";

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState: {
    // The stock the big chart shows, remembered separately per market.
    featured: { IN: null, US: null },
    range: "5d",
  },
  reducers: {
    featuredChanged(state, action) {
      state.featured[marketOf(action.payload)] = action.payload;
    },
    rangeChanged(state, action) {
      state.range = action.payload;
    },
  },
});

export const { featuredChanged, rangeChanged } = dashboardSlice.actions;
export default dashboardSlice.reducer;

export const selectDashboardRange = (state) => state.dashboard.range;

// The big chart shows what the user last picked in this market, else the
// top of their watchlist for this market, else a well-known large cap —
// it's never empty.
export const selectFeatured = createSelector(
  [(state) => state.dashboard.featured, selectWatchlistItems, selectRegion],
  (featured, watchlist, region) =>
    featured[region] || watchlist.find((item) => marketOf(item) === region) || MARKETS[region].defaultFeatured
);
