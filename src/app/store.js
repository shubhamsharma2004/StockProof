import { configureStore } from "@reduxjs/toolkit";
import { baseApi } from "../shared/api/baseApi.js";
import { authReducer } from "../features/auth/index.js";
import { uiReducer } from "../features/ui/index.js";
import { researchReducer } from "../features/research/index.js";
import { historyReducer } from "../features/history/index.js";
import { watchlistReducer } from "../features/watchlist/index.js";
import { dashboardReducer } from "../features/dashboard/index.js";
import { sentimentReducer } from "../features/sentiment/index.js";
import { listenerMiddleware } from "./listeners.js";
// Registers the URL ⇄ state listeners on the same middleware.
import "./router.js";

// Client state lives in feature slices; server data lives in RTK Query's
// cache under `api`.
export const store = configureStore({
  reducer: {
    [baseApi.reducerPath]: baseApi.reducer,
    auth: authReducer,
    ui: uiReducer,
    research: researchReducer,
    history: historyReducer,
    watchlist: watchlistReducer,
    dashboard: dashboardReducer,
    sentiment: sentimentReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().prepend(listenerMiddleware.middleware).concat(baseApi.middleware),
});
