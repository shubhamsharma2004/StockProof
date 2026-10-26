import { createListenerMiddleware, isAnyOf } from "@reduxjs/toolkit";
import { userChanged } from "../features/auth/index.js";
import { loadHistory } from "../features/history/index.js";
import { loadWatchlist } from "../features/watchlist/index.js";
import { historyEntryLoaded, manualEntryStarted, openSecurity, selectionCleared, selectSelected } from "../features/research/index.js";
import { regionChanged, selectRegion } from "../features/ui/index.js";
import { marketOf } from "../shared/config/markets.js";
import { securityRequested } from "../shared/model/events.js";

// Cross-feature side effects live here, in the app layer, so features
// never import each other just to react to one another's events.
export const listenerMiddleware = createListenerMiddleware();

// Signing in or out swaps which store (Firestore vs. this device) the
// user's data comes from.
listenerMiddleware.startListening({
  actionCreator: userChanged,
  effect: async (_action, api) => {
    api.dispatch(loadWatchlist());
    api.dispatch(loadHistory());
  },
});

// "Open this stock" from any feature → load it into the research workspace.
// (uiSlice handles the page switch for the same event.)
listenerMiddleware.startListening({
  actionCreator: securityRequested,
  effect: async (action, api) => {
    api.dispatch(openSecurity(action.payload.security));
  },
});

// Keep the India/US switch and the research workspace in agreement, so a
// US stock is never shown in rupees (or vice versa):
// 1. Opening a stock from the other market flips the switch to match.
listenerMiddleware.startListening({
  matcher: isAnyOf(openSecurity.pending, historyEntryLoaded, manualEntryStarted),
  effect: async (_action, api) => {
    const selected = selectSelected(api.getState());
    const market = selected ? marketOf(selected) : null;
    if (market && market !== selectRegion(api.getState())) api.dispatch(regionChanged(market));
  },
});

// 2. Flipping the switch closes a stock that belongs to the other market.
listenerMiddleware.startListening({
  actionCreator: regionChanged,
  effect: async (action, api) => {
    const selected = selectSelected(api.getState());
    if (selected && marketOf(selected) !== action.payload) api.dispatch(selectionCleared());
  },
});
