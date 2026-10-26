import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { navigateTo, navClosed, PAGES, selectNavOpen, selectPage, selectTheme, themeToggled } from "../features/ui/index.js";
import { WatchlistPulseCard } from "../features/watchlist/index.js";
import { IconBook, IconChevronDown, IconFeedback, IconMoon, IconSun } from "../shared/ui/icons.jsx";
import { FEEDBACK_URL, PRIMARY_NAV } from "./navConfig.js";
import BrandLogo from "../shared/ui/BrandLogo.jsx";

export default function Sidebar() {
  const dispatch = useDispatch();
  const page = useSelector(selectPage);
  const navOpen = useSelector(selectNavOpen);
  const theme = useSelector(selectTheme);
  const go = (key) => dispatch(navigateTo(key));

  return (
    <nav className={`sidebar ${navOpen ? "is-open" : ""}`} aria-label="Primary">
      <div className="sidebar-inner">
        <a
          href="/"
          className="sidebar-brand"
          aria-label="Stockproof home"
          onClick={(e) => {
            e.preventDefault();
            go(PAGES.DASHBOARD);
          }}
        >
          <BrandLogo size={36} />
        </a>

        <WatchlistPulseCard />

        <ul className="sidebar-nav">
          {PRIMARY_NAV.map((item) =>
            item.children ? (
              <NavGroup key={item.key} item={item} page={page} onNavigate={go} />
            ) : (
              <li key={item.key}>
                <NavButton item={item} active={page === item.key} onClick={() => go(item.key)} />
              </li>
            )
          )}
        </ul>

        <ul className="sidebar-nav sidebar-nav--secondary">
          <li>
            <NavButton item={{ label: "Guide", Icon: IconBook }} active={page === PAGES.GUIDE} onClick={() => go(PAGES.GUIDE)} />
          </li>
          <li>
            <NavButton
              item={{ label: "Feedback", Icon: IconFeedback }}
              onClick={() => {
                dispatch(navClosed());
                window.open(FEEDBACK_URL, "_blank", "noopener,noreferrer");
              }}
            />
          </li>
          <li>
            <button
              type="button"
              className="sidebar-item"
              role="switch"
              aria-checked={theme === "dark"}
              onClick={() => dispatch(themeToggled())}
            >
              {theme === "dark" ? <IconSun className="nav-icon" /> : <IconMoon className="nav-icon" />}
              <span>Dark mode</span>
              <span className={`switch ${theme === "dark" ? "is-on" : ""}`} aria-hidden="true" />
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
}

function NavButton({ item, active = false, onClick }) {
  const { Icon, label } = item;
  return (
    <button
      type="button"
      className={`sidebar-item ${active ? "is-active" : ""}`}
      aria-current={active ? "page" : undefined}
      onClick={onClick}
    >
      <Icon className="nav-icon" />
      <span>{label}</span>
    </button>
  );
}

function NavGroup({ item, page, onNavigate }) {
  const containsActive = item.children.some((c) => c.key === page);
  const [open, setOpen] = useState(true);
  const { Icon } = item;
  const listId = `nav-group-${item.key}`;

  return (
    <li>
      <button
        type="button"
        className={`sidebar-item sidebar-group-toggle ${containsActive && !open ? "is-active" : ""}`}
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((o) => !o)}
      >
        <Icon className="nav-icon" />
        <span>{item.label}</span>
        <IconChevronDown className={`sidebar-group-chevron ${open ? "is-open" : ""}`} width={16} height={16} />
      </button>
      {open ? (
        <ul className="sidebar-subnav" id={listId}>
          {item.children.map((child) => (
            <li key={child.key}>
              <button
                type="button"
                className={`sidebar-subitem ${page === child.key ? "is-active" : ""}`}
                aria-current={page === child.key ? "page" : undefined}
                onClick={() => onNavigate(child.key)}
              >
                {child.label}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </li>
  );
}
