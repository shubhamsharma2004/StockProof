import { createSlice } from "@reduxjs/toolkit";
import { authModalOpened, selectUser } from "../../auth/index.js";
import { securityRequested } from "../../../shared/model/events.js";
import { MARKET_KEYS, MARKETS } from "../../../shared/config/markets.js";
import { PAGES, PUBLIC_PAGES } from "./pages.js";

export const THEME_STORAGE_KEY = "stockproof.theme";
export const REGION_STORAGE_KEY = "stockproof.region";

// The market the whole app shows — India or the US (see shared/config/markets.js).
function readInitialRegion() {
  try {
    return localStorage.getItem(REGION_STORAGE_KEY) === MARKET_KEYS.US ? MARKET_KEYS.US : MARKET_KEYS.INDIA;
  } catch {
    return MARKET_KEYS.INDIA;
  }
}

function readInitialTheme() {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === "dark" || stored === "light") return stored;
  } catch {
    // Storage blocked — fall through to the OS preference.
  }
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

const uiSlice = createSlice({
  name: "ui",
  initialState: () => ({
    theme: readInitialTheme(),
    page: PAGES.DASHBOARD,
    navOpen: false, // mobile drawer
    region: readInitialRegion(),
  }),
  reducers: {
    themeToggled(state) {
      state.theme = state.theme === "dark" ? "light" : "dark";
    },
    pageChanged(state, action) {
      state.page = action.payload;
      state.navOpen = false;
    },
    regionChanged(state, action) {
      state.region = action.payload === MARKET_KEYS.US ? MARKET_KEYS.US : MARKET_KEYS.INDIA;
    },
    navOpened(state) {
      state.navOpen = true;
    },
    navClosed(state) {
      state.navOpen = false;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(securityRequested, (state, action) => {
      if (action.payload.navigate !== false) state.page = PAGES.RESEARCH;
    });
  },
});

export const { themeToggled, pageChanged, regionChanged, navOpened, navClosed } = uiSlice.actions;
export default uiSlice.reducer;

// Gated navigation: a signed-out click on a private page opens the
// sign-in popup instead of navigating.
export const navigateTo = (page) => (dispatch, getState) => {
  if (!PUBLIC_PAGES.has(page) && !selectUser(getState())) {
    dispatch(navClosed());
    dispatch(authModalOpened());
    return;
  }
  dispatch(pageChanged(page));
};

export const selectTheme = (state) => state.ui.theme;
export const selectPage = (state) => state.ui.page;
export const selectNavOpen = (state) => state.ui.navOpen;
export const selectRegion = (state) => state.ui.region;
export const selectMarket = (state) => MARKETS[state.ui.region];
