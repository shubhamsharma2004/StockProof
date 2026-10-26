import "./ui.css";

export { default as uiReducer } from "./model/uiSlice.js";
export {
  themeToggled,
  pageChanged,
  regionChanged,
  navOpened,
  navClosed,
  navigateTo,
  selectTheme,
  selectPage,
  selectNavOpen,
  selectRegion,
  selectMarket,
} from "./model/uiSlice.js";
export { PAGES, PUBLIC_PAGES } from "./model/pages.js";
export { usePreferencesSync } from "./hooks/usePreferencesSync.js";
export { default as RegionSwitch } from "./components/RegionSwitch.jsx";
