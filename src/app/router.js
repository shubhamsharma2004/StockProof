import { userChanged } from "../features/auth/index.js";
import { selectionCleared, selectSelected } from "../features/research/index.js";
import { navigateTo, pathFor, PAGES, regionChanged, routeFromPath, selectPage, selectRegion, selectRouteParams, stockPath } from "../features/ui/index.js";
import { MARKET_KEYS } from "../shared/config/markets.js";
import { pathRequested, securityRequested } from "../shared/model/events.js";
import { listenerMiddleware } from "./listeners.js";

// The address bar mirrors Redux, not the other way round. After every action
// the URL is recomputed from state; a URL arriving from outside (first load,
// back/forward, an in-app <Link>) is turned into the actions that produce
// it. Pages never read window.location themselves.

let started = false;
let historyMode = "push"; // how the next URL change is written: "push" | "replace"
let syncQueued = false;

function pathForState(state) {
  const page = selectPage(state);
  if (page === PAGES.RESEARCH) {
    const selected = selectSelected(state);
    // "MANUAL" is the placeholder for a blank manual entry, not a ticker.
    if (selected && selected.symbol !== "MANUAL") return stockPath(selected);
  }
  return pathFor(page, selectRouteParams(state));
}

// One navigation can take several actions (securityRequested → page switch,
// then openSecurity.pending → new selection), so the URL is written once,
// after they've all run, as a single history entry.
function queueSync(getState) {
  if (syncQueued) return;
  syncQueued = true;
  queueMicrotask(() => {
    syncQueued = false;
    const mode = historyMode;
    historyMode = "push";
    const path = pathForState(getState());
    if (path === window.location.pathname) return;
    if (mode === "replace") window.history.replaceState(null, "", path + window.location.search + window.location.hash);
    else window.history.pushState(null, "", path);
  });
}

const sameSecurity = (a, b) => a && b && a.symbol.toUpperCase() === b.symbol.toUpperCase() && a.exchange === b.exchange;

function applyPath(pathname, { dispatch, getState }) {
  // Unknown paths land on the dashboard (and the URL is corrected to "/").
  const route = routeFromPath(pathname) || { page: PAGES.DASHBOARD, params: {} };

  if (route.security) {
    if (sameSecurity(selectSelected(getState()), route.security)) dispatch(navigateTo(PAGES.RESEARCH));
    else dispatch(securityRequested({ security: route.security }));
  } else {
    if (route.page === PAGES.RESEARCH && selectSelected(getState())) dispatch(selectionCleared());
    // IPO detail pages are NSE issues, shown in India mode.
    if (route.page === PAGES.IPO && route.params.slug && selectRegion(getState()) !== MARKET_KEYS.INDIA) {
      dispatch(regionChanged(MARKET_KEYS.INDIA));
    }
    // Gated like any other navigation: a private page opens the sign-in popup.
    dispatch(navigateTo(route.page, route.params));
  }
  queueSync(getState);
}

// The first auth report is the cue to read the starting URL: private pages
// need to know who's signed in before they can open.
listenerMiddleware.startListening({
  actionCreator: userChanged,
  effect: (_action, api) => {
    if (started) return;
    started = true;
    const store = { dispatch: api.dispatch, getState: api.getState };
    historyMode = "replace";
    applyPath(window.location.pathname, store);
    window.addEventListener("popstate", () => {
      historyMode = "replace";
      applyPath(window.location.pathname, store);
    });
  },
});

listenerMiddleware.startListening({
  actionCreator: pathRequested,
  effect: (action, api) => applyPath(action.payload, api),
});

listenerMiddleware.startListening({
  predicate: (_action, current, previous) => started && current !== previous,
  effect: (_action, api) => queueSync(api.getState),
});
