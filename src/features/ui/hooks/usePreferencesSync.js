import { useEffect } from "react";
import { useSelector } from "react-redux";
import { REGION_STORAGE_KEY, selectRegion, selectTheme, THEME_STORAGE_KEY } from "../model/uiSlice.js";

function persist(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Non-fatal: the preference just won't survive a reload.
  }
}

// Mirrors the theme onto <html data-theme> and persists the user's
// preferences (theme, India/Global region) across visits.
export function usePreferencesSync() {
  const theme = useSelector(selectTheme);
  const region = useSelector(selectRegion);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    persist(THEME_STORAGE_KEY, theme);
  }, [theme]);

  useEffect(() => {
    persist(REGION_STORAGE_KEY, region);
  }, [region]);
}
