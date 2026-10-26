import { createAction } from "@reduxjs/toolkit";

// Cross-feature events. A feature that wants "open this stock" (screener,
// watchlist, IPO, dashboard…) dispatches this instead of importing the
// research feature, and the app layer (app/listeners.js) routes it. That
// keeps the dependency arrows pointing one way and features swappable.
//
// payload: { security: { symbol, name, exchange }, navigate?: boolean }
export const securityRequested = createAction("app/securityRequested");
