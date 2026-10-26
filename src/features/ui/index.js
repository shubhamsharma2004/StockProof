import "./ui.css";

export { default as uiReducer } from "./model/uiSlice.js";
export {
  themeToggled,
  pageChanged,
  routeChanged,
  regionChanged,
  navOpened,
  navClosed,
  navigateTo,
  selectTheme,
  selectPage,
  selectRouteParams,
  selectNavOpen,
  selectRegion,
  selectMarket,
} from "./model/uiSlice.js";
export { PAGES, PUBLIC_PAGES } from "./model/pages.js";
export { pathFor, pathForPage, stockPath, ipoSlug, ipoPath, termSlug, termPath, routeFromPath } from "./lib/routes.js";
export { PAGE_META, stockMeta, ipoMeta, termMeta } from "./lib/pageMeta.js";
export { usePageMeta } from "./hooks/usePageMeta.js";
export { usePreferencesSync } from "./hooks/usePreferencesSync.js";
export { default as RegionSwitch } from "./components/RegionSwitch.jsx";
