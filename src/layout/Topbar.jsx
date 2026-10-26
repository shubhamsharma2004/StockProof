import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { authModalOpened, selectUser } from "../features/auth/index.js";
import { manualEntryStarted } from "../features/research/index.js";
import { StockSearchBox } from "../features/search/index.js";
import { navOpened, pageChanged, PAGES, RegionSwitch, selectMarket } from "../features/ui/index.js";
import { TOPBAR_SEARCH_ID } from "../shared/config/domIds.js";
import { securityRequested } from "../shared/model/events.js";
import { showToast } from "../shared/lib/toast.js";
import { IconBell, IconMenu } from "../shared/ui/icons.jsx";
import UserMenu from "./UserMenu.jsx";

export default function Topbar() {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const market = useSelector(selectMarket);

  // "/" jumps to search from anywhere that isn't already a text field.
  useEffect(() => {
    const onKey = (e) => {
      const tag = document.activeElement?.tagName;
      if (e.key === "/" && tag !== "INPUT" && tag !== "TEXTAREA") {
        e.preventDefault();
        document.getElementById(TOPBAR_SEARCH_ID)?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <header className="topbar">
      <button type="button" className="icon-btn icon-btn--ghost nav-toggle-btn" aria-label="Open menu" onClick={() => dispatch(navOpened())}>
        <IconMenu className="nav-icon" />
      </button>

      <StockSearchBox
        id={TOPBAR_SEARCH_ID}
        className="topbar-search"
        placeholder={'Press "/" to search for stocks'}
        onSelect={(security) => dispatch(securityRequested({ security }))}
        onManualEntry={(text) => {
          dispatch(manualEntryStarted({ text, exchange: market.defaultExchange }));
          dispatch(pageChanged(PAGES.RESEARCH));
        }}
      />

      <div className="topbar-actions">
        <RegionSwitch />
        <button
          type="button"
          className="icon-btn icon-btn--ghost topbar-bell"
          aria-label="Notifications"
          onClick={() => showToast("Notifications are coming soon.", "info")}
        >
          <IconBell className="nav-icon" />
        </button>
        <span className="topbar-divider" aria-hidden="true" />
        {user ? (
          <UserMenu user={user} />
        ) : (
          <button type="button" className="btn btn-primary btn-sm" onClick={() => dispatch(authModalOpened())}>
            Sign in
          </button>
        )}
      </div>
    </header>
  );
}
